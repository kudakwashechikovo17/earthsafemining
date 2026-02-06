import express from 'express';
import { seedDemoData } from '../controllers/demoDataController';

const router = express.Router();

router.post('/seed', seedDemoData);

export default router;
