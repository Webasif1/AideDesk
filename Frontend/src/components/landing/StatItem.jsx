const StatItem = ({ value, label }) => {
  return (
    <div className="text-center px-4">
      <div className="font-display-xl text-display-xl text-on-surface mb-2">{value}</div>
      <div className="font-label-bold text-label-bold text-on-surface-variant uppercase">{label}</div>
    </div>
  );
};

export default StatItem;
