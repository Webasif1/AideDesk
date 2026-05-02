const metrics = [
  { label: "Total Invocations", value: "1.2M" },
  { label: "Avg Latency", value: "420ms" },
  { label: "Error Rate", value: "0.05%" },
];

const bars = [30, 50, 40, 80, 60, 45, 70];

const AdminLayerPreview = () => {
  return (
    <div className="col-span-12 md:col-span-7 order-1 md:order-2 bg-surface rounded-xl border border-surface-container-highest p-6 h-[400px] flex flex-col gap-4">
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-surface-container-lowest border border-surface-container-highest rounded-lg p-4"
          >
            <div className="text-[12px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">
              {m.label}
            </div>
            <div className="text-[24px] font-semibold">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="flex-grow bg-surface-container-lowest border border-surface-container-highest rounded-lg p-4 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <span className="text-[14px] font-semibold">API Usage Over Time</span>
          <div className="flex gap-2 items-center">
            <span className="h-2 w-2 rounded-full bg-primary"></span>
            <span className="text-[12px] text-on-surface-variant">Tokens</span>
          </div>
        </div>
        <div className="flex-grow flex items-end justify-between gap-2 px-4 pb-2 border-b border-surface-variant">
          {bars.map((h, i) => (
            <div
              key={i}
              className={`w-full rounded-t-sm ${i === 3 ? "bg-primary" : "bg-surface-variant"}`}
              style={{ height: `${h}%` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminLayerPreview;
