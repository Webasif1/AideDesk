import { useState } from "react";
import StepBadge from "./StepBadge";
import OnboardingFooter from "./OnboardingFooter";

const ROLES = ["Agent", "Admin", "Viewer"];
const MAX_SEATS = 4;

const emptyMember = () => ({ email: "", role: "Agent" });

const Step4 = ({ onNext, onBack }) => {
  const [members, setMembers] = useState([emptyMember()]);

  const updateMember = (index, field, value) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  };

  const addMember = () => {
    if (members.length < MAX_SEATS) {
      setMembers((prev) => [...prev, emptyMember()]);
    }
  };

  const removeMember = (index) => {
    if (members.length === 1) return;
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };
  const seatsFull = members.length >= MAX_SEATS;

  return (
    <>
      <div className="px-[32px] pt-[32px] pb-[24px] flex flex-col gap-[24px]">
        {/* Badge + header */}
        <div className="flex flex-col gap-[12px]">
          <div className="flex items-center gap-[8px]">
            <StepBadge current={4} total={4} />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant border border-surface-container-highest bg-surface-container-low px-[8px] py-[2px] rounded">
              Agent Capacity: {members.length}/{MAX_SEATS}
            </span>
          </div>

          <div className="flex flex-col gap-[4px]">
            <h1 className="text-[24px] font-bold text-primary tracking-tight">
              Invite your team
            </h1>

            {/* Seat tracker */}
            <div className="flex items-center gap-[10px]">
              <div className="flex items-center gap-[4px]">
                {Array.from({ length: MAX_SEATS }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      i < members.length
                        ? "bg-primary border-primary"
                        : "bg-transparent border-surface-container-highest"
                    }`}
                  >
                    {i < members.length && (
                      <span className="material-symbols-outlined text-on-primary text-[12px]">
                        check
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <span className="text-[12px] text-on-surface-variant">
                <span className="font-semibold text-primary">
                  {members.length}
                </span>
                /{MAX_SEATS} seats used
              </span>
            </div>

            <p className="text-[14px] text-on-surface-variant leading-relaxed mt-[4px]">
              Collaborate with your colleagues to manage agent responses and
              scale your support operations efficiently.
            </p>

            {/* Limit warning */}
            {seatsFull && (
              <div className="flex items-center gap-[8px] mt-[4px] px-[12px] py-[8px] bg-surface-container-low border border-surface-container-highest rounded-lg">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                  info
                </span>
                <p className="text-[12px] text-on-surface-variant">
                  Free plan limit reached.{" "}
                  <span className="font-semibold text-primary">
                    Upgrade to add more agents.
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Member rows */}
        <div className="flex flex-col gap-[12px]">
          {members.map((member, index) => (
            <div key={index} className="grid grid-cols-12 gap-[8px] items-end">
              {/* Email */}
              <div className="col-span-7 flex flex-col gap-[6px]">
                {index === 0 && (
                  <label className="text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
                    Work Email
                  </label>
                )}
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  value={member.email}
                  onChange={(e) => updateMember(index, "email", e.target.value)}
                  className="w-full h-11 px-[16px] bg-surface-container-low border border-surface-container-highest rounded-lg text-[14px] text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/50"
                />
              </div>

              {/* Role */}
              <div className="col-span-4 flex flex-col gap-[6px] relative">
                {index === 0 && (
                  <label className="text-[12px] font-semibold uppercase tracking-widest text-on-surface-variant">
                    Role
                  </label>
                )}
                <select
                  value={member.role}
                  onChange={(e) => updateMember(index, "role", e.target.value)}
                  className="w-full h-11 pl-[16px] pr-[36px] bg-surface-container-low border border-surface-container-highest rounded-lg text-[14px] text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                >
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant absolute right-[10px] bottom-[10px] pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Remove button */}
              <div className="col-span-1 flex items-end justify-center pb-[2px]">
                {members.length > 1 ? (
                  <button
                    onClick={() => removeMember(index)}
                    className="w-11 h-11 flex items-center justify-center rounded-lg border border-surface-container-highest hover:bg-surface-container-low hover:border-error hover:text-error text-on-surface-variant transition-all group"
                  >
                    <span className="material-symbols-outlined text-[18px] group-hover:text-error transition-colors">
                      close
                    </span>
                  </button>
                ) : (
                  <div className="w-11 h-11" />
                )}
              </div>
            </div>
          ))}

          {/* Add another */}
          <button
            onClick={addMember}
            disabled={seatsFull}
            className={`flex items-center gap-[4px] text-[12px] font-bold uppercase tracking-widest w-fit mt-[4px] transition-all ${
              seatsFull
                ? "text-on-surface-variant opacity-40 cursor-not-allowed"
                : "text-primary hover:opacity-70 cursor-pointer"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {seatsFull ? "lock" : "add"}
            </span>
            {seatsFull
              ? "Seat limit reached (Free plan)"
              : "Add another member"}
          </button>
        </div>

        {/* Info card */}
        <div className="bg-surface-container-low rounded-lg border border-surface-container-highest p-[16px] flex items-center gap-[16px]">
          <div className="w-14 h-14 rounded-full bg-surface-container-lowest border border-surface-container-highest flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[28px]">
              groups
            </span>
          </div>
          <div className="flex flex-col gap-[2px]">
            <h3 className="text-[16px] font-semibold text-primary">
              Team Visibility
            </h3>
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              Invited members will receive an email to join your AideDesk
              workspace instantly.
            </p>
          </div>
        </div>
      </div>

      <OnboardingFooter onBack={onBack} onNext={onNext} nextLabel="Finish" />
    </>
  );
};

export default Step4;
