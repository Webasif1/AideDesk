const HeroBadge = ({ text }) => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-surface-container-highest bg-surface-container-lowest mb-8">
      <span className="w-2 h-2 rounded-full bg-primary"></span>
      <span className="font-label-bold text-label-bold text-on-surface uppercase tracking-widest">
        {text}
      </span>
    </div>
  );
};

export default HeroBadge;
