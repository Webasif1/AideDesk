import nodemailer from 'nodemailer';
import { config } from '../config/config.js';

// Create a transporter using Gmail and OAuth2 authentication
const transporter = nodemailer.createTransport({
  // service: 'gmail',
  // auth: {
  //   type: 'OAuth2',
  //   user: config.GOOGLE_USER_EMAIL,
  //   clientSecret: config.GOOGLE_CLIENT_SECRET,
  //   refreshToken: config.GOOGLE_REFRESH_TOKEN,
  //   clientId: config.GOOGLE_CLIENT_ID,
  // },
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify the transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('📧 Email server is ready to send messages');
  }
});

export async function sendEmail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: `'AideDesk Team' <${config.GOOGLE_USER_EMAIL}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, //plain text body
      html, // html body
    });

    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
