import React, { useState } from 'react';
import { Settings, Palette, RotateCcw, Check, RefreshCw, Eye, Sparkles, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { StatusColors } from '../types';
import { COLOR_PRESETS, DEFAULT_STATUS_COLORS } from '../lib/statusColors';

interface SettingsScreenProps {
  statusColors: StatusColors;
  onSaveStatusColors: (newColors: StatusColors) => void;
  showToast?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  statusColors,
  onSaveStatusColors,
  showToast,
}) => {
  const [colors, setColors] = useState<StatusColors>(statusColors);

  const handleReset = () => {
    setColors(DEFAULT_STATUS_COLORS);
    onSaveStatusColors(DEFAULT_STATUS_COLORS);
    if (showToast) {
      showToast('info', 'تمت إعادة ضبط الألوان', 'تمت استعادة ألوان مؤشرات الحالة الافتراضية بنجاح.');
    }
  };

  const handleSave = () => {
    onSaveStatusColors(colors);
    if (showToast) {
      showToast('success', 'تم حفظ الألوان بنجاح', 'تم تطبيقه على جميع شاشات التطبيق وأزرار الطلاب وشاشة البحث.');
    }
  };

  const updateColor = (key: keyof StatusColors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 dir-rtl animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
            <Palette className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">إعدادات ألوان المؤشرات</h2>
            <p className="text-slate-300 text-xs sm:text-sm font-medium mt-1">
              خصص وتعديل ألوان حالات الطلاب (حضور، غياب، تأجيل) لتظهر بشكل موحد في شاشة البحث وأزرار التقييمات.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer active:scale-95"
            title="إعادة ضبط الألوان إلى الوضع الافتراضي"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>إعادة الضبط</span>
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>حفظ الألوان والتطبيق</span>
          </button>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* 1. Presence Color Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full shadow-xs inline-block shrink-0"
                style={{ backgroundColor: colors.present, boxShadow: `0 0 10px ${colors.present}60` }}
              ></span>
              <h3 className="font-black text-slate-800 text-base">مؤشر الحضور</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              (حاضر)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={colors.present}
              onChange={(e) => updateColor('present', e.target.value)}
              className="w-12 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-slate-50 shrink-0"
            />
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 block mb-1">كود اللون Hex:</label>
              <input
                type="text"
                value={colors.present}
                onChange={(e) => updateColor('present', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 dir-ltr focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-2">نماذج ألوان سريعة:</label>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_PRESETS.slice(0, 6).map((preset) => (
                <button
                  key={preset.hex}
                  onClick={() => updateColor('present', preset.hex)}
                  className={`w-6 h-6 rounded-lg transition-transform hover:scale-110 relative ${
                    colors.present.toLowerCase() === preset.hex.toLowerCase() ? 'ring-2 ring-indigo-600 scale-110' : ''
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  title={preset.name}
                ></button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Absence Color Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full shadow-xs inline-block shrink-0"
                style={{ backgroundColor: colors.absent, boxShadow: `0 0 10px ${colors.absent}60` }}
              ></span>
              <h3 className="font-black text-slate-800 text-base">مؤشر الغياب</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              (غائب)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={colors.absent}
              onChange={(e) => updateColor('absent', e.target.value)}
              className="w-12 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-slate-50 shrink-0"
            />
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 block mb-1">كود اللون Hex:</label>
              <input
                type="text"
                value={colors.absent}
                onChange={(e) => updateColor('absent', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 dir-ltr focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-2">نماذج ألوان سريعة:</label>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_PRESETS.slice(4, 10).map((preset) => (
                <button
                  key={preset.hex}
                  onClick={() => updateColor('absent', preset.hex)}
                  className={`w-6 h-6 rounded-lg transition-transform hover:scale-110 relative ${
                    colors.absent.toLowerCase() === preset.hex.toLowerCase() ? 'ring-2 ring-indigo-600 scale-110' : ''
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  title={preset.name}
                ></button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Postponement / Excused Color Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full shadow-xs inline-block shrink-0"
                style={{ backgroundColor: colors.excused, boxShadow: `0 0 10px ${colors.excused}60` }}
              ></span>
              <h3 className="font-black text-slate-800 text-base">مؤشر التأجيل / العذر</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              (تأجيل)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={colors.excused}
              onChange={(e) => updateColor('excused', e.target.value)}
              className="w-12 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-slate-50 shrink-0"
            />
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 block mb-1">كود اللون Hex:</label>
              <input
                type="text"
                value={colors.excused}
                onChange={(e) => updateColor('excused', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 dir-ltr focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-2">نماذج ألوان سريعة:</label>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_PRESETS.slice(6, 11).map((preset) => (
                <button
                  key={preset.hex}
                  onClick={() => updateColor('excused', preset.hex)}
                  className={`w-6 h-6 rounded-lg transition-transform hover:scale-110 relative ${
                    colors.excused.toLowerCase() === preset.hex.toLowerCase() ? 'ring-2 ring-indigo-600 scale-110' : ''
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  title={preset.name}
                ></button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Live Preview Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            <h3 className="font-black text-slate-800 text-lg">معاينة مباشرة لشكل الألوان بالتطبيق</h3>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            تحديث مباشر مع التغييرات
          </span>
        </div>

        {/* 1. Preview Student Buttons in Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-500">1. شكل أزرار الطلاب في جدول التقييمات:</h4>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-around gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white shadow-sm"
                style={{ backgroundColor: colors.present, boxShadow: `0 2px 6px ${colors.present}50` }}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-xs font-bold text-slate-700">حاضر</span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white shadow-sm"
                style={{ backgroundColor: colors.absent, boxShadow: `0 2px 6px ${colors.absent}50` }}
              >
                <XCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">غائب</span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-white shadow-sm"
                style={{ backgroundColor: colors.excused, boxShadow: `0 2px 6px ${colors.excused}50` }}
              >
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">تأجيل / بعذر</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-400">
                -
              </div>
              <span className="text-xs font-bold text-slate-500">سادة (لم يُقيّم)</span>
            </div>
          </div>
        </div>

        {/* 2. Preview Search Screen Circles & Legend */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-500">2. شكل دوائر التقييم الـ 15 ودليل الألوان في شاشة البحث:</h4>
          
          {/* Legend preview */}
          <div className="p-3 bg-slate-100/90 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-700">
            <span className="text-slate-400 text-[11px]">دليل التقييمات:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: colors.present, boxShadow: `0 2px 4px ${colors.present}60` }}></span>
              <span>حاضر</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: colors.absent, boxShadow: `0 2px 4px ${colors.absent}60` }}></span>
              <span>غائب</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: colors.excused, boxShadow: `0 2px 4px ${colors.excused}60` }}></span>
              <span>تأجيل / بعذر</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-300 border border-slate-400/50 inline-block"></span>
              <span>لم يُقيّم</span>
            </div>
          </div>

          {/* 15 Circles preview */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between gap-1.5 overflow-x-auto p-1">
              {Array.from({ length: 15 }, (_, i) => {
                const num = i + 1;
                let bg = '#e2e8f0'; // default sada
                let colorText = '#334155';
                let shadow = 'none';

                if ([1, 2, 4, 5, 7, 8, 10, 11, 13].includes(num)) {
                  bg = colors.present;
                  colorText = '#ffffff';
                  shadow = `0 2px 6px ${colors.present}60`;
                } else if ([3, 9, 14].includes(num)) {
                  bg = colors.absent;
                  colorText = '#ffffff';
                  shadow = `0 2px 6px ${colors.absent}60`;
                } else if ([6, 12].includes(num)) {
                  bg = colors.excused;
                  colorText = '#ffffff';
                  shadow = `0 2px 6px ${colors.excused}60`;
                }

                return (
                  <div
                    key={num}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all cursor-pointer"
                    style={{ backgroundColor: bg, color: colorText, boxShadow: shadow }}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>إعادة الضبط للافتراضي</span>
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>حفظ التطبيق والتغييرات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
