const passport = require('passport');
const LocalStrategy = require('passport-local');
const  Users = require('../Models/userSchemas');
const  { validatePassword }  = require('../utils/passportUtils');

// setting up passport

  passport.use(new LocalStrategy({usernameField: 'email'} , // passport doesn't automagically know that you want to put in email field from all places, you have to specify it in this line 
  async function verify(username, password, callback) {

    try {
      const user = await Users.findOne({ email: username });
      // if no user
      if (!user) { return callback(null, false) } // (no error, no user);
      // user found then validate password
      const isValid = validatePassword(password, user.salt, user.hash );

      if (isValid) {
        // console.log("user found");
        return callback(null, user);
      }
      else {
        // console.log("user not found");
        return callback(null, false);
      }
    }
    catch (e) {
      return callback(e);
    }
  }));



  passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username });
    });
  });

  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });


  module.exports=passport;