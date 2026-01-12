# EarthSafe - Mineral Trading Platform

EarthSafe is a mobile application that connects mineral miners with buyers in a secure, transparent marketplace.

## Features

### For Miners:
- **Dashboard**: View key statistics, recent sales, and loan information
- **Sales Management**: Track mineral sales, upload receipts, and manage transactions
- **Loan Management**: View active loans, interest rates, and payment schedules
- **Compliance Management**: Track compliance status with mining regulations
- **Profile Management**: Update personal and mining operation information
- **Find Buyers**: Browse a list of verified buyers, filter by type and price, and initiate contact

### For Buyers:
- **Dashboard**: View market insights, recent purchases, and nearby sellers
- **Marketplace**: Browse available minerals, filter by type and location, and place orders
- **Order Management**: Track pending and completed orders
- **Seller Profiles**: View detailed information about sellers, their certifications, and minerals offered
- **Compliance Management**: Track and manage regulatory licenses and certifications including:
  - Mineral Buyer's License
  - Trading License
  - Kimberley Process Certification (for diamond trading)
  - Customs Documentation (import/export permits)

## Technical Implementation

### Stack:
- **Frontend**: React Native with TypeScript
- **UI Framework**: React Native Paper
- **Navigation**: React Navigation
- **Icon Library**: Material Community Icons

### Key Components:

#### Miner Components:
- `MinerDashboardScreen`: Main dashboard for miners
- `SalesScreen`: Manage and track mineral sales
- `LoansScreen`: View and manage loans
- `ComplianceScreen`: Track regulatory compliance
- `ProfileScreen`: Manage miner profile
- `BuyersListScreen`: Find and contact potential buyers

#### Buyer Components:
- `BuyerDashboardScreen`: Main dashboard for buyers
- `MarketplaceScreen`: Browse available minerals for purchase
- `OrdersScreen`: Manage placed orders
- `SellerDetailScreen`: View detailed seller information
- `BuyerComplianceScreen`: Manage buyer-specific regulatory licenses and certifications
- `ProfileScreen`: Manage buyer profile

## Future Enhancements

- Authentication and user registration
- Real-time notifications for price changes and new listings
- Blockchain integration for transparent transaction records
- In-app chat for buyer-seller communication
- Smart contracts for automating payment and delivery terms
- Production tracking for miners
- Report generation for compliance documentation
- GIS integration for locating mining operations
- Verification process for sellers and buyers
- Multi-language support
- User reviews and reputation system
- Analytics dashboard for market trends
- Export/import documentation management

## Project Structure

```
EarthSafe/
├── backend/                # Node.js/Express backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── .env.example        # Environment variables example
│   ├── package.json        # Dependencies and scripts
│   └── tsconfig.json       # TypeScript configuration
│
└── frontend/               # React Native mobile app
    ├── src/
    │   ├── assets/         # Images, fonts, etc.
    │   ├── components/     # Reusable components
    │   ├── navigation/     # Navigation configuration
    │   ├── screens/        # App screens
    │   ├── services/       # API services
    │   ├── store/          # Redux store
    │   └── utils/          # Utility functions
    ├── App.tsx             # Main app component
    └── package.json        # Dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- React Native development environment

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and configure your environment variables.

4. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Subscription Plans

- **Free Plan**: Basic tracking and price alerts
- **Pro Miner ($10/month)**: Automatic tracking, investment reports, loan assistance
- **Premium Miner ($25/month)**: Faster loan approvals, AI investment insights, insurance integration

## License

This project is licensed under the ISC License. 