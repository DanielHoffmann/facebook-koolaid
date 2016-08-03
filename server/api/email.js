let nodemailer = require('nodemailer'),
   ses = require('nodemailer-ses-transport'),
   config = require('config'),
   awsAccessKey = config.get('email.awsAccessKey'),
   awsSecretAccessKey = config.get('email.awsSecretAccessKey'),
   awsRegion = config.get('email.awsRegion'),
   appDomain = config.get('appDomain');

if (appDomain[appDomain.length - 1] !== '/') {
   appDomain += '/';
}

var sendMail = (to, subject, html, successMessage) => {
   var credentials = {
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretAccessKey,
      region: awsRegion
   };
   var transporter = nodemailer.createTransport(ses(credentials));

   return transporter.sendMail({
      from: 'support@globalmouth.com',
      to: to,
      subject: subject,
      html: html,
   }).then((err, info) => {
      console.log(successMessage);
   }).catch((err) => {
      console.trace(err);
   });
};

exports.resetPassword = (to, token) => {
   var url = appDomain + 'reset?token=' + token;

   var html = '<h1>Reset Your Password</h1>' +
      '<p>To reset your password click in the following link:</p>' +
      '<p><a href="' + url + '">' + url + '</a></p>';

   return sendMail(
      to,
      'Password reset for Tournament CMS',
      html,
      'Succesfully sent password reset email to ' + to);
};

exports.userCreated = (to, token) => {
   var url = appDomain + 'reset?token=' + token;

   var html = '<h1>User created successfully</h1>' +
      '<p>To reset your password click in the following link:</p>' +
      '<p><a href="' + url + '">' + url + '</a></p>';

   return sendMail(
      to,
      'User Created in the Tournament CMS',
      html,
      'Succesfully sent user created email to ' + to);
};
