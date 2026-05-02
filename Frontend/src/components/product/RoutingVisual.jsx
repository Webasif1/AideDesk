const RoutingVisual = () => (
  <div className="bg-white border border-surface-variant rounded-lg p-[24px]">
    {[
      { label: "IF", val: "intent == 'billing'", highlight: false },
      { label: "AND", val: "tier == 'enterprise'", highlight: false },
      { label: "THEN", val: "ROUTE TO: Sarah (Tier 3)", highlight: true },
    ].map((row, i, arr) => (
      <div
        key={row.label}
        className={`flex items-center justify-between ${i < arr.length - 1 ? "border-b border-surface-variant pb-[12px] mb-[12px]" : ""}`}
      >
        <span className="text-[12px] font-mono text-on-surface">
          {row.label}
        </span>
        <span
          className={`text-[12px] font-mono px-[8px] py-[4px] rounded ${row.highlight ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface"}`}
        >
          {row.val}
        </span>
      </div>
    ))}
  </div>
);
export default RoutingVisual;
