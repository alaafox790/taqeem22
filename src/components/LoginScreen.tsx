import React, { useState, useRef } from 'react';
import { Phone, LogIn, ChevronRight, Lock } from 'lucide-react';
import { motion, useAnimation, useMotionValue, useTransform } from 'motion/react';

interface LoginScreenProps {
  onLogin: (phone: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const x = useMotionValue(0);

  const handleDragEnd = async (e: any, info: any) => {
    const containerWidth = containerRef.current?.offsetWidth || 300;
    const thumbWidth = 56; // 14 * 4
    const threshold = containerWidth - thumbWidth - 8; // 8px padding
    
    if (x.get() >= threshold * 0.75) {
      if (!phone || phone.length < 8 || !password) {
        setError('يرجى إدخال رقم الجوال وكلمة المرور أولاً');
        controls.start({ x: 0 });
        return;
      }
      
      await controls.start({ x: threshold });
      onLogin(phone);
    } else {
      controls.start({ x: 0 });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dir-rtl font-['Tajawal',sans-serif]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-16 h-16 bg-[#0ea5e9] rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/30 mb-6">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          تسجيل الدخول للمنصة
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 font-medium px-4">
          أدخل رقم الجوال ثم اسحب لتسجيل الدخول.<br/>لن تضطر لإعادة التسجيل لاحقاً.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          <div className="space-y-6">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-bold text-center border border-rose-100 animate-in fade-in zoom-in duration-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                رقم الجوال
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError('');
                  }}
                  className="block w-full pl-3 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] sm:text-sm bg-slate-50 focus:bg-white transition-colors font-mono text-left dir-ltr placeholder:text-right"
                  placeholder="05X XXX XXXX"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="block w-full pl-3 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] sm:text-sm bg-slate-50 focus:bg-white transition-colors font-mono text-left dir-ltr placeholder:text-right"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="pt-2">
              <div 
                ref={containerRef}
                className="relative w-full h-16 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200 dir-ltr shadow-inner select-none"
              >
                <motion.div 
                  style={{ opacity: useTransform(x, [0, 150], [1, 0]) }} 
                  className="absolute text-slate-500 font-bold text-sm z-0 pointer-events-none"
                >
                  اسحب لتسجيل الدخول
                </motion.div>
                
                <motion.div
                  className="absolute left-0 top-0 bottom-0 bg-sky-500 z-0 opacity-20 pointer-events-none"
                  style={{ width: useTransform(x, (v) => v + 60) }}
                />

                <motion.div
                  drag="x"
                  dragConstraints={containerRef}
                  dragElastic={0.05}
                  dragMomentum={false}
                  onDragEnd={handleDragEnd}
                  animate={controls}
                  style={{ x }}
                  className="absolute left-1.5 top-1.5 bottom-1.5 w-12 bg-white rounded-xl shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing z-10 border border-slate-100"
                >
                  <ChevronRight className="w-6 h-6 text-[#0ea5e9]" />
                </motion.div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

