const categories = [
  {
    icon: "rocket_launch",
    title: "Getting Started",
    desc: "Basic concepts, platform overview, and initial workspace setup.",
  },
  {
    icon: "psychology",
    title: "AI Training",
    desc: "Guides on custom models, fine-tuning, and prompt optimization.",
  },
  {
    icon: "hub",
    title: "Integrations",
    desc: "Connect AideDesk with your existing tools, databases, and APIs.",
  },
  {
    icon: "credit_card",
    title: "Billing",
    desc: "Manage your subscription, view invoices, and understand usage limits.",
  },
];

const CategoryGrid = () => (
  <section className="max-w-[1280px] mx-auto px-[24px] py-[48px] border-b border-surface-container-highest">
    <h2 className="text-[30px] font-semibold text-on-surface mb-[32px]">
      Browse by Category
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
      {categories.map((cat) => (
        <a
          key={cat.title}
          href="#"
          className="flex flex-col gap-[16px] p-[24px] bg-surface border border-surface-container-highest rounded-lg hover:border-primary transition-colors group"
        >
          <div className="w-10 h-10 flex items-center justify-center bg-surface-container-low rounded">
            <span className="material-symbols-outlined text-primary">
              {cat.icon}
            </span>
          </div>
          <div>
            <h3 className="text-[24px] font-medium text-on-surface mb-[4px] group-hover:text-primary transition-colors">
              {cat.title}
            </h3>
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              {cat.desc}
            </p>
          </div>
        </a>
      ))}
    </div>
  </section>
);
export default CategoryGrid;
