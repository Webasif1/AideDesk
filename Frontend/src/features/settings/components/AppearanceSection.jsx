import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { setTheme } from "../../theme/state/theme.slice";

// Theme preference. The quick switch lives in the top bar; this is the explicit
// setting for people who look for it here.
const OPTIONS = [
  {
    value: "light",
    label: "Light",
    icon: "light_mode",
    description: "Bright surfaces, dark text.",
  },
  {
    value: "dark",
    label: "Dark",
    icon: "dark_mode",
    description: "Dimmed surfaces, easier at night.",
  },
];

const AppearanceSection = () => {
  const dispatch = useDispatch();
  const mode = useSelector((s) => s.theme.mode);

  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
      <div className="px-[24px] py-[20px] border-b border-neutral-100 dark:border-neutral-800">
        <h3 className="text-[16px] font-semibold text-black dark:text-white">
          Appearance
        </h3>
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-[2px]">
          Choose how AideDesk looks on this device. Saved locally.
        </p>
      </div>

      <div className="p-[24px] grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
        {OPTIONS.map((option) => {
          const isActive = mode === option.value;
          return (
            <motion.button
              key={option.value}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => dispatch(setTheme(option.value))}
              aria-pressed={isActive}
              className={`text-left p-[16px] rounded-xl border transition-colors flex items-start gap-[12px] ${
                isActive
                  ? "border-black dark:border-white bg-neutral-50 dark:bg-neutral-800"
                  : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] shrink-0 ${
                  isActive
                    ? "text-black dark:text-white"
                    : "text-neutral-400 dark:text-neutral-500"
                }`}
              >
                {option.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-[8px]">
                  <p className="text-[14px] font-semibold text-black dark:text-white">
                    {option.label}
                  </p>
                  {isActive && (
                    <span className="material-symbols-outlined text-[18px] text-black dark:text-white">
                      check_circle
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-[2px]">
                  {option.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default AppearanceSection;
