import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const notifications = [
  {
    id: 1,
    icon: "confirmation_number",
    title: "New ticket assigned",
    desc: "Ticket #AD-4521 assigned to you by Sarah J.",
    time: "2 min ago",
    unread: true,
  },
  {
    id: 2,
    icon: "psychology",
    title: "AI resolved a ticket",
    desc: "AideBot resolved 'Resetting User Password' automatically.",
    time: "14 min ago",
    unread: true,
  },
  {
    id: 3,
    icon: "person_add",
    title: "New agent joined",
    desc: "Emma Walsh accepted your team invitation.",
    time: "1 hr ago",
    unread: true,
  },
  {
    id: 4,
    icon: "sentiment_satisfied",
    title: "CSAT score updated",
    desc: "Your team's satisfaction score rose to 98%.",
    time: "3 hr ago",
    unread: false,
  },
  {
    id: 5,
    icon: "warning",
    title: "High ticket volume",
    desc: "Queue exceeded 50 open tickets in the last hour.",
    time: "5 hr ago",
    unread: false,
  },
];

const statusOptions = [
  { value: "online", label: "Online", color: "bg-emerald-500" },
  { value: "away", label: "Away", color: "bg-amber-400" },
  { value: "offline", label: "Offline", color: "bg-neutral-400" },
];

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

const TopBar = () => {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [status, setStatus] = useState("online");
  const [notifs, setNotifs] = useState(notifications);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useClickOutside(notifRef, () => setNotifOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));

  const unreadCount = notifs.filter((n) => n.unread).length;
  const currentStatus = statusOptions.find((s) => s.value === status);

  const markAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));

  const markRead = (id) =>
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );

  const handleStatusChange = (val) => {
    setStatus(val);
    setProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-[#111]/80 backdrop-blur-md flex justify-between items-center h-16 px-[32px]">
      {/* Search */}
      <div className="flex items-center bg-surface-container-low dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-lg px-[12px] py-[6px] w-96 transition-all focus-within:border-black dark:focus-within:border-white gap-[8px]">
        <span className="material-symbols-outlined text-neutral-400 text-[20px]">
          search
        </span>
        <input
          className="bg-transparent border-none focus:ring-0 text-[13px] w-full font-['Inter'] outline-none text-black dark:text-white placeholder:text-neutral-400"
          placeholder="Search tickets, agents, or knowledge..."
          type="text"
        />
        <span className="text-[10px] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 px-[6px] py-[2px] rounded text-neutral-400 font-mono shrink-0">
          ⌘K
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-[16px]">
        <div className="flex items-center gap-[4px]">
          {/* ── Notifications ── */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotifOpen((v) => !v);
                setProfileOpen(false);
              }}
              className="p-[8px] text-neutral-500 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors relative"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-[7px] right-[7px] w-[18px] h-[18px] bg-black dark:bg-white rounded-full border-2 border-white dark:border-neutral-950 flex items-center justify-center">
                  <span className="text-white dark:text-black text-[9px] font-bold leading-none">
                    {unreadCount}
                  </span>
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-[360px] bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in">
                {/* Header */}
                <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-neutral-100">
                  <div>
                    <h3 className="text-[14px] font-semibold text-black">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <p className="text-[11px] text-neutral-500 mt-[1px]">
                        {unreadCount} unread
                      </p>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-semibold text-neutral-500 hover:text-black transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-[340px] overflow-y-auto divide-y divide-neutral-50">
                  {notifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`flex items-start gap-[12px] px-[20px] py-[14px] cursor-pointer transition-colors ${
                        n.unread
                          ? "bg-neutral-50 hover:bg-neutral-100"
                          : "hover:bg-neutral-50"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          n.unread
                            ? "bg-black text-white"
                            : "bg-neutral-100 text-neutral-400"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {n.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[13px] leading-tight mb-[2px] ${
                            n.unread
                              ? "font-semibold text-black"
                              : "text-neutral-600"
                          }`}
                        >
                          {n.title}
                        </p>
                        <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2">
                          {n.desc}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-[4px]">
                          {n.time}
                        </p>
                      </div>
                      {n.unread && (
                        <div className="w-2 h-2 rounded-full bg-black shrink-0 mt-[6px]" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-neutral-100 px-[20px] py-[12px]">
                  <button className="w-full text-[12px] font-semibold text-neutral-500 hover:text-black transition-colors text-center">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Help ── */}
          <button
            onClick={() => navigate("/support")}
            className="p-[8px] text-neutral-500 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            title="Help & Support"
          >
            <span className="material-symbols-outlined">help_outline</span>
          </button>

          {/* ── Chat ── */}
          <button
            onClick={() => navigate("/dashboard/chat")}
            className="p-[8px] text-neutral-500 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            title="Live Chats"
          >
            <span className="material-symbols-outlined">
              chat_bubble_outline
            </span>
          </button>
        </div>

        <div className="h-8 w-[1px] bg-neutral-200 dark:bg-neutral-800" />

        {/* ── Profile ── */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
            }}
            className="flex items-center gap-[12px] cursor-pointer group select-none"
          >
            <div className="text-right">
              <p className="text-[13px] font-semibold leading-tight text-black dark:text-white">
                Alex Sterling
              </p>
              <p
                className={`text-[11px] leading-tight font-medium ${
                  status === "online"
                    ? "text-emerald-600"
                    : status === "away"
                      ? "text-amber-500"
                      : "text-neutral-400"
                }`}
              >
                {currentStatus.label}
              </p>
            </div>

            {/* Avatar with status dot */}
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border border-neutral-200 group-hover:border-neutral-400 transition-colors">
                <span className="text-[13px] font-bold text-white">AS</span>
              </div>
              {/* Status badge on avatar */}
              <span
                className={`absolute -bottom-[3px] -right-[3px] w-[13px] h-[13px] rounded-full border-2 border-white ${currentStatus.color}`}
              />
            </div>
          </div>

          {/* Profile dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] w-[240px] bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in">
              {/* Profile summary */}
              <div className="px-[16px] py-[14px] border-b border-neutral-100 flex items-center gap-[12px]">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                    <span className="text-[13px] font-bold text-white">AS</span>
                  </div>
                  <span
                    className={`absolute -bottom-[3px] -right-[3px] w-[13px] h-[13px] rounded-full border-2 border-white ${currentStatus.color}`}
                  />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-black leading-tight">
                    Alex Sterling
                  </p>
                  <p className="text-[11px] text-neutral-500 leading-tight">
                    Administrator
                  </p>
                </div>
              </div>

              {/* Status selector */}
              <div className="px-[12px] py-[10px] border-b border-neutral-100">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-[8px] px-[4px]">
                  Status
                </p>
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    className={`w-full flex items-center gap-[10px] px-[8px] py-[8px] rounded-lg text-left transition-all ${
                      status === opt.value
                        ? "bg-neutral-100"
                        : "hover:bg-neutral-50"
                    }`}
                  >
                    <span
                      className={`w-[10px] h-[10px] rounded-full shrink-0 ${opt.color}`}
                    />
                    <span
                      className={`text-[13px] font-medium ${
                        status === opt.value ? "text-black" : "text-neutral-600"
                      }`}
                    >
                      {opt.label}
                    </span>
                    {status === opt.value && (
                      <span className="material-symbols-outlined text-[16px] text-black ml-auto">
                        check
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="px-[12px] py-[8px] border-b border-neutral-100">
                <button className="w-full flex items-center gap-[10px] px-[8px] py-[8px] rounded-lg hover:bg-neutral-50 text-left transition-colors">
                  <span className="material-symbols-outlined text-[18px] text-neutral-400">
                    manage_accounts
                  </span>
                  <span className="text-[13px] text-neutral-700">
                    Profile Settings
                  </span>
                </button>
                <button className="w-full flex items-center gap-[10px] px-[8px] py-[8px] rounded-lg hover:bg-neutral-50 text-left transition-colors">
                  <span className="material-symbols-outlined text-[18px] text-neutral-400">
                    keyboard_alt
                  </span>
                  <span className="text-[13px] text-neutral-700">
                    Keyboard Shortcuts
                  </span>
                </button>
              </div>

              {/* Logout */}
              <div className="px-[12px] py-[8px]">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full flex items-center gap-[10px] px-[8px] py-[8px] rounded-lg hover:bg-red-50 text-left transition-colors group/logout"
                >
                  <span className="material-symbols-outlined text-[18px] text-neutral-400 group-hover/logout:text-red-500 transition-colors">
                    logout
                  </span>
                  <span className="text-[13px] text-neutral-700 group-hover/logout:text-red-600 transition-colors">
                    Log out
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes animateIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: animateIn 0.15s ease-out forwards;
        }
      `}</style>
    </header>
  );
};

export default TopBar;
