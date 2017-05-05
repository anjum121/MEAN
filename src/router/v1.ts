/**
 * Created by anjum on 06/05/17.
 */
import * as express from 'express';
import * as passport from 'passport';

export default (app) => {

    // Api Routes
    const apiRoutes = express.Router();


    app.use('/api/v1', apiRoutes);

}