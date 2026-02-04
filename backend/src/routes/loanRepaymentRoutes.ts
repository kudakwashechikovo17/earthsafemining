import express from 'express';
import { authenticate } from '../middleware/auth';
import { Membership } from '../models/Membership';
import { LoanRepayment } from '../models/LoanRepayment';
import { Loan } from '../models/Loan';

const router = express.Router({ mergeParams: true });

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

// GET all repayments for a loan
router.get('/:orgId/loans/:loanId/repayments', authenticate, checkMembership(), async (req, res) => {
    try {
        const repayments = await LoanRepayment.find({ loanId: req.params.loanId })
            .populate('recordedBy', 'firstName lastName')
            .sort({ paymentDate: -1 });
        res.json(repayments);
    } catch (error: any) {
        console.error('Fetch Repayments Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET all repayments for an organization
router.get('/:orgId/repayments', authenticate, checkMembership(), async (req, res) => {
    try {
        const repayments = await LoanRepayment.find({ orgId: req.params.orgId })
            .populate('recordedBy', 'firstName lastName')
            .populate('loanId', 'amount lender')
            .sort({ paymentDate: -1 });
        res.json(repayments);
    } catch (error: any) {
        console.error('Fetch All Repayments Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST create repayment
router.post('/:orgId/loans/:loanId/repayments', authenticate, checkMembership(), async (req: any, res) => {
    try {
        const {
            paymentDate,
            amount,
            principalPaid,
            interestPaid,
            remainingBalance,
            paymentMethod,
            transactionRef,
            notes,
        } = req.body;

        const repayment = await LoanRepayment.create({
            loanId: req.params.loanId,
            orgId: req.params.orgId,
            paymentDate: new Date(paymentDate),
            amount,
            principalPaid,
            interestPaid,
            remainingBalance,
            paymentMethod,
            transactionRef,
            status: 'completed',
            notes,
            recordedBy: req.user.id,
        });

        const populatedRepayment = await LoanRepayment.findById(repayment._id)
            .populate('recordedBy', 'firstName lastName');

        res.status(201).json(populatedRepayment);
    } catch (error: any) {
        console.error('Create Repayment Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PATCH update repayment
router.patch('/:orgId/repayments/:id', authenticate, checkMembership(), async (req, res) => {
    try {
        const updates = req.body;

        if (updates.paymentDate) updates.paymentDate = new Date(updates.paymentDate);

        const repayment = await LoanRepayment.findOneAndUpdate(
            { _id: req.params.id, orgId: req.params.orgId },
            updates,
            { new: true, runValidators: true }
        ).populate('recordedBy', 'firstName lastName');

        if (!repayment) {
            return res.status(404).json({ message: 'Repayment not found' });
        }

        res.json(repayment);
    } catch (error: any) {
        console.error('Update Repayment Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE repayment
router.delete('/:orgId/repayments/:id', authenticate, checkMembership(), async (req, res) => {
    try {
        const repayment = await LoanRepayment.findOneAndDelete({
            _id: req.params.id,
            orgId: req.params.orgId,
        });

        if (!repayment) {
            return res.status(404).json({ message: 'Repayment not found' });
        }

        res.json({ message: 'Repayment deleted successfully' });
    } catch (error: any) {
        console.error('Delete Repayment Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
