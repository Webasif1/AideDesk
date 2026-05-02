import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthLeftPanel from "../components/auth/AuthLeftPanel";
import AuthFormField from "../components/auth/AuthFormField";
import BackLink from "../components/auth/BackLink";
import PageWrapper from "../components/ui/PageWrapper";
import Logo from "../components/ui/Logo";

const ForgotPassword = () => {
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
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  letterSpacing: "-0.01em",
                }}
              >
                Reset your password
              </h2>
              <p
                className="text-on-surface-variant mt-[4px]"
                style={{ fontSize: "13px", lineHeight: "1.5" }}
              >
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <div className="flex flex-col w-full">
              <AuthFormField
                id="email"
                label="Email"
                type="email"
                placeholder="name@company.com"
              />
              <div className="mt-[16px]">
                <button
                  type="submit"
                  className="w-full h-12 bg-primary text-on-primary rounded-xl text-[14px] font-semibold hover:opacity-90 transition-opacity flex items-center justify-center"
                >
                  Send Reset Link
                </button>
              </div>
            </div>

            <div className="mt-[32px] text-center text-[13px] text-on-surface-variant">
              Remembered your password?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default ForgotPassword;
