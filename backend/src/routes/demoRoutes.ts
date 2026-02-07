import express from 'express';
import { seedDemoData, seedMissingData } from '../controllers/demoDataController';

const router = express.Router();

router.post('/seed', seedDemoData);
router.post('/seed-missing', seedMissingData);

export default router;
