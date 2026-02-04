import express from 'express';
import { authenticate } from '../middleware/auth';
import { Membership, OrgRole } from '../models/Membership';
import { Timesheet } from '../models/Timesheet';
import mongoose from 'mongoose';

const router = express.Router({ mergeParams: true });

// Helper: Check membership
const checkMembership = (minRole?: OrgRole) => {
    return async (req: any, res: any, next: any) => {
        try {
            const orgId = req.params.orgId || req.body.orgId;
            if (!orgId) return res.status(400).json({ message: 'Organization ID required' });

            const membership = await Membership.findOne({ userId: req.user.id, orgId });
            if (!membership || membership.status !== 'active') {
                return res.status(403).json({ message: 'Not a member of this organization' });
            }

            // If a specific minimum role is required (e.g. ADMIN), check stricter permissions
            if (minRole === OrgRole.ADMIN) {
                if (membership.role !== OrgRole.ADMIN && membership.role !== OrgRole.OWNER) {
                    return res.status(403).json({ message: 'Insufficient permissions' });
                }
            } else if (minRole === OrgRole.OWNER) {
                if (membership.role !== OrgRole.OWNER) {
                    return res.status(403).json({ message: 'Insufficient permissions' });
                }
            }

            (req as any).membership = membership;
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * @route   GET /api/orgs/:orgId/timesheets
 * @desc    Get all timesheets for an organization
 * @access  Private (Admin/Owner)
 */
router.get('/:orgId/timesheets', authenticate, checkMembership(OrgRole.ADMIN), async (req, res) => {
    try {
        const { startDate, endDate, workerId } = req.query;
        const query: any = { orgId: req.params.orgId };

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate as string);
            if (endDate) query.createdAt.$lte = new Date(endDate as string);
        }

        if (workerId) {
            query.workerId = workerId;
        }

        const timesheets = await Timesheet.find(query)
            .populate('shiftId', 'date type')
            .sort({ createdAt: -1 });

        res.json(timesheets);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   PATCH /api/timesheets/:id
 * @desc    Update a timesheet entry
 * @access  Private (Admin/Owner)
 */
router.patch('/timesheets/:id', authenticate, async (req: any, res) => {
    try {
        const { hoursWorked, ratePerShift, notes, status } = req.body;

        const timesheet = await Timesheet.findById(req.params.id);
        if (!timesheet) {
            return res.status(404).json({ message: 'Timesheet not found' });
        }

        // Verify cleanup permissions
        const membership = await Membership.findOne({ userId: req.user.id, orgId: timesheet.orgId });
        if (!membership || (membership.role !== OrgRole.ADMIN && membership.role !== OrgRole.OWNER)) {
            return res.status(403).json({ message: 'Not authorized to edit timesheets' });
        }

        if (hoursWorked !== undefined) timesheet.hoursWorked = hoursWorked;
        if (ratePerShift !== undefined) timesheet.ratePerShift = ratePerShift;
        if (notes !== undefined) timesheet.notes = notes;

        // Recalculate pay if needed
        if (timesheet.ratePerShift && timesheet.hoursWorked) {
            // Simple logic: if rate is per shift (usually 8h), pay = (hours/8) * rate
            // Or if rate is hourly... let's assume rate is per Shift for now as per model hint, 
            // but usually it's easier to store hourly rate. 
            // Let's assume ratePerShift is actually "Daily Rate" for a full shift.
            // If hours < 8, pro-rate? Or just pay rate? 
            // Let's assume Rate is Hourly for calculation simplicity in this update, or provided from FE.
            // Actually model says `ratePerShift`. Let's assume it is a fixed rate for the shift, unless hours changed significantly.
            // Let's keep it simple: totalPay = ratePerShift (if flat) OR hours * hourlyRate.
            // For this iteration, let's just update fields.
        }

        await timesheet.save();
        res.json(timesheet);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   DELETE /api/timesheets/:id
 * @desc    Delete a timesheet
 * @access  Private (Admin/Owner)
 */
router.delete('/timesheets/:id', authenticate, async (req: any, res) => {
    try {
        const timesheet = await Timesheet.findById(req.params.id);
        if (!timesheet) {
            return res.status(404).json({ message: 'Timesheet not found' });
        }

        const membership = await Membership.findOne({ userId: req.user.id, orgId: timesheet.orgId });
        if (!membership || (membership.role !== OrgRole.ADMIN && membership.role !== OrgRole.OWNER)) {
            return res.status(403).json({ message: 'Not authorized to delete timesheets' });
        }

        await timesheet.deleteOne();
        res.json({ message: 'Timesheet removed' });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
