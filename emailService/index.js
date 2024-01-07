const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

// Centralized email configuration with clear defaults
const emailConfig = {
  host: "sandbox.smtp.mailtrap.io",
  port: 2525, // You can choose any of the allowed ports (25, 465, 587, 2525)
  secure: false, // Set to true if using a port that requires TLS (e.g., 465)
  auth: {
    user: "01d4246a7dca89",
    pass: "b58b77d814268c",
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
      from: process.env.EMAIL_USER,
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
