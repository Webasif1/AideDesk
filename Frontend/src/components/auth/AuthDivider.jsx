const AuthDivider = () => {
  return (
    <div className="flex items-center gap-[16px] my-[24px] w-full">
      <div className="flex-1 h-px bg-surface-variant"></div>
      <span className="text-[12px] text-on-surface-variant font-mono">OR</span>
      <div className="flex-1 h-px bg-surface-variant"></div>
    </div>
  );
};

export default AuthDivider;
