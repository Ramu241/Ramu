import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  TrendingUp,
  Wallet,
  User as UserIcon,
  Coins,
  ShieldCheck,
  Smartphone,
  Lock,
  Compass,
  ArrowRight,
  LogOut,
  Gift,
  PlusCircle,
  ArrowDownCircle,
  ListFilter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  DollarSign,
  Languages,
  Tag,
  Headphones
} from 'lucide-react';
import RamuBrand from './components/RamuBrand';
import WinGoGame from './components/WinGoGame';
import AviatorGame from './components/AviatorGame';
import MinesGame from './components/MinesGame';
import UPIPayment from './components/UPIPayment';
import AdminPanel from './components/AdminPanel';
import PromotionSection from './components/PromotionSection';
import CasinoGames from './components/CasinoGames';
import { User, RechargeRequest, WithdrawRequest, WinGoBet } from './types';
import { translations, Language } from './utils/language';

export default function App() {
  // Language Selection
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('ramu_lang');
    return (stored === 'English' ? 'English' : 'Hindi');
  });

  const t = translations[language];

  // Global accounts database (persisted multi-user list)
  const [accounts, setAccounts] = useState<User[]>(() => {
    const stored = localStorage.getItem('ramu_accounts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    const defaultAccs: User[] = [
      {
        username: '👑 RAMU BHAI (Owner)',
        mobile: '9999999999',
        balance: 50000.00,
        inviteCode: '7777777',
        isLoggedIn: false,
        isAdmin: true,
        uid: '100001',
        password: 'admin',
      },
      {
        username: '🎭╰‿╯RAMUㅤᏴᎻᎪᏆ Guest',
        mobile: '8888888888',
        balance: 1000.00,
        inviteCode: '1234567',
        isLoggedIn: false,
        isAdmin: false,
        uid: '100101',
        password: 'user123',
      }
    ];
    localStorage.setItem('ramu_accounts', JSON.stringify(defaultAccs));
    return defaultAccs;
  });

  // Logged-in Session state
  const [user, setUser] = useState<User>(() => {
    const stored = localStorage.getItem('ramu_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return {
      username: '🎭╰‿╯RAMUㅤᏴᎻᎪᏆ Guest',
      mobile: '',
      balance: 0.00,
      inviteCode: '1234567',
      isLoggedIn: false,
      isAdmin: false,
      uid: '',
    };
  });

  const [recharges, setRecharges] = useState<RechargeRequest[]>(() => {
    const stored = localStorage.getItem('ramu_recharges');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [];
  });

  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>(() => {
    const stored = localStorage.getItem('ramu_withdrawals');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [];
  });

  const [allBets, setAllBets] = useState<WinGoBet[]>(() => {
    const stored = localStorage.getItem('ramu_bets');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [];
  });

  // Gift Codes list
  const [giftCodes, setGiftCodes] = useState<{ code: string; amount: number; redeemedBy: string[] }[]>(() => {
    const stored = localStorage.getItem('ramu_giftcodes');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    const defaultCodes = [
      { code: 'RAMUBHAI', amount: 200, redeemedBy: [] },
      { code: 'WIN50', amount: 50, redeemedBy: [] },
      { code: 'LUCKY100', amount: 100, redeemedBy: [] },
    ];
    localStorage.setItem('ramu_giftcodes', JSON.stringify(defaultCodes));
    return defaultCodes;
  });

  // Navigation and game panel controls
  const [activeTab, setActiveTab] = useState<'Home' | 'Promotion' | 'Wallet' | 'Account'>('Home');
  const [activeGame, setActiveGame] = useState<'Home' | 'WinGo' | 'Aviator' | 'Mines'>('Home');
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [showRechargeGate, setShowRechargeGate] = useState<boolean>(false);
  
  // Secret admin passcode lock states
  const [logoClicks, setLogoClicks] = useState<number>(0);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [showAdminPasscodeModal, setShowAdminPasscodeModal] = useState<boolean>(false);
  const [enteredPasscode, setEnteredPasscode] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<string>('');

  // Authentication forms
  const [authMode, setAuthMode] = useState<'Login' | 'Register'>('Login');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [mobileInput, setMobileInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [inviteCodeInput, setInviteCodeInput] = useState<string>('7777777');
  const [authError, setAuthError] = useState<string>('');

  // Withdrawal form inputs
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawUpiId, setWithdrawUpiId] = useState<string>('');
  const [withdrawError, setWithdrawError] = useState<string>('');
  const [withdrawSuccess, setWithdrawSuccess] = useState<string>('');
  const [withdrawMethod, setWithdrawMethod] = useState<'UPI' | 'BANK'>('UPI');
  const [bankName, setBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [accountHolderName, setAccountHolderName] = useState<string>('');

  // Gift code redemption input
  const [couponInput, setCouponInput] = useState<string>('');
  const [couponError, setCouponError] = useState<string>('');
  const [couponSuccess, setCouponSuccess] = useState<string>('');

  // 24/7 Customer Service url
  const [customerServiceUrl, setCustomerServiceUrl] = useState<string>(() => {
    const val = localStorage.getItem('ramu_customer_service_url');
    if (!val || val === 'https://t.me/ramubhaiofficial') {
      localStorage.setItem('ramu_customer_service_url', 'https://t.me/RamBhai1023');
      return 'https://t.me/RamBhai1023';
    }
    return val;
  });

  const handleUpdateCustomerServiceUrl = (url: string) => {
    setCustomerServiceUrl(url);
    localStorage.setItem('ramu_customer_service_url', url);
  };

  const isAllowedToPlay = user.isAdmin || user.mobile === '9999999999' || recharges.some((r) => r.mobile === user.mobile && r.status === 'Approved' && r.amount >= 100);

  // Persist language
  useEffect(() => {
    localStorage.setItem('ramu_lang', language);
  }, [language]);

  // Persist structures
  useEffect(() => {
    localStorage.setItem('ramu_user', JSON.stringify(user));

    // Sync state back to the central accounts database
    if (user.isLoggedIn && user.mobile) {
      setAccounts((prev) => {
        const index = prev.findIndex((acc) => acc.mobile === user.mobile);
        const updated = [...prev];
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            balance: user.balance,
            username: user.username,
            isAdmin: user.isAdmin,
            uid: user.uid
          };
        }
        localStorage.setItem('ramu_accounts', JSON.stringify(updated));
        return updated;
      });
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ramu_recharges', JSON.stringify(recharges));
  }, [recharges]);

  useEffect(() => {
    localStorage.setItem('ramu_withdrawals', JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem('ramu_bets', JSON.stringify(allBets));
  }, [allBets]);

  useEffect(() => {
    localStorage.setItem('ramu_giftcodes', JSON.stringify(giftCodes));
  }, [giftCodes]);

  // 48-hour bets cleanup and 7-day recharges/withdrawals cleanup
  useEffect(() => {
    const now = Date.now();
    const fortyEightHoursMs = 48 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    setAllBets((prev) => {
      const filtered = prev.filter((b) => !b.timestamp || (now - b.timestamp) < fortyEightHoursMs);
      if (filtered.length !== prev.length) {
        localStorage.setItem('ramu_bets', JSON.stringify(filtered));
      }
      return filtered;
    });

    setRecharges((prev) => {
      const filtered = prev.filter((r) => !r.timestamp || (now - r.timestamp) < sevenDaysMs);
      if (filtered.length !== prev.length) {
        localStorage.setItem('ramu_recharges', JSON.stringify(filtered));
      }
      return filtered;
    });

    setWithdrawals((prev) => {
      const filtered = prev.filter((w) => !w.timestamp || (now - w.timestamp) < sevenDaysMs);
      if (filtered.length !== prev.length) {
        localStorage.setItem('ramu_withdrawals', JSON.stringify(filtered));
      }
      return filtered;
    });
  }, []);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickTime > 4000) {
      setLogoClicks(1);
    } else {
      const updatedClicks = logoClicks + 1;
      setLogoClicks(updatedClicks);
      if (updatedClicks >= 5) {
        setShowAdminPasscodeModal(true);
        setLogoClicks(0);
        setEnteredPasscode('');
        setPasscodeError('');
      }
    }
    setLastClickTime(now);
  };

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPasscode === '55667788') {
      setShowAdminPasscodeModal(false);
      setShowAdmin(true);
      setEnteredPasscode('');
      setPasscodeError('');
    } else {
      setPasscodeError(language === 'Hindi' ? 'गलत पासकोड! कृपया सही कोड डालें।' : 'Wrong Passcode! Try again.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobileInput)) {
      setAuthError(language === 'Hindi' ? 'कृपया सही 10-अंकीय मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (passwordInput.length < 4) {
      setAuthError(language === 'Hindi' ? 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' : 'Password must be at least 4 characters.');
      return;
    }

    // Find in central persistent accounts array
    const matched = accounts.find((acc) => acc.mobile === mobileInput);
    if (!matched) {
      setAuthError(language === 'Hindi' ? 'यह मोबाइल नंबर पंजीकृत नहीं है! रजिस्टर करें।' : 'This mobile number is not registered! Register first.');
      return;
    }

    if (matched.password !== passwordInput) {
      setAuthError(language === 'Hindi' ? 'गलत पासवर्ड! कृपया सही पासवर्ड दर्ज करें।' : 'Incorrect password! Please try again.');
      return;
    }

    setUser({
      username: matched.username,
      mobile: matched.mobile,
      balance: matched.balance,
      inviteCode: matched.inviteCode,
      isLoggedIn: true,
      isAdmin: matched.mobile === '9999999999' || matched.isAdmin,
      uid: matched.uid,
    });
    setAuthError('');
    setMobileInput('');
    setPasswordInput('');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobileInput)) {
      setAuthError(language === 'Hindi' ? 'कृपया सही 10-अंकीय मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (passwordInput.length < 4) {
      setAuthError(language === 'Hindi' ? 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' : 'Password must be at least 4 characters.');
      return;
    }
    
    if (!/^\d{7}$/.test(inviteCodeInput)) {
      setAuthError(language === 'Hindi' ? 'अमान्य आमंत्रण कोड! कृपया 7 अंकों का आमंत्रण कोड उपयोग करें।' : 'Invalid invitation code! Please use a 7-digit invitation code.');
      return;
    }

    const referrerExists = accounts.some((acc) => acc.inviteCode === inviteCodeInput);
    if (!referrerExists && inviteCodeInput !== '7777777') {
      setAuthError(language === 'Hindi' ? 'यह आमंत्रण कोड प्रणाली में उपलब्ध नहीं है!' : 'This invitation code does not exist in the system!');
      return;
    }

    // Check duplicate
    const exists = accounts.some((acc) => acc.mobile === mobileInput);
    if (exists) {
      setAuthError(language === 'Hindi' ? 'यह नंबर पहले से पंजीकृत है! लॉगिन करें।' : 'This phone is already registered! Login here.');
      return;
    }

    // Generate unique user UID starting from 100101 sequentially
    const nextUidStr = String(100101 + accounts.length);

    // Generate starting welcome gift bonus between ₹28 and ₹50
    const welcomeBonus = Math.floor(Math.random() * (50 - 28 + 1)) + 28;

    // Generate unique 7-digit invite code
    let generatedCode = '';
    do {
      generatedCode = String(Math.floor(1000000 + Math.random() * 9000000));
    } while (accounts.some((acc) => acc.inviteCode === generatedCode) || generatedCode === '7777777');

    const finalUsername = usernameInput.trim() || `🎭╰‿╯RAMUㅤᏴᎻᎪᏆ #${nextUidStr.slice(-3)}`;

    const newUser: User = {
      username: finalUsername,
      mobile: mobileInput,
      balance: welcomeBonus, // starting welcome gift bonus between 28 and 50!
      inviteCode: generatedCode,
      referredBy: inviteCodeInput,
      isLoggedIn: true,
      isAdmin: mobileInput === '9999999999',
      uid: nextUidStr,
      password: passwordInput,
    };

    setAccounts((prev) => {
      const updated = [...prev, newUser];
      localStorage.setItem('ramu_accounts', JSON.stringify(updated));
      return updated;
    });

    setUser(newUser);
    setAuthError('');
    setUsernameInput('');
    setMobileInput('');
    setPasswordInput('');
  };

  const handleLogout = () => {
    setUser({
      ...user,
      isLoggedIn: false,
    });
    setActiveTab('Home');
    setActiveGame('Home');
    setShowAdmin(false);
  };

  const handleAddRechargeRequest = (req: RechargeRequest) => {
    setRecharges((prev) => [req, ...prev]);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt < 110) {
      setWithdrawError(language === 'Hindi' ? 'न्यूनतम निकासी राशि ₹110 है।' : 'Minimum withdrawal amount is ₹110.');
      return;
    }
    if (amt > user.balance) {
      setWithdrawError(language === 'Hindi' ? 'आपके वॉलेट में पर्याप्त राशि नहीं है!' : 'Insufficient wallet balance!');
      return;
    }

    let upiIdVal = '-';
    let bankNameVal: string | undefined = undefined;
    let accountNumberVal: string | undefined = undefined;
    let ifscCodeVal: string | undefined = undefined;
    let accountHolderNameVal: string | undefined = undefined;

    if (withdrawMethod === 'UPI') {
      if (!withdrawUpiId.includes('@')) {
        setWithdrawError(language === 'Hindi' ? 'कृपया सही UPI ID दर्ज करें (उदा: shyamu@fam)' : 'Please enter a valid UPI ID (e.g. shyamu@fam)');
        return;
      }
      upiIdVal = withdrawUpiId;
    } else {
      if (!bankName.trim() || !accountNumber.trim() || !ifscCode.trim() || !accountHolderName.trim()) {
        setWithdrawError(language === 'Hindi' ? 'कृपया सभी बैंक विवरण सही ढंग से भरें।' : 'Please fill all bank details correctly.');
        return;
      }
      bankNameVal = bankName.trim();
      accountNumberVal = accountNumber.trim();
      ifscCodeVal = ifscCode.trim().toUpperCase();
      accountHolderNameVal = accountHolderName.trim();
    }

    const newWithdrawReq: WithdrawRequest = {
      id: 'WTH-' + Math.floor(Math.random() * 900000 + 100000),
      username: user.username,
      mobile: user.mobile,
      amount: amt,
      upiId: upiIdVal,
      bankName: bankNameVal,
      accountNumber: accountNumberVal,
      ifscCode: ifscCodeVal,
      accountHolderName: accountHolderNameVal,
      status: 'Pending',
      timestamp: Date.now(),
    };

    setUser((prev) => ({ ...prev, balance: prev.balance - amt }));
    setWithdrawals((prev) => [newWithdrawReq, ...prev]);
    setWithdrawSuccess(language === 'Hindi' ? 'निकासी अनुरोध सबमिट किया गया! जल्द ही राशि ट्रांसफर की जाएगी।' : 'Withdrawal request submitted! Will be processed soon.');
    setWithdrawAmount('');
    setBankName('');
    setAccountNumber('');
    setIfscCode('');
    setAccountHolderName('');
  };

  // Gift Code Redemption handler
  const handleRedeemGiftCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    if (!couponInput.trim()) return;

    const codeUpper = couponInput.toUpperCase().trim();
    const codeIndex = giftCodes.findIndex((gc) => gc.code === codeUpper);

    if (codeIndex === -1) {
      setCouponError(t.giftCodeError);
      return;
    }

    const targetCode = giftCodes[codeIndex];

    // Check if user already redeemed it
    if (targetCode.redeemedBy.includes(user.mobile)) {
      setCouponError(language === 'Hindi' ? 'आप पहले ही इस कोड का उपयोग कर चुके हैं!' : 'You have already redeemed this code!');
      return;
    }

    // Success! Update code and add balance
    const updatedCodes = [...giftCodes];
    updatedCodes[codeIndex] = {
      ...targetCode,
      redeemedBy: [...targetCode.redeemedBy, user.mobile]
    };

    setGiftCodes(updatedCodes);
    setUser((prev) => ({ ...prev, balance: prev.balance + targetCode.amount }));
    setCouponSuccess(`${t.giftCodeSuccess} (₹${targetCode.amount} Credited!)`);
    setCouponInput('');
  };

  // Admin adjustments
  const handleApproveRecharge = (id: string) => {
    setRecharges((prev) =>
      prev.map((req) => {
        if (req.id === id && req.status === 'Pending') {
          // Find target user from current accounts state
          const targetUser = accounts.find((acc) => acc.mobile === req.mobile);
          let referrerBonus = 0;
          let referrerMobile = '';

          if (targetUser && targetUser.referredBy) {
            const depositAmt = req.amount;
            if (depositAmt >= 6000) {
              referrerBonus = 300;
            } else if (depositAmt >= 3000) {
              referrerBonus = 150;
            } else if (depositAmt >= 1000) {
              referrerBonus = 50;
            } else if (depositAmt >= 500) {
              referrerBonus = 20;
            } else if (depositAmt >= 100) {
              referrerBonus = 15;
            }

            if (referrerBonus > 0) {
              const referrer = accounts.find((acc) => acc.inviteCode === targetUser.referredBy);
              if (referrer) {
                referrerMobile = referrer.mobile;
              }
            }
          }

          // Increase balance in local central array and in session if active
          setAccounts((prevAccs) => {
            const updated = prevAccs.map((acc) => {
              let updatedBal = acc.balance;
              if (acc.mobile === req.mobile) {
                updatedBal += req.amount;
              }
              if (referrerMobile && acc.mobile === referrerMobile) {
                updatedBal += referrerBonus;
              }
              return { ...acc, balance: updatedBal };
            });
            localStorage.setItem('ramu_accounts', JSON.stringify(updated));
            return updated;
          });

          if (user.mobile === req.mobile) {
            setUser((prevUser) => ({ ...prevUser, balance: prevUser.balance + req.amount }));
          }
          if (referrerMobile && user.mobile === referrerMobile) {
            setUser((prevUser) => ({ ...prevUser, balance: prevUser.balance + referrerBonus }));
          }

          return { ...req, status: 'Approved' };
        }
        return req;
      })
    );
  };

  const handleRejectRecharge = (id: string) => {
    setRecharges((prev) =>
      prev.map((req) => (req.id === id && req.status === 'Pending' ? { ...req, status: 'Rejected' } : req))
    );
  };

  const handleApproveWithdrawal = (id: string) => {
    setWithdrawals((prev) =>
      prev.map((req) => (req.id === id && req.status === 'Pending' ? { ...req, status: 'Approved' } : req))
    );
  };

  const handleRejectWithdrawal = (id: string) => {
    setWithdrawals((prev) =>
      prev.map((req) => {
        if (req.id === id && req.status === 'Pending') {
          // Refund cash to the database and current user if matched
          setAccounts((prevAccs) => {
            const updated = prevAccs.map((acc) =>
              acc.mobile === req.mobile ? { ...acc, balance: acc.balance + req.amount } : acc
            );
            localStorage.setItem('ramu_accounts', JSON.stringify(updated));
            return updated;
          });

          if (user.mobile === req.mobile) {
            setUser((prevUser) => ({ ...prevUser, balance: prevUser.balance + req.amount }));
          }
          return { ...req, status: 'Rejected' };
        }
        return req;
      })
    );
  };

  // Direct balance addition / subtraction from Admin Panel searching by UID/Mobile
  const handleUpdateUserBalanceAdmin = (uidOrMobile: string, amount: number, operation: 'add' | 'sub') => {
    const updated = accounts.map((acc) => {
      if (acc.uid === uidOrMobile || acc.mobile === uidOrMobile) {
        const netAmt = operation === 'add' ? acc.balance + amount : Math.max(0, acc.balance - amount);
        if (user.mobile === acc.mobile) {
          setUser((prev) => ({ ...prev, balance: netAmt }));
        }
        return { ...acc, balance: netAmt };
      }
      return acc;
    });

    setAccounts(updated);
    localStorage.setItem('ramu_accounts', JSON.stringify(updated));
  };

  // Create a new gift code from Admin Panel
  const handleCreateGiftCodeAdmin = (code: string, amount: number) => {
    const codeUpper = code.toUpperCase().trim();
    if (!codeUpper || amount <= 0) return;
    setGiftCodes((prev) => [...prev, { code: codeUpper, amount, redeemedBy: [] }]);
  };

  // Login UI render
  if (!user.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#060812] flex flex-col items-center justify-center p-4">
        {/* Language Toggler at very top right */}
        <div className="w-full max-w-md flex justify-end mb-2">
          <button
            onClick={() => setLanguage(language === 'Hindi' ? 'English' : 'Hindi')}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-bold text-amber-400 hover:text-white transition-all shadow-md active:scale-95"
          >
            <Languages size={13} />
            <span>{language === 'Hindi' ? 'English' : 'हिन्दी (Hindi)'}</span>
          </button>
        </div>

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <RamuBrand size="lg" onAdminTrigger={() => setShowAdminPasscodeModal(true)} />

          {/* Tab buttons */}
          <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => { setAuthMode('Login'); setAuthError(''); }}
              className={`py-2 text-center rounded-lg font-bold text-sm tracking-wide transition-all ${
                authMode === 'Login'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.login}
            </button>
            <button
              onClick={() => { setAuthMode('Register'); setAuthError(''); }}
              className={`py-2 text-center rounded-lg font-bold text-sm tracking-wide transition-all ${
                authMode === 'Register'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.register}
            </button>
          </div>

          <form onSubmit={authMode === 'Login' ? handleLogin : handleRegister} className="space-y-4">
            {/* Display Name / Name Input (REGISTER MODE ONLY) */}
            {authMode === 'Register' && (
              <div className="space-y-1 animate-fade-in">
                <label className="text-xs text-amber-500/80 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                  <UserIcon size={13} /> Display Name / पूरा नाम
                </label>
                <input
                  type="text"
                  placeholder={language === 'Hindi' ? 'अपना नाम दर्ज करें' : 'Enter your name'}
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold text-sm"
                  required
                />
              </div>
            )}

            {/* Phone Input */}
            <div className="space-y-1">
              <label className="text-xs text-amber-500/80 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <Smartphone size={13} /> {t.mobileNumber}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">+91</span>
                <input
                  type="text"
                  placeholder={t.enter10Digit}
                  value={mobileInput}
                  onChange={(e) => setMobileInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono tracking-wide"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-xs text-amber-500/80 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <Lock size={13} /> {t.password}
              </label>
              <input
                type="password"
                placeholder={t.enterPassword}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            {/* Register: invite code */}
            {authMode === 'Register' && (
              <div className="space-y-1">
                <label className="text-xs text-amber-500/80 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                  <Gift size={13} /> {t.invitationCode}
                </label>
                <input
                  type="text"
                  placeholder="145768738434"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-amber-400 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>
            )}

            {authError && (
              <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-400 text-center font-semibold animate-shake">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 py-3.5 px-4 rounded-xl font-extrabold text-sm uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/10 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {authMode === 'Login' ? t.loginBtn : t.registerBtn}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick instructions */}
          <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-850 text-center space-y-2 text-slate-500 text-[10px] leading-relaxed">
            <p className="font-bold text-slate-400 uppercase tracking-widest">{language === 'Hindi' ? 'आवश्यक सूचना' : 'Important Notice'}</p>
            <p>1. {language === 'Hindi' ? 'नए नंबर से रजिस्टर करने पर' : 'Upon registering, you get'} <span className="text-amber-500 font-bold">₹28 - ₹50</span> {language === 'Hindi' ? 'तक का स्वागत बोनस तुरंत मिलता है।' : 'free welcome bonus credits.'}</p>
            <p>2. {language === 'Hindi' ? '⚠️ ध्यान दें: गेम खेलने के लिए पहले कम से कम ₹100 का वॉलेट रिचार्ज करना अनिवार्य है।' : '⚠️ Note: A wallet recharge of at least ₹100 is mandatory before you can start playing.'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Active Admin Screen view
  if (showAdmin) {
    return (
      <div className="min-h-screen bg-[#060812] p-4 pb-24">
        <AdminPanel
          language={language}
          recharges={recharges}
          onApproveRecharge={handleApproveRecharge}
          onRejectRecharge={handleRejectRecharge}
          withdrawals={withdrawals}
          onApproveWithdrawal={handleApproveWithdrawal}
          onRejectWithdrawal={handleRejectWithdrawal}
          accounts={accounts}
          onUpdateUserBalance={handleUpdateUserBalanceAdmin}
          giftCodes={giftCodes}
          onCreateGiftCode={handleCreateGiftCodeAdmin}
          allBets={allBets}
          onClose={() => setShowAdmin(false)}
          customerServiceUrl={customerServiceUrl}
          onUpdateCustomerServiceUrl={handleUpdateCustomerServiceUrl}
        />
      </div>
    );
  }

  // Active Recharge/Deposit screen view
  if (showRechargeGate) {
    return (
      <div className="min-h-screen bg-[#060812] p-4 pb-24">
        <UPIPayment
          userMobile={user.mobile}
          onBack={() => setShowRechargeGate(false)}
          onSubmitRecharge={handleAddRechargeRequest}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060812] text-slate-100 pb-28">
      {/* Top Brand Banner */}
      <header className="sticky top-0 bg-slate-950/95 border-b border-slate-900 px-4 py-3 flex items-center justify-between z-40 backdrop-blur-md">
        <div className="flex items-center gap-2 cursor-pointer select-none active:scale-98 transition-transform" onClick={handleLogoClick}>
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
          <span className="glowing-brand text-sm tracking-wider font-extrabold bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent uppercase">
            {t.brandName}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'Hindi' ? 'English' : 'Hindi')}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-amber-500 hover:text-white rounded-lg border border-slate-800 transition-all text-xs font-bold flex items-center gap-1"
          >
            <Languages size={14} />
            <span>{language === 'Hindi' ? 'EN' : 'हि'}</span>
          </button>

          {/* Quick Balance show */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-full">
            <Coins size={13} className="text-amber-500 animate-spin-slow" />
            <span className="text-[11px] font-bold font-gaming text-amber-400">₹{user.balance.toFixed(2)}</span>
          </div>
        </div>
      </header>

      {/* Main Core Router View */}
      <main className="max-w-md mx-auto p-4">
        {activeGame === 'Home' ? (
          /* DEFAULT DASHBOARD PAGES */
          <>
            {activeTab === 'Home' && (
              <div className="space-y-5 animate-fade-in">
                {/* Visual Banner Slide */}
                <div className="bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700 rounded-3xl p-5 text-slate-950 relative overflow-hidden shadow-xl shadow-amber-500/10">
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl"></div>
                  <div className="space-y-2 relative z-10">
                    <span className="text-[9px] uppercase font-bold tracking-widest bg-slate-950 text-amber-400 px-2.5 py-1 rounded-full border border-amber-400/30">
                      ★ RAMU BHAI OFFICIAL PLATINUM ★
                    </span>
                    <h2 className="text-xl md:text-2xl font-extrabold tracking-tight leading-tight uppercase font-display">
                      {t.tagline}
                    </h2>
                    <p className="text-[11px] font-semibold text-slate-900 max-w-xs leading-relaxed">
                      {t.subtitle}
                    </p>
                  </div>
                </div>

                {/* Exclusive game launchers */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Gamepad2 size={15} className="text-amber-500" /> {t.gamesSelectorTitle}
                  </h3>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Win Go prediction */}
                    <button
                      onClick={() => setActiveGame('WinGo')}
                      className="group bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-850 hover:border-amber-500/40 p-4 rounded-2xl flex items-center justify-between text-left transition-all active:scale-98 shadow-md"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-violet-600 rounded-xl text-white font-extrabold text-sm group-hover:scale-105 transition-transform">
                          🎰
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-100 uppercase group-hover:text-amber-400 transition-colors flex items-center gap-1">
                            {t.wingoTitle}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">{t.wingoDesc}</p>
                        </div>
                      </div>
                      <ArrowRight size={15} className="text-slate-600 group-hover:text-amber-400 transition-colors" />
                    </button>

                    {/* Aviator flight */}
                    <button
                      onClick={() => setActiveGame('Aviator')}
                      className="group bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-850 hover:border-rose-500/40 p-4 rounded-2xl flex items-center justify-between text-left transition-all active:scale-98 shadow-md"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-gradient-to-br from-red-600 to-amber-500 rounded-xl text-white font-extrabold text-sm group-hover:scale-105 transition-transform">
                          ✈️
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-100 uppercase group-hover:text-rose-400 transition-colors">
                            {t.aviatorTitle}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">{t.aviatorDesc}</p>
                        </div>
                      </div>
                      <ArrowRight size={15} className="text-slate-600 group-hover:text-rose-400 transition-colors" />
                    </button>

                    {/* Mines field */}
                    <button
                      onClick={() => setActiveGame('Mines')}
                      className="group bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-850 hover:border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between text-left transition-all active:scale-98 shadow-md"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl text-white font-extrabold text-sm group-hover:scale-105 transition-transform">
                          💎
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-100 uppercase group-hover:text-emerald-400 transition-colors">
                            {t.minesTitle}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">{t.minesDesc}</p>
                        </div>
                      </div>
                      <ArrowRight size={15} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
                    </button>

                    {/* Casino Games Hall */}
                    <button
                      onClick={() => setActiveGame('Casino')}
                      className="group bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-850 hover:border-amber-500/40 p-4 rounded-2xl flex items-center justify-between text-left transition-all active:scale-98 shadow-md animate-pulse"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-gradient-to-br from-amber-500 to-red-600 rounded-xl text-white font-extrabold text-sm group-hover:scale-105 transition-transform">
                          👑
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-100 uppercase group-hover:text-amber-400 transition-colors">
                            {language === 'Hindi' ? 'शाही कैसीनो गेम्स (Casino Games)' : 'Casino Royal Games'}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {language === 'Hindi' ? 'ड्रैगन टाइगर, अंदर बाहर, 3 पत्ती, झंडी मुंडा' : 'Andar Bahar, Dragon Tiger, Teen Patti, Jhandi Munda'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={15} className="text-slate-600 group-hover:text-amber-400 transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Referral Promo slide code */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">{t.referralId}</p>
                    <p className="text-base font-extrabold font-gaming text-amber-400">{user.inviteCode}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('Promotion')}
                    className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-semibold text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-all"
                  >
                    {language === 'Hindi' ? 'आमंत्रित करें / Invite' : 'Invite Friends'}
                  </button>
                </div>

                {/* 24/7 Customer Support banner */}
                <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-850 p-4 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                      <Headphones size={20} className="animate-bounce" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100">{language === 'Hindi' ? '☎️ 24 घंटे लाइव सपोर्ट' : '☎️ 24/7 Live Support'}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{language === 'Hindi' ? 'कोई भी समस्या होने पर सीधे संपर्क करें' : 'Contact us directly if you face any issues'}</p>
                    </div>
                  </div>
                  <a
                    href={customerServiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-[11px] font-extrabold uppercase hover:bg-amber-400 transition-all shadow-md shadow-amber-500/10"
                  >
                    {language === 'Hindi' ? 'मैसेज करें' : 'Support'}
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'Promotion' && (
              <PromotionSection 
                userMobile={user.mobile} 
                userInviteCode={user.inviteCode} 
                accounts={accounts} 
                recharges={recharges} 
              />
            )}

            {activeTab === 'Wallet' && (
              <div className="space-y-5 animate-fade-in">
                {/* Balance Summary Card */}
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center gap-2">
                    <Wallet size={18} className="text-amber-500" />
                    <span className="text-[10px] uppercase text-slate-500 tracking-wider font-bold">{t.walletDetails}</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">{t.availableBalance}</p>
                    <h3 className="text-3xl font-extrabold font-gaming text-amber-400 tracking-wide">₹{user.balance.toFixed(2)}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => setShowRechargeGate(true)}
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 py-3 rounded-xl font-extrabold uppercase tracking-wide text-xs shadow-md shadow-amber-500/10 active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle size={15} /> {t.recharge}
                    </button>
                    <a
                      href="#withdraw-form"
                      className="bg-slate-800 hover:bg-slate-755 text-slate-200 py-3 rounded-xl font-bold uppercase tracking-wide text-xs shadow active:scale-95 transition-transform flex items-center justify-center gap-1.5 border border-slate-700"
                    >
                      <ArrowDownCircle size={15} className="text-amber-500" /> {t.withdraw}
                    </a>
                  </div>
                </div>

                {/* Redeem Gift Code section */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
                  <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-2">
                    <Tag size={14} /> {t.giftCodeTitle}
                  </h3>

                  <form onSubmit={handleRedeemGiftCode} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t.giftCodePlaceholder}
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-grow bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 uppercase font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-lg text-xs font-extrabold uppercase transition-all shadow"
                    >
                      {t.giftCodeBtn}
                    </button>
                  </form>

                  {couponError && (
                    <p className="text-[11px] text-red-500 text-center font-semibold bg-red-950/15 border border-red-900/30 rounded py-1">{couponError}</p>
                  )}
                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-400 text-center font-semibold bg-emerald-950/15 border border-emerald-900/30 rounded py-1">{couponSuccess}</p>
                  )}
                </div>

                {/* Withdraw Form Panel */}
                <div id="withdraw-form" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
                  <h3 className="text-xs font-extrabold text-amber-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-850 pb-2">
                    <ArrowDownCircle size={16} /> {t.withdrawFormTitle}
                  </h3>

                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-850 rounded-xl">
                    <button
                      type="button"
                      onClick={() => { setWithdrawMethod('UPI'); setWithdrawError(''); }}
                      className={`py-2 rounded-lg font-bold text-xs transition-all uppercase ${
                        withdrawMethod === 'UPI'
                          ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {language === 'Hindi' ? 'UPI / यूपीआई' : 'UPI ID'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setWithdrawMethod('BANK'); setWithdrawError(''); }}
                      className={`py-2 rounded-lg font-bold text-xs transition-all uppercase ${
                        withdrawMethod === 'BANK'
                          ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {language === 'Hindi' ? 'बैंक ट्रांसफर' : 'Bank Account'}
                    </button>
                  </div>

                  <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">{t.withdrawAmount}:</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          placeholder="Min ₹110"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-4 py-2.5 text-slate-100 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                          required
                        />
                      </div>
                    </div>

                    {withdrawMethod === 'UPI' ? (
                      <div className="space-y-1 animate-fade-in">
                        <label className="text-slate-400 font-semibold">{t.withdrawUpi}:</label>
                        <input
                          type="text"
                          placeholder="user@upi"
                          value={withdrawUpiId}
                          onChange={(e) => setWithdrawUpiId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                          required={withdrawMethod === 'UPI'}
                        />
                      </div>
                    ) : (
                      <div className="space-y-3 animate-fade-in bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">{language === 'Hindi' ? 'बैंक का नाम:' : 'Bank Name:'}</label>
                          <input
                            type="text"
                            placeholder="e.g. SBI, HDFC, ICICI"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                            required={withdrawMethod === 'BANK'}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">{language === 'Hindi' ? 'खाताधारक का नाम:' : 'Account Holder Name:'}</label>
                          <input
                            type="text"
                            placeholder={language === 'Hindi' ? 'पूरा नाम दर्ज करें' : 'Enter full name'}
                            value={accountHolderName}
                            onChange={(e) => setAccountHolderName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                            required={withdrawMethod === 'BANK'}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">{language === 'Hindi' ? 'खाता संख्या:' : 'Account Number:'}</label>
                          <input
                            type="text"
                            placeholder={language === 'Hindi' ? 'खाता संख्या दर्ज करें' : 'Enter account number'}
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                            required={withdrawMethod === 'BANK'}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 font-semibold">{language === 'Hindi' ? 'आईएफएससी (IFSC) कोड:' : 'IFSC Code:'}</label>
                          <input
                            type="text"
                            placeholder="e.g. SBIN0001234"
                            value={ifscCode}
                            onChange={(e) => setIfscCode(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-amber-500"
                            required={withdrawMethod === 'BANK'}
                          />
                        </div>
                      </div>
                    )}

                    {withdrawError && (
                      <p className="text-xs text-red-500 bg-red-950/20 py-2 border border-red-950/40 rounded-lg text-center font-semibold">{withdrawError}</p>
                    )}
                    {withdrawSuccess && (
                      <p className="text-xs text-emerald-400 bg-emerald-950/20 py-2.5 px-3 border border-emerald-950/40 rounded-lg text-center font-semibold leading-relaxed animate-pulse">{withdrawSuccess}</p>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-950 py-3 rounded-lg font-extrabold uppercase transition-all shadow active:scale-95 flex items-center justify-center gap-1"
                    >
                      {t.submitWithdraw}
                    </button>
                  </form>
                </div>

                {/* History Lists */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-850 pb-2">
                    <ListFilter size={14} className="text-amber-500" /> {t.txHistory}
                  </h3>

                  {/* Deposits History list */}
                  <div className="space-y-2.5">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.recentDeposits} ({recharges.filter(r => r.mobile === user.mobile).length})</p>
                    {recharges.filter(r => r.mobile === user.mobile).length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-2 bg-slate-950/30 rounded border border-slate-850/40">No records yet.</p>
                    ) : (
                      recharges.filter(r => r.mobile === user.mobile).map((item) => (
                        <div key={item.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-amber-500 font-gaming">₹{item.amount}</p>
                            <p className="text-[9px] text-slate-500 font-mono mt-0.5">UTR: {item.utr}</p>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                            item.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : item.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400' : 'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {item.status === 'Approved' ? t.statusApproved : item.status === 'Rejected' ? t.statusRejected : t.statusPending}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Withdraws History list */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-850/60">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.recentWithdrawals} ({withdrawals.filter(w => w.mobile === user.mobile).length})</p>
                    {withdrawals.filter(w => w.mobile === user.mobile).length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-2 bg-slate-950/30 rounded border border-slate-850/40">No records yet.</p>
                    ) : (
                      withdrawals.filter(w => w.mobile === user.mobile).map((item) => (
                        <div key={item.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-rose-400 font-gaming">₹{item.amount}</p>
                            <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                              {item.bankName ? (
                                <span>BANK: {item.bankName} (***{item.accountNumber?.slice(-4) || 'XXXX'})</span>
                              ) : (
                                <span>UPI: {item.upiId}</span>
                              )}
                            </p>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                            item.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : item.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400' : 'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {item.status === 'Approved' ? t.statusApproved : item.status === 'Rejected' ? t.statusRejected : t.statusPending}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Account' && (
              <div className="space-y-5 animate-fade-in">
                {/* Profile Overview Card */}
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-lg text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                    <UserIcon size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold glowing-brand tracking-wider text-transparent bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text uppercase">
                      {user.username}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {t.uidPrefix} <strong className="text-amber-500 font-bold">{user.uid || 'N/A'}</strong> | Mobile: {user.mobile}
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-slate-900 rounded-xl py-3 px-4 flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider">{t.availableBalance}</p>
                      <p className="text-lg font-bold font-gaming text-amber-400">₹{user.balance.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => setShowRechargeGate(true)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-102"
                    >
                      {language === 'Hindi' ? 'डिपॉजिट' : 'Deposit'}
                    </button>
                  </div>
                </div>

                {/* Hidden Preferences settings block */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3.5">
                  <h3 
                    onClick={handleLogoClick}
                    className="text-xs font-bold text-slate-300 uppercase tracking-widest cursor-pointer select-none active:text-amber-500"
                  >
                    Preferences
                  </h3>

                  {/* 24/7 Customer Service */}
                  <a
                    href={customerServiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-950 border border-amber-500/20 hover:border-amber-500 hover:bg-slate-900 text-amber-400 py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-98 animate-pulse shadow-lg"
                  >
                    <Headphones size={14} className="text-amber-500" />
                    <span>{language === 'Hindi' ? '☎️ 24 घंटे कस्टमर सर्विस' : '☎️ 24/7 Customer Support'}</span>
                  </a>

                  {/* Sign out */}
                  <button
                    onClick={handleLogout}
                    className="w-full bg-rose-950/20 border border-rose-900/30 hover:bg-rose-900/10 text-rose-400 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <LogOut size={14} /> {t.logout}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* GAME ROUTERS VIEW (Back button + Active game component) */
          <div className="space-y-4">
            <button
              onClick={() => setActiveGame('Home')}
              className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-slate-100 transition-colors flex items-center gap-1.5"
            >
              {t.exitGame}
            </button>

            {activeGame === 'WinGo' && (
              <WinGoGame
                userBalance={user.balance}
                onUpdateBalance={(newBal) => setUser((p) => ({ ...p, balance: newBal }))}
                userMobile={user.mobile}
                onAddBetToHistory={(bet) => setAllBets((prev) => [bet, ...prev])}
                allBets={allBets}
                onSetAllBets={setAllBets}
                language={language}
                isAllowedToPlay={isAllowedToPlay}
              />
            )}

            {activeGame === 'Aviator' && (
              <AviatorGame
                userBalance={user.balance}
                onUpdateBalance={(newBal) => setUser((p) => ({ ...p, balance: newBal }))}
                userMobile={user.mobile}
                language={language}
                isAllowedToPlay={isAllowedToPlay}
              />
            )}

            {activeGame === 'Mines' && (
              <MinesGame
                userBalance={user.balance}
                onUpdateBalance={(newBal) => setUser((p) => ({ ...p, balance: newBal }))}
                language={language}
                isAllowedToPlay={isAllowedToPlay}
              />
            )}

            {activeGame === 'Casino' && (
              <CasinoGames
                userBalance={user.balance}
                onUpdateBalance={(newBal) => setUser((p) => ({ ...p, balance: newBal }))}
                language={language}
                isAllowedToPlay={isAllowedToPlay}
              />
            )}
          </div>
        )}
      </main>

      {/* Persistent Bottom Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-slate-950/95 border-t border-slate-900 flex justify-around items-center py-2.5 px-2 z-40 backdrop-blur-md">
        <button
          onClick={() => { setActiveTab('Home'); setActiveGame('Home'); }}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold tracking-wide transition-all ${
            activeTab === 'Home' && activeGame === 'Home' ? 'text-amber-400 scale-105' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Gamepad2 size={20} />
          <span>{language === 'Hindi' ? 'होम' : 'Home'}</span>
        </button>

        <button
          onClick={() => { setActiveTab('Promotion'); setActiveGame('Home'); }}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold tracking-wide transition-all ${
            activeTab === 'Promotion' && activeGame === 'Home' ? 'text-amber-400 scale-105' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Gift size={20} />
          <span>{language === 'Hindi' ? 'प्रमोशन' : 'Promotion'}</span>
        </button>

        {/* Center RAMU Logo */}
        <div 
          onClick={() => setShowAdminPasscodeModal(true)}
          className="flex flex-col items-center justify-center -mt-3 text-center px-1 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center border-2 border-slate-950 shadow-lg shadow-amber-500/25">
            <span className="text-[15px] font-extrabold text-slate-950 font-display">R</span>
          </div>
          <span className="text-[7px] text-slate-500 font-extrabold uppercase mt-1 tracking-wider">RAMU BHAI</span>
        </div>

        <button
          onClick={() => { setActiveTab('Wallet'); setActiveGame('Home'); }}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold tracking-wide transition-all ${
            activeTab === 'Wallet' && activeGame === 'Home' ? 'text-amber-400 scale-105' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Wallet size={20} />
          <span>{language === 'Hindi' ? 'वॉलेट' : 'Wallet'}</span>
        </button>

        <button
          onClick={() => { setActiveTab('Account'); setActiveGame('Home'); }}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold tracking-wide transition-all ${
            activeTab === 'Account' && activeGame === 'Home' ? 'text-amber-400 scale-105' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <UserIcon size={20} />
          <span>{language === 'Hindi' ? 'मेरा' : 'Profile'}</span>
        </button>
      </nav>

      {/* SECURE NUMERIC PASSCODE KEYPAD MODAL OVERLAY */}
      {showAdminPasscodeModal && (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xs bg-slate-900 border-2 border-amber-500/30 rounded-3xl p-5 shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Lock size={20} className="animate-pulse" />
            </div>
            
            <div>
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest">
                {language === 'Hindi' ? 'ओनर लॉगिन गेटवे' : 'Owner Secure Gateway'}
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">
                {language === 'Hindi' ? 'गोपनीय ओनर पासकोड दर्ज करें' : 'Enter confidential owner passcode'}
              </p>
            </div>

            {/* Display digits */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl py-3 px-2 flex justify-center items-center gap-1.5 h-12">
              {Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-3 h-3 rounded-full border transition-all duration-150 ${
                    enteredPasscode.length > i 
                      ? 'bg-amber-400 border-amber-400 scale-110 shadow-sm shadow-amber-400/50' 
                      : 'border-slate-800 bg-slate-900'
                  }`}
                />
              ))}
            </div>

            {passcodeError && (
              <p className="text-[10px] text-red-400 font-bold bg-red-950/20 py-1 px-2 rounded border border-red-900/30">
                {passcodeError}
              </p>
            )}

            {/* Virtual Keypad Grid */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    if (enteredPasscode.length < 8) {
                      setEnteredPasscode((prev) => prev + num);
                      setPasscodeError('');
                    }
                  }}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-100 font-extrabold text-base py-2.5 rounded-xl border border-slate-800/60 active:scale-95 transition-all"
                >
                  {num}
                </button>
              ))}
              
              {/* Clear button */}
              <button
                type="button"
                onClick={() => {
                  setEnteredPasscode('');
                  setPasscodeError('');
                }}
                className="bg-slate-950 hover:bg-slate-900 text-rose-400 font-bold text-xs py-2.5 rounded-xl border border-slate-850 active:scale-95 transition-all"
              >
                CLEAR
              </button>

              {/* 0 button */}
              <button
                type="button"
                onClick={() => {
                  if (enteredPasscode.length < 8) {
                    setEnteredPasscode((prev) => prev + '0');
                    setPasscodeError('');
                  }
                }}
                className="bg-slate-800 hover:bg-slate-750 text-slate-100 font-extrabold text-base py-2.5 rounded-xl border border-slate-800/60 active:scale-95 transition-all"
              >
                0
              </button>

              {/* Verify / Enter button */}
              <button
                type="button"
                onClick={handleVerifyPasscode}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs py-2.5 rounded-xl active:scale-95 transition-all shadow-md flex items-center justify-center"
              >
                ENTER
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAdminPasscodeModal(false);
                setEnteredPasscode('');
                setPasscodeError('');
              }}
              className="text-[10px] text-slate-500 hover:text-slate-300 font-semibold underline block mx-auto pt-1"
            >
              {language === 'Hindi' ? 'रद्द करें' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
