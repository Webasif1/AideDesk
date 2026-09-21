// Each item maps to something the backend actually does (see the security
// commits: verified sign-up, socket room authorization and session revocation,
// helmet + rate limiting, sanitized attachments). Keep it that way.
const ITEMS = [
  { title: "Role-based access", body: "Admins, agents and customers each see only what their role allows." },
  { title: "Live session revocation", body: "Remove a teammate and their open sessions end immediately." },
  { title: "Verified sign-up", body: "Email verification before an account can be used." },
  { title: "Hardened by default", body: "Security headers, rate limiting, and attachments checked before anyone opens them." },
];

const SecuritySection = () => (
  <section className="px-4 md:px-6 pb-24">
    <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-10 lg:gap-20 px-7 py-14 md:px-16 md:py-20 rounded-[36px] bg-forest-900 text-mint">
      <div className="lg:w-[420px] shrink-0 flex flex-col gap-4">
        <span className="w-14 h-14 rounded-2xl bg-forest-700 flex items-center justify-center">
          <span className="material-symbols-outlined text-[28px]">shield</span>
        </span>
        <h2 className="font-display text-[32px] md:text-[40px] font-extrabold tracking-[-0.03em] leading-[1.1]">Security that doesn't slow support down.</h2>
        <p className="text-[16px] leading-relaxed text-[#b9d6c0]">Access is scoped by role, sessions can be ended instantly, and customer files are checked before anyone opens them.</p>
      </div>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ITEMS.map((it) => (
          <div key={it.title} className="flex flex-col gap-2 p-6 rounded-[20px] bg-forest-950 border border-forest-800">
            <span className="text-[16px] font-semibold">{it.title}</span>
            <span className="text-[14px] leading-relaxed text-sage">{it.body}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SecuritySection;
