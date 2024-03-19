const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

// Centralized email configuration with clear defaults
const emailConfig = {
  host: "live.smtp.mailtrap.io",
  port: 587, // You can choose any of the allowed ports (25, 465, 587, 2525)
  // secure: false, // Set to true if using a port that requires TLS (e.g., 465)
  auth: {
    user: "api",
    pass: "38797b9b298db71c16f408e8696a3f55",
  },
};

// Transporter creation with error handling
const createTransporter = async () => {
  try {
    return nodemailer.createTransport(emailConfig);
  } catch (error) {
    console.error("Error creating transporter:", error.message);
    throw error; // Re-throw the error for proper handling
  }
};

// Mail generator with customizable product details
const createMailGenerator = ({ productName = "Your App Name", productLink = "https://yourapp.com" } = {}) => {
  return new Mailgen({
    theme: "default",
    product: { name: productName, link: productLink },
  });
};

// OTP email sending with streamlined logic
const sendOTPEmail = async (email, otp) => {
  console.log(otp)
  try {
    const transporter = await createTransporter();
    const mailGenerator = createMailGenerator();

   const emailBody = {
  body: {
    intro: `Your OTP is: ${otp}`, // Use template literal for direct injection
    outro: "Use this code to verify your identity.",
  },
};

    const emailTemplate = mailGenerator.generate(emailBody);
    const mailOptions = {
      from: "info@lamimatrimony.com",
      to: email,
      subject: "OTP Verification",
      html: emailTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error; // Re-throw the error for proper handling
  }
};

module.exports = { createTransporter, createMailGenerator, sendOTPEmail };
