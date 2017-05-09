/**
 * Created by anjum on 09/05/17.
 */
import * as express from 'express';
import * as mongoose from 'mongoose';
let router = express.Router();

let Joke = mongoose.model('Joke');



router.get('/', function (req:any, res, next) {
    Joke.find().distinct('tagList').then(function (tags) {
        return res.json({tags : tags})
    }).catch(next);
})

module.exports = router;