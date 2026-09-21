import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "../../dashboard/components/Sidebar";
import TopBar from "../../dashboard/components/TopBar";
import PageWrapper from "../../../App/Components/ui/PageWrapper";
import Button from "../../../components/ui/Button";
import ErrorState from "../../../components/ui/ErrorState";
import { toast } from "../../../components/ui/toast";
import TicketThread from "../components/detail/TicketThread";
import TicketProperties from "../components/detail/TicketProperties";
import TicketCustomerPanel from "../components/detail/TicketCustomerPanel";
import { getTicket, updateTicket, updateTicketStatus, assignAgent } from "../services/ticket.api";
import { useAgent } from "../../agent/hooks/useAgent";
import { getSocket, joinChat, leaveChat } from "../../../lib/socket";
import { shortId } from "../../../lib/format";
import { RAW_STATUS_LABEL, TICKET_TRANSITIONS } from "../lib/ticketStatus";

// Staff view of one ticket: the conversation, its properties and history, and
// the customer behind it. Every control writes through an existing endpoint and
// then re-reads the ticket, so what's on screen is what the server holds.
const TicketDetail = () => {
  const { id } = useParams();
  const role = useSelector((s) => s.auth.role);
  const isAdmin = role === "admin";
  const agents = useSelector((s) => s.agent.agents) || [];
  const { getAgents } = useAgent();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const show = (res) => {
    setTicket(res.data.ticket);
    setMessages(res.data.chatMessages || []);
    setError(null);
  };
  const fail = (err) =>
    setError(err.response?.status === 404 ? "This ticket doesn't exist or was deleted." : err.response?.data?.message || "Couldn't load this ticket.");

  const load = useCallback(() => getTicket(id).then(show, fail), [id]);

  // Moving to another ticket (e.g. from "Previous tickets") clears the old one
  // during render, so its thread never flashes under the new title.
  const [shownId, setShownId] = useState(id);
  if (id !== shownId) {
    setShownId(id);
    setTicket(null);
    setMessages([]);
    setError(null);
  }

  useEffect(() => {
    let live = true;
    getTicket(id).then(
      (res) => live && show(res),
      (err) => live && fail(err)
    );
    return () => {
      live = false;
    };
  }, [id]);

  useEffect(() => {
    if (isAdmin) getAgents({ page: 1, limit: 100 }).catch(() => {});
  }, [getAgents, isAdmin]);

  // Live replies from the customer or the AI land in the thread as they arrive.
  const chatId = ticket?.chat?._id;
  useEffect(() => {
    if (!chatId) return;
    joinChat(chatId);
    const socket = getSocket();
    const onMessage = (payload) => {
      const m = payload?.message;
      if (!m || String(payload?.chat?._id || m.chat) !== String(chatId)) return;
      setMessages((prev) => (prev.some((x) => x._id === m._id) ? prev : [...prev, m]));
    };
    socket?.on("message:new", onMessage);
    return () => {
      socket?.off("message:new", onMessage);
      leaveChat(chatId);
    };
  }, [chatId]);

  const run = async (fn, done) => {
    setBusy(true);
    try {
      await fn();
      await load();
      if (done) toast(done, { type: "success" });
    } catch (err) {
      toast(err.response?.data?.message || "That change didn't go through.", { type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const setStatus = (status) => run(() => updateTicketStatus({ id, status }), `Status set to ${RAW_STATUS_LABEL[status]}.`);
  const patch = (fields) => run(() => updateTicket({ id, ...fields }));
  const assign = (agentId) => run(() => assignAgent({ id, agentId }), "Ticket assigned.");

  const onSent = (m) => setMessages((prev) => (prev.some((x) => x._id === m._id) ? prev : [...prev, m]));

  const number = ticket ? ticket.ticketNumber || shortId(ticket._id) : "";
  const moves = ticket ? TICKET_TRANSITIONS[ticket.status] || [] : [];
  const canResolve = moves.includes("resolved");

  return (
    <PageWrapper>
      <div className="bg-surface dark:bg-[#051f20] text-on-surface min-h-screen font-sans">
        <Sidebar />
        <div className="ml-64 h-screen flex flex-col">
          <TopBar />
          {error ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <ErrorState title="Ticket unavailable" message={error} onRetry={load} />
              <Link to="/dashboard/tickets" className="text-[13px] font-semibold text-brand dark:text-sage underline underline-offset-2">
                Back to tickets
              </Link>
            </div>
          ) : !ticket ? (
            <div className="flex-1 flex flex-col gap-4 p-8" aria-busy="true">
              <div className="h-10 w-1/2 rounded-xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
              <div className="flex-1 rounded-2xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 min-h-[76px] px-6 md:px-8 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0b2b26]">
                <Link
                  to="/dashboard/tickets"
                  aria-label="Back to tickets"
                  className="w-9 h-9 rounded-[10px] border border-neutral-200 dark:border-neutral-800 text-brand dark:text-sage flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px]">chevron_left</span>
                </Link>
                <div className="flex-1 min-w-[200px] flex flex-col gap-1">
                  <span className="font-mono text-[12px] text-neutral-500">{number}</span>
                  <h1 className="font-display text-[22px] font-bold tracking-[-0.02em] text-on-surface truncate">{ticket.title}</h1>
                </div>
                <label className="h-[38px] pl-3.5 pr-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 flex items-center gap-2 text-[13px] font-semibold text-on-surface">
                  <span aria-hidden="true" className="w-[7px] h-[7px] rounded-full bg-brand dark:bg-sage" />
                  <span className="sr-only">Status</span>
                  <select
                    value={ticket.status}
                    disabled={busy || !moves.length}
                    onChange={(e) => e.target.value !== ticket.status && setStatus(e.target.value)}
                    className="bg-transparent focus:outline-none cursor-pointer disabled:cursor-not-allowed"
                  >
                    <option value={ticket.status}>{RAW_STATUS_LABEL[ticket.status]}</option>
                    {moves.map((s) => (
                      <option key={s} value={s}>
                        {s === "open" && ticket.status !== "open" ? "Reopen" : RAW_STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </label>
                {canResolve && (
                  <Button icon="check" onClick={() => setStatus("resolved")} loading={busy}>
                    Resolve
                  </Button>
                )}
              </div>

              <div className="flex-1 min-h-0 flex overflow-x-auto">
                <TicketThread ticket={ticket} messages={messages} onSent={onSent} />
                <TicketProperties ticket={ticket} agents={agents} busy={busy} onPatch={patch} onAssign={assign} />
                <TicketCustomerPanel ticket={ticket} />
              </div>
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default TicketDetail;
