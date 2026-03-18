require("dotenv").config();
const nodemailer = require("nodemailer");

async function sendTestEmail() {
  try {
    // Step 1: Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Step 2: Verify connection
    await transporter.verify();
    console.log("✅ SMTP connection successful");

    // Step 3: Email options
    const mailOptions = {
      from: `"Test App" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // send to yourself
      subject: "Test Email 🚀",
      text: "This is a test email from Nodemailer using App Password.",
      html: `
        <h2>Test Email</h2>
        <p>If you're seeing this, your email setup is working ✅</p>
      `,
    };

    // Step 4: Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully");
    console.log("📧 Message ID:", info.messageId);

  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
}

// Run function
sendTestEmail();