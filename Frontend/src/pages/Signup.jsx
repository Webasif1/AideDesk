import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthLeftPanel from "../components/auth/AuthLeftPanel";
import AuthTabToggle from "../components/auth/AuthTabToggle";
import AuthFormField from "../components/auth/AuthFormField";
import AuthDivider from "../components/auth/AuthDivider";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import BackLink from "../components/auth/BackLink";
import SignupRoleSelector from "../components/auth/SignupRoleSelector";
import TeamSizeSelector from "../components/auth/TeamSizeSelector";
import PageWrapper from "../components/ui/PageWrapper";

const Signup = () => {
  const [role, setRole] = useState("");
  const [teamSize, setTeamSize] = useState("");

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

            <div className="flex flex-col gap-5">
              <AuthFormField
                id="fullName"
                label="Full Name"
                type="text"
                placeholder="Jane Doe"
              />
              <AuthFormField
                id="email"
                label="Email"
                type="email"
                placeholder="name@company.com"
              />
              <AuthFormField
                id="password"
                label="Password"
                type="password"
                placeholder="••••••••"
              />

              <SignupRoleSelector value={role} onChange={setRole} />

              {role === "company" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <TeamSizeSelector value={teamSize} onChange={setTeamSize} />
                </motion.div>
              )}

              <button
                type="button"
                className="w-full bg-primary text-on-primary rounded-xl py-3 text-[14px] font-semibold mt-4 hover:opacity-90 transition-opacity"
              >
                Sign Up
              </button>
            </div>

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
