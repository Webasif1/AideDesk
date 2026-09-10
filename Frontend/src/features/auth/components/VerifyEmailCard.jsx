import EmailProviderButton from "./EmailProviderButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSelector } from "react-redux";
import { useState } from "react";

const providers = [
  { icon: "mail", label: "Open Gmail", href: "https://mail.google.com" },
  {
    icon: "alternate_email",
    label: "Open Outlook",
    href: "https://outlook.live.com",
  },
  {
    icon: "mark_as_unread",
    label: "Open Yahoo",
    href: "https://mail.yahoo.com",
  },
  { icon: "apps", label: "Open Mail App", href: "mailto:" },
];

const VerifyEmailCard = ({ email = null }) => {
  const navigate = useNavigate();
  const { resendVerification } = useAuth();
  
  const loading = useSelector((state) => state.auth.loading);
  const apiError = useSelector((state) => state.auth.error);

  const [resendStatus, setResendStatus] = useState("");

  const handleResend = async () => {
    setResendStatus("");
    try {
      await resendVerification(email);
      setResendStatus("Verification email sent. Please check your inbox.");
    } catch (err) {
      console.error("Resend failed", err);
    }
  };

  return (
    <main className="w-full max-w-[520px] bg-surface-container-lowest border border-outline-variant rounded-xl p-[32px] flex flex-col items-center">
      {/* Icon */}
      <div className="mb-[24px] w-16 h-16 flex items-center justify-center bg-surface-container-low rounded-full">
        <span className="material-symbols-outlined text-[36px] text-primary">
          mail
        </span>
      </div>

      {/* Title */}
      <h1 className="text-[32px] font-bold text-primary mb-[8px]">
        Check your email
      </h1>

      {/* Subtext */}
      <p className="text-center text-[14px] text-on-surface-variant leading-relaxed mb-[32px]">
        {email ? (
          <>
            We sent a verification link to your email address
            <br />
            <span className="font-semibold text-primary">{email}</span>
          </>
        ) : (
          // Reached directly or after a reload, so we genuinely do not know
          // which address it went to. Saying so beats naming the wrong one.
          <>
            We sent a verification link to the email address you signed up with.
            <br />
            Open it to finish setting up your account.
          </>
        )}
      </p>

      {/* Provider buttons */}
      <div className="w-full flex flex-col gap-[8px] mb-[32px]">
        {providers.map((p) => (
          <EmailProviderButton key={p.label} {...p} />
        ))}
      </div>

      {/* API States */}
      {apiError && (
        <p className="text-[13px] text-error font-medium p-3 bg-error/10 rounded-lg mb-[16px] w-full text-center">
          {apiError}
        </p>
      )}

      {resendStatus && !apiError && (
        <p className="text-[13px] text-green-600 font-medium p-3 bg-green-50 rounded-lg mb-[16px] w-full text-center">
          {resendStatus}
        </p>
      )}

      {/* Secondary actions */}
      <div className="flex flex-col items-center gap-[8px] mb-[24px]">
        <button 
          onClick={handleResend}
          disabled={loading}
          className="text-[14px] text-on-surface-variant hover:text-primary hover:underline transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Resend email"}
        </button>
        <button 
          onClick={() => navigate("/signup")}
          className="text-[14px] text-on-surface-variant hover:text-primary hover:underline transition-all"
        >
          Change email
        </button>
      </div>

      {/* Divider + spam notice */}
      <div className="w-full pt-[24px] border-t border-outline-variant text-center">
        <p className="text-[13px] text-on-surface-variant">
          Didn't receive the email?{" "}
          <span className="font-semibold text-on-surface">
            Check your spam folder
          </span>
        </p>
      </div>

      {/* Waiting spinner */}
      <div className="mt-[32px] flex items-center gap-[8px]">
        <div className="w-4 h-4 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />
        <p className="text-[12px] text-on-surface-variant uppercase tracking-widest">
          Waiting for verification...
        </p>
      </div>
    </main>
  );
};

export default VerifyEmailCard;
