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
          className="fixed inset-0 z-[9999] bg-gradient-to-br from-sky-100 via-emerald-50 to-amber-50 flex flex-col items-center justify-center p-6 text-slate-800 overflow-hidden dir-rtl select-none"
        >
          {/* Ambient Bright Background Lights */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-sky-300/30 via-emerald-300/30 to-amber-300/30 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-sky-200/40 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Decorative Sparkles */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-8 relative"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#00a8ff] via-emerald-400 to-amber-400 p-[3px] shadow-xl shadow-sky-500/20">
              <div className="w-full h-full bg-white rounded-[21px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-50 to-emerald-50"></div>
                <Award className="w-10 h-10 text-amber-500 relative z-10 drop-shadow-sm" />
              </div>
            </div>
            <Sparkles className="w-6 h-6 text-amber-500 absolute -top-2 -right-2 animate-bounce" />
            <Star className="w-4 h-4 text-sky-500 absolute -bottom-1 -left-2 animate-pulse" />
          </motion.div>

          {/* Main Titles Container */}
          <div className="text-center space-y-3 relative z-10 max-w-lg">
            {/* Bright Main Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="relative inline-block px-10 py-5 rounded-3xl bg-white/90 border border-sky-100 shadow-2xl shadow-sky-200/50 backdrop-blur-xl"
            >
              <h1 className="text-5xl sm:text-7xl font-black bg-gradient-to-r from-sky-600 via-emerald-600 to-amber-600 bg-clip-text text-transparent tracking-tight font-serif">
                تقييماتي
              </h1>
              <div className="mt-2 inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 text-white text-xs sm:text-sm font-black shadow-sm">
                <span>المرحلة الإعدادية</span>
              </div>
            </motion.div>

            {/* Small Subtitle */}
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-xs sm:text-sm font-extrabold text-slate-600 tracking-widest pt-1"
            >
              منصة التقييمات المدرسية الشاملة
            </motion.p>
          </div>

          {/* Progress loader */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '180px', opacity: 1 }}
            transition={{ delay: 0.5, duration: 2.0, ease: 'easeInOut' }}
            className="h-1.5 bg-gradient-to-r from-[#00a8ff] via-emerald-400 to-amber-400 rounded-full mt-10 shadow-md shadow-sky-400/30"
          />

          {/* Direct Enter button */}
          {showDismissButton && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={handleFinish}
              className="mt-8 px-7 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-lg shadow-sky-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>دخول التقييمات</span>
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
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
