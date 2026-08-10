// Shared account-status pill styling so the customer table, ticket rows and
// any other view referencing a customer's account agree on wording/colour.
export const ACCOUNT_PILL = {
  active: {
    label: "Active",
    className:
      "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
  },
  suspended: {
    label: "Suspended",
    className: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400",
  },
  deleted: {
    label: "Deleted",
    className: "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400",
  },
  pending: {
    label: "Pending",
    className:
      "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400",
  },
};

export const accountPillFor = (user) => {
  if (!user) return ACCOUNT_PILL.active;
  if (user.accountStatus === "deleted") return ACCOUNT_PILL.deleted;
  if (user.accountStatus === "suspended") return ACCOUNT_PILL.suspended;
  if (!user.isVerified) return ACCOUNT_PILL.pending;
  return ACCOUNT_PILL.active;
};

// Lighter variant for views (e.g. ticket rows) that only ever see
// `accountStatus`, not the full customer record — flags suspended/deleted
// only, since "pending verification" isn't derivable without `isVerified`.
export const accountFlagPill = (accountStatus) => {
  if (accountStatus === "deleted") return ACCOUNT_PILL.deleted;
  if (accountStatus === "suspended") return ACCOUNT_PILL.suspended;
  return null;
};
