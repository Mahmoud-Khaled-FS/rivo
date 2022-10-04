import { Router } from 'express';
import * as controllers from '../controllers/likes';

const router = Router();

router.get('/:id', controllers.getLikesForVideo);

router.post('/:id', controllers.addLikeForVideo);

router.delete('/:id', controllers.deleteCommentForVideo);

export default router;
