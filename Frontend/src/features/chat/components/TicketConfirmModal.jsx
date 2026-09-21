import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const priorities = ["low", "medium", "high", "critical"];

const TicketConfirmModal = ({ draft, onConfirm, onCancel }) => {
  const [title, setTitle] = useState(draft?.title || "");
  const [description, setDescription] = useState(draft?.description || "");
  const [priority, setPriority] = useState(draft?.priority || "medium");
  const [category, setCategory] = useState(draft?.category || "general");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm({
        title,
        description,
        priority,
        category,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <span className="material-symbols-outlined text-[24px] text-amber-500 mt-1">
              support_agent
            </span>
            <div className="flex-1">
              <h2 className="text-[18px] font-bold text-black">
                Connect with an agent
              </h2>
              <p className="text-[13px] text-neutral-500 mt-1">
                Our AI thinks a human can help better. Confirm or edit the
                details below to escalate.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-1 rounded hover:bg-neutral-100"
              disabled={submitting}
            >
              <span className="material-symbols-outlined text-[18px] text-neutral-400">
                close
              </span>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[12px] font-medium text-neutral-600">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-neutral-200 rounded-lg text-[13px] outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-neutral-600">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 w-full px-3 py-2 border border-neutral-200 rounded-lg text-[13px] outline-none focus:border-black resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-neutral-600">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-neutral-200 rounded-lg text-[13px] outline-none focus:border-black bg-white"
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-medium text-neutral-600">
                  Category
                </label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-neutral-200 rounded-lg text-[13px] outline-none focus:border-black"
                />
              </div>
            </div>

            {draft?.sla?.firstResponseDeadline && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-[12px] text-neutral-600">
                <div className="flex justify-between">
                  <span>First response by</span>
                  <span className="font-medium text-black">
                    {new Date(
                      draft.sla.firstResponseDeadline
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Resolution by</span>
                  <span className="font-medium text-black">
                    {new Date(draft.sla.resolutionDeadline).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onCancel}
              disabled={submitting}
              className="px-4 py-2 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={submitting || !title.trim()}
              className="px-4 py-2 bg-brand text-white text-[13px] font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Ticket"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TicketConfirmModal;
