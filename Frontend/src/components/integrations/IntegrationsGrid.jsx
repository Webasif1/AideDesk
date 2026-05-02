import IntegrationCard from "./IntegrationCard";

const integrations = [
  {
    icon: "support_agent",
    title: "Zendesk",
    description:
      "Sync tickets, update customer profiles, and manage support queues directly within AideDesk.",
  },
  {
    icon: "chat_bubble",
    title: "Intercom",
    description:
      "Route live chats and automated sequences to your unified inbox for immediate resolution.",
  },
  {
    icon: "forum",
    title: "Slack",
    description:
      "Receive alerts, respond to internal queries, and escalate issues without leaving your workspace.",
  },
  {
    icon: "mail",
    title: "Email",
    description:
      "Convert traditional email threads into structured, trackable conversations within the platform.",
  },
];

const IntegrationsGrid = () => (
  <section className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
    {integrations.map((item) => (
      <IntegrationCard key={item.title} {...item} />
    ))}
  </section>
);
export default IntegrationsGrid;
