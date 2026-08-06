import { sendEmail } from "../services/mail.service.js";

// ============================================
// Account status notices (suspended / removed / reinstated)
//
// Only ever sent when the admin actually typed a reason — an empty reason box
// means the action goes through silently and nothing is emailed. Callers must
// enforce that; `sendAccountStatusEmail` also refuses an empty reason so a new
// call site can't accidentally mail someone a blank notice.
// ============================================

const NOTICE_COPY = {
  suspended: {
    heading: "Your account has been suspended",
    accent: "#f59e0b",
    accentSoft: "#fef3c7",
    accentText: "#92400e",
    lead: (companyName) =>
      `Your access to the ${companyName} support portal has been suspended by an administrator.`,
    detail:
      "You can still sign in and read your existing tickets and conversations, but you will not be able to create tickets, send messages, or make any other changes until the suspension is lifted.",
  },
  deleted: {
    heading: "Your account has been removed",
    accent: "#dc2626",
    accentSoft: "#fee2e2",
    accentText: "#991b1b",
    lead: (companyName) =>
      `Your account on the ${companyName} support portal has been removed by an administrator.`,
    detail:
      "You can no longer sign in. Your past tickets and conversations have been kept, so if the account is reinstated you will pick up exactly where you left off.",
  },
  active: {
    heading: "Your account has been reinstated",
    accent: "#16a34a",
    accentSoft: "#dcfce7",
    accentText: "#166534",
    lead: (companyName) =>
      `Your access to the ${companyName} support portal has been restored.`,
    detail:
      "You can sign in again and continue your existing tickets and conversations right where you left off.",
  },
};

export const sendAccountStatusEmail = ({
  email,
  recipientName = "there",
  companyName = "your support team",
  accountStatus,
  reason,
  loginUrl = "http://localhost:5173/customer/login",
}) => {
  const copy = NOTICE_COPY[accountStatus];
  const trimmedReason = (reason || "").trim();

  // No template or no reason → nothing to send.
  if (!copy || !trimmedReason || !email) return Promise.resolve(null);

  const subject = `${copy.heading} — ${companyName}`;

  const text = `
Hi ${recipientName},

${copy.lead(companyName)}

${copy.detail}

Reason given by the administrator:
  ${trimmedReason}

If you believe this is a mistake, reply to this email or contact ${companyName} support.

Regards,
AideDesk Team
  `.trim();

  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f0f4f8; padding: 30px;">
    <table align="center" width="620" cellpadding="0" cellspacing="0"
           style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="background: ${copy.accent}; padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 23px; letter-spacing: -0.5px;">${copy.heading}</h1>
          <p style="color: #ffffff; opacity: 0.85; margin: 8px 0 0; font-size: 15px;">${companyName} Support Portal</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding: 32px 36px 0;">
          <p style="font-size: 16px; color: #374151; margin: 0 0 16px;">Hi <strong>${recipientName}</strong>,</p>
          <p style="font-size: 15px; color: #6b7280; line-height: 1.6; margin: 0 0 16px;">${copy.lead(companyName)}</p>
          <p style="font-size: 15px; color: #6b7280; line-height: 1.6; margin: 0 0 24px;">${copy.detail}</p>
        </td>
      </tr>

      <!-- Reason -->
      <tr>
        <td style="padding: 0 36px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="background: ${copy.accentSoft}; border-radius: 8px;">
            <tr>
              <td style="padding: 18px 22px;">
                <p style="font-size: 12px; font-weight: 700; color: ${copy.accentText}; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 8px;">
                  Reason given
                </p>
                <p style="font-size: 15px; color: ${copy.accentText}; line-height: 1.6; margin: 0;">${trimmedReason}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      ${
        accountStatus === "deleted"
          ? ""
          : `<!-- CTA -->
      <tr>
        <td style="padding: 0 36px 28px; text-align: center;">
          <a href="${loginUrl}"
             style="display: inline-block; background: #0f172a; color: #ffffff; font-size: 15px;
                    font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 8px;">
            Open your support portal
          </a>
        </td>
      </tr>`
      }

      <!-- Footer -->
      <tr>
        <td style="background: #f8fafc; padding: 20px 36px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 13px; color: #94a3b8; margin: 0;">
            Sent by <strong>AideDesk</strong> on behalf of <strong>${companyName}</strong>.<br/>
            If you believe this is a mistake, contact ${companyName} support.
          </p>
        </td>
      </tr>

    </table>
  </div>`;

  return sendEmail({ to: email, subject, text, html });
};
