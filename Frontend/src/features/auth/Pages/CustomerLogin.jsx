import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { setError } from "../state/auth.slice";

// ============================================
// Customer support-portal sign-in.
//
// Deliberately its own visual system — not the staff auth screen. Customers
// arrive here from an invite email, usually once, so the page carries the
// welcome rather than a workspace tool aesthetic: fixed aurora dark theme
// (ignores the app light/dark toggle), glass card, motion on entry.
// Auth itself is the shared /auth/login endpoint, and a successful sign-in
// lands on the same workbench customer view as every other route.
// ============================================

// Animated colour fields behind the card. Each drifts on its own timing so the
// background never visibly loops.
const Aurora = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute -top-[20%] -left-[10%] w-[55vw] h-[55vw] rounded-full blur-[120px] opacity-50"
      style={{
        background:
          "radial-gradient(circle at 30% 30%, #6366f1 0%, rgba(99,102,241,0) 70%)",
      }}
      animate={{ x: [0, 60, -20, 0], y: [0, 40, 80, 0], scale: [1, 1.12, 0.96, 1] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-[10%] -right-[15%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-45"
      style={{
        background:
          "radial-gradient(circle at 60% 40%, #a855f7 0%, rgba(168,85,247,0) 70%)",
      }}
      animate={{ x: [0, -50, 20, 0], y: [0, 60, -30, 0], scale: [1, 0.94, 1.1, 1] }}
      transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute -bottom-[25%] left-[20%] w-[60vw] h-[60vw] rounded-full blur-[130px] opacity-40"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, #06b6d4 0%, rgba(6,182,212,0) 70%)",
      }}
      animate={{ x: [0, 40, -40, 0], y: [0, -40, 20, 0], scale: [1, 1.08, 0.98, 1] }}
      transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

// Label floats above the value once the field is focused or filled.
const Field = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  trailing,
  error,
}) => {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative">
      <div
        className={`relative rounded-2xl border transition-all duration-300 ${
          error
            ? "border-rose-400/60 bg-rose-500/5"
            : focused
              ? "border-white/50 bg-white/10 shadow-[0_0_0_4px_rgba(255,255,255,0.06)]"
              : "border-white/15 bg-white/5 hover:border-white/25"
        }`}
      >
        <label
          htmlFor={id}
          className={`absolute left-[18px] pointer-events-none transition-all duration-200 ${
            lifted
              ? "top-[9px] text-[10px] tracking-[0.14em] uppercase text-white/50"
              : "top-1/2 -translate-y-1/2 text-[14px] text-white/40"
          }`}
        >
          {label}
        </label>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full h-[64px] bg-transparent outline-none text-[15px] text-white px-[18px] pt-[22px] pb-[10px] rounded-2xl"
        />
        {trailing && (
          <div className="absolute right-[14px] top-1/2 -translate-y-1/2">
            {trailing}
          </div>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[12px] text-rose-300 mt-[6px] ml-[4px]"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

const HIGHLIGHTS = [
  { icon: "bolt", text: "Answers in seconds, day or night" },
  { icon: "support_agent", text: "A specialist steps in when you need one" },
  { icon: "history", text: "Every conversation in one place" },
];

const CustomerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { handleLogin } = useAuth();

  const user = useSelector((s) => s.auth.user);
  const role = useSelector((s) => s.auth.role);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const loading = useSelector((s) => s.auth.loading);
  const authError = useSelector((s) => s.auth.error);

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // A failed attempt on another auth screen shouldn't greet the customer here.
  useEffect(() => {
    dispatch(setError(null));
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    // Staff who land here still go to their own home; customers to the workbench.
    if (role === "admin") {
      navigate(user?.companyId ? "/company-portal" : "/welcome", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, role, user, navigate, location.state]);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.email.trim()) next.email = "Enter the email your invite was sent to";
    if (!form.password) next.password = "Enter your password";
    setErrors(next);
    if (Object.keys(next).length) return;

    await handleLogin({ email: form.email.trim(), password: form.password });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#07070c] text-white antialiased selection:bg-indigo-400/30">
      <Aurora />

      {/* Fine grid keeps the glass card from floating on flat colour */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-[56px] px-[24px] py-[48px]">
        {/* ── Welcome side ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px] lg:max-w-[420px]"
        >
          <div className="flex items-center gap-[10px] mb-[28px]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="material-symbols-outlined text-[20px] text-white">
                support_agent
              </span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight">
              AideDesk
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/40 border border-white/15 rounded-full px-[8px] py-[3px]">
              Support
            </span>
          </div>

          <h1 className="text-[38px] sm:text-[46px] leading-[1.05] font-semibold tracking-[-0.03em]">
            Help that
            <span className="block bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              answers instantly.
            </span>
          </h1>

          <p className="text-[15px] leading-relaxed text-white/55 mt-[18px] max-w-[380px]">
            Sign in to your support portal to raise an issue, follow its progress,
            and pick up any conversation where you left it.
          </p>

          <div className="mt-[34px] flex flex-col gap-[14px]">
            {HIGHLIGHTS.map((h, i) => (
              <motion.div
                key={h.icon}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-[12px]"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px] text-indigo-200">
                    {h.icon}
                  </span>
                </div>
                <span className="text-[13px] text-white/60">{h.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Glass sign-in card ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="w-full max-w-[440px]"
        >
          <div className="relative rounded-[28px] p-[1px] bg-gradient-to-b from-white/25 via-white/10 to-transparent">
            <div className="rounded-[27px] bg-white/[0.045] backdrop-blur-2xl px-[28px] sm:px-[36px] py-[38px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
              <div className="mb-[28px]">
                <h2 className="text-[24px] font-semibold tracking-tight">
                  Welcome back
                </h2>
                <p className="text-[13px] text-white/45 mt-[6px]">
                  Use the credentials from your invite email.
                </p>
              </div>

              <form onSubmit={onSubmit} className="flex flex-col gap-[16px]">
                <Field
                  id="customer-email"
                  label="Email address"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  autoComplete="email"
                  error={errors.email}
                />

                <Field
                  id="customer-password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  autoComplete="current-password"
                  error={errors.password}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="p-[6px] rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  }
                />

                <div className="flex justify-end -mt-[4px]">
                  <Link
                    to="/forgot-password"
                    className="text-[12px] text-white/45 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-[10px] rounded-xl border border-rose-400/30 bg-rose-500/10 px-[14px] py-[12px]"
                  >
                    <span className="material-symbols-outlined text-[18px] text-rose-300 shrink-0">
                      error
                    </span>
                    <p className="text-[13px] text-rose-200">{authError}</p>
                  </motion.div>
                )}

                {/* Shine sweeps across the button on hover */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.015 }}
                  whileTap={{ scale: loading ? 1 : 0.985 }}
                  className="group relative overflow-hidden mt-[6px] h-[54px] rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-[14px] font-semibold tracking-tight shadow-[0_12px_40px_-12px_rgba(139,92,246,0.9)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-[8px]">
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">
                          progress_activity
                        </span>
                        Signing you in…
                      </>
                    ) : (
                      <>
                        Sign in to support
                        <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-[3px]">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </span>
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[900ms] ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </motion.button>
              </form>

              <p className="text-[12px] text-white/35 text-center mt-[26px] leading-relaxed">
                Support staff sign in{" "}
                <Link
                  to="/login"
                  className="text-white/70 hover:text-white underline underline-offset-2"
                >
                  here
                </Link>
                .
              </p>
            </div>
          </div>

          <p className="text-[11px] text-white/25 text-center mt-[18px]">
            Protected by AideDesk · Your conversations stay with your provider.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerLogin;
