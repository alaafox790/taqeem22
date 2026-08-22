import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check, Share, MoreVertical, Copy, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FloatingInstallButton: React.FC = () => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed on phone)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    const handlePromptReady = () => {
      // Force update when prompt is ready
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setShowGuideModal(false);
    };

    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isStandalone || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    const promptInstall = (window as any).deferredPrompt;
    if (promptInstall) {
      try {
        promptInstall.prompt();
        const { outcome } = await promptInstall.userChoice;
        if (outcome === 'accepted') {
          (window as any).deferredPrompt = null;
          setIsStandalone(true);
          window.dispatchEvent(new Event('appinstalled'));
        }
      } catch (e) {
        console.error('PWA install prompt error:', e);
        setShowGuideModal(true);
      }
    } else {
      // If native deferredPrompt is not available (e.g. iOS Safari or browser requires manual step), show interactive guide
      setShowGuideModal(true);
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Floating High-Visibility Top Button */}
      <div 
        aria-label="تثبيت التطبيق على الهاتف"
        className="fixed top-2 sm:top-3 left-3 sm:left-6 z-[9999] pointer-events-auto select-none"
      >
        <motion.div
          initial={{ opacity: 0, y: -25, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -25, scale: 0.9 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex items-center bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white backdrop-blur-xl px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-2xl shadow-emerald-950/40 border-2 border-emerald-400/80 gap-2 ring-4 ring-emerald-500/20"
        >
          {/* Main Action Button */}
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 text-xs sm:text-sm font-black text-white hover:text-emerald-300 transition-colors cursor-pointer"
            title="تثبيت التطبيق على هاتفك"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>

            <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-sm shadow-emerald-400/50">
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>

            <span className="tracking-tight whitespace-nowrap font-black">تثبيت التطبيق 📱</span>
          </button>

          {/* Dismiss Button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer mr-1"
            title="إخفاء الزر مؤقتاً"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>

      {/* Manual Installation Guide Modal (for iOS or browsers without native prompt) */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm dir-rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">تثبيت التطبيق على هاتفك</h3>
                    <p className="text-xs text-emerald-100 font-medium">طريقة إضافة أيقونة التطبيق على شاشة الهاتف</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-5 space-y-4 text-slate-700">
                {/* Android Section */}
                <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center gap-2 font-black text-slate-800 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>لهواتف أندرويد (تثبيت كتطبيق حقيقي):</span>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 leading-relaxed font-medium">
                    ⚠️ <strong>ملاحظة هامة:</strong> إذا فتحت الرابط من داخل (واتساب أو فيسبوك أو ماسنجر)، اضغط على نقاط القائمة (⋮) واختر <strong>«فتح في متصفح Chrome»</strong> أولاً ليتم تثبيته كتطبيق حقيقي وليس مجرد اختصار.
                  </div>

                  <ol className="text-xs space-y-2 text-slate-700 pr-1">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <span>افتح الرابط في متصفح <strong>Google Chrome</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <span>اضغط على قائمة الثلاث نقاط <MoreVertical className="w-3.5 h-3.5 inline text-slate-600 mx-0.5" /> بأعلى اليسار.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <span>اختر خيار <strong>«تثبيت التطبيق» (Install App)</strong> 📲.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                      <span>سيتم تثبيته في قائمة تطبيقات هاتفك كبرنامج مستقل بالكامل (PWA WebAPK) بشاشة بداية وبدون شريط المتصفح ويعمل بسرعة وأمان.</span>
                    </li>
                  </ol>
                </div>

                {/* iPhone / iOS Section */}
                <div className="bg-blue-50/50 border border-blue-200/80 rounded-2xl p-3.5">
                  <div className="flex items-center gap-2 font-black text-slate-800 text-sm mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span>لهواتف آيفون وآيباد (متصفح Safari):</span>
                  </div>
                  <ol className="text-xs space-y-2 text-slate-600 pr-1">
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-black text-[11px] flex items-center justify-center shrink-0">1</span>
                      <span>اضغط على زر المشاركة <Share className="w-3.5 h-3.5 inline text-blue-600 mx-0.5" /> أسفل الشاشة.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-black text-[11px] flex items-center justify-center shrink-0">2</span>
                      <span>مرر للأسفل واختر <strong>«إضافة إلى الصفحة الرئيسية»</strong> <PlusSquare className="w-3.5 h-3.5 inline text-slate-600 mx-0.5" />.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-black text-[11px] flex items-center justify-center shrink-0">3</span>
                      <span>اضغط <strong>«إضافة» (Add)</strong> بأعلى اليمين.</span>
                    </li>
                  </ol>
                </div>

                {/* Link Copy Option */}
                <div className="pt-1 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-3">
                  <div className="text-xs font-medium text-slate-700">
                    رابط التطبيق المباشر:
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الرابط</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-100 px-5 py-3 border-t border-slate-200/70 flex justify-end">
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  فهمت ذلك
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
