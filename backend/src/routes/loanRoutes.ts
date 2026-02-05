import express from 'express';
import { authenticate } from '../middleware/auth';
import { Membership, OrgRole } from '../models/Membership';
import { Loan, LoanStatus } from '../models/Loan';
import { CreditScore } from '../models/CreditScore';
import { FinancialInstitution } from '../models/FinancialInstitution';
import { SalesTransaction, SaleStatus } from '../models/SalesTransaction';
import mongoose from 'mongoose';

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
 * @route   GET /api/orgs/:orgId/loans/institutions
 * @desc    Get list of financial institutions
 * @access  Private
 */
router.get('/:orgId/loans/institutions', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        let institutions = await FinancialInstitution.find({ isActive: true });

        // Seed if empty (Demo purposes)
        if (institutions.length === 0) {
            institutions = await FinancialInstitution.insertMany([
                {
                    name: 'EarthSafe Microfinance',
                    description: 'Specialized loans for small-scale miners. Friendly terms for beginner miners.',
                    minCreditScore: 40,
                    maxLoanAmount: 2000,
                    interestRateRange: '8% - 12%',
                    supportedLoanTypes: ['Equipment', 'Working Capital'],
                    requirements: ['Valid ID', '3 months production data'],
                    logoUrl: 'https://cdn-icons-png.flaticon.com/512/2534/2534204.png' // Generic icon
                },
                {
                    name: 'MineGrow Bank',
                    description: 'Institutional partner for larger operations. Requires higher production volume.',
                    minCreditScore: 70,
                    maxLoanAmount: 50000,
                    interestRateRange: '5% - 9%',
                    supportedLoanTypes: ['Heavy Machinery', 'Site Development'],
                    requirements: ['Business License', '6 months production data', 'Collateral'],
                    logoUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png'
                },
                {
                    name: 'Agri-Mining Coop',
                    description: 'Community-backed loans for cooperative members.',
                    minCreditScore: 50,
                    maxLoanAmount: 5000,
                    interestRateRange: '10% fixed',
                    supportedLoanTypes: ['Inputs', 'Processing'],
                    requirements: ['Coop Membership'],
                    logoUrl: 'https://cdn-icons-png.flaticon.com/512/4140/4140047.png'
                }
            ]);
        }

        res.json(institutions);
    } catch (error: any) {
        console.error('Fetch Institutions Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/orgs/:orgId/loans
 * @desc    Apply for a loan
 * @access  Private
 */
router.post('/:orgId/loans', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const { amount, purpose, term, collateral, institution, documents, notes } = req.body;
        const orgId = req.params.orgId;

        // Auto-approval logic for small amounts (Demo purpose)
        let status = LoanStatus.PENDING;
        let interestRate = undefined;
        let monthlyPayment = undefined;
        let approvedAt = undefined;

        if (parseFloat(amount) < 1000) {
            status = LoanStatus.APPROVED;
            interestRate = 10; // 10%
            approvedAt = new Date();
            // Simple interest calc: (Principal * (1 + rate*time)) / months
            // Simplified: Principal / months * 1.1
            monthlyPayment = (parseFloat(amount) / parseInt(term)) * 1.1;
        }

        const loan = await Loan.create({
            orgId,
            applicantId: req.user.id,
            amount,
            purpose,
            termMonths: parseInt(term),
            collateral,
            institution, // Now passed from frontend selection
            documents,
            notes,
            status,
            interestRate,
            monthlyPayment,
            approvedAt
        });

        res.status(201).json(loan);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

/**
 * @route   GET /api/orgs/:orgId/loans
 * @desc    Get loan applications
 * @access  Private
 */
router.get('/:orgId/loans', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const loans = await Loan.find({ orgId: req.params.orgId }).sort({ createdAt: -1 });
        res.json(loans);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   GET /api/orgs/:orgId/financial-health
 * @desc    Get or Calculate Financial Health Score
 * @access  Private
 */
router.get('/:orgId/financial-health', authenticate, checkMembership(), async (req: any, res: any) => {
    try {
        const orgId = req.params.orgId;

        // 1. Check for recent cached score
        const cachedScore = await CreditScore.findOne({ orgId }).sort({ calculatedAt: -1 });
        if (cachedScore && (Date.now() - cachedScore.calculatedAt.getTime() < 24 * 60 * 60 * 1000)) {
            res.json(cachedScore);
            return;
        }

        // 2. Calculate New Score based on Sales
        const salesStats = await SalesTransaction.aggregate([
            {
                $match: {
                    orgId: new mongoose.Types.ObjectId(orgId),
                    status: { $in: [SaleStatus.VERIFIED, SaleStatus.PENDING] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalValue' },
                    count: { $sum: 1 },
                    lastSale: { $max: '$date' }
                }
            }
        ]);

        const stats = salesStats[0] || { totalRevenue: 0, count: 0, lastSale: null };

        // Simple Scoring Logic (Mock-ish but data driven)
        // Base: 50
        // +1 point per $100 revenue (max 30)
        // +2 points per transaction (max 20)

        let score = 50;
        score += Math.min(30, Math.floor(stats.totalRevenue / 100));
        score += Math.min(20, stats.count * 2);

        let grade: 'A' | 'B' | 'C' | 'D' = 'C';
        if (score >= 90) grade = 'A';
        else if (score >= 70) grade = 'B';
        else if (score < 60) grade = 'D';

        const newScore = await CreditScore.create({
            orgId,
            score,
            grade,
            factors: [
                {
                    name: 'Revenue Volume',
                    score: Math.min(100, (stats.totalRevenue / 3000) * 100),
                    weight: 0.5,
                    impact: 'Positive',
                    explanation: `Total verified revenue of $${stats.totalRevenue}`
                },
                {
                    name: 'Transaction Frequency',
                    score: Math.min(100, (stats.count / 10) * 100),
                    weight: 0.3,
                    impact: 'Positive',
                    explanation: `${stats.count} recorded sales transactions`
                }
            ],
            calculatedAt: new Date()
        });

        res.json(newScore);

    } catch (error: any) {
        console.error('Score Calc Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
