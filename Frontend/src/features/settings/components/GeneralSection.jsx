import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useCompany } from "../../company/hooks/useCompany";
import Tooltip from "../../../components/ui/Tooltip";
import { toast } from "../../../components/ui/toast";

const GeneralSection = () => {
  const { getWorkspace, updateWorkspace } = useCompany();
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const userWorkspaceId = useSelector((s) => s.auth.user?.workspaceId);
  const workspaceId = activeWorkspaceId || userWorkspaceId;

  const [name, setName] = useState("");
  const [original, setOriginal] = useState("");
  const [saving, setSaving] = useState(false);

  // Load the current workspace name.
  useEffect(() => {
    if (!workspaceId) return;
    getWorkspace(workspaceId)
      .then((res) => {
        const n = res?.data?.name || "";
        setName(n);
        setOriginal(n);
      })
      .catch(() => {});
  }, [getWorkspace, workspaceId]);

  const dirty = name.trim() && name.trim() !== original;

  const handleSave = async () => {
    if (!workspaceId) {
      toast("No active workspace selected.", { type: "error" });
      return;
    }
    if (!dirty) return;
    setSaving(true);
    try {
      await updateWorkspace({ id: workspaceId, name: name.trim() });
      setOriginal(name.trim());
      toast("Workspace updated.", { type: "success" });
    } catch (err) {
      toast(
        err?.response?.data?.message || "Failed to update workspace.",
        { type: "error" }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
      <div className="px-[24px] py-[16px] border-b border-neutral-100 dark:border-neutral-800">
        <h3 className="text-[18px] font-semibold text-black dark:text-white">
          General Workspace
        </h3>
      </div>
      <div className="p-[24px] space-y-[24px]">
        {/* Workspace Name */}
        <div className="grid grid-cols-12 gap-[24px] items-center">
          <div className="col-span-4">
            <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block">
              Workspace Name
            </label>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              Visible to all team members.
            </p>
          </div>
          <div className="col-span-8">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Workspace name"
              className="w-full px-[16px] py-[8px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-sm focus:border-black dark:focus:border-white focus:ring-0 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Logo — not wired yet */}
        <div className="grid grid-cols-12 gap-[24px] items-center">
          <div className="col-span-4">
            <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block">
              Workspace Logo
            </label>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              Max 2MB. Recommended 512×512.
            </p>
          </div>
          <div className="col-span-8 flex items-center gap-[16px]">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-neutral-400 dark:text-neutral-600">
                upload_file
              </span>
            </div>
            <Tooltip text="Coming soon">
              <button
                disabled
                aria-disabled="true"
                className="px-[16px] py-[8px] border border-neutral-200 dark:border-neutral-700 text-black dark:text-white rounded-lg text-sm font-medium opacity-40 cursor-not-allowed"
              >
                Update Logo
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Timezone — not wired yet */}
        <div className="grid grid-cols-12 gap-[24px] items-center">
          <div className="col-span-4">
            <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block">
              Timezone
            </label>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              Coming soon.
            </p>
          </div>
          <div className="col-span-8">
            <Tooltip text="Coming soon" className="w-full">
              <select
                disabled
                className="w-full px-[16px] py-[8px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-neutral-400 dark:text-neutral-500 rounded-lg text-sm outline-none opacity-60 cursor-not-allowed"
              >
                <option>(GMT+00:00) UTC</option>
              </select>
            </Tooltip>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end pt-[8px]">
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
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
  );
};

export default GeneralSection;
