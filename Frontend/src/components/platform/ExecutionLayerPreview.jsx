const ExecutionLayerPreview = () => {
  return (
    <div className="col-span-12 md:col-span-7 bg-surface-container-lowest rounded-xl border border-surface-container-highest p-6 h-[400px] flex gap-6 overflow-hidden">
      {/* Sidebar */}
      <div className="w-48 border-r border-surface-variant pr-4 flex flex-col gap-2 shrink-0">
        <div className="text-[12px] font-semibold tracking-widest text-on-surface-variant mb-2 uppercase">
          Workflows
        </div>
        <div className="h-8 w-full bg-surface rounded flex items-center px-2 border border-surface-variant">
          <span className="h-2 w-16 bg-on-surface-variant rounded"></span>
        </div>
        <div className="h-8 w-full rounded flex items-center px-2">
          <span className="h-2 w-20 bg-surface-variant rounded"></span>
        </div>
        <div className="h-8 w-full rounded flex items-center px-2">
          <span className="h-2 w-12 bg-surface-variant rounded"></span>
        </div>
      </div>

      {/* Node Canvas */}
      <div className="flex-grow relative bg-surface rounded-lg border border-surface-container-highest p-4">
        <div
          className="absolute inset-0 opacity-10 rounded-lg"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>
        {/* Node 1 */}
        <div className="absolute top-8 left-8 w-40 bg-surface-container-lowest border border-surface-container-highest rounded-lg p-3 shadow-sm z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-sm">
              webhook
            </span>
            <span className="text-[12px] font-semibold uppercase tracking-widest">
              Trigger
            </span>
          </div>
          <div className="h-1.5 w-full bg-surface-variant rounded"></div>
        </div>
        {/* Connector */}
        <svg
          className="absolute top-16 left-48 w-24 h-16 z-0"
          overflow="visible"
        >
          <path
            d="M 0 0 C 40 0 40 40 80 40"
            fill="none"
            stroke="#E5E5E5"
            strokeWidth="2"
          />
        </svg>
        {/* Node 2 */}
        <div className="absolute top-20 left-64 w-40 bg-surface-container-lowest border border-primary rounded-lg p-3 shadow-sm z-10">
          <div className="absolute -right-1 -top-1 w-2 h-2 bg-primary rounded-full"></div>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-sm">
              api
            </span>
            <span className="text-[12px] font-semibold uppercase tracking-widest text-primary">
              Process Data
            </span>
          </div>
          <div className="h-1.5 w-3/4 bg-surface-variant rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionLayerPreview;
