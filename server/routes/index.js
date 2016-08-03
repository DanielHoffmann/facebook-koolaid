let express = require('express'),
   router = express.Router(),
   path = require('path'),
   colorOut = require('../util/colorOut.js'),
   api = require('./api'),
   usersApi = require('./users'),
   tracer = require('tracer').console(colorOut()),
   db = require('../models/');

router.use('/api', api);
router.use('/api/users', usersApi);

module.exports = router;
