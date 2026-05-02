const links = [
  { href: '#data-collection', label: 'Data Collection & Security', active: true },
  { href: '#ai-ethics',       label: 'AI & Machine Learning Ethics' },
  { href: '#third-party',     label: 'Third-Party Integrations' },
  { href: '#user-rights',     label: 'Your Rights & Control' },
];

const PrivacySidebar = () => (
  <aside className="w-full md:w-64 flex-shrink-0 hidden md:block">
    <div className="sticky top-[80px] flex flex-col gap-[16px]">
      <span className="text-[12px] font-semibold tracking-widest uppercase text-on-surface-variant">
        Contents
      </span>
      <nav className="flex flex-col gap-[8px] border-l border-surface-variant">
        {links.map((l) => (
          <a key={l.href} href={l.href}
            className={`text-[14px] pl-[16px] hover:text-primary transition-colors ${l.active ? 'text-on-surface font-semibold border-l-2 border-primary -ml-[1px]' : 'text-on-surface-variant'}`}>
            {l.label}
          </a>
        ))}
      </nav>
    </div>
  </aside>
);
export default PrivacySidebar;