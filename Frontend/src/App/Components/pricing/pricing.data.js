// Single source for the pricing page. Anything in [brackets] is a placeholder
// the product owner has not decided yet — replace it here, not in components.

export const PLANS = [
  {
    id: "free",
    name: "Free",
    summary: "For trying AideDesk with a small team.",
    price: { monthly: "$0", yearly: "$0" },
    unit: "forever",
    cta: { label: "Start free", to: "/signup" },
    items: [
      ["Agents", "[Seat limit]"],
      ["Tickets", "[Monthly limit]"],
      ["Chat", "Widget"],
      ["Automation", "—"],
      ["AI", "Basic triage"],
      ["Analytics", "Overview"],
      ["Integrations", "Email"],
      ["Support", "Community"],
    ],
  },
  {
    id: "starter",
    name: "Starter",
    summary: "For small teams that need a shared queue and chat.",
    price: { monthly: "[Price]", yearly: "[Price]" },
    unit: "/ agent / mo",
    cta: { label: "Start trial", to: "/signup" },
    items: [
      ["Agents", "Up to [N]"],
      ["Tickets", "[Limit]"],
      ["Chat", "Widget + portal"],
      ["Automation", "Saved views"],
      ["AI", "Copilot replies"],
      ["Analytics", "Standard"],
      ["Integrations", "Email"],
      ["Support", "Email"],
    ],
  },
  {
    id: "business",
    name: "Business",
    summary: "For growing teams with SLAs and automation.",
    price: { monthly: "[Price]", yearly: "[Price]" },
    unit: "/ agent / mo",
    cta: { label: "Start trial", to: "/signup" },
    popular: true,
    items: [
      ["Agents", "Unlimited"],
      ["Tickets", "Unlimited"],
      ["Chat", "Full + takeover"],
      ["Automation", "Rules builder"],
      ["AI", "Triage + drafts"],
      ["Analytics", "Advanced"],
      ["Integrations", "Webhooks, API"],
      ["Support", "Priority"],
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    summary: "For multiple teams with strict access needs.",
    price: { monthly: "Custom", yearly: "Custom" },
    unit: "",
    billingNote: "Annual agreement",
    cta: { label: "Talk to sales", to: "/demo" },
    items: [
      ["Agents", "Unlimited"],
      ["Tickets", "Unlimited"],
      ["Chat", "Full + takeover"],
      ["Automation", "Advanced rules"],
      ["AI", "Custom policies"],
      ["Analytics", "Custom reports"],
      ["Integrations", "All + custom"],
      ["Support", "Dedicated"],
    ],
  },
];

export const YEARLY_DISCOUNT_LABEL = "[Yearly discount]";

// true = included, false = not included, string = shown as text.
export const COMPARISON = [
  {
    group: "Support channels",
    rows: [
      ["Email tickets", true, true, true, true],
      ["Live chat widget", true, true, true, true],
      ["Customer portal", false, true, true, true],
    ],
  },
  {
    group: "Productivity",
    rows: [
      ["Saved views & bulk actions", false, true, true, true],
      ["Canned responses", false, true, true, true],
      ["SLA policies", false, false, true, true],
      ["Automation rules", false, false, true, true],
    ],
  },
  {
    group: "AI",
    rows: [
      ["AI triage", "Basic", true, true, true],
      ["Suggested replies", false, true, true, true],
      ["AI-drafted tickets", false, false, true, true],
    ],
  },
  {
    group: "Admin & security",
    rows: [
      ["Roles & permissions", "Basic", "Basic", true, true],
      ["Multiple workspaces", false, false, false, true],
      ["Live session revocation", true, true, true, true],
    ],
  },
];

export const FAQS = [
  ["Can I change plans later?", "Yes, you can upgrade or downgrade at any time. [Proration policy to be confirmed.]"],
  ["What counts as an agent?", "Anyone on your team who replies to customers. [Confirm how portal-only customers are counted.]"],
  ["Is there a free trial of paid plans?", "[Trial length and terms to be confirmed.]"],
  [
    "How does the AI copilot handle data?",
    "Every AI action is labelled in the conversation, and tickets drafted by the AI need the customer to confirm them. [Data-handling policy to be confirmed.]",
  ],
  ["Do you offer discounts for nonprofits?", "[Policy to be confirmed.]"],
];
