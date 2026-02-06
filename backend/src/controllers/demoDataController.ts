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
import { Loan, LoanStatus, LoanType } from '../models/Loan';
import { Membership } from '../models/Membership';
import { Timesheet } from '../models/Timesheet';
import { MaterialMovement, MaterialType } from '../models/MaterialMovement';
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
    // const session = await mongoose.startSession();
    // session.startTransaction();

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
        const userId = user._id;

        // 3. Clear existing data for this org (RESET for clean demo)
        // This ensures re-running the seeder doesn't just pile up duplicates
        await Shift.deleteMany({ orgId });
        await Production.deleteMany({ minerId: userId }); // Assuming single user for demo
        await SalesTransaction.deleteMany({ orgId });
        await Expense.deleteMany({ orgId });
        await Payroll.deleteMany({ orgId });
        await Compliance.deleteMany({ orgId });
        await Loan.deleteMany({ orgId });
        await Timesheet.deleteMany({ orgId });
        await MaterialMovement.deleteMany({ orgId });

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

        // -- Shifts & Production & Sales --
        // Iterate day by day
        let currentDate = new Date(startDate);
        const processingBatches = [];

        while (currentDate <= endDate) {
            // 85% chance of operation per day
            if (Math.random() > 0.15) {
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

                // Sales (Every 14 days or randomly)
                if (processingBatches.length > 14 || Math.random() > 0.9) {
                    const totalGrams = processingBatches.reduce((sum, p) => sum + p.quantity, 0);
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
                        receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000' // Demo receipt image
                    });
                    await sale.save();
                    processingBatches.length = 0; // Clear
                }
            }

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // -- Expenses --
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

        // -- Payroll --
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

        // -- Compliance --
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

        // -- Loans --
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

        // await session.commitTransaction();
        // session.endSession();

        logger.info('Demo data seeding completed successfully');
        res.status(200).json({ message: 'Demo data seeded successfully for Star Mining Co.' });

    } catch (error) {
        // await session.abortTransaction();
        // session.endSession();
        logger.error('Error seeding demo data:', error);
        res.status(500).json({ message: 'Error seeding data', error: (error as Error).message });
    }
};
