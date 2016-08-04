import nodemailer from 'nodemailer';
import ses from 'nodemailer-ses-transport';
import config from 'config';

const awsAccessKey = config.get('email.awsAccessKey'),
   awsSecretAccessKey = config.get('email.awsSecretAccessKey'),
   awsRegion = config.get('email.awsRegion');

let appDomain = config.get('appDomain');

if (appDomain[appDomain.length - 1] !== '/') {
   appDomain += '/';
}

const sendMail = (to, subject, html, successMessage) => {
   const credentials = {
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretAccessKey,
      region: awsRegion
   };
   const transporter = nodemailer.createTransport(ses(credentials));

   return transporter.sendMail({
      from: 'support@globalmouth.com',
      to: to,
      subject: subject,
      html: html,
   }).then((err, info) => {
      console.log(successMessage); //eslint-disable-line no-console
   }).catch((err) => {
      console.trace(err); //eslint-disable-line no-console
   });
};

export function resetPassword (to, token) {
   const url = appDomain + 'reset?token=' + token;

   const html = '<h1>Reset Your Password</h1>' +
      '<p>To reset your password click in the following link:</p>' +
      '<p><a href="' + url + '">' + url + '</a></p>';

   return sendMail(
      to,
      'Password reset for Tournament CMS',
      html,
      'Succesfully sent password reset email to ' + to);
}

export function userCreated (to, token) {
   const url = appDomain + 'reset?token=' + token;

   const html = '<h1>User created successfully</h1>' +
      '<p>To reset your password click in the following link:</p>' +
      '<p><a href="' + url + '">' + url + '</a></p>';

   return sendMail(
      to,
      'User Created in the Tournament CMS',
      html,
      'Succesfully sent user created email to ' + to);
}
