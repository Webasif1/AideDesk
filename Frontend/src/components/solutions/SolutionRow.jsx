import SolutionCard from "./SolutionCard";

const SolutionRow = ({ icon, title, subtitle, cards }) => (
  <section className="border-t border-surface-variant pt-[48px]">
    <div className="mb-[24px]">
      <h2 className="text-[30px] font-semibold text-on-background flex items-center gap-[8px]">
        <span className="material-symbols-outlined text-on-surface-variant">
          {icon}
        </span>
        {title}
      </h2>
      <p className="text-[14px] text-on-surface-variant mt-[4px]">{subtitle}</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
      {cards.map((card) => (
        <SolutionCard key={card.type} {...card} />
      ))}
    </div>
  </section>
);
export default SolutionRow;
