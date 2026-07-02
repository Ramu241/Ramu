import React, { useState } from 'react';
import { Award, Play, RotateCcw, HelpCircle, Coins, ShieldCheck, ArrowLeft, Layers, Sparkles } from 'lucide-react';
import RamuBrand from './RamuBrand';
import { Language, translations } from '../utils/language';

interface CasinoGamesProps {
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  language: Language;
  isAllowedToPlay: boolean;
}

type CasinoGameType = 'Lobby' | 'DragonTiger' | 'AndarBahar' | 'TeenPatti' | 'JhandiMunda';

const CARD_SUITS = ['♠', '♥', '♦', '♣'];
const CARD_VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export default function CasinoGames({ userBalance, onUpdateBalance, language, isAllowedToPlay }: CasinoGamesProps) {
  const [activeSubGame, setActiveSubGame] = useState<CasinoGameType>('Lobby');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [bettingOn, setBettingOn] = useState<string>(''); // For subgame bet selections
  const [isDealing, setIsDealing] = useState<boolean>(false);
  const [gameResultMsg, setGameResultMsg] = useState<string>('');
  const [gameOutcomeStatus, setGameOutcomeStatus] = useState<'Won' | 'Lost' | 'None'>('None');

  // Dragon Tiger state
  const [dragonCard, setDragonCard] = useState<{ value: string; suit: string; power: number } | null>(null);
  const [tigerCard, setTigerCard] = useState<{ value: string; suit: string; power: number } | null>(null);

  // Andar Bahar state
  const [jokerCard, setJokerCard] = useState<{ value: string; suit: string } | null>(null);
  const [andarCards, setAndarCards] = useState<{ value: string; suit: string }[]>([]);
  const [baharCards, setBaharCards] = useState<{ value: string; suit: string }[]>([]);
  const [dealingWinner, setDealingWinner] = useState<'Andar' | 'Bahar' | null>(null);

  // Teen Patti state
  const [playerCards, setPlayerCards] = useState<{ value: string; suit: string; power: number }[]>([]);
  const [dealerCards, setDealerCards] = useState<{ value: string; suit: string; power: number }[]>([]);

  // Jhandi Munda state
  const JHANDI_SYMBOLS = [
    { name: 'Heart', char: '♥', label: 'पान (Heart)', color: 'text-red-500' },
    { name: 'Spade', char: '♠', label: 'हुकुम (Spade)', color: 'text-slate-200' },
    { name: 'Diamond', char: '♦', label: 'ईंट (Diamond)', color: 'text-rose-400' },
    { name: 'Club', char: '♣', label: 'चिड़ी (Club)', color: 'text-emerald-400' },
    { name: 'Flag', char: '🚩', label: 'झंडा (Flag)', color: 'text-amber-500' },
    { name: 'Crown', char: '👑', label: 'मुकुट (Crown)', color: 'text-yellow-400' }
  ];
  const [diceResults, setDiceResults] = useState<string[]>([]);

  const t = translations[language];

  // Draw a random card
  const drawCard = () => {
    const valueIdx = Math.floor(Math.random() * CARD_VALUES.length);
    const suitIdx = Math.floor(Math.random() * CARD_SUITS.length);
    return {
      value: CARD_VALUES[valueIdx],
      suit: CARD_SUITS[suitIdx],
      power: valueIdx + 1 // A is lowest, K is highest
    };
  };

  const deductBet = (amt: number) => {
    if (!isAllowedToPlay) {
      alert(
        language === 'Hindi' 
          ? '⚠️ खेलने के लिए पहले कम से कम ₹100 का रिचार्ज पूरा करना अनिवार्य है! कृपया वॉलेट में जाकर डिपॉजिट करें।' 
          : '⚠️ You must complete a recharge of at least ₹100 before you can play! Please go to Wallet and deposit.'
      );
      return false;
    }
    if (amt > userBalance) {
      alert(language === 'Hindi' ? 'अपर्याप्त शेष राशि! पहले वॉलेट रिचार्ज करें।' : 'Insufficient balance! Place deposit.');
      return false;
    }
    onUpdateBalance(userBalance - amt);
    return true;
  };

  // Play Dragon Tiger
  const playDragonTiger = (selection: 'Dragon' | 'Tiger' | 'Tie') => {
    if (isDealing) return;
    setBettingOn(selection);
    if (!deductBet(betAmount)) return;

    setIsDealing(true);
    setGameResultMsg('');
    setGameOutcomeStatus('None');

    // Simulate dealing cards sequentially
    setTimeout(() => {
      const dCard = drawCard();
      setDragonCard(dCard);

      setTimeout(() => {
        const tCard = drawCard();
        setTigerCard(tCard);

        // Determine winner
        let winner: 'Dragon' | 'Tiger' | 'Tie' = 'Tie';
        if (dCard.power > tCard.power) {
          winner = 'Dragon';
        } else if (tCard.power > dCard.power) {
          winner = 'Tiger';
        }

        let isWinner = winner === selection;
        let mult = winner === 'Tie' ? 9 : 2;

        const netWager = betAmount * 0.98; // 2% platform cut
        const wonAmount = isWinner ? Number((netWager * mult).toFixed(2)) : 0;

        if (isWinner) {
          onUpdateBalance(userBalance - betAmount + wonAmount);
          setGameResultMsg(
            language === 'Hindi'
              ? `बधाई हो! ${winner} जीता। आपको ₹${wonAmount} प्राप्त हुए!`
              : `Congratulations! ${winner} won. You received ₹${wonAmount}!`
          );
          setGameOutcomeStatus('Won');
        } else {
          setGameResultMsg(
            language === 'Hindi'
              ? `ओह! विजेता ${winner} रहा। आपने यह राउंड गंवा दिया।`
              : `Oh! Winner was ${winner}. Better luck next time.`
          );
          setGameOutcomeStatus('Lost');
        }

        setIsDealing(false);
      }, 800);
    }, 600);
  };

  // Play Andar Bahar
  const playAndarBahar = (selection: 'Andar' | 'Bahar') => {
    if (isDealing) return;
    setBettingOn(selection);
    if (!deductBet(betAmount)) return;

    setIsDealing(true);
    setAndarCards([]);
    setBaharCards([]);
    setDealingWinner(null);
    setGameResultMsg('');
    setGameOutcomeStatus('None');

    const jCard = drawCard();
    setJokerCard(jCard);

    let cardsDealt: { value: string; suit: string }[] = [];
    let isAndarTurn = true;
    let localAndar: { value: string; suit: string }[] = [];
    let localBahar: { value: string; suit: string }[] = [];

    const dealNext = () => {
      const nextCard = drawCard();
      if (isAndarTurn) {
        localAndar.push(nextCard);
        setAndarCards([...localAndar]);
      } else {
        localBahar.push(nextCard);
        setBaharCards([...localBahar]);
      }

      // Check match
      if (nextCard.value === jCard.value) {
        const roundWinner = isAndarTurn ? 'Andar' : 'Bahar';
        setDealingWinner(roundWinner);

        const isWinner = roundWinner === selection;
        const netWager = betAmount * 0.98;
        const wonAmount = isWinner ? Number((netWager * 2).toFixed(2)) : 0;

        if (isWinner) {
          onUpdateBalance(userBalance - betAmount + wonAmount);
          setGameResultMsg(
            language === 'Hindi'
              ? `वाह! कार्ड ${roundWinner} में मैच हुआ। आप ₹${wonAmount} जीत गए!`
              : `Awesome! Card matched in ${roundWinner}. You won ₹${wonAmount}!`
          );
          setGameOutcomeStatus('Won');
        } else {
          setGameResultMsg(
            language === 'Hindi'
              ? `ओह! कार्ड ${roundWinner} में मैच हुआ। आप हार गए।`
              : `Oops! Card matched in ${roundWinner}. You lost this round.`
          );
          setGameOutcomeStatus('Lost');
        }

        setIsDealing(false);
      } else {
        isAndarTurn = !isAndarTurn;
        // Cap dealing steps to avoid infinite loops
        if (localAndar.length + localBahar.length < 30) {
          setTimeout(dealNext, 400);
        } else {
          // Tie-break / Stop
          setIsDealing(false);
          setGameResultMsg('Draw / Force Stop');
        }
      }
    };

    setTimeout(dealNext, 800);
  };

  // Evaluate 3 card power for Teen Patti
  const getHandRank = (hand: { value: string; suit: string; power: number }[]) => {
    const powers = hand.map(h => h.power).sort((a, b) => a - b);
    const suits = hand.map(h => h.suit);

    const isTrail = powers[0] === powers[1] && powers[1] === powers[2];
    const isPureSeq = suits[0] === suits[1] && suits[1] === suits[2] && powers[2] - powers[0] === 2;
    const isSeq = powers[2] - powers[0] === 2 && !isPureSeq;
    const isColor = suits[0] === suits[1] && suits[1] === suits[2];
    const isPair = powers[0] === powers[1] || powers[1] === powers[2] || powers[0] === powers[2];

    if (isTrail) return { rank: 6, label: 'Trail / Trio' };
    if (isPureSeq) return { rank: 5, label: 'Pure Sequence' };
    if (isSeq) return { rank: 4, label: 'Sequence' };
    if (isColor) return { rank: 3, label: 'Color / Flush' };
    if (isPair) return { rank: 2, label: 'Pair' };
    return { rank: 1, label: `High Card (${CARD_VALUES[powers[2] - 1]})` };
  };

  // Play Teen Patti
  const playTeenPatti = (selection: 'Player' | 'Dealer') => {
    if (isDealing) return;
    setBettingOn(selection);
    if (!deductBet(betAmount)) return;

    setIsDealing(true);
    setGameResultMsg('');
    setGameOutcomeStatus('None');

    setTimeout(() => {
      const p1 = drawCard();
      const p2 = drawCard();
      const p3 = drawCard();
      const playerHand = [p1, p2, p3];
      setPlayerCards(playerHand);

      setTimeout(() => {
        const d1 = drawCard();
        const d2 = drawCard();
        const d3 = drawCard();
        const dealerHand = [d1, d2, d3];
        setDealerCards(dealerHand);

        const playerRank = getHandRank(playerHand);
        const dealerRank = getHandRank(dealerHand);

        let roundWinner: 'Player' | 'Dealer' = 'Dealer';
        if (playerRank.rank > dealerRank.rank) {
          roundWinner = 'Player';
        } else if (dealerRank.rank > playerRank.rank) {
          roundWinner = 'Dealer';
        } else {
          // Compare high cards if rank matches
          const playerMaxPower = Math.max(...playerHand.map(h => h.power));
          const dealerMaxPower = Math.max(...dealerHand.map(h => h.power));
          if (playerMaxPower >= dealerMaxPower) {
            roundWinner = 'Player';
          }
        }

        const isWinner = roundWinner === selection;
        const netWager = betAmount * 0.98;
        const wonAmount = isWinner ? Number((netWager * 2).toFixed(2)) : 0;

        if (isWinner) {
          onUpdateBalance(userBalance - betAmount + wonAmount);
          setGameResultMsg(
            language === 'Hindi'
              ? `बधाई हो! आपका अनुमान सही था। (${roundWinner} जीता - ${roundWinner === 'Player' ? playerRank.label : dealerRank.label})। आपको ₹${wonAmount} मिले!`
              : `Congratulations! Correct bet. (${roundWinner} won with ${roundWinner === 'Player' ? playerRank.label : dealerRank.label}). You won ₹${wonAmount}!`
          );
          setGameOutcomeStatus('Won');
        } else {
          onUpdateBalance(userBalance);
          setGameResultMsg(
            language === 'Hindi'
              ? `अफसोस! ${roundWinner} का पलड़ा भारी रहा। (${roundWinner === 'Player' ? playerRank.label : dealerRank.label})।`
              : `Alas! ${roundWinner} had the better hand (${roundWinner === 'Player' ? playerRank.label : dealerRank.label}).`
          );
          setGameOutcomeStatus('Lost');
        }

        setIsDealing(false);
      }, 850);
    }, 600);
  };

  // Play Jhandi Munda
  const playJhandiMunda = (symbolName: string) => {
    if (isDealing) return;
    setBettingOn(symbolName);
    if (!deductBet(betAmount)) return;

    setIsDealing(true);
    setGameResultMsg('');
    setGameOutcomeStatus('None');

    setTimeout(() => {
      // Roll 6 dice. Choose a random symbol for each die.
      const rolled: string[] = [];
      for (let i = 0; i < 6; i++) {
        const randSym = JHANDI_SYMBOLS[Math.floor(Math.random() * JHANDI_SYMBOLS.length)].name;
        rolled.push(randSym);
      }
      setDiceResults(rolled);

      // Count matches
      const matchCount = rolled.filter(s => s === symbolName).length;

      if (matchCount > 0) {
        // Payout: matchCount + 1 multiplier
        const mult = matchCount + 1;
        const netWager = betAmount * 0.98;
        const wonAmount = Number((netWager * mult).toFixed(2));

        onUpdateBalance(userBalance - betAmount + wonAmount);
        setGameResultMsg(
          language === 'Hindi'
            ? `बधाई हो! आपके चुने हुए चिह्न के ${matchCount} पासे आए। आपको ₹${wonAmount} प्राप्त हुए!`
            : `Congratulations! ${matchCount} dice matched your symbol. You won ₹${wonAmount}!`
        );
        setGameOutcomeStatus('Won');
      } else {
        setGameResultMsg(
          language === 'Hindi'
            ? `ओह! कोई भी पासा आपके चिह्न से मेल नहीं खाया। प्रयास जारी रखें!`
            : `Oh! None of the dice matched your symbol. Keep trying!`
        );
        setGameOutcomeStatus('Lost');
      }

      setIsDealing(false);
    }, 900);
  };

  const getCardColorClass = (suit: string) => {
    return (suit === '♥' || suit === '♦') ? 'text-red-500' : 'text-slate-100';
  };

  const renderCard = (card: { value: string; suit: string } | null, label: string) => {
    if (!card) {
      return (
        <div className="w-20 h-28 border border-dashed border-slate-700 bg-slate-900/40 rounded-xl flex items-center justify-center text-slate-600 font-bold text-[10px] uppercase">
          {label}
        </div>
      );
    }
    return (
      <div className="w-20 h-28 bg-slate-100 rounded-xl flex flex-col justify-between p-2 shadow-lg text-slate-950 font-gaming relative select-none animate-scale-up">
        <span className={`text-sm font-extrabold flex items-center justify-between ${getCardColorClass(card.suit)}`}>
          {card.value}
          <span className="text-xs">{card.suit}</span>
        </span>
        <span className={`text-4xl self-center font-extrabold ${getCardColorClass(card.suit)}`}>
          {card.suit}
        </span>
        <span className={`text-sm font-extrabold text-right rotate-180 flex items-center justify-between ${getCardColorClass(card.suit)}`}>
          {card.value}
          <span className="text-xs">{card.suit}</span>
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Brand Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          {activeSubGame !== 'Lobby' && (
            <button
              onClick={() => {
                setActiveSubGame('Lobby');
                setGameResultMsg('');
                setGameOutcomeStatus('None');
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-500 rounded-lg transition-all mr-1"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <RamuBrand size="sm" showSubtitle={false} />
            <p className="text-[10px] text-amber-500 font-extrabold tracking-widest font-gaming mt-0.5 uppercase">
              {activeSubGame === 'Lobby' ? '🎭 CASINO GAMES HALL 🎭' : `🎰 ${activeSubGame.toUpperCase()} 🎰`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-850 px-2.5 py-1.5 rounded-full">
          <Coins size={12} className="text-amber-500" />
          <span className="text-xs font-bold text-amber-400 font-gaming">₹{userBalance.toFixed(2)}</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl min-h-[300px]">
        {activeSubGame === 'Lobby' ? (
          /* Lobby list of games */
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Layers size={14} className="text-amber-500" /> {language === 'Hindi' ? 'शाही कैसीनो गेम्स' : 'Royal Casino Hall'}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Dragon Tiger */}
              <button
                onClick={() => {
                  setActiveSubGame('DragonTiger');
                  setDragonCard(null);
                  setTigerCard(null);
                }}
                className="group bg-slate-950 border border-slate-850 hover:border-amber-500/40 p-3 rounded-2xl flex flex-col text-left gap-1.5 transition-all active:scale-95 shadow"
              >
                <span className="text-2xl">🐉🐯</span>
                <h4 className="text-xs font-bold text-slate-100 uppercase group-hover:text-amber-400">
                  {language === 'Hindi' ? 'ड्रैगन टाइगर' : 'Dragon Tiger'}
                </h4>
                <p className="text-[9px] text-slate-500 leading-tight">
                  {language === 'Hindi' ? '2 कार्ड का तेज खेल। ड्रैगन या टाइगर पर दांव लगाएं।' : '2 Card speed battle. Bet on Dragon or Tiger.'}
                </p>
              </button>

              {/* Andar Bahar */}
              <button
                onClick={() => {
                  setActiveSubGame('AndarBahar');
                  setJokerCard(null);
                  setAndarCards([]);
                  setBaharCards([]);
                }}
                className="group bg-slate-950 border border-slate-850 hover:border-emerald-500/40 p-3 rounded-2xl flex flex-col text-left gap-1.5 transition-all active:scale-95 shadow"
              >
                <span className="text-2xl">🃏↔️</span>
                <h4 className="text-xs font-bold text-slate-100 uppercase group-hover:text-emerald-400">
                  {language === 'Hindi' ? 'अंदर बाहर' : 'Andar Bahar'}
                </h4>
                <p className="text-[9px] text-slate-500 leading-tight">
                  {language === 'Hindi' ? 'भारत का प्रसिद्ध कार्ड गेम। चुनें अंदर या बाहर।' : 'Legendary Indian card game. Choose Inside or Outside.'}
                </p>
              </button>

              {/* Teen Patti */}
              <button
                onClick={() => {
                  setActiveSubGame('TeenPatti');
                  setPlayerCards([]);
                  setDealerCards([]);
                }}
                className="group bg-slate-950 border border-slate-850 hover:border-rose-500/40 p-3 rounded-2xl flex flex-col text-left gap-1.5 transition-all active:scale-95 shadow"
              >
                <span className="text-2xl">👑🃏</span>
                <h4 className="text-xs font-bold text-slate-100 uppercase group-hover:text-rose-400">
                  {language === 'Hindi' ? '3 पत्ती' : 'Teen Patti'}
                </h4>
                <p className="text-[9px] text-slate-500 leading-tight">
                  {language === 'Hindi' ? 'पारंपरिक भारतीय 3-पत्ती शौकीनों का पसंदीदा खेल।' : 'Traditional Indian 3-card poker. Beat the Dealer.'}
                </p>
              </button>

              {/* Jhandi Munda */}
              <button
                onClick={() => {
                  setActiveSubGame('JhandiMunda');
                  setDiceResults([]);
                }}
                className="group bg-slate-950 border border-slate-850 hover:border-amber-500/40 p-3 rounded-2xl flex flex-col text-left gap-1.5 transition-all active:scale-95 shadow"
              >
                <span className="text-2xl">🎲🚩</span>
                <h4 className="text-xs font-bold text-slate-100 uppercase group-hover:text-amber-400">
                  {language === 'Hindi' ? 'झंडी मुंडा' : 'Jhandi Munda'}
                </h4>
                <p className="text-[9px] text-slate-500 leading-tight">
                  {language === 'Hindi' ? 'पासा रोल खेल। प्रतीकों और झंडे पर दांव लगाएं।' : 'Indian traditional street dice rolling game.'}
                </p>
              </button>
            </div>
          </div>
        ) : (
          /* Subgame Screens */
          <div className="space-y-4 text-slate-200">
            {/* Bet Controller */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{language === 'Hindi' ? 'दांव राशि (₹)' : 'Bet Amount (₹)'}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {[10, 50, 100, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => !isDealing && setBetAmount(amt)}
                      className={`px-2 py-1 rounded text-[10px] font-extrabold font-gaming ${
                        betAmount === amt
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                      disabled={isDealing}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{language === 'Hindi' ? 'कस्टम' : 'Custom'}</p>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => !isDealing && setBetAmount(Math.max(1, parseInt(e.target.value) || 10))}
                  className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 mt-1 text-right text-xs font-bold text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  disabled={isDealing}
                />
              </div>
            </div>

            {/* Game 1: Dragon Tiger */}
            {activeSubGame === 'DragonTiger' && (
              <div className="space-y-4 animate-fade-in text-center">
                <div className="flex justify-around items-center py-4 bg-slate-950/40 rounded-2xl border border-slate-850">
                  <div className="space-y-2">
                    <p className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest">{language === 'Hindi' ? '🐉 ड्रैगन' : '🐉 Dragon'}</p>
                    {renderCard(dragonCard, 'Dragon')}
                  </div>
                  <div className="text-slate-600 font-bold text-sm">VS</div>
                  <div className="space-y-2">
                    <p className="text-xs font-extrabold text-rose-400 uppercase tracking-widest">{language === 'Hindi' ? '🐯 टाइगर' : '🐯 Tiger'}</p>
                    {renderCard(tigerCard, 'Tiger')}
                  </div>
                </div>

                {/* Betting Triggers */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => playDragonTiger('Dragon')}
                    disabled={isDealing}
                    className="py-3 rounded-xl bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 font-extrabold text-xs uppercase tracking-wider text-white shadow active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {language === 'Hindi' ? 'ड्रैगन (2x)' : 'Dragon (2x)'}
                  </button>
                  <button
                    onClick={() => playDragonTiger('Tie')}
                    disabled={isDealing}
                    className="py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 font-extrabold text-xs uppercase tracking-wider text-slate-950 shadow active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {language === 'Hindi' ? 'टाई (9x)' : 'Tie (9x)'}
                  </button>
                  <button
                    onClick={() => playDragonTiger('Tiger')}
                    disabled={isDealing}
                    className="py-3 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 font-extrabold text-xs uppercase tracking-wider text-white shadow active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {language === 'Hindi' ? 'टाइगर (2x)' : 'Tiger (2x)'}
                  </button>
                </div>
              </div>
            )}

            {/* Game 2: Andar Bahar */}
            {activeSubGame === 'AndarBahar' && (
              <div className="space-y-4 animate-fade-in text-center">
                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">🃏 {language === 'Hindi' ? 'जोकर कार्ड (Joker / House)' : 'Joker Card'}</span>
                  {renderCard(jokerCard, 'Joker')}
                </div>

                {/* Deal layout */}
                <div className="grid grid-cols-2 gap-3 py-2">
                  <div className="space-y-1.5 p-2 bg-slate-950/30 rounded-xl border border-slate-850/60 min-h-[140px]">
                    <p className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-widest">{language === 'Hindi' ? '🏠 अंदर (Andar)' : 'Andar'}</p>
                    <div className="flex flex-wrap gap-1 justify-center mt-1">
                      {andarCards.map((c, i) => (
                        <span key={i} className={`text-xs font-bold px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800 ${getCardColorClass(c.suit)}`}>
                          {c.value}{c.suit}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 p-2 bg-slate-950/30 rounded-xl border border-slate-850/60 min-h-[140px]">
                    <p className="text-[11px] font-extrabold text-rose-400 uppercase tracking-widest">{language === 'Hindi' ? '🚀 बाहर (Bahar)' : 'Bahar'}</p>
                    <div className="flex flex-wrap gap-1 justify-center mt-1">
                      {baharCards.map((c, i) => (
                        <span key={i} className={`text-xs font-bold px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800 ${getCardColorClass(c.suit)}`}>
                          {c.value}{c.suit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Betting triggers */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => playAndarBahar('Andar')}
                    disabled={isDealing}
                    className="py-3 rounded-xl bg-gradient-to-r from-indigo-700 to-indigo-600 font-extrabold text-xs uppercase tracking-wider text-white shadow active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {language === 'Hindi' ? 'अंदर / Andar (2x)' : 'Andar (2x)'}
                  </button>
                  <button
                    onClick={() => playAndarBahar('Bahar')}
                    disabled={isDealing}
                    className="py-3 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 font-extrabold text-xs uppercase tracking-wider text-white shadow active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {language === 'Hindi' ? 'बाहर / Bahar (2x)' : 'Bahar (2x)'}
                  </button>
                </div>
              </div>
            )}

            {/* Game 3: Teen Patti */}
            {activeSubGame === 'TeenPatti' && (
              <div className="space-y-4 animate-fade-in text-center">
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/40 rounded-2xl border border-slate-850">
                  <div className="space-y-2">
                    <p className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider">😎 {language === 'Hindi' ? 'खिलाड़ी (Player)' : 'Player Hand'}</p>
                    <div className="flex gap-1 justify-center">
                      {playerCards.length > 0 ? (
                        playerCards.map((c, idx) => (
                          <span key={idx} className={`text-sm font-bold bg-slate-100 text-slate-950 p-2.5 rounded shadow flex flex-col items-center min-w-[34px] ${getCardColorClass(c.suit)}`}>
                            {c.value}<span>{c.suit}</span>
                          </span>
                        ))
                      ) : (
                        <div className="text-slate-600 text-xs py-4 font-bold border border-dashed border-slate-850 rounded w-full">???</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-extrabold text-rose-400 uppercase tracking-wider">🤖 {language === 'Hindi' ? 'डीलर (Dealer)' : 'Dealer Hand'}</p>
                    <div className="flex gap-1 justify-center">
                      {dealerCards.length > 0 ? (
                        dealerCards.map((c, idx) => (
                          <span key={idx} className={`text-sm font-bold bg-slate-100 text-slate-950 p-2.5 rounded shadow flex flex-col items-center min-w-[34px] ${getCardColorClass(c.suit)}`}>
                            {c.value}<span>{c.suit}</span>
                          </span>
                        ))
                      ) : (
                        <div className="text-slate-600 text-xs py-4 font-bold border border-dashed border-slate-850 rounded w-full">???</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Betting triggers */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => playTeenPatti('Player')}
                    disabled={isDealing}
                    className="py-3 rounded-xl bg-gradient-to-r from-indigo-700 to-indigo-600 font-extrabold text-xs uppercase text-white tracking-wider active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {language === 'Hindi' ? 'खिलाड़ी जीतेगा (2x)' : 'Bet Player (2x)'}
                  </button>
                  <button
                    onClick={() => playTeenPatti('Dealer')}
                    disabled={isDealing}
                    className="py-3 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 font-extrabold text-xs uppercase text-white tracking-wider active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {language === 'Hindi' ? 'डीलर जीतेगा (2x)' : 'Bet Dealer (2x)'}
                  </button>
                </div>
              </div>
            )}

            {/* Game 4: Jhandi Munda */}
            {activeSubGame === 'JhandiMunda' && (
              <div className="space-y-4 animate-fade-in text-center text-xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{language === 'Hindi' ? 'पासा परिणाम (6 Dice Rolled)' : 'Dice Roll Outcomes'}</p>
                <div className="grid grid-cols-6 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-850/70 min-h-[50px] items-center justify-center">
                  {diceResults.length > 0 ? (
                    diceResults.map((sym, idx) => {
                      const item = JHANDI_SYMBOLS.find(s => s.name === sym);
                      return (
                        <span key={idx} className={`text-2xl font-bold p-1 bg-slate-900 border border-slate-800 rounded animate-bounce ${item?.color}`}>
                          {item?.char || '🚩'}
                        </span>
                      );
                    })
                  ) : (
                    <span className="col-span-6 text-slate-600 font-bold uppercase tracking-wider text-[10px] text-center">???</span>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-left border-b border-slate-850 pb-1">{language === 'Hindi' ? 'चिह्न चुनें और दांव लगाएं:' : 'Choose Symbol & Start Roll:'}</p>
                <div className="grid grid-cols-2 gap-2">
                  {JHANDI_SYMBOLS.map((sym) => (
                    <button
                      key={sym.name}
                      onClick={() => playJhandiMunda(sym.name)}
                      disabled={isDealing}
                      className="py-3 px-2 bg-slate-950 border border-slate-850 hover:border-amber-500/50 rounded-xl flex items-center justify-between text-left transition-all active:scale-95 disabled:opacity-50"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xl ${sym.color}`}>{sym.char}</span>
                        <span className="font-bold text-[10px] text-slate-300">{sym.label}</span>
                      </div>
                      <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-amber-500 font-bold">ROLL</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dealing overlay/spinner */}
            {isDealing && (
              <div className="flex flex-col items-center justify-center gap-1 py-4 animate-pulse">
                <div className="animate-spin h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full"></div>
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-amber-500">{language === 'Hindi' ? 'डीलिंग जारी है...' : 'Dealing cards...'}</p>
              </div>
            )}

            {/* Game over announcements */}
            {gameResultMsg && (
              <div className={`p-3.5 rounded-2xl text-center border font-semibold text-xs leading-relaxed animate-scale-up ${
                gameOutcomeStatus === 'Won'
                  ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400'
                  : gameOutcomeStatus === 'Lost'
                    ? 'bg-rose-950/20 border-rose-900/40 text-rose-400'
                    : 'bg-slate-950/40 border-slate-850 text-slate-300'
              }`}>
                {gameOutcomeStatus === 'Won' ? '🎉 ' : '♠️ '}
                {gameResultMsg}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Safety info footer */}
      <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-2xl flex items-center gap-2.5 text-[10px] text-slate-500 leading-relaxed">
        <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
        <p>{language === 'Hindi' ? 'रामू भाई कैसीनो पूरी तरह से सुरक्षित है। सभी खेल परिणाम कंपनी के लॉस रिस्क कंट्रोल और रैंडम हेश द्वारा तय किए जाते हैं।' : 'RAMU BHAI Casino is completely secure. All game results are governed by enterprise loss control algorithms and fair RNG hashes.'}</p>
      </div>
    </div>
  );
}
