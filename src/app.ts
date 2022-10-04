import express from 'express';
import { config } from 'dotenv';
import { json } from 'body-parser';
import cors from 'cors';
import apiRouters from './routes';
import errorReqHandler from './utils/errorHandler';
import passport from 'passport';
import sessions from 'express-session';
config();

const app = express();

app.use(json());
app.use(cors());
app.use(
  sessions({
    secret: 'ajksbdjasbj',
  }),
);
app.use(passport.initialize());
app.use(passport.session());

//set up routes
app.use('/api', apiRouters);

app.use(errorReqHandler);

app.listen(process.env.PORT, () => console.log('http://localhost:' + process.env.PORT));
