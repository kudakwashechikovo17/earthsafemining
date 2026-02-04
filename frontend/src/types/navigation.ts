import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Miner: NavigatorScreenParams<MinerStackParamList>;
  Buyer: NavigatorScreenParams<BuyerStackParamList>;
  Admin: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type MinerStackParamList = {
  Dashboard: undefined;
  Production: undefined;
  Sales: undefined;
  Compliance: undefined;
  Loans: undefined;
  Profile: undefined;
  BuyersList: undefined;
  TimesheetList: undefined;
  ShiftDetails: { shiftId: string };
};

export type BuyerStackParamList = {
  Dashboard: undefined;
  Marketplace: undefined;
  Orders: undefined;
  Profile: undefined;
  Compliance: undefined;
  SellerDetail: { sellerID: string; sellerName: string };
}; 