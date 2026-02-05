import express from 'express';
import { authenticate } from '../middleware/auth';
import { Membership } from '../models/Membership';
import { Equipment } from '../models/Equipment';

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
 * @route   GET /api/orgs/:orgId/equipment
 * @desc    Get all equipment for an organization
 * @access  Private
 */
router.get('/:orgId/equipment', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const equipment = await Equipment.find({ orgId: req.params.orgId }).sort({ createdAt: -1 });
        res.json(equipment);
    } catch (error: any) {
        console.error('Fetch Equipment Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/orgs/:orgId/equipment
 * @desc    Add new equipment
 * @access  Private
 */
router.post('/:orgId/equipment', authenticate, checkMembership(), async (req: any, res) => {
    try {
        const {
            name,
            type,
            serialNumber,
            purchaseDate,
            purchasePrice,
            currentValue,
            status,
            maintenanceSchedule,
            lastMaintenanceDate,
            nextMaintenanceDate,
            notes,
        } = req.body;
        const orgId = req.params.orgId;

        const equipment = await Equipment.create({
            orgId,
            name,
            type,
            serialNumber,
            purchaseDate: new Date(purchaseDate),
            purchasePrice,
            currentValue: currentValue || purchasePrice, // Default to purchase price if not provided
            status: status || 'operational',
            maintenanceSchedule,
            lastMaintenanceDate: lastMaintenanceDate ? new Date(lastMaintenanceDate) : undefined,
            nextMaintenanceDate: nextMaintenanceDate ? new Date(nextMaintenanceDate) : undefined,
            notes,
        });

        res.status(201).json(equipment);
    } catch (error: any) {
        console.error('Create Equipment Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   PATCH /api/orgs/:orgId/equipment/:id
 * @desc    Update equipment
 * @access  Private
 */
router.patch('/:orgId/equipment/:id', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const updates = req.body;

        // Convert date strings to Date objects if present
        if (updates.purchaseDate) updates.purchaseDate = new Date(updates.purchaseDate);
        if (updates.lastMaintenanceDate) updates.lastMaintenanceDate = new Date(updates.lastMaintenanceDate);
        if (updates.nextMaintenanceDate) updates.nextMaintenanceDate = new Date(updates.nextMaintenanceDate);

        const equipment = await Equipment.findOneAndUpdate(
            { _id: req.params.id, orgId: req.params.orgId },
            updates,
            { new: true, runValidators: true }
        );

        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        res.json(equipment);
    } catch (error: any) {
        console.error('Update Equipment Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   DELETE /api/orgs/:orgId/equipment/:id
 * @desc    Delete equipment
 * @access  Private
 */
router.delete('/:orgId/equipment/:id', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const equipment = await Equipment.findOneAndDelete({
            _id: req.params.id,
            orgId: req.params.orgId,
        });

        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        res.json({ message: 'Equipment deleted successfully' });
    } catch (error: any) {
        console.error('Delete Equipment Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
