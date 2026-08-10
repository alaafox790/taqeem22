import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BellRing, X } from 'lucide-react';

interface SnackbarReminderProps {
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export const SnackbarReminder: React.FC<SnackbarReminderProps> = ({ message, onDismiss, duration = 10000 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Play custom notification sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3); // A4
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);

      // Play a second beep
      setTimeout(() => {
        try {
          if (audioCtx.state === 'closed') return;
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(880, audioCtx.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
          gain2.gain.setValueAtTime(0, audioCtx.currentTime);
          gain2.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
          gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
          osc2.start();
          osc2.stop(audioCtx.currentTime + 0.5);
        } catch (e) {}
      }, 200);

    } catch (e) {
      console.error('Audio play error:', e);
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.4, type: 'spring', bounce: 0.5 }}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-4"
        dir="rtl"
      >
        <div className="bg-amber-50 border-2 border-amber-200 shadow-2xl rounded-2xl overflow-hidden">
          <div className="p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 text-amber-600 animate-pulse" />
            </div>
            
            <div className="flex-1 pt-1">
              <h3 className="font-bold text-amber-900 text-sm mb-1">تنبيه تأخير</h3>
              <p className="text-amber-800 text-xs font-medium leading-relaxed">
                {message}
              </p>
            </div>
            
            <button
              onClick={onDismiss}
              className="text-amber-400 hover:text-amber-700 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-amber-100/50">
            <motion.div 
              className="h-full bg-amber-400"
              style={{ width: `${progress}%` }}
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'linear', duration: 0.016 }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
