/**
 * Created by anjum on 06/05/17.
 */

import * as express from 'express';

let router = express.Router();

router.use('/api', require('./api'));

module.exports = router;
