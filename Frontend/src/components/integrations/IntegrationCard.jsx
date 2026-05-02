const IntegrationCard = ({ icon, title, description }) => (
  <article className="bg-surface-container-lowest border border-outline-variant rounded-xl p-[24px] flex flex-col justify-between min-h-[200px]">
    <div className="flex flex-col gap-[12px]">
      <div className="w-12 h-12 bg-surface-container flex items-center justify-center rounded-lg border border-outline-variant">
        <span className="material-symbols-outlined text-on-surface">
          {icon}
        </span>
      </div>
      <h2 className="text-[24px] font-medium text-on-surface">{title}</h2>
      <p className="text-[14px] text-on-surface-variant leading-relaxed">
        {description}
      </p>
    </div>
    <div className="pt-[12px] mt-auto">
      <button className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg py-[8px] text-[14px] hover:border-primary transition-colors">
        Configure Integration
      </button>
    </div>
  </article>
);
export default IntegrationCard;
