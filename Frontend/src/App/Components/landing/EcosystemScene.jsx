import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

// Decorative 3D product visualization for the hero: a ticket queue, a live
// chat, an analytics card and an SLA chip floating at different depths.
// Each layer's position/depth lives on a wrapper; the float animation runs on
// an inner element so framer's transform never overwrites translateZ.
const Layer = ({ className, z, children, delay = 0, drift = 8 }) => {
  const reduce = useReducedMotion();
  return (
    <div className={`absolute ${className}`} style={{ transform: `translateZ(${z}px)`, transformStyle: "preserve-3d" }}>
      <motion.div
        animate={reduce ? undefined : { y: [0, -drift, 0] }}
        transition={{ duration: 6 + delay, delay, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
};

const ROWS = [
  { i: "DO", s: "SSO login loops back to sign-in", c: "Brightline Health · Urgent", sla: "18m", tone: "text-[#ee958f]" },
  { i: "SM", s: "Unable to update billing information", c: "Acme Technologies · High", sla: "1h 24m", tone: "text-[#e6c170]" },
  { i: "GK", s: "Chat widget not loading on Safari", c: "Oakridge Labs · High", sla: "2h 15m", tone: "text-[#e6c170]" },
  { i: "MT", s: "Export missing custom fields", c: "Fernhill Studio · Medium", sla: "5h 02m", tone: "text-sage" },
];

const BARS = [22, 30, 26, 38, 34, 46, 52];

const EcosystemScene = () => {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-30, -18]), { stiffness: 80, damping: 20 });
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [24, 16]), { stiffness: 80, damping: 20 });

  const onMove = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    // The stage is authored at 640×560 and scaled down on smaller screens.
    <div
      aria-hidden="true"
      className="relative w-[352px] h-[308px] sm:w-[480px] sm:h-[420px] lg:w-[640px] lg:h-[560px]"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div className="absolute left-0 top-0 w-[640px] h-[560px] origin-top-left scale-[0.55] sm:scale-75 lg:scale-100 [perspective:1800px]">
        <motion.div
          className="absolute inset-0"
          style={{ rotateX: reduce ? 20 : rotX, rotateY: reduce ? -24 : rotY, rotateZ: 5, transformStyle: "preserve-3d" }}
        >
          <Layer className="left-[40px] top-[90px] w-[500px]" z={0}>
            <div className="flex flex-col gap-2.5 p-5 rounded-[26px] bg-mint/[0.07] border border-mint/15 shadow-[0_50px_90px_rgba(0,0,0,0.45)] backdrop-blur-md text-mint">
              <div className="flex items-center gap-2.5">
                <span className="flex-1 font-display text-[15px] font-bold">Needs attention</span>
                <span className="h-[22px] px-2 rounded-full bg-[#e6c170]/15 text-[#e6c170] text-[11px] font-semibold flex items-center">3 at risk</span>
              </div>
              {ROWS.map((r) => (
                <div key={r.i} className="flex items-center gap-3 px-3.5 py-3 rounded-[14px] bg-mint/[0.06] border border-mint/[0.06]">
                  <span className="w-7 h-7 rounded-full bg-forest-800 text-sage text-[10px] font-bold flex items-center justify-center">{r.i}</span>
                  <span className="flex-1 flex flex-col gap-0.5">
                    <span className="text-[13px] font-semibold">{r.s}</span>
                    <span className="text-[11px] text-sage">{r.c}</span>
                  </span>
                  <span className={`text-[11px] font-semibold ${r.tone}`}>{r.sla}</span>
                </div>
              ))}
            </div>
          </Layer>

          <Layer className="left-[400px] top-[220px] w-[270px]" z={110} delay={1.5} drift={10}>
            <div className="flex flex-col gap-2 p-4 rounded-[22px] bg-forest-900 border border-forest-700 shadow-[0_40px_80px_rgba(0,0,0,0.5)] text-mint">
              <div className="flex items-center gap-2 text-[12px] text-sage">
                <span className="w-[7px] h-[7px] rounded-full bg-[#86cfa1]" />
                Live chat · Grace Kim
              </div>
              <div className="self-start max-w-[200px] px-3 py-2 rounded-[4px_14px_14px_14px] bg-forest-800 text-[12px] leading-snug">
                Widget won't load on Safari 17.
              </div>
              <div className="self-start max-w-[220px] flex gap-1.5 px-3 py-2 rounded-[4px_14px_14px_14px] bg-[#10332d] border border-forest-700 text-[12px] leading-snug">
                <span className="material-symbols-outlined text-[13px] text-sage">auto_awesome</span>
                Drafted a ticket for you to confirm.
              </div>
              <div className="self-end px-3 py-2 rounded-[14px_4px_14px_14px] bg-sage text-forest-950 text-[12px]">Alex here, on it.</div>
            </div>
          </Layer>

          <Layer className="left-0 top-[440px] w-[220px]" z={160} delay={3}>
            <div className="flex flex-col gap-2.5 p-4 rounded-[20px] bg-mint text-forest-950 shadow-[0_40px_80px_rgba(0,0,0,0.45)]">
              <span className="text-[12px] font-semibold">Resolved this week</span>
              <div className="flex items-end gap-1.5 h-14">
                {BARS.map((h, i) => (
                  <span key={i} className="flex-1 rounded bg-forest-700" style={{ height: h }} />
                ))}
              </div>
            </div>
          </Layer>

          <Layer className="left-[440px] top-[460px]" z={200} delay={2} drift={6}>
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-forest-900 border border-sage text-mint text-[13px] font-medium shadow-[0_30px_60px_rgba(0,0,0,0.45)] whitespace-nowrap">
              <span className="material-symbols-outlined text-[16px] text-[#e6c170]">schedule</span>
              SLA · 1h 24m remaining
            </div>
          </Layer>

          <Layer className="left-[430px] top-[40px]" z={150} delay={0.8} drift={6}>
            <div className="flex items-center p-1.5 rounded-full bg-forest-900/90 border border-forest-700 shadow-[0_24px_48px_rgba(0,0,0,0.4)]">
              {[["AM", "bg-sage text-forest-950"], ["PN", "bg-mint text-forest-900"], ["JL", "bg-forest-700 text-mint"]].map(([t, c], i) => (
                <span
                  key={t}
                  className={`w-[34px] h-[34px] rounded-full border-2 border-forest-900 text-[11px] font-bold flex items-center justify-center ${c} ${i ? "-ml-2.5" : ""}`}
                >
                  {t}
                </span>
              ))}
              <span className="pl-2.5 pr-3 text-[12px] text-[#b9d6c0]">3 agents online</span>
            </div>
          </Layer>
        </motion.div>
      </div>
    </div>
  );
};

export default EcosystemScene;
