import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // For development - log to console instead of sending
  if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
    console.log("=== EMAIL (Development Mode) ===");
    console.log("To:", options.email);
    console.log("Subject:", options.subject);
    console.log(
      "HTML Preview (first 500 chars):",
      options.html?.substring(0, 500) + "..."
    );
    console.log("================================");

    // Return a mock success response
    return Promise.resolve();
  }

  // Define email options
  const mailOptions = {
    from: `"Your Ecommerce Store" <${process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
    text: options.text || options.html?.replace(/<[^>]*>/g, ""), // Plain text fallback
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
