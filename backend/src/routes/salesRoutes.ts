import express from 'express';
import { authenticate } from '../middleware/auth';
import { Membership, OrgRole } from '../models/Membership';
import SalesTransaction, { SaleStatus } from '../models/SalesTransaction';
import Organization from '../models/Organization';

const router = express.Router({ mergeParams: true });

// Helper: Check membership
const checkMembership = (allowedRoles: OrgRole[] = []) => {
    return async (req: any, res: any, next: any) => {
        try {
            const orgId = req.params.orgId || req.body.orgId || req.query.orgId;
            if (!orgId) return res.status(400).json({ message: 'Organization ID required' });

            const membership = await Membership.findOne({ userId: req.user.id, orgId });
            if (!membership || membership.status !== 'active') {
                return res.status(403).json({ message: 'Not a member of this organization' });
            }

            if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }

            (req as any).membership = membership;
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * @route   POST /api/orgs/:orgId/sales
 * @desc    Record a new sale
 * @access  Private (Miner+)
 */
router.post('/:orgId/sales', authenticate, checkMembership([OrgRole.MINER, OrgRole.ADMIN]), async (req: any, res) => {
    try {
        const { buyerName, quantity, pricePerUnit, unit, receiptNumber, notes, date } = req.body;
        const orgId = req.params.orgId;

        console.log('Received sale request:', {
            orgId,
            body: req.body,
            user: req.user
        });

        const totalValue = parseFloat(quantity) * parseFloat(pricePerUnit);

        // Determine source based on buyer name
        let source = SaleSource.OTHER;
        if (buyerName && buyerName.toLowerCase().includes('fidelity')) {
            source = SaleSource.FIDELITY;
        } else if (buyerName && buyerName.toLowerCase().includes('private')) {
            source = SaleSource.PRIVATE;
        }

        const sale = await SalesTransaction.create({
            orgId,
            buyerName,
            grams: quantity, // Assuming standardizing on grams for now as per schema
            pricePerGram: pricePerUnit,
            totalValue,
            currency: 'USD',
            status: SaleStatus.PENDING,
            date: date || new Date(),
            referenceId: receiptNumber,
            mineralType: 'gold',
            source: source
        });

        res.status(201).json(sale);
    } catch (error: any) {
        console.error('Create Sale Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/orgs/:orgId/sales
 * @desc    Get sales history
 * @access  Private
 */
router.get('/:orgId/sales', authenticate, checkMembership(), async (req, res) => {
    try {
        const sales = await SalesTransaction.find({ orgId: req.params.orgId })
            .sort({ date: -1 })
            .limit(50);
        res.json(sales);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Stats endpoint
router.get('/:orgId/sales/stats', authenticate, checkMembership(), async (req, res) => {
    try {
        // Aggregation logic (similar to dashboard but specific to sales page if needed)
        // For now, frontend calculates from list or dashboard uses its own.
        res.json({ message: 'Use dashboard endpoint for aggregated stats' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
