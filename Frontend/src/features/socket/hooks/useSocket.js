import { useEffect, useRef } from "react";
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
import {
  updateChatInList,
  setChatCustomers,
} from "../../chat/state/chat.slice";
import { getChatCustomers } from "../../chat/services/chat.api";
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

  // The thread currently on screen, read through a ref so the listeners below
  // stay registered once instead of being torn down on every chat switch.
  const openChatId = useSelector((s) => s.chat.currentChat?._id);
  const openChatRef = useRef(openChatId);
  useEffect(() => {
    openChatRef.current = openChatId;
  }, [openChatId]);

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
        // The chat page's customer column carries per-customer ticket counts, so
        // it goes stale on any ticket mutation unless it is refetched here.
        getChatCustomers({}).then((r) => dispatch(setChatCustomers(r.data))).catch(() => {});
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
      const message = payload?.message;
      const chatId = payload?.chat?._id || message?.chat;
      if (!chatId) return;

      // Only the thread on screen takes the message. A socket left in an old
      // chat room — or in several at once after a reconnect — would otherwise
      // drop other conversations' messages into the open one.
      if (message && String(chatId) === String(openChatRef.current)) {
        dispatch(addMessage(message));
      }

      // The list row still updates for any chat, so the preview line and
      // ordering stay live while looking at a different conversation.
      dispatch(
        updateChatInList({
          _id: chatId,
          ...(message
            ? {
                latestMessage: message,
                lastActivity: message.createdAt || new Date().toISOString(),
              }
            : {}),
        })
      );
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
