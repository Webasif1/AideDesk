// Saved views for the tickets page. Each view is a server-side query, never a
// filter over the page already on screen. A view's count comes from
// GET /tickets/stats where that endpoint has one; views it cannot count show
// no number rather than a guess.
const ACTIVE = "open,pending,in_progress";
const DONE = "resolved,closed";

const openCount = (s) => (s.open ?? 0) + (s.pending ?? 0) + (s.inProgress ?? 0);
const doneCount = (s) => (s.resolved ?? 0) + (s.closed ?? 0);

const VIEWS = {
  admin: [
    { id: "open", label: "All open", query: { status: ACTIVE }, count: openCount },
    { id: "unassigned", label: "Unassigned", query: { status: ACTIVE, assignedAgent: "unassigned" } },
    { id: "resolved", label: "Resolved", query: { status: DONE }, count: doneCount },
    { id: "all", label: "All tickets", query: {}, count: (s) => s.total ?? 0 },
  ],
  // Agents only ever receive their own assignments, so every view is "mine".
  agent: [
    { id: "open", label: "My open", query: { status: ACTIVE }, count: openCount },
    { id: "resolved", label: "Resolved", query: { status: DONE }, count: doneCount },
    { id: "all", label: "All mine", query: {}, count: (s) => s.total ?? 0 },
  ],
  // Customers can't read /tickets/stats, so their views carry no counts.
  customer: [
    { id: "open", label: "Open", query: { status: ACTIVE } },
    { id: "resolved", label: "Resolved", query: { status: DONE } },
    { id: "all", label: "All", query: {} },
  ],
};

export const ticketViewsFor = (role) => VIEWS[role] || VIEWS.admin;

export const openTicketCount = openCount;
