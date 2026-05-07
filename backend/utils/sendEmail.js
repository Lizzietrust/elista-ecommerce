import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
    console.log("📧 ====== DEVELOPMENT EMAIL ======");
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

    console.log("📧 ===============================");

    return {
      messageId: "dev-mode-simulated-id",
      previewUrl: null,
      success: true,
    };
  }

  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD
  ) {
    console.error("❌ SMTP configuration is missing in .env file");
    throw new Error("Email service is not configured");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });

  try {
    await transporter.verify();
    console.log("SMTP connection verified successfully");
  } catch (error) {
    console.error("❌ SMTP connection failed:", error.message);
    throw new Error(`Failed to connect to email server: ${error.message}`);
  }

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${
      process.env.EMAIL_FROM_ADDRESS
    }>`,
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
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Email sent to ${options.email} - Message ID: ${info.messageId}`,
    );

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
      response: info.response,
    };
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (email, name = "") => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Our Newsletter</title>
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
        .header p {
          color: #666;
          font-size: 16px;
        }
        .logo {
          font-size: 48px;
          margin-bottom: 20px;
        }
        .benefits {
          background: #f7f9fc;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
        }
        .benefits ul {
          margin: 0;
          padding-left: 20px;
        }
        .benefits li {
          margin: 10px 0;
          color: #555;
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
        .unsubscribe-link {
          color: #999;
          text-decoration: underline;
        }
        @media only screen and (max-width: 600px) {
          .content {
            padding: 30px 20px;
          }
          .header h1 {
            font-size: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <div class="header">
            <div class="logo">🎉</div>
            <h1>Welcome to Our Newsletter!</h1>
            <p>Thank you for subscribing ${name ? `, ${name}` : ""}!</p>
          </div>
          
          <p>We're excited to have you on board. You'll now receive the latest updates, exclusive deals, and style inspiration directly in your inbox.</p>
          
          <div class="benefits">
            <strong>What you can expect:</strong>
            <ul>
              <li>✨ <strong>Exclusive Deals</strong> - Member-only discounts and early access to sales</li>
              <li>🆕 <strong>New Arrivals</strong> - Be the first to know about new products</li>
              <li>💡 <strong>Style Tips</strong> - Fashion inspiration and styling guides</li>
              <li>🎁 <strong>Special Offers</strong> - Birthday discounts and seasonal promotions</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/shop" class="button">
              Start Shopping Now
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            We promise to send you only quality content, and you can unsubscribe at any time.
          </p>
          
          <div class="footer">
            <p>
              You received this email because you subscribed to our newsletter.
              <br>
              <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/unsubscribe?email=${encodeURIComponent(email)}" class="unsubscribe-link">
                Unsubscribe
              </a>
              if you no longer wish to receive these emails.
            </p>
            <p>&copy; ${new Date().getFullYear()} ${process.env.STORE_NAME || "Our Store"}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to Our Newsletter!

Thank you for subscribing ${name ? `, ${name}` : ""}!

We're excited to have you on board. You'll now receive the latest updates, exclusive deals, and style inspiration directly in your inbox.

What you can expect:
- Exclusive Deals - Member-only discounts and early access to sales
- New Arrivals - Be the first to know about new products  
- Style Tips - Fashion inspiration and styling guides
- Special Offers - Birthday discounts and seasonal promotions

Start Shopping Now: ${process.env.FRONTEND_URL || "http://localhost:3000"}/shop

We promise to send you only quality content, and you can unsubscribe at any time.

---
You received this email because you subscribed to our newsletter.
Unsubscribe: ${process.env.FRONTEND_URL || "http://localhost:3000"}/unsubscribe?email=${encodeURIComponent(email)}

© ${new Date().getFullYear()} ${process.env.STORE_NAME || "Our Store"}. All rights reserved.
  `;

  return await sendEmail({
    email,
    subject: `Welcome to ${process.env.STORE_NAME || "Our Store"} Newsletter! 🎉`,
    html,
    text,
  });
};

export const sendWelcomeBackEmail = async (email, name = "") => {
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
            <p>&copy; ${new Date().getFullYear()} ${process.env.STORE_NAME || "Our Store"}. All rights reserved.</p>
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

© ${new Date().getFullYear()} ${process.env.STORE_NAME || "Our Store"}. All rights reserved.
  `;

  return await sendEmail({
    email,
    subject: `Welcome Back to ${process.env.STORE_NAME || "Our Store"}! 🎉`,
    html,
    text,
  });
};

export const sendUnsubscribeConfirmation = async (email) => {
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
            <p>&copy; ${new Date().getFullYear()} ${process.env.STORE_NAME || "Our Store"}. All rights reserved.</p>
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

© ${new Date().getFullYear()} ${process.env.STORE_NAME || "Our Store"}. All rights reserved.
  `;

  return await sendEmail({
    email,
    subject: `Goodbye from ${process.env.STORE_NAME || "Our Store"}`,
    html,
    text,
  });
};

export const sendNewsletterCampaign = async (
  email,
  subject,
  contentHtml,
  contentText,
) => {
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
            <p>&copy; ${new Date().getFullYear()} ${process.env.STORE_NAME || "Our Store"}. All rights reserved.</p>
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
};

export default sendEmail;
