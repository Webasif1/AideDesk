const SolutionCard = ({ type, title, body }) => {
  const isOutcome = type === "outcome";
  const isSolution = type === "solution";
  return (
    <div
      className={`rounded-xl p-[24px] flex flex-col h-full relative overflow-hidden
      ${isOutcome ? "bg-primary text-on-primary border border-primary" : "bg-surface-container-lowest border border-outline-variant"}`}
    >
      {isSolution && (
        <div className="absolute inset-0 bg-gradient-to-b from-surface-bright to-transparent opacity-50 pointer-events-none" />
      )}
      <div className="mb-[16px] relative z-10">
        <span
          className={`inline-block text-[12px] font-semibold tracking-widest uppercase px-[8px] py-[4px] rounded
          ${
            type === "problem"
              ? "bg-surface-container-low text-on-secondary-container"
              : type === "solution"
                ? "bg-surface-container-highest text-on-background"
                : "bg-inverse-surface text-on-secondary"
          }`}
        >
          {type === "problem"
            ? "The Problem"
            : type === "solution"
              ? "The Solution"
              : "The Outcome"}
        </span>
      </div>
      <h3
        className={`text-[24px] font-medium mb-[8px] relative z-10 ${isOutcome ? "text-on-primary" : "text-on-background"}`}
      >
        {title}
      </h3>
      <p
        className={`text-[14px] leading-relaxed flex-grow relative z-10 ${isOutcome ? "text-surface-variant" : "text-on-surface-variant"}`}
      >
        {body}
      </p>
    </div>
  );
};
export default SolutionCard;
