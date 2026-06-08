export const getWelcomeEmailTemplate = (name) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Elista</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1A1A1A;
          background-color: #FAFAF9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #FAFAF9;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #C17B4D;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #1A1A1A;
        }
        .logo span {
          color: #C17B4D;
        }
        .content {
          padding: 40px 30px;
          background-color: #FFFFFF;
          border-radius: 12px;
          margin-top: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .welcome-text {
          font-size: 24px;
          font-weight: 600;
          color: #C17B4D;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          color: #4A4A4A;
          margin-bottom: 30px;
        }
        .features {
          background-color: #F5F5F0;
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
        }
        .feature {
          margin: 15px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .feature-icon {
          font-size: 24px;
        }
        .feature-text {
          font-size: 14px;
          color: #4A4A4A;
        }
        .btn {
          display: inline-block;
          background-color: #C17B4D;
          color: white !important;
          text-decoration: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
          transition: background-color 0.3s;
        }
        .btn:hover {
          background-color: #A5663C;
        }
        .footer {
          text-align: center;
          padding: 30px 0 20px;
          font-size: 12px;
          color: #8C7B6E;
          border-top: 1px solid #E4DDD7;
          margin-top: 30px;
        }
        .social-links {
          margin: 15px 0;
        }
        .social-links a {
          margin: 0 10px;
          text-decoration: none;
          color: #8C7B6E;
        }
        @media only screen and (max-width: 600px) {
          .container {
            padding: 10px;
          }
          .content {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            Elista<span>.</span>
          </div>
        </div>
        
        <div class="content">
          <div class="welcome-text">
            Welcome to Elista, ${name}! 🎉
          </div>
          
          <div class="message">
            Thank you for joining Elista! We're thrilled to have you as part of our community. 
            Get ready to discover amazing products and enjoy a seamless shopping experience.
          </div>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}" class="btn">
              Start Shopping Now
            </a>
          </div>

          <div class="features">
            <div class="feature">
              <div class="feature-icon">✨</div>
              <div class="feature-text">
                <strong>Curated Collections</strong> - Discover hand-picked products just for you
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon">🚚</div>
              <div class="feature-text">
                <strong>Fast Delivery</strong> - Get your orders delivered quickly and reliably
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon">💳</div>
              <div class="feature-text">
                <strong>Secure Payments</strong> - Shop with confidence using our secure payment system
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon">🎁</div>
              <div class="feature-text">
                <strong>Exclusive Offers</strong> - Enjoy special discounts and promotions
              </div>
            </div>
          </div>

          <div class="message" style="font-size: 14px;">
            <strong>Need help?</strong> Our customer support team is here for you 24/7. 
            Contact us at <a href="mailto:${process.env.EMAIL_REPLY_TO}" style="color: #C17B4D;">${process.env.EMAIL_REPLY_TO}</a>
          </div>
        </div>

        <div class="footer">
          <div class="social-links">
            <a href="#">Facebook</a> •
            <a href="#">Twitter</a> •
            <a href="#">Instagram</a>
          </div>
          <p>© 2024 Elista. All rights reserved.</p>
          <p>Your destination for modern shopping</p>
          <p>
            <a href="#" style="color: #8C7B6E;">Privacy Policy</a> | 
            <a href="#" style="color: #8C7B6E;">Terms of Service</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getWelcomeTextEmail = (name) => {
  return `
Welcome to Elista, ${name}! 🎉

Thank you for joining Elista! We're thrilled to have you as part of our community.

Get started by exploring our curated collections:
${process.env.FRONTEND_URL || "http://localhost:3000"}

✨ What you can expect:
• Curated collections just for you
• Fast and reliable delivery
• Secure payment options
• Exclusive offers and discounts

Need assistance? Contact us at ${process.env.EMAIL_REPLY_TO}

Happy Shopping!
The Elista Team
  `;
};
