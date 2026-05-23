import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  CreditCard, 
  ArrowRight, 
  Cpu, 
  Building, 
  CheckCircle, 
  Layers, 
  Zap, 
  HelpCircle,
  X
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

export function LandingPage({ onGetStarted, onLogin, onRegister }: LandingPageProps) {
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Partners dummy data
  const partners = [
    { name: 'Visa Inc.', role: 'Global Card Network', status: 'Direct Issuer', icon: CreditCard, color: 'from-[#1A1F71] to-[#00579F]' },
    { name: 'Mastercard', role: 'Payment Core Protocol', status: 'Direct Issuer', icon: CreditCard, color: 'from-[#EA3C3C] to-[#F59E0B]' },
    { name: 'Stripe Payments', role: 'Online Processing API', status: 'Unified Gateway', icon: Zap, color: 'from-[#635BFF] to-[#80E9FF]' },
    { name: 'Plaid Network', role: 'Open Bank Integration', status: 'Verified Core', icon: Layers, color: 'from-[#0A85EA] to-[#3B82F6]' },
    { name: 'Amazon Web Services', role: 'Secured Cloud Hosting', status: 'PCI Compliance', icon: Building, color: 'from-[#FF9900] to-[#FFC366]' },
    { name: 'Google Cloud Platform', role: 'AI Forecast Compute', status: 'BigQuery Core', icon: Cpu, color: 'from-[#4285F4] to-[#34A853]' }
  ];

  // Business features dummy data
  const businessFeatures = [
    { title: 'Team Card Allocation', desc: 'Instantly issue separate virtual payment cards to team members with set budget bounds.', metric: 'Limitless Cards' },
    { title: 'Automated Payroll API', desc: 'Distribute funds immediately to suppliers or staff wallets using customizable scheduler tools.', metric: '0.8ms Latency' },
    { title: 'Real-Time Audit Pipeline', desc: 'Track employee spend immediately with custom category tags and instant digital invoices.', metric: 'Auto-Audited' }
  ];

  // Services features dummy data
  const serviceFeatures = [
    { title: 'Virtual Card Factory', desc: 'Configure brand (Visa/MC), style, starting balances and spending limits on the fly.', limit: 'Up to $25k limit' },
    { title: 'VaultAI Analytics Engine', desc: 'Receive proactive reports, suspicious activity alerts, and cancellation forms.', limit: '24/7 Monitoring' },
    { title: 'High Yield Savings Vault', desc: 'Relocate idle company or user funds to unlock a steady 5.2% APY compound returns.', limit: '5.2% APY Growth' }
  ];

  const handleHelpClick = () => {
    setShowHelpModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#FAF5FF] via-[#EBE2FF] to-[#F3EAFF] flex flex-col justify-between overflow-x-hidden relative select-none scroll-smooth">
      {/* Mesh glows */}
      <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-pink-300/30 blur-[130px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[550px] h-[550px] rounded-full bg-violet-300/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[20%] w-[450px] h-[450px] rounded-full bg-blue-300/20 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-20 sticky top-0 bg-gradient-to-tr from-[#FAF5FF]/80 via-[#EBE2FF]/85 to-[#F3EAFF]/80 backdrop-blur-md border-b border-purple-100/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center shadow-lg shadow-[#7C3AED]/20 border border-[#9F67FF]/20">
            <Wallet className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-extrabold text-slate-800 text-lg tracking-tight">VaultPay</span>
        </div>

        {/* Center navigation menu */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600 uppercase tracking-widest">
          <a href="#overview" className="hover:text-[#7C3AED] transition-colors relative">Overview</a>
          <a href="#partners" className="hover:text-[#7C3AED] transition-colors relative">Partners</a>
          <a href="#business" className="hover:text-[#7C3AED] transition-colors relative">Business</a>
          <a href="#service" className="hover:text-[#7C3AED] transition-colors relative">Service</a>
        </nav>

        {/* Right buttons */}
        <div className="flex items-center gap-5">
          <button 
            onClick={handleHelpClick}
            className="text-xs font-bold text-slate-600 hover:text-[#7C3AED] transition-colors uppercase tracking-wider"
          >
            Help
          </button>
          <button 
            onClick={onLogin}
            className="text-xs font-bold text-slate-600 hover:text-[#7C3AED] transition-colors uppercase tracking-wider"
          >
            Login
          </button>
          <button
            onClick={onRegister}
            className="text-xs font-bold bg-[#13111C] hover:bg-[#201C2F] text-white-force px-5 py-2.5 rounded-full transition-all active:scale-[0.98] border border-slate-800/20 shadow-sm"
          >
            Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-7xl mx-auto px-6 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1 z-10">
        
        {/* Left Column: Hero Text */}
        <div className="lg:col-span-6 space-y-6 text-left max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#7C3AED] text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>VaultAI Powered Banking</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.08] tracking-tight">
            Empowering <br />
            Strategies For <br />
            Financial Success
          </h1>

          <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed max-w-md">
            Embrace a growth mindset, educate yourself on financial literacy, and leverage technology to empower your journey towards financial success.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={onGetStarted}
              className="bg-[#13111C] hover:bg-[#201C2F] text-white-force font-bold py-3.5 px-8 rounded-full shadow-lg shadow-purple-900/10 hover:shadow-purple-900/15 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] text-sm group"
            >
              <span>Get Started</span>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </button>
            <button
              onClick={onLogin}
              className="bg-white/90 hover:bg-white text-slate-700 font-bold py-3.5 px-8 rounded-full border border-purple-200 transition-all active:scale-[0.98] text-sm flex items-center justify-center shadow-sm"
            >
              Access Dashboard
            </button>
          </div>
        </div>

        {/* Right Column: Floating Cards Visual */}
        <div className="lg:col-span-6 flex items-center justify-center relative min-h-[380px] w-full">
          <div className="absolute w-72 h-72 rounded-full bg-purple-400/20 blur-[80px] pointer-events-none" />

          {/* Overlapping Float Cards */}
          <div className="relative w-[340px] md:w-[400px] h-[280px]">
            {/* Card 1 (Back Card) */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [-5, -6, -5]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute top-4 left-6 w-[280px] md:w-[320px] aspect-[1.586] rounded-2xl p-5 md:p-6 text-white bg-gradient-to-tr from-[#1E0F45] via-[#481E99] to-[#8042F0] shadow-2xl border border-white/10 select-none backdrop-blur-md"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">VaultPay Premium</p>
                  <p className="text-base font-extrabold tracking-tight mt-0.5">Monsterbank.</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <p className="text-base md:text-lg font-mono font-medium tracking-widest text-white/95">
                  ••••  ••••  ••••  2411
                </p>
                <div className="flex justify-between items-end text-xs">
                  <div>
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-wider">Card Holder</p>
                    <p className="font-bold text-white/90">PRATVI SHARMA</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-wider">Expires</p>
                    <p className="font-bold text-white/90">09/29</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2 (Front Card) */}
            <motion.div
              animate={{ 
                y: [0, 10, 0],
                rotate: [4, 5, 4]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute top-16 left-12 w-[280px] md:w-[320px] aspect-[1.586] rounded-2xl p-5 md:p-6 text-white bg-gradient-to-tr from-[#4F1A99] via-[#853AE0] to-[#E379FF] shadow-2xl border border-white/10 select-none backdrop-blur-md"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">VaultPay Virtual</p>
                  <p className="text-base font-extrabold tracking-tight mt-0.5">Monsterbank.</p>
                </div>
                <div className="flex gap-0.5 text-white/80">
                  <span className="w-[2px] h-3 bg-current rounded-full opacity-40" />
                  <span className="w-[2px] h-3.5 bg-current rounded-full opacity-60" />
                  <span className="w-[2px] h-4 bg-current rounded-full opacity-80" />
                  <span className="w-[2px] h-4.5 bg-current rounded-full" />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <p className="text-base md:text-lg font-mono font-medium tracking-widest">
                  4125  5679  9989  7889
                </p>
                <div className="flex justify-between items-end text-xs">
                  <div>
                    <p className="text-[8px] font-black text-white/50 uppercase tracking-wider">Card Holder</p>
                    <p className="font-bold">PRATVI SHARMA</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-white/50 uppercase tracking-wider">Expires</p>
                    <p className="font-bold">06/27</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* OVERVIEW SECTION */}
      <section id="overview" className="py-24 border-t border-purple-100/50 bg-white/40 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              An Integrated Platform Built For Financial Freedom
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
              We leverage cutting-edge cryptography and client-side intelligence to help you track expenses, schedule bills, issue instant virtual cards, and secure continuous growth yield.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100/60 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Instant Setup</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">Configure accounts and cards locally under 60 seconds.</p>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100/60 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Secure Vaulting</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">Card credentials frozen dynamically via local controls.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mini Mock Dashboard Interface */}
          <div className="bg-slate-900 rounded-3xl p-5 md:p-6 shadow-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">VaultPay Terminal</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Main balance</p>
                <p className="text-lg font-bold text-white font-mono mt-0.5">$35,598.58</p>
              </div>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                +14.2% Growth
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Recent card controls</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-center">
                  <p className="text-[9px] font-bold text-slate-400">Limit Slider</p>
                  <p className="text-[10px] font-extrabold text-white mt-1 font-mono">$15,000</p>
                </div>
                <div className="p-2.5 bg-[#7C3AED]/20 border border-purple-500/30 rounded-lg text-center">
                  <p className="text-[9px] font-bold text-[#7C3AED]">Freeze State</p>
                  <p className="text-[10px] font-extrabold text-[#7C3AED] mt-1 uppercase tracking-wider">Unlocked</p>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-center">
                  <p className="text-[9px] font-bold text-slate-400">Card brand</p>
                  <p className="text-[10px] font-extrabold text-white mt-1 uppercase">Visa Card</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERS SECTION */}
      <section id="partners" className="py-24 bg-slate-50/50 border-t border-purple-100/30">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Trusted By Industry Networks</h2>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              We connect and operate through validated processing pipelines to ensure security compliance and transaction speeds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((p) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.name}
                  whileHover={{ y: -4 }}
                  className="bg-white border border-purple-100/60 p-6 rounded-2xl shadow-sm text-left flex flex-col justify-between group transition-shadow hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">{p.name}</h4>
                      <p className="text-xs text-slate-400 font-medium">{p.role}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${p.color} flex items-center justify-center text-white shrink-0`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Protocol Connection</span>
                    <span className="text-[9px] font-black text-purple-600 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                      {p.status}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BUSINESS SECTION */}
      <section id="business" className="py-24 bg-white/40 border-t border-purple-100/30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-4 space-y-5">
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest leading-none block">
              Business Suite
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Control Corporate Spending Easily
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              Equip your payroll pipelines, team accounts, and developer APIs with encrypted features tailored to automate payout actions.
            </p>
            <button 
              onClick={onRegister}
              className="bg-[#13111C] hover:bg-[#201C2F] text-white-force font-bold py-2.5 px-6 rounded-full text-xs shadow-md transition-all active:scale-[0.98]"
            >
              Configure Business Card
            </button>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {businessFeatures.map((bf) => (
              <div 
                key={bf.title}
                className="bg-white border border-purple-100/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="text-[9px] font-black bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-widest inline-block">
                    {bf.metric}
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{bf.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{bf.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-purple-600 font-bold cursor-pointer hover:translate-x-0.5 transition-transform">
                  <span>Learn more</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SERVICE SECTION */}
      <section id="service" className="py-24 bg-slate-50/50 border-t border-b border-purple-100/30">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Our Banking Core Services</h2>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              We integrate essential banking utilities into a single, intuitive layout with visual tools and instant processing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {serviceFeatures.map((sf) => (
              <div 
                key={sf.title}
                className="bg-white border border-purple-100/60 p-6 rounded-2xl shadow-sm text-left flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{sf.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{sf.desc}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <span>Guaranteed limit</span>
                  <span className="text-purple-600 font-black">{sf.limit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Features Banner */}
      <footer className="bg-[#0B0914] text-white py-10 border-t border-slate-900 z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          
          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row items-center gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold tracking-tight">Transfer money</h4>
              <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto md:mx-0">
                Send funds instantly to any bank account or digital card worldwide with zero hidden commission fees.
              </p>
            </div>
            <span className="hidden md:inline text-slate-700 font-light text-2xl self-center justify-self-end ml-auto">{"}"}</span>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col md:flex-row items-center gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Shield className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold tracking-tight">Grow savings</h4>
              <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto md:mx-0">
                Unlock high-yield savings portfolios earning 5.2% APY, backed by local regulatory insurance vaults.
              </p>
            </div>
            <span className="hidden md:inline text-slate-700 font-light text-2xl self-center justify-self-end ml-auto">{"}"}</span>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col md:flex-row items-center gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold tracking-tight">VaultAI Analytics</h4>
              <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto md:mx-0">
                Receive predictive spending reports, fraud detection checks, and custom saving checklists automatically.
              </p>
            </div>
          </div>

        </div>
      </footer>

      {/* HELP POPUP MODAL */}
      <AnimatePresence>
        {showHelpModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelpModal(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="fixed inset-x-6 bottom-6 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-purple-100 z-50 overflow-hidden"
            >
              <div className="flex justify-between items-center pb-4 border-b border-purple-50">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-purple-600" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Fintech Help Center</h3>
                </div>
                <button 
                  onClick={() => setShowHelpModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
              <div className="py-4 space-y-4 text-xs font-semibold text-slate-600">
                <div className="space-y-1">
                  <p className="text-slate-800 font-bold uppercase tracking-wider text-[10px]">Instant Access</p>
                  <p className="leading-relaxed">Click "Access Dashboard" to instantly bypass the login screen and play with the full dashboard using the pre-configured Pratvi Sharma demo user account.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-800 font-bold uppercase tracking-wider text-[10px]">Create Custom Accounts</p>
                  <p className="leading-relaxed">Click "Get Started" or "Register" to create a fresh secure profile locally on your machine and start adding custom cards or transactions.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-800 font-bold uppercase tracking-wider text-[10px]">Contact Assistance</p>
                  <p className="leading-relaxed">For production issues or developer API tokens, please email us directly at <span className="text-purple-600">support@fintech.com</span>.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="w-full bg-[#13111C] hover:bg-[#201C2F] text-white-force font-bold py-2.5 px-4 rounded-xl text-xs mt-2 transition-all active:scale-[0.98]"
              >
                Close Dialog
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
