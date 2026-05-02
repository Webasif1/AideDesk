const teamSizes = [
  { value: "0-100", label: "0 – 100 employees" },
  { value: "100-250", label: "100 – 250 employees" },
  { value: "250-500", label: "250 – 500 employees" },
  { value: "500-1000", label: "500 – 1000 employees" },
];

const TeamSizeSelector = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-[8px]">
      <label className="text-[12px] font-semibold tracking-widest uppercase text-on-surface-variant">
        Team Size
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-surface-variant bg-surface-container-low rounded-xl px-4 py-3 text-[14px] text-primary focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-colors appearance-none cursor-pointer"
      >
        <option value="" disabled>
          Select team size
        </option>
        {teamSizes.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TeamSizeSelector;
