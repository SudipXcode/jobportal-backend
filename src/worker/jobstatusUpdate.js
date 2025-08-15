// workers/emailWorker.js
import { parentPort } from "worker_threads";
import nodemailer from "nodemailer";

parentPort.on("message", async ({ to, subject, text, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Job Portal" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email notification:', error);
        throw error;
    }
});
