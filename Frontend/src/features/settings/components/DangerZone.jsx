import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCompany } from "../../company/hooks/useCompany";
import { toast } from "../../../components/ui/toast";

const DangerZone = () => {
  const navigate = useNavigate();
  const { deleteWorkspace } = useCompany();
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const userWorkspaceId = useSelector((s) => s.auth.user?.workspaceId);
  const workspaceId = activeWorkspaceId || userWorkspaceId;
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!workspaceId) {
      toast("No active workspace selected.", { type: "error" });
      return;
    }
    const confirmed = window.confirm(
      "Delete this workspace permanently? This cannot be undone. Workspaces with agents or customers must be emptied first."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteWorkspace(workspaceId);
      toast("Workspace deleted.", { type: "success" });
      navigate("/company-portal");
    } catch (err) {
      toast(
        err?.response?.data?.message || "Failed to delete workspace.",
        { type: "error" }
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="border border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/30 rounded-xl p-[24px]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-red-600 dark:text-red-500">Danger Zone</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Permanently delete this workspace and all associated data.
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-[24px] py-[8px] border border-red-500 dark:border-red-700 text-red-600 dark:text-red-500 text-sm font-semibold rounded-lg hover:bg-red-600 dark:hover:bg-red-700 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {deleting && (
            <span className="material-symbols-outlined text-sm animate-spin">
              progress_activity
            </span>
          )}
          Delete Workspace
        </button>
      </div>
    </section>
  );
};

export default DangerZone;
