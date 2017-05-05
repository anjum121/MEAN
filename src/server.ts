/**
 * Created by anjum on 06/05/17.
 */
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as cors from 'cors';

import router from './router/v1';
import config from './config/main';


// Init Express
const app = express();

// Init Mongoose
mongoose.connect(config.db);

// Express Middleware
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(cors());


router(app);

// Init Server
let server;
if (process.env.NODE_ENV !== config.test_env) {
    server = app.listen(config.port);
    console.log(`server listening on ${config.port}`);
} else {
    server = app.listen(config.test_port);
    console.log(`Server listening on ${config.test_port}`);
}


export default server;