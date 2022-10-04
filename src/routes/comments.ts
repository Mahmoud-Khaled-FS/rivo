import { Router } from 'express';
import * as controllers from '../controllers/comments';

const router = Router();

router.get('/:id', controllers.getCommentsForVideo);

router.post('/:id', controllers.createCommentForVideo);

router.delete('/:id', controllers.deleteCommentForVideo);

export default router;
