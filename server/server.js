let app = require('./app'),
   express = require('express'),
   path = require('path');

app([
   express.static('../client')
]);
