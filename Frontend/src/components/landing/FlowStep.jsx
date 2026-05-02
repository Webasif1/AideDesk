const FlowStep = ({ step, title, description, active = false }) => {
  return (
    <div className={`border border-surface-container-highest rounded-lg p-6 relative ${active ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-label-bold text-label-bold mb-4 absolute -top-4 left-6 border-4
        ${active
          ? 'bg-surface-container-lowest text-on-surface border-primary'
          : 'bg-primary text-on-primary border-surface-container-lowest'}`}
      >
        {step}
      </div>
      <h4 className={`font-headline-md text-[18px] mb-2 mt-2 ${active ? 'text-on-primary' : 'text-on-surface'}`}>{title}</h4>
      <p className={`font-body-sm text-body-sm ${active ? 'text-surface-container-high' : 'text-on-surface-variant'}`}>{description}</p>
    </div>
  );
};

export default FlowStep;
