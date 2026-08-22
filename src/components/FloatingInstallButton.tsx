import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check, Share, MoreVertical, Copy, Sparkles, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FloatingInstallButton: React.FC = () => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [hasPrompt, setHasPrompt] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    if ((window as any).deferredPrompt) {
      setHasPrompt(true);
    }

    const handlePromptReady = () => {
      setHasPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setHasPrompt(false);
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
          setHasPrompt(false);
          setIsStandalone(true);
          window.dispatchEvent(new Event('appinstalled'));
        }
      } catch (e) {
        console.error('PWA install prompt error:', e);
        setShowGuideModal(true);
      }
    } else {
      // If native deferredPrompt is not available (e.g. iOS Safari or inside iframe), show interactive guide
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
      {/* Floating Small Top Button */}
      <aside 
        aria-label="تثبيت التطبيق على الهاتف"
        className="fixed top-2.5 sm:top-3 right-3 sm:right-6 z-50 pointer-events-auto select-none"
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex items-center bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full shadow-lg shadow-emerald-950/20 border border-emerald-500/40 gap-1.5 sm:gap-2 group transition-all"
        >
          {/* Main Action Button */}
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-white hover:text-emerald-300 transition-colors cursor-pointer"
            title="تثبيت التطبيق على هاتفك"
          >
            <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-emerald-500"></span>
            </span>

            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Download className="w-3.5 h-3.5" />
            </div>

            <span className="tracking-tight whitespace-nowrap">تثبيت التطبيق</span>
            <Smartphone className="w-3.5 h-3.5 text-emerald-400 hidden sm:inline-block" />
          </button>

          {/* Dismiss Button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            title="إخفاء الزر"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </aside>

      {/* Manual Installation Guide Modal (for iOS or browsers without native prompt) */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs dir-rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
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
                    <p className="text-xs text-emerald-100 font-medium">خطوات سريعة لإضافة التطبيق كأيقونة على الشاشة</p>
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
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>لهواتف أندرويد (Google Chrome):</span>
                  </div>
                  <ol className="text-xs space-y-2 text-slate-600 pr-2">
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                      <span>اضغط على قائمة الخيارات <MoreVertical className="w-3.5 h-3.5 inline text-slate-500 mx-0.5" /> بأعلى المتصفح.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                      <span>اختر <strong>«تثبيت التطبيق»</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                      <span>اضغط على <strong>«تثبيت»</strong> وسيظهر التطبيق في شاشة تطبيقاتك.</span>
                    </li>
                  </ol>
                </div>

                {/* iPhone / iOS Section */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>لهواتف آيفون وآيباد (Safari):</span>
                  </div>
                  <ol className="text-xs space-y-2 text-slate-600 pr-2">
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                      <span>اضغط على زر المشاركة <Share className="w-3.5 h-3.5 inline text-blue-600 mx-0.5" /> أسفل الشاشة.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                      <span>مرر لأسفل واختر <strong>«إضافة إلى الشاشة الرئيسية»</strong> <PlusSquare className="w-3.5 h-3.5 inline text-slate-600 mx-0.5" />.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                      <span>اضغط <strong>«إضافة»</strong> (Add) بأعلى اليمين.</span>
                    </li>
                  </ol>
                </div>

                {/* Link Copy Option */}
                <div className="pt-1 flex items-center justify-between bg-emerald-50/60 border border-emerald-200/60 rounded-2xl p-3">
                  <div className="text-xs font-medium text-emerald-900">
                    يمكنك أيضاً نسخ الرابط وفتحه بالمتصفح مباشرة:
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
