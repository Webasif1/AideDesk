import FeatureCard from './FeatureCard';

const FeaturesSection = () => {
  return (
    <section className="py-stack-xl px-6">
      <div className="max-w-[1280px] mx-auto">
        <div className="mb-12">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Engineered for Scale</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Everything you need to automate support without compromising quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <FeatureCard icon="quickreply" title="AI Auto Replies" description="Trained on your docs to provide instant, accurate answers to common questions." colSpan="lg:col-span-2">
            <div className="h-40 rounded border border-surface-container-highest bg-surface-container-low p-4 relative overflow-hidden">
              <div className="space-y-3 relative z-10">
                <div className="bg-surface-container-lowest border border-surface-container-highest p-3 rounded w-3/4 text-[12px] text-on-surface-variant">
                  How do I reset my password?
                </div>
                <div className="bg-primary text-on-primary p-3 rounded w-3/4 ml-auto text-[12px]">
                  I can help with that. Go to settings &gt; security and click 'Reset'.
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent z-20"></div>
            </div>
          </FeatureCard>

          <FeatureCard icon="route" title="Smart Routing" description="Instantly categorizes and assigns complex tickets to the right human agent.">
            <div className="mt-auto space-y-2">
              <div className="flex items-center justify-between border-b border-surface-container-highest pb-2">
                <span className="font-label-bold text-[10px] text-on-surface-variant uppercase">Billing Issue</span>
                <span className="text-[12px] bg-surface-container-highest px-2 py-0.5 rounded">Finance Team</span>
              </div>
              <div className="flex items-center justify-between border-b border-surface-container-highest pb-2">
                <span className="font-label-bold text-[10px] text-on-surface-variant uppercase">API Bug</span>
                <span className="text-[12px] bg-surface-container-highest px-2 py-0.5 rounded">Eng Team</span>
              </div>
            </div>
          </FeatureCard>

          <FeatureCard icon="dashboard" title="Real-Time Console" description="A single pane of glass for your human agents to oversee all AI interactions.">
            <div className="mt-auto flex justify-center">
              <div className="w-full h-24 bg-surface-container-highest rounded flex items-end p-2 gap-1 opacity-50">
                <div className="w-1/4 h-1/2 bg-on-surface-variant rounded-t"></div>
                <div className="w-1/4 h-full bg-primary rounded-t"></div>
                <div className="w-1/4 h-3/4 bg-on-surface-variant rounded-t"></div>
                <div className="w-1/4 h-1/4 bg-on-surface-variant rounded-t"></div>
              </div>
            </div>
          </FeatureCard>

          <div className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-6 lg:col-span-4 flex flex-col md:flex-row items-center gap-8 group hover:border-on-surface transition-colors duration-300">
            <div className="md:w-1/3">
              <div className="w-10 h-10 rounded border border-surface-container-highest flex items-center justify-center mb-4 bg-surface-container-low group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span className="material-symbols-outlined">analytics</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Analytics Dashboard</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Deep insights into resolution times, customer sentiment, and AI deflection rates. Export directly to CSV.
              </p>
            </div>
            <div className="md:w-2/3 w-full grid grid-cols-3 gap-4">
              {[
                { label: 'Deflection Rate', value: '87.4%', trend: '+2.1%',     icon: 'trending_up' },
                { label: 'CSAT Score',      value: '4.8/5', trend: '+0.3',      icon: 'trending_up' },
                { label: 'Cost Saved',      value: '$12k',  trend: 'This Month', icon: null },
              ].map((metric) => (
                <div key={metric.label} className="border border-surface-container-highest p-4 rounded bg-surface-container-low">
                  <div className="font-label-bold text-label-bold text-on-surface-variant uppercase mb-1">{metric.label}</div>
                  <div className="font-headline-md text-headline-md text-on-surface">{metric.value}</div>
                  <div className="text-[12px] text-on-surface-variant mt-2 flex items-center gap-1">
                    {metric.icon && <span className="material-symbols-outlined text-[14px]">{metric.icon}</span>}
                    {metric.trend}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
