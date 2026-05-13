import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCompany } from "../hooks/useCompany";
import { SkeletonCard } from "../../../components/ui/Skeleton";

const WorkspaceList = () => {
  const navigate = useNavigate();
  const {
    workspaces,
    loading,
    error,
    getWorkspaces,
    createWorkspace,
    switchWorkspace,
  } = useCompany();

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const autoSlug = (name) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createWorkspace(form);
      setShowCreate(false);
      setForm({ name: "", slug: "", description: "" });
    } finally {
      setCreating(false);
    }
  };

  const handleEnter = (ws) => {
    switchWorkspace(ws._id);
    navigate("/dashboard");
  };

  const inputCls =
    "w-full border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-[14px] bg-white dark:bg-[#1a1a1a] text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors";

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-black dark:text-white">Workspaces</h1>
          <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage your team environments
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black text-[13px] font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New workspace
        </button>
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 w-full max-w-md"
            >
              <h2 className="text-[17px] font-bold text-black dark:text-white mb-4">Create workspace</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-neutral-500 mb-1.5">Name *</label>
                  <input
                    className={inputCls}
                    placeholder="Support Team"
                    value={form.name}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((f) => ({
                        ...f,
                        name: v,
                        slug: f.slug === autoSlug(f.name) ? autoSlug(v) : f.slug,
                      }));
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-neutral-500 mb-1.5">Slug *</label>
                  <input
                    className={inputCls}
                    placeholder="support-team"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: autoSlug(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-neutral-500 mb-1.5">Description</label>
                  <input
                    className={inputCls}
                    placeholder="Optional"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                {error && <p className="text-[12px] text-red-500">{error}</p>}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-[14px] font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !form.name || !form.slug}
                    className="flex-1 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-[14px] font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                  >
                    {creating ? "Creating…" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl">
          <span className="material-symbols-outlined text-[40px] text-neutral-300 block mb-3">workspaces</span>
          <p className="text-[14px] font-semibold text-black dark:text-white mb-1">No workspaces yet</p>
          <p className="text-[13px] text-neutral-500">Click "New workspace" to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workspaces.map((ws, i) => (
            <motion.div
              key={ws._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl px-4 py-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px] text-neutral-500">workspaces</span>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-black dark:text-white">{ws.name}</p>
                  <p className="text-[11px] text-neutral-400">{ws.slug}</p>
                </div>
              </div>
              <button
                onClick={() => handleEnter(ws)}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-black dark:text-white bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                Enter
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspaceList;
