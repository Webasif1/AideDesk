import { motion, useReducedMotion } from "framer-motion";
import Logo from "../../../components/ui/Logo";

// A few product cards floating in soft perspective. Purely decorative, so the
// whole scene is aria-hidden; the drift stops when reduced motion is on.
// The outer div owns position and depth (translateZ); the inner motion.div
// owns the drift, so framer's transform never overwrites the 3D placement.
const Float = ({ children, delay = 0, distance = 8, className = "" }) => {
  const reduce = useReducedMotion();
  return (
    <div className={className}>
      <motion.div
        animate={reduce ? undefined : { y: [0, -distance, 0] }}
        transition={{ duration: 6, delay, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
};

const AuthLeftPanel = () => {
  return (
    <div className="hidden lg:flex w-1/2 flex-col justify-between p-[56px] relative overflow-hidden bg-forest-950 text-mint bg-[radial-gradient(560px_440px_at_78%_58%,rgba(35,83,71,0.9),rgba(5,31,32,0)_70%)]">
      <div className="z-10">
        <Logo size="md" linkTo="/" onDark />
      </div>

      <div
        aria-hidden="true"
        className="relative z-10 flex-1 my-[40px] [perspective:1200px]"
      >
        <div className="absolute inset-0 [transform:rotateX(14deg)_rotateY(-18deg)] [transform-style:preserve-3d]">
          <Float className="absolute left-[4%] top-[12%] w-[78%] max-w-[420px]">
            <div className="flex flex-col gap-[10px] p-[18px] rounded-[20px] bg-mint/[0.07] border border-mint/15 shadow-[0_30px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <span className="text-[12px] text-sage">Needs attention</span>
              <div className="flex items-center gap-[10px] px-[12px] py-[10px] rounded-xl bg-mint/[0.08]">
                <span className="w-2 h-2 rounded-full bg-[#e6c170]" />
                <span className="flex-1 text-[13px]">Unable to update billing information</span>
                <span className="text-[11px] text-[#e6c170]">1h 24m</span>
              </div>
              <div className="flex items-center gap-[10px] px-[12px] py-[10px] rounded-xl bg-mint/[0.05]">
                <span className="w-2 h-2 rounded-full bg-[#86c0cc]" />
                <span className="flex-1 text-[13px]">Export missing custom fields</span>
                <span className="text-[11px] text-sage">5h</span>
              </div>
            </div>
          </Float>
          <Float
            delay={1.5}
            distance={10}
            className="absolute left-[46%] top-[48%] w-[52%] max-w-[270px] [transform:translateZ(90px)]"
          >
            <div className="flex flex-col gap-[8px] p-[14px] rounded-[18px] bg-forest-900 border border-forest-700 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
              <div className="self-start px-[12px] py-[8px] rounded-[4px_14px_14px_14px] bg-forest-800 text-[12px]">
                It&apos;s an Amex, yes.
              </div>
              <div className="self-end px-[12px] py-[8px] rounded-[14px_4px_14px_14px] bg-sage text-forest-950 text-[12px]">
                Thanks, a fix is rolling out now.
              </div>
            </div>
          </Float>
          <Float
            delay={0.8}
            distance={6}
            className="absolute left-0 top-[62%] [transform:translateZ(140px)]"
          >
            <div className="flex items-center gap-[8px] px-[14px] py-[10px] rounded-full bg-mint text-forest-900 text-[12px] font-semibold shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              AI drafted a reply
            </div>
          </Float>
        </div>
      </div>

      <div className="z-10">
        <h1 className="font-display text-[34px] font-extrabold leading-[1.1] tracking-[-0.03em] max-w-md">
          Support that stays calm under pressure.
        </h1>
        <p className="text-sage mt-[12px] max-w-sm text-[15px] leading-relaxed">
          Tickets, live chat and customers in one workspace, with an AI copilot
          that knows when to hand over.
        </p>
      </div>
    </div>
  );
};

export default AuthLeftPanel;
