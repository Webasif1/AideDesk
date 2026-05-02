const roles = [
  { value: "company", label: "Company / Team" },
  { value: "customer", label: "Customer" },
  { value: "agent", label: "Agent / Support Staff" },
];

const SignupRoleSelector = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-[8px]">
      <label className="text-[12px] font-semibold tracking-widest uppercase text-on-surface-variant">
        Role
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-surface-variant bg-surface-container-low rounded-xl px-4 py-3 text-[14px] text-primary focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-colors appearance-none cursor-pointer"
      >
        <option value="" disabled>
          Select your role
        </option>
        {roles.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SignupRoleSelector;
