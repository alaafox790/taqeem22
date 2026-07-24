import React, { useState, useRef } from 'react';
import { Phone, LogIn, ChevronRight, Lock, Shield, UserCheck, KeyRound, BookOpen, Check } from 'lucide-react';
import { motion, useAnimation, useMotionValue, useTransform } from 'motion/react';

export interface ManagementLoginData {
  isManagement: boolean;
  role: 'principal' | 'deputy' | 'supervisor';
  pinCode: string;
  subject: string;
}

interface LoginScreenProps {
  onLogin: (phone: string, managementData?: ManagementLoginData) => void;
}

const CORE_SUBJECTS = [
  'اللغة العربية',
  'الرياضيات',
  'العلوم',
  'الدراسات الاجتماعية',
  'اللغة الإنجليزية',
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Management & Supervision login mode
  const [isManagement, setIsManagement] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'principal' | 'deputy' | 'supervisor'>('principal');
  const [pinCode, setPinCode] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('اللغة العربية');

  const [error, setError] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const x = useMotionValue(0);

  const validateAndSubmit = () => {
    if (!phone || phone.trim().length < 8) {
      setError('يرجى إدخال رقم الجوال الصحيح (8 أرقام على الأقل)');
      controls.start({ x: 0 });
      return false;
    }

    if (!isManagement) {
      if (!password) {
        setError('يرجى إدخال كلمة المرور');
        controls.start({ x: 0 });
        return false;
      }
      onLogin(phone);
      return true;
    } else {
      // Validation for Management / Supervisor Mode
      if (!pinCode || pinCode.trim().length !== 4) {
        setError('يرجى إدخال كود PIN مكون من 4 أرقام بالضبط');
        controls.start({ x: 0 });
        return false;
      }

      if (selectedRole === 'supervisor' && !selectedSubject) {
        setError('يرجى اختيار المادة الإشرافية');
        controls.start({ x: 0 });
        return false;
      }

      onLogin(phone, {
        isManagement: true,
        role: selectedRole,
        pinCode: pinCode.trim(),
        subject: selectedSubject,
      });
      return true;
    }
  };

  const handleFinishLogin = () => {
    validateAndSubmit();
  };

  const handleDragEnd = async (e: any, info: any) => {
    const containerWidth = containerRef.current?.offsetWidth || 300;
    const thumbWidth = 56;
    const threshold = containerWidth - thumbWidth - 8;
    
    if (x.get() >= threshold * 0.65) {
      const isValid = validateAndSubmit();
      if (isValid) {
        await controls.start({ x: threshold });
      } else {
        controls.start({ x: 0 });
      }
    } else {
      controls.start({ x: 0 });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50/50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 dir-rtl font-['Tajawal',sans-serif] select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* Top App Icon Box */}
        <div className="mx-auto w-16 h-16 bg-[#0f2b5c] rounded-2xl flex items-center justify-center shadow-lg shadow-[#0f2b5c]/25 mb-3 text-amber-300">
          <LogIn className="w-8 h-8 stroke-[2.5]" />
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          تسجيل الدخول
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed max-w-xs mx-auto">
          أدخل رقم الجوال ثم اسحب لتسجيل الدخول.<br />
          لن تضطر لإعادة التسجيل لاحقاً.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-5 shadow-xl shadow-slate-200/60 rounded-3xl sm:px-8 border border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFinishLogin();
            }}
            className="space-y-5"
          >
            {error && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold text-center border border-rose-200 animate-in fade-in duration-200">
                {error}
              </div>
            )}

            {/* Phone Field */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 text-right">
                رقم الجوال
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-5 w-5" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError('');
                  }}
                  className="block w-full pl-4 pr-11 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#00a8ff] focus:border-[#00a8ff] text-sm bg-slate-50/50 focus:bg-white transition-all font-mono text-right dir-ltr placeholder:text-right placeholder:font-sans placeholder:text-slate-400 font-bold text-slate-800"
                  placeholder="05X XXX XXXX"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password Field (Only when NOT management) */}
            {!isManagement && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 text-right">
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required={!isManagement}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    className="block w-full pl-4 pr-11 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#00a8ff] focus:border-[#00a8ff] text-sm bg-slate-50/50 focus:bg-white transition-all font-mono text-right dir-ltr placeholder:text-right placeholder:font-sans placeholder:text-slate-400 font-bold text-slate-800"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
              </motion.div>
            )}

            {/* Checkbox for Management / Supervisor Mode */}
            <div className="pt-1">
              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/80 transition-all select-none">
                <input
                  type="checkbox"
                  checked={isManagement}
                  onChange={(e) => {
                    setIsManagement(e.target.checked);
                    setError('');
                  }}
                  className="w-5 h-5 rounded-md text-[#00a8ff] focus:ring-[#00a8ff] border-slate-300 accent-[#00a8ff] cursor-pointer"
                />
                <Shield className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs font-extrabold text-slate-800">
                  دخول كـ (مدير / وكيل / مشرف)
                </span>
              </label>
            </div>

            {/* Expanded Management Options */}
            {isManagement && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-2 border-t border-slate-100"
              >
                {/* 3 Role Selection Buttons */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 text-right">
                    اختر الصفة القيادية:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('principal');
                        setError('');
                      }}
                      className={`py-2.5 px-2 rounded-xl text-xs font-extrabold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        selectedRole === 'principal'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-md scale-[1.02]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>مدير</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('deputy');
                        setError('');
                      }}
                      className={`py-2.5 px-2 rounded-xl text-xs font-extrabold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        selectedRole === 'deputy'
                          ? 'bg-sky-500 text-white border-sky-500 shadow-md scale-[1.02]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>وكيل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('supervisor');
                        setError('');
                      }}
                      className={`py-2.5 px-2 rounded-xl text-xs font-extrabold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        selectedRole === 'supervisor'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>مشرف</span>
                    </button>
                  </div>
                </div>

                {/* 4-Digit PIN Code Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 text-right">
                    كود PIN الإداري (4 أرقام)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="h-5 w-5 text-amber-500" />
                    </div>
                    <input
                      type="password"
                      maxLength={4}
                      value={pinCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setPinCode(val);
                        setError('');
                      }}
                      className="block w-full pl-4 pr-11 py-3 border border-amber-300 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-base bg-amber-50/30 focus:bg-white transition-all font-mono text-center tracking-[0.5em] font-extrabold text-slate-900"
                      placeholder="••••"
                      dir="ltr"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 text-right">
                    أدخل كود PIN المكون من 4 أرقام لمتابعة التقييمات
                  </p>
                </div>

                {/* 5 Core Subject Checkboxes for Supervisor */}
                {selectedRole === 'supervisor' && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-2.5"
                  >
                    <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-xs">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <span>اختر المادة الإشرافية لمتابعة معلّميها:</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                      {CORE_SUBJECTS.map((subj) => {
                        const isChecked = selectedSubject === subj;
                        return (
                          <label
                            key={subj}
                            onClick={() => {
                              setSelectedSubject(subj);
                              setError('');
                            }}
                            className={`flex items-center gap-2 p-2 rounded-xl text-xs font-extrabold border cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                                isChecked
                                  ? 'bg-white text-emerald-700 border-white'
                                  : 'bg-slate-100 border-slate-300'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="truncate">{subj}</span>
                          </label>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Slide to Login Bar */}
            <div className="pt-2">
              <div
                ref={containerRef}
                onClick={handleFinishLogin}
                className="relative w-full h-14 bg-[#f0f4f8] rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200/80 dir-ltr shadow-inner select-none cursor-pointer group"
              >
                <motion.div
                  style={{ opacity: useTransform(x, [0, 150], [1, 0]) }}
                  className="absolute text-slate-500 font-extrabold text-xs sm:text-sm z-0 pointer-events-none group-hover:text-slate-700 transition-colors"
                >
                  {isManagement ? 'اسحب للدخول كـ إشراف/إدارة' : 'اسحب لتسجيل الدخول'}
                </motion.div>

                <motion.div
                  className={`absolute left-0 top-0 bottom-0 z-0 opacity-20 pointer-events-none ${
                    isManagement ? 'bg-amber-500' : 'bg-[#00a8ff]'
                  }`}
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
                  className="absolute left-1 top-1 bottom-1 w-12 bg-white rounded-xl shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing z-10 border border-slate-100 hover:scale-105 transition-transform"
                >
                  <ChevronRight
                    className={`w-5 h-5 stroke-[3] ${
                      isManagement ? 'text-amber-500' : 'text-[#00a8ff]'
                    }`}
                  />
                </motion.div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 font-bold mt-6">
          منصة تقييماتي المدرسية - إعداد وتصميم / علاء الوكيل
        </p>
      </div>
    </div>
  );
};



