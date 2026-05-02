import PricingCard from "./PricingCard";

const plans = [
  {
    tier: "Starter",
    description: "Essential tools for individuals and small projects.",
    price: "$0",
    priceLabel: "month",
    buttonText: "Get Started",
    buttonStyle:
      "bg-surface border border-outline-variant text-on-background hover:border-primary",
    features: [
      { label: "Up to 3 active projects" },
      { label: "Basic analytics dashboard" },
      { label: "Community support" },
      { label: "Custom integrations", disabled: true },
    ],
  },
  {
    tier: "Growth",
    description: "Advanced features for scaling teams and workflows.",
    price: "$49",
    priceLabel: "user/month",
    buttonText: "Start Free Trial",
    buttonStyle: "bg-primary text-on-primary hover:opacity-90",
    popular: true,
    features: [
      { label: "Unlimited projects" },
      { label: "Advanced reporting & exports" },
      { label: "Priority email support" },
      { label: "Standard API access" },
    ],
  },
  {
    tier: "Enterprise",
    description: "Custom security and control for large organizations.",
    price: "Custom",
    buttonText: "Contact Sales",
    buttonStyle:
      "bg-surface border border-outline-variant text-on-background hover:border-primary",
    features: [
      { label: "Everything in Growth" },
      { label: "SSO & Advanced Security" },
      { label: "Dedicated Account Manager" },
      { label: "On-premise deployment options" },
    ],
  },
];

const PricingGrid = () => (
  <section className="grid grid-cols-1 md:grid-cols-3 gap-[24px] max-w-5xl mx-auto mb-[64px]">
    {plans.map((plan) => (
      <PricingCard key={plan.tier} {...plan} />
    ))}
  </section>
);
export default PricingGrid;
