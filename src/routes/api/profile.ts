/**
 * Created by anjum on 09/05/17.
 */
import * as express from 'express';
import * as mongoose from 'mongoose';

let router = express.Router();
let User = mongoose.model('User');
let auth = require('../auth');


//Prepopulate req.profile with the user's data when the :username parameter is contained within a route
router.param('username', (req: any, res, next, username) => {
    User.findOne({username: username}).then((user) => {
        if (!user) {
            return res.sendStatus(404);
        }

        req.profile = user;

        return next();
    }).catch(next);
});


//Create an endpoint to fetch a user's profile by their username

router.get('/:username', auth.optional, function(req:any, res, next){

    if(req.payload){
        User.findById(req.payload.id).then(function(user){
            if(!user){ return res.json({profile: req.profile.toProfileJSONFor(false)}); }

            return res.json({profile: req.profile.toProfileJSONFor(user)});
        });
    } else {
        return res.json({profile: req.profile.toProfileJSONFor(false)});
    }
});



router.post('/:username/follow', auth.required, function (req:any, res, next) {

    let profileId = req.profile._id;

    User.findById(req.payload.id).then(function (user) {
        if (!user) { return res.sendStatus(401); }

        return user.follow(profileId).then(function () {
            return res.json({profile: req.profile.toProfileJSONFor(user)})
        })
    }).catch(next)

});


router.delete('/:username/unfollow', auth.required, function (req:any, res, next) {

    let profileId = req.profile._id;

    User.findById(req.payload.id).then(function (user) {
        if (!user) { return res.sendStatus(401); }

            return user.unfollow(profileId).then(function () {
                return res.json({profile: req.profile.toProfileJSONFor(user)})
            })

    }).catch(next)

});



module.exports = router;

