const rows = [
  {
    feature: "Total Users",
    starter: "1 User",
    growth: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    feature: "Data Retention",
    starter: "30 Days",
    growth: "1 Year",
    enterprise: "Unlimited",
  },
  { feature: "Custom Domains", starter: false, growth: true, enterprise: true },
  { feature: "Audit Logs", starter: false, growth: false, enterprise: true },
  {
    feature: "SLA Guarantee",
    starter: false,
    growth: "99.9%",
    enterprise: "99.99%",
  },
];

const Cell = ({ val }) => {
  if (val === true)
    return <span className="material-symbols-outlined text-[18px]">check</span>;
  if (val === false)
    return (
      <span className="material-symbols-outlined text-[18px]">remove</span>
    );
  return <>{val}</>;
};

const ComparisonTable = () => (
  <section className="max-w-4xl mx-auto">
    <h2 className="text-[30px] font-semibold text-on-background text-center mb-[32px]">
      Compare all features
    </h2>
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr>
            {["Feature", "Starter", "Growth", "Enterprise"].map((h, i) => (
              <th
                key={h}
                className={`py-[24px] px-[12px] border-b border-outline-variant text-[16px] font-semibold text-on-background ${i === 0 ? "w-2/5" : "w-1/5 text-center"}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[14px] text-on-surface-variant">
          {rows.map((row) => (
            <tr key={row.feature}>
              <td className="py-[12px] px-[12px] border-b border-surface-container-highest text-on-background">
                {row.feature}
              </td>
              {["starter", "growth", "enterprise"].map((col) => (
                <td
                  key={col}
                  className="py-[12px] px-[12px] border-b border-surface-container-highest text-center"
                >
                  <Cell val={row[col]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);
export default ComparisonTable;
