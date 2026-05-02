const LayerFeatureItem = ({ icon, title, description }) => {
  return (
    <div className="flex items-start gap-4">
      <span
        className="material-symbols-outlined text-primary mt-1"
        style={{ fontVariationSettings: '"FILL" 1' }}
      >
        {icon}
      </span>
      <div>
        <h3 className="text-[16px] font-semibold text-on-surface">{title}</h3>
        <p className="text-[14px] text-on-surface-variant">{description}</p>
      </div>
    </div>
  );
};

export default LayerFeatureItem;
