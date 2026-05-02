const ConsolePreview = () => (
  <section className="max-w-[1280px] mx-auto px-[24px] py-[64px] border-t border-surface-variant">
    <div className="text-center max-w-2xl mx-auto mb-[48px]">
      <span className="text-[12px] font-semibold tracking-widest uppercase text-primary bg-surface-container-low px-[8px] py-[4px] rounded mb-[16px] inline-block">
        Workspace
      </span>
      <h2 className="text-[30px] font-semibold text-primary mb-[16px]">
        The Real-time Console
      </h2>
      <p className="text-[14px] text-on-surface-variant leading-relaxed">
        Built for speed. Keyboard-first navigation, live typing indicators, and
        zero-latency updates.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px] h-auto md:h-[600px]">
      <div className="md:col-span-2 rounded-lg border border-surface-variant bg-white flex flex-col overflow-hidden">
        <div className="border-b border-surface-variant p-[16px] flex gap-[8px]">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-surface-container-low border border-surface-variant"
            />
          ))}
        </div>
        <div className="flex-1 flex">
          <div className="w-1/3 border-r border-surface-variant p-[8px] flex flex-col gap-[8px]">
            <div className="p-[12px] border border-primary bg-surface-bright rounded">
              <div className="text-[14px] font-semibold text-primary">
                Login Issue
              </div>
              <div className="text-[12px] text-on-surface-variant mt-[4px]">
                #4921 • 2m ago
              </div>
            </div>
            {[
              { t: "Billing Question", id: "#4920 • 15m ago" },
              { t: "API Error 500", id: "#4919 • 1h ago" },
            ].map((item) => (
              <div
                key={item.t}
                className="p-[12px] rounded hover:bg-surface-container-low cursor-pointer transition-colors"
              >
                <div className="text-[14px] text-on-surface">{item.t}</div>
                <div className="text-[12px] text-on-surface-variant mt-[4px]">
                  {item.id}
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 bg-surface-bright p-[16px] flex flex-col justify-end">
            <div className="bg-white border border-surface-variant p-[16px] rounded mb-[16px]">
              <p className="text-[14px]">
                I can't log into my account. It keeps saying 'Invalid Token'.
              </p>
            </div>
            <div className="flex items-center gap-[8px] text-on-surface-variant mb-[8px]">
              <span className="material-symbols-outlined text-[16px]">
                keyboard
              </span>
              <span className="text-[12px]">Agent typing...</span>
            </div>
            <div className="h-12 bg-white border border-surface-variant rounded flex items-center px-[12px]">
              <span className="text-[14px] text-on-surface-variant">
                Type a reply... [Cmd + Enter to send]
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[24px]">
        <div className="flex-1 rounded-lg border border-surface-variant bg-white p-[16px]">
          <h3 className="text-[18px] font-medium text-primary mb-[16px] border-b border-surface-variant pb-[8px]">
            Customer Profile
          </h3>
          {[
            { l: "Plan", v: "Enterprise" },
            { l: "MRR", v: "$2,400" },
            { l: "Status", v: "Healthy" },
          ].map((row) => (
            <div key={row.l} className="flex justify-between mb-[12px]">
              <span className="text-[12px] text-on-surface-variant">
                {row.l}
              </span>
              <span className="text-[12px] text-primary font-semibold">
                {row.v}
              </span>
            </div>
          ))}
        </div>
        <div className="flex-1 rounded-lg border border-surface-variant bg-white p-[16px]">
          <h3 className="text-[18px] font-medium text-primary mb-[16px] border-b border-surface-variant pb-[8px]">
            Quick Actions
          </h3>
          <div className="flex flex-col gap-[8px]">
            {["Reset Password Link", "Refund Last Invoice"].map((a) => (
              <button
                key={a}
                className="w-full text-left p-[8px] border border-surface-variant rounded hover:bg-surface-container-low text-[14px] transition-colors"
              >
                {a}
              </button>
            ))}
            <button className="w-full text-left p-[8px] border border-surface-variant rounded hover:bg-surface-container-low text-[14px] transition-colors text-error">
              Escalate to Tier 2
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);
export default ConsolePreview;
