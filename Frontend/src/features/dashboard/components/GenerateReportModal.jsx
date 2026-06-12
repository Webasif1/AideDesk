import { useState } from "react";
import { motion } from "framer-motion";
import Tooltip from "../../../components/ui/Tooltip";

const reportTypes = [
  {
    id: "ticket_volume",
    icon: "confirmation_number",
    label: "Ticket Volume",
    desc: "Total tickets by status, channel and time period.",
  },
  {
    id: "agent_performance",
    icon: "badge",
    label: "Agent Performance",
    desc: "Resolution rate, response time and CSAT per agent.",
  },
  {
    id: "csat",
    icon: "sentiment_satisfied",
    label: "CSAT Summary",
    desc: "Customer satisfaction scores and trend analysis.",
  },
  {
    id: "ai_resolution",
    icon: "psychology",
    label: "AI Resolution",
    desc: "AI vs human resolution breakdown and accuracy.",
  },
];

const formats = ["PDF", "CSV", "Excel"];

const GenerateReportModal = ({ onClose }) => {
  const [selected, setSelected] = useState("ticket_volume");
  const [format, setFormat] = useState("PDF");
  const [range, setRange] = useState("Last 30 days");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-[32px] bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="max-w-[680px] w-full bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="px-[32px] py-[24px] border-b border-neutral-200 flex justify-between items-center">
          <div>
            <h1 className="text-[24px] font-semibold text-black tracking-tight">
              Generate Report
            </h1>
            <p className="text-[13px] text-neutral-500 mt-1">
              Select a report type, date range, and export format.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-neutral-500">
              close
            </span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.25 }}
          className="p-[32px] space-y-[28px]"
        >
          {/* Report type */}
          <div className="flex flex-col gap-[12px]">
            <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500">
              Report Type
            </label>
            <div className="grid grid-cols-2 gap-[12px]">
              {reportTypes.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelected(r.id)}
                  className={`flex items-start gap-[12px] p-[16px] border rounded-xl text-left transition-all ${
                    selected === r.id
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 bg-neutral-50 hover:border-black"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[22px] shrink-0 mt-0.5 ${
                      selected === r.id ? "text-white" : "text-neutral-400"
                    }`}
                  >
                    {r.icon}
                  </span>
                  <div>
                    <p
                      className={`text-[14px] font-semibold ${
                        selected === r.id ? "text-white" : "text-black"
                      }`}
                    >
                      {r.label}
                    </p>
                    <p
                      className={`text-[12px] mt-0.5 ${
                        selected === r.id
                          ? "text-neutral-300"
                          : "text-neutral-500"
                      }`}
                    >
                      {r.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date range + format */}
          <div className="grid grid-cols-2 gap-[24px]">
            <div className="flex flex-col gap-[8px]">
              <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500">
                Date Range
              </label>
              <div className="relative">
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="w-full h-11 px-[16px] bg-neutral-50 border border-neutral-200 rounded-lg text-[14px] focus:outline-none focus:border-black appearance-none transition-colors"
                >
                  {[
                    "Last 7 days",
                    "Last 30 days",
                    "Last 90 days",
                    "This year",
                    "Custom range",
                  ].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-[8px]">
              <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500">
                Export Format
              </label>
              <div className="flex gap-[8px]">
                {formats.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={`flex-1 h-11 border rounded-lg text-[13px] font-medium transition-all ${
                      format === f
                        ? "border-black bg-black text-white"
                        : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-black"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview summary */}
          <div className="p-[20px] bg-neutral-50 border border-neutral-200 rounded-xl flex items-center gap-[16px]">
            <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[20px]">
                summarize
              </span>
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-black">
                {reportTypes.find((r) => r.id === selected)?.label} · {range} ·{" "}
                {format}
              </p>
              <p className="text-[12px] text-neutral-500 mt-0.5">
                Your report will be generated and downloaded instantly.
              </p>
            </div>
            <span className="material-symbols-outlined text-neutral-300">
              arrow_forward
            </span>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="px-[32px] py-[24px] bg-neutral-50 border-t border-neutral-200 flex justify-end items-center gap-[16px]">
          <button
            onClick={onClose}
            className="px-[24px] py-[12px] text-[12px] font-semibold uppercase tracking-widest text-black hover:bg-neutral-100 transition-colors rounded-lg"
          >
            Cancel
          </button>
          <Tooltip text="Coming soon">
            <button
              disabled
              aria-disabled="true"
              className="px-[24px] py-[12px] text-[12px] font-semibold uppercase tracking-widest bg-black text-white rounded-lg flex items-center gap-2 opacity-40 cursor-not-allowed"
            >
              Generate & Download
              <span className="material-symbols-outlined text-sm">download</span>
            </button>
          </Tooltip>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GenerateReportModal;
