import sendEmail from "./sendEmail.js";

// Send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = `Welcome to Elista Ecommerce, ${userName}!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Elista Ecommerce!</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>Thank you for creating an account with us. We're excited to have you on board!</p>
          <p>Start shopping now and discover amazing products.</p>
          <br>
          <a href="${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/shop" class="button">Start Shopping</a>
          <br><br>
          <p>Best regards,<br>The Elista Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    email: userEmail,
    subject,
    html,
  });
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, resetToken) => {
  const resetUrl = `${
    process.env.FRONTEND_URL || "http://localhost:3000"
  }/reset-password?token=${resetToken}`;
  const subject = "Password Reset Request - Elista Ecommerce";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Password Reset</h2>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <a href="${resetUrl}" class="button">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    email: userEmail,
    subject,
    html,
  });
};

// Send order confirmation
const sendOrderConfirmation = async (userEmail, orderDetails) => {
  const subject = `Order Confirmation #${orderDetails.orderId}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h2>Order Confirmation</h2>
      <p>Thank you for your order!</p>
      <h3>Order Details:</h3>
      <p>Order ID: ${orderDetails.orderId}</p>
      <p>Total: $${orderDetails.total}</p>
      <p>Status: ${orderDetails.status}</p>
    </body>
    </html>
  `;

  return await sendEmail({
    email: userEmail,
    subject,
    html,
  });
};

// Send contact form email
const sendContactFormEmail = async (formData) => {
  const { name, email, subject, message } = formData;
  const emailSubject = subject || "New Contact Form Submission";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #4F46E5; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>New Contact Form Submission</h2>
        <div class="field">
          <span class="label">Name:</span> ${name}
        </div>
        <div class="field">
          <span class="label">Email:</span> ${email}
        </div>
        <div class="field">
          <span class="label">Subject:</span> ${subject || "Not specified"}
        </div>
        <div class="field">
          <span class="label">Message:</span>
          <p>${message}</p>
        </div>
        <p>This message was sent from the contact form on your website.</p>
      </div>
    </body>
    </html>
  `;

  // Send to admin
  await sendEmail({
    email: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    subject: emailSubject,
    html,
  });

  // Send confirmation to user
  await sendEmail({
    email: email,
    subject: "Thank you for contacting us!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank you for contacting Elista Ecommerce!</h2>
        <p>Hi ${name},</p>
        <p>We've received your message and will get back to you within 24-48 hours.</p>
        <p>Here's a copy of your message:</p>
        <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #4F46E5; margin: 20px 0;">
          ${message}
        </blockquote>
        <p>Best regards,<br>The Elista Team</p>
      </div>
    `,
  });
};

// Send order shipped notification
const sendOrderShippedEmail = async (
  userEmail,
  orderDetails,
  trackingNumber
) => {
  const subject = `Your Order #${orderDetails.orderId} Has Been Shipped!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .info-box { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
        .tracking-link { color: #3b82f6; text-decoration: none; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🎉 Your Order Has Been Shipped!</h2>
        <p>Great news! Your order has been shipped and is on its way to you.</p>
        
        <div class="info-box">
          <h3>Shipping Details</h3>
          <p><strong>Order Number:</strong> ${orderDetails.orderId}</p>
          <p><strong>Tracking Number:</strong> ${
            trackingNumber || "Will be provided soon"
          }</p>
          ${
            trackingNumber
              ? `<p><a href="#" class="tracking-link">Track Your Package</a></p>`
              : ""
          }
        </div>
        
        <p>Expected delivery: 3-5 business days</p>
        <p>If you have any questions, please reply to this email.</p>
        <p>Best regards,<br>The Elista Team</p>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    email: userEmail,
    subject,
    html,
  });
};

// Send newsletter subscription confirmation
const sendNewsletterConfirmation = async (userEmail) => {
  const subject = "Welcome to our Newsletter!";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🎉 Welcome to Our Newsletter!</h2>
        <p>Thank you for subscribing to our newsletter.</p>
        <p>You'll now receive:</p>
        <ul style="text-align: left; display: inline-block;">
          <li>Exclusive discounts and offers</li>
          <li>New product announcements</li>
          <li>Latest trends and tips</li>
          <li>Early access to sales</li>
        </ul>
        <p>To unsubscribe, simply click the unsubscribe link in any of our emails.</p>
        <p>Happy shopping!</p>
        <p>Best regards,<br>The Elista Team</p>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    email: userEmail,
    subject,
    html,
  });
};

// Send account verification email
const sendVerificationEmail = async (userEmail, verificationToken) => {
  const verificationUrl = `${
    process.env.FRONTEND_URL || "http://localhost:3000"
  }/verify-email?token=${verificationToken}`;

  const subject = "Verify Your Email Address - Elista Ecommerce";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
        .warning { color: #dc2626; font-size: 0.9em; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Verify Your Email Address</h2>
        <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
        <p>Click the button below to verify your email:</p>
        <br>
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
        <br><br>
        <p class="warning">This link will expire in 24 hours.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
        <p>Best regards,<br>The Elista Team</p>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    email: userEmail,
    subject,
    html,
  });
};

// Export all functions as named exports
export {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmation,
  sendContactFormEmail,
  sendOrderShippedEmail,
  sendNewsletterConfirmation,
  sendVerificationEmail,
};

// Or export as default object (choose one approach)
const EmailService = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmation,
  sendContactFormEmail,
  sendOrderShippedEmail,
  sendNewsletterConfirmation,
  sendVerificationEmail,
};

export default EmailService;
