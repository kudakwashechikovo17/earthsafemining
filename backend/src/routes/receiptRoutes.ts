import express from 'express';
import { authenticate } from '../middleware/auth';
import { Membership } from '../models/Membership';
import { Receipt } from '../models/Receipt';

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
 * @route   GET /api/orgs/:orgId/receipts
 * @desc    Get all receipts for an organization
 * @access  Private
 */
router.get('/:orgId/receipts', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const receipts = await Receipt.find({ orgId: req.params.orgId })
            .populate('uploadedBy', 'firstName lastName')
            .sort({ date: -1 });
        res.json(receipts);
    } catch (error: any) {
        console.error('Fetch Receipts Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/orgs/:orgId/receipts
 * @desc    Upload new receipt
 * @access  Private
 */
router.post('/:orgId/receipts', authenticate, checkMembership(), async (req: any, res) => {
    try {
        const {
            date,
            fileUrl,
            vendor,
            total,
            currency,
            extractedText,
            confidenceScore,
        } = req.body;

        const receipt = await Receipt.create({
            orgId: req.params.orgId,
            date: new Date(date),
            fileUrl,
            vendor,
            total,
            currency: currency || 'USD',
            extractedText,
            confidenceScore,
            status: 'processed',
            uploadedBy: req.user.id,
        });

        const populatedReceipt = await Receipt.findById(receipt._id)
            .populate('uploadedBy', 'firstName lastName');

        res.status(201).json(populatedReceipt);
    } catch (error: any) {
        console.error('Create Receipt Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   PATCH /api/orgs/:orgId/receipts/:id
 * @desc    Update receipt
 * @access  Private
 */
router.patch('/:orgId/receipts/:id', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const updates = req.body;

        if (updates.date) updates.date = new Date(updates.date);

        const receipt = await Receipt.findOneAndUpdate(
            { _id: req.params.id, orgId: req.params.orgId },
            updates,
            { new: true, runValidators: true }
        ).populate('uploadedBy', 'firstName lastName');

        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }

        res.json(receipt);
    } catch (error: any) {
        console.error('Update Receipt Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   DELETE /api/orgs/:orgId/receipts/:id
 * @desc    Delete receipt
 * @access  Private
 */
router.delete('/:orgId/receipts/:id', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const receipt = await Receipt.findOneAndDelete({
            _id: req.params.id,
            orgId: req.params.orgId,
        });

        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }

        res.json({ message: 'Receipt deleted successfully' });
    } catch (error: any) {
        console.error('Delete Receipt Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
