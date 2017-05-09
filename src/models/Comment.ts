/**
 * Created by anjum on 09/05/17.
 */
import * as mongoose from 'mongoose';
import * as uniqueValidator from 'mongoose-unique-validator';
import * as slug from 'slug';
let User = mongoose.model('User');

let CommentSchema = new mongoose.Schema({
    body: String,
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    joke: {type: mongoose.Schema.Types.ObjectId, ref: 'Joke'},

}, {timestamps: true});


CommentSchema.methods.toJSONFor = function (user) {

    return{
        id : this._id,
        body: this.body,
        createdAt : this.createdAt,
        author : this.author.toProfileJSONFor(user)
    }

};


mongoose.model('Comment', CommentSchema);

