import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Wifi, Lock, Unlock, Sliders } from 'lucide-react';
import type { CardData } from '@/types';
import { formatCurrency } from '@/utils/format';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

interface VirtualCardProps {
  card: CardData;
  onFreezeToggle: (id: string) => void;
  onLimitChange: (id: string, limit: number) => void;
  isDetailed?: boolean;
}

export function VirtualCard({ card, onFreezeToggle, onLimitChange, isDetailed = false }: VirtualCardProps) {
  const [showFullNumber, setShowFullNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);

  const getBgStyle = (scheme: string) => {
    switch (scheme) {
      case 'violet-glowing':
        // A premium red-purple-orange fluid gradient mimicking the 3D swirl
        return 'bg-gradient-to-tr from-[#9B2C2C] via-[#7C3AED] to-[#EC4899] shadow-lg shadow-purple-500/20';
      case 'pastel-spiral':
        // A premium light gray, teal, and soft gold mesh gradient
        return 'bg-gradient-to-tr from-[#E2E8F0] via-[#CCFBF1] to-[#FEF3C7] text-slate-800 shadow-md border border-slate-200/50';
      case 'dark-stripe':
        // Modern black metal card
        return 'bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E1B4B] border border-slate-800/80 shadow-2xl';
      default:
        return 'bg-gradient-to-r from-blue-600 to-indigo-600';
    }
  };

  const isDarkCard = card.colorScheme !== 'pastel-spiral';

  const formatCardNumber = (num: string, reveal: boolean) => {
    if (reveal) return num;
    // Format: •••• •••• •••• 7889
    const last4 = num.replace(/\s/g, '').slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      {/* 3D Tilt Card Wrapper */}
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative"
      >
        <div
          className={`relative aspect-[1.586/1] w-full rounded-2xl p-5 sm:p-6 overflow-hidden flex flex-col justify-between select-none ${getBgStyle(
            card.colorScheme
          )} transition-all duration-300`}
        >
          {/* Card Art/Shapes overlay */}
          {card.colorScheme === 'violet-glowing' && (
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-gradient-to-r from-yellow-400 to-pink-600 blur-2xl opacity-40 pointer-events-none" />
          )}
          {card.colorScheme === 'pastel-spiral' && (
            <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-gradient-to-r from-cyan-300 to-teal-400 blur-xl opacity-30 pointer-events-none" />
          )}

          {/* Top Row: Type & Wireless & Menu */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] sm:text-xs font-semibold tracking-wider uppercase ${
                  isDarkCard ? 'text-white/80' : 'text-slate-600/90'
                }`}
              >
                {card.type === 'virtual' ? 'Virtual Card' : 'Physical Card'}
              </span>
              <Wifi
                className={`h-4 w-4 ${
                  isDarkCard ? 'text-white/80' : 'text-slate-600/80'
                } rotate-90`}
              />
            </div>
            <button
              onClick={() => setShowFullNumber(!showFullNumber)}
              className={`p-1.5 rounded-lg hover:bg-black/10 transition-colors ${
                isDarkCard ? 'text-white/80' : 'text-slate-600/80'
              }`}
              title={showFullNumber ? 'Hide numbers' : 'Reveal card numbers'}
            >
              {showFullNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Card Number */}
          <div className="my-auto py-1 sm:py-2 z-10">
            <span
              className={`font-mono text-base sm:text-lg md:text-xl tracking-[0.18em] font-medium ${
                isDarkCard ? 'text-white' : 'text-slate-800'
              }`}
            >
              {formatCardNumber(card.cardNumber, showFullNumber)}
            </span>
          </div>

          {/* Bottom Row: Expiry, Balance, Logo */}
          <div className="flex items-end justify-between z-10">
            <div className="space-y-1">
              <div className="flex gap-4">
                <div>
                  <p
                    className={`text-[9px] uppercase tracking-wider ${
                      isDarkCard ? 'text-white/50' : 'text-slate-500'
                    }`}
                  >
                    Expires
                  </p>
                  <p
                    className={`text-xs font-mono font-medium ${
                      isDarkCard ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {card.expiryDate}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-[9px] uppercase tracking-wider ${
                      isDarkCard ? 'text-white/50' : 'text-slate-500'
                    }`}
                  >
                    CVV
                  </p>
                  <button
                    onClick={() => setShowCVV(!showCVV)}
                    className={`text-xs font-mono font-medium hover:underline block leading-tight ${
                      isDarkCard ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {showCVV ? card.cvv : '•••'}
                  </button>
                </div>
              </div>
              <div className="pt-1.5">
                <p
                  className={`text-[9px] uppercase tracking-wider leading-none ${
                    isDarkCard ? 'text-white/50' : 'text-slate-500'
                  }`}
                >
                  Available Balance
                </p>
                <p
                  className={`text-sm sm:text-base font-bold tracking-tight ${
                    isDarkCard ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  {formatCurrency(card.balance)}
                </p>
              </div>
            </div>

            {/* Brand Logo */}
            <div className="shrink-0">
              {card.brand === 'mastercard' ? (
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#EA3C3C] opacity-90" />
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#F59E0B] opacity-80" />
                </div>
              ) : (
                <span
                  className={`font-serif italic font-black text-lg sm:text-2xl ${
                    isDarkCard ? 'text-white/90' : 'text-[#1E3A8A]'
                  }`}
                >
                  VISA
                </span>
              )}
            </div>
          </div>

          {/* Frozen Frosted Glass Overlay */}
          <AnimatePresence>
            {card.isFrozen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center z-20"
              >
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-black/40 border border-white/20 p-2.5 rounded-full mb-1 text-red-400"
                >
                  <Lock className="h-5 w-5" />
                </motion.div>
                <span className="text-white text-xs font-bold uppercase tracking-widest text-shadow">
                  Card Frozen
                </span>
                <span className="text-white/60 text-[10px] mt-0.5">Tap unfreeze below to use</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* detailed card management details */}
      {isDetailed && (
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-white">Card Status</span>
                <p className="text-xs text-slate-400">
                  {card.isFrozen ? 'Temporarily lock purchases' : 'Active and ready for payments'}
                </p>
              </div>
              <button
                onClick={() => onFreezeToggle(card.id)}
                className={`p-2 rounded-xl transition-all border flex items-center gap-1.5 text-xs font-bold ${
                  card.isFrozen
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                }`}
              >
                {card.isFrozen ? (
                  <>
                    <Unlock className="h-3.5 w-3.5" />
                    Unfreeze
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    Freeze
                  </>
                )}
              </button>
            </div>

            {/* Spend Limit Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-xs font-semibold text-slate-300">Monthly Spending Limit</span>
                </div>
                <span className="text-xs font-bold text-white font-mono">
                  {formatCurrency(card.limit)}
                </span>
              </div>
              <Slider
                value={[card.limit]}
                min={0}
                max={card.colorScheme === 'violet-glowing' ? 25000 : 15000}
                step={500}
                disabled={card.isFrozen}
                onValueChange={(val) => onLimitChange(card.id, val[0])}
                className="py-1 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$0</span>
                <span>Max {formatCurrency(card.colorScheme === 'violet-glowing' ? 25000 : 15000, 'USD')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
