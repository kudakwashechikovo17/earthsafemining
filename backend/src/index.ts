import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Import routes
import userRoutes from './routes/userRoutes';
import minerRoutes from './routes/minerRoutes';
import cooperativeRoutes from './routes/cooperativeRoutes';
import financialInstitutionRoutes from './routes/financialInstitutionRoutes';
import governmentRoutes from './routes/governmentRoutes';
import buyerRoutes from './routes/buyerRoutes';
import adminRoutes from './routes/adminRoutes';
import orgRoutes from './routes/orgRoutes';
import shiftRoutes from './routes/shiftRoutes';
import financeRoutes from './routes/financeRoutes';
import creditRoutes from './routes/creditRoutes';
import salesRoutes from './routes/salesRoutes';
import complianceRoutes from './routes/complianceRoutes';
import loanRoutes from './routes/loanRoutes';
import timesheetRoutes from './routes/timesheetRoutes';
import complianceDocumentRoutes from './routes/complianceDocumentRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import expenseRoutes from './routes/expenseRoutes';
import receiptRoutes from './routes/receiptRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import loanRepaymentRoutes from './routes/loanRepaymentRoutes';
import payrollRoutes from './routes/payrollRoutes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
// Mount specific org sub-routes FIRST to ensure they are matched before generic org routes
console.log('Mounting shiftRoutes...');
app.use('/api/orgs', shiftRoutes);

console.log('Mounting financeRoutes...');
app.use('/api/orgs', financeRoutes);

console.log('Mounting creditRoutes...');
app.use('/api/orgs', creditRoutes);

console.log('Mounting salesRoutes...');
app.use('/api/orgs', salesRoutes); // Base route involves orgs

console.log('Mounting complianceRoutes...');
app.use('/api/orgs', complianceRoutes);

console.log('Mounting complianceDocumentRoutes...');
app.use('/api/orgs', complianceDocumentRoutes); // NEW: Compliance documents

console.log('Mounting equipmentRoutes...');
app.use('/api/orgs', equipmentRoutes); // NEW: Equipment tracking

console.log('Mounting expenseRoutes...');
app.use('/api/orgs', expenseRoutes); // NEW: Expense tracking

console.log('Mounting receiptRoutes...');
app.use('/api/orgs', receiptRoutes); // NEW: Receipt management

console.log('Mounting inventoryRoutes...');
app.use('/api/orgs', inventoryRoutes); // NEW: Inventory management

console.log('Mounting loanRepaymentRoutes...');
app.use('/api/orgs', loanRepaymentRoutes); // NEW: Loan repayments

console.log('Mounting payrollRoutes...');
app.use('/api/orgs', payrollRoutes); // NEW: Payroll management

console.log('Mounting timesheetRoutes...');
app.use('/api/orgs', timesheetRoutes); // Timesheet management

console.log('Mounting loanRoutes...');
app.use('/api/orgs', loanRoutes);

console.log('Mounting orgRoutes...');
app.use('/api/orgs', orgRoutes); // Generic org routes last

app.use('/api/users', userRoutes);
console.log('Mounting minerRoutes at /api/miner');
app.use('/api/miner', minerRoutes); // Changed from /api/miners to /api/miner as per instruction
app.use('/api/cooperatives', cooperativeRoutes);
app.use('/api/financial-institutions', financialInstitutionRoutes);
app.use('/api/government', governmentRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/admin', adminRoutes);

import demoRoutes from './routes/demoRoutes';
app.use('/api/demo', demoRoutes);

// Mount shiftRoutes at base /api to support /api/shifts/:id/... endpoints
app.use('/api', shiftRoutes);

// Mount timesheetRoutes
// First generic, but better specific:
app.use('/api', timesheetRoutes); // for /api/timesheets/:id
app.use('/api/orgs', timesheetRoutes); // for /api/orgs/:orgId/timesheets

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'EarthSafe API is running' });
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/earthsafe')
  .then(() => {
    logger.info('Connected to MongoDB');
    // Start the server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`); // Force redeploy log
    });
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
}); 