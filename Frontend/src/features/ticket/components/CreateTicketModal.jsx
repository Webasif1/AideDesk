import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTicket } from "../hooks/useTicket";
import { useUser } from "../../user/hooks/useUser";
import { toast } from "../../../components/ui/toast";

const priorities = ["Low", "Normal", "High"];
const PRIORITY_MAP = { Low: "low", Normal: "medium", High: "high" };

const channels = ["Email", "Chat", "Phone", "Portal"];
// Ticket `source` enum is chat | email | dashboard | api
const CHANNEL_MAP = { Email: "email", Chat: "chat", Phone: "dashboard", Portal: "dashboard" };

const resources = [
  { title: "Resetting user passwords", meta: "Technical • 2m read" },
  { title: "Billing FAQ", meta: "Finance • 5m read" },
];

const ATTACH_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,application/pdf";

const CreateTicketModal = ({ onClose }) => {
  const navigate = useNavigate();
  const { createTicket, createCustomerTicket, getTickets } = useTicket();
  const { getUsers } = useUser();
  const customers = useSelector((s) => s.user.users);
  const role = useSelector((s) => s.auth.role);
  const isStaff = role === "admin" || role === "agent";
  const isCustomer = role === "customer";

  const [form, setForm] = useState({
    customerId: "",
    channel: "Email",
    subject: "",
    description: "",
  });
  const [priority, setPriority] = useState("Normal");
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Max 10MB.");
      return;
    }
    setError("");
    setAttachment(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Staff create on behalf of a customer — load the workspace customer list.
  useEffect(() => {
    if (isStaff) getUsers({ page: 1, limit: 100 }).catch(() => {});
  }, [getUsers, isStaff]);

  const validate = () => {
    if (isStaff && !form.customerId) return "Please select a customer.";
    if (form.subject.trim().length < 3)
      return "Subject must be at least 3 characters.";
    if (form.description.trim().length < 10)
      return "Description must be at least 10 characters.";
    return "";
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      // Customer flow: priority/category are AI-decided; jump into the copilot chat.
      if (isCustomer) {
        const res = await createCustomerTicket({
          title: form.subject.trim(),
          description: form.description.trim(),
          attachment,
        });
        const chatId = res?.data?.chatId;
        toast("Ticket created — our assistant is on it.", { type: "success" });
        onClose();
        navigate(chatId ? `/dashboard/chat?chat=${chatId}` : "/dashboard/chat");
        return;
      }

      await createTicket({
        title: form.subject.trim(),
        description: form.description.trim(),
        priority: PRIORITY_MAP[priority],
        source: CHANNEL_MAP[form.channel],
        customerId: form.customerId,
      });
      getTickets({ page: 1, limit: 10 }).catch(() => {});
      toast("Ticket created successfully.", { type: "success" });
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to create ticket."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-[32px] bg-black/40 backdrop-blur-sm"
    >
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`${isCustomer ? "max-w-[560px]" : "max-w-[840px]"} w-full bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-xl dark:shadow-none`}
      >
        {/* Header */}
        <div className="px-[32px] py-[24px] border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <div>
            <h1 className="text-[24px] font-semibold text-black dark:text-white tracking-tight">
              Create New Ticket
            </h1>
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-1">
              {isCustomer
                ? "Describe your issue — our AI assistant replies right away and brings in a human if needed."
                : "Fill in the details below to log a new support request."}
            </p>
          </div>
          <button
            type="button"
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
            className={`flex-1 p-[32px] space-y-[24px] ${isCustomer ? "" : "border-r border-neutral-200 dark:border-neutral-700"}`}
          >
            {/* Customer select (staff) + Channel (staff) */}
            {isStaff && (
              <div className="grid grid-cols-2 gap-[24px]">
                <div className="flex flex-col gap-[8px]">
                  <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.customerId}
                      onChange={set("customerId")}
                      className="w-full h-11 px-[16px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-[14px] focus:outline-none focus:border-black dark:focus:border-white appearance-none transition-colors"
                    >
                      <option value="">Select customer…</option>
                      {(customers || []).map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} ({c.email})
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                      expand_more
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-[8px]">
                  <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    Channel
                  </label>
                  <div className="relative">
                    <select
                      value={form.channel}
                      onChange={set("channel")}
                      className="w-full h-11 px-[16px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-[14px] focus:outline-none focus:border-black dark:focus:border-white appearance-none transition-colors"
                    >
                      {channels.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Subject */}
            <div className="flex flex-col gap-[8px]">
              <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={set("subject")}
                placeholder="Brief summary of the issue"
                className="w-full h-11 px-[16px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-[14px] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>

            {/* Priority pills — staff only (AI decides for customers) */}
            {isStaff && (
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
            )}

            {/* Description */}
            <div className="flex flex-col gap-[8px]">
              <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={set("description")}
                className="w-full px-[16px] py-[16px] bg-neutral-50 dark:bg-[#111] text-black dark:text-white text-[14px] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-black dark:focus:border-white resize-none min-h-[140px] border border-neutral-200 dark:border-neutral-600 rounded-lg transition-colors"
                placeholder="Provide detailed information about the request..."
              />
            </div>

            {/* Reference attachment — customer only (image/PDF for AI + agent) */}
            {isCustomer && (
              <div className="flex flex-col gap-[8px]">
                <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  Reference (optional)
                </label>
                {!attachment ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-[8px] h-11 border border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg text-[13px] text-neutral-500 dark:text-neutral-400 hover:border-black dark:hover:border-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">attach_file</span>
                    Attach an image or PDF (max 10MB)
                  </button>
                ) : (
                  <div className="flex items-center gap-[10px] px-[12px] py-[10px] bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <span className="material-symbols-outlined text-[18px] text-neutral-500 dark:text-neutral-400">
                      {attachment.type.startsWith("image/") ? "image" : "picture_as_pdf"}
                    </span>
                    <span className="text-[12px] text-neutral-700 dark:text-neutral-300 flex-1 truncate">
                      {attachment.name}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {(attachment.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="p-[2px] rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ATTACH_ACCEPT}
                  onChange={handleFile}
                  hidden
                />
              </div>
            )}

            {error && (
              <div className="p-[12px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex gap-[8px]">
                <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0">
                  error
                </span>
                <p className="text-[13px] text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </motion.div>

          {/* Right sidebar — suggested resources (staff only) */}
          {isStaff && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12, duration: 0.25 }}
              className="w-64 bg-neutral-50 dark:bg-[#111] p-[16px] space-y-[24px] hidden md:block"
            >
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
                      className="p-3 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-lg"
                    >
                      <p className="text-[13px] font-semibold text-black dark:text-white">
                        {r.title}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-1">{r.meta}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 leading-relaxed">
                  Suggested articles your customer may find helpful.
                </p>
              </div>
            </motion.aside>
          )}
        </div>

        {/* Footer */}
        <div className="px-[32px] py-[24px] bg-neutral-50 dark:bg-[#111] border-t border-neutral-200 dark:border-neutral-700 flex justify-end items-center gap-[16px]">
          <button
            type="button"
            onClick={onClose}
            className="px-[24px] py-[12px] text-[12px] font-semibold uppercase tracking-widest text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-[24px] py-[12px] text-[12px] font-semibold uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">
                  progress_activity
                </span>
                Creating…
              </>
            ) : (
              <>
                {isCustomer ? "Create Ticket & Chat" : "Create Ticket"}
                <span className="material-symbols-outlined text-sm">send</span>
              </>
            )}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default CreateTicketModal;
