import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  DollarSign,
  Wallet,
  RefreshCw,
  Smartphone,
  Search,
  Plus,
  Minus,
  Tag,
  Gift,
  Headphones
} from 'lucide-react';
import RamuBrand from './RamuBrand';
import { RechargeRequest, WithdrawRequest, User, WinGoBet } from '../types';
import { Language } from '../utils/language';

interface AdminPanelProps {
  language: Language;
  recharges: RechargeRequest[];
  onApproveRecharge: (id: string) => void;
  onRejectRecharge: (id: string) => void;
  withdrawals: WithdrawRequest[];
  onApproveWithdrawal: (id: string) => void;
  onRejectWithdrawal: (id: string) => void;
  accounts: User[];
  onUpdateUserBalance: (uidOrMobile: string, amount: number, operation: 'add' | 'sub') => void;
  giftCodes: { code: string; amount: number; redeemedBy: string[] }[];
  onCreateGiftCode: (code: string, amount: number) => void;
  allBets: WinGoBet[];
  onClose: () => void;
  customerServiceUrl: string;
  onUpdateCustomerServiceUrl: (url: string) => void;
}

export default function AdminPanel({
  language,
  recharges,
  onApproveRecharge,
  onRejectRecharge,
  withdrawals,
  onApproveWithdrawal,
  onRejectWithdrawal,
  accounts,
  onUpdateUserBalance,
  giftCodes,
  onCreateGiftCode,
  allBets,
  onClose,
  customerServiceUrl,
  onUpdateCustomerServiceUrl,
}: AdminPanelProps) {
  // Direct Search and Edit state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [searchMsg, setSearchMsg] = useState<string>('');

  // Gift code creation state
  const [newCodeName, setNewCodeName] = useState<string>('');
  const [newCodeAmount, setNewCodeAmount] = useState<string>('');
  const [giftCodeSuccess, setGiftCodeSuccess] = useState<string>('');

  // WinGo Server Override States (बिंगो गेम सर्वर परिणाम नियंत्रण)
  const [overridePeriod, setOverridePeriod] = useState<string>('30s');
  const [overrideValue, setOverrideValue] = useState<string>(() => {
    return localStorage.getItem('ramu_wingo_override_30s') || '';
  });
  const [overrideSuccess, setOverrideSuccess] = useState<string>('');

  // Aviator Server Override States
  const [aviatorOverride, setAviatorOverride] = useState<string>(() => {
    return localStorage.getItem('ramu_aviator_override') || '';
  });

  const handleSetOverride = (value: string) => {
    localStorage.setItem(`ramu_wingo_override_${overridePeriod}`, value);
    setOverrideValue(value);
    setOverrideSuccess(
      language === 'Hindi' 
        ? `सफलतापूर्वक अगला परिणाम '${value}' सेट किया गया (${overridePeriod} पीरियड के लिए)!` 
        : `Next outcome set to '${value}' for ${overridePeriod} period!`
    );
    setTimeout(() => setOverrideSuccess(''), 4000);
  };

  const handleClearOverride = () => {
    localStorage.removeItem(`ramu_wingo_override_${overridePeriod}`);
    setOverrideValue('');
    setOverrideSuccess(
      language === 'Hindi' 
        ? `${overridePeriod} पीरियड के लिए सक्रिय ओवरराइड हटा दिया गया है।` 
        : `Override removed for ${overridePeriod} period.`
    );
    setTimeout(() => setOverrideSuccess(''), 4000);
  };

  const handlePeriodChange = (period: string) => {
    setOverridePeriod(period);
    setOverrideValue(localStorage.getItem(`ramu_wingo_override_${period}`) || '');
  };

  const handleSetAviatorOverride = (value: string) => {
    localStorage.setItem('ramu_aviator_override', value);
    setAviatorOverride(value);
    setOverrideSuccess(
      language === 'Hindi' 
        ? `सफलतापूर्वक अगला एविएटर गुणांक '${value}x' सेट किया गया!` 
        : `Next Aviator multiplier set to '${value}x'!`
    );
    setTimeout(() => setOverrideSuccess(''), 4000);
  };

  const handleClearAviatorOverride = () => {
    localStorage.removeItem('ramu_aviator_override');
    setAviatorOverride('');
    setOverrideSuccess(
      language === 'Hindi' 
        ? `एविएटर सक्रिय ओवरराइड हटा दिया गया है।` 
        : `Aviator override removed.`
    );
    setTimeout(() => setOverrideSuccess(''), 4000);
  };

  // Search User logic
  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchMsg('');
    setSearchResult(null);

    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) return;

    const matched = accounts.find((acc) => acc.uid === cleanQuery || acc.mobile === cleanQuery);
    if (matched) {
      setSearchResult(matched);
    } else {
      setSearchMsg(language === 'Hindi' ? 'कोई यूज़र नहीं मिला!' : 'No user found with this UID or phone!');
    }
  };

  // Adjust balance
  const handleBalanceAdjust = (operation: 'add' | 'sub') => {
    if (!searchResult || !adjustAmount) return;
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount <= 0) return;

    onUpdateUserBalance(searchResult.mobile, amount, operation);

    // Refresh display
    const updatedUser = accounts.find((acc) => acc.mobile === searchResult.mobile);
    if (updatedUser) {
      setSearchResult({
        ...updatedUser,
        balance: operation === 'add' ? updatedUser.balance + amount : Math.max(0, updatedUser.balance - amount)
      });
    }

    setAdjustAmount('');
    setSearchMsg(language === 'Hindi' ? `सफलतापूर्वक राशि संशोधित की गई!` : `Balance updated successfully!`);
    setTimeout(() => setSearchMsg(''), 4000);
  };

  // Create Gift Code logic
  const handleCreateGiftCode = (e: React.FormEvent) => {
    e.preventDefault();
    setGiftCodeSuccess('');
    const code = newCodeName.toUpperCase().trim();
    const amount = parseFloat(newCodeAmount);

    if (!code || isNaN(amount) || amount <= 0) return;

    onCreateGiftCode(code, amount);
    setGiftCodeSuccess(language === 'Hindi' ? `सफलतापूर्वक गिफ्ट कोड '${code}' बनाया गया!` : `Gift code '${code}' created!`);
    setNewCodeName('');
    setNewCodeAmount('');
    setTimeout(() => setGiftCodeSuccess(''), 4000);
  };

  // Platform margins and analytics calculation
  const totalApprovedDeposits = recharges
    .filter((r) => r.status === 'Approved')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalApprovedWithdrawals = withdrawals
    .filter((w) => w.status === 'Approved')
    .reduce((sum, w) => sum + w.amount, 0);

  // Dynamic betting records simulation
  const totalBetVolume = allBets.reduce((sum, b) => sum + b.amount, 0) + 4820; // adding base seed value for presentation
  const totalPayout = allBets
    .filter((b) => b.status === 'Won')
    .reduce((sum, b) => sum + (b.winAmount || 0), 0) + 2150;
  
  // 2% commission earned
  const totalCommission = totalBetVolume * 0.02;

  const netMargins = totalBetVolume - totalPayout;

  const pendingDeposits = recharges.filter((r) => r.status === 'Pending');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'Pending');

  return (
    <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-700 px-4 py-4 flex items-center justify-between text-slate-100 font-bold shadow-md">
        <div className="flex items-center gap-2">
          <ShieldAlert size={20} className="text-yellow-300 animate-pulse" />
          <span className="text-xs font-gaming uppercase tracking-wider font-extrabold">
            {language === 'Hindi' ? 'रामू भाई - ओनर एडमिन' : 'RAMU BHAI - OWNER ADMIN'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="bg-slate-950/40 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-950/60 transition-colors"
        >
          {language === 'Hindi' ? 'बंद करें' : 'Exit'}
        </button>
      </div>

      <div className="p-4 space-y-6">
        <RamuBrand size="sm" showSubtitle={false} className="mt-1" />

        {/* Dynamic Margin Analytics */}
        <div className="space-y-2">
          <h4 className="text-[10px] text-amber-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp size={13} /> {language === 'Hindi' ? 'प्लेटफ़ॉर्म मार्जिन व रिपोर्ट' : 'Platform Margins & Reports'}
          </h4>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
              <span className="text-[9px] text-slate-500 font-bold uppercase block">{language === 'Hindi' ? 'कुल दांव वॉल्यूम' : 'Bet Volume'}</span>
              <span className="text-sm font-extrabold font-gaming text-amber-400">₹{totalBetVolume.toFixed(2)}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
              <span className="text-[9px] text-slate-500 font-bold uppercase block">{language === 'Hindi' ? 'कुल खिलाड़ी जीत' : 'Total Payout'}</span>
              <span className="text-sm font-extrabold font-gaming text-rose-400 font-medium">₹{totalPayout.toFixed(2)}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
              <span className="text-[9px] text-slate-500 font-bold uppercase block">{language === 'Hindi' ? 'कुल 2% कमीशन' : 'House Commission'}</span>
              <span className="text-sm font-extrabold font-gaming text-emerald-400">₹{totalCommission.toFixed(2)}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
              <span className="text-[9px] text-slate-500 font-bold uppercase block">{language === 'Hindi' ? 'नेट लाभ (मार्जिन)' : 'Net House Profit'}</span>
              <span className="text-sm font-extrabold font-gaming text-indigo-400">₹{netMargins.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* UID Search Directory & Quick Balance Control */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
          <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
            <Search size={14} /> {language === 'Hindi' ? 'यूज़र खोजें व बैलेंस एडिट करें' : 'User Directory & Wallet Edit'}
          </h3>

          <form onSubmit={handleUserSearch} className="flex gap-2">
            <input
              type="text"
              placeholder={language === 'Hindi' ? 'UID या मोबाइल दर्ज करें' : 'Enter user UID or Phone'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 rounded-lg text-xs font-bold uppercase transition-all"
            >
              {language === 'Hindi' ? 'खोजें' : 'Search'}
            </button>
          </form>

          {searchMsg && <p className="text-[11px] text-yellow-400 font-semibold text-center">{searchMsg}</p>}

          {searchResult && (
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/60 space-y-3 text-xs animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-extrabold text-slate-200">{searchResult.username}</p>
                  <p className="text-[10px] text-slate-500 font-mono">UID: {searchResult.uid} | Mobile: {searchResult.mobile}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase">{language === 'Hindi' ? 'बैलेंस' : 'Balance'}</p>
                  <p className="font-extrabold font-gaming text-amber-400">₹{searchResult.balance.toFixed(2)}</p>
                </div>
              </div>

              {/* Adjust Balance input */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800/40">
                <div className="relative flex-grow">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    placeholder={language === 'Hindi' ? 'संशोधित करने वाली राशि' : 'Enter amount'}
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-6 pr-2 py-1.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleBalanceAdjust('add')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-0.5"
                  title="Credit Balance"
                >
                  <Plus size={12} /> {language === 'Hindi' ? 'जोड़ें' : 'Credit'}
                </button>
                <button
                  onClick={() => handleBalanceAdjust('sub')}
                  className="bg-rose-600 hover:bg-rose-500 text-slate-950 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-0.5"
                  title="Debit Balance"
                >
                  <Minus size={12} /> {language === 'Hindi' ? 'काटें' : 'Debit'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* WinGo Server Control Deck (बिंगो गेम सर्वर परिणाम नियंत्रण) */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className="text-rose-500 animate-pulse" /> 
              {language === 'Hindi' ? 'बिंगो गेम सर्वर नियंत्रण' : 'Bingo Server Control'}
            </h3>
            <span className="text-[9px] bg-red-950 text-red-400 font-extrabold px-2 py-0.5 rounded-full border border-red-900/40">
              {language === 'Hindi' ? 'लाइव ओनर कंट्रोल' : 'Live Owner Deck'}
            </span>
          </div>

          {/* Period selector tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 rounded-lg">
            {['30s', '1Min', '3Min', '5Min'].map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`py-1 rounded-md text-[10px] font-extrabold uppercase transition-all ${
                  overridePeriod === p
                    ? 'bg-rose-600 text-slate-100 shadow-md shadow-rose-600/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Status Display */}
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-900 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">
              {language === 'Hindi' ? `${overridePeriod} का अगला परिणाम:` : `${overridePeriod} Next Outcome:`}
            </span>
            {overrideValue ? (
              <div className="flex items-center gap-2 font-bold text-rose-500 font-gaming">
                <span>🎯 {overrideValue}</span>
                <button
                  onClick={handleClearOverride}
                  className="text-[9px] uppercase bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-700 font-semibold"
                >
                  {language === 'Hindi' ? 'हटाएं' : 'Clear'}
                </button>
              </div>
            ) : (
              <span className="text-emerald-400 font-extrabold text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                {language === 'Hindi' ? 'प्राकृतिक (NATURAL)' : 'Natural (No Filter)'}
              </span>
            )}
          </div>

          {/* Override Selectors */}
          <div className="space-y-3">
            {/* 1. Sizes */}
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                {language === 'Hindi' ? 'आकार चुनें / Predict Size' : 'Force Size'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {['Big', 'Small'].map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSetOverride(size)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      overrideValue === size
                        ? 'bg-rose-950/40 border-rose-600 text-rose-400 font-extrabold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {size === 'Big' ? 'BIG (बड़ा)' : 'SMALL (छोटा)'}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Colors */}
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                {language === 'Hindi' ? 'रंग चुनें / Predict Color' : 'Force Color'}
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
                {[
                  { name: 'Red', label: 'RED (लाल)', color: 'bg-rose-600' },
                  { name: 'Green', label: 'GREEN (हरा)', color: 'bg-emerald-600' },
                  { name: 'Violet', label: 'VIOLET (बैंगनी)', color: 'bg-violet-600' },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleSetOverride(item.name)}
                    className={`py-1.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                      overrideValue === item.name
                        ? 'border-rose-500 ring-1 ring-rose-500'
                        : 'border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                    <span className="text-[10px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Numbers 0-9 */}
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                {language === 'Hindi' ? 'नंबर चुनें / Predict Number (0-9)' : 'Force Number'}
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                  let badgeColor = 'bg-rose-600';
                  if (num === 0) badgeColor = 'bg-gradient-to-br from-rose-600 to-violet-600';
                  else if (num === 5) badgeColor = 'bg-gradient-to-br from-emerald-600 to-violet-600';
                  else if ([1, 3, 7, 9].includes(num)) badgeColor = 'bg-emerald-600';

                  return (
                    <button
                      key={num}
                      onClick={() => handleSetOverride(String(num))}
                      className={`h-8 rounded-lg flex items-center justify-center font-gaming font-extrabold text-sm transition-all text-white ${badgeColor} ${
                        overrideValue === String(num)
                          ? 'ring-4 ring-rose-400 ring-offset-2 ring-offset-slate-950 scale-105 shadow-lg'
                          : 'opacity-85 hover:opacity-100 hover:scale-103'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {overrideSuccess && (
            <p className="text-[11px] text-emerald-400 font-extrabold text-center bg-emerald-950/30 border border-emerald-900/30 px-2 py-1.5 rounded-lg animate-pulse">
              {overrideSuccess}
            </p>
          )}
        </div>

        {/* Aviator Jet Server Control Deck (एविएटर गेम सर्वर परिणाम नियंत्रण) */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className="text-rose-500 animate-pulse" /> 
              {language === 'Hindi' ? 'एविएटर परिणाम नियंत्रण' : 'Aviator Jet Control'}
            </h3>
            <span className="text-[9px] bg-red-950 text-red-400 font-extrabold px-2 py-0.5 rounded-full border border-red-900/40 animate-pulse">
              ✈️ LIVE PILOT DECK
            </span>
          </div>

          {/* Status Display */}
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-900 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">
              {language === 'Hindi' ? 'अगला क्रैश पॉइंट:' : 'Next Crash Point:'}
            </span>
            {aviatorOverride ? (
              <div className="flex items-center gap-2 font-bold text-rose-500 font-gaming">
                <span>✈️ {aviatorOverride}x</span>
                <button
                  onClick={handleClearAviatorOverride}
                  className="text-[9px] uppercase bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-700 font-semibold"
                >
                  {language === 'Hindi' ? 'हटाएं' : 'Clear'}
                </button>
              </div>
            ) : (
              <span className="text-emerald-400 font-extrabold text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                {language === 'Hindi' ? 'प्राकृतिक (NATURAL)' : 'Natural (Unfiltered)'}
              </span>
            )}
          </div>

          {/* Override Selectors Grid */}
          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                {language === 'Hindi' ? 'क्विक क्रैश पॉइंट्स चुनें / Preset Crash Point' : 'Quick Preset Multiplier'}
              </span>
              <div className="grid grid-cols-4 gap-1.5 font-gaming text-xs">
                {[
                  { label: '1.01x (Scam)', val: '1.01' },
                  { label: '1.20x', val: '1.20' },
                  { label: '1.50x', val: '1.50' },
                  { label: '1.80x', val: '1.80' },
                  { label: '2.00x', val: '2.00' },
                  { label: '3.50x', val: '3.50' },
                  { label: '5.00x', val: '5.00' },
                  { label: '10.0x', val: '10.00' },
                  { label: '20.0x', val: '20.00' },
                  { label: '50.0x', val: '50.00' },
                  { label: '100x', val: '100.00' },
                  { label: '200x', val: '200.00' },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    onClick={() => handleSetAviatorOverride(preset.val)}
                    className={`py-1.5 rounded-lg text-center font-bold border transition-all ${
                      aviatorOverride === preset.val
                        ? 'bg-rose-950/50 border-rose-500 text-rose-400 font-black'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-1 pt-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
                {language === 'Hindi' ? 'मनपसंद गुणांक दर्ज करें / Enter Custom Multiplier' : 'Custom Crash Multiplier'}
              </span>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  placeholder="e.g. 15.45"
                  id="custom-aviator-override-input"
                  className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 flex-grow font-bold"
                />
                <button
                  onClick={() => {
                    const el = document.getElementById('custom-aviator-override-input') as HTMLInputElement;
                    if (el && el.value) {
                      const val = parseFloat(el.value);
                      if (!isNaN(val) && val >= 1.01) {
                        handleSetAviatorOverride(val.toFixed(2));
                        el.value = '';
                      }
                    }
                  }}
                  className="bg-gradient-to-r from-rose-600 to-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase shadow shadow-rose-600/10 active:scale-97 transition-all"
                >
                  {language === 'Hindi' ? 'सेट करें' : 'Set Crash'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Create Custom Gift Codes */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
          <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
            <Gift size={14} /> {language === 'Hindi' ? 'नया गिफ्ट कोड बनाएं' : 'Create Platform Gift Codes'}
          </h3>

          <form onSubmit={handleCreateGiftCode} className="grid grid-cols-2 gap-2 text-xs">
            <input
              type="text"
              placeholder="CODE (e.g. VIP500)"
              value={newCodeName}
              onChange={(e) => setNewCodeName(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono uppercase font-bold"
              required
            />
            <input
              type="number"
              placeholder="Amount ₹"
              value={newCodeAmount}
              onChange={(e) => setNewCodeAmount(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-bold"
              required
            />
            <button
              type="submit"
              className="col-span-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 py-2 rounded-lg font-bold text-xs uppercase"
            >
              {language === 'Hindi' ? 'गिफ्ट कोड जनरेट करें' : 'Create & Publish Code'}
            </button>
          </form>

          {giftCodeSuccess && <p className="text-[11px] text-emerald-400 font-semibold text-center">{giftCodeSuccess}</p>}

          <div className="space-y-1 pt-1">
            <p className="text-[9px] text-slate-500 uppercase font-bold">{language === 'Hindi' ? 'सक्रिय कूपन सूची' : 'Active Platform Codes'}</p>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono max-h-24 overflow-y-auto">
              {giftCodes.map((gc) => (
                <div key={gc.code} className="bg-slate-900 p-1.5 rounded border border-slate-800 flex justify-between">
                  <span className="text-amber-400 font-bold">{gc.code}</span>
                  <span className="text-slate-300 font-bold">₹{gc.amount} ({gc.redeemedBy.length} claimed)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Set Customer Service URL */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
          <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
            <Headphones size={14} /> {language === 'Hindi' ? '24/7 कस्टमर सर्विस लिंक' : '24/7 Customer Service Link'}
          </h3>
          <div className="space-y-2 text-xs">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              {language === 'Hindi' 
                ? 'यहाँ वह टेलीग्राम या व्हाट्सएप लिंक दर्ज करें जिस पर आप चाहते हैं कि ग्राहक क्लिक करने पर पहुँचे।' 
                : 'Enter the Telegram or WhatsApp URL you want customers to go to when they click the support button.'}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://t.me/your_handle"
                value={customerServiceUrl}
                onChange={(e) => onUpdateCustomerServiceUrl(e.target.value)}
                className="flex-grow bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <p className="text-[9px] text-emerald-400 font-semibold bg-emerald-950/10 border border-emerald-900/10 px-2 py-1 rounded">
              {language === 'Hindi' ? '✓ बदलाव अपने आप सेव हो जाते हैं!' : '✓ Changes are saved automatically!'}
            </p>
          </div>
        </div>

        {/* Deposit Requests Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span>{language === 'Hindi' ? 'डिपॉजिट अनुरोध' : 'Deposits Requests'} ({pendingDeposits.length})</span>
            <span className="text-[9px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full font-bold">
              {language === 'Hindi' ? 'लंबित' : 'Pending'}
            </span>
          </h3>

          {pendingDeposits.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center bg-slate-950 rounded-xl border border-slate-900">
              {language === 'Hindi' ? 'कोई लंबित अनुरोध नहीं है।' : 'No pending deposit claims.'}
            </p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {pendingDeposits.map((req) => (
                <div key={req.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2.5">
                  <div className="flex justify-between text-xs items-start">
                    <div>
                      <p className="text-amber-500 font-bold font-gaming text-sm">₹{req.amount}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Smartphone size={10} /> {req.mobile}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(req.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <div className="bg-slate-900/60 p-2 rounded border border-slate-900 text-[11px] space-y-0.5">
                    <p className="text-slate-500">
                      UTR No: <strong className="text-slate-200 font-mono select-all font-bold tracking-wider">{req.utr}</strong>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onApproveRecharge(req.id)}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-[11px] uppercase rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <CheckCircle size={12} /> {language === 'Hindi' ? 'स्वीकृत' : 'Approve'}
                    </button>
                    <button
                      onClick={() => onRejectRecharge(req.id)}
                      className="flex-1 py-1.5 bg-rose-950/40 border border-rose-800/40 text-rose-400 hover:bg-rose-900/20 font-bold text-[11px] uppercase rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle size={12} /> {language === 'Hindi' ? 'अस्वीकार' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Withdrawal Requests Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span>{language === 'Hindi' ? 'विड्रॉल अनुरोध' : 'Withdrawals Requests'} ({pendingWithdrawals.length})</span>
            <span className="text-[9px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full font-bold">
              {language === 'Hindi' ? 'भुगतान करें' : 'Process Payout'}
            </span>
          </h3>

          {pendingWithdrawals.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center bg-slate-950 rounded-xl border border-slate-900">
              {language === 'Hindi' ? 'कोई लंबित विड्रॉल नहीं है।' : 'No pending withdrawals requests.'}
            </p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {pendingWithdrawals.map((req) => (
                <div key={req.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2.5">
                  <div className="flex justify-between text-xs items-start">
                    <div>
                      <p className="text-rose-400 font-bold font-gaming text-sm">₹{req.amount}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Smartphone size={10} /> {req.mobile}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(req.timestamp).toLocaleTimeString()}</span>
                  </div>

                  {req.bankName ? (
                    <div className="bg-slate-900/60 p-2.5 rounded border border-slate-900 text-[11px] space-y-1.5">
                      <p className="text-amber-500 font-bold uppercase text-[9px] tracking-wider">
                        {language === 'Hindi' ? 'बैंक ट्रांसफर विवरण' : 'Bank Transfer Details'}
                      </p>
                      <div className="grid grid-cols-2 gap-1 font-mono text-slate-300">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase block">{language === 'Hindi' ? 'बैंक' : 'Bank'}</span>
                          <span className="font-bold text-slate-200">{req.bankName}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase block">{language === 'Hindi' ? 'आईएफएससी' : 'IFSC'}</span>
                          <span className="font-bold text-slate-200 select-all">{req.ifscCode}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[9px] text-slate-500 uppercase block">{language === 'Hindi' ? 'खाता संख्या' : 'Account Number'}</span>
                          <span className="font-bold text-emerald-400 text-xs select-all break-all">{req.accountNumber}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[9px] text-slate-500 uppercase block">{language === 'Hindi' ? 'खाताधारक' : 'Holder Name'}</span>
                          <span className="font-bold text-slate-200">{req.accountHolderName}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900/60 p-2 rounded border border-slate-900 text-[11px] space-y-1">
                      <p className="text-slate-400 font-semibold text-[10px] uppercase text-amber-500">UPI ID:</p>
                      <p className="text-slate-100 font-mono font-bold select-all break-all">{req.upiId}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => onApproveWithdrawal(req.id)}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-[11px] uppercase rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <CheckCircle size={12} /> {language === 'Hindi' ? 'भुगतान सफल' : 'Confirm Paid'}
                    </button>
                    <button
                      onClick={() => onRejectWithdrawal(req.id)}
                      className="flex-1 py-1.5 bg-rose-950/40 border border-rose-800/40 text-rose-400 hover:bg-rose-900/20 font-bold text-[11px] uppercase rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle size={12} /> {language === 'Hindi' ? 'रिफंड करें' : 'Refund Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
