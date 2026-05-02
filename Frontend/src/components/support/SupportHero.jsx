const SupportHero = () => (
  <section className="max-w-[1280px] mx-auto px-[24px] py-[64px] flex flex-col items-center text-center border-b border-surface-container-highest">
    <span className="text-[12px] font-semibold tracking-widest uppercase text-on-surface-variant mb-[16px]">
      Support Center
    </span>
    <h1 className="text-[48px] font-semibold tracking-tight text-on-surface mb-[32px]">
      How can we help?
    </h1>
    <div className="w-full max-w-2xl relative">
      <span className="material-symbols-outlined absolute left-[16px] top-1/2 -translate-y-1/2 text-on-surface-variant">
        search
      </span>
      <input
        className="w-full pl-[48px] pr-[16px] py-[16px] bg-surface-container-low border border-surface-container-highest rounded-lg text-[14px] text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        placeholder="Search for articles, guides, and more..."
        type="text"
      />
    </div>
    <div className="mt-[8px] flex gap-[8px] items-center text-[14px] text-on-surface-variant flex-wrap justify-center">
      <span>Popular:</span>
      {["API Limits", "Reset Password", "Billing Cycle"].map((t, i, arr) => (
        <span key={t} className="flex items-center gap-[8px]">
          <a
            href="#"
            className="hover:text-primary transition-colors border-b border-transparent hover:border-primary"
          >
            {t}
          </a>
          {i < arr.length - 1 && <span>,</span>}
        </span>
      ))}
    </div>
  </section>
);
export default SupportHero;
