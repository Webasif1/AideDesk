import PricingCard from "./PricingCard";
import { PLANS } from "./pricing.data";

const PricingGrid = ({ yearly }) => (
  <section aria-label="Plans" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-24">
    {PLANS.map((plan) => (
      <PricingCard key={plan.id} plan={plan} yearly={yearly} />
    ))}
  </section>
);

export default PricingGrid;
