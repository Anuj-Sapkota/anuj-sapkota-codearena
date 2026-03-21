import nodemailer from "nodemailer";
import config from "../configs/config.js";

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: config.resetLink.emailHost, // e.g., smtp.gmail.com or "smtp.mailtrap.io"
  port: Number(config.resetLink.emailPort),
  secure: true, // true for 465, false for other ports
  auth: {
    user: config.resetLink.emailUser,
    pass: config.resetLink.emailPassword,
  },
});

export const sendResetEmail = async (email: string, token: string) => {
  const resetUrl = `${config.frontendUrl}/password/reset/${token}`;

  const mailOptions = {
    from: `"CodeArena Support" <${config.resetLink.emailUser}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #4F46E5;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below to proceed. <strong>This link expires in 1 hour.</strong></p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 12px;">If you did not request this, please ignore this email or contact support if you have concerns.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 11px; color: #999;">CodeArena Platform &copy; 2026</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reset email successfully sent to: ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send reset email");
  }
};

/**
 * Sends a verification OTP email to the user applying for Creator status.
 */
export const sendVerificationEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: `"CodeArena Creator Program" <${config.resetLink.emailUser}>`,
    to: email,
    subject: "Verify your Creator Identity",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #10B981;">Welcome to the Creator Program</h2>
        <p>Hello,</p>
        <p>Thank you for applying to be a teacher on CodeArena. To complete your identity verification, please use the following One-Time Password (OTP):</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; background-color: #F3F4F6; color: #111827; padding: 15px 30px; font-size: 24px; font-weight: bold; border-radius: 8px; letter-spacing: 5px; border: 1px solid #D1D5DB;">
            ${otp}
          </span>
        </div>
        <p><strong>This code expires in 10 minutes.</strong></p>
        <p style="color: #666; font-size: 12px;">If you did not initiate this application, please secure your account immediately.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 11px; color: #999;">CodeArena Platform &copy; 2026</p>
      </div>
    `,
  };

  try {
    // Re-use the existing 'transporter' defined at the top of your file
    await transporter.sendMail(mailOptions);
    console.log(`Verification OTP successfully sent to: ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};
