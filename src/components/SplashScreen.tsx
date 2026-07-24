import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowLeft, Award, Star } from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
  showDismissButton?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, showDismissButton = true }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFinish();
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const handleFinish = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 400);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden dir-rtl select-none"
        >
          {/* Ambient Luxurious Background Lights */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/20 via-purple-600/20 to-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-rose-500/15 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Decorative Sparkles */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-8 relative"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-fuchsia-500 to-indigo-600 p-[2px] shadow-[0_0_50px_rgba(245,158,11,0.4)]">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-purple-500/20"></div>
                <Award className="w-10 h-10 text-amber-400 relative z-10 drop-shadow-[0_2px_10px_rgba(245,158,11,0.8)]" />
              </div>
            </div>
            <Sparkles className="w-6 h-6 text-amber-300 absolute -top-2 -right-2 animate-bounce" />
            <Star className="w-4 h-4 text-fuchsia-400 absolute -bottom-1 -left-2 animate-pulse" />
          </motion.div>

          {/* Main Titles Container */}
          <div className="text-center space-y-3 relative z-10 max-w-lg">
            {/* Luxurious Main Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="relative inline-block px-8 py-4 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-amber-400/30 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <h1 className="text-5xl sm:text-7xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent tracking-tight drop-shadow-[0_4px_25px_rgba(245,158,11,0.6)] font-serif">
                تقييماتي
              </h1>
            </motion.div>

            {/* Small Subtitle */}
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-xs sm:text-sm font-bold text-amber-200/80 tracking-widest pt-1"
            >
              مدمرة حياتي
            </motion.p>
          </div>

          {/* Progress loader */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '180px', opacity: 1 }}
            transition={{ delay: 0.5, duration: 2.0, ease: 'easeInOut' }}
            className="h-1 bg-gradient-to-r from-amber-400 via-fuchsia-500 to-indigo-500 rounded-full mt-10 shadow-[0_0_15px_rgba(245,158,11,0.8)]"
          />

          {/* Direct Enter button */}
          {showDismissButton && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={handleFinish}
              className="mt-8 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>دخول التقييمات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </motion.button>
          )}

          {/* Footer signature */}
          <div className="absolute bottom-6 text-[11px] font-bold text-slate-500 tracking-wider">
            إعداد وتصميم / علاء الوكيل
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
