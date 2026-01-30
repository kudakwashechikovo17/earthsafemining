import express from 'express';
import { authenticate } from '../middleware/auth';
import { Membership, OrgRole } from '../models/Membership';
import { Shift, ShiftStatus } from '../models/Shift';
import { Timesheet } from '../models/Timesheet';
import { MaterialMovement } from '../models/MaterialMovement';

const router = express.Router({ mergeParams: true }); // Enable access to params from parent router if needed

// Helper middleware for membership check
const checkMembership = (role?: OrgRole) => {
    return async (req: any, res: any, next: any) => {
        try {
            // If orgId is in params (from /api/orgs/:orgId/shifts)
            const orgId = req.params.orgId || req.body.orgId; // Fallback
            if (!orgId) return next(); // Let endpoints handle missing ID if strict

            const membership = await Membership.findOne({
                userId: req.user.id,
                orgId: orgId
            });

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
 * @route   POST /api/orgs/:orgId/shifts
 * @desc    Start a new shift
 * @access  Private (Miner+)
 */
router.post('/:orgId/shifts', authenticate, checkMembership(OrgRole.MINER), async (req: any, res) => {
    try {
        const { type, supervisorId, notes } = req.body;
        const orgId = req.params.orgId;

        const shift = await Shift.create({
            orgId,
            date: new Date(),
            type,
            supervisorId: supervisorId || req.user.id,
            createdById: req.user.id,
            status: ShiftStatus.OPEN,
            startTime: new Date(),
            notes
        });

        res.status(201).json(shift);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/orgs/:orgId/shifts
 * @desc    Get shifts for org
 * @access  Private
 */
router.get('/:orgId/shifts', authenticate, checkMembership(), async (req, res) => {
    try {
        const shifts = await Shift.find({ orgId: req.params.orgId })
            .sort({ date: -1 })
            .limit(50);
        res.json(shifts);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/shifts/:shiftId/timesheets
 * @desc    Add timesheet entry
 * @access  Private
 */
router.post('/shifts/:shiftId/timesheets', authenticate, async (req: any, res) => {
    try {
        // First get shift to know Org
        const shift = await Shift.findById(req.params.shiftId);
        if (!shift) {
            res.status(404).json({ message: 'Shift not found' });
            return;
        }

        // Check auth against shift's org
        const membership = await Membership.findOne({ userId: req.user.id, orgId: shift.orgId });
        if (!membership) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        const { workerName, role, hoursWorked, notes } = req.body;

        const timesheet = await Timesheet.create({
            shiftId: shift._id,
            orgId: shift.orgId,
            workerName,
            role,
            hoursWorked,
            notes
        });

        res.status(201).json(timesheet);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   POST /api/shifts/:shiftId/material
 * @desc    Add material movement
 * @access  Private
 */
router.post('/shifts/:shiftId/material', authenticate, async (req: any, res) => {
    try {
        const shift = await Shift.findById(req.params.shiftId);
        if (!shift) {
            res.status(404).json({ message: 'Shift not found' });
            return;
        }

        const membership = await Membership.findOne({ userId: req.user.id, orgId: shift.orgId });
        if (!membership) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        const { type, quantity, unit, source, destination } = req.body;

        const movement = await MaterialMovement.create({
            shiftId: shift._id,
            orgId: shift.orgId,
            type,
            quantity,
            unit,
            source,
            destination
        });

        res.status(201).json(movement);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
