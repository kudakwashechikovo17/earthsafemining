import express from 'express';
import { authenticate } from '../middleware/auth';
import { Membership, OrgRole } from '../models/Membership';
import { IncidentReport, IncidentType, IncidentSeverity, IncidentStatus } from '../models/IncidentReport';
import { SafetyChecklist } from '../models/SafetyChecklist';

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
 * @route   POST /api/orgs/:orgId/compliance/incidents
 * @desc    Report a safety incident
 * @access  Private
 */
router.post('/:orgId/compliance/incidents', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const { type, severity, description, location, photos, date } = req.body;
        const orgId = req.params.orgId;

        const incident = await IncidentReport.create({
            orgId,
            reporterId: req.user.id,
            date: date || new Date(),
            type,
            severity,
            description,
            location,
            photos,
            status: IncidentStatus.OPEN
        });

        res.status(201).json(incident);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/orgs/:orgId/compliance/incidents
 * @desc    Get all incidents for org
 * @access  Private
 */
router.get('/:orgId/compliance/incidents', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const incidents = await IncidentReport.find({ orgId: req.params.orgId })
            .sort({ date: -1 })
            .limit(50)
            .populate('reporterId', 'firstName lastName email');
        res.json(incidents);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   PATCH /api/orgs/:orgId/compliance/incidents/:id
 * @desc    Update incident report
 * @access  Private
 */
router.patch('/:orgId/compliance/incidents/:id', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const incident = await IncidentReport.findById(req.params.id);
        if (!incident) return res.status(404).json({ message: 'Incident not found' });

        if (incident.orgId.toString() !== req.params.orgId) {
            return res.status(400).json({ message: 'Incident does not belong to this organization' });
        }

        const membership = await Membership.findOne({ userId: req.user.id, orgId: incident.orgId });
        // checkMembership middleware already puts membership in req, but we double check logic here if needed
        // Since we use checkMembership() middleware now, we can rely on it for basic auth
        // But we need to check edit permissions specifically

        // Use the membership found by middleware if available, or fetch
        // (req as any).membership is set by checkMembership

        const userMembership = (req as any).membership;

        // Only reporter or Admin can edit
        const canEdit = incident.reporterId.toString() === req.user.id || userMembership.role === OrgRole.ADMIN || userMembership.role === OrgRole.OWNER;
        if (!canEdit) return res.status(403).json({ message: 'Insufficient permissions' });

        const { type, severity, description, location, status, resolutionNotes } = req.body;

        if (type) incident.type = type;
        if (severity) incident.severity = severity;
        if (description) incident.description = description;
        if (location) incident.location = location;
        if (status) incident.status = status;
        if (resolutionNotes) incident.resolutionNotes = resolutionNotes;

        await incident.save();
        res.json(incident);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   DELETE /api/orgs/:orgId/compliance/incidents/:id
 * @desc    Delete incident report
 * @access  Private
 */
router.delete('/:orgId/compliance/incidents/:id', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const incident = await IncidentReport.findById(req.params.id);
        if (!incident) return res.status(404).json({ message: 'Incident not found' });

        // Check if incident belongs to org in params (security check)
        if (incident.orgId.toString() !== req.params.orgId) {
            return res.status(400).json({ message: 'Incident does not belong to this organization' });
        }

        const membership = await Membership.findOne({ userId: req.user.id, orgId: incident.orgId });
        if (!membership) return res.status(403).json({ message: 'Not authorized' });

        // Only reporter or Admin can delete
        const canDelete = incident.reporterId.toString() === req.user.id || membership.role === OrgRole.ADMIN || membership.role === OrgRole.OWNER;
        if (!canDelete) return res.status(403).json({ message: 'Insufficient permissions' });

        await incident.deleteOne();
        res.json({ message: 'Incident deleted' });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   POST /api/orgs/:orgId/compliance/checklist
 * @desc    Submit daily safety checklist
 * @access  Private
 */
router.post('/:orgId/compliance/checklist', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const { items, notes, date } = req.body;
        const orgId = req.params.orgId;

        // Check if already submitted today by this user? (Optional, skipping for now to allow updates)

        const checklist = await SafetyChecklist.create({
            orgId,
            inspectorId: req.user.id,
            date: date || new Date(),
            items,
            status: 'submitted',
            notes
        });

        res.status(201).json(checklist);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/orgs/:orgId/compliance/checklist/today
 * @desc    Get today's checklist for user
 * @access  Private
 */
router.get('/:orgId/compliance/checklist/today', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const checklist = await SafetyChecklist.findOne({
            orgId: req.params.orgId,
            inspectorId: req.user.id,
            date: { $gte: startOfDay }
        });

        res.json(checklist || null);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
