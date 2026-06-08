import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
} from "../../../lib/socket";
import {
  setConnected,
  setReconnecting,
  setError,
  setTyping,
  setCopilotTyping,
  setEscalating,
  addTicketAssignment,
  setAgentJoined,
  resetSocket,
} from "../state/socket.slice";
import { addMessage } from "../../message/state/message.slice";
import { updateChatInList } from "../../chat/state/chat.slice";
import {
  upsertTicket,
  removeTicketFromList,
  setStats as setTicketStats,
  setVolume,
  setCsat,
} from "../../ticket/state/ticket.slice";
import {
  upsertUser,
  removeUserFromList,
  setStats as setUserStats,
} from "../../user/state/user.slice";
import {
  upsertAgent,
  removeAgentFromList,
  setStats as setAgentStats,
} from "../../agent/state/agent.slice";
import {
  getTicketStats,
  getTicketVolume,
  getTicketCsat,
} from "../../ticket/services/ticket.api";
import { getUserStats } from "../../user/services/user.api";
import { getAgentStats } from "../../agent/services/agent.api";

export const useSocket = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const role = useSelector((s) => s.auth.role);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const userWorkspaceId = useSelector((s) => s.auth.user?.workspaceId);
  const workspaceId = activeWorkspaceId || userWorkspaceId;

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      dispatch(resetSocket());
      return;
    }

    const socket = connectSocket();
    const isStaff = role === "admin" || role === "agent";

    // Only customers/other workspaces' events should be ignored for scoped lists.
    const inScope = (payload) =>
      !workspaceId || !payload?.workspaceId || payload.workspaceId === workspaceId;

    // Debounced refresh of the small stats payloads after a live mutation, so
    // KPIs / metric strips stay exact without a full reload.
    let statsTimer = null;
    const refreshStats = () => {
      if (!isStaff) return;
      if (statsTimer) clearTimeout(statsTimer);
      statsTimer = setTimeout(() => {
        getTicketStats().then((r) => dispatch(setTicketStats(r.data))).catch(() => {});
        getTicketVolume({ days: 14 }).then((r) => dispatch(setVolume(r.data))).catch(() => {});
        getTicketCsat().then((r) => dispatch(setCsat(r.data))).catch(() => {});
        getUserStats().then((r) => dispatch(setUserStats(r.data))).catch(() => {});
        getAgentStats().then((r) => dispatch(setAgentStats(r.data))).catch(() => {});
      }, 500);
    };

    socket.on("connect", () => dispatch(setConnected(true)));
    socket.on("disconnect", () => dispatch(setConnected(false)));
    socket.on("reconnect_attempt", () => dispatch(setReconnecting(true)));
    socket.on("connect_error", (err) =>
      dispatch(setError(err?.message || "socket error"))
    );

    // ── Chat realtime ──────────────────────────────────────────────────────
    socket.on("message:new", (payload) => {
      if (payload?.message) dispatch(addMessage(payload.message));
      if (payload?.chat) dispatch(updateChatInList(payload.chat));
    });
    socket.on("chat:typing", (payload) => dispatch(setTyping(payload)));
    socket.on("copilot:typing", (payload) => dispatch(setCopilotTyping(payload)));
    socket.on("copilot:escalating", (payload) =>
      dispatch(setEscalating({ chatId: payload.chatId, escalating: true }))
    );
    socket.on("ticket:assigned", (payload) => dispatch(addTicketAssignment(payload)));
    socket.on("agent:joined", (payload) => dispatch(setAgentJoined(payload)));

    // ── Domain realtime (dashboards + lists) ────────────────────────────────
    socket.on("ticket:created", (ticket) => {
      dispatch(upsertTicket(ticket));
      refreshStats();
    });
    socket.on("ticket:updated", (ticket) => {
      dispatch(upsertTicket(ticket));
      refreshStats();
    });
    socket.on("ticket:deleted", (payload) => {
      dispatch(removeTicketFromList(payload?._id));
      refreshStats();
    });

    socket.on("customer:created", (customer) => {
      if (inScope(customer)) dispatch(upsertUser(customer));
      refreshStats();
    });
    socket.on("customer:deleted", (payload) => {
      dispatch(removeUserFromList(payload?._id));
      refreshStats();
    });

    socket.on("agent:created", (agent) => {
      if (inScope(agent)) dispatch(upsertAgent(agent));
      refreshStats();
    });
    socket.on("agent:updated", (agent) => {
      if (inScope(agent)) dispatch(upsertAgent(agent));
      refreshStats();
    });
    socket.on("agent:deleted", (payload) => {
      dispatch(removeAgentFromList(payload?._id));
      refreshStats();
    });

    return () => {
      if (statsTimer) clearTimeout(statsTimer);
      const s = getSocket();
      if (s) {
        s.off("connect");
        s.off("disconnect");
        s.off("reconnect_attempt");
        s.off("connect_error");
        s.off("message:new");
        s.off("chat:typing");
        s.off("copilot:typing");
        s.off("copilot:escalating");
        s.off("ticket:assigned");
        s.off("agent:joined");
        s.off("ticket:created");
        s.off("ticket:updated");
        s.off("ticket:deleted");
        s.off("customer:created");
        s.off("customer:deleted");
        s.off("agent:created");
        s.off("agent:updated");
        s.off("agent:deleted");
      }
    };
  }, [dispatch, isAuthenticated, role, workspaceId]);
};
