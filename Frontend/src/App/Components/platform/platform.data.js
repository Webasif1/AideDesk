// The ten platform modules. `soon` marks roadmap modules that are shown as
// previews; keep it in sync with what the app actually ships. Preview rows use
// the fictional sample data from the design brief.
export const MODULES = [
  {
    id: "workspace",
    name: "Support workspace",
    icon: "space_dashboard",
    tagline: "Everything that needs you, on one screen.",
    desc: "A focused home for agents: what is urgent, who is waiting, and the context to act without switching tabs.",
    points: ["“Needs attention” list ordered by SLA risk", "Customer context beside every conversation", "Keyboard-first with ⌘K search"],
    preview: {
      title: "Needs attention",
      chip: "3 at risk",
      rows: [
        ["DO", "SSO login loops back to sign-in", "Brightline Health · Urgent", "18m left", "err"],
        ["SM", "Unable to update billing information", "Acme Technologies · High", "1h 24m", "warn"],
        ["GK", "Chat widget not loading on Safari", "Oakridge Labs · High", "2h 15m", "warn"],
        ["MT", "Export missing custom fields", "Fernhill Studio · Medium", "5h 02m", "neutral"],
      ],
    },
  },
  {
    id: "tickets",
    name: "Ticket management",
    icon: "confirmation_number",
    tagline: "A queue that sorts itself out.",
    desc: "Every email, chat and portal request becomes a ticket with status, priority, assignee and an SLA timer.",
    points: ["Saved views, filters and bulk actions", "Assign, escalate and change status in one click", "Attachments and full history kept together"],
    preview: {
      title: "All open",
      chip: "Sorted by SLA",
      rows: [
        ["SM", "Unable to update billing information", "Sarah Mitchell · Alex Morgan", "Waiting", "neutral"],
        ["DO", "SSO login loops back to sign-in", "Daniel Ortiz · Priya Nair", "Open", "info"],
        ["LR", "Webhook deliveries delayed", "Luca Romano · Jonah Lee", "Escalated", "err"],
        ["NP", "Refund for a duplicate charge", "Nina Petrov · Alex Morgan", "Resolved", "ok"],
      ],
    },
  },
  {
    id: "chat",
    name: "Live chat",
    icon: "forum",
    tagline: "Real-time chat with a copilot beside you.",
    desc: "Customers chat from your site. The AI answers first, and an agent can take over at any moment with the full thread.",
    points: ["Typing indicators and live updates", "Attachments in the conversation", "One-click human takeover"],
    preview: {
      title: "Live conversations",
      chip: "4 live",
      rows: [
        ["GK", "Grace Kim", "Grace is typing…", "You", "neutral"],
        ["DO", "Daniel Ortiz", "SSO still loops after clearing cookies", "Waiting 4m", "warn"],
        ["LR", "Luca Romano", "Any update on the webhook delay?", "AI handling", "info"],
        ["AB", "Aisha Bello", "Can I add a second admin?", "Waiting 12m", "warn"],
      ],
    },
  },
  {
    id: "portal",
    name: "Customer portal",
    icon: "home",
    tagline: "Self-service your customers will actually use.",
    desc: "Customers raise requests, follow progress in plain language and reply without hunting through email.",
    points: ["Friendly status: “We replied, your turn”", "Start a chat or a ticket from one place", "Works on phones"],
    preview: {
      title: "Sarah's requests",
      chip: "Customer view",
      rows: [
        ["SM", "Unable to update billing information", "Opened today", "Your turn", "warn"],
        ["SM", "Seat count after downgrade", "Opened Jul 9", "In progress", "info"],
        ["SM", "Invoice PDF missing PO number", "Closed Jul 14", "Resolved", "ok"],
      ],
    },
  },
  {
    id: "kb",
    name: "Knowledge base",
    icon: "menu_book",
    soon: true,
    tagline: "Answers written once, found everywhere.",
    desc: "Publish help articles that surface in the portal, in chat suggestions and in the AI copilot's replies.",
    points: ["Categories, search and article feedback", "Draft, review and publish workflow", "Suggested inside the composer"],
    preview: {
      title: "Help articles",
      chip: "Preview",
      rows: [
        ["KB", "Update your payment method", "Billing · updated 2 days ago", "Published", "ok"],
        ["KB", "Allow the widget domain in Safari", "Chat widget", "Draft", "warn"],
        ["KB", "Invite teammates in bulk", "Team · updated last week", "Published", "ok"],
      ],
    },
  },
  {
    id: "automation",
    name: "Automation",
    icon: "bolt",
    soon: true,
    tagline: "When, if, then: routine work on rails.",
    desc: "Build rules visually: a trigger, the conditions that must match and the actions to take.",
    points: ["Route, tag, assign and escalate", "Test a rule against a real ticket", "Pause or edit at any time"],
    preview: {
      title: "Rules",
      chip: "Preview",
      rows: [
        ["R1", "Route enterprise high-priority", "Ticket updated", "Active", "ok"],
        ["R2", "Escalate when SLA is at risk", "SLA timer", "Active", "ok"],
        ["R3", "Close resolved after 3 days", "Scheduled", "Paused", "neutral"],
      ],
    },
  },
  {
    id: "ai",
    name: "AI assistance",
    icon: "auto_awesome",
    tagline: "An assistant that drafts. People decide.",
    desc: "The copilot answers routine chat questions and drafts tickets for customers to confirm, then hands over to a person with the full thread.",
    points: ["Answers routine questions in chat", "Drafted tickets need customer confirmation", "Agents can take over at any moment"],
    preview: {
      title: "AI activity",
      chip: "Today",
      rows: [
        ["AI", "Drafted a ticket for Grace Kim", "Waiting for customer to confirm", "14:04", "warn"],
        ["AI", "Answered “Can I add a second admin?”", "Customer asked for a person", "13:40", "info"],
        ["AI", "Handed over to Alex Morgan", "Full thread passed along", "14:06", "neutral"],
      ],
    },
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: "bar_chart",
    tagline: "See how support is going, at a glance.",
    desc: "Ticket volume and response times across your workspace, with more reporting on the way.",
    points: ["Ticket and agent stats", "Response and resolution times", "Satisfaction reporting (roadmap)"],
    preview: {
      title: "Workspace stats",
      chip: "Sample data",
      rows: [
        ["TV", "Tickets created", "This period", "629", "neutral"],
        ["FR", "Median first response", "All channels", "12m", "ok"],
        ["RS", "Median resolution", "All priorities", "3h 12m", "info"],
      ],
    },
  },
  {
    id: "team",
    name: "Team management",
    icon: "groups",
    tagline: "Balanced workloads, clear ownership.",
    desc: "Invite agents, set roles and see who has capacity before you assign.",
    points: ["Roles for admins, agents and customers", "Workload and capacity per agent", "Live session revocation"],
    preview: {
      title: "Team · Billing",
      chip: "5 agents",
      rows: [
        ["AM", "Alex Morgan", "12 / 15 open", "Online", "ok"],
        ["JL", "Jonah Lee", "14 / 15 open", "Near capacity", "warn"],
        ["MC", "Maya Chen", "6 / 15 open", "Away", "neutral"],
      ],
    },
  },
  {
    id: "integrations",
    name: "Integrations",
    icon: "extension",
    soon: true,
    tagline: "Fits the tools your team already uses.",
    desc: "Connect email, chat notifications and your own systems through webhooks and an API.",
    points: ["Email channel and chat widget", "Webhooks for ticket events", "API for custom workflows"],
    preview: {
      title: "Connections",
      chip: "Preview",
      rows: [
        ["@", "Email channel", "support@northwind.io", "Connected", "ok"],
        ["#", "Team chat notifications", "Not connected", "Connect", "neutral"],
        ["{}", "Webhooks", "2 endpoints", "Active", "ok"],
      ],
    },
  },
];

export const FLOW = [
  ["Customer reaches out", "By email, the chat widget or the portal. Everything lands in one queue."],
  ["AI takes the first pass", "Routine questions get an answer, and a ticket is drafted when a person is needed."],
  ["An agent resolves", "With the full thread, customer history and SLA timer in view."],
  ["You learn from it", "Stats show volume and response times over time."],
];
