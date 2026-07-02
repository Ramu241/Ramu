import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Award, Sparkles, HelpCircle, User, TrendingUp, History, Coins, AlertCircle } from 'lucide-react';
import RamuBrand from './RamuBrand';
import { WinGoPeriod, WinGoBet, WinGoHistoryItem } from '../types';
import { Language, translations } from '../utils/language';

interface WinGoGameProps {
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  userMobile: string;
  onAddBetToHistory: (bet: WinGoBet) => void;
  allBets: WinGoBet[];
  onSetAllBets: React.Dispatch<React.SetStateAction<WinGoBet[]>>;
  language: Language;
  isAllowedToPlay: boolean;
}

export default function WinGoGame({
  userBalance,
  onUpdateBalance,
  userMobile,
  onAddBetToHistory,
  allBets,
  onSetAllBets,
  language,
  isAllowedToPlay
}: WinGoGameProps) {
  const [activeTab, setActiveTab] = useState<WinGoPeriod>('30s');
  
  const lastResolved30s = useRef<string>('');
  const lastResolved1M = useRef<string>('');
  const lastResolved3M = useRef<string>('');
  const lastResolved5M = useRef<string>('');
  const [timeLeft30s, setTimeLeft30s] = useState<number>(30);
  const [timeLeft1M, setTimeLeft1M] = useState<number>(60);
  const [timeLeft3M, setTimeLeft3M] = useState<number>(180);
  const [timeLeft5M, setTimeLeft5M] = useState<number>(300);

  // Issue number calculations
  const [issue30s, setIssue30s] = useState<string>('');
  const [issue1M, setIssue1M] = useState<string>('');
  const [issue3M, setIssue3M] = useState<string>('');
  const [issue5M, setIssue5M] = useState<string>('');

  // Histories for each period
  const [history30s, setHistory30s] = useState<WinGoHistoryItem[]>([]);
  const [history1M, setHistory1M] = useState<WinGoHistoryItem[]>([]);
  const [history3M, setHistory3M] = useState<WinGoHistoryItem[]>([]);
  const [history5M, setHistory5M] = useState<WinGoHistoryItem[]>([]);

  // Betting Dialog state
  const [isBetOpen, setIsBetOpen] = useState<boolean>(false);
  const [betOn, setBetOn] = useState<string>(''); // 'Green', 'Violet', 'Red', 'Big', 'Small', '0'-'9'
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betQty, setBetQty] = useState<number>(1);
  const [betError, setBetError] = useState<string>('');

  // Winning feedback overlay
  const [winningOverlay, setWinningOverlay] = useState<{
    show: boolean;
    amount: number;
    issue: string;
    target: string;
  } | null>(null);

  const t = translations[language];

  // Helper to calculate exact synced period details from server clock
  const getPeriodDetails = (period: WinGoPeriod) => {
    const now = new Date();
    // Convert to IST offset manually if desired, or use Local date for simple 24/7 matching
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const dateStr = `${YYYY}${MM}${DD}`;

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const secondsSinceMidnight = hours * 3600 + minutes * 60 + seconds;

    let duration = 30;
    if (period === '30s') duration = 30;
    else if (period === '1Min') duration = 60;
    else if (period === '3Min') duration = 180;
    else if (period === '5Min') duration = 300;

    const currentSlot = Math.floor(secondsSinceMidnight / duration) + 1;
    const issueNumber = dateStr + String(currentSlot).padStart(4, '0');
    const secondsLeft = duration - (secondsSinceMidnight % duration);

    return { issueNumber, secondsLeft };
  };

  // Load and sync WinGo state from Express server
  const fetchAndSyncHistory = async (period: WinGoPeriod) => {
    try {
      const res = await fetch(`/api/wingo/history?period=${period}`);
      if (!res.ok) throw new Error('API failure');
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        if (period === '30s') {
          setHistory30s(data.history);
          setIssue30s(data.currentIssue);
          setTimeLeft30s(data.secondsLeft);
          if (lastResolved30s.current && lastResolved30s.current !== data.currentIssue) {
            triggerResultDirectly('30s', lastResolved30s.current, data.history);
          }
          lastResolved30s.current = data.currentIssue;
        } else if (period === '1Min') {
          setHistory1M(data.history);
          setIssue1M(data.currentIssue);
          setTimeLeft1M(data.secondsLeft);
          if (lastResolved1M.current && lastResolved1M.current !== data.currentIssue) {
            triggerResultDirectly('1Min', lastResolved1M.current, data.history);
          }
          lastResolved1M.current = data.currentIssue;
        } else if (period === '3Min') {
          setHistory3M(data.history);
          setIssue3M(data.currentIssue);
          setTimeLeft3M(data.secondsLeft);
          if (lastResolved3M.current && lastResolved3M.current !== data.currentIssue) {
            triggerResultDirectly('3Min', lastResolved3M.current, data.history);
          }
          lastResolved3M.current = data.currentIssue;
        } else if (period === '5Min') {
          setHistory5M(data.history);
          setIssue5M(data.currentIssue);
          setTimeLeft5M(data.secondsLeft);
          if (lastResolved5M.current && lastResolved5M.current !== data.currentIssue) {
            triggerResultDirectly('5Min', lastResolved5M.current, data.history);
          }
          lastResolved5M.current = data.currentIssue;
        }
      }
    } catch (e) {
      console.error('Error syncing WinGo history:', e);
    }
  };

  const triggerResultDirectly = (period: WinGoPeriod, currentIssue: string, historyList: WinGoHistoryItem[]) => {
    const resolvedItem = historyList.find(item => item.issueNumber === currentIssue);
    if (!resolvedItem) return;

    const selectedNum = resolvedItem.number;
    const size = resolvedItem.size;
    const color = resolvedItem.color;

    // Check bets and calculate wins
    onSetAllBets((prevBets) => {
      let winSum = 0;
      const updated = prevBets.map((bet) => {
        if (bet.period === period && bet.issueNumber === currentIssue && bet.status === 'Pending') {
          let isWon = false;
          let multiplier = 2;

          if (bet.betOn === 'Big' && size === 'Big') isWon = true;
          if (bet.betOn === 'Small' && size === 'Small') isWon = true;

          if (bet.betOn === 'Green') {
            if (color === 'Green') {
              isWon = true;
              multiplier = 2;
            } else if (color === 'Green+Violet') {
              isWon = true;
              multiplier = 1.5;
            }
          }
          if (bet.betOn === 'Red') {
            if (color === 'Red') {
              isWon = true;
              multiplier = 2;
            } else if (color === 'Red+Violet') {
              isWon = true;
              multiplier = 1.5;
            }
          }
          if (bet.betOn === 'Violet') {
            if (color.includes('Violet')) {
              isWon = true;
              multiplier = 4.5;
            }
          }

          if (!isNaN(Number(bet.betOn)) && Number(bet.betOn) === selectedNum) {
            isWon = true;
            multiplier = 9;
          }

          if (isWon) {
            const netBetAmount = bet.amount * 0.98;
            const winAmount = netBetAmount * multiplier;
            winSum += winAmount;
            return { ...bet, status: 'Won', winAmount };
          } else {
            return { ...bet, status: 'Lost', winAmount: 0 };
          }
        }
        return bet;
      });

      if (winSum > 0) {
        onUpdateBalance(userBalance + winSum);
        setWinningOverlay({
          show: true,
          amount: winSum,
          issue: currentIssue,
          target: `${selectedNum} (${size === 'Big' ? (language === 'Hindi' ? 'बड़ा' : 'Big') : (language === 'Hindi' ? 'छोटा' : 'Small')})`,
        });
        setTimeout(() => {
          setWinningOverlay(null);
        }, 5000);
      }

      return updated;
    });
  };

  // Synchronized countdown and polling effect
  useEffect(() => {
    fetchAndSyncHistory('30s');
    fetchAndSyncHistory('1Min');
    fetchAndSyncHistory('3Min');
    fetchAndSyncHistory('5Min');

    const interval = setInterval(() => {
      setTimeLeft30s((prev) => {
        if (prev <= 1) {
          setTimeout(() => fetchAndSyncHistory('30s'), 500);
          return 30;
        }
        return prev - 1;
      });

      setTimeLeft1M((prev) => {
        if (prev <= 1) {
          setTimeout(() => fetchAndSyncHistory('1Min'), 500);
          return 60;
        }
        return prev - 1;
      });

      setTimeLeft3M((prev) => {
        if (prev <= 1) {
          setTimeout(() => fetchAndSyncHistory('3Min'), 500);
          return 180;
        }
        return prev - 1;
      });

      setTimeLeft5M((prev) => {
        if (prev <= 1) {
          setTimeout(() => fetchAndSyncHistory('5Min'), 500);
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    const syncInterval = setInterval(() => {
      fetchAndSyncHistory('30s');
      fetchAndSyncHistory('1Min');
      fetchAndSyncHistory('3Min');
      fetchAndSyncHistory('5Min');
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(syncInterval);
    };
  }, [allBets, userBalance]);

  // Get active configurations
  const activeTimeLeft = activeTab === '30s' ? timeLeft30s : activeTab === '1Min' ? timeLeft1M : activeTab === '3Min' ? timeLeft3M : timeLeft5M;
  const activeIssue = activeTab === '30s' ? issue30s : activeTab === '1Min' ? issue1M : activeTab === '3Min' ? issue3M : issue5M;
  const activeHistory = activeTab === '30s' ? history30s : activeTab === '1Min' ? history1M : activeTab === '3Min' ? history3M : history5M;

  const handleOpenBet = (option: string) => {
    setBetOn(option);
    setBetQty(1);
    setBetError('');
    setIsBetOpen(true);
  };

  const executeBet = () => {
    if (!isAllowedToPlay) {
      setBetError(
        language === 'Hindi' 
          ? '⚠️ खेलने के लिए पहले कम से कम ₹100 का रिचार्ज पूरा करना अनिवार्य है!' 
          : '⚠️ You must complete a recharge of at least ₹100 before you can play!'
      );
      return;
    }

    const totalCost = betAmount * betQty;
    if (totalCost > userBalance) {
      setBetError(language === 'Hindi' ? 'अपर्याप्त शेष राशि! रिचार्ज करें।' : 'Insufficient balance! Please deposit.');
      return;
    }
    if (totalCost <= 0) {
      setBetError('Invalid amount');
      return;
    }

    const newBet: WinGoBet = {
      id: 'BET-' + Math.floor(Math.random() * 900000 + 100000),
      username: `Member (${userMobile.slice(-4)})`,
      period: activeTab,
      issueNumber: activeIssue,
      betOn: betOn,
      amount: totalCost, // Keep the full placed amount logged
      status: 'Pending',
      timestamp: Date.now(),
    };

    onUpdateBalance(userBalance - totalCost);
    onAddBetToHistory(newBet);
    setIsBetOpen(false);
  };

  const getTimerString = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getColorLabel = (col: string) => {
    if (language === 'Hindi') {
      if (col === 'Green') return 'हरा (Green)';
      if (col === 'Red') return 'लाल (Red)';
      if (col === 'Violet') return 'बैंगनी (Violet)';
      if (col === 'Big') return 'बड़ा (Big)';
      if (col === 'Small') return 'छोटा (Small)';
      return `नंबर ${col}`;
    } else {
      return col;
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Brand & Stats Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-1">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
        <RamuBrand size="sm" showSubtitle={true} />
        
        <div className="mt-4 flex items-center justify-between bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Coins size={18} className="text-amber-500 animate-spin-slow" />
            <div className="text-left">
              <p className="text-[10px] uppercase text-slate-500 tracking-wider font-bold">{t.balance}</p>
              <h3 className="text-lg font-bold font-gaming text-amber-400">₹{userBalance.toFixed(2)}</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Mobile</p>
            <p className="text-xs text-amber-500 font-mono font-bold">{userMobile ? userMobile : 'Guest User'}</p>
          </div>
        </div>
      </div>

      {/* Period Selection Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
        {(['30s', '1Min', '3Min', '5Min'] as WinGoPeriod[]).map((period) => (
          <button
            key={period}
            onClick={() => setActiveTab(period)}
            className={`py-2 text-center rounded-lg font-gaming font-bold tracking-tight transition-all ${
              activeTab === period
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {period === '30s' ? '30s' : period}
          </button>
        ))}
      </div>

      {/* Game Timer Card */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[9px] uppercase text-slate-500 font-bold tracking-wider">
              <History size={12} className="text-amber-500" /> {language === 'Hindi' ? 'पीरियड नंबर' : 'Period No.'}
            </div>
            <p className="text-base font-bold font-gaming tracking-wider text-slate-100">{activeIssue}</p>
          </div>

          <div className="text-right space-y-1">
            <p className="text-[9px] uppercase text-slate-500 font-bold tracking-wider">{language === 'Hindi' ? 'समय शेष' : 'Time Remaining'}</p>
            <div className="flex gap-1 justify-end font-gaming">
              {getTimerString(activeTimeLeft)
                .split('')
                .map((char, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center justify-center w-6 py-1 rounded bg-slate-900 text-amber-400 border border-slate-800 text-base font-extrabold shadow ${
                      char === ':' ? 'bg-transparent border-none text-slate-400 w-2 animate-pulse' : ''
                    }`}
                  >
                    {char}
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* Lock Game Screen Overlay if under 5s */}
        {activeTimeLeft <= 5 && (
          <div className="mt-4 p-2 bg-red-950/40 border border-red-900/50 rounded-lg text-center text-xs text-red-400 font-semibold animate-pulse">
            ⏱️ {language === 'Hindi' ? 'बेटिंग बंद है - अगले दौर की प्रतीक्षा करें...' : 'Betting Locked - Please wait for next round...'}
          </div>
        )}
      </div>

      {/* Color betting options */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-lg">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            onClick={() => handleOpenBet('Green')}
            disabled={activeTimeLeft <= 5}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold py-3.5 px-1 rounded-xl tracking-wide shadow active:scale-95 transition-transform disabled:opacity-40 disabled:pointer-events-none"
          >
            {language === 'Hindi' ? 'हरा / Green' : 'Green'} (2x)
          </button>
          <button
            onClick={() => handleOpenBet('Violet')}
            disabled={activeTimeLeft <= 5}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-700 hover:from-violet-500 hover:to-fuchsia-600 text-white font-extrabold py-3.5 px-1 rounded-xl tracking-wide shadow active:scale-95 transition-transform disabled:opacity-40 disabled:pointer-events-none"
          >
            {language === 'Hindi' ? 'बैंगनी / Violet' : 'Violet'} (4.5x)
          </button>
          <button
            onClick={() => handleOpenBet('Red')}
            disabled={activeTimeLeft <= 5}
            className="bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold py-3.5 px-1 rounded-xl tracking-wide shadow active:scale-95 transition-transform disabled:opacity-40 disabled:pointer-events-none"
          >
            {language === 'Hindi' ? 'लाल / Red' : 'Red'} (2x)
          </button>
        </div>

        {/* Numeric betting grid */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 text-center">{language === 'Hindi' ? 'नंबर पर दांव लगाएं (9 गुना भुगतान)' : 'Bet on Numbers (9x returns)'}</p>
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              let colorClass = 'border-rose-500/30 hover:bg-rose-500/10 text-rose-400';
              if (num === 0) colorClass = 'border-violet-500/40 hover:bg-violet-500/10 text-violet-400 bg-gradient-to-br from-red-950 to-violet-950';
              else if (num === 5) colorClass = 'border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-400 bg-gradient-to-br from-emerald-950 to-violet-950';
              else if ([1, 3, 7, 9].includes(num)) colorClass = 'border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400';

              return (
                <button
                  key={num}
                  onClick={() => handleOpenBet(String(num))}
                  disabled={activeTimeLeft <= 5}
                  className={`py-2 rounded-lg border text-sm font-extrabold font-gaming active:scale-95 transition-all disabled:opacity-40 ${colorClass}`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Big Small betting */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <button
            onClick={() => handleOpenBet('Big')}
            disabled={activeTimeLeft <= 5}
            className="bg-gradient-to-r from-amber-600 to-amber-750 text-slate-950 font-extrabold py-3.5 rounded-xl tracking-wide shadow active:scale-95 transition-transform disabled:opacity-40 disabled:pointer-events-none"
          >
            {language === 'Hindi' ? 'बड़ा / Big (5-9)' : 'Big (5-9)'} (2x)
          </button>
          <button
            onClick={() => handleOpenBet('Small')}
            disabled={activeTimeLeft <= 5}
            className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-extrabold py-3.5 rounded-xl tracking-wide shadow active:scale-95 transition-transform disabled:opacity-40 disabled:pointer-events-none"
          >
            {language === 'Hindi' ? 'छोटा / Small (0-4)' : 'Small (0-4)'} (2x)
          </button>
        </div>
      </div>

      {/* Period History Record Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
          <TrendingUp size={14} className="text-amber-500" /> {language === 'Hindi' ? 'हालिया परिणाम' : 'Game History'} ({activeTab})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[9px] text-slate-500 uppercase font-semibold">
                <th className="py-2">{language === 'Hindi' ? 'पीरियड' : 'Period'}</th>
                <th className="py-2 text-center">{language === 'Hindi' ? 'नंबर' : 'No'}</th>
                <th className="py-2 text-center">{language === 'Hindi' ? 'साइज' : 'Size'}</th>
                <th className="py-2 text-right">{language === 'Hindi' ? 'रंग' : 'Color'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs font-gaming font-semibold">
              {activeHistory.slice(0, 10).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-2 text-slate-400 font-mono tracking-wider">{item.issueNumber}</td>
                  <td className="py-2 text-center">
                    <span className="inline-block text-sm font-extrabold text-amber-400">{item.number}</span>
                  </td>
                  <td className="py-2 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${item.size === 'Big' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                      {item.size === 'Big' ? (language === 'Hindi' ? 'बड़ा' : 'Big') : (language === 'Hindi' ? 'छोटा' : 'Small')}
                    </span>
                  </td>
                  <td className="py-2 text-right flex items-center justify-end gap-1.5 h-8">
                    {item.color.includes('+') ? (
                      <div className="flex gap-1">
                        <span className={`w-3 h-3 rounded-full inline-block ${item.color.includes('Green') ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        <span className="w-3 h-3 rounded-full inline-block bg-violet-500"></span>
                      </div>
                    ) : (
                      <span className={`w-3 h-3 rounded-full inline-block ${
                        item.color === 'Green' ? 'bg-emerald-500' : item.color === 'Red' ? 'bg-red-500' : 'bg-violet-500'
                      }`}></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Bet list */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
          <Award size={14} className="text-amber-500" /> {language === 'Hindi' ? 'मेरी बेट्स' : 'My Bets History'}
        </h3>

        {allBets.filter(b => b.period === activeTab && b.username === `Member (${userMobile.slice(-4)})`).length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6 bg-slate-950/20 rounded border border-slate-850/30">
            {language === 'Hindi' ? 'इस पीरियड में आपकी कोई बेट नहीं है।' : 'No wagers found in this mode.'}
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {allBets
              .filter((b) => b.period === activeTab && b.username === `Member (${userMobile.slice(-4)})`)
              .slice(0, 15)
              .map((bet) => (
                <div key={bet.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono font-bold ${
                        ['Green', 'Red', 'Violet'].includes(bet.betOn)
                          ? bet.betOn === 'Green' ? 'text-emerald-500' : bet.betOn === 'Red' ? 'text-rose-500' : 'text-violet-500'
                          : 'text-amber-400'
                      }`}>
                        {getColorLabel(bet.betOn)}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">({bet.issueNumber})</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">₹{bet.amount} • {new Date(bet.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <div className="text-right">
                    {bet.status === 'Pending' ? (
                      <span className="text-[9px] px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 font-bold">{t.statusPending}</span>
                    ) : bet.status === 'Won' ? (
                      <div>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">{t.statusApproved}</span>
                        <p className="text-emerald-400 font-bold font-gaming mt-0.5">+₹{bet.winAmount?.toFixed(2)}</p>
                      </div>
                    ) : (
                      <span className="text-[9px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400">{t.statusRejected}</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Betting Sheet modal */}
      {isBetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                  {language === 'Hindi' ? `बेट लगाएं: ${getColorLabel(betOn)}` : `Place Bet: ${betOn}`}
                </h4>
              </div>
              <button onClick={() => setIsBetOpen(false)} className="text-slate-400 hover:text-slate-200 font-extrabold text-lg">✕</button>
            </div>

            {/* Quick amount chips */}
            <div className="space-y-2">
              <p className="text-[11px] text-slate-400 font-semibold">{language === 'Hindi' ? 'दांव मूल्य (₹)' : 'Unit Amount (₹)'}</p>
              <div className="grid grid-cols-4 gap-2">
                {[10, 100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => { setBetAmount(amt); setBetError(''); }}
                    className={`py-2 px-1 text-center rounded-lg border text-sm font-bold font-gaming transition-all ${
                      betAmount === amt
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-yellow-400 font-extrabold'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Multiplier / Quantity */}
            <div className="space-y-2">
              <p className="text-[11px] text-slate-400 font-semibold">{language === 'Hindi' ? 'गुणक (X)' : 'Multiplier (X)'}</p>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center border border-slate-800 bg-slate-950 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setBetQty(Math.max(1, betQty - 1))}
                    className="px-3 py-2 hover:bg-slate-800 text-slate-300 font-bold transition-colors text-xs"
                  >
                    -
                  </button>
                  <span className="px-4 font-gaming font-bold text-sm text-amber-400">{betQty}</span>
                  <button
                    onClick={() => setBetQty(betQty + 1)}
                    className="px-3 py-2 hover:bg-slate-800 text-slate-300 font-bold transition-colors text-xs"
                  >
                    +
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1 w-1/2">
                  {[1, 5, 10, 50].map((x) => (
                    <button
                      key={x}
                      onClick={() => setBetQty(x)}
                      className={`py-1 text-[10px] font-bold rounded border ${
                        betQty === x ? 'bg-amber-500/20 text-amber-400 border-amber-500' : 'bg-slate-950/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      {x}X
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Preview & 2% Commission details */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">{language === 'Hindi' ? 'कुल दांव मूल्य' : 'Total Bet Stake'}</p>
                  <p className="text-lg font-bold font-gaming text-amber-400">₹{betAmount * betQty}</p>
                </div>
                <div className="text-right text-[10px] text-slate-400 leading-tight">
                  <p>{t.netBetLabel}: <strong className="text-emerald-400 font-bold">₹{(betAmount * betQty * 0.98).toFixed(2)}</strong></p>
                  <p className="text-[9px] text-slate-500 mt-0.5">{language === 'Hindi' ? 'शुल्क (2%): ' : 'Fee (2%): '} ₹{(betAmount * betQty * 0.02).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 border-t border-slate-850 pt-2 bg-slate-950 text-[10px] leading-relaxed">
                <AlertCircle size={12} className="text-amber-500 shrink-0" />
                <span>{t.serviceFeeLabel}</span>
              </div>
            </div>

            {betError && (
              <p className="text-xs text-red-500 text-center font-semibold bg-red-950/20 py-2 border border-red-950/40 rounded-lg">{betError}</p>
            )}

            <button
              onClick={executeBet}
              className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 py-3 rounded-xl font-extrabold uppercase tracking-wider shadow-lg active:scale-95 transition-all text-xs"
            >
              {language === 'Hindi' ? `दांव की पुष्टि करें (₹${betAmount * betQty})` : `Confirm Bet (₹${betAmount * betQty})`}
            </button>
          </div>
        </div>
      )}

      {/* Winning Notification Overlay */}
      {winningOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-yellow-500 rounded-3xl p-6 text-center max-w-sm w-full space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-28 h-28 bg-yellow-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl"></div>

            <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400">
              <Award size={45} className="animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-transparent bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text uppercase tracking-wider">
                {language === 'Hindi' ? 'महान विजय!' : 'BIG WIN!'}
              </h3>
              <p className="text-[11px] text-slate-400">{language === 'Hindi' ? 'पीरियड नंबर:' : 'Period No:'} {winningOverlay.issue}</p>
              <p className="text-[11px] text-slate-400">{language === 'Hindi' ? 'परिणाम:' : 'Result:'} <span className="font-bold text-amber-400 font-mono">{winningOverlay.target}</span></p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">{language === 'Hindi' ? 'कुल पुरस्कार क्रेडिट' : 'Net Winnings Credited'}</p>
              <h4 className="text-2xl font-extrabold font-gaming text-emerald-400">+₹{winningOverlay.amount.toFixed(2)}</h4>
            </div>

            <RamuBrand size="sm" showSubtitle={false} />

            <button
              onClick={() => setWinningOverlay(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 py-2.5 rounded-xl font-bold transition-colors text-xs"
            >
              {language === 'Hindi' ? 'ठीक है' : 'Okay'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
