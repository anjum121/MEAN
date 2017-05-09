import * as passport from 'passport';
import * as localStrategy from 'passport-local';
import * as mongoose from 'mongoose';

let User = mongoose.model("User");
const LocalStrategy = localStrategy.Strategy;


passport.use(new LocalStrategy({
        usernameField: 'user[email]',
        passwordField: 'user[password]'
    }, (email, password, done: any) => {
        User.findOne({email: email}).then((user) => {
            if (!user || !user.validPassword(password)) {
                return done(null, false, {errors: {'email or password': 'is invalid'}});
            }
            return done(null, user);
        }).catch(done);

    }
));

