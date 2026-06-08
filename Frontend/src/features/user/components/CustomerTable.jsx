import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { SkeletonRow } from "../../../components/ui/Skeleton";
import { useUser } from "../hooks/useUser";
import { formatRelative, initialsOf, shortId } from "../../../lib/format";

const LIMIT = 10;
const cap = (s = "") => (s ? s[0].toUpperCase() + s.slice(1) : "");

const Tag = ({ label, dark }) => {
  if (dark)
    return (
      <span className="text-[10px] font-bold px-[8px] py-[2px] bg-black dark:bg-white text-white dark:text-black rounded-full">
        {label}
      </span>
    );
  return (
    <span className="text-[10px] font-bold px-[8px] py-[2px] bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-full">
      {label}
    </span>
  );
};

const CustomerTable = ({ activeTab = "All Customers" }) => {
  const { getUsers } = useUser();
  const users = useSelector((s) => s.user.users);
  const loading = useSelector((s) => s.user.loading);
  const pagination = useSelector((s) => s.user.pagination);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const userWorkspaceId = useSelector((s) => s.auth.user?.workspaceId);
  const workspaceId = activeWorkspaceId || userWorkspaceId;

  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [workspaceId]);

  useEffect(() => {
    getUsers({ page, limit: LIMIT }).catch(() => {});
  }, [getUsers, page, workspaceId]);

  const filtered = useMemo(() => {
    const list = users || [];
    if (activeTab === "Active") return list.filter((u) => u.status === "online");
    if (activeTab === "Pending Review") return list.filter((u) => !u.isVerified);
    if (activeTab === "Suspended") return list.filter((u) => u.status === "offline" && u.isVerified === false);
    return list;
  }, [users, activeTab]);

  const rows = filtered.map((u) => {
    const tags = [{ label: cap(u.status || "offline") }];
    if (!u.isVerified) tags.push({ label: "Pending" });
    return {
      key: u._id,
      name: u.name,
      id: shortId(u._id, "#C-"),
      email: u.email,
      tags,
      updated: formatRelative(u.lastLogin || u.updatedAt || u.createdAt),
      initials: initialsOf(u.name),
    };
  });

  const total = pagination?.total ?? rows.length;
  const pages = pagination?.pages ?? 1;

  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm dark:shadow-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 dark:bg-[#222] border-b border-neutral-100 dark:border-neutral-700">
              {["Name", "Email", "Tags", "Last Active", ""].map((h) => (
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
                    {activeTab === "All Customers"
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
                    <div className="flex flex-wrap gap-[4px]">
                      {c.tags.map((t) => (
                        <Tag key={t.label} {...t} />
                      ))}
                    </div>
                  </td>
                  <td className="px-[24px] py-[16px] text-[13px] text-neutral-500 dark:text-neutral-400">
                    {c.updated}
                  </td>
                  <td className="px-[24px] py-[16px] text-right">
                    <button className="text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors p-[4px] rounded-lg">
                      <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                    </button>
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
    </div>
  );
};

export default CustomerTable;
