/**
 * Created by anjum on 06/05/17.
 */

import * as express from 'express';

let router = express.Router();

router.use('/', require('./users'));
router.use('/profile', require('./profile'));
router.use('/tags', require('./tags'));
router.use('/joke', require('./joke'));


router.use((err, req, res, next) => {

    if (err.name === 'ValidationError') {
        return res.status(422).json({
            errors: Object.keys(err.errors).reduce((errors, key) => {
                errors[key] = err.errors[key].message;
                return errors;
            }, {})
        });
    }
    return next(err);

});
module.exports = router;