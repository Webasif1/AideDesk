// Shared formatting helpers for tickets/agents/customers so every table and
// metric strip renders backend data consistently.

// "2 mins ago" style relative time from a date string/Date.
export const formatRelative = (date) => {
  if (!date) return "—";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

// Clock time, e.g. "09:42 AM".
export const formatClock = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Minutes → "14m" / "1h 20m" / "—".
export const formatMinutes = (m) => {
  if (m == null) return "—";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
};

// Backend ticket status (+ slaBreached) → display label used by TicketRow styling.
export const ticketStatusLabel = (status, slaBreached) => {
  if (slaBreached && !["resolved", "closed"].includes(status)) return "Overdue";
  switch (status) {
    case "open":
      return "New";
    case "pending":
    case "in_progress":
      return "In Progress";
    case "resolved":
    case "closed":
      return "Resolved";
    default:
      return "New";
  }
};

// Backend priority (low/medium/high/urgent) → TicketRow's High/Normal/Low buckets.
export const ticketPriorityLabel = (priority) => {
  if (priority === "high" || priority === "urgent") return "High";
  if (priority === "low") return "Low";
  return "Normal";
};

// Two-letter initials from a name.
export const initialsOf = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Short id badge, e.g. "#A1B2C3" from a Mongo _id.
export const shortId = (id, prefix = "#") =>
  id ? `${prefix}${String(id).slice(-6).toUpperCase()}` : "";

// Resolve a populated customer's display name (user model uses `name`).
export const customerName = (c) =>
  c?.name || c?.fullName || c?.email || "Unknown";
