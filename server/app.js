let express = require('express'),
   path = require('path'),
   favicon = require('serve-favicon'),
   logger = require('morgan'),
   cookieParser = require('cookie-parser'),
   bodyParser = require('body-parser'),
   passport = require('passport'),
   LocalStrategy = require('passport-local').Strategy,
   routes = require('./routes/index'),
   bcrypt = require('bcrypt'),
   colorOut = require('./util/colorOut.js'),
   tracer = require('tracer').console(colorOut()),
   config = require('config'),
   db = require('./models/index'),
   debug = require('debug')('graphql:server'),
   http = require('http');

/**
 * Creates the Express server using the provided middlewares
 * @param {Array} customMiddlewares array with middlewares to add to the express instance
 */
module.exports = function (customMiddlewares) {
   db.sequelize.sync().then( () => {
      // Seed an admin user
      bcrypt.genSalt(10, ( err, salt ) => {
         bcrypt.hash(config.get('password'), salt, ( err, hash ) => {
            if ( err ) {
               tracer.error('Error while hashing password: %j', { error: err });
            } else {
               db.models.Users.findOrCreate(
                  {
                     where: {
                        email: 'admin@globalmouth.com'
                     },
                     defaults: {
                        email: 'admin@globalmouth.com',
                        password_hash: hash,
                        isAdmin: true
                     }
                  });
            }
         });
      });
   });

   let app = express();

   // Configure the local strategy for use by Passport.
   //
   // The local strategy require a `verify` function which receives the credentials
   // (`username` and `password`) submitted by the user.  The function must verify
   // that the password is correct and then invoke `cb` with a user object, which
   // will be set at `req.user` in route handlers after authentication.
   passport.use(new LocalStrategy(
      ( username, password, cb ) => {
         db.Users.findOne({
            where: {
               email: {
                  $iLike: username
               }
            }
         }).then(( user ) => {
            if ( null === user ) {
               return cb(null, false);
            }
            //Check hashed password
            bcrypt.compare(password, user.dataValues.password_hash, function ( err, res ) {
               if ( err ) {
                  return cb(err);
               }
               if ( res ) {
                  return cb(null, user.dataValues);
               }
               return cb(null, false);
            });
         }).error(( err ) => {
            return cb(err);
         });
      }));
   // Configure Passport authenticated session persistence.
   //
   // In order to restore authentication state across HTTP requests, Passport needs
   // to serialize users into and deserialize users out of the session.  The
   // typical implementation of this is as simple as supplying the user ID when
   // serializing, and querying the user record by ID from the database when
   // deserializing.
   passport.serializeUser(( user, cb ) => {
      cb(null, user.id);
   });

   passport.deserializeUser(( id, cb ) => {
      db.Users.findOne({
         where: {
            id: id
         }
      }).then(( user ) => {
         if ( null === user ) {
            return cb(null, false);
         }
         return cb(null, user.dataValues);
      }).error(( err ) => {
         return cb(err);
      });
   });

   // TODO fix favicon (need to bundle icon with server code)
   //app.use(favicon('../client/favicon.png'));
   app.use(logger('dev'));
   app.use(bodyParser.json());
   app.use(bodyParser.urlencoded({ extended: false }));
   app.use(cookieParser());
   app.use(require('express-session')({ secret: config.get('secret'), resave: false, saveUninitialized: false }));
   // Initialize Passport and restore authentication state, if any, from the
   // session.
   app.use(passport.initialize());
   app.use(passport.session());

   // Routes
   app.use('/', routes);


   // using webpack hot reloading middlewares for development
   // or a simple express.static middleware for production
   customMiddlewares.forEach((middleware) => {
      app.use(middleware);
   });

   app.all('/*', ( req, res, next ) => {
      res.status(404)
         .send('Not found');
   });

   // catch 404 and forward to error handler
   app.use(( req, res, next ) => {
      let err = new Error('Not Found');
      err.status = 404;
      next(err);
   });

   // error handlers

   // development error handler
   // will print stacktrace
   if ( app.get('env') === 'development' ) {
      app.use(( err, req, res, next ) => {
         res.status(err.status || 500);
         res.render('error', {
            message: err.message,
            error: err
         });
      });
   }

   // production error handler
   // no stacktraces leaked to user
   app.use(( err, req, res, next ) => {
      res.status(err.status || 500);
      res.render('error', {
         message: err.message,
         error: {}
      });
   });

   let port = parseInt(process.env.PORT || '3000', 10);
   app.set('port', port);

   /**
    * Create HTTP server.
    */
   let server = http.createServer(app);

   server.on('error', (error) => {
      if (error.syscall !== 'listen') {
         throw error;
      }

      let bind = typeof port === 'string' ?
         'Pipe ' + port : 'Port ' + port;

      // handle specific listen errors with friendly messages
      switch (error.code) {
         case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
         break;
         case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
         break;
         default:
            throw error;
      }
   });


   server.on('listening', () => {
      let addr = server.address();
      let bind = typeof addr === 'string' ?
         'pipe ' + addr : 'port ' + addr.port;
      debug('Listening on ' + bind);
   });

   /**
    * Listen on provided port, on all network interfaces.
    */

   server.listen(port);
};
