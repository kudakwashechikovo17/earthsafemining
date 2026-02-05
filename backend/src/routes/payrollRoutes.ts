import express from 'express';
import { authenticate } from '../middleware/auth';
import { Membership } from '../models/Membership';
import { Payroll } from '../models/Payroll';

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

/**
 * @route   GET /api/orgs/:orgId/payroll
 * @desc    Get all payroll records for an organization
 * @access  Private
 */
router.get('/:orgId/payroll', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const payroll = await Payroll.find({ orgId: req.params.orgId })
            .populate('paidBy', 'firstName lastName')
            .sort({ paymentDate: -1 });
        res.json(payroll);
    } catch (error: any) {
        console.error('Fetch Payroll Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/orgs/:orgId/payroll
 * @desc    Create new payroll record
 * @access  Private
 */
router.post('/:orgId/payroll', authenticate, checkMembership(), async (req: any, res) => {
    try {
        const {
            employeeName,
            employeeId,
            paymentDate,
            amount,
            currency,
            paymentMethod,
            payPeriodStart,
            payPeriodEnd,
            hoursWorked,
            hourlyRate,
            deductions,
            bonuses,
            netPay,
            receiptUrl,
            transactionRef,
            notes,
            status,
        } = req.body;

        const payroll = await Payroll.create({
            orgId: req.params.orgId,
            employeeName,
            employeeId,
            paymentDate: new Date(paymentDate),
            amount,
            currency: currency || 'USD',
            paymentMethod,
            payPeriodStart: new Date(payPeriodStart),
            payPeriodEnd: new Date(payPeriodEnd),
            hoursWorked,
            hourlyRate,
            deductions: deductions || 0,
            bonuses: bonuses || 0,
            netPay,
            receiptUrl,
            transactionRef,
            notes,
            paidBy: req.user.id,
            status: status || 'paid',
        });

        const populatedPayroll = await Payroll.findById(payroll._id)
            .populate('paidBy', 'firstName lastName');

        res.status(201).json(populatedPayroll);
    } catch (error: any) {
        console.error('Create Payroll Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   PATCH /api/orgs/:orgId/payroll/:id
 * @desc    Update payroll record
 * @access  Private
 */
router.patch('/:orgId/payroll/:id', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const updates = req.body;

        if (updates.paymentDate) updates.paymentDate = new Date(updates.paymentDate);
        if (updates.payPeriodStart) updates.payPeriodStart = new Date(updates.payPeriodStart);
        if (updates.payPeriodEnd) updates.payPeriodEnd = new Date(updates.payPeriodEnd);

        const payroll = await Payroll.findOneAndUpdate(
            { _id: req.params.id, orgId: req.params.orgId },
            updates,
            { new: true, runValidators: true }
        ).populate('paidBy', 'firstName lastName');

        if (!payroll) {
            return res.status(404).json({ message: 'Payroll record not found' });
        }

        res.json(payroll);
    } catch (error: any) {
        console.error('Update Payroll Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   DELETE /api/orgs/:orgId/payroll/:id
 * @desc    Delete payroll record
 * @access  Private
 */
router.delete('/:orgId/payroll/:id', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const payroll = await Payroll.findOneAndDelete({
            _id: req.params.id,
            orgId: req.params.orgId,
        });

        if (!payroll) {
            return res.status(404).json({ message: 'Payroll record not found' });
        }

        res.json({ message: 'Payroll record deleted successfully' });
    } catch (error: any) {
        console.error('Delete Payroll Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   GET /api/orgs/:orgId/payroll/stats
 * @desc    Get payroll statistics
 * @access  Private
 */
router.get('/:orgId/payroll/stats', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const payroll = await Payroll.find({ orgId: req.params.orgId, status: 'paid' });

        const totalPaid = payroll.reduce((sum, p) => sum + p.netPay, 0);
        const byEmployee = payroll.reduce((acc: any, p) => {
            if (!acc[p.employeeName]) {
                acc[p.employeeName] = { count: 0, total: 0 };
            }
            acc[p.employeeName].count += 1;
            acc[p.employeeName].total += p.netPay;
            return acc;
        }, {});

        res.json({
            totalPaid,
            totalRecords: payroll.length,
            byEmployee,
        });
    } catch (error: any) {
        console.error('Payroll Stats Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
