// Status moves the backend accepts (mirrors TICKET_TRANSITIONS in
// Backend/src/controllers/ticket.controller.js). Offering only these keeps the
// status menu from presenting a choice the server will refuse.
export const TICKET_TRANSITIONS = {
  open: ["pending", "in_progress", "resolved", "closed"],
  pending: ["open", "in_progress", "resolved", "closed"],
  in_progress: ["open", "pending", "resolved", "closed"],
  resolved: ["open", "in_progress", "closed"],
  closed: ["open"],
  forced_closed: ["open"],
};

// Raw status names for a control that sets one exact state. The list and
// badges use ticketStatusLabel, which folds pending/in_progress together.
export const RAW_STATUS_LABEL = {
  open: "New",
  pending: "Pending",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
  forced_closed: "Force-closed",
};

export const isActiveStatus = (s) => ["open", "pending", "in_progress"].includes(s);
