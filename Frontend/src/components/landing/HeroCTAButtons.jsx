const HeroCTAButtons = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-stack-xl">
      <button className="w-full sm:w-auto bg-primary text-on-primary font-button text-button px-8 py-4 rounded hover:bg-primary/90 transition-colors">
        Start Free Trial
      </button>
      <button className="w-full sm:w-auto bg-surface-container-lowest border border-surface-container-highest text-on-surface font-button text-button px-8 py-4 rounded hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-[18px]">play_circle</span>
        Watch Demo
      </button>
    </div>
  );
};

export default HeroCTAButtons;
