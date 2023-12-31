const dotenv = require("dotenv");
const twilio = require("twilio");

dotenv.config();

const accountSid = process.env.TWILO_ACCOUNTSID;
const authToken = process.env.TWILO_AUTHTOKEN;
const verifyServiceId = process.env.TWILO_VERIFYSID;

const client = new twilio(accountSid, authToken);

const sendSms = async (phone) => {
  try {
    const verification = await client.verify.v2
      .services(verifyServiceId)
      .verifications.create({ to: phone, channel: "sms" });

    if (verification.status === "pending") {
      return "OTP sent successfully";
    } else {
      throw new Error(`Failed to send OTP: ${verification.status}`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const verifyOtp = async (phone, otpCode) => {
  try {
    const verificationCheck = await client.verify.v2
      .services(verifyServiceId)
      .verificationChecks.create({ to: phone, code: otpCode });
    console.log(verificationCheck, "verificationCheck")

    if (verificationCheck.status === "approved") {
      const formattedPhoneNumber = phone.replace("+", "").replace("977", "");
      return formattedPhoneNumber;
    } else {
      throw new Error(`OTP verification failed: ${verificationCheck.status}`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  sendSms,
  verifyOtp,
};
