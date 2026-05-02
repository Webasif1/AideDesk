const FeatureCard = ({ icon, title, description, colSpan = '', children }) => {
  return (
    <div className={`bg-surface-container-lowest border border-surface-container-highest rounded-xl p-6 flex flex-col justify-between group hover:border-on-surface transition-colors duration-300 ${colSpan}`}>
      <div className="mb-8">
        <div className="w-10 h-10 rounded border border-surface-container-highest flex items-center justify-center mb-4 bg-surface-container-low group-hover:bg-primary group-hover:text-on-primary transition-colors">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{title}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant">{description}</p>
      </div>
      {children}
    </div>
  );
};

export default FeatureCard;
