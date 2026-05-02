import FlowStep from './FlowStep';

const steps = [
  { step: 1, title: 'Connect Sources',  description: 'Sync Zendesk, Intercom, or plain text docs to train your specific model.',           active: false },
  { step: 2, title: 'Configure Rules',  description: 'Set boundaries on what the AI can answer and when to escalate to humans.',          active: false },
  { step: 3, title: 'Test Sandbox',     description: 'Simulate conversations internally before deploying to real customers.',             active: false },
  { step: 4, title: 'Deploy & Scale',   description: 'Flip the switch and watch your resolution times drop instantly.',                   active: true  },
];

const IntegrationFlowSection = () => {
  return (
    <section className="py-stack-xl border-t border-surface-container-highest bg-surface-container-lowest">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Seamless Integration Flow</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Go live in minutes, not months. Our platform plugs directly into your existing stack.
          </p>
        </div>
        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-surface-container-highest -translate-y-1/2 z-0"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((s) => (
              <FlowStep key={s.step} {...s} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntegrationFlowSection;
