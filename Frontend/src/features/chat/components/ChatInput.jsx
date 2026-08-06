import { useState, useRef } from "react";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,application/pdf";

// `lockedReason` replaces the whole composer — used when the account is
// suspended, where the conversation stays readable but nothing can be sent.
const ChatInput = ({ onSend, disabled = false, lockedReason = "" }) => {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if ((!trimmed && !attachment) || disabled) return;
    onSend({ content: trimmed, attachment });
    setText("");
    setAttachment(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Max 10MB.");
      return;
    }
    setAttachment(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (lockedReason) {
    return (
      <div className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#111] px-[16px] py-[18px]">
        <div className="flex items-center justify-center gap-[10px] text-center">
          <span className="material-symbols-outlined text-[18px] text-neutral-400">
            lock
          </span>
          <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
            {lockedReason}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] px-[16px] pt-[12px] pb-[16px] transition-all ${
        focused ? "bg-white dark:bg-[#1a1a1a]" : "bg-neutral-50 dark:bg-[#111]"
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-[2px] mb-[8px]">
        <button
          type="button"
          title="Attach file"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="p-[6px] rounded-lg transition-colors text-neutral-400 dark:text-neutral-600 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">
            attach_file
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          onChange={handleFile}
          hidden
        />
      </div>

      {/* Attachment preview */}
      {attachment && (
        <div className="flex items-center gap-[10px] mb-[8px] px-[12px] py-[8px] bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
          <span className="material-symbols-outlined text-[18px] text-neutral-500 dark:text-neutral-400">
            {attachment.type.startsWith("image/") ? "image" : "picture_as_pdf"}
          </span>
          <span className="text-[12px] text-neutral-700 dark:text-neutral-300 flex-1 truncate">
            {attachment.name}
          </span>
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
            {(attachment.size / 1024).toFixed(1)} KB
          </span>
          <button
            onClick={removeAttachment}
            className="p-[2px] rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Textarea */}
      <div
        className={`flex items-end gap-[10px] border rounded-xl px-[14px] py-[10px] transition-all ${
          focused
            ? "border-black dark:border-white bg-white dark:bg-[#1a1a1a] shadow-sm dark:shadow-none"
            : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a]"
        }`}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent outline-none text-[13px] text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 leading-relaxed min-h-[22px] max-h-[120px] overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        />

        <button
          onClick={handleSend}
          disabled={(!text.trim() && !attachment) || disabled}
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
            text.trim() || attachment
              ? "bg-black dark:bg-white text-white dark:text-black hover:opacity-80 active:scale-95"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600 cursor-not-allowed"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">send</span>
        </button>
      </div>

      <p className="text-[10px] text-neutral-300 dark:text-neutral-600 mt-[6px] text-center">
        This conversation is being recorded for quality assurance.
      </p>
    </div>
  );
};

export default ChatInput;
