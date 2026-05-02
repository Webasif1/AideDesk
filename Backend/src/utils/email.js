import { sendEmail } from '../services/mail.service.js';

export const sendVerificationEmail = async ({ email, name, verificationLink }) => {
  const subject = 'Verify Your Account - AideDesk';
  const text = `Hi ${name}, please verify your account: ${verificationLink}`;
  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <table align="center" width="600" style="background: #ffffff; border-radius: 10px; padding: 20px;">
      <tr><td style="text-align: center;"><h2 style="color: #333;">Welcome to AideDesk 🚀</h2></td></tr>
      <tr>
        <td>
          <p style="font-size: 16px; color: #555;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #555;">We're excited to have you on board! Please verify your email by clicking below.</p>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 20px;">
          <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            Verify Account
          </a>
        </td>
      </tr>
      <tr>
        <td>
          <p style="font-size: 14px; color: #777;">Or copy this link:</p>
          <p style="word-break: break-all; font-size: 14px;"><a href="${verificationLink}">${verificationLink}</a></p>
        </td>
      </tr>
      <tr><td><p style="font-size: 14px; color: #777;">If you didn't create this account, ignore this email.</p></td></tr>
      <tr><td style="padding-top: 20px;"><p style="font-size: 14px; color: #555;">Regards,<br/><strong>AideDesk Team</strong></p></td></tr>
    </table>
  </div>`;
  return await sendEmail({ to: email, subject, text, html });
};

export const sendPasswordResetEmail = async ({ email, name, resetLink }) => {
  const subject = 'Reset Your Password - AideDesk';
  const text = `Hi ${name}, reset your password here: ${resetLink} (expires in 15 minutes)`;
  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <table align="center" width="600" style="background: #ffffff; border-radius: 10px; padding: 20px;">
      <tr><td style="text-align: center;"><h2 style="color: #333;">Password Reset Request</h2></td></tr>
      <tr>
        <td>
          <p style="font-size: 16px; color: #555;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #555;">We received a request to reset your password. This link expires in <strong>15 minutes</strong>.</p>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 20px;">
          <a href="${resetLink}" style="background-color: #e53e3e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">
            Reset Password
          </a>
        </td>
      </tr>
      <tr>
        <td>
          <p style="font-size: 14px; color: #777;">Or copy this link:</p>
          <p style="word-break: break-all; font-size: 14px;"><a href="${resetLink}">${resetLink}</a></p>
        </td>
      </tr>
      <tr><td><p style="font-size: 14px; color: #777;">If you didn't request this, ignore this email.</p></td></tr>
      <tr><td style="padding-top: 20px;"><p style="font-size: 14px; color: #555;">Regards,<br/><strong>AideDesk Team</strong></p></td></tr>
    </table>
  </div>`;
  return await sendEmail({ to: email, subject, text, html });
};

// ============================================
// Agent onboarding invite email
// Sent by the system when an admin adds a new agent.
// Contains credentials + a one-click verify-and-login link.
// ============================================
export const sendAgentInviteEmail = async ({
  email,
  agentName,
  companyName,
  loginEmail,
  tempPassword,
  verifyLink,
  frontendUrl = 'http://localhost:5173',
}) => {
  const subject = `You've been added as a Support Agent — ${companyName}`;
  const loginUrl = `${frontendUrl}/login`;
  const changePasswordUrl = `${frontendUrl}/agent/profile`;

  const text = `
Hi ${agentName},

You have been added as a support agent for ${companyName} on AideDesk.

Your login credentials:
  Email:    ${loginEmail}
  Password: ${tempPassword}

Click the link below to verify your account and go to the login page:
${verifyLink}

After logging in:
  1. Go to Profile → Change Password and set a password you'll remember.
  2. Update your profile image and display name if you wish.
  3. Your status will be set to "offline" by default — switch it to "online" when you're ready to take chats.

If you have any issues, contact your admin or reply to this email.

Regards,
AideDesk Team
  `.trim();

  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f0f4f8; padding: 30px;">
    <table align="center" width="620" cellpadding="0" cellspacing="0"
           style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px;">Welcome to AideDesk</h1>
          <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 15px;">You've joined <strong>${companyName}</strong> as a Support Agent</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding: 32px 36px 0;">
          <p style="font-size: 16px; color: #374151; margin: 0 0 16px;">Hi <strong>${agentName}</strong>,</p>
          <p style="font-size: 15px; color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
            Your admin has added you as a support agent on <strong>AideDesk</strong> for
            <strong>${companyName}</strong>. Use the credentials below to log in, then follow
            the steps to secure your account.
          </p>
        </td>
      </tr>

      <!-- Credentials box -->
      <tr>
        <td style="padding: 0 36px;">
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 28px;">
            <tr>
              <td style="padding: 20px 24px;">
                <p style="font-size: 12px; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 16px;">
                  Your Login Credentials
                </p>
                <table width="100%">
                  <tr>
                    <td style="font-size: 14px; color: #64748b; padding: 6px 0; width: 110px;">Email</td>
                    <td style="font-size: 14px; color: #1e293b; font-weight: 600; padding: 6px 0;">${loginEmail}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; color: #64748b; padding: 6px 0;">Password</td>
                    <td style="padding: 6px 0;">
                      <span style="font-family: 'Courier New', monospace; font-size: 15px; font-weight: 700;
                                   color: #1e293b; background: #e0f2fe; padding: 3px 10px; border-radius: 4px;
                                   letter-spacing: 1px;">
                        ${tempPassword}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- CTA button -->
      <tr>
        <td style="padding: 0 36px 28px; text-align: center;">
          <a href="${verifyLink}"
             style="display: inline-block; background: #2563eb; color: #ffffff; font-size: 15px;
                    font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 8px;">
            ✅ Verify Account &amp; Go to Login
          </a>
          <p style="font-size: 12px; color: #94a3b8; margin: 12px 0 0;">
            This link expires in 7 days. Clicking it will verify your account and take you directly to the login page.
          </p>
        </td>
      </tr>

      <!-- Steps divider -->
      <tr>
        <td style="padding: 0 36px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="border-top: 1px solid #e2e8f0;">
            <tr>
              <td style="padding-top: 24px;">
                <p style="font-size: 13px; font-weight: 700; color: #374151; margin: 0 0 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                  After You Log In — 3 Quick Steps
                </p>
                <table width="100%">
                  <tr>
                    <td style="vertical-align: top; width: 28px; padding: 4px 0;">
                      <span style="display: inline-block; width: 22px; height: 22px; background: #dbeafe;
                                   border-radius: 50%; text-align: center; line-height: 22px; font-size: 12px;
                                   font-weight: 700; color: #2563eb;">1</span>
                    </td>
                    <td style="font-size: 14px; color: #4b5563; padding: 4px 0 4px 10px; line-height: 1.5;">
                      <strong>Change your password</strong> — go to
                      <a href="${changePasswordUrl}" style="color: #2563eb;">Profile → Change Password</a>
                      and replace the temporary one with something only you know.
                    </td>
                  </tr>
                  <tr>
                    <td style="vertical-align: top; width: 28px; padding: 4px 0;">
                      <span style="display: inline-block; width: 22px; height: 22px; background: #dbeafe;
                                   border-radius: 50%; text-align: center; line-height: 22px; font-size: 12px;
                                   font-weight: 700; color: #2563eb;">2</span>
                    </td>
                    <td style="font-size: 14px; color: #4b5563; padding: 4px 0 4px 10px; line-height: 1.5;">
                      <strong>Update your profile</strong> — add a photo and confirm your display name so customers know who they're chatting with.
                    </td>
                  </tr>
                  <tr>
                    <td style="vertical-align: top; width: 28px; padding: 4px 0;">
                      <span style="display: inline-block; width: 22px; height: 22px; background: #dbeafe;
                                   border-radius: 50%; text-align: center; line-height: 22px; font-size: 12px;
                                   font-weight: 700; color: #2563eb;">3</span>
                    </td>
                    <td style="font-size: 14px; color: #4b5563; padding: 4px 0 4px 10px; line-height: 1.5;">
                      <strong>Go online</strong> — your status starts as "offline". Switch it to "online" in the dashboard when you're ready to accept chats.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Security note -->
      <tr>
        <td style="padding: 0 36px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="background: #fefce8; border: 1px solid #fde68a; border-radius: 8px;">
            <tr>
              <td style="padding: 14px 18px; font-size: 13px; color: #92400e; line-height: 1.5;">
                ⚠️ <strong>Keep your credentials private.</strong>
                Do not share this email or your password with anyone. AideDesk staff will never ask for your password.
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background: #f8fafc; padding: 20px 36px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 13px; color: #94a3b8; margin: 0;">
            Sent by <strong>AideDesk</strong> on behalf of <strong>${companyName}</strong>.<br/>
            If you weren't expecting this email, you can safely ignore it.
          </p>
        </td>
      </tr>

    </table>
  </div>`;

  return await sendEmail({ to: email, subject, text, html });
};
