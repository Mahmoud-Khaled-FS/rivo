import { Router } from 'express';
import * as controllers from '../controllers/rivo';
import upload from '../middlewares/videoUpload';

const router = Router();

router.get('/search', controllers.getRivosBySearch);

router.get('/:id', controllers.getRivoWithId);

router.get('/stream/:id', controllers.getRivoStream);

router.post('/upload', upload, controllers.uploadVideo);

router.put('/edit/:id', controllers.editRivoDetails);

router.delete('/delete/:id', controllers.deleteRivo);

export default router;
