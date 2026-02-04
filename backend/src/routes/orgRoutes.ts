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
                res.status(403).json({ message: 'Not a member of this organization' });
                return;
            }

            if (role && membership.role !== role && membership.role !== OrgRole.OWNER) {
                res.status(403).json({ message: 'Insufficient permissions' });
                return;
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
 * @route   GET /api/orgs/buyers
 * @desc    Get all organizations of type 'buyer'
 * @access  Private
 */
router.get('/buyers', authenticate, async (req: any, res) => {
    try {
        const buyers = await Organization.find({ type: 'buyer', status: 'active' })
            .select('name location contactEmail contactPhone country commodity type')
            .sort({ name: 1 });
        res.json(buyers);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error retrieving buyers', error: error.message });
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
            res.status(404).json({ message: 'User not found with this email' });
            return;
        }

        const exists = await Membership.findOne({ userId: user._id, orgId: req.params.orgId });
        if (exists) {
            res.status(400).json({ message: 'User already a member' });
            return;
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

/**
 * @route   GET /api/orgs/:orgId/members
 * @desc    Get all members of an organization
 * @access  Private (Member+)
 */
router.get('/:orgId/members', authenticate, checkMembership(), async (req: any, res) => {
    try {
        const members = await Membership.find({ orgId: req.params.orgId, status: 'active' })
            .populate('userId', 'firstName lastName email profilePicture');

        res.json(members);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error retrieving members', error: error.message });
    }
});

/**
 * @route   DELETE /api/orgs/:orgId/members/:userId
 * @desc    Remove a member
 * @access  Private (Admin/Owner only)
 */
router.delete('/:orgId/members/:userId', authenticate, checkMembership(OrgRole.ADMIN), async (req: any, res) => {
    try {
        const { orgId, userId } = req.params;

        // Prevent removing self (use leave endpoint for that)
        if (userId === req.user.id) {
            res.status(400).json({ message: 'Cannot remove yourself. Use "Leave Organization" instead.' });
            return;
        }

        const membership = await Membership.findOne({ orgId, userId });
        if (!membership) {
            res.status(404).json({ message: 'Member not found' });
            return;
        }

        // Only Owner can remove Admins
        if (membership.role === OrgRole.ADMIN || membership.role === OrgRole.OWNER) {
            const requesterMembership = await Membership.findOne({ orgId, userId: req.user.id });
            if (requesterMembership?.role !== OrgRole.OWNER) {
                res.status(403).json({ message: 'Only Owners can remove Admins' });
                return;
            }
        }

        // Create a separate endpoint for soft-delete/suspension if needed
        // For 'Remove Member', we hard delete the membership record to allow re-joining later
        await Membership.findOneAndDelete({ orgId, userId });

        res.json({ message: 'Member removed successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Server error removing member', error: error.message });
    }
});

/**
 * @route   PATCH /api/orgs/:orgId
 * @desc    Update organization settings
 * @access  Private (Admin/Owner only)
 */
router.patch('/:orgId', authenticate, checkMembership(OrgRole.ADMIN), async (req: any, res) => {
    try {
        const { name, location, contactEmail, contactPhone, miningLicenseNumber } = req.body;

        const org = await Organization.findByIdAndUpdate(
            req.params.orgId,
            {
                $set: {
                    name,
                    location,
                    contactEmail,
                    contactPhone,
                    miningLicenseNumber
                }
            },
            { new: true }
        );

        res.json(org);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error updating organization', error: error.message });
    }
});

export default router;
