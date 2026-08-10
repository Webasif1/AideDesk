import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { SkeletonRow } from "../../../components/ui/Skeleton";
import RowActionsMenu from "../../../components/ui/RowActionsMenu";
import ConfirmActionModal from "../../../components/ui/ConfirmActionModal";
import { toast } from "../../../components/ui/toast";
import { useUser } from "../hooks/useUser";
import { formatRelative, initialsOf, shortId } from "../../../lib/format";
import { accountPillFor } from "../../../lib/accountStatus";

const LIMIT = 10;

// Tab → server query. Filtering happens on the backend so the counts, the rows
// and the pagination all agree; the old client-side filter only ever saw the
// ten rows of the current page.
const TAB_QUERY = {
  "All Customers": {},
  Active: { accountStatus: "active", verified: "true" },
  Suspended: { accountStatus: "suspended" },
  "Pending Review": { accountStatus: "active", verified: "false" },
};

// The three admin actions, each rendered through the same confirm modal.
const ACTION_COPY = {
  suspend: {
    title: "Suspend this customer?",
    description:
      "They will still be able to sign in and read their tickets and conversations, but they will not be able to create tickets, send messages, or change anything until you restore them.",
    confirmLabel: "Suspend customer",
    tone: "warning",
    accountStatus: "suspended",
    success: "Customer suspended",
  },
  restore: {
    title: "Restore this customer?",
    description:
      "Full access is returned immediately. They pick up their existing tickets and conversations exactly where they left off.",
    confirmLabel: "Restore customer",
    tone: "neutral",
    accountStatus: "active",
    success: "Customer restored",
  },
  delete: {
    title: "Delete this customer?",
    description:
      "They will no longer be able to sign in. Their tickets, chats and message history are kept, so restoring the account later puts them straight back into their conversations.",
    confirmLabel: "Delete customer",
    tone: "danger",
    accountStatus: "deleted",
    success: "Customer removed",
  },
};

const CustomerTable = ({ activeTab = "All Customers" }) => {
  const { getUsers, getUserStats, updateUserAccountStatus } = useUser();
  const users = useSelector((s) => s.user.users);
  const loading = useSelector((s) => s.user.loading);
  const pagination = useSelector((s) => s.user.pagination);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const userWorkspaceId = useSelector((s) => s.auth.user?.workspaceId);
  const workspaceId = activeWorkspaceId || userWorkspaceId;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // { action: 'suspend'|'restore'|'delete', customer }
  const [pending, setPending] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Changing tab, workspace or search restarts pagination — otherwise page 3 of
  // "All" becomes an empty page 3 of "Suspended". Adjusted during render rather
  // than in an effect so the fetch below never fires once against a stale page.
  const scope = `${workspaceId}|${activeTab}|${debouncedSearch}`;
  const [prevScope, setPrevScope] = useState(scope);
  if (scope !== prevScope) {
    setPrevScope(scope);
    setPage(1);
  }

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const query = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(TAB_QUERY[activeTab] || {}),
      ...(debouncedSearch && { search: debouncedSearch }),
    }),
    [page, activeTab, debouncedSearch]
  );

  useEffect(() => {
    getUsers(query).catch(() => {});
  }, [getUsers, query, workspaceId]);

  const rows = (users || []).map((u) => ({
    key: u._id,
    raw: u,
    name: u.name,
    id: shortId(u._id, "#C-"),
    email: u.email,
    updated: formatRelative(u.lastLogin || u.updatedAt || u.createdAt),
    initials: initialsOf(u.name),
    pill: accountPillFor(u),
    isSuspended: u.accountStatus === "suspended",
  }));

  const total = pagination?.total ?? rows.length;
  const pages = pagination?.pages ?? 1;

  const copy = pending ? ACTION_COPY[pending.action] : null;

  const runAction = async (reason) => {
    if (!pending || !copy) return;
    setSubmitting(true);
    setModalError("");
    try {
      const res = await updateUserAccountStatus({
        id: pending.customer._id,
        accountStatus: copy.accountStatus,
        reason,
      });
      toast(
        res?.emailed ? `${copy.success} — they were emailed the reason.` : copy.success,
        { type: "success" }
      );
      setPending(null);
      // Counts and the current page both shift, so refresh both.
      getUsers(query).catch(() => {});
      getUserStats().catch(() => {});
    } catch (err) {
      setModalError(
        err?.response?.data?.message || err?.message || "That didn't work. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm dark:shadow-none">
      {/* Page-specific search — the global one in the header was decorative */}
      <div className="px-[24px] py-[14px] border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-700 rounded-lg px-[12px] py-[7px] gap-[8px] max-w-[360px] focus-within:border-black dark:focus-within:border-white transition-colors">
          <span className="material-symbols-outlined text-neutral-400 text-[18px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name or email…"
            className="bg-transparent text-[13px] text-black dark:text-white outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600 w-full"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 dark:bg-[#222] border-b border-neutral-100 dark:border-neutral-700">
              {["Name", "Email", "Account", "Last Active", ""].map((h) => (
                <th
                  key={h}
                  className="px-[24px] py-[16px] text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
            {loading && rows.length === 0 ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-0 py-0">
                    <SkeletonRow />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-[24px] py-16 text-center">
                  <span className="material-symbols-outlined text-[40px] text-neutral-300 dark:text-neutral-700 block mb-2">
                    group_off
                  </span>
                  <p className="text-[14px] font-semibold text-neutral-600 dark:text-neutral-300">
                    No customers to show
                  </p>
                  <p className="text-[12px] text-neutral-400 mt-1">
                    {debouncedSearch
                      ? `Nothing matches "${debouncedSearch}".`
                      : activeTab === "All Customers"
                        ? "Add a customer to get started."
                        : `No customers match "${activeTab}".`}
                  </p>
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr
                  key={c.key}
                  className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800 transition-colors group"
                >
                  <td className="px-[24px] py-[16px]">
                    <div className="flex items-center gap-[12px]">
                      <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-700 border border-neutral-100 dark:border-neutral-600 flex items-center justify-center text-[11px] font-bold text-neutral-500 dark:text-neutral-300 shrink-0">
                        {c.initials}
                      </div>
                      <div>
                        <span className="text-[13px] font-semibold text-black dark:text-white hover:underline cursor-pointer">
                          {c.name}
                        </span>
                        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-[24px] py-[16px] text-[13px] text-neutral-600 dark:text-neutral-400">
                    {c.email}
                  </td>
                  <td className="px-[24px] py-[16px]">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-[8px] py-[3px] rounded-full ${c.pill.className}`}
                    >
                      {c.pill.label}
                    </span>
                  </td>
                  <td className="px-[24px] py-[16px] text-[13px] text-neutral-500 dark:text-neutral-400">
                    {c.updated}
                  </td>
                  <td className="px-[24px] py-[16px] text-right">
                    <RowActionsMenu
                      label={`Actions for ${c.name}`}
                      items={[
                        c.isSuspended
                          ? {
                              label: "Restore access",
                              icon: "lock_open",
                              onSelect: () =>
                                setPending({ action: "restore", customer: c.raw }),
                            }
                          : {
                              label: "Suspend customer",
                              icon: "pause_circle",
                              onSelect: () =>
                                setPending({ action: "suspend", customer: c.raw }),
                            },
                        {
                          label: "Delete customer",
                          icon: "delete",
                          tone: "danger",
                          onSelect: () =>
                            setPending({ action: "delete", customer: c.raw }),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-[24px] py-[16px] bg-neutral-50/30 dark:bg-[#111] border-t border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
        <p className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
          {total === 0
            ? "No customers"
            : `Page ${pagination?.page ?? page} of ${pages} • ${total.toLocaleString()} customers`}
        </p>
        <div className="flex items-center gap-[8px]">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-[6px] border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-white dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className="p-[6px] border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-white dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      <ConfirmActionModal
        open={Boolean(pending)}
        title={copy?.title}
        description={copy?.description}
        entityName={
          pending ? `${pending.customer.name} · ${pending.customer.email}` : ""
        }
        confirmLabel={copy?.confirmLabel}
        tone={copy?.tone}
        loading={submitting}
        error={modalError}
        onCancel={() => {
          setPending(null);
          setModalError("");
        }}
        onConfirm={runAction}
      />
    </div>
  );
};

export default CustomerTable;
