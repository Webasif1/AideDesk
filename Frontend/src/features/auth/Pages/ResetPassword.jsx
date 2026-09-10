import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import AuthLeftPanel from "../components/AuthLeftPanel";
import AuthFormField from "../components/AuthFormField";
import BackLink from "../components/BackLink";
import PageWrapper from "../../../App/Components/ui/PageWrapper";
import Logo from "../../../components/ui/Logo";
import { useAuth } from "../hooks/useAuth";

// The final step of the reset flow. The backend has always had
// POST /api/auth/reset-password/:token and the api client and hook were both
// wired for it, but no page existed and no route pointed here — so the emailed
// link led nowhere and nobody could actually complete a reset.
const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const loading = useSelector((state) => state.auth.loading);
  const apiError = useSelector((state) => state.auth.error);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      await resetPassword(token, { password });
      setDone(true);
      // Give the confirmation a moment to be read before moving on.
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      console.error("Reset password failed", err);
    }
  };

  return (
    <PageWrapper>
      <div className="bg-background text-on-surface antialiased min-h-screen flex selection:bg-primary selection:text-on-primary">
        <AuthLeftPanel />

        <motion.div
          className="w-full lg:w-1/2 flex flex-col justify-center items-center p-[24px] sm:p-[48px] bg-surface"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="lg:hidden mb-[48px] self-start w-full max-w-[400px]">
            <Logo size="md" linkTo="/" />
          </div>

          <div className="w-full max-w-[400px] flex flex-col">
            <BackLink to="/login" />

            <div className="mb-[32px]">
              <h2
                className="text-primary"
                style={{ fontSize: "24px", fontWeight: "600", letterSpacing: "-0.01em" }}
              >
                Choose a new password
              </h2>
              <p
                className="text-on-surface-variant mt-[4px]"
                style={{ fontSize: "13px", lineHeight: "1.5" }}
              >
                Reset links expire after 15 minutes and can only be used once.
              </p>
            </div>

            {done ? (
              <div
                role="status"
                className="text-[13px] text-green-600 font-medium p-3 bg-green-50 dark:bg-green-950/30 rounded-lg"
              >
                Password updated. Taking you to sign in…
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col w-full">
                <AuthFormField
                  id="password"
                  label="New password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <AuthFormField
                  id="confirm"
                  label="Confirm new password"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />

                {errorMsg && (
                  <p className="text-[12px] text-error -mt-[12px] mb-[12px]">{errorMsg}</p>
                )}

                {apiError && (
                  <p className="text-[13px] text-error font-medium p-3 bg-error/10 rounded-lg mb-[16px]">
                    {apiError}
                  </p>
                )}

                <div className="mt-[16px]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-primary text-on-primary rounded-xl text-[14px] font-semibold hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-70"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-[32px] text-center text-[13px] text-on-surface-variant">
              Link expired?{" "}
              <Link to="/forgot-password" className="text-primary font-medium hover:underline">
                Request a new one
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default ResetPassword;
