import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import Logo from "../../../components/ui/Logo";

const baseItems = [
  { label: "Dashboard", icon: "dashboard", path: "/dashboard", roles: ["admin", "agent"] },
  { label: "Customers", icon: "group", path: "/dashboard/customers", roles: ["admin"] },
  { label: "Tickets", icon: "confirmation_number", path: "/dashboard/tickets", roles: ["admin", "agent", "customer"] },
  { label: "Chat", icon: "chat_bubble_outline", path: "/dashboard/chat", roles: ["admin", "agent", "customer"] },
  { label: "Team", icon: "badge", path: "/dashboard/team", roles: ["admin"] },
  { label: "Settings", icon: "settings", path: "/dashboard/settings", roles: ["admin"] },
];

const Sidebar = () => {
  const role = useSelector((s) => s.auth.role);
  const navItems = baseItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="fixed h-screen w-64 left-0 top-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 z-50 flex flex-col px-[24px] py-[24px]">
      {/* Logo */}
      <div className="mb-[32px] px-[8px]">
        <Logo />
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-[4px]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-[12px] px-[16px] py-[12px] rounded-xl text-[14px] font-medium tracking-tight transition-all duration-200 active:scale-[0.98] ${
                isActive
                  ? "bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white font-semibold"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white"
              }`
            }
          >
            <span className="material-symbols-outlined text-[22px]">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: status */}
      <div className="pt-[24px] border-t border-neutral-100 dark:border-neutral-800">
        <div className="bg-neutral-50 dark:bg-neutral-900 p-[16px] rounded-xl border border-neutral-100 dark:border-neutral-800">
          <p className="text-[10px] font-semibold text-neutral-400 mb-[8px] uppercase tracking-wider">
            System Status
          </p>
          <div className="flex items-center gap-[8px]">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200">All systems normal</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
