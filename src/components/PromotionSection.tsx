import React, { useState } from 'react';
import { Copy, Check, Users, Gift, Share2, Award, Coins, Smartphone } from 'lucide-react';
import RamuBrand from './RamuBrand';

interface PromotionSectionProps {
  userMobile: string;
  userInviteCode: string;
  accounts: any[];
  recharges: any[];
}

export default function PromotionSection({ userMobile, userInviteCode, accounts, recharges }: PromotionSectionProps) {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // External Game Website link: ramubhaigame.co with invitation code appended
  const inviteLink = `https://ramubhaigame.co/register?invite=${userInviteCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(userInviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Find users registered under this invite code
  const referredUsers = accounts.filter((acc) => acc.referredBy === userInviteCode);

  const formatMobile = (mobile: string) => {
    if (mobile.length >= 10) {
      return `${mobile.slice(0, 3)}****${mobile.slice(-3)}`;
    }
    return mobile;
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Brand card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center shadow-lg">
        <RamuBrand size="sm" showSubtitle={true} />
        <p className="text-[10px] text-amber-500 font-extrabold tracking-widest font-gaming mt-1">★ RAMU BHAI REFER & EARN AGENT PROGRAM ★</p>
      </div>

      {/* Referral Info Card */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-4 shadow-lg space-y-4">
        <div className="flex justify-between items-center bg-slate-950 border border-slate-900 rounded-xl p-3">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-semibold">आपका आमंत्रण कोड / Invite Code</p>
            <p className="text-lg font-bold font-gaming text-amber-400 tracking-widest">{userInviteCode}</p>
          </div>
          <button
            onClick={copyCode}
            className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-lg text-xs font-extrabold flex items-center gap-1 shadow transition-all active:scale-95"
          >
            {copiedCode ? <Check size={12} className="text-slate-950 animate-scale" /> : <Copy size={12} />}
            {copiedCode ? 'कॉपी हो गया' : 'कोड कॉपी करें'}
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">आमंत्रण लिंक साझा करें / Share Invite Link</p>
          <div className="flex items-center justify-between bg-slate-950 border border-slate-900 rounded-xl p-2.5">
            <span className="text-[11px] text-slate-400 font-mono overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">{inviteLink}</span>
            <button
              onClick={copyLink}
              className="p-1.5 hover:bg-slate-900 text-amber-500 rounded transition-colors"
            >
              {copiedLink ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          </div>
          <button
            onClick={copyLink}
            className="w-full bg-slate-800 hover:bg-slate-750 text-slate-100 py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-700/80 transition-colors"
          >
            <Share2 size={16} className="text-amber-500" />
            लिंक कॉपी करें और दोस्तों को भेजें
          </button>
        </div>
      </div>

      {/* Real Referred Users & Deposit Records */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Users size={16} className="text-amber-500" /> 
          <span>आमंत्रित सदस्य रिकॉर्ड ({referredUsers.length}) / Referral Records</span>
        </h3>

        {referredUsers.length === 0 ? (
          <div className="bg-slate-950 p-6 rounded-xl text-center border border-slate-900 space-y-2">
            <p className="text-xs text-slate-500">अभी तक कोई सदस्य शामिल नहीं हुआ है।</p>
            <p className="text-[10px] text-amber-500/70">अपने दोस्तों को आमंत्रित करें और प्रत्येक डिपॉजिट पर 5% कमीशन प्राप्त करें!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {referredUsers.map((refUser, idx) => {
              // Calculate total approved deposits
              const userRecharges = recharges.filter(
                (req) => req.mobile === refUser.mobile && req.status === 'Approved'
              );
              const totalDeposit = userRecharges.reduce((sum, r) => sum + r.amount, 0);

              return (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-900 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-200">
                      <Smartphone size={12} className="text-slate-500" />
                      <span>{formatMobile(refUser.mobile)}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      UID: <span className="font-mono text-slate-400">{refUser.uid}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div className="text-[10px] text-slate-500">कुल डिपॉजिट / Deposit</div>
                    <div className="font-bold text-emerald-400 font-gaming">₹{totalDeposit.toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Referral Tier program */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
          <Gift size={16} className="text-amber-500" /> एजेंट बोनस विवरण / Agent Program Tiers
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-900">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold font-gaming">TIER 1</span>
              <span className="text-slate-300">डायरेक्ट फ्रेंड डिपॉजिट</span>
            </div>
            <span className="text-emerald-400 font-bold font-gaming">+₹100 प्रति मित्र</span>
          </div>

          <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-900">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold font-gaming">TIER 2</span>
              <span className="text-slate-300">बेट कमीशन (Win/Lose)</span>
            </div>
            <span className="text-emerald-400 font-bold font-gaming">0.6% कमीशन दर</span>
          </div>

          <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-900">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold font-gaming">TIER 3</span>
              <span className="text-slate-300">मासिक एजेंट सैलरी</span>
            </div>
            <span className="text-emerald-400 font-bold font-gaming">₹10,000+ प्रतिमाह</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed text-center font-semibold">
          🎉 जितने अधिक लोग आपके आमंत्रण कोड <code className="text-amber-400 font-bold">{userInviteCode}</code> से जुड़ेंगे, आपकी कमाई उतनी ही अधिक होगी। रामू भाई की तरफ से असीमित बोनस!
        </div>
      </div>
    </div>
  );
}
