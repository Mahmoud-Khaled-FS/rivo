import { Router } from 'express';
import { body } from 'express-validator';
import * as controllers from '../controllers/profile';

const router = Router();

router.get('/', controllers.getMyProfileHandler);

router.get('/search', controllers.getUserBySearch);

router.get('/:id', controllers.getUserProfile);

router.post('/follow', controllers.followHandler);

router.delete('/follow', controllers.unfollowHandler);

router.put(
  '/edit',
  body('first_name').isAlpha().isLength({ min: 2, max: 20 }),
  body('last_name').isAlpha().isLength({ min: 2, max: 20 }),
  body('bio').isLength({ max: 250 }),
  body('user_image').isURL(),
  body('date_of_birth').isISO8601().toDate(),
  controllers.changeProfileInfoHandler,
);

export default router;
