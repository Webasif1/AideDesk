import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { useCompany } from "../hooks/useCompany";
import { setUser } from "../../auth/state/auth.slice";
import { useSelector } from "react-redux";

const STEPS = [
  { title: "Company basics", subtitle: "How should we call your company?" },
  { title: "Online presence", subtitle: "Tell us about your business." },
  { title: "Contact & location", subtitle: "Where are you based?" },
  { title: "Almost done", subtitle: "A few last details." },
];

const SIZE_OPTIONS = ["1-10", "11-50", "51-200", "201-500", "500+"];

const inputCls =
  "w-full border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-[14px] bg-white dark:bg-neutral-900 text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors";

const labelCls = "block text-[12px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5";

const CompanySetupWizard = ({ onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { registerCompany, loading, error } = useCompany();
  const authUser = useSelector((s) => s.auth.user);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    website: "",
    industry: "",
    size: "1-10",
    phone: "",
    address: "",
    country: "",
    description: "",
    email: authUser?.email || "",
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const autoSlug = (name) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleNameChange = (val) => {
    set("name", val);
    if (!form.slug || form.slug === autoSlug(form.name)) {
      set("slug", autoSlug(val));
    }
  };

  const canAdvance = () => {
    if (step === 0) return form.name.trim() && form.slug.trim();
    if (step === 1) return form.website.trim() && form.size;
    if (step === 2) return form.phone.trim() && form.address.trim() && form.country.trim();
    return true;
  };

  const handleSubmit = async () => {
    try {
      const res = await registerCompany(form);
      if (res?.data) {
        dispatch(setUser({ ...authUser, companyId: res.data._id || res.data.id }));
      }
      navigate("/company-portal");
    } catch {
      // error shown via Redux error state
    }
  };

  const variants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-800 p-6 w-full">
      {/* Progress bar */}
      <div className="flex gap-1.5 mb-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= step ? "bg-brand" : "bg-neutral-200 dark:bg-neutral-700"
            }`}
          />
        ))}
      </div>

      {/* Step header */}
      <div className="mb-5">
        <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-0.5">
          Step {step + 1} of {STEPS.length}
        </p>
        <h2 className="text-[20px] font-bold text-black dark:text-white">{STEPS[step].title}</h2>
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5">{STEPS[step].subtitle}</p>
      </div>

      {/* Step fields */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22, ease: "easeInOut" }}
        >
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Company name *</label>
                <input
                  className={inputCls}
                  placeholder="Acme Corp"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Slug (URL identifier) *</label>
                <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden focus-within:border-black dark:focus-within:border-white transition-colors">
                  <span className="px-3 py-3 text-[13px] text-neutral-400 bg-neutral-50 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 shrink-0">
                    aidedesk.com/
                  </span>
                  <input
                    className="flex-1 px-3 py-3 text-[14px] bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-none"
                    placeholder="acme-corp"
                    value={form.slug}
                    onChange={(e) => set("slug", autoSlug(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Website *</label>
                <input
                  className={inputCls}
                  placeholder="https://acme.com"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Industry</label>
                <input
                  className={inputCls}
                  placeholder="Software, Retail, Healthcare…"
                  value={form.industry}
                  onChange={(e) => set("industry", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Company size *</label>
                <div className="flex flex-wrap gap-2">
                  {SIZE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set("size", s)}
                      className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition-all ${
                        form.size === s
                          ? "bg-brand text-white dark:text-black border-black dark:border-white"
                          : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Phone number *</label>
                <input
                  className={inputCls}
                  placeholder="+1 555 000 0000"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Address *</label>
                <input
                  className={inputCls}
                  placeholder="123 Main St, Suite 4"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>Country *</label>
                <input
                  className={inputCls}
                  placeholder="United States"
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Description (optional)</label>
                <textarea
                  className={`${inputCls} resize-none h-24`}
                  placeholder="What does your company do?"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 text-[13px] text-neutral-600 dark:text-neutral-400 space-y-1">
                <p className="font-semibold text-black dark:text-white mb-2">Review</p>
                <p><span className="font-medium">Name:</span> {form.name}</p>
                <p><span className="font-medium">Slug:</span> {form.slug}</p>
                <p><span className="font-medium">Website:</span> {form.website}</p>
                <p><span className="font-medium">Size:</span> {form.size}</p>
                <p><span className="font-medium">Country:</span> {form.country}</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      {error && (
        <p className="mt-3 text-[12px] text-red-500">{error}</p>
      )}

      {/* Nav buttons */}
      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-[14px] font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Back
          </button>
        )}
        {step === 0 && onClose && (
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-[14px] font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={step === STEPS.length - 1 ? handleSubmit : () => setStep((s) => s + 1)}
          disabled={!canAdvance() || loading}
          className="flex-1 py-3 rounded-xl bg-brand text-white dark:text-black text-[14px] font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {loading ? "Creating…" : step === STEPS.length - 1 ? "Create company" : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default CompanySetupWizard;
