import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthLeftPanel from "../components/AuthLeftPanel";
import AuthTabToggle from "../components/AuthTabToggle";
import AuthFormField from "../components/AuthFormField";
import AuthDivider from "../components/AuthDivider";
import GoogleAuthButton from "../components/GoogleAuthButton";
import BackLink from "../components/BackLink";
import PageWrapper from "../../../App/Components/ui/PageWrapper";
import { useAuth } from "../hooks/useAuth";

const Signup = () => {
  const navigate = useNavigate();
  const { handleRegister } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const loading = useSelector((state) => state.auth.loading);
  const apiError = useSelector((state) => state.auth.error);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.includes("@") || !form.email.includes("."))
      newErrors.email = "Enter a valid email address";
    if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (!/[A-Z]/.test(form.password))
      newErrors.password = "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(form.password))
      newErrors.password = "Password must contain at least one number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await handleRegister({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });
      // Navigate on success
      if (!apiError) {
        navigate("/verify-email", { state: { email: form.email } });
      }
    } catch (err) {
      console.error("Signup failed", err);
    }
  };

  return (
    <PageWrapper>
      <div className="bg-surface-container-lowest text-primary antialiased min-h-screen flex selection:bg-primary selection:text-on-primary">
        <AuthLeftPanel />

        <motion.div
          className="w-full lg:w-1/2 flex flex-col bg-surface-container-lowest justify-center items-center px-6 py-12 relative"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="w-full max-w-[400px] flex flex-col relative z-10">
            <BackLink to="/" />
            <AuthTabToggle activeTab="signup" />

            <form onSubmit={handleSignup} className="flex flex-col gap-5">
              <AuthFormField
                id="fullName"
                label="Full Name"
                type="text"
                placeholder="Jane Doe"
                value={form.fullName}
                onChange={set("fullName")}
              />
              {errors.fullName && (
                <p className="text-[12px] text-error -mt-[12px]">
                  {errors.fullName}
                </p>
              )}

              <AuthFormField
                id="email"
                label="Email"
                type="email"
                placeholder="name@company.com"
                value={form.email}
                onChange={set("email")}
              />
              {errors.email && (
                <p className="text-[12px] text-error -mt-[12px]">
                  {errors.email}
                </p>
              )}

              <AuthFormField
                id="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set("password")}
                canTogglePassword
              />
              {errors.password && (
                <p className="text-[12px] text-error -mt-[12px]">
                  {errors.password}
                </p>
              )}

              {apiError && (
                <p className="text-[13px] text-error font-medium p-3 bg-error/10 rounded-lg">
                  {apiError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary rounded-xl py-3 text-[14px] font-semibold mt-4 hover:opacity-90 transition-opacity disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? "Creating account..." : "Sign Up"}
              </button>
            </form>

            <AuthDivider />
            <GoogleAuthButton />

            <p className="mt-[32px] text-center text-[13px] text-on-surface-variant">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default Signup;
