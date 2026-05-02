const PreviewStatCard = ({ icon, label, value, filled = false }) => {
  return (
    <div className="bg-surface-container-lowest border border-surface-container-highest rounded p-4 flex-1 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded flex items-center justify-center ${filled ? 'bg-primary' : 'border border-surface-container-highest'}`}>
          <span className={`material-symbols-outlined text-[16px] ${filled ? 'text-on-primary' : 'text-on-surface'}`}>
            {icon}
          </span>
        </div>
        <div>
          <div className="font-label-bold text-label-bold text-on-surface uppercase">{label}</div>
          <div className="font-body-sm text-body-sm text-on-surface-variant">{value}</div>
        </div>
      </div>
    </div>
  );
};

export default PreviewStatCard;
