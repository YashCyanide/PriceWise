const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
//this test is working but above credentials removed for security reasons
console.log('Testing email configuration...');
console.log('EMAIL_USER:', EMAIL_USER);
console.log('EMAIL_PASSWORD: ***configured***');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
});

transporter.verify()
  .then(() => {
    console.log('✅ Email configuration is valid!');
    return transporter.sendMail({
      from: EMAIL_USER,
      to: EMAIL_USER,
      subject: 'Test Email from PriceWise',
      html: '<h1>Success!</h1><p>Your email configuration works!</p>'
    });
  })
  .then(() => {
    console.log('✅ Test email sent successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Email error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  });
