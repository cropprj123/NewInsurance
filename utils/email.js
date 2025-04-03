const nodemailer = require("nodemailer");
const pug = require("pug");
const { convert } = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `PRUTHVIJ . P .DESAI <${process.env.GMAIL_ADDRESS}>`;
  }

  newTransport() {
    if (!process.env.GMAIL_ADDRESS || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error("Gmail credentials are missing in environment variables");
    }

    return nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Send the actual email
  async send(template, subject, data = {}) {
    try {
      console.log("Attempting to send email to:", this.to);
      console.log("Using Gmail address:", process.env.GMAIL_ADDRESS);

      const html = pug.renderFile(`${__dirname}/../email/${template}.pug`, {
        firstName: this.firstName,
        url: this.url,
        subject,
        ...data
      });

      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: convert(html),
        headers: {
          Priority: "High",
          "X-MS-Exchange-Organization-BypassFocusedInbox": "true",
          "X-Priority": "1",
          Importance: "high",
        },
      };

      const result = await this.newTransport().sendMail(mailOptions);
      console.log("Email sent successfully:", result);
      return result;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to CropGuard Assurance! 🌾");
  }

  async sendBookingReceipt(paymentRecord) {
    await this.send("receipt", "Insurance Premium Payment Receipt", { paymentRecord });
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }

  async sendFarmVisitNotification(visitData, isAgent = false) {
    const subject = isAgent 
      ? "🌾 New Farm Visit Assignment"
      : "🌾 Farm Visit Scheduled";

    await this.send("farm-visit-notification", subject, {
      isAgent,
      visitDate: visitData.visitDate,
      farmerName: visitData.farmer?.name,
      farmerPhone: visitData.farmer?.phone,
      agentName: visitData.agent?.name,
      agentPhone: visitData.agent?.phone,
      location: visitData.location,
      coordinates: visitData.coordinates
    });
  }

  async sendInsuranceVisitNotification(visitData, isAgent = false) {
    const subject = isAgent 
      ? "🌾 New Insurance Visit Assignment"
      : "🌾 Insurance Visit Scheduled";

    await this.send("insurance-visit-assignment", subject, {
      isAgent,
      visitDate: visitData.visitDate,
      farmer: visitData.farmer,
      agent: visitData.agent,
      insurancePolicy: visitData.insurancePolicy,
      coordinates: visitData.coordinates
    });
  }
};
