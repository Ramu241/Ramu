export interface User {
  username: string;
  mobile: string;
  balance: number;
  inviteCode: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
  uid?: string;
  password?: string;
  referredBy?: string;
}

export type WinGoPeriod = '30s' | '1Min' | '3Min' | '5Min';

export interface WinGoBet {
  id: string;
  username: string;
  period: WinGoPeriod;
  issueNumber: string;
  betOn: string; // 'Green' | 'Violet' | 'Red' | 'Big' | 'Small' | number (0-9)
  amount: number;
  winAmount?: number;
  status: 'Pending' | 'Won' | 'Lost';
  timestamp: number;
}

export interface WinGoHistoryItem {
  issueNumber: string;
  number: number;
  size: 'Big' | 'Small';
  color: 'Green' | 'Red' | 'Violet' | 'Green+Violet' | 'Red+Violet';
  timestamp: number;
}

export interface RechargeRequest {
  id: string;
  username: string;
  mobile: string;
  amount: number;
  utr: string; // 12-digit Transaction ID
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp: number;
}

export interface WithdrawRequest {
  id: string;
  username: string;
  mobile: string;
  amount: number;
  upiId: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp: number;
}

export interface AviatorBet {
  id: string;
  amount: number;
  betOnMultiplier: number;
  cashoutMultiplier?: number;
  winAmount?: number;
  status: 'Flying' | 'CashedOut' | 'FlewAway';
  timestamp: number;
}
