import Logo from '../ui/Logo';
const AuthLeftPanel = () => {
  return (
    <div className="hidden lg:flex w-1/2 bg-surface-container-low flex-col justify-between p-[64px] border-r border-surface-variant relative overflow-hidden">
      {/* Header */}
      <div className="z-10">
        <div className="flex items-center gap-[8px] mb-[32px]">
          <div className="mb-[32px]">
            <Logo size="md" linkTo="/" />
          </div>
        </div>
        <h1
          className="text-primary max-w-md"
          style={{
            fontSize: "32px",
            fontWeight: "600",
            lineHeight: "1.2",
            letterSpacing: "-0.02em",
          }}
        >
          AI support, simplified.
        </h1>
        <p
          className="text-on-surface-variant mt-[16px] max-w-sm"
          style={{ fontSize: "14px", lineHeight: "1.6" }}
        >
          Streamline your customer interactions with intelligent routing and
          automated context gathering.
        </p>
      </div>

      {/* UI Preview */}
      <div className="mt-[48px] flex-1 relative z-10 w-full max-w-[600px]">
        <div className="absolute inset-0 bg-surface border border-surface-variant rounded-xl shadow-sm overflow-hidden flex flex-col transform translate-x-12 translate-y-12">
          {/* App Bar */}
          <div className="h-14 border-b border-surface-variant flex items-center justify-between px-[24px] bg-surface-container-lowest">
            <div className="w-24 h-3 bg-surface-container-high rounded-full"></div>
            <div className="flex gap-[8px]">
              <div className="w-6 h-6 rounded-full bg-surface-variant"></div>
              <div className="w-6 h-6 rounded-full bg-surface-variant"></div>
            </div>
          </div>
          {/* Main Area */}
          <div className="flex-1 flex bg-surface-bright">
            {/* Sidebar */}
            <div className="w-1/4 border-r border-surface-variant p-[16px] flex flex-col gap-[16px] bg-surface-container-lowest">
              <div className="w-full h-8 bg-surface-container-low rounded-lg"></div>
              <div className="w-3/4 h-4 bg-surface-variant rounded-full mt-[8px]"></div>
              <div className="w-full h-4 bg-surface-variant rounded-full"></div>
              <div className="w-5/6 h-4 bg-surface-variant rounded-full"></div>
            </div>
            {/* Content */}
            <div className="flex-1 p-[24px] flex flex-col gap-[24px]">
              <div className="w-1/3 h-6 bg-surface-variant rounded-full"></div>
              <div className="w-full h-32 bg-surface-container-lowest border border-surface-variant rounded-xl p-[16px] flex flex-col gap-[8px]">
                <div className="w-1/4 h-4 bg-surface-variant rounded-full mb-[8px]"></div>
                <div className="w-full h-2 bg-surface-container-high rounded-full"></div>
                <div className="w-full h-2 bg-surface-container-high rounded-full"></div>
                <div className="w-2/3 h-2 bg-surface-container-high rounded-full"></div>
              </div>
              <div className="w-full h-24 bg-surface-container-low border border-surface-variant rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      ></div>
    </div>
  );
};

export default AuthLeftPanel;
