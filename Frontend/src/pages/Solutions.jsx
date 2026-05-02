import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import PageWrapper from "../components/ui/PageWrapper";
import FadeUp from "../components/ui/FadeUp";
import SolutionsHero from "../components/solutions/SolutionsHero";
import SolutionRow from "../components/solutions/SolutionRow";

const rows = [
  {
    icon: "cloud",
    title: "Software as a Service (SaaS)",
    subtitle:
      "Managing complex technical queries and maintaining high SLA adherence.",
    cards: [
      {
        type: "problem",
        title: "Technical Debt in Support",
        body: "Tier 1 agents spend excessive time escalating complex API and configuration issues, leading to bottlenecked engineering resources and frustrated users.",
      },
      {
        type: "solution",
        title: "Contextual Runbooks",
        body: "AideDesk automatically attaches relevant diagnostic logs and suggests pre-approved engineering runbooks based on the issue signature before escalation.",
      },
      {
        type: "outcome",
        title: "45% Escalation Drop",
        body: "Tier 1 teams resolve technical queries autonomously, protecting engineering time and decreasing average time-to-resolution by hours.",
      },
    ],
  },
  {
    icon: "shopping_bag",
    title: "E-commerce & Retail",
    subtitle: "Handling seasonal volume spikes and fragmented order logistics.",
    cards: [
      {
        type: "problem",
        title: "Volume Volatility",
        body: "Holiday spikes and flash sales overwhelm support queues with repetitive WISMO requests, burying urgent customer issues.",
      },
      {
        type: "solution",
        title: "Unified Logistics Hub",
        body: "Deep integrations with major 3PLs surface real-time tracking directly in the ticket interface, with zero-touch automated WISMO responses.",
      },
      {
        type: "outcome",
        title: "Zero-Touch Resolution",
        body: "Up to 60% of logistical inquiries are deflected entirely, allowing agents to focus on high-value retention and complex returns.",
      },
    ],
  },
  {
    icon: "rocket_launch",
    title: "High-Growth Startups",
    subtitle: "Scaling support operations without scaling headcount linearly.",
    cards: [
      {
        type: "problem",
        title: "Fragmented Context",
        body: "Small teams juggle conversations across email, Slack, and social media, losing customer context and duplicating effort.",
      },
      {
        type: "solution",
        title: "Omnichannel Canvas",
        body: "A single unified workspace consolidating all channels, backed by macros and AI drafting to maintain a consistent voice.",
      },
      {
        type: "outcome",
        title: "Lean Efficiency",
        body: "Maintain a premium support experience with a fraction of the team size. Handle 3x the volume per agent with streamlined tooling.",
      },
    ],
  },
];

const Solutions = () => (
  <PageWrapper>
    <div className="bg-background text-on-background antialiased min-h-screen">
      <Navbar />
      <main className="pt-[64px] pb-[64px]">
        <FadeUp delay={0}>
          <SolutionsHero />
        </FadeUp>
        <div className="max-w-[1280px] mx-auto px-[24px] flex flex-col gap-[64px]">
          {rows.map((row, i) => (
            <FadeUp key={row.title} delay={i * 0.05}>
              <SolutionRow {...row} />
            </FadeUp>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  </PageWrapper>
);
export default Solutions;
