import { useNavigate } from "react-router-dom";

const AuthTabToggle = ({ activeTab }) => {
  const navigate = useNavigate();

  return (
    <div className="flex border-b border-surface-variant mb-[32px] w-full">
      <button
        onClick={() => navigate("/login")}
        className={`flex-1 pb-[8px] border-b-[2px] text-[14px] font-semibold text-center transition-colors
          ${
            activeTab === "login"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-primary"
          }`}
      >
        Login
      </button>
      <button
        onClick={() => navigate("/signup")}
        className={`flex-1 pb-[8px] border-b-[2px] text-[14px] font-semibold text-center transition-colors
          ${
            activeTab === "signup"
              ? "border-primary text-primary"
              : "border-transparent text-on-surface-variant hover:text-primary"
          }`}
      >
        Sign up
      </button>
    </div>
  );
};

export default AuthTabToggle;
