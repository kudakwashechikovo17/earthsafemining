import express from 'express';
import { seedDemoData, seedMissingData, forceAddLoansCompliance } from '../controllers/demoDataController';

const router = express.Router();

router.post('/seed', seedDemoData);
router.post('/seed-missing', seedMissingData);
router.post('/force-loans-compliance', forceAddLoansCompliance);

export default router;
