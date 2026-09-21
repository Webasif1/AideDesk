import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import Logo from "../../../components/ui/Logo";

const baseItems = [
  { label: "Dashboard", icon: "dashboard", path: "/dashboard", roles: ["admin", "agent", "customer"] },
  { label: "Customers", icon: "group", path: "/dashboard/customers", roles: ["admin"] },
  { label: "Tickets", icon: "confirmation_number", path: "/dashboard/tickets", roles: ["admin", "agent", "customer"] },
  { label: "Chat", icon: "chat_bubble_outline", path: "/dashboard/chat", roles: ["admin", "agent", "customer"] },
  { label: "Team", icon: "badge", path: "/dashboard/team", roles: ["admin"] },
  { label: "Settings", icon: "settings", path: "/dashboard/settings", roles: ["admin", "customer"] },
];

// The rail is forest green in both themes; it is the one surface that anchors
// the brand inside the app, so it does not follow the light/dark switch.
const Sidebar = () => {
  const role = useSelector((s) => s.auth.role);
  // Reflects the real-time connection rather than always claiming green.
  const socketConnected = useSelector((s) => s.socket.connected);
  const navItems = baseItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="fixed h-screen w-64 left-0 top-0 border-r border-forest-900 dark:border-forest-800 bg-forest-900 dark:bg-[#041819] z-50 flex flex-col px-[16px] py-[22px]">
      {/* Logo */}
      <div className="mb-[28px] px-[10px]">
        <Logo onDark />
      </div>

      {/* Nav */}
      <nav aria-label="Main navigation" className="flex-1 flex flex-col gap-[2px]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-[12px] px-[14px] h-[42px] rounded-xl text-[14px] font-medium transition-colors duration-150 active:scale-[0.98] focus-visible:outline-sage ${
                isActive
                  ? "bg-forest-700 dark:bg-forest-800 text-mint font-semibold"
                  : "text-[#a9c9b3] hover:bg-forest-800 dark:hover:bg-forest-900 hover:text-mint"
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: status */}
      <div className="flex items-center gap-[10px] px-[14px] py-[12px] rounded-xl bg-forest-800 dark:bg-forest-900 text-[12px] text-[#a9c9b3]">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            socketConnected
              ? "bg-sage shadow-[0_0_0_4px_rgba(142,182,155,0.18)] animate-pulse"
              : "bg-neutral-500"
          }`}
        />
        <span className="font-medium">
          {socketConnected ? "Live updates connected" : "Reconnecting…"}
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
