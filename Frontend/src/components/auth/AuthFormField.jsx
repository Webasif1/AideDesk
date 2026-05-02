const AuthFormField = ({ id, label, type = "text", placeholder }) => {
  return (
    <div className="flex flex-col gap-[4px] mb-[16px]">
      <label
        htmlFor={id}
        className="text-[12px] font-semibold tracking-widest uppercase text-primary"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="w-full h-12 bg-surface-container-low border border-surface-variant rounded-xl px-[16px] text-[14px] text-primary placeholder:text-on-tertiary-container focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
      />
    </div>
  );
};

export default AuthFormField;
