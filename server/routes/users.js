let express = require('express'),
   router = express.Router(),
   passport = require('passport'),
   bodyParser = require('body-parser'),
   colorOut = require('../util/colorOut.js'),
   tracer = require('tracer'),
   logger = tracer.console(colorOut()),
   db = require('../models/index'),
   path = require('path'),
   crypto = require('crypto'),
   bcrypt = require('bcrypt'),
   config = require('config'),
   email = require('../api/email');

// Bypass ensuredLogged in for dev
let bypass = () => {
   return ( req, res, next ) => {
      next();
   };
};
let ensureLoggedIn = ( process.env.NODE_ENV === 'development' ) ? bypass : require('connect-ensure-login').ensureLoggedIn;


router.use(bodyParser.json());


/**
 * Generates and send reset password tokens
 * @param userEmail string email of user
 * @param newUser bool
 * @param res object
 */
let generateToken = ( userEmail, newUser, res ) => {
   let token,
      user;
   // Generate randome token
   return new Promise(( resolve, reject ) => {
      crypto.randomBytes(20, ( err, buf ) => {
         if ( err ) {
            reject(err);
         }
         let token = buf.toString('hex');
         resolve(token);
      });
   })
      .then(( _token ) => {
         token = _token;
         return db.Users.find({
            where: {
               email: {
                  $iLike: userEmail
               }
            }
         });
      })
      .then(( _user ) => {
         user = _user;
         if ( !user ) {
            throw new Error(userEmail + ' not found');
         }
         return user.update({
            reset_token: token,
            token_expires: Date.now() + 3600000 // 1 hour
         });
      })
      .then(( user ) => {
         if ( newUser ) {
            email.userCreated(user.email, token);
         } else {
            email.resetPassword(user.email, token);
         }
         res.json({ success: true });
      })
      .catch(( err ) => {
            logger.error(err);
            res.json({ success: false, errorMsg: err.message, errors: [err] });
         }
      );
};

/* POST login */
router.post('/login', passport.authenticate('local', {
   failureRedirect: '/api/users/login_fail',
   successRedirect: '/api/users/login_success'
}));

/* GET login failure */
router.get('/login_fail', ( req, res ) => {
   res.status(403);
   res.json({ error: true, errorMsg: 'You are not logged in' });
});

/* GET login success */
router.get('/login_success', ( req, res ) => {
   let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
   res.json({
      error: false,
      user: {
         id: req.user.id,
         email: req.user.email,
         isAdmin: req.user.isAdmin
      }
   });
});

/* GET current user */
router.get('/current-user', ( req, res ) => {
   let user = false;
   //Skip auth on developemnt env
   if ( process.env.NODE_ENV !== 'development' ) {
      if ( req.user ) {
         user = {
            id: req.user.id,
            email: req.user.email,
            isAdmin: req.user.isAdmin
         };
      }
      res.send(user);
   } else {
      res.send({ email: 'admin@noauth.dev', isAdmin: true });
   }
});

/*Logout */
router.route('/logout')
   .all(( req, res ) => {
      req.logOut();
      res.redirect('/');
   });

/**
 * Get all users
 */
router.get('/',
   ensureLoggedIn('/'),
   ( req, res ) => {
      return db.Users.findAll({ where: { isAdmin: { $not: true } } })
         .then(( users ) => {
            res.json({ success: true });
         })
         .catch(( err ) => {
            res.json({ success: false, errorMsg: err.message, errors: [err] });
         });
   });

/**
 * Create new user
 */
router.post('/',
   ensureLoggedIn('/'),
   ( req, res ) => {
      let userData = req.body.data;
      let emailValidationReg =
         /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // jshint ignore:line
      if ( !emailValidationReg.test(userData.email) ) {
         let err = new Error('Invalid email address');
         res.json({ success: false, errorMsg: err.message, errors: [err] });
         return;
      }
      userData.isAdmin = false;
      userData.password_hash = crypto.randomBytes(64);
      return db.Users.create(userData, {})
         .then(( user ) => {
            generateToken(user.email, true, res);
            res.json({ success: true });
         })
         .catch(( err ) => {
            res.json({ success: false, errorMsg: err.message, errors: [err] });
         });
   });
/**
 * Delete user
 */
router.delete('/:id',
   ensureLoggedIn('/'),
   ( req, res ) => {
      let id = req.params.id;
      return db.Users.find({ where: { id: id, isAdmin: false } })
         .then(( user ) => {
            return user.destroy();
         })
         .then(() => {
            res.json({ success: true });
         })
         .catch(( err ) => {
            res.json({ success: false, errorMsg: err.message, errors: [err] });
         });
   });

/**
 * Generate and send reset password token
 */
router.post('/forgot', ( req, res ) => {
   let userEmail = req.body.email;
   generateToken(userEmail, false, res);
});

router.post('/reset', ( req, res ) => {
   let token = req.body.token;
   let pass = req.body.pass;
   logger.warn(req.body.token, req.body.pass);
   return db.Users.find({
         where: {
            reset_token: token,
            token_expires: {
               $gt: new Date()
            }
         }
      })
      .then(( user ) => {
         if ( !user ) {
            throw new Error('Password reset token is invalid or has expired.');
         }
         return bcrypt.genSalt(10, ( err, salt ) => {
            return bcrypt.hash(pass, salt, ( err, hash ) => {
               if ( err ) {
                  logger.error('Error while hashing password: %j', { error: err });
                  throw new Error('Error while hashing password');
               } else {
                  user.update({ password_hash: hash, reset_token: null, token_expires: null });
               }
            });
         });
      })
      .then(() => {
         res.json({ success: true });
      })
      .catch(( err ) => {
         res.json({ success: false, errorMsg: err.message, errors: [err] });
      });
});


module.exports = router;
