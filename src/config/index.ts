/**
 * Created by anjum on 06/05/17.
 */
module.exports = {
    secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret'
};
