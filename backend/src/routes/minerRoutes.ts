import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import SalesTransaction, { SaleStatus } from '../models/SalesTransaction';
import MaterialMovement, { MaterialType } from '../models/MaterialMovement';
import Organization from '../models/Organization';
import { Shift } from '../models/Shift';
import mongoose from 'mongoose';

const router = express.Router();

// Helper to get start of day/week/month
const getStartDate = (type: 'day' | 'week' | 'month') => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  if (type === 'week') {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    date.setDate(diff);
  } else if (type === 'month') {
    date.setDate(1);
  }
  return date;
};

// Dashboard data aggregation
router.get('/dashboard', authenticate, authorize(['miner', 'cooperative', 'admin']), async (req: any, res) => {
  try {
    const orgId = req.user.orgId;
    console.log(`[Dashboard] Fetching data for OrgID: ${orgId}`);

    if (!orgId) {
      console.error('[Dashboard] Error: No OrgID in request user');
      res.status(400).json({ message: 'User is not part of an organization' });
      return;
    }

    // Parallel execution for performance
    // Helper for safe execution
    const safeExec = async (promise: Promise<any>, fallback: any, label: string) => {
      try {
        return await promise;
      } catch (err: any) {
        console.error(`Dashboard Error [${label}]:`, err.message, err.stack);
        return fallback;
      }
    };

    // Parallel execution with error isolation
    const [
      dailySales,
      weeklySales,
      monthlySales,
      productionStats,
      recentTransactions,
      orgDetails,
      recentShifts
    ] = await Promise.all([
      // 1. Daily Earnings
      safeExec(SalesTransaction.aggregate([
        {
          $match: {
            orgId: new mongoose.Types.ObjectId(orgId),
            status: { $in: [SaleStatus.VERIFIED, SaleStatus.PENDING] },
            date: { $gte: getStartDate('day') }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalValue' } } }
      ]), [], 'DailySales'),

      // 2. Weekly Earnings
      safeExec(SalesTransaction.aggregate([
        {
          $match: {
            orgId: new mongoose.Types.ObjectId(orgId),
            status: { $in: [SaleStatus.VERIFIED, SaleStatus.PENDING] },
            date: { $gte: getStartDate('week') }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalValue' } } }
      ]), [], 'WeeklySales'),

      // 3. Monthly Earnings
      safeExec(SalesTransaction.aggregate([
        {
          $match: {
            orgId: new mongoose.Types.ObjectId(orgId),
            status: { $in: [SaleStatus.VERIFIED, SaleStatus.PENDING] },
            date: { $gte: getStartDate('month') }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalValue' } } }
      ]), [], 'MonthlySales'),

      // 4. Production Chart Data (Last 6 Months)
      // 4. Production Chart Data (Last 6 Months)
      // 4. Production Chart Data (Last 6 Months) - Hybrid Approach
      safeExec((async () => {
        // Try Aggregation first
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const aggResult = await Shift.aggregate([
          {
            $match: {
              orgId: new mongoose.Types.ObjectId(orgId),
              status: { $ne: 'rejected' },
              date: { $gte: sixMonthsAgo }
            }
          },
          {
            $group: {
              _id: { month: { $month: "$date" }, year: { $year: "$date" } },
              total: { $sum: "$goldRecovered" }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        if (aggResult.length > 0) return aggResult;

        // Fallback: JS Aggregation if Mongo returns empty (e.g. strict type or date issues)
        console.log('[Dashboard] Production Aggregation returned empty. Trying JS fallback...');
        const rawShifts = await Shift.find({
          orgId: orgId, // Mongoose handles casting
          status: { $ne: 'rejected' },
          date: { $gte: sixMonthsAgo }
        }).select('date goldRecovered');

        console.log(`[Dashboard] Fallback found ${rawShifts.length} shifts.`);

        // Aggregate manually
        const grouped = rawShifts.reduce((acc: any, shift) => {
          const d = new Date(shift.date);
          const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
          if (!acc[key]) {
            acc[key] = {
              _id: { month: d.getMonth() + 1, year: d.getFullYear() },
              total: 0
            };
          }
          acc[key].total += (shift.goldRecovered || 0);
          return acc;
        }, {});

        return Object.values(grouped);
      })(), [], 'ProductionStats'),


      // 5. Recent Transactions
      safeExec(SalesTransaction.find({ orgId })
        .sort({ date: -1 })
        .limit(5)
        .select('buyerName date totalValue grams currency status'), [], 'RecentTransactions'),

      // 6. Org Details for alerts
      safeExec(Organization.findById(orgId).select('miningLicenseNumber status'), {}, 'OrgDetails'),

      // 7. Recent Shifts
      safeExec(Shift.find({ orgId }).sort({ date: -1 }).limit(5).select('type date status'), [], 'RecentShifts')
    ]);

    // Format Alert Data
    const alerts = [];
    if (orgDetails && !orgDetails.miningLicenseNumber && orgDetails.status) { // Check status exists to ensure orgDetails is valid
      alerts.push({
        id: 'license-missing',
        title: 'Missing Mining License',
        description: 'Please update your organization profile with your license number.',
        type: 'warning',
        daysLeft: 0
      });
    }

    // Format Chart Data
    const chartLabels = [];
    const chartData = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Fill in last 6 months (even empty ones)
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthIdx = d.getMonth() + 1; // 1-12
      const year = d.getFullYear();
      const label = monthNames[d.getMonth()];

      const found = (productionStats || []).find((s: any) => s._id.month === monthIdx && s._id.year === year);

      chartLabels.push(label);
      chartData.push(found ? found.total : 0);
    }

    res.json({
      earnings: {
        daily: dailySales?.[0]?.total || 0,
        weekly: weeklySales?.[0]?.total || 0,
        monthly: monthlySales?.[0]?.total || 0
      },
      productionTrend: {
        labels: chartLabels,
        data: chartData
      },
      recentTransactions: (recentTransactions || []).map((t: any) => ({
        id: t._id,
        buyer: t.buyerName,
        date: new Date(t.date).toLocaleDateString(),
        amount: t.totalValue,
        quantity: t.grams,
        unit: 'g',
        status: t.status
      })),
      recentProduction: (recentShifts || []).map((s: any) => ({
        id: s._id,
        type: s.type,
        date: new Date(s.date).toLocaleDateString(),
        status: s.status
      })),
      complianceAlerts: alerts
    });

  } catch (error) {
    console.error('CRITICAL Dashboard Error:', error);
    res.status(500).json({ message: 'Server error retrieving dashboard data' });
  }
});

// Mock/Stub routes for features not yet implemented
// Mock/Stub routes for features not yet implemented
router.post('/production', authenticate, (req, res) => {
  res.status(200).json({ message: 'Logged' });
});
router.get('/production', authenticate, (req, res) => {
  res.status(200).json([]);
});
router.get('/sales', authenticate, (req, res) => {
  res.status(200).json([]);
});

export default router; 