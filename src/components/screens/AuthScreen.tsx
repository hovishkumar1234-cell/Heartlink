import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  Mail,
  User,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  MessageSquare,
  ChevronDown,
  RotateCcw,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { RelationshipGoal, Gender, LookingFor } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

interface CountryCode {
  code: string;
  country: string;
  flag: string;
  dial: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: 'US', country: 'United States / Canada', flag: '🇺🇸', dial: '+1' },
  { code: 'GB', country: 'United Kingdom', flag: '🇬🇧', dial: '+44' },
  { code: 'IN', country: 'India', flag: '🇮🇳', dial: '+91' },
  { code: 'AU', country: 'Australia', flag: '🇦🇺', dial: '+61' },
  { code: 'DE', country: 'Germany', flag: '🇩🇪', dial: '+49' },
  { code: 'FR', country: 'France', flag: '🇫🇷', dial: '+33' },
  { code: 'JP', country: 'Japan', flag: '🇯🇵', dial: '+81' },
  { code: 'SG', country: 'Singapore', flag: '🇸🇬', dial: '+65' },
  { code: 'BR', country: 'Brazil', flag: '🇧🇷', dial: '+55' },
  { code: 'MX', country: 'Mexico', flag: '🇲🇽', dial: '+52' },
];

export const AuthScreen: React.FC = () => {
  const { login, signup, users, showToast } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');

  // Phone Login State
  const [phoneStep, setPhoneStep] = useState<'enter_phone' | 'enter_otp'>('enter_phone');
  const [selectedDial, setSelectedDial] = useState('+1');
  const [rawPhoneNumber, setRawPhoneNumber] = useState('5552345678'); // Pre-filled with Maya's test line
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [simulatedSmsBanner, setSimulatedSmsBanner] = useState<string | null>(null);

  // Email Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sign Up Form State
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupBirthDate, setSignupBirthDate] = useState('2000-01-01');
  const [signupGender, setSignupGender] = useState<Gender>('woman');
  const [signupLookingFor, setSignupLookingFor] = useState<LookingFor>('men');
  const [signupGoal, setSignupGoal] = useState<RelationshipGoal>('long-term');
  const [signupOccupation, setSignupOccupation] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Calculate age helper
  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    const today = new Date('2026-10-20');
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const currentAgeCalculated = calculateAge(signupBirthDate);

  // Countdown timer for resend code
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Clean format phone helper: digits only
  const cleanPhone = (val: string) => val.replace(/\D/g, '');

  // Step 1: Send OTP to Mobile Number
  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);

    const digits = cleanPhone(rawPhoneNumber);
    if (digits.length < 7) {
      setLoginError('Please enter a valid mobile number.');
      return;
    }

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setPhoneStep('enter_otp');
    setResendTimer(30);
    setOtpDigits(['', '', '', '', '', '']);

    triggerHaptic('medium');

    // Simulate instant incoming SMS notification
    const fullPhone = `${selectedDial} ${rawPhoneNumber}`;
    const smsText = `HeartLink verification code: ${code}. Valid for 10 minutes.`;
    setSimulatedSmsBanner(smsText);
    showToast(`SMS sent to ${fullPhone}! Code: ${code}`, 'success');

    // Auto focus first OTP input
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 150);
  };

  // Handle single OTP digit input with auto-advance
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = digit;
    setOtpDigits(nextDigits);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // If all digits entered, automatically verify
    if (digit && index === 5 && nextDigits.every((d) => d.length === 1)) {
      verifyAndLogin(nextDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify Code and Log In
  const verifyAndLogin = (enteredCode: string) => {
    if (enteredCode !== generatedOtp) {
      setLoginError('Incorrect code. Please double-check the 6-digit SMS code.');
      triggerHaptic('warning');
      return;
    }

    // Match phone number with existing registered profile or default to Maya Patel
    const cleanCurrent = cleanPhone(rawPhoneNumber);
    const foundUser = users.find(
      (u) => u.phoneNumber && cleanPhone(u.phoneNumber) === cleanCurrent
    );

    triggerHaptic('light');

    if (foundUser) {
      if (foundUser.age < 18) {
        setLoginError('Access denied: Age restriction in effect. Must be 18 or older to log in.');
        return;
      }
      login(foundUser.id);
    } else {
      login('user_maya');
    }
  };

  const handleAutoFillCode = () => {
    if (!generatedOtp) return;
    const split = generatedOtp.split('');
    setOtpDigits(split);
    verifyAndLogin(generatedOtp);
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const target = users.find(
      (u) =>
        u.name.toLowerCase().includes(loginEmail.toLowerCase()) ||
        u.id.toLowerCase() === loginEmail.toLowerCase()
    );

    if (target) {
      if (target.age < 18) {
        setLoginError('Access denied: Age restriction in effect. Must be 18 or older to log in.');
        return;
      }
      login(target.id);
    } else {
      login('user_maya');
    }
  };

  // Fast Test Profile Click
  const handleSelectDemoProfile = (userId: string, demoPhone: string) => {
    setRawPhoneNumber(demoPhone);
    setLoginError(null);
    login(userId);
  };

  // Sign Up with Phone & Age Validation
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!signupName.trim()) {
      setSignupError('Please provide your name.');
      return;
    }

    const age = calculateAge(signupBirthDate);

    // Strict Age Validation: Under 10 & Under 18
    if (age < 10) {
      setSignupError('Strictly prohibited: HeartLink is unavailable for anyone under the age of 10.');
      return;
    }

    if (age < 18) {
      setSignupError('HeartLink is an 18+ dating service. You must be at least 18 years old to join.');
      return;
    }

    const result = signup({
      name: signupName,
      phoneNumber: `${selectedDial} ${signupPhone}`,
      birthDate: signupBirthDate,
      age,
      gender: signupGender,
      lookingFor: signupLookingFor,
      relationshipGoal: signupGoal,
      occupation: signupOccupation || 'Creative Professional',
    });

    if (!result.success) {
      setSignupError(result.error || 'Unable to complete registration.');
    }
  };

  return (
    <div className="min-h-[85vh] py-6 px-4 max-w-md mx-auto flex flex-col justify-center bg-[#F8F9FA] text-[#2D3436]">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D3436] tracking-tight">
          {mode === 'signin' ? 'Welcome to HeartLink' : 'Create Your Profile'}
        </h1>
        <p className="text-xs text-[#636E72] mt-1">
          {mode === 'signin'
            ? 'Sign in securely with your mobile phone number'
            : 'Join a verified community built on genuine intent & safety'}
        </p>
      </div>

      {/* Main Tabs (Sign In vs Create Account) */}
      <div className="flex bg-[#E9ECEF]/70 p-1 rounded-2xl mb-6">
        <button
          onClick={() => {
            setMode('signin');
            setLoginError(null);
            setSignupError(null);
            setPhoneStep('enter_phone');
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            mode === 'signin' ? 'bg-[#6C5CE7] text-white shadow-sm' : 'text-[#636E72] hover:text-[#2D3436]'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setMode('signup');
            setLoginError(null);
            setSignupError(null);
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            mode === 'signup' ? 'bg-[#6C5CE7] text-white shadow-sm' : 'text-[#636E72] hover:text-[#2D3436]'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Sign In Window */}
      {mode === 'signin' && (
        <div className="bg-white border border-[#E9ECEF] rounded-3xl p-5 shadow-[0_8px_30px_rgba(108,92,231,0.08)] space-y-4">
          {/* Method Selector: Phone (Default) vs Email */}
          <div className="flex items-center justify-center gap-6 pb-2 border-b border-[#E9ECEF] text-xs font-semibold">
            <button
              onClick={() => {
                setLoginMethod('phone');
                setLoginError(null);
              }}
              className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all ${
                loginMethod === 'phone'
                  ? 'border-[#6C5CE7] text-[#6C5CE7]'
                  : 'border-transparent text-[#636E72] hover:text-[#2D3436]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Number</span>
            </button>

            <button
              onClick={() => {
                setLoginMethod('email');
                setLoginError(null);
              }}
              className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all ${
                loginMethod === 'email'
                  ? 'border-[#6C5CE7] text-[#6C5CE7]'
                  : 'border-transparent text-[#636E72] hover:text-[#2D3436]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Address</span>
            </button>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-600 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Simulated SMS Notification Banner */}
          {simulatedSmsBanner && phoneStep === 'enter_otp' && (
            <div className="p-3 rounded-2xl bg-[#00B894]/10 border border-[#00B894]/30 text-xs text-[#2D3436] shadow-sm flex items-start gap-2.5 animate-in slide-in-from-top-2">
              <MessageSquare className="w-4 h-4 text-[#00B894] shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-[#00B894] block text-[10px] uppercase tracking-wider">
                  SMS Message Received
                </span>
                <p className="text-[#2D3436] font-medium mt-0.5">{simulatedSmsBanner}</p>
              </div>
            </div>
          )}

          {/* Phone Sign-In: Step 1 Enter Mobile Number */}
          {loginMethod === 'phone' && phoneStep === 'enter_phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#2D3436] mb-1.5">
                  Mobile Phone Number
                </label>
                <div className="flex gap-2">
                  {/* Country Dial Picker */}
                  <div className="relative w-28 shrink-0">
                    <select
                      value={selectedDial}
                      onChange={(e) => setSelectedDial(e.target.value)}
                      className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-2.5 py-2.5 text-xs text-[#2D3436] appearance-none focus:outline-none focus:border-[#6C5CE7] cursor-pointer"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.dial} className="bg-white text-[#2D3436]">
                          {c.flag} {c.dial} ({c.code})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#636E72] absolute right-2.5 top-3.5 pointer-events-none" />
                  </div>

                  {/* Phone Input */}
                  <div className="relative flex-1">
                    <Smartphone className="w-4 h-4 text-[#636E72] absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={rawPhoneNumber}
                      onChange={(e) => setRawPhoneNumber(e.target.value)}
                      placeholder="e.g. 555 234 5678"
                      className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#2D3436] placeholder-[#636E72] focus:outline-none focus:border-[#6C5CE7] transition-colors"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-[#636E72] mt-1.5">
                  We will send a 6-digit SMS verification code to verify your account.
                </p>
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#6C5CE7] hover:bg-[#5A49DF] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(108,92,231,0.25)] active:scale-[0.98] transition-all"
              >
                <span>Send Verification Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Phone Sign-In: Step 2 Enter 6-digit OTP */}
          {loginMethod === 'phone' && phoneStep === 'enter_otp' && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-xs text-[#636E72]">
                  Enter the 6-digit code sent to{' '}
                  <span className="text-[#2D3436] font-semibold">
                    {selectedDial} {rawPhoneNumber}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setPhoneStep('enter_phone')}
                  className="text-xs text-[#6C5CE7] block mx-auto mt-1 hover:underline font-semibold"
                >
                  Edit phone number
                </button>
              </div>

              {/* 6 Digit Inputs */}
              <div className="flex justify-between gap-1.5 my-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-13 text-center bg-[#F8F9FA] border border-[#E9ECEF] focus:border-[#6C5CE7] focus:ring-2 focus:ring-[#6C5CE7]/20 rounded-xl text-lg font-bold text-[#2D3436] focus:outline-none transition-all tabular-nums shadow-sm"
                  />
                ))}
              </div>

              {/* Fast Auto-fill button */}
              {generatedOtp && (
                <button
                  type="button"
                  onClick={handleAutoFillCode}
                  className="w-full py-2 rounded-xl bg-[#6C5CE7]/10 hover:bg-[#6C5CE7]/20 border border-[#6C5CE7]/30 text-xs text-[#6C5CE7] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FD79A8]" />
                  <span>One-Tap Auto-fill Code ({generatedOtp})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => verifyAndLogin(otpDigits.join(''))}
                className="w-full h-12 rounded-xl bg-[#6C5CE7] hover:bg-[#5A49DF] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(108,92,231,0.25)] active:scale-[0.98] transition-all"
              >
                <KeyRound className="w-4 h-4" />
                <span>Verify & Sign In</span>
              </button>

              {/* Resend Code Link */}
              <div className="text-center pt-1">
                {resendTimer > 0 ? (
                  <span className="text-xs text-[#636E72]">
                    Resend code in <span className="tabular-nums font-semibold text-[#2D3436]">{resendTimer}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-xs font-semibold text-[#6C5CE7] hover:underline"
                  >
                    Resend SMS Code
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Email Login Alternative */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#2D3436] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#636E72] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="maya@example.com (or leave blank for demo)"
                    className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2D3436] placeholder-[#636E72] focus:outline-none focus:border-[#6C5CE7] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2D3436] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#636E72] absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2D3436] placeholder-[#636E72] focus:outline-none focus:border-[#6C5CE7] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#6C5CE7] hover:bg-[#5A49DF] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(108,92,231,0.25)] active:scale-[0.98] transition-all"
              >
                <span>Log In with Email</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick 1-Click Mobile Test Accounts */}
          <div className="pt-4 border-t border-[#E9ECEF] mt-6">
            <p className="text-[11px] font-semibold text-[#636E72] uppercase tracking-wider mb-2.5 text-center">
              Quick Test Sign-In Profiles
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectDemoProfile('user_maya', '5552345678')}
                className="p-2.5 rounded-xl bg-[#F8F9FA] hover:bg-[#E9ECEF] border border-[#E9ECEF] text-left transition-all group"
              >
                <div className="text-xs font-bold text-[#2D3436] group-hover:text-[#6C5CE7] flex items-center justify-between">
                  <span>Maya Patel</span>
                  <span className="text-[#00B894] text-[10px] font-bold">✓</span>
                </div>
                <div className="text-[10px] text-[#636E72] font-mono">+1 (555) 234-5678</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemoProfile('user_leo', '5558765432')}
                className="p-2.5 rounded-xl bg-[#F8F9FA] hover:bg-[#E9ECEF] border border-[#E9ECEF] text-left transition-all group"
              >
                <div className="text-xs font-bold text-[#2D3436] group-hover:text-[#6C5CE7] flex items-center justify-between">
                  <span>Leo Vance</span>
                  <span className="text-[#FD79A8] text-[10px]">★</span>
                </div>
                <div className="text-[10px] text-[#636E72] font-mono">+1 (555) 876-5432</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemoProfile('user_elena', '5554321098')}
                className="p-2.5 rounded-xl bg-[#F8F9FA] hover:bg-[#E9ECEF] border border-[#E9ECEF] text-left transition-all group"
              >
                <div className="text-xs font-bold text-[#2D3436] group-hover:text-[#6C5CE7] flex items-center justify-between">
                  <span>Elena Rostova</span>
                  <span className="text-[#00B894] text-[10px] font-bold">✓</span>
                </div>
                <div className="text-[10px] text-[#636E72] font-mono">+1 (555) 432-1098</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemoProfile('user_admin', '5559990000')}
                className="p-2.5 rounded-xl bg-[#6C5CE7]/10 hover:bg-[#6C5CE7]/20 border border-[#6C5CE7]/30 text-left transition-all group"
              >
                <div className="text-xs font-bold text-[#6C5CE7] flex items-center justify-between">
                  <span>Admin Officer</span>
                  <span className="text-[10px]">🛡️</span>
                </div>
                <div className="text-[10px] text-[#636E72] font-mono">+1 (555) 999-0000</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Up Window */}
      {mode === 'signup' && (
        <form onSubmit={handleSignUp} className="bg-white border border-[#E9ECEF] rounded-3xl p-5 shadow-[0_8px_30px_rgba(108,92,231,0.08)] space-y-4">
          {signupError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-600 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{signupError}</span>
            </div>
          )}

          {/* Age restriction badge */}
          <div className="p-2.5 rounded-xl bg-[#00B894]/10 border border-[#00B894]/25 flex items-center gap-2 text-xs text-[#00B894] font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Age check: Minimum age 18. Anyone below 10 or under 18 is strictly blocked.</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2D3436] mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#636E72] absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="e.g. Jordan River"
                className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2D3436] placeholder-[#636E72] focus:outline-none focus:border-[#6C5CE7] transition-colors"
              />
            </div>
          </div>

          {/* Mobile Number Field */}
          <div>
            <label className="block text-xs font-medium text-[#2D3436] mb-1.5">Mobile Phone Number</label>
            <div className="flex gap-2">
              <div className="relative w-24 shrink-0">
                <select
                  value={selectedDial}
                  onChange={(e) => setSelectedDial(e.target.value)}
                  className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-2 py-2.5 text-xs text-[#2D3436] appearance-none focus:outline-none focus:border-[#6C5CE7]"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.dial} className="bg-white text-[#2D3436]">
                      {c.flag} {c.dial}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#636E72] absolute right-2 top-3.5 pointer-events-none" />
              </div>
              <input
                type="tel"
                value={signupPhone}
                onChange={(e) => setSignupPhone(e.target.value)}
                placeholder="555-019-2834"
                className="flex-1 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-2.5 text-sm text-[#2D3436] placeholder-[#636E72] focus:outline-none focus:border-[#6C5CE7]"
              />
            </div>
          </div>

          {/* Date of Birth with live calculated age */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#2D3436]">Date of Birth</label>
              <span
                className={`text-[11px] font-bold ${
                  currentAgeCalculated >= 18 ? 'text-[#00B894]' : 'text-red-500'
                }`}
              >
                Age: {currentAgeCalculated}{' '}
                {currentAgeCalculated < 18 ? '(Underage - restricted)' : '(Eligible)'}
              </span>
            </div>
            <input
              type="date"
              required
              value={signupBirthDate}
              onChange={(e) => setSignupBirthDate(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-4 py-2.5 text-sm text-[#2D3436] focus:outline-none focus:border-[#6C5CE7] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#2D3436] mb-1.5">I am a</label>
              <select
                value={signupGender}
                onChange={(e) => setSignupGender(e.target.value as Gender)}
                className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-2.5 text-sm text-[#2D3436] focus:outline-none focus:border-[#6C5CE7]"
              >
                <option value="woman">Woman</option>
                <option value="man">Man</option>
                <option value="non-binary">Non-Binary</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#2D3436] mb-1.5">Interested in</label>
              <select
                value={signupLookingFor}
                onChange={(e) => setSignupLookingFor(e.target.value as LookingFor)}
                className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-2.5 text-sm text-[#2D3436] focus:outline-none focus:border-[#6C5CE7]"
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="everyone">Everyone</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2D3436] mb-1.5">Relationship Goal</label>
            <select
              value={signupGoal}
              onChange={(e) => setSignupGoal(e.target.value as RelationshipGoal)}
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-2.5 text-sm text-[#2D3436] focus:outline-none focus:border-[#6C5CE7]"
            >
              <option value="long-term">Long-Term Relationship</option>
              <option value="marriage">Marriage & Life Partner</option>
              <option value="serious">Serious Dating with Intent</option>
              <option value="casual">Casual Dating</option>
              <option value="friends">New Friends & Exploring</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2D3436] mb-1.5">Occupation</label>
            <input
              type="text"
              value={signupOccupation}
              onChange={(e) => setSignupOccupation(e.target.value)}
              placeholder="e.g. Environmental Engineer"
              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-4 py-2.5 text-sm text-[#2D3436] placeholder-[#636E72] focus:outline-none focus:border-[#6C5CE7]"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#6C5CE7] hover:bg-[#5A49DF] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(108,92,231,0.25)] active:scale-[0.98] transition-all mt-4"
          >
            <span>Proceed to Photo Upload</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
