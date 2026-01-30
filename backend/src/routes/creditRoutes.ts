import express from 'express';
import { authenticate } from '../middleware/auth';
import { Membership } from '../models/Membership';
import { CreditScore } from '../models/CreditScore';

const router = express.Router({ mergeParams: true });

// Check membership
const checkAuth = async (req: any, res: any, next: any) => {
    try {
        const orgId = req.params.orgId;
        const membership = await Membership.findOne({ userId: req.user.id, orgId });
        if (!membership) return res.status(403).json({ message: 'Not authorized' });
        next();
    } catch (e) { res.status(500).json({ message: 'Error' }); }
};

/**
 * @route   GET /api/orgs/:orgId/credit-score
 * @desc    Get latest credit score
 */
router.get('/:orgId/credit-score', authenticate, checkAuth, async (req, res) => {
    try {
        const score = await CreditScore.findOne({ orgId: req.params.orgId })
            .sort({ calculatedAt: -1 });

        if (!score) {
            return res.json({ message: 'No score calculated yet', score: null });
        }
        res.json(score);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/orgs/:orgId/credit-score/calculate
 * @desc    Trigger calculation (Demo placeholder)
 */
router.post('/:orgId/credit-score/calculate', authenticate, checkAuth, async (req: any, res) => {
    try {
        // In real app, this runs the algo. For now, create dummy score.
        const score = await CreditScore.create({
            orgId: req.params.orgId,
            score: 75,
            grade: 'B',
            factors: [
                { name: 'Revenue Consistency', score: 80, weight: 0.3, impact: 'Positive', explanation: 'Consistent monthly sales verified by Fidelity' },
                { name: 'Compliance', score: 90, weight: 0.15, impact: 'Positive', explanation: 'All licenses active' }
            ],
            modelVersion: 'v1.0'
        });
        res.json(score);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
