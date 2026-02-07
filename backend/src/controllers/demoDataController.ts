import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User, UserRole } from '../models/User';
import { Organization } from '../models/Organization';
import { Shift, ShiftType, ShiftStatus } from '../models/Shift';
import Production from '../models/Production';
import { SalesTransaction, SaleSource, SaleStatus } from '../models/SalesTransaction';
import { Expense, ExpenseCategory } from '../models/Expense';
import { Payroll } from '../models/Payroll';
import { Compliance, ComplianceStatus, ComplianceType } from '../models/Compliance';
import { ComplianceDocument } from '../models/ComplianceDocument';
import { Loan, LoanStatus, LoanType } from '../models/Loan';
import { Membership } from '../models/Membership';
import { Timesheet } from '../models/Timesheet';
import { MaterialMovement, MaterialType } from '../models/MaterialMovement';
import { Inventory } from '../models/Inventory';
import { IncidentReport, IncidentType, IncidentSeverity, IncidentStatus } from '../models/IncidentReport';
import { SafetyChecklist } from '../models/SafetyChecklist';
import { logger } from '../utils/logger';

// Helper to generate random date within range
const randomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Zimbabwean context helpers
const ZIM_NAMES = [
    'Tinashe', 'Kudakwashe', 'Farai', 'Tendai', 'Nyasha', 'Blessing', 'Tatenda', 'Simbarashe',
    'Chipo', 'Rudo', 'Tafadzwa', 'Munyaradzi', 'Tapiwa', 'Fungai', 'Rutendo'
];
const ZIM_SURNAMES = [
    'Moyo', 'Ncube', 'Dube', 'Sibanda', 'Ndlovu', 'Maphosa', 'Gumbo', 'Chikovo', 'Mutiza', 'Marufu'
];

const getRandomName = () => {
    return `${ZIM_NAMES[Math.floor(Math.random() * ZIM_NAMES.length)]} ${ZIM_SURNAMES[Math.floor(Math.random() * ZIM_SURNAMES.length)]}`;
};

export const seedDemoData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body; // Target user email
        if (!email) {
            res.status(400).json({ message: 'Target email is required' });
            return;
        }

        logger.info(`Starting demo data seed for ${email}`);

        // 1. Find User
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const userId = user._id;

        // UPDATE PROFILE (Safe update)
        try {
            await User.updateOne({ _id: userId }, {
                $set: {
                    firstName: 'Demo',
                    lastName: 'Manager',
                    phoneNumber: '+263 77 123 4567',
                    address: {
                        street: '12 Speke Avenue',
                        city: 'Harare',
                        country: 'Zimbabwe'
                    },
                    bio: 'Mine Manager for Star Mining Co.'
                }
            });
        } catch (e) {
            logger.error('Failed to update user profile', e);
        }

        // 2. Find or Create Organization
        let org = await Organization.findOne({ name: 'Star Mining Co.' });
        if (!org) {
            org = new Organization({
                name: 'Star Mining Co.',
                type: 'mine',
                country: 'Zimbabwe',
                commodity: ['gold'],
                location: {
                    address: '12 Speke Ave, Harare',
                    coordinates: { latitude: -17.8292, longitude: 31.0522 } // Harare-ish
                },
                status: 'active'
            });
            await org.save();

            // Link user to org
            const membership = new Membership({
                userId: user._id,
                orgId: org._id,
                role: 'admin',
                status: 'active'
            });
            await membership.save();
        }

        const orgId = org._id;

        // 3. Clear existing data for this org (RESET for clean demo)
        try {
            await Shift.deleteMany({ orgId });
            await Production.deleteMany({ minerId: userId }); // Assuming single user for demo
            await SalesTransaction.deleteMany({ orgId });
            await Expense.deleteMany({ orgId });
            await Payroll.deleteMany({ orgId });
            await Compliance.deleteMany({ orgId });
            await Loan.deleteMany({ orgId });
            await Timesheet.deleteMany({ orgId });
            await MaterialMovement.deleteMany({ orgId });
            await Inventory.deleteMany({ orgId });
        } catch (err) {
            logger.error('Error clearing old data', err);
        }

        // 4. Generate Data (2 Years Back)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 2);

        // -- Employees (Miners) --
        const employees: any[] = [];
        for (let i = 0; i < 8; i++) {
            employees.push({
                _id: new mongoose.Types.ObjectId(), // Fake ID for reference
                name: getRandomName(),
                role: i < 2 ? 'driller' : (i < 5 ? 'hauler' : 'general')
            });
        }

        // -- SECTION: Shifts & Production & Sales --
        try {
            // Iterate day by day
            let currentDate = new Date(startDate);
            const processingBatches = [];

            while (currentDate <= endDate) {
                // 85% chance of operation per day
                // FORCE: Always run on the last 3 days to ensure dashboard data
                const isRecent = (endDate.getTime() - currentDate.getTime()) < (86400000 * 3);

                if (Math.random() > 0.15 || isRecent) {
                    // Day Shift
                    const startTime = new Date(currentDate);
                    startTime.setHours(6, 0, 0);
                    const endTime = new Date(currentDate);
                    endTime.setHours(18, 0, 0);

                    const shift = new Shift({
                        orgId,
                        date: new Date(currentDate),
                        type: ShiftType.DAY,
                        supervisorId: userId,
                        createdById: userId,
                        status: ShiftStatus.APPROVED,
                        goldRecovered: 0, // Will update
                        oreMined: Math.floor(Math.random() * 50) + 10, // 10-60 tons
                        startTime: startTime,
                        endTime: endTime,
                        notes: 'Routine operations. Equipment running smoothly.',
                        weatherCondition: Math.random() > 0.8 ? 'Cloudy' : 'Sunny'
                    });

                    // Production log
                    const grams = Math.random() * 15 + 5; // 5-20g
                    shift.goldRecovered = parseFloat(grams.toFixed(2));
                    await shift.save();

                    // -- Timesheets for this shift --
                    // 5-8 workers per shift
                    const workersToday = employees.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 5);
                    for (const worker of workersToday) {
                        await new Timesheet({
                            shiftId: shift._id,
                            orgId,
                            workerName: worker.name,
                            role: worker.role,
                            hoursWorked: 12,
                            ratePerShift: 10, // $10 per shift
                            totalPay: 10,
                            notes: 'Full shift'
                        }).save();
                    }

                    // -- Material Movement --
                    // Ore moved
                    await new MaterialMovement({
                        shiftId: shift._id,
                        orgId,
                        type: MaterialType.ORE,
                        quantity: shift.oreMined,
                        unit: 'tons',
                        source: 'Shaft 1',
                        destination: 'Crusher',
                        notes: 'High grade ore'
                    }).save();

                    // Waste moved
                    await new MaterialMovement({
                        shiftId: shift._id,
                        orgId,
                        type: MaterialType.WASTE,
                        quantity: Math.floor(Math.random() * 20) + 5,
                        unit: 'tons',
                        source: 'Shaft 1',
                        destination: 'Dump',
                        notes: 'Overburden removal'
                    }).save();


                    const production = new Production({
                        minerId: userId, // Using admin as main miner for simplicity or loop employees
                        date: new Date(currentDate),
                        mineralType: 'gold',
                        quantity: grams,
                        unit: 'grams',
                        location: { name: 'Shaft A' },
                        verified: true,
                        verifiedBy: userId,
                        verificationDate: new Date(currentDate)
                    });
                    await production.save();

                    // Accumulate for sale (Every ~2 weeks)
                    processingBatches.push(production);

                    // Sales (Every 14 days OR Randomly OR Force for TODAY)
                    if (processingBatches.length > 14 || Math.random() > 0.9 || isRecent) {
                        const totalGrams = processingBatches.reduce((sum, p) => sum + p.quantity, 0);
                        if (totalGrams > 0) {
                            const price = 65 + (Math.random() * 10 - 5); // 60-70 USD/g

                            const sale = new SalesTransaction({
                                orgId,
                                date: new Date(currentDate),
                                source: SaleSource.FIDELITY,
                                referenceId: `REF-${currentDate.getTime()}-${Math.floor(Math.random() * 1000)}`,
                                grams: parseFloat(totalGrams.toFixed(2)),
                                pricePerGram: parseFloat(price.toFixed(2)),
                                totalValue: parseFloat((totalGrams * price).toFixed(2)),
                                currency: 'USD',
                                status: SaleStatus.VERIFIED,
                                buyerName: 'Fidelity Printers',
                                receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000'
                            });
                            await sale.save();
                            processingBatches.length = 0; // Clear
                        }
                    }
                }

                // Move to next day
                currentDate.setDate(currentDate.getDate() + 1);
            }
        } catch (e) {
            logger.error('Error seeding shifts/sales', e);
        }

        // -- SECTION: Expenses --
        try {
            // Monthly fixed expenses + Random ops expenses
            let expenseDate = new Date(startDate);
            while (expenseDate <= endDate) {
                // Monthly Fuel
                await new Expense({
                    orgId,
                    date: new Date(expenseDate),
                    category: ExpenseCategory.FUEL,
                    description: 'Diesel for Generator (200L)',
                    amount: 320,
                    currency: 'USD',
                    enteredBy: userId,
                    supplier: 'Zuva Petroleum',
                    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000'
                }).save();

                // Random Maintenance
                if (Math.random() > 0.7) {
                    await new Expense({
                        orgId,
                        date: randomDate(expenseDate, new Date(expenseDate.getTime() + 86400000 * 30)),
                        category: ExpenseCategory.MAINTENANCE,
                        description: 'Crusher Jaw Replacement',
                        amount: Math.floor(Math.random() * 200) + 50,
                        currency: 'USD',
                        enteredBy: userId,
                        supplier: 'Mine & Industrial Suppliers'
                    }).save();
                }

                expenseDate.setMonth(expenseDate.getMonth() + 1);
            }
        } catch (e) {
            logger.error('Error seeding expenses', e);
        }

        // -- SECTION: Payroll --
        try {
            // Monthly payroll for employees
            let payrollDate = new Date(startDate);
            while (payrollDate <= endDate) {
                for (const emp of employees) {
                    await new Payroll({
                        orgId,
                        employeeName: emp.name,
                        paymentDate: new Date(payrollDate),
                        amount: 350, // Base salary
                        currency: 'USD',
                        paymentMethod: 'cash',
                        payPeriodStart: new Date(payrollDate.getFullYear(), payrollDate.getMonth(), 1),
                        payPeriodEnd: new Date(payrollDate.getFullYear(), payrollDate.getMonth() + 1, 0),
                        netPay: 350,
                        paidBy: userId,
                        status: 'paid',
                        receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000'
                    }).save();
                }
                payrollDate.setMonth(payrollDate.getMonth() + 1);
            }
        } catch (e) {
            logger.error('Error seeding payroll', e);
        }

        // -- SECTION: Compliance --
        try {
            await new Compliance({
                orgId,
                type: ComplianceType.MINING_LICENSE,
                title: 'Mining License 2024',
                documentNumber: 'ML-2024-001',
                status: ComplianceStatus.APPROVED,
                expiryDate: new Date('2025-12-31'),
                issuedDate: new Date('2024-01-01'),
                fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Demo PDF
                notes: 'Verified by Ministry of Mines'
            }).save();

            await new Compliance({
                orgId,
                type: ComplianceType.EMA_CERTIFICATE,
                title: 'EMA EIA Certificate',
                status: ComplianceStatus.APPROVED,
                expiryDate: new Date('2026-06-30'),
                fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
            }).save();
        } catch (e) {
            logger.error('Error seeding compliance', e);
        }

        // -- SECTION: Loans --
        try {
            await new Loan({
                orgId,
                applicantId: userId,
                amount: 15000,
                purpose: 'Excavator Purchase',
                termMonths: 24,
                status: LoanStatus.ACTIVE,
                interestRate: 8,
                monthlyPayment: 750,
                approvedAt: new Date(endDate.getTime() - 86400000 * 120), // 4 months ago
                documents: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
                collateral: 'Equipment (Crusher)',
                institution: 'EarthSafe Finance',
                notes: 'Demo active loan'
            }).save();
        } catch (e) {
            logger.error('Error seeding loans', e);
        }

        // -- SECTION: Inventory --
        try {
            const items = [
                { type: 'equipment', name: 'Jaw Crusher', qty: 1, unit: 'units', val: 12000 },
                { type: 'equipment', name: 'Hammer Mill', qty: 2, unit: 'units', val: 5000 },
                { type: 'equipment', name: 'Diesel Generator', qty: 1, unit: 'units', val: 3500 },
                { type: 'consumable', name: 'Diesel Fuel', qty: 500, unit: 'liters', val: 1.60 },
                { type: 'consumable', name: 'Mercury (Retort)', qty: 5, unit: 'kg', val: 80 },
                { type: 'ore', name: 'Crushed Ore', qty: 45, unit: 'tons', val: 30 },
                { type: 'gold', name: 'Gold Bullion', qty: 120, unit: 'grams', val: 65 }
            ];

            for (const item of items) {
                await new Inventory({
                    orgId,
                    itemType: item.type,
                    name: item.name,
                    quantity: item.qty,
                    unit: item.unit,
                    valuePerUnit: item.val,
                    totalValue: item.qty * item.val,
                    location: 'Site A',
                    lastUpdated: new Date()
                }).save();
            }
        } catch (e) {
            logger.error('Error seeding inventory', e);
        }

        logger.info('Demo data seeding completed successfully');
        res.status(200).json({ message: 'Demo data seeded successfully for Star Mining Co.' });

    } catch (error) {
        logger.error('Error seeding demo data:', error);
        res.status(500).json({ message: 'Error seeding data', error: (error as Error).message });
    }
};

// NEW: Seed only missing data (Expenses, Payroll, Compliance, Loans, Inventory)
// This is much faster and doesn't touch existing Shifts/Sales data
export const seedMissingData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'Target email is required' });
            return;
        }

        logger.info(`Seeding MISSING data for ${email}`);

        // Find user and org
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const userId = user._id;

        // Find org via membership
        const membership = await Membership.findOne({ userId });
        if (!membership) {
            res.status(400).json({ message: 'User has no organization membership' });
            return;
        }
        const orgId = membership.orgId;

        // Generate employees for payroll
        const employees = [
            { name: 'Tinashe Moyo', role: 'driller' },
            { name: 'Kudakwashe Ncube', role: 'driller' },
            { name: 'Farai Dube', role: 'hauler' },
            { name: 'Tendai Sibanda', role: 'hauler' },
            { name: 'Blessing Ndlovu', role: 'hauler' },
            { name: 'Tatenda Gumbo', role: 'general' },
            { name: 'Simbarashe Chikovo', role: 'general' },
            { name: 'Rudo Marufu', role: 'general' }
        ];

        // Date range - last 2 years
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 2);

        // EXPENSES (if none exist)
        const expenseCount = await Expense.countDocuments({ orgId });
        if (expenseCount === 0) {
            logger.info('Adding expenses...');
            let expenseDate = new Date(startDate);
            while (expenseDate <= endDate) {
                await new Expense({
                    orgId,
                    date: new Date(expenseDate),
                    category: ExpenseCategory.FUEL,
                    description: 'Diesel for Generator (200L)',
                    amount: 320,
                    currency: 'USD',
                    enteredBy: userId,
                    supplier: 'Zuva Petroleum'
                }).save();

                if (Math.random() > 0.6) {
                    await new Expense({
                        orgId,
                        date: new Date(expenseDate.getTime() + Math.random() * 86400000 * 15),
                        category: ExpenseCategory.MAINTENANCE,
                        description: 'Equipment Maintenance',
                        amount: Math.floor(Math.random() * 150) + 50,
                        currency: 'USD',
                        enteredBy: userId,
                        supplier: 'Mine & Industrial Suppliers'
                    }).save();
                }

                expenseDate.setMonth(expenseDate.getMonth() + 1);
            }
        }

        // PAYROLL (if none exist)
        const payrollCount = await Payroll.countDocuments({ orgId });
        if (payrollCount === 0) {
            logger.info('Adding payroll...');
            let payrollDate = new Date(startDate);
            while (payrollDate <= endDate) {
                for (const emp of employees) {
                    await new Payroll({
                        orgId,
                        employeeName: emp.name,
                        paymentDate: new Date(payrollDate),
                        amount: emp.role === 'driller' ? 350 : (emp.role === 'hauler' ? 300 : 250),
                        payPeriodStart: new Date(payrollDate.getFullYear(), payrollDate.getMonth(), 1),
                        payPeriodEnd: new Date(payrollDate.getFullYear(), payrollDate.getMonth() + 1, 0),
                        hoursWorked: 180,
                        hourlyRate: 2,
                        deductions: 20,
                        bonuses: Math.random() > 0.8 ? 50 : 0,
                        netPay: emp.role === 'driller' ? 330 : (emp.role === 'hauler' ? 280 : 230),
                        paymentMethod: 'EcoCash',
                        status: 'paid'
                    }).save();
                }
                payrollDate.setMonth(payrollDate.getMonth() + 1);
            }
        }

        // COMPLIANCE (if none exist)
        const complianceCount = await Compliance.countDocuments({ orgId });
        if (complianceCount === 0) {
            logger.info('Adding compliance documents...');
            const docs = [
                { type: ComplianceType.MINING_LICENSE, title: 'Mining License', expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
                { type: ComplianceType.ENVIRONMENTAL_PERMIT, title: 'Environmental Permit', expires: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) },
                { type: ComplianceType.EMA_CERTIFICATE, title: 'Safety Certificate', expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
                { type: ComplianceType.TAX_CLEARANCE, title: 'Tax Clearance', expires: new Date(Date.now() + 270 * 24 * 60 * 60 * 1000) },
            ];
            for (const doc of docs) {
                await new Compliance({
                    orgId,
                    type: doc.type,
                    title: doc.title,
                    status: ComplianceStatus.APPROVED,
                    issuedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                    expiryDate: doc.expires,
                    issuedBy: 'Ministry of Mines',
                    notes: 'Current and valid'
                }).save();
            }
        }

        // LOANS (if none exist)
        const loanCount = await Loan.countDocuments({ orgId });
        if (loanCount === 0) {
            logger.info('Adding loans...');
            await new Loan({
                orgId,
                applicantId: userId,
                amount: 15000,
                purpose: 'Equipment: Purchase of new jaw crusher',
                termMonths: 24,
                status: LoanStatus.ACTIVE,
                institution: 'CBZ Bank',
                interestRate: 12,
                monthlyPayment: 700,
                collateral: 'Mining equipment'
            }).save();

            await new Loan({
                orgId,
                applicantId: userId,
                amount: 5000,
                purpose: 'Working Capital: Operational expenses',
                termMonths: 12,
                status: LoanStatus.PAID,
                institution: 'CABS',
                interestRate: 15,
                monthlyPayment: 450
            }).save();
        }

        // INVENTORY (if none exist)
        const inventoryCount = await Inventory.countDocuments({ orgId });
        if (inventoryCount === 0) {
            logger.info('Adding inventory...');
            const items = [
                { type: 'equipment', name: 'Jaw Crusher', qty: 1, unit: 'units', val: 8000 },
                { type: 'equipment', name: 'Hammer Mill', qty: 2, unit: 'units', val: 5000 },
                { type: 'equipment', name: 'Diesel Generator', qty: 1, unit: 'units', val: 3500 },
                { type: 'consumable', name: 'Diesel Fuel', qty: 500, unit: 'liters', val: 1.60 },
                { type: 'consumable', name: 'Mercury (Retort)', qty: 5, unit: 'kg', val: 80 },
                { type: 'ore', name: 'Crushed Ore', qty: 45, unit: 'tons', val: 30 },
                { type: 'gold', name: 'Gold Bullion', qty: 120, unit: 'grams', val: 65 }
            ];

            for (const item of items) {
                await new Inventory({
                    orgId,
                    itemType: item.type,
                    name: item.name,
                    quantity: item.qty,
                    unit: item.unit,
                    valuePerUnit: item.val,
                    totalValue: item.qty * item.val,
                    location: 'Site A',
                    lastUpdated: new Date()
                }).save();
            }
        }

        logger.info('Missing data seeding completed successfully!');
        res.status(200).json({
            message: 'Missing demo data seeded successfully!',
            addedExpenses: expenseCount === 0,
            addedPayroll: payrollCount === 0,
            addedCompliance: complianceCount === 0,
            addedLoans: loanCount === 0,
            addedInventory: inventoryCount === 0
        });

    } catch (error) {
        logger.error('Error seeding missing data:', error);
        res.status(500).json({ message: 'Error seeding missing data', error: (error as Error).message });
    }
};

// Force-add Loans and Compliance (clears existing first)
export const forceAddLoansCompliance = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'Target email is required' });
            return;
        }

        logger.info(`Force-adding loans/compliance for ${email}`);

        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Reset password to 'password123' for verification
        user.password = 'password123';
        await user.save();

        const userId = user._id;

        const membership = await Membership.findOne({ userId });
        if (!membership) {
            res.status(400).json({ message: 'User has no organization membership' });
            return;
        }
        const orgId = membership.orgId;

        // CLEAR existing loans and compliance
        await Loan.deleteMany({ orgId });
        await Compliance.deleteMany({ orgId });
        logger.info('Cleared existing loans and compliance');

        // ADD LOANS
        // 1. Active (Approved) Equipment Loan
        await new Loan({
            orgId,
            applicantId: userId,
            amount: 15000,
            purpose: 'Equipment: Purchase of new jaw crusher',
            termMonths: 24,
            status: LoanStatus.APPROVED, // Frontend looks for 'approved'
            institution: 'CBZ Bank',
            interestRate: 12,
            monthlyPayment: 700,
            collateral: 'Mining equipment',
            approvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }).save();

        // 2. Active (Approved) Working Capital Loan
        await new Loan({
            orgId,
            applicantId: userId,
            amount: 8000,
            purpose: 'Working Capital: Expansion',
            termMonths: 18,
            status: LoanStatus.APPROVED,
            institution: 'BancABC',
            interestRate: 11,
            monthlyPayment: 485,
            collateral: 'Inventory',
            approvedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        }).save();

        // 3. Paid Loan (History)
        await new Loan({
            orgId,
            applicantId: userId,
            amount: 5000,
            purpose: 'Operational expenses',
            termMonths: 12,
            status: LoanStatus.PAID,
            institution: 'CABS',
            interestRate: 15,
            monthlyPayment: 450
        }).save();

        // 4. Pending Application
        await new Loan({
            orgId,
            applicantId: userId,
            amount: 25000,
            purpose: 'Infrastructure: New Washing Plant',
            termMonths: 36,
            status: LoanStatus.PENDING,
            institution: 'ZB Bank',
            interestRate: 10,
            monthlyPayment: 850
        }).save();

        logger.info('Loans added (4 total)');

        // ADD COMPLIANCE (Using Title Case to match Frontend requirements)
        // Re-defining docs properly
        const seedDocs = [
            { type: ComplianceType.MINING_LICENSE_TITLE, title: 'Mining License 2024', expires: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000), status: ComplianceStatus.APPROVED },
            { type: ComplianceType.ENVIRONMENTAL_IMPACT_ASSESSMENT, title: 'EIA Certificate', expires: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), status: ComplianceStatus.APPROVED },
            { type: ComplianceType.HEALTH_SAFETY, title: 'Safety Certification', expires: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), status: 'expired' }, // Intentionally expired
            { type: ComplianceType.LOCAL_PERMIT, title: 'RDC Operations Permit', expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), status: ComplianceStatus.APPROVED },
        ];

        // Seed LEGACY model (Compliance)
        for (const doc of seedDocs) {
            await new Compliance({
                orgId,
                type: doc.type,
                title: doc.title,
                status: doc.status === 'expired' ? ComplianceStatus.EXPIRED : doc.status,
                issuedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                expiryDate: doc.expires,
                issuedBy: 'Ministry of Mines',
                notes: 'Seeded Document (Compliance Model)'
            }).save();
        }

        // Seed CORRECT model (ComplianceDocument)
        await ComplianceDocument.deleteMany({ orgId });
        for (const doc of seedDocs) {
            let docStatus = doc.status === 'expired' ? 'expired' : 'active';
            // Adjust status enum for ComplianceDocument
            if (doc.status === ComplianceStatus.PENDING) docStatus = 'expiring'; // approximate mapping

            await new ComplianceDocument({
                orgId,
                type: doc.type, // Title Case string
                number: 'DOC-' + Math.floor(Math.random() * 10000),
                issuedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                expiryDate: doc.expires,
                status: docStatus as any, // 'active' | 'expiring' | 'expired'
                issuer: 'Ministry of Mines',
                notes: 'Seeded Document (ComplianceDocument Model)'
            }).save();
        }
        logger.info('Compliance (both models) added');

        // CLEAR & ADD INCIDENTS
        await IncidentReport.deleteMany({ orgId });

        await new IncidentReport({
            orgId,
            reporterId: userId,
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            type: IncidentType.INJURY,
            severity: IncidentSeverity.MEDIUM,
            description: 'Minor hand injury during crusher maintenance. First aid administered.',
            location: 'Crushing Plant B',
            status: IncidentStatus.RESOLVED,
            resolutionNotes: 'Worker treated and returned to light duty. Safety gloves re-issued.'
        }).save();

        await new IncidentReport({
            orgId,
            reporterId: userId,
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            type: IncidentType.EQUIPMENT_FAILURE,
            severity: IncidentSeverity.LOW,
            description: 'Conveyor belt snap caused production halt for 2 hours.',
            location: 'Conveyor 3',
            status: IncidentStatus.CLOSED
        }).save();
        logger.info('Incidents added');

        // CLEAR & ADD CHECKLISTS
        await SafetyChecklist.deleteMany({ orgId });

        await new SafetyChecklist({
            orgId,
            inspectorId: userId,
            date: new Date(),
            status: 'submitted',
            items: [
                { id: '1', label: 'PPE Check', checked: true },
                { id: '2', label: 'Machinery Guards', checked: true },
                { id: '3', label: 'Ventilation', checked: true },
                { id: '4', label: 'First Aid Kit', checked: false, notes: 'Restock needed' }
            ],
            notes: 'Morning shift safety check complete.'
        }).save();
        logger.info('Checklists added');

        res.status(200).json({
            message: 'Loans, Compliance, Incidents & Checklists force-added!',
            loansAdded: 4,
            complianceAdded: seedDocs.length,
            incidentsAdded: 2,
            checklistsAdded: 1
        });

    } catch (error) {
        logger.error('Error force-adding loans/compliance:', error);
        res.status(500).json({ message: 'Error force-adding data', error: (error as Error).message });
    }
};
