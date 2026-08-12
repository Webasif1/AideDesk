import { useEffect, useRef, useState } from "react";
import {
  getCustomerNote,
  saveCustomerNote,
} from "../../user/services/user.api";

// Private admin note for one customer. Opens with whatever was written before,
// saves when closed — including when the panel unmounts because the admin
// navigated away or switched customer, which is the easiest way to lose an edit.
//
// No redux slice: this is a single record scoped to whatever customer is open,
// and nothing else in the app reads it.
const CustomerNoteSticky = ({ customerId, customerName, onClose }) => {
  // `null` means "not loaded yet" — deriving loading from the value avoids a
  // synchronous setState inside the load effect.
  const [body, setBody] = useState(null);
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  const loading = body === null;

  // Mirrors of the live values, read only by the unmount save. Keeping them in
  // refs means the save effect doesn't re-run on every keystroke.
  const bodyRef = useRef("");
  const savedRef = useRef("");

  useEffect(() => {
    bodyRef.current = body ?? "";
    savedRef.current = saved;
  }, [body, saved]);

  useEffect(() => {
    let cancelled = false;

    getCustomerNote(customerId)
      .then((res) => {
        if (cancelled) return;
        const text = res?.data?.body || "";
        setBody(text);
        setSaved(text);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Couldn't load this note.");
        setBody("");
      });

    return () => {
      cancelled = true;
    };
  }, [customerId]);

  // Save on unmount. Fires for every close path, so the close button only has to
  // unmount the component.
  useEffect(() => {
    return () => {
      const current = bodyRef.current;
      if (current === savedRef.current) return;
      // Deliberately not awaited — the component is going away either way.
      saveCustomerNote({ id: customerId, body: current }).catch(() => {});
    };
  }, [customerId]);

  useEffect(() => {
    if (!loading) textareaRef.current?.focus();
  }, [loading]);

  const dirty = body !== saved;

  return (
    <div className="mx-[16px] mb-[12px] rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-[12px] py-[8px] border-b border-amber-200/70 dark:border-amber-900/60">
        <div className="flex items-center gap-[6px] min-w-0">
          <span className="material-symbols-outlined text-[15px] text-amber-600 dark:text-amber-400 shrink-0">
            sticky_note_2
          </span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 truncate">
            Note · {customerName}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          title="Save and close"
          className="p-[3px] rounded hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[15px] text-amber-600 dark:text-amber-400">
            close
          </span>
        </button>
      </div>

      {loading ? (
        <div className="px-[12px] py-[16px] text-[11px] text-amber-700/70 dark:text-amber-500/70">
          Loading…
        </div>
      ) : (
        <>
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={5000}
            placeholder="Only admins can see this."
            className="w-full min-h-[110px] resize-y bg-transparent px-[12px] py-[10px] text-[12px] leading-relaxed text-amber-950 dark:text-amber-100 placeholder:text-amber-600/50 dark:placeholder:text-amber-500/40 focus:outline-none"
          />
          <div className="px-[12px] pb-[8px] flex items-center justify-between">
            <span className="text-[10px] text-amber-700/70 dark:text-amber-500/70">
              {error || (dirty ? "Saves when you close" : "Saved")}
            </span>
            <span className="text-[10px] text-amber-700/50 dark:text-amber-500/50">
              {body.length}/5000
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerNoteSticky;
