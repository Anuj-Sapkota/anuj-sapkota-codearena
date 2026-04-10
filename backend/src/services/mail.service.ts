import nodemailer from "nodemailer";
import config from "../configs/config.js";

const port = Number(config.resetLink.emailPort) || 587;

// Port 465 = SMTPS (secure: true)
// Port 587 = STARTTLS (secure: false, but upgrades via STARTTLS)
// Most cloud providers block 465 — use 587 in production
const transporter = nodemailer.createTransport({
  host: config.resetLink.emailHost || "smtp.gmail.com",
  port,
  secure: port === 465,
  auth: {
    user: config.resetLink.emailUser,
    pass: config.resetLink.emailPassword,
  },
  tls: {
    // Don't fail on invalid certs in dev
    rejectUnauthorized: process.env.NODE_ENV === "production",
  },
});

const FROM = `"CodeArena" <${config.resetLink.emailUser}>`;

export const sendResetEmail = async (email: string, token: string) => {
  const resetUrl = `${config.frontendUrl}/password/reset/${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Reset your CodeArena password",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
        <div style="background:#0f172a;padding:24px 32px">
          <h1 style="color:#fff;font-size:20px;font-weight:900;margin:0;letter-spacing:-0.5px">Code<span style="color:#138b51">Arena</span></h1>
        </div>
        <div style="padding:32px">
          <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 12px">Password Reset Request</h2>
          <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px">
            We received a request to reset your password. Click the button below — this link expires in <strong>1 hour</strong>.
          </p>
          <div style="text-align:center;margin:32px 0">
            <a href="${resetUrl}"
               style="display:inline-block;background:#138b51;color:#fff;padding:14px 32px;text-decoration:none;border-radius:4px;font-weight:700;font-size:13px;letter-spacing:0.5px;text-transform:uppercase">
              Reset Password
            </a>
          </div>
          <p style="color:#94a3b8;font-size:12px;margin:0">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
        <div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e5e7eb">
          <p style="color:#94a3b8;font-size:11px;margin:0">CodeArena &copy; ${new Date().getFullYear()}</p>
        </div>
      </div>
    `,
  });

  console.log(`[Mail] Reset email sent to ${email}`);
};

export const sendVerificationEmail = async (email: string, otp: string) => {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Your CodeArena Creator verification code",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
        <div style="background:#0f172a;padding:24px 32px">
          <h1 style="color:#fff;font-size:20px;font-weight:900;margin:0;letter-spacing:-0.5px">Code<span style="color:#138b51">Arena</span></h1>
        </div>
        <div style="padding:32px">
          <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 12px">Creator Program Verification</h2>
          <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px">
            Use the code below to verify your identity. It expires in <strong>10 minutes</strong>.
          </p>
          <div style="text-align:center;margin:32px 0">
            <div style="display:inline-block;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;padding:20px 40px">
              <span style="font-size:32px;font-weight:900;letter-spacing:10px;color:#0f172a;font-family:monospace">${otp}</span>
            </div>
          </div>
          <p style="color:#94a3b8;font-size:12px;margin:0">
            If you didn't apply for the Creator Program, please secure your account immediately.
          </p>
        </div>
        <div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e5e7eb">
          <p style="color:#94a3b8;font-size:11px;margin:0">CodeArena &copy; ${new Date().getFullYear()}</p>
        </div>
      </div>
    `,
  });

  console.log(`[Mail] OTP sent to ${email}`);
};
