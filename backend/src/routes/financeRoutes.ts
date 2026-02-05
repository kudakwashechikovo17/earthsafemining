import express from 'express';
import { authenticate } from '../middleware/auth';
import { Membership } from '../models/Membership';
import { Expense } from '../models/Expense';
import { Receipt } from '../models/Receipt';
import { SalesTransaction } from '../models/SalesTransaction';

const router = express.Router({ mergeParams: true });

// Check membership (simplified for brevity, should be shared middleware)
const checkAuth = async (req: any, res: any, next: any) => {
    try {
        const orgId = req.params.orgId;
        const membership = await Membership.findOne({ userId: req.user.id, orgId });
        if (!membership) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        next();
    } catch (e) { res.status(500).json({ message: 'Error' }); }
};

/**
 * @route   POST /api/orgs/:orgId/expenses
 * @desc    Log an expense
 */
router.post('/:orgId/expenses', authenticate, checkAuth, async (req: any, res: any) => {
    try {
        const { date, category, description, amount, supplier } = req.body;
        const expense = await Expense.create({
            orgId: req.params.orgId,
            date,
            category,
            description,
            amount,
            supplier,
            enteredBy: req.user.id
        });
        res.status(201).json(expense);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/orgs/:orgId/expenses
 * @desc    Get expenses
 */
router.get('/:orgId/expenses', authenticate, checkAuth, async (req: any, res: any) => {
    try {
        const expenses = await Expense.find({ orgId: req.params.orgId })
            .sort({ date: -1 })
            .limit(50);
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   GET /api/orgs/:orgId/sales
 * @desc    Get verified sales
 */
router.get('/:orgId/sales', authenticate, checkAuth, async (req: any, res: any) => {
    try {
        const sales = await SalesTransaction.find({ orgId: req.params.orgId })
            .sort({ date: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
