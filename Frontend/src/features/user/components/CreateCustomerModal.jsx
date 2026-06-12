import { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "../hooks/useUser";
import { toast } from "../../../components/ui/toast";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CreateCustomerModal = ({ onClose }) => {
  const { createUser, getUsers } = useUser();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const validate = () => {
    if (!form.name.trim() || form.name.trim().length < 2)
      return "Please enter the customer's full name.";
    if (!emailRe.test(form.email.trim()))
      return "Please enter a valid email address.";
    if (!form.phone.trim()) return "Please enter a phone number.";
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
      await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      // Refresh the customer list so the new entry appears immediately.
      getUsers({ page: 1, limit: 10 }).catch(() => {});
      toast("Customer added — an invite email was sent.", { type: "success" });
      onClose();
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message || err?.message || "Failed to add customer.";
      setError(apiMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { label: "Full Name", field: "name", type: "text", placeholder: "e.g. Jane Doe" },
    { label: "Email Address", field: "email", type: "email", placeholder: "jane@company.com" },
    { label: "Phone", field: "phone", type: "tel", placeholder: "+1 (555) 000-0000" },
  ];

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
        className="max-w-[560px] w-full bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-xl dark:shadow-none"
      >
        {/* Header */}
        <div className="px-[32px] py-[24px] border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <div>
            <h1 className="text-[24px] font-semibold text-black dark:text-white tracking-tight">
              Create Customer
            </h1>
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-1">
              Add a new customer to your workspace.
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

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.25 }}
          className="p-[32px] space-y-[20px]"
        >
          {fields.map((f) => (
            <div key={f.field} className="flex flex-col gap-[8px]">
              <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                {f.label} <span className="text-red-500">*</span>
              </label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.field]}
                onChange={set(f.field)}
                required
                className="w-full h-11 px-[16px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-[14px] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>
          ))}

          {error && (
            <div className="p-[12px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex gap-[8px]">
              <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0">
                error
              </span>
              <p className="text-[13px] text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Info notice */}
          <div className="p-[16px] bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 flex gap-[8px]">
            <span className="material-symbols-outlined text-neutral-400 dark:text-neutral-500 text-[20px] shrink-0">
              info
            </span>
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
              The customer is added to your company automatically. A welcome email
              with login credentials will be sent once their profile is created.
            </p>
          </div>
        </motion.div>

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
                Adding…
              </>
            ) : (
              <>
                Create Customer
                <span className="material-symbols-outlined text-sm">person_add</span>
              </>
            )}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default CreateCustomerModal;
