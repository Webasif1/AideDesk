import StatItem from './StatItem';

const stats = [
  { value: '10k+', label: 'Conversations Handled' },
  { value: '90%',  label: 'AI Resolution Rate' },
  { value: '24/7', label: 'Uptime & Availability' },
  { value: '<1s',  label: 'Response Latency' },
];

const StatsSection = () => {
  return (
    <section className="py-stack-lg border-y border-surface-container-highest bg-surface-container-lowest">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-surface-container-highest">
          {stats.map((stat) => (
            <StatItem key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
