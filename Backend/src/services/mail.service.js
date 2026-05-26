import nodemailer from "nodemailer";
import { config } from "../config/config.js";

// // Create a transporter using Gmail and OAuth2 authentication
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     type: "OAuth2",
//     user: config.GOOGLE_USER_EMAIL,
//     clientSecret: config.GOOGLE_CLIENT_SECRET,
//     refreshToken: config.GOOGLE_REFRESH_TOKEN,
//     clientId: config.GOOGLE_CLIENT_ID,
//   },
// });

// // Verify the transporter configuration
// transporter.verify((error, success) => {
//   if (error) {
//     console.error("Error connecting to email server:", error);
//   } else {
//     console.log("📧 Email server is ready to send messages");
//   }
// });

// export async function sendEmail({ to, subject, html, text }) {
//   try {
//     const info = await transporter.sendMail({
//       from: `"AideDesk Team" <${config.GOOGLE_USER_EMAIL}>`, // sender address
//       to, // list of receivers
//       subject, // Subject line
//       text, //plain text body
//       html, // html body
//     });

//     console.log("Email sent:", info.messageId);
//     return true;
//   } catch (error) {
//     console.error("Error sending email:", error);
//     return false;
//   }
// }
// ============================================
// Create Nodemailer transporter (Gmail OAuth2)
// ============================================
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    // type: "OAuth2",
    user: process.env.GOOGLE_USER_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
    // clientId: process.env.GOOGLE_CLIENT_ID,
    // clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email server verification failed:");
    console.error("   Error name:", error.name);
    console.error("   Error code:", error.code);
    console.error("   Error message:", error.message);

    if (error.code === "ENETUNREACH") {
      console.error(
        "   💡 Hint: This is an IPv6 issue. Ensure dns.setDefaultResultOrder('ipv4first') is called in server.js BEFORE any imports.",
      );
    }
    if (error.code === "EAUTH") {
      console.error(
        "   💡 Hint: OAuth2 credentials may be invalid or expired. Regenerate your GOOGLE_REFRESH_TOKEN.",
      );
    }
  } else {
    console.log("📧 Email server is ready to send messages");
  }
});

// Function to send email
export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"ModelVerse AI Team" <${process.env.GOOGLE_USER_EMAIL}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, //plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    return false;
  }
}