import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Shield, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  LockKeyhole, 
  Check, 
  Bell
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface UserAccount {
  name: string;
  email: string;
  role: 'user' | 'admin';
  password?: string;
}

interface LoginPageProps {
  onLoginSuccess: (user: UserAccount, rememberMe: boolean) => void;
  initialTab?: 'login' | 'signup';
  onBackToLanding?: () => void;
}

export function LoginPage({ onLoginSuccess, initialTab = 'login', onBackToLanding }: LoginPageProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  // Sign Up Form States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const signupRole = 'user';

  // Interactive States
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Lockout Protection States
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0); // in seconds

  // Password Strength State
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: 'bg-slate-200'
  });

  // Check lockout on mount and update countdown
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  // Check password strength dynamically
  useEffect(() => {
    if (!signupPassword) {
      setPasswordStrength({ score: 0, label: '', color: 'bg-slate-200' });
      return;
    }

    let score = 0;
    if (signupPassword.length >= 6) score += 1;
    if (signupPassword.length >= 10) score += 1;
    if (/[A-Z]/.test(signupPassword)) score += 1;
    if (/[0-9]/.test(signupPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(signupPassword)) score += 1;

    let label = 'Weak';
    let color = 'bg-rose-500';

    if (score >= 4) {
      label = 'Strong';
      color = 'bg-emerald-500';
    } else if (score >= 2) {
      label = 'Medium';
      color = 'bg-amber-500';
    }

    setPasswordStrength({ score, label, color });
  }, [signupPassword]);

  // Google Login Popup listener to process ID Token with simulated Node verification
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data && event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        const idToken = event.data.token;
        const isMock = event.data.isMock;
        
        toast({
          title: 'Google Sign-In',
          description: isMock ? 'Received sandbox credentials.' : 'Received Google ID token.',
        });
        
        const hasSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
        if (hasSupabase && !isMock) {
          try {
            toast({
              title: 'Authenticating',
              description: 'Verifying Google credentials with cloud server...',
            });
            const { data, error: sbError } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: idToken,
            });
            if (sbError) throw sbError;
            
            if (data?.user) {
              const metaRole = data.user.user_metadata?.role || 'user';
              setGoogleLoading(false);
              onLoginSuccess({
                name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Google User',
                email: data.user.email || '',
                role: metaRole,
              }, rememberMe);
              return;
            }
          } catch (err: any) {
            console.error('Supabase Google auth error:', err);
            setError(`Google login failed on server: ${err.message}`);
            setGoogleLoading(false);
            return;
          }
        }

        // If not running Supabase or if it's a mock token, decode locally
        try {
          const parts = idToken.split('.');
          const payload = JSON.parse(atob(parts[1]));
          
          if (isMock) {
            toast({
              title: 'Sandbox Auth',
              description: 'Verifying simulated credentials locally...',
            });
            await new Promise((resolve) => setTimeout(resolve, 600));
          } else {
            toast({
              title: 'Local Verification',
              description: 'Decoding token for local database auth...',
            });
          }

          // Double-check: Make sure the user is registered in the local database!
          const users = getRegisteredUsers();
          const exists = users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());
          let userRole: 'user' | 'admin' = payload.role || 'user';
          let userName: string = payload.name || 'Google User';
          
          if (!exists) {
            const newUser: UserAccount = {
              name: userName,
              email: payload.email,
              role: userRole,
              password: 'google_oauth_bypass_' + Math.random().toString(36).substring(2, 8),
            };
            users.push(newUser);
            localStorage.setItem('fintech_registered_users', JSON.stringify(users));
          } else {
            userRole = exists.role;
            userName = exists.name;
          }

          setGoogleLoading(false);
          onLoginSuccess({
            name: userName,
            email: payload.email,
            role: userRole
          }, rememberMe);
        } catch (e) {
          console.error(e);
          setGoogleLoading(false);
          setError('Google Login Verification Failed.');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLoginSuccess, rememberMe, toast]);

  // Helper: Retrieve registered users locally
  const getRegisteredUsers = (): UserAccount[] => {
    const stored = localStorage.getItem('fintech_registered_users');
    if (!stored) {
      const defaults: UserAccount[] = [
        { name: 'Demo User', email: 'user@vaultpay.in', role: 'user', password: 'password123' },
        { name: 'Demo Admin', email: 'admin@vaultpay.in', role: 'admin', password: 'password123' }
      ];
      localStorage.setItem('fintech_registered_users', JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(stored);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTime > 0) {
      setError(`Too many failed attempts. Try again in ${lockoutTime}s.`);
      return;
    }

    if (!loginEmail || !loginPassword) {
      setError('Please enter your email and password.');
      return;
    }

    setError('');
    setLoading(true);

    // 1. Supabase Auth Check
    const hasSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
    if (hasSupabase && !loginEmail.endsWith('@vaultpay.in')) {
      try {
        const { data, error: sbError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        });

        if (sbError) throw sbError;

        if (data?.user) {
          setLoading(false);
          const metaRole = data.user.user_metadata?.role || 'user';
          onLoginSuccess({
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || loginEmail,
            role: metaRole,
          }, rememberMe);
          return;
        }
      } catch (err: any) {
        console.warn('Supabase auth failed, trying local fallback...', err.message);
      }
    }

    // 2. Local fallback mock authentication
    setTimeout(() => {
      const users = getRegisteredUsers();
      const match = users.find(
        (u) => u.email.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword
      );

      setLoading(false);
      if (match) {
        setFailedAttempts(0);
        onLoginSuccess({ name: match.name, email: match.email, role: match.role }, rememberMe);
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        if (newAttempts >= 5) {
          setLockoutTime(30);
          setError('Too many failed attempts. Account locked for 30 seconds.');
          toast({
            title: 'Security Alert',
            description: 'Login form locked due to multiple failed attempts.',
            variant: 'destructive',
          });
        } else {
          setError(`Invalid email or password. Attempt ${newAttempts} of 5.`);
        }
      }
    }, 1000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(signupEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setLoading(true);

    // 1. Supabase Signup Attempt
    const hasSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
    if (hasSupabase && !signupEmail.endsWith('@vaultpay.in')) {
      try {
        const { data, error: sbError } = await supabase.auth.signUp({
          email: signupEmail,
          password: signupPassword,
          options: {
            data: {
              name: signupName,
              role: signupRole,
            }
          }
        });

        if (sbError) throw sbError;

        if (data?.user) {
          setLoading(false);
          setSuccess('Account registered successfully via cloud server! Check your email or login.');
          toast({
            title: 'Registration Successful',
            description: 'Cloud account created successfully.',
          });
          setTimeout(() => {
            setActiveTab('login');
            setLoginEmail(signupEmail);
            setSuccess('');
          }, 1500);
          return;
        }
      } catch (err: any) {
        console.warn('Supabase signup failed, trying local fallback...', err.message);
      }
    }

    // 2. Local Fallback Signup
    setTimeout(() => {
      const users = getRegisteredUsers();
      const exists = users.some((u) => u.email.toLowerCase() === signupEmail.toLowerCase());

      if (exists) {
        setLoading(false);
        setError('An account with this email already exists.');
        return;
      }

      const newUser: UserAccount = {
        name: signupName,
        email: signupEmail,
        role: signupRole,
        password: signupPassword,
      };

      users.push(newUser);
      localStorage.setItem('fintech_registered_users', JSON.stringify(users));

      setLoading(false);
      setSuccess('Account created successfully! You can now log in.');
      toast({
        title: 'Account Created',
        description: 'New account registered locally.',
      });

      // Capture email before clearing fields
      const registeredEmail = signupEmail;

      // Clear signup fields
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');

      setTimeout(() => {
        setActiveTab('login');
        setLoginEmail(registeredEmail);
        setSuccess('');
      }, 1500);
    }, 1200);
  };

  const handleGoogleLogin = () => {
    setError('');
    setGoogleLoading(true);

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

    // Step 1: Open Google Login Popup
    const width = 480;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      `/google-auth.html?client_id=${encodeURIComponent(googleClientId)}`,
      'GoogleAuth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=no,resizable=no`
    );

    // If popup was blocked, fall back gracefully
    if (!popup) {
      setGoogleLoading(false);
      setError('Popup blocked. Please allow popups for this site and try again.');
      return;
    }

    toast({
      title: 'Google Sign-In',
      description: 'Google login popup opened — please sign in...',
    });

    // Monitor popup close without completing auth
    const pollTimer = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollTimer);
        // If still loading, user closed popup without completing
        setGoogleLoading(false);
      }
    }, 500);
  };


  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      toast({
        title: 'Email Required',
        description: 'Please type your email address above so we can send reset instructions.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Instructions Sent',
      description: `A secure password reset link has been dispatched to ${loginEmail}.`,
    });
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8FF] via-[#F6F2FF] to-[#FAF8FF] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden select-none">
      {/* Soft background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-200/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-200/20 blur-[100px] pointer-events-none" />

      {/* Main split container */}
      <div className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(124,58,237,0.06)] border border-purple-100/80 bg-white grid grid-cols-1 lg:grid-cols-12 min-h-[640px] z-10">
        
        {/* LEFT PANEL: Logo, Header and Dynamic login form */}
        <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-between relative bg-white">
          
          {/* Brand header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center shadow-md shadow-[#7C3AED]/20 border border-[#9F67FF]/20">
                <Wallet className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-extrabold text-slate-800 text-lg tracking-tight">VaultPay</span>
            </div>
            {onBackToLanding && (
              <button 
                type="button"
                onClick={onBackToLanding}
                className="text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1 transition-colors"
              >
                ← Back to Home
              </button>
            )}
          </div>

          {/* Form wrapper */}
          <div className="my-8 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <div className="mb-6">
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                {activeTab === 'login' ? 'Login' : 'Register'}
              </h1>
              <p className="text-slate-400 text-xs font-semibold mt-2.5 leading-relaxed">
                {activeTab === 'login' 
                  ? 'Effortless and encrypted access to your funds. Wherever you are, whenever you need it.'
                  : 'Establish a cryptographically guarded digital vault today. Fast setup, secure forever.'}
              </p>
            </div>

            {/* Error or Success banners */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-2 mb-4">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-bold flex items-center gap-2 mb-4 animate-fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>{success}</span>
              </div>
            )}

            {/* Google Sign-in button */}
            {activeTab === 'login' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading || lockoutTime > 0}
                  className="w-full flex items-center justify-center gap-3 py-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 font-bold text-slate-600 text-sm shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {googleLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Sign in with Google</span>
                </button>

                {/* OR divider */}
                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-slate-200" />
                  <span className="px-3 text-xs font-bold text-slate-400">or</span>
                  <div className="flex-1 border-t border-slate-200" />
                </div>
              </>
            )}

            {/* Custom Interactive Form */}
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        disabled={lockoutTime > 0}
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="youremail@gmail.com"
                        className="login-page-input w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all font-medium disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        disabled={lockoutTime > 0}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Type your password here"
                        className="login-page-input w-full pl-11 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all font-medium disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-500 font-bold">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED] cursor-pointer"
                      />
                      <span>Remember me</span>
                    </label>
                    <a
                      href="#forgot"
                      onClick={handleForgotPassword}
                      className="text-[#7C3AED] hover:text-[#6D28D9] font-bold transition-colors"
                    >
                      Forgot password
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || lockoutTime > 0}
                    className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-slate-300 disabled:shadow-none text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#7C3AED]/15 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-5 text-sm"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : lockoutTime > 0 ? (
                      'Locked'
                    ) : (
                      'Login'
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignup}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="your full name"
                        className="login-page-input w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="youremail@gmail.com"
                        className="login-page-input w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider">
                        Password
                      </label>
                      {passwordStrength.label && (
                        <span className="text-[10px] font-black text-slate-400">
                          Strength: <span className={
                            passwordStrength.label === 'Strong' ? 'text-emerald-500' :
                            passwordStrength.label === 'Medium' ? 'text-amber-500' : 'text-rose-500'
                          }>{passwordStrength.label}</span>
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="minimum 6 characters"
                        className="login-page-input w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all font-medium"
                      />
                    </div>
                    
                    {/* Password strength visual indicator */}
                    {signupPassword && (
                      <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden flex">
                        <div 
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>


                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#7C3AED]/50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#7C3AED]/15 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-5 text-sm"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Register'
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Mode Switcher */}
          <div className="text-center text-xs font-semibold text-slate-400">
            {activeTab === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-[#7C3AED] hover:text-[#6D28D9] font-extrabold cursor-pointer transition-colors focus:outline-none"
                >
                  Register
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-[#7C3AED] hover:text-[#6D28D9] font-extrabold cursor-pointer transition-colors focus:outline-none"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Sleek interactive mockup with customized colors matching website */}
        <div className="lg:col-span-6 bg-[#FAF9FF] border-t lg:border-t-0 lg:border-l border-purple-100/50 p-8 md:p-12 flex flex-col justify-between items-center relative overflow-hidden">
          {/* Subtle grid pattern inside right panel */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#EBE5FC_1px,transparent_1px),linear-gradient(to_bottom,#EBE5FC_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-30 pointer-events-none" />
          <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-purple-200/10 blur-[80px] pointer-events-none" />

          {/* Centralized text headers */}
          <div className="text-center relative z-10 w-full mb-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block mb-1">
              Your Money, Encrypted
            </span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
              Secure. Private. Always Yours
            </h2>
          </div>

          {/* Fully Interactive Mobile mockup frame */}
          <div className="relative w-56 h-[330px] flex items-center justify-center mt-3 mb-5 z-10 select-none">
            {/* Phone container shadow */}
            <div className="absolute bottom-[-10px] w-48 h-3.5 bg-purple-900/10 blur-md rounded-full pointer-events-none" />
            
            {/* Device wireframe */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full bg-white border-[3px] border-purple-100 rounded-[28px] p-2.5 shadow-[0_24px_50px_rgba(124,58,237,0.06)] flex flex-col relative overflow-hidden backdrop-blur-sm"
            >
              {/* Speaker mesh & Camera bezel */}
              <div className="w-16 h-3 bg-purple-50 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-6 h-0.5 bg-purple-200 rounded-full" />
              </div>

              {/* Live phone display */}
              <div className="flex-1 bg-gradient-to-b from-[#FAF9FF] to-white rounded-[18px] p-2.5 flex flex-col justify-between overflow-hidden border border-purple-100/40 relative">
                
                {/* Internal UI top row */}
                <div className="flex items-center justify-between pb-1.5 border-b border-purple-100/40">
                  <div className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Balance
                  </div>
                  <div className="w-4 h-4 rounded-full bg-[#7C3AED]/10 flex items-center justify-center cursor-pointer hover:bg-[#7C3AED]/20 transition-all">
                    <Bell className="h-2.5 w-2.5 text-[#7C3AED]" />
                  </div>
                </div>

                {/* Big balance display */}
                <div className="my-1">
                  <div className="text-sm font-black text-slate-800 tracking-tight">
                    $50,000.70
                  </div>
                </div>

                {/* Responsive SVG Bar Chart */}
                <div className="flex items-end justify-between h-16 pt-3 pb-1">
                  {[
                    { month: 'Jan', val: 35 },
                    { month: 'Feb', val: 65 },
                    { month: 'Mar', val: 50 },
                    { month: 'Apr', val: 90 },
                    { month: 'May', val: 75 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-2.5 bg-slate-100 rounded-full h-11 flex items-end overflow-hidden">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${item.val}%` }}
                          transition={{ duration: 1.2, delay: idx * 0.1, ease: 'easeOut' }}
                          className="w-full bg-gradient-to-t from-[#7C3AED] via-[#9F67FF] to-[#06B6D4] rounded-full"
                        />
                      </div>
                      <span className="text-[6.5px] font-extrabold text-slate-400">{item.month}</span>
                    </div>
                  ))}
                </div>

                {/* Circle gauge grid */}
                <div className="flex items-center justify-between gap-1.5 my-1.5 border-t border-purple-100/40 pt-1.5">
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="16" cy="16" r="12" stroke="#F3E8FF" strokeWidth="2.5" fill="transparent" />
                      <circle cx="16" cy="16" r="12" stroke="#7C3AED" strokeWidth="2.5" fill="transparent" strokeDasharray="75" strokeDashoffset="26" strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-[7px] font-black text-slate-800">35%</span>
                  </div>
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="16" cy="16" r="12" stroke="#F3E8FF" strokeWidth="2.5" fill="transparent" />
                      <circle cx="16" cy="16" r="12" stroke="#06B6D4" strokeWidth="2.5" fill="transparent" strokeDasharray="75" strokeDashoffset="34" strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-[7px] font-black text-slate-800">45%</span>
                  </div>
                </div>

                {/* Lock brand identifier footer */}
                <div className="flex flex-col items-center justify-center pt-1 border-t border-purple-100/40 gap-0.5">
                  <LockKeyhole className="h-3 w-3 text-[#7C3AED]" />
                  <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest">
                    Encrypted & Protected
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Left float badge: payment received */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-12 top-20 bg-slate-900 text-white rounded-full py-1 px-2.5 shadow-lg flex items-center gap-1.5 border border-slate-800/80 z-20"
            >
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[8px] font-bold">✓</div>
              <div className="text-left leading-none">
                <div className="text-[5px] text-slate-400 font-extrabold uppercase tracking-wider">Payment Received</div>
                <div className="text-[8px] font-black mt-0.5">$34,000.57</div>
              </div>
            </motion.div>

            {/* Right float badge: payment transferred */}
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-8 bottom-12 bg-white border border-purple-100 rounded-2xl p-2 shadow-lg flex flex-col items-center gap-0.5 z-20 w-[100px]"
            >
              <div className="w-5 h-5 rounded-full bg-[#FAF9FF] flex items-center justify-center">
                <Check className="h-3 w-3 text-[#7C3AED]" />
              </div>
              <div className="text-center leading-none mt-0.5">
                <div className="text-[5.5px] text-slate-400 font-extrabold uppercase tracking-wide">Transferred</div>
                <div className="text-[5.5px] text-[#7C3AED] font-extrabold uppercase tracking-wide">Successfully</div>
                <div className="text-[8px] font-black text-slate-800 mt-1">$40,500.34</div>
              </div>
            </motion.div>
          </div>

          {/* Underlay bottom details pills */}
          <div className="flex gap-2.5 w-full max-w-[320px] justify-center relative z-10">
            <div className="bg-white border border-purple-100 rounded-full py-1.5 px-3 shadow-sm text-[8px] font-extrabold text-slate-600 flex items-center gap-1 cursor-default hover:border-purple-200 transition-all uppercase tracking-wider">
              <Sparkles className="h-2.5 w-2.5 text-[#7C3AED]" />
              <span>Accessible only by you</span>
            </div>
            <div className="bg-white border border-purple-100 rounded-full py-1.5 px-3 shadow-sm text-[8px] font-extrabold text-slate-600 flex items-center gap-1 cursor-default hover:border-purple-200 transition-all uppercase tracking-wider">
              <Shield className="h-2.5 w-2.5 text-emerald-500" />
              <span>End-to-end encrypted</span>
            </div>
          </div>

        </div>
        
      </div>

      {/* Footer credits */}
      <footer className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] font-bold text-slate-400 z-10 px-4 md:px-2 mt-6">
        <div>© 2026 VaultPay. All rights reserved.</div>
        <div className="flex gap-4">
          <a href="#terms" className="hover:text-slate-600 transition-colors uppercase tracking-wider">Terms</a>
          <span>|</span>
          <a href="#privacy" className="hover:text-slate-600 transition-colors uppercase tracking-wider">Privacy</a>
          <span>|</span>
          <a href="#faq" className="hover:text-slate-600 transition-colors uppercase tracking-wider">FAQ</a>
        </div>
      </footer>
    </div>
  );
}
