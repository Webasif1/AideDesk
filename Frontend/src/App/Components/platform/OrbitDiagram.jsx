import { motion, useReducedMotion } from "framer-motion";
import { LogoMark } from "../../../components/ui/Logo";
import { MODULES } from "./platform.data";

// Eight live modules orbiting the workspace hub on a tilted ellipse. Nodes
// nearer the viewer are slightly larger and brighter to suggest depth.
const ORBIT_IDS = ["workspace", "tickets", "chat", "portal", "ai", "analytics", "team", "integrations"];
const W = 640;
const H = 520;
const CX = W / 2;
const CY = H / 2;

const OrbitDiagram = () => {
  const reduce = useReducedMotion();
  const nodes = ORBIT_IDS.map((id, k) => {
    const m = MODULES.find((x) => x.id === id);
    const ang = (k / ORBIT_IDS.length) * Math.PI * 2 - Math.PI / 2;
    const depth = (Math.sin(ang) + 1) / 2;
    return { ...m, x: CX + Math.cos(ang) * 250, y: CY + Math.sin(ang) * 180, scale: 0.86 + depth * 0.18, opacity: 0.72 + depth * 0.28, k };
  });

  return (
    <div aria-hidden="true" className="relative w-[352px] h-[286px] sm:w-[480px] sm:h-[390px] lg:w-[640px] lg:h-[520px]">
      <div className="absolute left-0 top-0 w-[640px] h-[520px] origin-top-left scale-[0.55] sm:scale-75 lg:scale-100">
        <div className="absolute inset-0 [perspective:1600px]">
          <div className="absolute inset-0 [transform:rotateX(52deg)_rotateZ(-8deg)] [transform-style:preserve-3d]">
            <div className="absolute left-1/2 top-1/2 w-[560px] h-[560px] -ml-[280px] -mt-[280px] rounded-full border border-dashed border-sage/35" />
            <div className="absolute left-1/2 top-1/2 w-[360px] h-[360px] -ml-[180px] -mt-[180px] rounded-full border border-sage/20" />
          </div>
        </div>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="absolute inset-0">
          {nodes.map((n) => (
            <line key={n.id} x1={CX} y1={CY} x2={n.x} y2={n.y} stroke="#8EB69B" strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="3 7">
              {!reduce && <animate attributeName="stroke-dashoffset" from="0" to="-30" dur="2.2s" repeatCount="indefinite" />}
            </line>
          ))}
        </svg>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[190px] h-[76px] rounded-full bg-mint text-forest-950 flex items-center justify-center gap-2.5 font-display text-[15px] font-extrabold shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
          <LogoMark size={26} />
          Workspace
        </div>
        {nodes.map((n) => (
          <div key={n.id} className="absolute" style={{ left: n.x, top: n.y, transform: `translate(-50%, -50%) scale(${n.scale})` }}>
            <motion.div
              animate={reduce ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 6, delay: n.k * 0.6, repeat: Infinity, ease: "easeInOut" }}
              style={{ opacity: n.opacity }}
              className="flex items-center gap-2 h-11 pl-2 pr-4 rounded-full bg-forest-900/95 border border-forest-700 text-mint text-[13px] font-semibold whitespace-nowrap shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            >
              <span className="w-7 h-7 rounded-full bg-forest-800 text-sage flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">{n.icon}</span>
              </span>
              {n.name}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrbitDiagram;
