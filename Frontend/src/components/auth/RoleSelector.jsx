const roles = [
  { value: "admin", label: "Admin" },
  { value: "company", label: "Company / Team" },
  { value: "customer", label: "Customer" },
  { value: "agent", label: "Agent / Support Staff" },
];

const RoleSelector = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-[4px] mb-[16px]">
      <label className="text-[12px] font-semibold tracking-widest uppercase text-primary">
        Role
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 bg-surface-container-low border border-surface-variant rounded-xl px-[16px] text-[14px] text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
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

export default RoleSelector;
