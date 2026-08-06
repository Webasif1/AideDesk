import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../../auth/hooks/useAuth";
import { useUser } from "../../user/hooks/useUser";
import { toast } from "../../../components/ui/toast";
import ThemeToggleButton from "../../../components/ui/ThemeToggleButton";
import {
  selectIsReadOnly,
  selectSuspensionReason,
} from "../../auth/state/auth.slice";

const STATUS_META = {
  online: { label: "Online", color: "bg-emerald-500", text: "text-emerald-600" },
  away: { label: "Away", color: "bg-amber-400", text: "text-amber-500" },
  offline: { label: "Offline", color: "bg-neutral-400", text: "text-neutral-400" },
};

const ROLE_LABEL = {
  admin: "Administrator",
  agent: "Agent",
  customer: "Customer",
};

const initialsFromName = (name) =>
  (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "U";

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
  const { handleLogout, getMe } = useAuth();
  const { updateMe } = useUser();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [readNotifs, setReadNotifs] = useState(new Set());
  const [savingStatus, setSavingStatus] = useState(false);

  const tickets = useSelector((state) => state.ticket.tickets || []);
  const user = useSelector((state) => state.auth.user);
  const role = useSelector((state) => state.auth.role);
  const isReadOnly = useSelector(selectIsReadOnly);
  const suspensionReason = useSelector(selectSuspensionReason);

  const isCustomer = role === "customer";

  // Real profile values (fall back gracefully while hydrating)
  const displayName = user?.fullName || user?.name || "User";
  const email = user?.email || "";
  const roleLabel = ROLE_LABEL[role] || "Member";
  const initials = initialsFromName(displayName);
  const profileImage = user?.profileImage;

  // Status driven by the real user value. Customers are limited to online/offline.
  const [status, setStatus] = useState(user?.status || "online");
  useEffect(() => {
    if (user?.status) setStatus(user.status);
  }, [user?.status]);

  const statusValues = isCustomer
    ? ["online", "offline"]
    : ["online", "away", "offline"];
  const currentStatus = STATUS_META[status] || STATUS_META.online;

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useClickOutside(notifRef, () => setNotifOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));

  const notifs = tickets.slice(0, 5).map((t) => {
    const isAssignedToMe = (t.assignedAgent?._id || t.assignedAgent) === user?.id;

    return {
      id: t._id,
      icon: "confirmation_number",
      title: isAssignedToMe ? "Ticket assigned to you" : "New ticket",
      desc: `Ticket "${t.title}" is currently ${t.status}.`,
      time: new Date(t.createdAt).toLocaleDateString(),
      unread: !readNotifs.has(t._id),
    };
  });

  const unreadCount = notifs.filter((n) => n.unread).length;

  const markAllRead = () => {
    const allIds = notifs.map((n) => n.id);
    setReadNotifs(new Set([...readNotifs, ...allIds]));
  };

  const markRead = (id) => {
    setReadNotifs(new Set([...readNotifs, id]));
  };

  const handleStatusChange = async (val) => {
    if (val === status) {
      setProfileOpen(false);
      return;
    }
    // Changing status is a write, which a suspended account cannot make. Stop
    // here rather than letting the optimistic update flash and then revert.
    if (isReadOnly) {
      setProfileOpen(false);
      toast("Your account is suspended — this is view-only.", { type: "error" });
      return;
    }
    const prev = status;
    setStatus(val); // optimistic
    setProfileOpen(false);

    // Only customers persist status here (backend PATCH /api/users/me).
    if (!isCustomer) return;

    setSavingStatus(true);
    try {
      await updateMe({ status: val });
      await getMe({ silent: true }).catch(() => {});
    } catch {
      setStatus(prev); // revert on failure
      toast("Couldn't update status.", { type: "error" });
    } finally {
      setSavingStatus(false);
    }
  };

  const onLogout = async () => {
    setProfileOpen(false);
    await handleLogout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-[#111]/80 backdrop-blur-md flex justify-between items-center h-16 px-[32px]">
      {/* Left: read-only notice for suspended accounts, otherwise nothing.
          The global search that used to live here was decorative — it had no
          handler at all. Pages that need search now carry their own. */}
      <div className="flex items-center min-w-0">
        {isReadOnly && (
          <div className="flex items-center gap-[8px] px-[12px] py-[6px] bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-lg max-w-[560px]">
            <span className="material-symbols-outlined text-amber-500 text-[18px] shrink-0">
              lock
            </span>
            <p className="text-[12px] text-amber-700 dark:text-amber-400 truncate">
              <span className="font-semibold">View-only —</span> your account is
              suspended{suspensionReason ? `: ${suspensionReason}` : "."}
            </p>
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-[16px]">
        <div className="flex items-center gap-[4px]">
          <ThemeToggleButton />

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
              <div className="absolute right-0 top-[calc(100%+8px)] w-[360px] bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in">
                {/* Header */}
                <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    <h3 className="text-[14px] font-semibold text-black dark:text-white">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-[1px]">
                        {unreadCount} unread
                      </p>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-[340px] overflow-y-auto divide-y divide-neutral-50 dark:divide-neutral-800">
                  {notifs.length === 0 && (
                    <div className="px-[20px] py-[24px] text-center text-[12px] text-neutral-400">
                      No notifications yet.
                    </div>
                  )}
                  {notifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`flex items-start gap-[12px] px-[20px] py-[14px] cursor-pointer transition-colors ${
                        n.unread
                          ? "bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          n.unread
                            ? "bg-black dark:bg-white text-white dark:text-black"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400"
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
                              ? "font-semibold text-black dark:text-white"
                              : "text-neutral-600 dark:text-neutral-300"
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
                        <div className="w-2 h-2 rounded-full bg-black dark:bg-white shrink-0 mt-[6px]" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-neutral-100 dark:border-neutral-800 px-[20px] py-[12px]">
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      navigate("/dashboard/tickets");
                    }}
                    className="w-full text-[12px] font-semibold text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors text-center"
                  >
                    View all tickets
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
                {displayName}
              </p>
              <p
                className={`text-[11px] leading-tight font-medium ${currentStatus.text}`}
              >
                {currentStatus.label}
              </p>
            </div>

            {/* Avatar with status dot */}
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border border-neutral-200 group-hover:border-neutral-400 transition-colors overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[13px] font-bold text-white">
                    {initials}
                  </span>
                )}
              </div>
              {/* Status badge on avatar */}
              <span
                className={`absolute -bottom-[3px] -right-[3px] w-[13px] h-[13px] rounded-full border-2 border-white ${currentStatus.color}`}
              />
            </div>
          </div>

          {/* Profile dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] w-[240px] bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in">
              {/* Profile summary */}
              <div className="px-[16px] py-[14px] border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-[12px]">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-black dark:bg-neutral-700 flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[13px] font-bold text-white">
                        {initials}
                      </span>
                    )}
                  </div>
                  <span
                    className={`absolute -bottom-[3px] -right-[3px] w-[13px] h-[13px] rounded-full border-2 border-white dark:border-[#1a1a1a] ${currentStatus.color}`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-black dark:text-white leading-tight truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight truncate">
                    {email || roleLabel}
                  </p>
                </div>
              </div>

              {/* Status selector */}
              <div className="px-[12px] py-[10px] border-b border-neutral-100 dark:border-neutral-800">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-[8px] px-[4px]">
                  Status
                </p>
                {statusValues.map((val) => {
                  const opt = STATUS_META[val];
                  return (
                    <button
                      key={val}
                      onClick={() => handleStatusChange(val)}
                      disabled={savingStatus || isReadOnly}
                      className={`w-full flex items-center gap-[10px] px-[8px] py-[8px] rounded-lg text-left transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                        status === val
                          ? "bg-neutral-100 dark:bg-neutral-800"
                          : "hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                      }`}
                    >
                      <span
                        className={`w-[10px] h-[10px] rounded-full shrink-0 ${opt.color}`}
                      />
                      <span
                        className={`text-[13px] font-medium ${
                          status === val
                            ? "text-black dark:text-white"
                            : "text-neutral-600 dark:text-neutral-300"
                        }`}
                      >
                        {opt.label}
                      </span>
                      {status === val && (
                        <span className="material-symbols-outlined text-[16px] text-black dark:text-white ml-auto">
                          check
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="px-[12px] py-[8px] border-b border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/dashboard/settings");
                  }}
                  className="w-full flex items-center gap-[10px] px-[8px] py-[8px] rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-neutral-400">
                    manage_accounts
                  </span>
                  <span className="text-[13px] text-neutral-700 dark:text-neutral-300">
                    Profile Settings
                  </span>
                </button>
              </div>

              {/* Logout */}
              <div className="px-[12px] py-[8px]">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-[10px] px-[8px] py-[8px] rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-left transition-colors group/logout"
                >
                  <span className="material-symbols-outlined text-[18px] text-neutral-400 group-hover/logout:text-red-500 transition-colors">
                    logout
                  </span>
                  <span className="text-[13px] text-neutral-700 dark:text-neutral-300 group-hover/logout:text-red-600 dark:group-hover/logout:text-red-400 transition-colors">
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
