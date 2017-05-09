/**
 * Created by anjum on 09/05/17.
 */
import * as express from 'express';
import * as mongoose from 'mongoose';
let passport = require('passport');
let router = express.Router();

let Joke = mongoose.model('Joke');
let User = mongoose.model('User');
let Comment = mongoose.model('Comment');
let auth = require('../auth');


router.param('joke', function (req: any, res, next, slug) {
    Joke.findOne({slug: slug})
        .populate('author')
        .then(function (joke) {
            if (!joke) {
                return res.sendStatus(404);
            }
            req.joke = joke;
            return next();
        }).catch(next);
});


router.param('comment', function (req: any, res, next, id) {
    Comment.findById(id).then(function (comment) {
        if (!comment) {
            return res.sendStatus(404);
        }

        req.comment = comment;

        return next();
    }).catch(next);
});


//get all the jokes

router.get('/', auth.optional, function (req: any, res, next) {

    let query: any = {};
    let limit = 10;
    let offset = 0;

    if (typeof req.query.limit !== 'undefined') {
        limit = req.query.limit;
    }

    if (typeof req.query.offset !== 'undefined') {
        limit = req.query.offset;
    }


    if (typeof req.query.tag !== 'undefined') {
        query.tagList = {"$in": [req.query.tag]};
    }

    Promise.all([
        req.query.author ? User.findOne({username: req.query.author}) : null,
        req.query.favorited ? User.findOne({username: req.query.favorited}) : null
    ]).then(function (results) {
        let author = results[0];
        let favoriter = results[1];

        if (author) {
            query.author = author._id;
        }

        if (favoriter) {
            query._id = {$in: favoriter.favorites};
        } else if (req.query.favorited) {
            query._id = {$in: []};
        }


        return Promise.all([
            Joke.find(query)
                .limit(Number(limit))
                .skip(Number(offset))
                .sort({createdAt: 'desc'})
                .populate('author')
                .exec(),
            Joke.count(query).exec(),
            req.payload ? User.findById(req.payload.id) : null,

        ]).then(function (results) {

            let joke = results[0];
            let jokeCounts = results[1];
            let user = results[2];

            return res.json({
                joke: joke.map(function (joke) {
                    return joke.toJSONFor(user);
                }),
                jokeCounts: jokeCounts
            });

        });
    }).catch(next);

});




router.get('/feed', auth.required, function(req:any, res, next) {
    let limit = 20;
    let offset = 0;

    if(typeof req.query.limit !== 'undefined'){
        limit = req.query.limit;
    }

    if(typeof req.query.offset !== 'undefined'){
        offset = req.query.offset;
    }

    User.findById(req.payload.id).then(function(user){
        if (!user) { return res.sendStatus(401); }

        Promise.all([
            Joke.find({ author: {$in: user.following}})
                .limit(Number(limit))
                .skip(Number(offset))
                .populate('author')
                .exec(),
            Joke.count({ author: {$in: user.following}})
        ]).then(function(results){
            let joke = results[0];
            let jokeCount = results[1];

            return res.json({
                joke: joke.map(function(joke){
                    return joke.toJSONFor(user);
                }),
                jokeCount: jokeCount
            });
        }).catch(next);
    });
});


router.post('/', auth.required, function (req: any, res, next) {

    User.findById(req.payload.id).then(function (user) {
        if (!user) {
            return res.sendStatus(401);
        }

        let joke = new Joke(req.body.joke);

        joke.author = user;

        return joke.save().then(function () {
            console.log(joke.author);
            return res.json({joke: joke.toJSONFor(user)})

        })

    }).catch(next)
});


// return a article
router.get('/:joke', auth.optional, function (req: any, res, next) {
    Promise.all([
        req.payload ? User.findById(req.payload.id) : null,
        req.joke.populate('author').execPopulate()
    ]).then(function (results) {
        let user = results[0];

        return res.json({joke: req.joke.toJSONFor(user)});
    }).catch(next);
});


router.put('/:joke', auth.required, function (req: any, res, next) {

    User.findById(req.payload.id).then(function (user) {
        if (req.joke.author._id.toString() === req.payload.id.toString()) {
            if (typeof req.body.joke.title !== 'undefined') {
                req.joke.title = req.body.joke.title;
            }

            if (typeof req.body.joke.description !== 'undefined') {
                req.joke.description = req.body.joke.description;
            }

            if (typeof req.body.joke.body !== 'undefined') {
                req.joke.body = req.body.joke.body;
            }

            req.joke.save().then(function (joke) {
                return res.json({joke: joke.toJSONFor(user)});
            }).catch(next);
        } else {
            return res.sendStatus(403);
        }
    });
});


router.delete('/:joke', auth.required, function (req: any, res, next) {

    User.findById(req.payload.id).then(function () {
        if (req.joke.author._id.toString() === req.payload.id.toString()) {
            return req.joke.remove().then(function () {
                return res.sendStatus(204);
            });
        } else {
            return res.sendStatus(403);
        }
    }).catch(next)
});


// Favorite joke
router.post('/:joke/favorite', auth.required, function (req: any, res, next) {
    let jokeId = req.joke._id;

    User.findById(req.payload.id).then(function (user) {
        if (!user) {
            return res.sendStatus(401);
        }

        return user.favorite(jokeId).then(function () {
            return req.joke.updateFavoriteCount().then(function (joke) {
                return res.json({joke: joke.toJSONFor(user)});
            });
        });
    }).catch(next);
});


// Unfavorite  joke
router.delete('/:joke/unfavorite', auth.required, function (req: any, res, next) {
    let jokeId = req.joke._id;

    User.findById(req.payload.id).then(function (user) {
        if (!user) {
            return res.sendStatus(401);
        }

        return user.unfavorite(jokeId).then(function () {
            return req.joke.updateFavoriteCount().then(function (joke) {
                return res.json({joke: joke.toJSONFor(user)});
            });
        });
    }).catch(next);
});


// return an article's comments
router.get('/:joke/comments', auth.optional, function (req: any, res, next) {
    Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function (user) {
        return req.joke.populate({
            path: 'comments',
            populate: {
                path: 'author'
            },
            options: {
                sort: {
                    createdAt: 'desc'
                }
            }
        }).execPopulate().then(function (joke) {
            return res.json({
                comments: req.joke.comments.map(function (comment) {
                    return comment.toJSONFor(user);
                })
            });
        });
    }).catch(next);
});


router.post('/:joke/comments', auth.required, function (req: any, res, next) {

    User.findById(req.payload.id).then(function (user) {

        if (!user) {
            return res.sendStatus(401);
        }

        let comment = new Comment(req.body.comment);
        comment.joke = req.joke;
        comment.author = user;

        return comment.save().then(function () {
            req.joke.comments.push(comment);

            return req.joke.save().then(function (joke) {
                res.json({comment: comment.toJSONFor(user)})
            })
        })


    }).catch(next)

});


router.get('/:joke/comments', auth.optional, function (req: any, res, next) {

    Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function (user) {
        return req.joke.populate({
            path: 'comments',
            populate: {
                path: 'author'
            },
            options: {
                sort: {
                    createdAt: 'desc'
                }
            }
        }).execPopulate().then(function (joke) {
            return res.json({
                comments: req.joke.comments.map(function (comment) {
                    return comment.toJSONFor(user)
                })
            })
        })

    }).catch(next)

});


router.delete('/:joke/comments/:comment', auth.required, function (req: any, res, next) {
    if (req.comment.author.toString() === req.payload.id.toString()) {
        req.joke.comments.remove(req.comment._id);
        req.joke.save()
            .then(Comment.find({_id: req.comment._id}).remove().exec())
            .then(function () {
                res.sendStatus(204);
            });
    } else {
        res.sendStatus(403);
    }
});


module.exports = router;