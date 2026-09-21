import StatItem from './StatItem';

const stats = [
  { value: '1 inbox', label: 'Tickets, chat & portal' },
  { value: '3 roles', label: 'Admin, agent & customer' },
  { value: '24/7', label: 'AI copilot on duty' },
  { value: 'Live', label: 'Real-time updates' },
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
