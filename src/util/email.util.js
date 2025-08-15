import crypto from 'crypto';
import nodemailer from 'nodemailer';

const otpStore = new Map();

// Generate 6-digit OTP
export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash OTP using SHA256
function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

// Send OTP and store hashed version
export const sendOtp = async (email) => {


  try {
    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(email, { otp: hashedOtp, expires });

    // Optional: Cleanup expired OTPs (lazy GC)
    setTimeout(() => {
      const record = otpStore.get(email);
      if (record && record.expires < Date.now()) {
        otpStore.delete(email);
      }
    }, 5 * 60 * 1000 + 1000); // cleanup after ~5 mins

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailoptions = {
      from: `Careernext <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'OTP for Email Verification',
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    }
    return await transporter.sendMail(mailoptions)
  } catch (error) {
    console.log(error)
    throw new Error("Failed to send otp");
  }
};


// Constant-time comparison
function safeCompare(a, b) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
}

// Verify OTP
export const verifyOtp = ({ email, inputOtp }) => {
  try {
    const record = otpStore.get(email);

    if (!record) throw new Error('No OTP found');

    if (record.expires < Date.now()) {
      otpStore.delete(email);
      throw new Error('OTP expired');
    }

    const inputHash = hashOtp(inputOtp);
    if (!safeCompare(record.otp, inputHash)) {
      throw new Error('Invalid OTP');
    }

    otpStore.delete(email); // Clear after success
    return { success: true };

  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error; // re-throw so global error handler or caller can catch
  }
};



export const reactivateUserEmailNotification = async ({ email }) => {
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
      from: `Careernext <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your account has been re-activated',
      text: 'Please login to your account with your credentials.',
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};


