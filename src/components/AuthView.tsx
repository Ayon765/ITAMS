import React, { useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';
import { Lock, Mail, User, Shield, ArrowRight, KeyRound, Sparkles, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getRegisteredUsers, saveRegisteredUsers, subscribeToUsers } from '../userService';

interface AuthViewProps {
  onLogin: (user: UserAccount) => void;
}

export default function AuthView({ onLogin }: AuthViewProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  
  useEffect(() => {
    const unsub = subscribeToUsers(() => {});
    return () => unsub();
  }, []);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [personalCode, setPersonalCode] = useState('');
  const [role, setRole] = useState<UserRole>('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const VALID_PERSONAL_CODES = ['ADMIN123', 'SUPERADMIN456'];



  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both Email and Password.');
      return;
    }

    const users = getRegisteredUsers();
    const foundUser = users.find(
      u => u.email.trim().toLowerCase() === email.trim().toLowerCase() && u.password === password.trim() && !u.isTerminated
    );

    if (foundUser) {
      onLogin(foundUser);
    } else {
      setErrorMsg('Invalid email or password. Please try again.');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || !email.trim() || !password.trim() || !personalCode.trim()) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (role === 'Admin' || role === 'Super Admin') {
      if (!VALID_PERSONAL_CODES.includes(personalCode.trim())) {
        setErrorMsg('Invalid Personal Code for the selected role.');
        return;
      }
    }

    const users = getRegisteredUsers();
    if (users.some(u => u.email.trim().toLowerCase() === email.trim().toLowerCase())) {
      setErrorMsg('This email address is already registered. Please sign in instead.');
      return;
    }

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      role: role
    };

    const updatedUsers = [...users, newUser];
    saveRegisteredUsers(updatedUsers);

    setSuccessMsg('Account created successfully! Logging you in...');
    setTimeout(() => {
      onLogin(newUser);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex items-center justify-center p-4 selection:bg-[#00E599]/30 selection:text-emerald-950">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-teal-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-mono text-emerald-600 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>ENTERPRISE ASSET PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 uppercase font-sans">
            IT ASSET <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">MANAGEMENT SYSTEM</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1 font-mono">Hardware & Resource Tracking Suite</p>
        </div>

        {/* Card Box */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          {/* Tab toggles */}
          <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-xl mb-8 border border-zinc-200">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-2 text-xs font-mono font-bold rounded-lg transition-all hover:cursor-pointer ${
                !isSignUp ? 'bg-[#00E599] text-[#09090E] shadow-md' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-2 text-xs font-mono font-bold rounded-lg transition-all hover:cursor-pointer ${
                isSignUp ? 'bg-[#00E599] text-[#09090E] shadow-md' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              SIGN UP
            </button>
          </div>

          {/* Error / Success feedback */}
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {!isSignUp ? (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-700 mb-2 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#00E599] rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#00E599] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-700 mb-2 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#00E599] rounded-xl pl-10 pr-10 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#00E599] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 hover:cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#00E599] hover:bg-[#00c985] text-[#09090E] rounded-xl text-xs font-mono font-black tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-[#00E599]/30 transition-all hover:cursor-pointer"
              >
                <span>Access Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#00E599] rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#00E599] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#00E599] rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#00E599] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">Personal Code</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Enter your personal code"
                    value={personalCode}
                    onChange={(e) => setPersonalCode(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#00E599] rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#00E599] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">Create Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#00E599] rounded-xl pl-10 pr-10 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#00E599] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 hover:cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">Role & Privileges</label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-[#00E599] rounded-xl pl-10 pr-8 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#00E599] transition-all appearance-none hover:cursor-pointer"
                  >
                    <option value="Super Admin" className="text-zinc-900 bg-white">Super Admin (Full Root Access)</option>
                    <option value="Admin" className="text-zinc-900 bg-white">Admin (Approval & Ops Access)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#00E599] hover:bg-[#00c985] text-[#09090E] rounded-xl text-xs font-mono font-black tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-[#00E599]/30 transition-all hover:cursor-pointer mt-2"
              >
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}


        </div>

        {/* Footer legal */}
        <p className="text-[11px] text-center text-zinc-600 font-mono mt-6">
          Authorized personnel only. Sessions are encrypted & monitored.
        </p>
      </div>
    </div>
  );
}
