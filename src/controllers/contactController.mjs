import nodemailer from 'nodemailer';
import { contactMessagesCollection } from '../models/collections.mjs';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendContactMessage(req, res, next) {
  const { senderName, senderEmail, subject, message } = req.body;

  try {
    if (!senderName || !senderEmail || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Store message in database
    try {
      await contactMessagesCollection().insertOne({
        name: senderName,
        email: senderEmail,
        subject,
        message,
        timestamp: new Date(),
        status: 'received',
      });
    } catch (dbError) {
      console.warn('[CONTACT] Database error:', dbError.message);
    }

    // Send email
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER,
      subject: `New Contact: ${subject}`,
      text: `From: ${senderName} (${senderEmail})\n\n${message}`,
    };

    await transporter.sendMail(mailOptions);

    console.log('[CONTACT] Message sent from:', senderEmail);
    res.json({ status: 'success', message: 'Email sent successfully!' });
  } catch (error) {
    console.error('[CONTACT] Error:', error.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
}

export function getMailTransporter() {
  return transporter;
}
