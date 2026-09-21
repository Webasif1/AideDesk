import { Fragment } from "react";
import { COMPARISON, PLANS } from "./pricing.data";

const Cell = ({ val }) => {
  if (val === true)
    return (
      <span className="material-symbols-outlined text-[18px] text-ok" aria-label="Included">
        check
      </span>
    );
  if (val === false)
    return <span className="inline-block w-3 h-0.5 rounded bg-neutral-300 dark:bg-neutral-700" aria-label="Not included" />;
  return <span className="font-medium">{val}</span>;
};

const ComparisonTable = () => (
  <section className="flex flex-col gap-7 mb-24">
    <h2 className="font-display text-[30px] md:text-[36px] font-extrabold tracking-[-0.03em] text-on-surface">Compare every feature</h2>
    <div className="overflow-x-auto rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <table className="w-full min-w-[720px] text-left border-collapse text-[14px]">
        <thead>
          <tr className="bg-forest-900 text-mint font-display text-[15px]">
            <th scope="col" className="py-4 px-7 font-bold">Feature</th>
            {PLANS.map((p) => (
              <th key={p.id} scope="col" className="py-4 px-4 font-bold">{p.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON.map((g) => (
            <Fragment key={g.group}>
              <tr className="bg-neutral-50 dark:bg-neutral-950">
                <th colSpan={PLANS.length + 1} scope="colgroup" className="pt-3.5 pb-1.5 px-7 text-[12px] font-semibold tracking-[0.08em] uppercase text-neutral-500">
                  {g.group}
                </th>
              </tr>
              {g.rows.map(([feature, ...cells]) => (
                <tr key={feature} className="border-t border-neutral-100 dark:border-neutral-800">
                  <th scope="row" className="py-3.5 px-7 font-medium text-on-surface">{feature}</th>
                  {cells.map((c, i) => (
                    <td key={i} className="py-3.5 px-4 text-on-surface">
                      <Cell val={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default ComparisonTable;
