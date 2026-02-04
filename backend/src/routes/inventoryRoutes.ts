import express from 'express';
import { authenticate } from '../middleware/auth';
import { Membership } from '../models/Membership';
import { Inventory } from '../models/Inventory';

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

// GET all inventory items
router.get('/:orgId/inventory', authenticate, checkMembership(), async (req, res) => {
    try {
        const inventory = await Inventory.find({ orgId: req.params.orgId })
            .sort({ itemType: 1, name: 1 });
        res.json(inventory);
    } catch (error: any) {
        console.error('Fetch Inventory Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST create inventory item
router.post('/:orgId/inventory', authenticate, checkMembership(), async (req: any, res) => {
    try {
        const { itemType, name, quantity, unit, valuePerUnit, location, notes } = req.body;

        const totalValue = valuePerUnit ? quantity * valuePerUnit : undefined;

        const item = await Inventory.create({
            orgId: req.params.orgId,
            itemType,
            name,
            quantity,
            unit,
            valuePerUnit,
            totalValue,
            location,
            notes,
        });

        res.status(201).json(item);
    } catch (error: any) {
        console.error('Create Inventory Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PATCH update inventory item
router.patch('/:orgId/inventory/:id', authenticate, checkMembership(), async (req, res) => {
    try {
        const updates = req.body;

        if (updates.quantity && updates.valuePerUnit) {
            updates.totalValue = updates.quantity * updates.valuePerUnit;
        }

        updates.lastUpdated = new Date();

        const item = await Inventory.findOneAndUpdate(
            { _id: req.params.id, orgId: req.params.orgId },
            updates,
            { new: true, runValidators: true }
        );

        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        res.json(item);
    } catch (error: any) {
        console.error('Update Inventory Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE inventory item
router.delete('/:orgId/inventory/:id', authenticate, checkMembership(), async (req, res) => {
    try {
        const item = await Inventory.findOneAndDelete({
            _id: req.params.id,
            orgId: req.params.orgId,
        });

        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        res.json({ message: 'Inventory item deleted successfully' });
    } catch (error: any) {
        console.error('Delete Inventory Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET inventory stats
router.get('/:orgId/inventory/stats', authenticate, checkMembership(), async (req, res) => {
    try {
        const items = await Inventory.find({ orgId: req.params.orgId });

        const totalValue = items.reduce((sum, item) => sum + (item.totalValue || 0), 0);
        const byType = items.reduce((acc: any, item) => {
            if (!acc[item.itemType]) {
                acc[item.itemType] = { count: 0, value: 0 };
            }
            acc[item.itemType].count += 1;
            acc[item.itemType].value += item.totalValue || 0;
            return acc;
        }, {});

        res.json({
            totalItems: items.length,
            totalValue,
            byType,
        });
    } catch (error: any) {
        console.error('Inventory Stats Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
