const Nodemailer = require('nodemailer');
const { MailtrapTransport } = require("mailtrap");

const sendEmail = (emailId, messageBody, title) => {

    const TOKEN = "0d5fdf1610310a2bb51ac4936701ee93";

    const transport = Nodemailer.createTransport(
    MailtrapTransport({
        token: TOKEN,
    })
    );

    const sender = {
    address: "lifehub@demomailtrap.com",
    name: title,
    };

    transport
    .sendMail({
        from: sender,
        to: emailId,
        subject: "Welcome to LifeHub!",
        text: messageBody,
        category: "Integration Test",
    })
    .then(console.log, console.error);
}

module.exports = sendEmail;