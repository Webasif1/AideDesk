import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import PageWrapper from "../components/ui/PageWrapper";
import FadeUp from "../components/ui/FadeUp";
import PlatformHero from "../components/platform/PlatformHero";
import PlatformLayer from "../components/platform/PlatformLayer";
import PlatformCTA from "../components/platform/PlatformCTA";
import CognitiveLayerPreview from "../components/platform/CognitiveLayerPreview";
import ExecutionLayerPreview from "../components/platform/ExecutionLayerPreview";
import AdminLayerPreview from "../components/platform/AdminLayerPreview";

const layers = [
  {
    layerNumber: "01",
    title: "Cognitive Engine",
    description:
      "The foundation of the platform. Our AI layer handles intent parsing, context retention, and unstructured data structuring. It operates independently of execution logic, ensuring clean separation of concerns.",
    features: [
      {
        icon: "neurology",
        title: "Semantic Routing",
        description:
          "Automatically directs queries to the optimal specialized model.",
      },
      {
        icon: "memory",
        title: "Long-term Memory",
        description:
          "Persistent vector storage for user and organization context.",
      },
    ],
    preview: <CognitiveLayerPreview />,
    reverse: true,
  },
  {
    layerNumber: "02",
    title: "Autonomous Execution",
    description:
      "Where structured intent becomes reality. The Agent layer provides a deterministic runtime environment for complex workflows, API integrations, and multi-step reasoning tasks.",
    features: [
      {
        icon: "schema",
        title: "Visual Workflow Builder",
        description:
          "Construct multi-agent pipelines without writing deterministic code.",
      },
      {
        icon: "security",
        title: "Sandboxed Runtime",
        description:
          "Isolated execution environments ensure security and resource limits.",
      },
    ],
    preview: <ExecutionLayerPreview />,
    reverse: false,
  },
  {
    layerNumber: "03",
    title: "Command & Control",
    description:
      "Total visibility into platform operations. The Admin layer offers granular access controls, real-time telemetry, and audit logging required for enterprise deployment.",
    features: [
      {
        icon: "monitoring",
        title: "Real-time Telemetry",
        description:
          "Monitor latency, token usage, and agent success rates globally.",
      },
      {
        icon: "policy",
        title: "Governance Policies",
        description:
          "Enforce RBAC, data masking, and model access restrictions.",
      },
    ],
    preview: <AdminLayerPreview />,
    reverse: true,
  },
];

const Platform = () => {
  return (
    <PageWrapper>
      <div className="bg-surface-container-lowest text-on-surface antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-32 pb-24">
          <FadeUp>
            <PlatformHero />
          </FadeUp>
          {layers.map((layer) => (
            <FadeUp key={layer.layerNumber}>
              <PlatformLayer {...layer} />
            </FadeUp>
          ))}
          <FadeUp>
            <PlatformCTA />
          </FadeUp>
        </main>
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default Platform;
