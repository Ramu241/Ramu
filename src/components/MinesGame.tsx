import React, { useState } from 'react';
import { ShieldCheck, Bomb, Gem, Play, Trash, HelpCircle, Trophy, Sparkles, AlertCircle } from 'lucide-react';
import RamuBrand from './RamuBrand';
import { Language, translations } from '../utils/language';

interface MinesGameProps {
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  language: Language;
  isAllowedToPlay: boolean;
}

interface TileState {
  id: number;
  isMine: boolean;
  isClicked: boolean;
  status: 'hidden' | 'gem' | 'mine';
}

export default function MinesGame({ userBalance, onUpdateBalance, language, isAllowedToPlay }: MinesGameProps) {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [mineCount, setMineCount] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tiles, setTiles] = useState<TileState[]>([]);
  const [gemCount, setGemCount] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [hasHitMine, setHasHitMine] = useState<boolean>(false);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [winAmount, setWinAmount] = useState<number>(0);

  const t = translations[language];

  const initGame = () => {
    if (!isAllowedToPlay) {
      alert(
        language === 'Hindi' 
          ? '⚠️ खेलने के लिए पहले कम से कम ₹100 का रिचार्ज पूरा करना अनिवार्य है! कृपया वॉलेट में जाकर डिपॉजिट करें।' 
          : '⚠️ You must complete a recharge of at least ₹100 before you can play! Please go to Wallet and deposit.'
      );
      return;
    }
    if (betAmount > userBalance) {
      alert(language === 'Hindi' ? 'अपर्याप्त शेष राशि!' : 'Insufficient wallet balance!');
      return;
    }
    if (betAmount <= 0) {
      alert(language === 'Hindi' ? 'कृपया सही दांव राशि चुनें।' : 'Invalid bet amount');
      return;
    }

    // Deduct Balance
    onUpdateBalance(userBalance - betAmount);

    // Build random mines on 5x5 grid (25 tiles)
    const grid: TileState[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      isMine: false,
      isClicked: false,
      status: 'hidden',
    }));

    // Randomly place mineCount mines
    let placedMines = 0;
    while (placedMines < mineCount) {
      const idx = Math.floor(Math.random() * 25);
      if (!grid[idx].isMine) {
        grid[idx].isMine = true;
        placedMines++;
      }
    }

    setTiles(grid);
    setGemCount(0);
    setMultiplier(1.0);
    setHasHitMine(false);
    setHasCashedOut(false);
    setWinAmount(0);
    setIsPlaying(true);
  };

  const calculateNextMultiplier = (currentGems: number) => {
    const safeTiles = 25 - mineCount;
    if (safeTiles <= 0) return 1;

    let mult = 1.0;
    for (let i = 0; i <= currentGems; i++) {
      mult *= (25 - i) / (safeTiles - i);
    }
    // Dampen multiplier slightly for house edge
    return Number((mult * 0.95).toFixed(2));
  };

  const handleTileClick = (tileId: number) => {
    if (!isPlaying || hasHitMine || hasCashedOut) return;
    
    const targetTile = tiles[tileId];
    if (targetTile.isClicked) return;

    const newTiles = [...tiles];
    
    if (targetTile.isMine) {
      // HIT MINE! Game Over
      newTiles[tileId] = {
        ...targetTile,
        isClicked: true,
        status: 'mine',
      };
      
      // Reveal all mines & gems
      newTiles.forEach((tile) => {
        tile.isClicked = true;
        tile.status = tile.isMine ? 'mine' : 'gem';
      });

      setTiles(newTiles);
      setHasHitMine(true);
      setIsPlaying(false);
    } else {
      // HIT GEM! Success
      const nextGems = gemCount + 1;
      const nextMult = calculateNextMultiplier(nextGems);
      
      newTiles[tileId] = {
        ...targetTile,
        isClicked: true,
        status: 'gem',
      };

      setTiles(newTiles);
      setGemCount(nextGems);
      setMultiplier(nextMult);

      // If user clears all safe gems, auto-cash out
      if (nextGems === 25 - mineCount) {
        handleCashOutDirectly(nextMult);
      }
    }
  };

  const handleCashOutDirectly = (finalMult: number) => {
    // 2% commission fee applied to wagers: payout is netWager * multiplier
    const netWager = betAmount * 0.98;
    const payout = Number((netWager * finalMult).toFixed(2));
    onUpdateBalance(userBalance + payout);
    setWinAmount(payout);
    setHasCashedOut(true);
    setIsPlaying(false);

    // Reveal rest of grid
    const revealed = tiles.map((t) => ({
      ...t,
      isClicked: true,
      status: t.isMine ? 'mine' : 'gem',
    }));
    setTiles(revealed);
  };

  const handleCashOut = () => {
    if (!isPlaying || gemCount === 0 || hasHitMine || hasCashedOut) return;
    handleCashOutDirectly(multiplier);
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Brand */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 text-center shadow-lg">
        <RamuBrand size="sm" showSubtitle={false} />
        <p className="text-[10px] text-emerald-400 font-extrabold tracking-widest font-gaming mt-1 uppercase">💎 {t.brandName} MINES PRO 💎</p>
      </div>

      {/* Arena Grid */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-inner">
        {/* Game Stats */}
        <div className="flex justify-between items-center mb-3 text-xs">
          <div className="flex items-center gap-1">
            <Gem size={14} className="text-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-medium">{language === 'Hindi' ? 'गैम्स:' : 'Gems Found:'} <strong className="text-emerald-400 font-gaming">{gemCount}</strong></span>
          </div>

          {isPlaying && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold font-gaming animate-pulse">
              {language === 'Hindi' ? `गुणक: ${multiplier}x` : `Multiplier: ${multiplier}x`}
            </div>
          )}

          <div className="text-slate-400">
            {language === 'Hindi' ? 'माइन संख्या:' : 'Mines:'} <strong className="text-rose-500 font-gaming">{mineCount}</strong>
          </div>
        </div>

        {/* 5x5 Mine Grid */}
        <div className="grid grid-cols-5 gap-2">
          {tiles.length === 0 ? (
            // Empty placeholder before game starts
            Array.from({ length: 25 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-square bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-center text-slate-700 font-semibold"
              >
                ?
              </div>
            ))
          ) : (
            tiles.map((tile) => {
              let cellClass = 'bg-slate-900 hover:bg-slate-800 border-slate-800';
              let icon = <span className="text-slate-600 font-bold font-gaming text-sm">?</span>;

              if (tile.isClicked) {
                if (tile.status === 'mine') {
                  cellClass = 'bg-rose-950/40 border-rose-500 text-rose-500 scale-95';
                  icon = <Bomb size={20} className="animate-bounce" />;
                } else if (tile.status === 'gem') {
                  cellClass = 'bg-emerald-950/40 border-emerald-500 text-emerald-400 scale-95';
                  icon = <Gem size={20} className="animate-scale" />;
                }
              }

              return (
                <button
                  key={tile.id}
                  disabled={!isPlaying || tile.isClicked}
                  onClick={() => handleTileClick(tile.id)}
                  className={`aspect-square border rounded-xl flex items-center justify-center transition-all ${cellClass}`}
                >
                  {icon}
                </button>
              );
            }))}
          </div>

        {/* In-Game Result Overlays */}
        {hasHitMine && (
          <div className="p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-center space-y-1 animate-fade-in mt-3">
            <h4 className="text-sm font-bold text-rose-400">{language === 'Hindi' ? 'बम फूटा!' : 'EXPLODED!'}</h4>
            <p className="text-[11px] text-slate-300">
              {language === 'Hindi' ? `आप माइन से टकरा गए और ₹${betAmount} हार गए।` : `You hit a mine and lost ₹${betAmount}.`}
            </p>
          </div>
        )}

        {hasCashedOut && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-800 rounded-xl text-center space-y-1 animate-fade-in mt-3">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1">
              <Trophy size={14} /> {language === 'Hindi' ? 'सुरक्षित निकाला गया!' : 'CASHED OUT SUCCESSFULLY!'}
            </h4>
            <p className="text-[11px] text-slate-300">
              {language === 'Hindi' ? `आपने ${multiplier}x गुणक पर ₹${winAmount} जीत लिए!` : `You secured ₹${winAmount} at ${multiplier}x multiplier!`}
            </p>
          </div>
        )}
      </div>

      {/* Control Dashboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-4">
        {/* Parameters input */}
        <div className="flex gap-3">
          <div className="w-1/2 space-y-1">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{language === 'Hindi' ? 'बेट राशि (₹)' : 'Bet Amount (₹)'}</p>
            <input
              type="number"
              disabled={isPlaying}
              value={betAmount}
              onChange={(e) => setBetAmount(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-amber-400 font-gaming font-bold focus:outline-none disabled:opacity-50 text-sm"
            />
          </div>

          <div className="w-1/2 space-y-1">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{language === 'Hindi' ? 'माइन संख्या' : 'Mines (1-24)'}</p>
            <select
              disabled={isPlaying}
              value={mineCount}
              onChange={(e) => setMineCount(parseInt(e.target.value, 10))}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-rose-400 font-gaming font-bold focus:outline-none disabled:opacity-50 text-sm"
            >
              {[1, 2, 3, 5, 8, 10, 15, 20, 24].map((cnt) => (
                <option key={cnt} value={cnt}>
                  {cnt} Mines
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2% Commission layout visualization */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex justify-between items-center text-[10px]">
          <div>
            <p className="text-slate-500">{t.netBetLabel}:</p>
            <p className="font-bold text-emerald-400">₹{(betAmount * 0.98).toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500">{language === 'Hindi' ? '2% सर्विस फीस:' : '2% Platform Fee:'}</p>
            <p className="font-bold text-red-500">₹{(betAmount * 0.02).toFixed(2)}</p>
          </div>
        </div>

        {/* Action button */}
        {!isPlaying ? (
          <button
            onClick={initGame}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold uppercase tracking-wide rounded-xl shadow active:scale-95 transition-transform flex items-center justify-center gap-2 text-xs"
          >
            <Play size={15} /> {language === 'Hindi' ? `गेम शुरू करें (₹${betAmount})` : `START GAME (₹${betAmount})`}
          </button>
        ) : (
          <button
            disabled={gemCount === 0}
            onClick={handleCashOut}
            className={`w-full py-3 rounded-xl font-extrabold uppercase tracking-wide text-xs shadow transition-all ${
              gemCount === 0
                ? 'bg-slate-850 border border-slate-850 text-slate-500 font-semibold shadow-none cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-emerald-500/20 active:scale-95'
            }`}
          >
            {gemCount === 0 ? (language === 'Hindi' ? 'पहले एक सुरक्षित डायमंड खोलें' : 'FIRST REVEAL A GEM') : `${language === 'Hindi' ? 'कैश आउट' : 'CASH OUT'} (₹${((betAmount * 0.98) * multiplier).toFixed(2)})`}
          </button>
        )}
      </div>

      {/* Guide Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
        <p className="font-bold text-amber-500 flex items-center gap-1.5 uppercase tracking-wider">
          <HelpCircle size={14} /> {language === 'Hindi' ? 'माइन गेम निर्देश' : 'Mines Guidelines'}:
        </p>
        <p>1. {language === 'Hindi' ? 'बेट राशि चुनें और माइंस की संख्या चुनें (जितनी अधिक माइंस, उतना अधिक लाभ)।' : 'Select your bet amount and quantity of hidden mines.'}</p>
        <p>2. {language === 'Hindi' ? 'सुरक्षित डायमंड बक्से खोलने के लिए किसी भी सेल पर क्लिक करें।' : 'Click tiles to uncover safe diamonds and multiply your payout.'}</p>
        <p>3. {language === 'Hindi' ? 'किसी भी समय लाभ "Cash Out" करें। बम से टकराते ही सब कुछ गंवा बैठेंगे!' : 'Deduct 2% commission fee at start, cash out any time before detonating a mine!'}</p>
      </div>
    </div>
  );
}
