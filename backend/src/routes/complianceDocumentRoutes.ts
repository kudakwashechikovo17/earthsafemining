import express from 'express';
import { authenticate } from '../middleware/auth';
import { Membership } from '../models/Membership';
import { ComplianceDocument } from '../models/ComplianceDocument';
import { upload } from '../middleware/upload';

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

// Helper: Calculate document status based on expiry date
const calculateStatus = (expiryDate: Date): 'active' | 'expiring' | 'expired' => {
    const today = new Date();
    const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) return 'expired';
    if (daysLeft <= 30) return 'expiring';
    return 'active';
};

/**
 * @route   GET /api/orgs/:orgId/compliance/documents
 * @desc    Get all compliance documents for an organization
 * @access  Private
 */
router.get('/:orgId/compliance/documents', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const documents = await ComplianceDocument.find({ orgId: req.params.orgId }).sort({ createdAt: -1 });

        // Calculate daysLeft for each document
        const documentsWithDays = documents.map(doc => {
            const today = new Date();
            const daysLeft = Math.ceil((doc.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return {
                ...doc.toObject(),
                daysLeft: Math.max(0, daysLeft),
            };
        });

        res.json(documentsWithDays);
    } catch (error: any) {
        console.error('Fetch Compliance Documents Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



/**
 * @route   POST /api/orgs/:orgId/compliance/documents
 * @desc    Upload a new compliance document
 * @access  Private
 */
router.post('/:orgId/compliance/documents', authenticate, checkMembership(), upload.single('file'), async (req: any, res) => {
    try {
        const { type, number, issuedDate, expiryDate, issuer, notes } = req.body;
        const orgId = req.params.orgId;

        let fileUrl = '';
        if (req.file) {
            // Store the relative path or full URL depending on how you serve static files
            // Assuming static serve at /uploads
            fileUrl = `/uploads/${req.file.filename}`;
        } else if (req.body.fileUrl) {
            // Fallback if just sending string (legacy or testing)
            fileUrl = req.body.fileUrl;
        }

        // Calculate status based on expiry date
        const status = calculateStatus(new Date(expiryDate));

        const document = await ComplianceDocument.create({
            orgId,
            type,
            number,
            issuedDate: new Date(issuedDate),
            expiryDate: new Date(expiryDate),
            status,
            issuer,
            fileUrl,
            notes,
        });

        res.status(201).json(document);
    } catch (error: any) {
        console.error('Create Compliance Document Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   DELETE /api/orgs/:orgId/compliance/documents/:id
 * @desc    Delete a compliance document
 * @access  Private
 */
router.delete('/:orgId/compliance/documents/:id', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const document = await ComplianceDocument.findOneAndDelete({
            _id: req.params.id,
            orgId: req.params.orgId,
        });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.json({ message: 'Document deleted successfully' });
    } catch (error: any) {
        console.error('Delete Compliance Document Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
