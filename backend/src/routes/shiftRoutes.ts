import express from 'express';
import { authenticate } from '../middleware/auth';
import { Membership, OrgRole } from '../models/Membership';
import { Shift, ShiftStatus } from '../models/Shift';
import { Timesheet } from '../models/Timesheet';
import { MaterialMovement } from '../models/MaterialMovement';

import mongoose from 'mongoose';

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
 * @desc    Start a new shift (Atomic operation for Shift + Logic)
 * @access  Private (Miner+)
 */
router.post('/:orgId/shifts', authenticate, checkMembership(OrgRole.MINER), async (req: any, res) => {
    try {
        const { type, supervisorId, notes, startTime, weatherCondition, timesheets, materials } = req.body;
        const orgId = req.params.orgId;

        // 1. Create Shift
        const shift = await Shift.create({
            orgId,
            date: new Date(),
            type,
            supervisorId: supervisorId || req.user.id,
            createdById: req.user.id,
            status: ShiftStatus.OPEN,
            startTime: startTime || new Date(),
            notes,
            weatherCondition
        });

        const shiftId = shift._id;

        // 2. Add Timesheets if present (Bulk Insert)
        if (timesheets && Array.isArray(timesheets) && timesheets.length > 0) {
            const timesheetDocs = timesheets.map((ts: any) => ({
                shiftId,
                orgId,
                workerName: ts.workerName,
                role: ts.role,
                hoursWorked: ts.hoursWorked,
                notes: ts.notes
            }));
            await Timesheet.insertMany(timesheetDocs);
        }

        // 3. Add Materials if present (Bulk Insert)
        if (materials && Array.isArray(materials) && materials.length > 0) {
            const materialDocs = materials.map((mat: any) => ({
                shiftId,
                orgId,
                type: mat.type,
                quantity: mat.quantity,
                unit: mat.unit || 'tonnes',
                source: mat.source,
                destination: mat.destination || 'Processing'
            }));
            await MaterialMovement.insertMany(materialDocs);
        }

        res.status(201).json(shift);
    } catch (error: any) {
        console.error('Create Shift Error:', error);
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
 * @route   GET /api/orgs/:orgId/production/stats
 * @desc    Get aggregated production stats
 * @access  Private
 */
router.get('/:orgId/production/stats', authenticate, checkMembership(), async (req: any, res) => {
    try {
        const orgId = req.params.orgId;

        const stats = await MaterialMovement.aggregate([
            {
                $match: {
                    orgId: new mongoose.Types.ObjectId(orgId)
                }
            },
            {
                $group: {
                    _id: '$type',
                    totalQuantity: { $sum: '$quantity' }
                }
            }
        ]);

        const formattedStats = {
            ore: stats.find(s => s._id === 'ore')?.totalQuantity || 0,
            waste: stats.find(s => s._id === 'waste')?.totalQuantity || 0,
            other: stats.find(s => s._id !== 'ore' && s._id !== 'waste')?.totalQuantity || 0
        };

        res.json(formattedStats);
    } catch (error: any) {
        console.error('Stats Error:', error);
        res.status(500).json({ message: 'Server error retrieving stats' });
    }
});

/**
 * @route   POST /api/shifts/:shiftId/timesheets
 * @desc    Add timesheet entry (Legacy support or late entry)
 * @access  Private
 */
router.post('/shifts/:shiftId/timesheets', authenticate, async (req: any, res) => {
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
 * @desc    Add material movement (Legacy support or late entry)
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

/**
 * @route   GET /api/shifts/:shiftId
 * @desc    Get single shift details with related data
 * @access  Private
 */
router.get('/shifts/:shiftId', authenticate, async (req: any, res) => {
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

        const [timesheets, materials] = await Promise.all([
            Timesheet.find({ shiftId: shift._id }),
            MaterialMovement.find({ shiftId: shift._id })
        ]);

        res.json({
            shift,
            timesheets,
            materials
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   PATCH /api/orgs/:orgId/shifts/:shiftId
 * @desc    Update shift details
 * @access  Private
 */
router.patch('/:orgId/shifts/:shiftId', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const { notes, status, endTime, weatherCondition } = req.body;
        const shift = await Shift.findById(req.params.shiftId);
        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        if (shift.orgId.toString() !== req.params.orgId) {
            return res.status(400).json({ message: 'Shift does not belong to this organization' });
        }

        // checkMembership already validates user is in the org

        if (notes !== undefined) shift.notes = notes;
        if (status !== undefined) shift.status = status;
        if (endTime !== undefined) shift.endTime = endTime;
        if (weatherCondition !== undefined) shift.weatherCondition = weatherCondition;

        await shift.save();
        res.json(shift);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   DELETE /api/orgs/:orgId/shifts/:shiftId
 * @desc    Delete shift and all associated data
 * @access  Private (Admin/Owner/Supervisor)
 */
router.delete('/:orgId/shifts/:shiftId', authenticate, checkMembership(), async (req: any, res: any) => {
    console.log(`[ShiftDelete] Hit with params:`, req.params);
    try {
        const shift = await Shift.findById(req.params.shiftId);
        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        if (shift.orgId.toString() !== req.params.orgId) {
            return res.status(400).json({ message: 'Shift does not belong to this organization' });
        }

        const membership = (req as any).membership; // Set by checkMembership

        // Only Creator or Admin can delete
        const isCreator = shift.createdById.toString() === req.user.id;
        const isAdmin = membership.role === OrgRole.ADMIN || membership.role === OrgRole.OWNER;

        if (!isCreator && !isAdmin) {
            return res.status(403).json({ message: 'Insufficient permissions to delete this shift' });
        }

        // Delete associated records first
        await Promise.all([
            Timesheet.deleteMany({ shiftId: shift._id }),
            MaterialMovement.deleteMany({ shiftId: shift._id })
        ]);

        await shift.deleteOne();
        res.json({ message: 'Shift and associated data deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   DELETE /api/shifts/:shiftId
 * @desc    Delete shift (fallback endpoint matching getDetails pattern)
 * @access  Private
 */
router.delete('/shifts/:shiftId', authenticate, async (req: any, res: any) => {
    console.log(`[ShiftDelete] Fallback Hit params:`, req.params);
    try {
        const shift = await Shift.findById(req.params.shiftId);
        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        const membership = await Membership.findOne({ userId: req.user.id, orgId: shift.orgId });
        if (!membership || membership.status !== 'active') {
            return res.status(403).json({ message: 'Not authorized for this organization' });
        }

        // Only Creator or Admin can delete
        const isCreator = shift.createdById.toString() === req.user.id;
        const isAdmin = membership.role === OrgRole.ADMIN || membership.role === OrgRole.OWNER;

        if (!isCreator && !isAdmin) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        await Promise.all([
            Timesheet.deleteMany({ shiftId: shift._id }),
            MaterialMovement.deleteMany({ shiftId: shift._id })
        ]);

        await shift.deleteOne();
        res.json({ message: 'Shift deleted successfully (fallback)' });
    } catch (error: any) {
        console.error('Delete Fallback Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
