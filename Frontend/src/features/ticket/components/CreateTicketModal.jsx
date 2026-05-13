import { useState } from "react";
import { motion } from "framer-motion";

const priorities = ["Low", "Normal", "High"];

const resources = [
  { title: "Resetting user passwords", meta: "Technical • 2m read" },
  { title: "Billing FAQ", meta: "Finance • 5m read" },
];

const history = [
  { id: "TICKET-2041", date: "Oct 24", status: "Closed", active: true },
  { id: "TICKET-1982", date: "Aug 05", status: "Resolved", active: false },
];

const CreateTicketModal = ({ onClose }) => {
  const [priority, setPriority] = useState("Normal");

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
        className="max-w-[840px] w-full bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-xl dark:shadow-none"
      >
        {/* Header */}
        <div className="px-[32px] py-[24px] border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <div>
            <h1 className="text-[24px] font-semibold text-black dark:text-white tracking-tight">
              Create New Ticket
            </h1>
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-1">
              Fill in the details below to log a new support request.
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

        <div className="flex">
          {/* Main form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.25 }}
            className="flex-1 p-[32px] space-y-[24px] border-r border-neutral-200 dark:border-neutral-700"
          >
            <div className="grid grid-cols-2 gap-[24px]">
              {/* Customer search */}
              <div className="flex flex-col gap-[8px]">
                <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  Customer
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search customer..."
                    className="w-full h-11 pl-10 pr-[16px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-[14px] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[20px]">
                    search
                  </span>
                </div>
              </div>

              {/* Channel */}
              <div className="flex flex-col gap-[8px]">
                <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  Channel
                </label>
                <div className="relative">
                  <select className="w-full h-11 px-[16px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-[14px] focus:outline-none focus:border-black dark:focus:border-white appearance-none transition-colors">
                    <option>Email</option>
                    <option>Chat</option>
                    <option>Phone</option>
                    <option>Portal</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-[8px]">
              <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Subject
              </label>
              <input
                type="text"
                placeholder="Brief summary of the issue"
                className="w-full h-11 px-[16px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-[14px] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>

            {/* Priority pills */}
            <div className="flex flex-col gap-[8px]">
              <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Priority
              </label>
              <div className="flex gap-[16px]">
                {priorities.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 px-4 border rounded-lg text-[13px] font-medium transition-all ${
                      priority === p
                        ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                        : "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-[8px]">
              <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Description
              </label>
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                <div className="flex items-center gap-4 px-4 py-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#222]">
                  {[
                    "format_bold",
                    "format_italic",
                    "format_list_bulleted",
                    "link",
                    "image",
                  ].map((icon) => (
                    <span
                      key={icon}
                      className="material-symbols-outlined text-[18px] text-neutral-400 cursor-pointer hover:text-black dark:hover:text-white transition-colors"
                    >
                      {icon}
                    </span>
                  ))}
                </div>
                <textarea
                  className="w-full px-[16px] py-[16px] bg-neutral-50 dark:bg-[#111] text-black dark:text-white text-[14px] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none resize-none min-h-[140px] border-none"
                  placeholder="Provide detailed information about the request..."
                />
              </div>
            </div>
          </motion.div>

          {/* Right sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.25 }}
            className="w-64 bg-neutral-50 dark:bg-[#111] p-[16px] space-y-[24px]"
          >
            {/* Resources */}
            <div className="space-y-[12px]">
              <h2 className="text-[12px] font-semibold uppercase tracking-widest text-black dark:text-white border-b border-neutral-200 dark:border-neutral-700 pb-2 flex items-center justify-between">
                Resources
                <span className="material-symbols-outlined text-[16px] text-neutral-400">
                  auto_awesome
                </span>
              </h2>
              <div className="space-y-[8px]">
                {resources.map((r) => (
                  <div
                    key={r.title}
                    className="p-3 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-lg cursor-pointer hover:border-black dark:hover:border-white transition-colors"
                  >
                    <p className="text-[13px] font-semibold text-black dark:text-white">
                      {r.title}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      {r.meta}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            <div className="space-y-[12px] pt-[16px] border-t border-neutral-200 dark:border-neutral-700">
              <h2 className="text-[12px] font-semibold uppercase tracking-widest text-black dark:text-white border-b border-neutral-200 dark:border-neutral-700 pb-2">
                History
              </h2>
              <div className="space-y-[16px]">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="relative pl-6 border-l border-neutral-200 dark:border-neutral-700"
                  >
                    <div
                      className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${
                        h.active ? "bg-black dark:bg-white" : "bg-neutral-300 dark:bg-neutral-600"
                      }`}
                    />
                    <p className="text-[12px] font-semibold text-black dark:text-white">
                      {h.id}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      {h.date} • {h.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>

        {/* Footer */}
        <div className="px-[32px] py-[24px] bg-neutral-50 dark:bg-[#111] border-t border-neutral-200 dark:border-neutral-700 flex justify-end items-center gap-[16px]">
          <button
            onClick={onClose}
            className="px-[24px] py-[12px] text-[12px] font-semibold uppercase tracking-widest text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-lg"
          >
            Cancel
          </button>
          <button className="px-[24px] py-[12px] text-[12px] font-semibold uppercase tracking-widest bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 active:scale-95">
            Create Ticket
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateTicketModal;
