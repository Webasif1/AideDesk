import { useState } from "react";
import { motion } from "framer-motion";

const permissions = [
  {
    id: "delete_tickets",
    label: "Can delete tickets",
    desc: "Allows permanent removal of support tickets from the database.",
    default: false,
  },
  {
    id: "manage_kb",
    label: "Can manage KB",
    desc: "Grant access to create, edit, and publish knowledge base articles.",
    default: true,
  },
  {
    id: "billing_reports",
    label: "View billing reports",
    desc: "Access to subscription details and transaction history.",
    default: false,
  },
  {
    id: "direct_chat",
    label: "Direct customer chat",
    desc: "Enable live interaction with customers via the web widget.",
    default: true,
  },
];

const AddAgentModal = ({ onClose }) => {
  const [perms, setPerms] = useState(
    Object.fromEntries(permissions.map((p) => [p.id, p.default])),
  );

  const toggle = (id) => setPerms((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-[32px] bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="max-w-[720px] w-full bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-xl dark:shadow-none"
      >
        {/* Header */}
        <div className="px-[32px] py-[24px] border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <div>
            <h1 className="text-[24px] font-semibold text-black dark:text-white tracking-tight">
              Add New Agent
            </h1>
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-1">
              Configure basic details and access levels for your new team
              member.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-neutral-500 dark:text-neutral-400">
              close
            </span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.25 }}
          className="p-[32px] space-y-[32px]"
        >
          {/* Photo upload */}
          <div className="flex items-center gap-[24px]">
            <div className="h-[48px] w-[48px] rounded-full bg-neutral-100 dark:bg-neutral-800 border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-400 dark:text-neutral-500">
              <span className="material-symbols-outlined text-[28px]">
                add_a_photo
              </span>
            </div>
            <div>
              <button className="text-[12px] font-semibold uppercase tracking-widest text-black dark:text-white border border-neutral-200 dark:border-neutral-700 px-[16px] py-[8px] rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                Upload Photo
              </button>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-2">
                Recommended: Square JPG or PNG, max 2MB.
              </p>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-[24px]">
            {[
              {
                label: "Full Name",
                type: "text",
                placeholder: "e.g. Sarah Jenkins",
              },
              {
                label: "Work Email",
                type: "email",
                placeholder: "sarah@company.com",
              },
            ].map((f) => (
              <div key={f.label} className="flex flex-col gap-[8px]">
                <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  className="w-full h-11 px-[16px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-[14px] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            ))}

            {/* Role */}
            <div className="flex flex-col gap-[8px]">
              <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Role Selection
              </label>
              <div className="relative">
                <select className="w-full h-11 px-[16px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-[14px] focus:outline-none focus:border-black dark:focus:border-white appearance-none transition-colors">
                  <option>Agent</option>
                  <option>Lead</option>
                  <option>Admin</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  expand_more
                </span>
              </div>
            </div>

            {/* Team */}
            <div className="flex flex-col gap-[8px]">
              <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Team Assignment
              </label>
              <div className="relative">
                <select className="w-full h-11 px-[16px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-[14px] focus:outline-none focus:border-black dark:focus:border-white appearance-none transition-colors">
                  <option>Customer Support</option>
                  <option>Customer Success</option>
                  <option>Technical Support</option>
                  <option>Billing & Finance</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  groups
                </span>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="pt-[24px] border-t border-neutral-200 dark:border-neutral-700">
            <h3 className="text-[18px] font-semibold text-black dark:text-white mb-[16px]">
              Access Permissions
            </h3>
            <div className="grid grid-cols-2 gap-y-[16px] gap-x-[32px]">
              {permissions.map((p) => (
                <label
                  key={p.id}
                  className="flex items-start gap-[16px] cursor-pointer group"
                >
                  <div className="mt-1">
                    <input
                      type="checkbox"
                      checked={perms[p.id]}
                      onChange={() => toggle(p.id)}
                      className="h-4 w-4 rounded border-neutral-300 text-black focus:ring-0 cursor-pointer accent-black"
                    />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-black dark:text-white">
                      {p.label}
                    </p>
                    <p className="text-[13px] text-neutral-500 dark:text-neutral-400">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Info notice */}
          <div className="p-[16px] bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 flex gap-[8px]">
            <span className="material-symbols-outlined text-neutral-400 text-[20px] shrink-0">
              info
            </span>
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
              An invitation email will be sent to the address provided. The link
              expires in 48 hours.
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="px-[32px] py-[24px] bg-neutral-50 dark:bg-[#111] border-t border-neutral-200 dark:border-neutral-700 flex justify-end items-center gap-[16px]">
          <button
            onClick={onClose}
            className="px-[24px] py-[12px] text-[12px] font-semibold uppercase tracking-widest text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-lg"
          >
            Cancel
          </button>
          <button className="px-[24px] py-[12px] text-[12px] font-semibold uppercase tracking-widest bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 active:scale-95">
            Invite Agent
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddAgentModal;
