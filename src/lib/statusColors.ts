import { StatusColors } from '../types';

export const DEFAULT_STATUS_COLORS: StatusColors = {
  present: '#047857', // Emerald-700 (Accessible Green)
  absent: '#be123c',  // Rose-700 (Accessible Red)
  excused: '#b45309', // Amber-700 (Accessible Orange)
};

export const COLOR_PRESETS = [
  { name: 'أخضر داكن (افتراضي)', hex: '#047857' },
  { name: 'أخضر زمردي', hex: '#10b981' },
  { name: 'أزرق ملكي', hex: '#1d4ed8' },
  { name: 'أزرق سماوي', hex: '#0284c7' },
  { name: 'أحمر داكن (افتراضي)', hex: '#be123c' },
  { name: 'أحمر وردي', hex: '#e11d48' },
  { name: 'أحمر قرمزي', hex: '#b91c1c' },
  { name: 'برتقالي داكن (افتراضي)', hex: '#b45309' },
  { name: 'أصفر عنبري', hex: '#d97706' },
  { name: 'أرجواني بنفسجي', hex: '#7e22ce' },
  { name: 'وردي زاهي', hex: '#db2777' },
  { name: 'رمادي داكن', hex: '#334155' },
];

export const STATUS_COLORS_STORAGE_KEY = 'school_assessments_status_colors_v2';

export function getStoredStatusColors(): StatusColors {
  try {
    const saved = localStorage.getItem(STATUS_COLORS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        present: parsed.present || DEFAULT_STATUS_COLORS.present,
        absent: parsed.absent || DEFAULT_STATUS_COLORS.absent,
        excused: parsed.excused || DEFAULT_STATUS_COLORS.excused,
      };
    }
  } catch (e) {
    console.error('Failed to load status colors from localStorage:', e);
  }
  return DEFAULT_STATUS_COLORS;
}

export function saveStoredStatusColors(colors: StatusColors): void {
  try {
    localStorage.setItem(STATUS_COLORS_STORAGE_KEY, JSON.stringify(colors));
  } catch (e) {
    console.error('Failed to save status colors to localStorage:', e);
  }
}
