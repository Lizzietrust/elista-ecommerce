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

export default sendEmail;
