import express from 'express';
import { authenticate } from '../middleware/auth';
import { Organization } from '../models/Organization';
import { Membership, OrgRole } from '../models/Membership';
import { User } from '../models/User';

const router = express.Router();

// Middleware to check if user is in the org
// In real app, move to middleware file
const checkMembership = (role?: OrgRole) => {
    return async (req: any, res: any, next: any) => {
        try {
            // req.user from auth middleware has .id (not ._id)
            const membership = await Membership.findOne({
                userId: req.user.id,
                orgId: req.params.orgId
            });

            if (!membership || membership.status !== 'active') {
                return res.status(403).json({ message: 'Not a member of this organization' });
            }

            if (role && membership.role !== role && membership.role !== OrgRole.OWNER) {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }

            (req as any).membership = membership;
            next();
        } catch (error) {
            res.status(500).json({ message: 'Server error checking membership' });
        }
    };
};

/**
 * @route   POST /api/orgs
 * @desc    Create a new organization
 * @access  Private
 */
router.post('/', authenticate, async (req: any, res) => {
    try {
        const { name, type, country, commodity, location } = req.body;

        const org = await Organization.create({
            name,
            type,
            country,
            commodity,
            location,
            status: 'active'
        });

        // Create owner membership
        await Membership.create({
            userId: req.user.id,
            orgId: org._id,
            role: OrgRole.OWNER,
            status: 'active'
        });

        res.status(201).json(org);
    } catch (error: any) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

/**
 * @route   GET /api/orgs/my-orgs
 * @desc    Get organizations current user belongs to
 * @access  Private
 */
router.get('/my-orgs', authenticate, async (req: any, res) => {
    try {
        const memberships = await Membership.find({ userId: req.user.id, status: 'active' })
            .populate('orgId');

        res.json(memberships.map(m => m.orgId));
    } catch (error: any) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

/**
 * @route   GET /api/orgs/:orgId
 * @desc    Get org details
 * @access  Private (Member only)
 */
router.get('/:orgId', authenticate, checkMembership(), async (req, res) => {
    try {
        const org = await Organization.findById(req.params.orgId);
        res.json(org);
    } catch (error: any) {
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @route   POST /api/orgs/:orgId/members
 * @desc    Add member
 * @access  Private (Admin/Owner)
 */
router.post('/:orgId/members', authenticate, checkMembership(OrgRole.ADMIN), async (req, res) => {
    try {
        const { email, role } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        const exists = await Membership.findOne({ userId: user._id, orgId: req.params.orgId });
        if (exists) {
            return res.status(400).json({ message: 'User already a member' });
        }

        const member = await Membership.create({
            userId: user._id,
            orgId: req.params.orgId,
            role: role || OrgRole.MINER,
            status: 'active'
        });

        res.status(201).json(member);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
