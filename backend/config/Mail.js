// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//     host: 'your.zimbra.server', 
//     port: 587, 
//     secure: false, 
//     auth: {
//         user: 'your-email@domain.com', 
//         pass: 'your-email-password' 
//     }
// });

// const mailOptions = {
//     from: '"Your Name" <your-email@domain.com>', 
//     to: 'recipient@example.com', 
//     subject: 'Hello from Node.js', 
//     text: 'Hello world?', 
//     html: '<b>Hello world?</b>' 
// };

// // Send mail
// transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//         return console.log(error);
//     }
//     console.log('Message sent: %s', info.messageId);
// });




const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: 465, 
    secure: true, 
    auth: {
        user: 'kavinpalanisamy242003@gmail.com', // Your Gmail email address
        pass: 'Kavinpalanisamy' // Your Gmail password or App Password
    }
});

// Set up email data
const mailOptions = {
    from: '"KAVIN KUMAR" <kavinpalanisamy242003@gmail.com>', // Sender address
    to: 'naturalsemart@gmail.com', // List of recipients
    subject: 'Hello from Node.js', // Subject line
    text: 'Hello world?', // Plain text body
    html: '<b>Hello world?</b>' // HTML body
};

// Send mail
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
});

