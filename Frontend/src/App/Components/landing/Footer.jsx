import { Link } from "react-router-dom";
import Logo from "../../../components/ui/Logo";

// Only routes that exist in app.route.jsx — no placeholder links.
const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Platform", to: "/platform" },
      { label: "Product", to: "/product" },
      { label: "Integrations", to: "/integrations" },
      { label: "Pricing", to: "/pricing" },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { label: "By team", to: "/solutions" },
      { label: "Book a demo", to: "/demo" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Docs", to: "/docs" },
      { label: "Support", to: "/support" },
    ],
  },
  {
    heading: "Company",
    links: [{ label: "Privacy", to: "/privacy" }],
  },
];

const Footer = () => (
  <footer className="w-full bg-forest-950 text-mint bg-[radial-gradient(800px_340px_at_50%_0%,rgba(35,83,71,0.75),rgba(5,31,32,0)_70%)]">
    <div className="max-w-[1280px] mx-auto px-6 pt-20 pb-10 flex flex-col gap-14">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <h2 className="font-display text-[34px] md:text-[44px] font-extrabold tracking-[-0.035em] leading-[1.08] max-w-[640px]">
          Your support team, calmly in control.
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/signup"
            className="h-[52px] px-6 rounded-full bg-sage text-forest-950 text-[15px] font-semibold flex items-center hover:bg-mint transition-colors"
          >
            Get started free
          </Link>
          <Link
            to="/demo"
            className="h-[52px] px-6 rounded-full border border-forest-700 text-mint text-[15px] font-semibold flex items-center hover:bg-forest-900 transition-colors"
          >
            Book a demo
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10 pt-10 border-t border-forest-800">
        <div className="md:w-[320px] flex flex-col gap-3">
          <Logo size="md" linkTo="/" onDark />
          <p className="text-[14px] leading-relaxed text-sage">The calm customer support workspace.</p>
        </div>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading} className="flex flex-col gap-2.5 text-[14px]">
              <span className="font-semibold">{col.heading}</span>
              {col.links.map((l) => (
                <Link key={l.to + l.label} to={l.to} className="text-sage hover:text-mint transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-2 text-[13px] text-[#6f9a85]">
        <span>© 2026 AideDesk</span>
        <Link to="/privacy" className="hover:text-mint transition-colors">
          Privacy
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
