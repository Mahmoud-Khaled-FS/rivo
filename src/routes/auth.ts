import { Router } from 'express';
import { body } from 'express-validator';
import passport from 'passport';
import * as controllers from '../controllers/auth';
const routes = Router();
require('../utils/passport');

routes.post(
  '/signup',
  body('email').isEmail(),
  body('phone').isMobilePhone('any'),
  body('password').isLength({ min: 8, max: 40 }),
  body('first_name').isAlpha().isLength({ min: 2, max: 20 }),
  body('last_name').isAlpha().isLength({ min: 2, max: 20 }),
  controllers.signupHandler,
);

routes.post(
  '/login',
  body('email').isEmail(),
  body('password').isLength({ min: 8, max: 40 }),
  controllers.loginHandler,
);

routes.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
routes.get('/facebook', passport.authenticate('facebook'));
routes.get('/twitter', passport.authenticate('twitter', { scope: ['users.read', 'email'] }));

routes.get('/google/cb', passport.authenticate('google', { session: false }), (req, res) => {
  //@ts-ignore
  res.redirect(process.env.CLIENT_URL_PROVIDER_SUCCESS! + `?token=${req.user?.token}`);
});
routes.get('/facebook/cb', passport.authenticate('facebook', { session: false }), (req, res) => {
  console.log('cs');
  //@ts-ignore
  // res.redirect(process.env.CLIENT_URL_PROVIDER_SUCCESS! + `?token=${req.user?.token}`);
});
routes.get('/twitter/cb', passport.authenticate('twitter', { session: false }), (req, res) => {
  //@ts-ignore
  res.redirect(process.env.CLIENT_URL_PROVIDER_SUCCESS! + `?token=${req.user?.token}`);
});
export default routes;
