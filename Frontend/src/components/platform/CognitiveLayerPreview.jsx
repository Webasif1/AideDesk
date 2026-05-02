const CognitiveLayerPreview = () => {
  return (
    <div className="col-span-12 md:col-span-7 order-1 md:order-2 bg-surface rounded-xl border border-surface-container-highest p-6 h-[400px] flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-surface-container-highest mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-sm">robot_2</span>
          </div>
          <span className="text-[14px] font-semibold">Assistant Context</span>
        </div>
        <span className="text-[12px] border border-surface-container-highest bg-surface-container-lowest px-2 py-1 rounded-full text-on-surface-variant">
          Active
        </span>
      </div>

      {/* Chat Area */}
      <div className="flex-grow flex flex-col gap-4 overflow-hidden">
        <div className="self-end max-w-[80%] bg-surface-container-lowest border border-surface-container-highest rounded-xl rounded-tr-sm p-4">
          <div className="h-2 w-32 bg-surface-variant rounded mb-2"></div>
          <div className="h-2 w-48 bg-surface-variant rounded"></div>
        </div>
        <div className="self-start max-w-[80%] bg-surface-container-lowest border border-surface-container-highest rounded-xl rounded-tl-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-on-surface-variant text-sm animate-pulse">
              analytics
            </span>
            <span className="text-[12px] font-semibold tracking-widest text-on-surface-variant uppercase">
              Parsing Intent...
            </span>
          </div>
          <div className="flex gap-2 mb-2">
            <span className="text-[12px] border border-surface-container-highest bg-surface px-2 py-1 rounded">
              Entity: User
            </span>
            <span className="text-[12px] border border-surface-container-highest bg-surface px-2 py-1 rounded">
              Action: Update
            </span>
          </div>
          <div className="h-2 w-full bg-surface-variant rounded mt-4 mb-2"></div>
          <div className="h-2 w-3/4 bg-surface-variant rounded"></div>
        </div>
      </div>

      {/* Input */}
      <div className="mt-4 pt-4 border-t border-surface-container-highest">
        <div className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-lg h-10 flex items-center px-3 justify-between">
          <span className="text-on-surface-variant text-[14px]">
            Type to simulate...
          </span>
          <span className="material-symbols-outlined text-on-surface-variant text-sm">
            send
          </span>
        </div>
      </div>
    </div>
  );
};

export default CognitiveLayerPreview;
