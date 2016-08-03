let express = require('express'),
   router = express.Router(),
   passport = require('passport'),
   path = require('path'),
   bodyParser = require('body-parser'),
   colorOut = require('../../util/colorOut.js'),
   tracer = require('tracer').console(colorOut()),
   ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn,
   db = require('../../models/index'),
   graphqlHTTP = require('express-graphql');

var gqlOptions = {
   schema: db.schema
};

//Skip auth on developemnt env
if (process.env.NODE_ENV === 'development') {
   gqlOptions.graphiql = true;
   gqlOptions.pretty = true;
} else {
   router.all('*', ensureLoggedIn('/api/users/login_fail'));
}

router.use('/graphql', graphqlHTTP(gqlOptions));

module.exports = router;
