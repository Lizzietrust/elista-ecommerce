import nodemailer from "nodemailer";
import {
  getWelcomeEmailTemplate,
  getWelcomeTextEmail,
} from "./emailTemplates.js";

const sendEmail = async (options) => {
  if (process.env.SKIP_EMAILS === "true") {
    console.log("\n📧 ====== EMAIL SKIPPED (SKIP_EMAILS=true) ======");
    console.log("To:", options.email);
    console.log("Subject:", options.subject);
    console.log("HTML Length:", options.html?.length || 0, "characters");
    console.log("================================================\n");

    return {
      success: true,
      skipped: true,
      messageId: "skipped-by-config",
      note: "Email sending is disabled by SKIP_EMAILS environment variable",
    };
  }

  if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
    console.log("\n📧 ====== DEVELOPMENT EMAIL (Not Sent) ======");
    console.log("To:", options.email);
    console.log("Subject:", options.subject);
    console.log("HTML Length:", options.html?.length || 0, "characters");

    if (options.html) {
      const plainText = options.html
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      console.log("Text Preview:", plainText.substring(0, 200) + "...");
    }

    console.log("===========================================\n");

    return {
      messageId: "dev-mode-simulated-id",
      success: true,
      previewUrl: null,
    };
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_PASSWORD) {
    console.error("❌ SMTP configuration is missing. Email will not be sent.");
    console.log("📧 Email would have been sent to:", options.email);
    console.log("📧 Subject:", options.subject);

    return {
      success: true,
      messageId: "config-missing",
      note: "Email would be sent in production",
    };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_FROM_ADDRESS,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
    text:
      options.text ||
      (options.html
        ? options.html
            .replace(/<[^>]*>/g, "")
            .replace(/\s+/g, " ")
            .trim()
        : ""),
    replyTo: options.replyTo || process.env.EMAIL_REPLY_TO,
    ...(options.attachments && { attachments: options.attachments }),
    ...(options.cc && { cc: options.cc }),
    ...(options.bcc && { bcc: options.bcc }),
  };

  try {
    await Promise.race([
      transporter.verify(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("SMTP connection timeout")), 8000),
      ),
    ]);

    console.log("✅ SMTP connection verified");

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✅ Email sent to ${options.email} - Message ID: ${info.messageId}`,
    );

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
      response: info.response,
    };
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    console.log("📧 Email would have been sent to:", options.email);
    console.log("📧 Subject:", options.subject);

    return {
      success: false,
      error: error.message,
      note: "Email failed but main operation continues",
    };
  }
};

export const sendWelcomeEmail = async (email, name = "") => {
  try {
    const htmlTemplate = getWelcomeEmailTemplate(name);
    const textTemplate = getWelcomeTextEmail(name);

    return await sendEmail({
      email,
      subject: "Welcome to Elista! 🎉 Start Your Shopping Journey",
      html: htmlTemplate,
      text: textTemplate,
    });
  } catch (error) {
    console.error("Error preparing welcome email:", error.message);

    return { success: false, error: error.message };
  }
};

export const sendPasswordResetEmail = async (email, name, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reset Your Password - Elista</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #1A1A1A; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #C17B4D; }
          .logo { font-size: 32px; font-weight: bold; color: #1A1A1A; }
          .logo span { color: #C17B4D; }
          .content { padding: 30px; background-color: #FAFAF9; border-radius: 8px; margin-top: 20px; }
          .btn { display: inline-block; background-color: #C17B4D; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #8C7B6E; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Elista<span>.</span></div>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>Hello ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="btn">Reset Password</a>
            </div>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>This link will expire in 10 minutes.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Elista. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textTemplate = `
Reset Your Password - Elista

Hello ${name},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

If you didn't request this, you can safely ignore this email.

This link will expire in 10 minutes.

© ${new Date().getFullYear()} Elista. All rights reserved.
    `;

    return await sendEmail({
      email,
      subject: "Reset Your Password - Elista",
      html: htmlTemplate,
      text: textTemplate,
    });
  } catch (error) {
    console.error("Error preparing password reset email:", error.message);
    return { success: false, error: error.message };
  }
};

export const sendOrderConfirmationEmail = async (email, name, orderDetails) => {
  try {
    const subject = `Order Confirmation #${orderDetails.orderId}`;

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #1A1A1A; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #C17B4D; }
          .logo { font-size: 32px; font-weight: bold; color: #1A1A1A; }
          .logo span { color: #C17B4D; }
          .content { padding: 30px; background-color: #FAFAF9; border-radius: 8px; margin-top: 20px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #8C7B6E; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Elista<span>.</span></div>
          </div>
          <div class="content">
            <h2>Thank You for Your Order!</h2>
            <p>Hello ${name},</p>
            <p>Your order #${orderDetails.orderId} has been confirmed.</p>
            <div class="order-details">
              <strong>Order Details:</strong><br>
              Total: $${orderDetails.total}<br>
              Status: ${orderDetails.status || "Confirmed"}
            </div>
            <p>We'll notify you when your order ships.</p>
            <p>Thank you for shopping with Elista!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Elista. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textTemplate = `
Thank You for Your Order!

Hello ${name},

Your order #${orderDetails.orderId} has been confirmed.

Order Details:
Total: $${orderDetails.total}
Status: ${orderDetails.status || "Confirmed"}

We'll notify you when your order ships.

Thank you for shopping with Elista!

© ${new Date().getFullYear()} Elista. All rights reserved.
    `;

    return await sendEmail({
      email,
      subject: subject,
      html: htmlTemplate,
      text: textTemplate,
    });
  } catch (error) {
    console.error("Error preparing order confirmation email:", error.message);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeBackEmail = async (email, name = "") => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome Back!</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .content {
            background: white;
            border-radius: 10px;
            padding: 40px 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #333;
            margin: 0;
            font-size: 28px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="header">
              <div class="logo">🎉</div>
              <h1>Welcome Back!</h1>
            </div>
            
            <p>We're so glad to have you back ${name ? `, ${name}` : ""}!</p>
            
            <p>You've been missed! As a thank you for returning, here's a special welcome back code:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #f7f9fc; padding: 15px; border-radius: 8px; display: inline-block;">
                <strong style="font-size: 24px; letter-spacing: 2px;">WELCOMEBACK10</strong>
              </div>
              <p style="font-size: 12px; color: #666; margin-top: 10px;">Use code for 10% off your next purchase</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/shop" class="button">
                Shop Now
              </a>
            </div>
            
            <div class="footer">
              <p>
                <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/unsubscribe?email=${encodeURIComponent(email)}">
                  Unsubscribe
                </a>
              </p>
              <p>&copy; ${new Date().getFullYear()} ${process.env.STORE_NAME || "Elista"}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Welcome Back!

We're so glad to have you back ${name ? `, ${name}` : ""}!

You've been missed! As a thank you for returning, here's a special welcome back code:

WELCOMEBACK10 - Use for 10% off your next purchase

Shop Now: ${process.env.FRONTEND_URL || "http://localhost:3000"}/shop

---
Unsubscribe: ${process.env.FRONTEND_URL || "http://localhost:3000"}/unsubscribe?email=${encodeURIComponent(email)}

© ${new Date().getFullYear()} ${process.env.STORE_NAME || "Elista"}. All rights reserved.
    `;

    return await sendEmail({
      email,
      subject: `Welcome Back to ${process.env.STORE_NAME || "Elista"}! 🎉`,
      html,
      text,
    });
  } catch (error) {
    console.error("Error preparing welcome back email:", error.message);
    return { success: false, error: error.message };
  }
};

export const sendUnsubscribeConfirmation = async (email) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribe Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .content {
            background: white;
            border-radius: 10px;
            padding: 40px 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #999;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="logo">😢</div>
            <h2>You've Been Unsubscribed</h2>
            <p>We're sorry to see you go. You have been successfully unsubscribed from our newsletter.</p>
            <p>If this was a mistake, you can resubscribe at any time:</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" class="button">
                Resubscribe
              </a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              You won't receive any more emails from us unless you choose to resubscribe.
            </p>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${process.env.STORE_NAME || "Elista"}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
You've Been Unsubscribed

We're sorry to see you go. You have been successfully unsubscribed from our newsletter.

If this was a mistake, you can resubscribe at any time: ${process.env.FRONTEND_URL || "http://localhost:3000"}

You won't receive any more emails from us unless you choose to resubscribe.

© ${new Date().getFullYear()} ${process.env.STORE_NAME || "Elista"}. All rights reserved.
    `;

    return await sendEmail({
      email,
      subject: `Goodbye from ${process.env.STORE_NAME || "Elista"}`,
      html,
      text,
    });
  } catch (error) {
    console.error(
      "Error preparing unsubscribe confirmation email:",
      error.message,
    );
    return { success: false, error: error.message };
  }
};

export const sendNewsletterCampaign = async (
  email,
  subject,
  contentHtml,
  contentText,
) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #f7f9fc;
          }
          .content {
            background: white;
            border-radius: 10px;
            padding: 40px 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #999;
          }
          .unsubscribe-link {
            color: #999;
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            ${contentHtml}
            
            <div class="footer">
              <p>
                You received this email because you're subscribed to our newsletter.
                <br>
                <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/unsubscribe?email=${encodeURIComponent(email)}" class="unsubscribe-link">
                  Unsubscribe
                </a>
              </p>
              <p>&copy; ${new Date().getFullYear()} ${process.env.STORE_NAME || "Elista"}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return await sendEmail({
      email,
      subject,
      html,
      text:
        contentText ||
        (contentHtml
          ? contentHtml
              .replace(/<[^>]*>/g, "")
              .replace(/\s+/g, " ")
              .trim()
          : ""),
    });
  } catch (error) {
    console.error("Error preparing newsletter campaign email:", error.message);
    return { success: false, error: error.message };
  }
};

export default sendEmail;
