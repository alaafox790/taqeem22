import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';

interface InstallButtonProps {
  variant?: 'primary' | 'outline' | 'pill';
  className?: string;
  label?: string;
}

export const InstallButton: React.FC<InstallButtonProps> = ({
  variant = 'primary',
  className = '',
  label = 'تثبيت التطبيق على الهاتف'
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const onClick = async (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    const promptInstall = (window as any).deferredPrompt;
    if (promptInstall) {
      try {
        promptInstall.prompt();
        const { outcome } = await promptInstall.userChoice;
        if (outcome === 'accepted') {
          (window as any).deferredPrompt = null;
          window.dispatchEvent(new Event('appinstalled'));
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Trigger global install helper guide
      const installBtn = document.querySelector('aside [title="تثبيت التطبيق على هاتفك"], div [title="تثبيت التطبيق على هاتفك"]') as HTMLElement;
      if (installBtn) {
        installBtn.click();
      } else {
        alert('لتثبيت التطبيق: افتح قائمة خيارات المتصفح (⋮) ثم اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"');
      }
    }
  };

  if (variant === 'pill') {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer ${className}`}
        title="تثبيت التطبيق كـ تطبيق هاتف"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  if (variant === 'outline') {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-500/40 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-800 text-xs font-black transition-all active:scale-95 cursor-pointer ${className}`}
        title="تثبيت التطبيق كـ تطبيق هاتف"
      >
        <Download className="w-4 h-4 text-emerald-600" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md shadow-emerald-900/10 transition-all active:scale-95 cursor-pointer ${className}`}
      title="تثبيت التطبيق على جهازك"
    >
      <Download className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};
