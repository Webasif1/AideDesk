// Help articles for /support. Each answer describes how the app works today —
// check the matching route or component before changing a step, and update
// the answer when a flow changes.
export const HELP_CATEGORIES = [
  { id: "start", label: "Getting started", icon: "rocket_launch" },
  { id: "tickets", label: "Tickets", icon: "confirmation_number" },
  { id: "chat", label: "Live chat & AI", icon: "forum" },
  { id: "team", label: "Team & customers", icon: "groups" },
  { id: "account", label: "Account & security", icon: "shield" },
];

export const HELP_ARTICLES = [
  {
    cat: "start",
    q: "How do I create a workspace?",
    a: [
      "Sign up with your name, work email and a password, then open the verification link we email you.",
      "After verifying, set up your company. You'll land in the company portal, where you can create one or more workspaces.",
      "Open a workspace to reach its dashboard, tickets and chat.",
    ],
  },
  {
    cat: "start",
    q: "I didn't get the verification email",
    a: [
      "Check your spam or promotions folder first.",
      "Accounts can't be used until the email is verified. If it still hasn't arrived after a few minutes, contact us and we'll help.",
    ],
  },
  {
    cat: "tickets",
    q: "How do customers open a ticket?",
    a: [
      "Customers sign in to the customer portal and create a ticket from their dashboard.",
      "They can also start a live chat. If the AI copilot drafts a ticket during the chat, the customer confirms it before it's created.",
    ],
  },
  {
    cat: "tickets",
    q: "What files can be attached to a ticket?",
    a: ["Images (JPG, PNG, WebP, GIF) and PDFs, up to 10 MB each."],
  },
  {
    cat: "tickets",
    q: "How do I assign, escalate or change a ticket's status?",
    a: [
      "Open Tickets from the sidebar and use the actions on a ticket's row to assign an agent, change its status or escalate it.",
      "Changes show up for everyone in the workspace in real time.",
    ],
  },
  {
    cat: "chat",
    q: "How does the AI copilot work in live chat?",
    a: [
      "When a customer starts a chat, the copilot replies first and answers routine questions.",
      "When a person is needed, it can draft a ticket for the customer to confirm, and an agent can take over the conversation at any time with the full thread in view.",
    ],
  },
  {
    cat: "chat",
    q: "How do I take over a chat from the AI?",
    a: ["Open Chat from the sidebar, select the conversation and choose to take it over. The customer sees that an agent has joined."],
  },
  {
    cat: "team",
    q: "How do I add an agent?",
    a: [
      "Workspace admins open Team from the sidebar and add an agent with their name and email.",
      "Fine-grained per-agent permissions are on the way; for now agents share the standard agent role.",
    ],
  },
  {
    cat: "team",
    q: "How do I add a customer?",
    a: ["Admins open Customers from the sidebar and create the customer. They then sign in through the customer portal."],
  },
  {
    cat: "account",
    q: "I forgot my password",
    a: ["Choose “Forgot password?” on the sign-in page and enter your email. We'll send a link to set a new one."],
  },
  {
    cat: "account",
    q: "How do I switch between light and dark mode?",
    a: ["Use the theme toggle: in the dashboard it's in the top bar, and on other pages it floats in the bottom-right corner. Your choice is remembered on this device."],
  },
  {
    cat: "account",
    q: "What happens when an admin removes someone?",
    a: ["Their open sessions end immediately, so they're signed out everywhere without waiting for a timeout."],
  },
];
