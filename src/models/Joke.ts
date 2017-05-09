/**
 * Created by anjum on 09/05/17.
 */
import * as mongoose from 'mongoose';
import * as uniqueValidator from 'mongoose-unique-validator';
import * as slug from 'slug';
let User = mongoose.model('User');
let Comment = mongoose.model('Comment');

let JokeSchema = new mongoose.Schema({
    slug: {type: String, lowercase: true, unique: true},
    title: String,
    description: String,
    body: String,
    favoritesCount: {type: Number, default: 0},
    tagList: [{type: String}],
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, {timestamps: true});


JokeSchema.plugin(uniqueValidator, {message: 'is already taken sorry :('});

JokeSchema.methods.slugify = function () {
    this.slug = slug(this.title);
};

JokeSchema.pre('validate', function (next) {
   this.slugify();
    next();
});

JokeSchema.methods.toJSONFor = function (user) {

    return{
        slug : this.slug,
        title : this.title,
        description : this.description,
        body : this.body,
        createdAt : this.createdAt,
        updatedAt : this.updatedAt,
        tagList : this.tagList,
        favorited: user ? user.isFavorite(this._id) : false,
        favoritesCount: this.favoritesCount,
        author: this.author.toProfileJSONFor(user)
    }

};

JokeSchema.methods.updateFavoriteCount = function() {
    let joke = this;
    return User.count({favorites: {$in: [joke._id]}}).then(function(count){
        joke.favoritesCount = count;
        return joke.save();
    });
};

mongoose.model('Joke', JokeSchema);