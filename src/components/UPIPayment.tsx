import React, { useState, useRef } from 'react';
import { Copy, Check, Smartphone, Landmark, QrCode, ArrowLeft, ShieldCheck, Clock, Upload, Image, Send, Bell, CheckCircle } from 'lucide-react';
import RamuBrand from './RamuBrand';
import { RechargeRequest } from '../types';

interface UPIPaymentProps {
  userMobile: string;
  onBack: () => void;
  onSubmitRecharge: (request: RechargeRequest) => void;
}

export default function UPIPayment({ userMobile, onBack, onSubmitRecharge }: UPIPaymentProps) {
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [utr, setUtr] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Screenshot states
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const upiId = 'Shyamu6@fam';
  const merchantName = 'RAMU BHAI GAMES';

  const presets = [100, 300, 500, 1000, 2000, 5000, 10000, 20000];

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount('');
    setErrorMsg('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(val);
    if (val) {
      setAmount(parseInt(val, 10));
    } else {
      setAmount(0);
    }
    setErrorMsg('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle local image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setScreenshotName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 100) {
      setErrorMsg('न्यूनतम रिचार्ज ₹100 है। (Minimum recharge is ₹100)');
      return;
    }
    if (!/^\d{12}$/.test(utr)) {
      setErrorMsg('कृपया सही 12-अंकों का UPI UTR/Transaction ID दर्ज करें। (Please enter valid 12-digit UPI UTR ID)');
      return;
    }

    const newRequest: RechargeRequest = {
      id: 'REQ-' + Math.floor(Math.random() * 900000 + 100000),
      username: '🎭╰‿╯RAMUㅤᏴᎻᎪᏆ Guest',
      mobile: userMobile,
      amount: amount,
      utr: utr,
      status: 'Pending',
      timestamp: Date.now(),
    };

    onSubmitRecharge(newRequest);
    setIsSubmitted(true);
  };

  // Generate UPI Deep Link
  const upiDeepLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&cu=INR&am=${amount}`;

  // Generate Google Charts QR code URL
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=1e293b&data=${encodeURIComponent(upiDeepLink)}`;

  return (
    <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl overflow-hidden shadow-2xl relative">
      
      {/* Real-time simulated Telegram Notification overlay when submitted */}
      {isSubmitted && (
        <div className="absolute top-4 left-4 right-4 bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-xl p-3 shadow-2xl border border-sky-400/30 z-50 animate-bounce duration-1000">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-lg text-white">
              <Send size={16} className="animate-pulse" />
            </div>
            <div className="flex-grow space-y-0.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-extrabold tracking-wider uppercase text-[10px] text-sky-200">Telegram Bot Dispatcher</span>
                <span className="text-[9px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full">SENT / भेजा गया</span>
              </div>
              <p className="font-semibold text-[11px] leading-relaxed">
                📢 रामू भाई ओनर टेलीग्राम बोट ने ₹{amount} के रिचार्ज आवेदन (UTR: <span className="font-mono text-yellow-300 font-extrabold">{utr}</span>) को फोटो रसीद के साथ ओनर वेरिफिकेशन चैनल पर भेज दिया है!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 px-4 py-4 flex items-center justify-between text-slate-950 font-bold shadow-md">
        <button onClick={onBack} className="p-1 hover:bg-black/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <span className="text-lg font-gaming tracking-wide">SURAKSHIT DEPOSIT / RECHARGE</span>
        <div className="w-6"></div>
      </div>

      <div className="p-4 space-y-6">
        {/* Brand */}
        <RamuBrand size="sm" showSubtitle={false} className="mt-2" />

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Amount Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-amber-500 flex items-center gap-1.5">
                <Landmark size={16} /> रिचार्ज राशि चुनें / Choose Amount
              </label>
              <div className="grid grid-cols-4 gap-2">
                {presets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAmountSelect(val)}
                    className={`py-2 px-1 text-center rounded-lg border text-sm font-bold transition-all ${
                      amount === val && !customAmount
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-yellow-400 font-extrabold shadow-lg shadow-amber-500/20'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="text"
                  placeholder="अन्य राशि दर्ज करें / Enter other amount"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-sm"
                />
              </div>
            </div>

            {/* UPI QR & Info */}
            {amount > 0 && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                <div className="bg-white p-3 rounded-lg shadow-inner relative group">
                  <img src={qrUrl} alt="UPI QR Code" className="w-48 h-48 block" />
                  <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-4">
                    <QrCode size={40} className="text-slate-800 animate-bounce" />
                    <span className="text-[10px] text-slate-800 font-semibold mt-2">QR को स्कैन करें या नीचे दिए बटन पर क्लिक करें</span>
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <p className="text-xs text-slate-400">
                    UPI ID पर सीधे भुगतान करें या ऊपर का QR स्कैन करें:
                  </p>
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-2.5">
                    <code className="text-sm font-bold text-amber-400 font-mono tracking-wider">{upiId}</code>
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="p-1.5 hover:bg-slate-800 rounded transition-colors text-amber-500"
                    >
                      {copied ? <Check size={16} className="text-green-500 animate-scale" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                {/* Mobile Pay Link */}
                <a
                  href={upiDeepLink}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform"
                >
                  <Smartphone size={18} />
                  UPI ऐप से भुगतान करें / Pay via UPI App
                </a>
              </div>
            )}

            {/* Drag and Drop Screenshot Uploader */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-amber-500 flex items-center gap-1.5">
                <Image size={16} /> भुगतान स्क्रीनशॉट अपलोड करें (अनिवार्य / Required):
              </label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-amber-400 bg-amber-500/10' 
                    : screenshot 
                      ? 'border-emerald-500 bg-emerald-950/10' 
                      : 'border-slate-700 hover:border-slate-600 bg-slate-950/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {screenshot ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <img src={screenshot} alt="Payment Slip" className="w-20 h-20 object-cover rounded-lg border border-emerald-500/40 shadow-md" />
                    <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle size={14} /> स्क्रीनशॉट अपलोड हो गया!
                    </div>
                    <p className="text-[10px] text-slate-500 truncate max-w-[250px]">{screenshotName}</p>
                  </div>
                ) : (
                  <div className="space-y-2 text-slate-400">
                    <Upload className="mx-auto text-amber-500/80 animate-pulse" size={24} />
                    <p className="text-xs font-semibold text-slate-300">भुगतान का स्क्रीनशॉट यहाँ खींचें या क्लिक करें</p>
                    <p className="text-[10px] text-slate-500">JPG, PNG, JPEG फाइलें स्वीकार्य हैं</p>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Reference input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-amber-500 flex items-center gap-1.5">
                <ShieldCheck size={16} /> भुगतान के बाद 12-अंकीय UTR / Transaction ID दर्ज करें:
              </label>
              <input
                type="text"
                placeholder="12-digit UPI UTR No. (eg: 4123XXXXXXXX)"
                value={utr}
                onChange={(e) => setUtr(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 font-mono text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-500 placeholder:font-sans placeholder:text-sm placeholder:tracking-normal font-bold"
                required
              />
              <p className="text-[10px] text-slate-400 text-center leading-relaxed font-medium">
                भुगतान करने के बाद ही UTR नंबर डालें। गलत UTR या फर्जी रसीद डालने पर खाता स्थायी रूप से निलंबित हो सकता है।
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg text-xs text-red-400 text-center font-semibold">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 py-3.5 px-4 rounded-xl font-extrabold text-base uppercase tracking-wide hover:from-amber-400 hover:to-amber-500 active:scale-95 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              रीचार्ज सबमिट करें / Submit Deposit
            </button>
          </form>
        ) : (
          /* Submission Confirmation Screen */
          <div className="py-6 text-center space-y-6">
            <div className="inline-flex p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-500 animate-pulse">
              <Clock size={48} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-yellow-400">अनुरोध लंबित है / Request Pending</h3>
              <p className="text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
                आपका ₹{amount} का रिचार्ज अनुरोध सफलतापूर्वक सबमिट हो गया है।
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                हमारी टीम आपके भुगतान (UTR: <code className="text-amber-400 font-mono font-bold">{utr}</code>) की जांच कर रही है। जल्द ही आपके वॉलेट में राशि जमा कर दी जाएगी।
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 text-left max-w-xs mx-auto space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="text-slate-100 font-bold text-amber-400 font-gaming">₹{amount}.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">UTR:</span>
                <span className="text-slate-100 font-mono font-bold">{utr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile:</span>
                <span className="text-slate-100">{userMobile}</span>
              </div>
              {screenshot && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Photo Proof:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Attached</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-900 pt-2">
                <span className="text-slate-500">Notification Alert:</span>
                <span className="text-sky-400 font-bold">📲 PUSHED TO OWNER</span>
              </div>
            </div>

            <button
              onClick={onBack}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-sm font-bold text-slate-200 transition-colors"
            >
              वापस जाएं / Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
