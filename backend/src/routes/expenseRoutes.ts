import express from 'express';
import { authenticate } from '../middleware/auth';
import { Membership } from '../models/Membership';
import { Expense } from '../models/Expense';

const router = express.Router({ mergeParams: true });

// Helper: Check membership
const checkMembership = () => {
    return async (req: any, res: any, next: any) => {
        try {
            const orgId = req.params.orgId || req.body.orgId;
            if (!orgId) return res.status(400).json({ message: 'Organization ID required' });

            const membership = await Membership.findOne({ userId: req.user.id, orgId });
            if (!membership || membership.status !== 'active') {
                return res.status(403).json({ message: 'Not a member of this organization' });
            }
            (req as any).membership = membership;
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * @route   GET /api/orgs/:orgId/expenses
 * @desc    Get all expenses for an organization
 * @access  Private
 */
router.get('/:orgId/expenses', authenticate, checkMembership(), async (req, res) => {
    try {
        const expenses = await Expense.find({ orgId: req.params.orgId })
            .populate('enteredBy', 'firstName lastName')
            .sort({ date: -1 });
        res.json(expenses);
    } catch (error: any) {
        console.error('Fetch Expenses Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/orgs/:orgId/expenses
 * @desc    Create new expense
 * @access  Private
 */
router.post('/:orgId/expenses', authenticate, checkMembership(), async (req: any, res) => {
    try {
        const {
            date,
            category,
            description,
            amount,
            currency,
            supplier,
            paymentMethod,
            notes,
        } = req.body;

        const expense = await Expense.create({
            orgId: req.params.orgId,
            date: new Date(date),
            category,
            description,
            amount,
            currency: currency || 'USD',
            supplier,
            paymentMethod,
            enteredBy: req.user.id,
            notes,
        });

        const populatedExpense = await Expense.findById(expense._id)
            .populate('enteredBy', 'firstName lastName');

        res.status(201).json(populatedExpense);
    } catch (error: any) {
        console.error('Create Expense Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   PATCH /api/orgs/:orgId/expenses/:id
 * @desc    Update expense
 * @access  Private
 */
router.patch('/:orgId/expenses/:id', authenticate, checkMembership(), async (req, res) => {
    try {
        const updates = req.body;

        if (updates.date) updates.date = new Date(updates.date);

        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, orgId: req.params.orgId },
            updates,
            { new: true, runValidators: true }
        ).populate('enteredBy', 'firstName lastName');

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json(expense);
    } catch (error: any) {
        console.error('Update Expense Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   DELETE /api/orgs/:orgId/expenses/:id
 * @desc    Delete expense
 * @access  Private
 */
router.delete('/:orgId/expenses/:id', authenticate, checkMembership(), async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            orgId: req.params.orgId,
        });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json({ message: 'Expense deleted successfully' });
    } catch (error: any) {
        console.error('Delete Expense Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   GET /api/orgs/:orgId/expenses/stats
 * @desc    Get expense statistics
 * @access  Private
 */
router.get('/:orgId/expenses/stats', authenticate, checkMembership(), async (req, res) => {
    try {
        const expenses = await Expense.find({ orgId: req.params.orgId });

        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const byCategory = expenses.reduce((acc: any, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});

        res.json({
            total: totalExpenses,
            count: expenses.length,
            byCategory,
        });
    } catch (error: any) {
        console.error('Expense Stats Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
