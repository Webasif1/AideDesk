const links = [
  { icon: "chat", label: "Contact Support" },
  { icon: "forum", label: "Community Forum" },
  { icon: "bug_report", label: "Report a Bug" },
];

const SupportSidebar = () => (
  <div className="lg:col-span-1">
    <div className="bg-surface-container-low border border-surface-container-highest p-[24px] rounded-lg">
      <h3 className="text-[24px] font-medium text-on-surface mb-[16px]">
        Still need help?
      </h3>
      <p className="text-[14px] text-on-surface-variant leading-relaxed mb-[32px]">
        Our engineering support team is available 24/7 on priority channels for
        Enterprise customers.
      </p>
      <div className="flex flex-col gap-[16px]">
        {links.map((l, i) => (
          <a
            key={l.label}
            href="#"
            className={`flex items-center gap-[8px] text-[14px] text-on-surface hover:text-primary transition-colors ${i < links.length - 1 ? "border-b border-surface-container-highest pb-[16px]" : ""}`}
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              {l.icon}
            </span>
            {l.label}
          </a>
        ))}
      </div>
    </div>
  </div>
);
export default SupportSidebar;
