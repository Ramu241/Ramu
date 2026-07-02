import React, { useState, useEffect, useRef } from 'react';
import { Send, TrendingUp, Compass, Play, Zap, HelpCircle, Coins, Award, AlertCircle, Users, CheckCircle } from 'lucide-react';
import RamuBrand from './RamuBrand';
import { Language, translations } from '../utils/language';

interface AviatorGameProps {
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  userMobile: string;
  language: Language;
  isAllowedToPlay: boolean;
}

interface AviatorHistoryItem {
  id: string;
  amount: number;
  cashoutMultiplier?: number;
  crashPoint: number;
  status: 'Won' | 'Lost';
  timestamp: number;
}

interface LivePlayerBet {
  username: string;
  amount: number;
  cashoutMultiplier?: number;
  status: 'Waiting' | 'Flying' | 'CashedOut' | 'FlewAway';
}

export default function AviatorGame({ 
  userBalance, 
  onUpdateBalance, 
  userMobile, 
  language, 
  isAllowedToPlay 
}: AviatorGameProps) {
  const [gameState, setGameState] = useState<'Prep' | 'Flying' | 'Crashed'>('Prep');
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [betAmount, setBetAmount] = useState<number>(50);
  const [hasBet, setHasBet] = useState<boolean>(false);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [cashoutAmt, setCashoutAmt] = useState<number>(0);
  const [crashPoint, setCrashPoint] = useState<number>(1.5);
  const [countdown, setCountdown] = useState<number>(5); // 5s preparation phase
  const [recentCrashes, setRecentCrashes] = useState<number[]>([1.24, 2.53, 1.05, 4.12, 1.89, 1.11, 10.42, 1.45]);

  // Personal bet history state (filtered to specific user mobile)
  const [myBets, setMyBets] = useState<AviatorHistoryItem[]>(() => {
    const stored = localStorage.getItem(`ramu_aviator_bets_${userMobile}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  // Simulated live running online players' bets
  const [liveBets, setLiveBets] = useState<LivePlayerBet[]>([]);
  const [activeTab, setActiveTab] = useState<'Live' | 'MyHistory'>('Live');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Refs to avoid stale closures in setInterval
  const hasBetRef = useRef<boolean>(false);
  const hasCashedOutRef = useRef<boolean>(false);
  const betAmountRef = useRef<number>(50);
  const currentCrashPointRef = useRef<number>(1.5);
  const myBetsRef = useRef<AviatorHistoryItem[]>([]);

  useEffect(() => {
    hasBetRef.current = hasBet;
  }, [hasBet]);

  useEffect(() => {
    hasCashedOutRef.current = hasCashedOut;
  }, [hasCashedOut]);

  useEffect(() => {
    betAmountRef.current = betAmount;
  }, [betAmount]);

  useEffect(() => {
    currentCrashPointRef.current = crashPoint;
  }, [crashPoint]);

  useEffect(() => {
    myBetsRef.current = myBets;
  }, [myBets]);

  const t = translations[language];

  // Load user's history when userMobile changes
  useEffect(() => {
    const stored = localStorage.getItem(`ramu_aviator_bets_${userMobile}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setMyBets(parsed);
          return;
        }
      } catch (e) {}
    }
    setMyBets([]);
  }, [userMobile]);

  // Setup list of live simulated bets on Prep phase
  useEffect(() => {
    if (gameState === 'Prep') {
      const indianNames = [
        'Anil_9821', 'Raj_7721', 'Vikram_6391', 'Rakesh_9012', 'Amit_8820', 
        'Deepak_9322', 'Pooja_8144', 'Sanjay_7411', 'Sunil_9533', 'Ramesh_8119', 
        'Satish_6211', 'Vijay_8988', 'Kapil_7322', 'Aman_5511', 'Neha_2120'
      ];
      // Pick random 8 to 14 players
      const numPlayers = Math.floor(Math.random() * 6) + 8;
      const shuff = [...indianNames].sort(() => 0.5 - Math.random()).slice(0, numPlayers);
      
      const prepBets: LivePlayerBet[] = shuff.map(name => ({
        username: name,
        amount: [50, 100, 200, 300, 500, 800, 1000, 1500][Math.floor(Math.random() * 8)],
        status: 'Waiting'
      }));

      setLiveBets(prepBets);
    }
  }, [gameState]);

  // Save bet helper
  const recordAndSaveBet = (bet: {
    amount: number;
    cashoutMultiplier?: number;
    crashPoint: number;
    status: 'Won' | 'Lost';
  }) => {
    const newBetItem: AviatorHistoryItem = {
      id: 'AV-' + Math.floor(Math.random() * 900000 + 100000),
      amount: bet.amount,
      cashoutMultiplier: bet.cashoutMultiplier,
      crashPoint: bet.crashPoint,
      status: bet.status,
      timestamp: Date.now()
    };
    const updatedList = [newBetItem, ...myBetsRef.current].slice(0, 30);
    localStorage.setItem(`ramu_aviator_bets_${userMobile}`, JSON.stringify(updatedList));
    setMyBets(updatedList);
  };

  const lastRoundIdRef = useRef<number>(-1);
  const lastStateRef = useRef<'Prep' | 'Flying' | 'Crashed' | null>(null);

  // Poll server for authoritative Aviator game state
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch('/api/aviator/state');
        if (!res.ok) throw new Error('API failure');
        const data = await res.json();

        // 1. Detect new round
        if (lastRoundIdRef.current !== data.roundId) {
          lastRoundIdRef.current = data.roundId;
          setHasCashedOut(false);
          setHasBet(false);
        }

        // 2. Detect transition inside round
        if (lastStateRef.current !== data.state) {
          lastStateRef.current = data.state;

          if (data.state === 'Crashed') {
            // User loses if they have not cashed out
            if (hasBetRef.current && !hasCashedOutRef.current) {
              recordAndSaveBet({
                amount: betAmountRef.current,
                crashPoint: data.crashPoint,
                status: 'Lost'
              });
            }
          }
        }

        setGameState(data.state);
        setCrashPoint(data.crashPoint);
        currentCrashPointRef.current = data.crashPoint;
        setRecentCrashes(data.recentCrashes);

        if (data.state === 'Prep') {
          setCountdown(data.countdown);
          setMultiplier(1.0);
        } else if (data.state === 'Crashed') {
          setCountdown(data.countdown);
          setMultiplier(data.crashPoint);
        } else if (data.state === 'Flying') {
          // Keep synced with the server's current multiplier
          setMultiplier(data.multiplier);
        }
      } catch (err) {
        console.error('Error fetching Aviator state:', err);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 1000);

    return () => clearInterval(interval);
  }, []);

  // Smooth local multiplier interpolation during flight phase
  useEffect(() => {
    if (gameState !== 'Flying') return;

    const tickRate = 100; // 10 ticks per second
    const interval = setInterval(() => {
      setMultiplier((prev) => {
        if (prev >= crashPoint) {
          return crashPoint;
        }
        // Increment smoothly cap at crashPoint
        const next = Number((prev + 0.02 + (prev * 0.005)).toFixed(2));
        return next >= crashPoint ? crashPoint : next;
      });
    }, tickRate);

    return () => clearInterval(interval);
  }, [gameState, crashPoint]);

  const handlePlaceBet = () => {
    if (!isAllowedToPlay) {
      alert(
        language === 'Hindi' 
          ? '⚠️ खेलने के लिए पहले कम से कम ₹100 का रिचार्ज पूरा करना अनिवार्य है! कृपया वॉलेट में जाकर डिपॉजिट करें।' 
          : '⚠️ You must complete a recharge of at least ₹100 before you can play! Please go to Wallet and deposit.'
      );
      return;
    }
    if (gameState !== 'Prep') return;
    if (betAmount < 50) {
      alert(language === 'Hindi' ? 'न्यूनतम दांव राशि ₹50 है।' : 'Minimum bet amount is ₹50.');
      return;
    }
    if (betAmount > userBalance) {
      alert(language === 'Hindi' ? 'अपर्याप्त वॉलेट राशि!' : 'Insufficient wallet balance!');
      return;
    }
    onUpdateBalance(userBalance - betAmount);
    setHasBet(true);
  };

  const handleCashOut = () => {
    if (gameState !== 'Flying' || !hasBet || hasCashedOut) return;
    
    // Apply 2% platform commission on wagers
    const netWager = betAmount * 0.98;
    const win = Number((netWager * multiplier).toFixed(2));
    
    onUpdateBalance(userBalance + win);
    setHasCashedOut(true);
    setCashoutAmt(win);

    // Save successful win to local storage matching unique account
    recordAndSaveBet({
      amount: betAmount,
      cashoutMultiplier: multiplier,
      crashPoint: currentCrashPointRef.current,
      status: 'Won'
    });
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Brand Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 text-center shadow-lg">
        <RamuBrand size="sm" showSubtitle={false} />
        <p className="text-[10px] text-rose-500 font-extrabold tracking-widest font-gaming mt-1 uppercase">✈️ {t.brandName} AVIATOR JET ✈️</p>
      </div>

      {/* Recent Multipliers line */}
      <div className="flex gap-1.5 overflow-x-auto py-1 px-2 bg-slate-950 rounded-xl border border-slate-850 scrollbar-none">
        {recentCrashes.map((crash, idx) => (
          <span
            key={idx}
            className={`text-[10px] font-bold font-gaming px-2 py-0.5 rounded-full ${
              crash >= 2.0
                ? 'bg-fuchsia-950/40 text-fuchsia-400 border border-fuchsia-800/50'
                : 'bg-indigo-950/40 text-indigo-400 border border-indigo-800/50'
            }`}
          >
            {crash.toFixed(2)}x
          </span>
        ))}
      </div>

      {/* Flight Canvas Arena */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl h-64 relative overflow-hidden flex flex-col justify-between p-4 shadow-inner">
        {/* Sky Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.6)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        {/* Phase Overlays */}
        {gameState === 'Prep' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-10 text-center space-y-2">
            <div className="animate-spin text-rose-500 w-8 h-8 border-4 border-slate-800 border-t-rose-500 rounded-full mb-1"></div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">{t.waitingNextRound}</p>
            <h4 className="text-3xl font-extrabold font-gaming text-rose-500 animate-pulse">{countdown}S</h4>
            {hasBet && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-800/40 animate-pulse">
                ✓ {t.placedBet}
              </span>
            )}
          </div>
        )}

        {gameState === 'Crashed' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/80 z-10 text-center space-y-1 animate-fade-in">
            <h3 className="text-xl md:text-2xl font-extrabold text-red-500 tracking-wider uppercase">{t.flewAway}</h3>
            <p className="text-base font-gaming text-slate-400 font-semibold">{language === 'Hindi' ? 'पर समाप्त हुआ:' : 'Ended at:'} {multiplier.toFixed(2)}x</p>
          </div>
        )}

        {/* Dynamic Flying UI */}
        <div className="flex justify-between items-start z-1">
          <span className="text-[9px] text-slate-500 font-gaming uppercase">{t.multiplierTape}</span>
          <div className="flex items-center gap-1.5">
            <Coins size={13} className="text-amber-500 animate-spin-slow" />
            <span className="text-xs font-bold text-amber-500 font-gaming">₹{userBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* Animated Multiplier Number */}
        <div className="flex flex-col items-center justify-center flex-grow z-1">
          {gameState === 'Flying' && (
            <div className="text-center">
              <h2 className="text-5xl md:text-6xl font-extrabold font-gaming tracking-wide text-rose-500">
                {multiplier.toFixed(2)}x
              </h2>
              <p className="text-[9px] text-slate-400 tracking-wider uppercase mt-1">
                {language === 'Hindi' ? 'उड़ान जारी है / Plane Airborne' : 'AIRBORNE'}
              </p>
            </div>
          )}
        </div>

        {/* Vector Plane Drawing */}
        {gameState === 'Flying' && (
          <div
            className="absolute bottom-8 left-8 transition-all duration-75 text-rose-500"
            style={{
              transform: `translate(${Math.min(multiplier * 20, 260)}px, -${Math.min(multiplier * 15, 140)}px)`,
            }}
          >
            <div className="relative">
              {/* Flying Jet SVG */}
              <svg className="w-12 h-12 rotate-12 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
              {/* Plane smoke trail */}
              <div className="absolute top-6 right-8 w-32 h-1 bg-gradient-to-l from-rose-500/80 to-transparent blur-xs origin-right scale-y-110"></div>
            </div>
          </div>
        )}

        {/* Cashout feedback notice inside canvas */}
        {hasCashedOut && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-slate-950 p-3 rounded-2xl text-center space-y-0.5 z-20 shadow-xl border border-emerald-400/50 animate-scale-up">
            <p className="text-[10px] font-bold uppercase tracking-wider">{t.cashedOut}</p>
            <p className="text-lg font-gaming font-extrabold">₹{cashoutAmt}</p>
            <p className="text-[10px] text-slate-900 font-bold">{multiplier.toFixed(2)}x</p>
          </div>
        )}

        <div className="flex justify-between text-[8px] text-slate-600 font-mono tracking-wider border-t border-slate-900 pt-1 z-1">
          <span>ALTITUDE: {gameState === 'Flying' ? Math.floor(multiplier * 150) : 0}M</span>
          <span>SPEED: {gameState === 'Flying' ? Math.floor(multiplier * 340) : 0}KM/H</span>
        </div>
      </div>

      {/* Betting Control Box with Commission Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="w-1/2 space-y-1">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              {language === 'Hindi' ? 'दांव राशि (₹)' : 'Bet Amount (₹)'}
            </p>
            <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl overflow-hidden p-1">
              <button
                disabled={gameState !== 'Prep'}
                onClick={() => setBetAmount((p) => Math.max(50, p - 50))}
                className="w-8 py-1 bg-slate-900 hover:bg-slate-850 rounded text-sm font-bold text-slate-300 disabled:opacity-30"
              >
                -
              </button>
              <input
                type="text"
                disabled={gameState !== 'Prep'}
                value={betAmount}
                onChange={(e) => setBetAmount(parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
                className="w-full text-center bg-transparent text-amber-400 font-gaming font-bold text-sm focus:outline-none disabled:opacity-50"
              />
              <button
                disabled={gameState !== 'Prep'}
                onClick={() => setBetAmount((p) => p + 50)}
                className="w-8 py-1 bg-slate-900 hover:bg-slate-850 rounded text-sm font-bold text-slate-300 disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-1 w-1/2 mt-4">
            {[50, 100, 500, 1000].map((amt) => (
              <button
                key={amt}
                disabled={gameState !== 'Prep'}
                onClick={() => setBetAmount(amt)}
                className="flex-grow py-2 text-[10px] font-bold rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-850 text-slate-300 font-gaming disabled:opacity-30 text-center"
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        {/* 2% Commission layout visualization */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex justify-between items-center text-[10px]">
          <div>
            <p className="text-slate-500">{t.netBetLabel}:</p>
            <p className="font-bold text-emerald-400">₹{(betAmount * 0.98).toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500">{language === 'Hindi' ? '2% सर्विस फीस (कमीशन):' : '2% Host Commission:'}</p>
            <p className="font-bold text-red-500">₹{(betAmount * 0.02).toFixed(2)}</p>
          </div>
        </div>

        {/* Action Button */}
        {gameState === 'Prep' ? (
          <button
            disabled={hasBet}
            onClick={handlePlaceBet}
            className={`w-full py-3.5 rounded-xl font-extrabold uppercase tracking-wider text-xs shadow transition-all ${
              hasBet
                ? 'bg-slate-850 border border-slate-800 text-slate-500 font-semibold shadow-none cursor-default'
                : 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-emerald-500/10 active:scale-95'
            }`}
          >
            {hasBet ? '✓ REGISTERED' : `${language === 'Hindi' ? 'दांव लगाएं' : 'Place Bet'} (₹${betAmount})`}
          </button>
        ) : (
          <button
            disabled={!hasBet || hasCashedOut || gameState !== 'Flying'}
            onClick={handleCashOut}
            className={`w-full py-3.5 rounded-xl font-extrabold uppercase tracking-wider text-xs shadow transition-all ${
              !hasBet || hasCashedOut
                ? 'bg-slate-850 border border-slate-800 text-slate-500 font-semibold shadow-none cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-95'
            }`}
          >
            {hasCashedOut
              ? '✓ CASHED OUT'
              : !hasBet
              ? (language === 'Hindi' ? 'इस राउंड में शामिल नहीं' : 'NOT PARTICIPATING')
              : `${language === 'Hindi' ? 'कैश आउट करें' : 'CASH OUT'} (₹${((betAmount * 0.98) * multiplier).toFixed(2)})`}
          </button>
        )}
      </div>

      {/* TABS FOR LIVE MULTIPLAYER AND MY ACCOUNT HISTORY */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="grid grid-cols-2 gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('Live')}
            className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'Live'
                ? 'bg-rose-950/40 text-rose-400 font-extrabold border border-rose-800/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={14} />
            {language === 'Hindi' ? 'ऑनलाइन खिलाड़ी (Live)' : 'Live Active Wagers'}
          </button>
          <button
            onClick={() => setActiveTab('MyHistory')}
            className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'MyHistory'
                ? 'bg-rose-950/40 text-rose-400 font-extrabold border border-rose-800/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award size={14} />
            {language === 'Hindi' ? 'मेरी हिस्ट्री (My History)' : 'My History'}
          </button>
        </div>

        {activeTab === 'Live' ? (
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider px-1">
              <span>खिलाड़ी (Player)</span>
              <span>दांव (Wager)</span>
              <span>कैशआउट (Outcome)</span>
            </div>
            
            {liveBets.length === 0 ? (
              <p className="text-[11px] text-slate-500 text-center py-4">{language === 'Hindi' ? 'खिलाड़ियों की प्रतीक्षा कर रहे हैं...' : 'Waiting for active wagers...'}</p>
            ) : (
              liveBets.map((player, idx) => (
                <div key={idx} className="bg-slate-950/50 border border-slate-850 rounded-xl p-2 flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-300 font-bold">👤 {player.username}</span>
                  <span className="font-bold text-amber-500">₹{player.amount}</span>
                  <div>
                    {player.status === 'Waiting' ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">READY</span>
                    ) : player.status === 'Flying' ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 animate-pulse font-bold">FLYING</span>
                    ) : player.status === 'CashedOut' ? (
                      <div className="text-right">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-extrabold">CASHED {player.cashoutMultiplier}x</span>
                        <p className="text-[10px] text-emerald-400 font-bold font-gaming mt-0.5">+₹{(player.amount * player.cashoutMultiplier!).toFixed(0)}</p>
                      </div>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-semibold font-gaming">FLEW AWAY</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {myBets.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6 bg-slate-950/20 rounded border border-slate-850/30">
                {language === 'Hindi' ? 'आपकी अभी तक कोई बेट हिस्ट्री नहीं है।' : 'You have no recent aviator wagers.'}
              </p>
            ) : (
              myBets.map((bet) => (
                <div key={bet.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-500 font-mono">{bet.id}</span>
                      <span className="text-[10px] font-gaming text-slate-400">Crash: {bet.crashPoint.toFixed(2)}x</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">₹{bet.amount} • {new Date(bet.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <div className="text-right">
                    {bet.status === 'Won' ? (
                      <div>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-extrabold">CASHED {bet.cashoutMultiplier?.toFixed(2)}x</span>
                        <p className="text-emerald-400 font-bold font-gaming mt-0.5">+₹{((bet.amount * 0.98) * bet.cashoutMultiplier!).toFixed(2)}</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold">FLEW AWAY</span>
                        <p className="text-rose-500 font-bold font-gaming mt-0.5">-₹{bet.amount.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Guide Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
        <p className="font-bold text-amber-500 flex items-center gap-1.5 uppercase tracking-wider">
          <HelpCircle size={14} /> {language === 'Hindi' ? 'गेम नियमावली' : 'Aviator Guidelines'}:
        </p>
        <p>1. {language === 'Hindi' ? 'उड़ान भरने से पहले अपना दांव लगाएं।' : 'Set your wager before flight starts.'}</p>
        <p>2. {language === 'Hindi' ? 'हवाई जहाज उड़ते ही गुणांक (Multiplier) चढ़ना शुरू हो जाएगा।' : 'As the plane climbs, multiplier increases exponentially.'}</p>
        <p>3. {language === 'Hindi' ? 'प्लेन उड़ जाने से पहले कभी भी "Cash Out" करें। यदि आप समय पर कैश आउट नहीं कर पाते हैं तो दांव हार जाएंगे।' : 'Deduct 2% commission fee at start, multiply remaining 98% stake, cashout before crash to win!'}</p>
      </div>
    </div>
  );
}
