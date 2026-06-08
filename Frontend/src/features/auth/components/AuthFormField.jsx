import { useState } from "react";

const EyeIcon = ({ className = "" }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.25 12a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
    />
  </svg>
);

const EyeOffIcon = ({ className = "" }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m3 3 18 18"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.58 10.58a2.25 2.25 0 0 0 3.17 3.17"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.53 5.58A9.24 9.24 0 0 1 12 5.25c6 0 9.75 6.75 9.75 6.75a17.47 17.47 0 0 1-3.12 3.78"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.32 6.92C3.72 8.73 2.25 12 2.25 12S6 18.75 12 18.75c1.52 0 2.88-.43 4.06-1.08"
    />
  </svg>
);

const AuthFormField = ({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  canTogglePassword = false,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const hasPasswordToggle = canTogglePassword && type === "password";
  const inputType = hasPasswordToggle && isPasswordVisible ? "text" : type;

  return (
    <div className="flex flex-col gap-[4px] mb-[16px]">
      <label
        htmlFor={id}
        className="text-[12px] font-semibold tracking-widest uppercase text-primary"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full h-12 bg-surface-container-low border border-surface-variant rounded-xl px-[16px] text-[14px] text-primary placeholder:text-on-tertiary-container focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${
            hasPasswordToggle ? "pr-12" : ""
          }`}
        />
        {hasPasswordToggle && (
          <button
            type="button"
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            aria-pressed={isPasswordVisible}
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-on-surface-variant outline-none transition-[transform,color,background-color] duration-150 ease-out hover:bg-surface-container-high hover:text-primary focus-visible:ring-2 focus-visible:ring-primary active:scale-95"
          >
            <span
              className={`absolute transition-[opacity,transform] duration-200 ease-out ${
                isPasswordVisible
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 -rotate-45 scale-90"
              }`}
            >
              <EyeOffIcon className="h-5 w-5" />
            </span>
            <span
              className={`absolute transition-[opacity,transform] duration-200 ease-out ${
                isPasswordVisible
                  ? "opacity-0 rotate-45 scale-90"
                  : "opacity-100 rotate-0 scale-100"
              }`}
            >
              <EyeIcon className="h-5 w-5" />
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthFormField;
