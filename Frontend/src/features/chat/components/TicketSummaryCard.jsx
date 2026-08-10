// Pinned above the message list — shows what the ticket was raised with
// (title, description, attachments) without it ever having been a chat
// message. Reads straight off the ticket, so it can't drift from what was
// actually submitted and never counts toward unread/message totals.
const isImage = (mimetype = "") => mimetype.startsWith("image/");

const TicketSummaryCard = ({ ticket }) => {
  if (!ticket?.description) return null;

  const attachments = ticket.attachments || [];

  return (
    <div className="flex justify-center mb-[16px]">
      <div className="w-full max-w-[560px] rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] px-[18px] py-[16px] shadow-sm dark:shadow-none">
        <div className="flex items-start gap-[10px]">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px] text-neutral-500 dark:text-neutral-400">
              confirmation_number
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-[8px]">
              <span className="text-[13px] font-semibold text-black dark:text-white truncate">
                {ticket.title}
              </span>
              {ticket.ticketNumber && (
                <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 shrink-0">
                  {ticket.ticketNumber}
                </span>
              )}
            </div>
            <p className="text-[12px] text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap break-words mt-[6px]">
              {ticket.description}
            </p>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-[8px] mt-[10px]">
                {attachments.map((a, i) =>
                  isImage(a.mimetype) ? (
                    <a
                      key={i}
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-[64px] h-[64px] rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700"
                      title={a.filename}
                    >
                      <img
                        src={a.url}
                        alt={a.filename}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ) : (
                    <a
                      key={i}
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-[6px] rounded-lg px-[10px] py-[8px] text-[11px] bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title={a.filename}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        attach_file
                      </span>
                      <span className="max-w-[140px] truncate">{a.filename}</span>
                    </a>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketSummaryCard;
