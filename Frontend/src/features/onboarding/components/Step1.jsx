import { useState } from "react";
import StepBadge from "./StepBadge";
import OnboardingFooter from "./OnboardingFooter";
import { motion } from "framer-motion";

const suggestions = [
  "How do I reset my password?",
  "What are your hours?",
  "Track my order",
];

const Step1 = ({ onNext, onBack }) => {
  const [question, setQuestion] = useState("");
  const replies = {
    "How do I reset my password?":
      "To reset your password, click 'Forgot Password' on the login page and follow the instructions sent to your email.",
    "What are your hours?":
      "We're available 24/7 via AideDesk! Our human support team is online Mon–Fri, 9am–6pm.",
    "Track my order":
      "Sure! Please share your order ID and I'll pull up the latest tracking information for you.",
  };

  const getReplies = (q) =>
    replies[q] ?? "Thanks for your question! Let me look into that for you.";
  return (
    <>
      {/* Content */}
      <div className="px-[32px] pt-[32px] pb-[16px] flex flex-col flex-grow">
        <div className="mb-[16px]">
          <StepBadge current={1} total={4} />
        </div>

        <h1 className="text-[24px] font-bold text-primary mb-[8px] tracking-tight">
          Ask your AI agent questions
        </h1>
        <p className="text-[14px] text-on-surface-variant mb-[32px] leading-relaxed">
          Test how your AI responds to common customer queries before going
          live.
        </p>

        {/* Suggested pills */}
        <div className="flex flex-wrap gap-[8px] mb-[32px]">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setQuestion(s)}
              className="px-[16px] py-[8px] border border-surface-variant rounded-full text-[13px] font-medium text-on-surface hover:bg-surface-container-low transition-colors active:opacity-70"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Chat box */}
        <div className="flex flex-col gap-[0px] border border-surface-variant rounded-lg overflow-hidden bg-surface-container-lowest">
          {/* Chat messages */}
          <div className="min-h-[120px] p-[16px] flex flex-col gap-[12px]">
            {question ? (
              <>
                {/* User message */}
                <motion.div
                  key={question + "-user"}
                  className="flex items-start gap-[8px]"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <div className="w-7 h-7 rounded-full bg-surface-container-high border border-surface-variant flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[15px] text-on-surface-variant">
                      person
                    </span>
                  </div>
                  <div className="bg-surface-container-low border border-surface-variant rounded-lg px-[12px] py-[8px] max-w-[80%]">
                    <p className="text-[13px] text-on-surface">{question}</p>
                  </div>
                </motion.div>

                {/* Agent reply */}
                <motion.div
                  key={question + "-agent"}
                  className="flex items-start gap-[8px] self-end flex-row-reverse"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut", delay: 0.35 }}
                >
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[15px] text-on-primary">
                      support_agent
                    </span>
                  </div>
                  <div className="bg-primary rounded-lg px-[12px] py-[8px] max-w-[80%]">
                    <p className="text-[13px] text-on-primary leading-relaxed">
                      {getReplies(question)}
                    </p>
                  </div>
                </motion.div>
              </>
            ) : (
              <motion.div
                className="flex-1 flex items-center justify-center h-[120px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-[13px] text-on-surface-variant">
                  Select a question above or type below...
                </p>
              </motion.div>
            )}
          </div>

          {/* Input row */}
          <div className="border-t border-surface-variant flex items-center gap-[8px] px-[12px] py-[10px] bg-surface-container-low">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask something..."
              className="flex-1 bg-transparent text-[13px] text-on-surface placeholder:text-on-surface-variant focus:outline-none"
            />
            <button
              onClick={() => setQuestion("")}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-primary hover:opacity-80 transition-opacity active:scale-95"
            >
              <span className="material-symbols-outlined text-on-primary text-[15px]">
                arrow_upward
              </span>
            </button>
          </div>
        </div>

        {/* Bottom label */}
        <div className="mt-[12px] flex items-center gap-[12px]">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
            auto_awesome
          </span>
          <span className="text-[12px] text-on-surface-variant uppercase tracking-widest">
            AideDesk 1.0 is live with improved AI capabilities!
          </span>
        </div>
      </div>

      {/* Footer */}
      <OnboardingFooter onBack={onBack} onNext={onNext} hideBack={true} />
    </>
  );
};

export default Step1;
