import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useUser } from "../../user/hooks/useUser";
import { useAuth } from "../../auth/hooks/useAuth";
import { toast } from "../../../components/ui/toast";
import { initialsOf } from "../../../lib/format";
import { selectIsReadOnly } from "../../auth/state/auth.slice";

const Field = ({ label, hint, children }) => (
  <div className="grid grid-cols-12 gap-[24px] items-center">
    <div className="col-span-4">
      <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block">
        {label}
      </label>
      {hint && (
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
          {hint}
        </p>
      )}
    </div>
    <div className="col-span-8">{children}</div>
  </div>
);

const inputCls =
  "w-full px-[16px] py-[8px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-sm focus:border-black dark:focus:border-white focus:ring-0 outline-none transition-colors";

// Password input with a show/hide eye toggle.
const PasswordInput = ({ value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputCls} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">
          {show ? "visibility_off" : "visibility"}
        </span>
      </button>
    </div>
  );
};

const CustomerProfileSection = () => {
  const { getMe, updateMe, changeUserPassword } = useUser();
  const { getMe: refreshAuth } = useAuth();
  // Suspended accounts are view-only — the server rejects these writes anyway.
  const isReadOnly = useSelector(selectIsReadOnly);

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [original, setOriginal] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const [pwd, setPwd] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    getMe()
      .then((res) => {
        const d = res?.data || {};
        setForm({ name: d.name || "", email: d.email || "", phone: d.phone || "" });
        setOriginal({ name: d.name || "", phone: d.phone || "" });
      })
      .catch(() => {});
  }, [getMe]);

  const dirty =
    form.name.trim().length >= 2 &&
    (form.name.trim() !== original.name ||
      (form.phone || "").trim() !== (original.phone || ""));

  const handleSave = async () => {
    if (!dirty) return;
    setSaving(true);
    try {
      await updateMe({ name: form.name.trim(), phone: form.phone.trim() });
      setOriginal({ name: form.name.trim(), phone: form.phone.trim() });
      await refreshAuth({ silent: true }).catch(() => {});
      toast("Profile updated.", { type: "success" });
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to update profile.", {
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const pwdValid =
    pwd.currentPassword &&
    pwd.newPassword.length >= 8 &&
    pwd.newPassword === pwd.confirm;

  const handlePassword = async () => {
    if (!pwdValid) return;
    setSavingPwd(true);
    try {
      await changeUserPassword({
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      });
      setPwd({ currentPassword: "", newPassword: "", confirm: "" });
      toast("Password changed.", { type: "success" });
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to change password.", {
        type: "error",
      });
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="space-y-[32px]">
      {/* Profile */}
      <section className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
        <div className="px-[24px] py-[16px] border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-[18px] font-semibold text-black dark:text-white">
            Profile
          </h3>
        </div>
        <div className="p-[24px] space-y-[24px]">
          {/* Avatar (initials) */}
          <div className="flex items-center gap-[16px]">
            <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center">
              <span className="text-[20px] font-bold text-white">
                {initialsOf(form.name || form.email)}
              </span>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-black dark:text-white">
                {form.name || "Your name"}
              </p>
              <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
                {form.email}
              </p>
            </div>
          </div>

          <Field label="Full Name" hint="Shown on your tickets and chats.">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Your full name"
              className={inputCls}
            />
          </Field>

          <Field label="Email" hint="Your login email — contact support to change.">
            <input
              type="email"
              value={form.email}
              disabled
              className={`${inputCls} opacity-60 cursor-not-allowed`}
            />
          </Field>

          <Field label="Phone" hint="Optional — helps agents reach you.">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+1 555-0100"
              className={inputCls}
            />
          </Field>

          <div className="flex justify-end pt-[8px]">
            <button
              onClick={handleSave}
              disabled={!dirty || saving || isReadOnly}
              className="bg-black dark:bg-white text-white dark:text-black px-[24px] py-[8px] rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && (
                <span className="material-symbols-outlined text-sm animate-spin">
                  progress_activity
                </span>
              )}
              Save Changes
            </button>
          </div>
        </div>
      </section>

      {/* Change Password */}
      <section className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
        <div className="px-[24px] py-[16px] border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-[18px] font-semibold text-black dark:text-white">
            Change Password
          </h3>
        </div>
        <div className="p-[24px] space-y-[24px]">
          <Field label="Current Password">
            <PasswordInput
              value={pwd.currentPassword}
              onChange={(e) =>
                setPwd((p) => ({ ...p, currentPassword: e.target.value }))
              }
              placeholder="••••••••"
            />
          </Field>

          <Field label="New Password" hint="At least 8 characters.">
            <PasswordInput
              value={pwd.newPassword}
              onChange={(e) =>
                setPwd((p) => ({ ...p, newPassword: e.target.value }))
              }
              placeholder="••••••••"
            />
          </Field>

          <Field label="Confirm New Password">
            <div>
              <PasswordInput
                value={pwd.confirm}
                onChange={(e) =>
                  setPwd((p) => ({ ...p, confirm: e.target.value }))
                }
                placeholder="••••••••"
              />
              {pwd.confirm && pwd.newPassword !== pwd.confirm && (
                <p className="text-[12px] text-red-500 mt-1">
                  Passwords don't match.
                </p>
              )}
            </div>
          </Field>

          <div className="flex justify-end pt-[8px]">
            <button
              onClick={handlePassword}
              disabled={!pwdValid || savingPwd || isReadOnly}
              className="bg-black dark:bg-white text-white dark:text-black px-[24px] py-[8px] rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {savingPwd && (
                <span className="material-symbols-outlined text-sm animate-spin">
                  progress_activity
                </span>
              )}
              Update Password
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomerProfileSection;
