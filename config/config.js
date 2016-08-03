var config = require('config');

var dbInfo = {
   host: config.get('db.host'),
   database: config.get('db.name'),
   username: config.get('db.user'),
   password: config.get('db.pass'),
   dialect: 'postgres'
};

module.exports = {
   development: dbInfo,
   test: dbInfo,
   production: dbInfo
};
