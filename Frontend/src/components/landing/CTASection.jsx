const CTASection = () => {
  return (
    <section className="py-stack-xl px-6 bg-primary text-on-primary text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display-xl text-[40px] mb-6">Ready to automate your support?</h2>
        <p className="font-body-lg text-body-lg text-surface-container-high mb-10">
          Join 500+ forward-thinking teams resolving tickets faster than ever.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto bg-surface-container-lowest text-on-surface font-button text-button px-8 py-4 rounded hover:bg-surface-container-low transition-colors">
            Create Account
          </button>
          <button className="w-full sm:w-auto bg-transparent border border-surface-container-lowest text-on-primary font-button text-button px-8 py-4 rounded hover:bg-surface-container-lowest/10 transition-colors">
            Contact Sales
          </button>
        </div>
        <p className="font-body-sm text-[12px] text-surface-container-high mt-6">
          No credit card required for 14-day trial.
        </p>
      </div>
    </section>
  );
};

export default CTASection;
