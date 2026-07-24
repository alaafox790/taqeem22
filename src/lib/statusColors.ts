import { StatusColors } from '../types';

export const DEFAULT_STATUS_COLORS: StatusColors = {
  present: '#10b981', // Emerald / Green
  absent: '#f43f5e',  // Rose / Red
  excused: '#f59e0b', // Amber / Yellow-Orange (تأجيل / بعذر)
};

export const COLOR_PRESETS = [
  { name: 'أخضر زمردي', hex: '#10b981' },
  { name: 'أخضر غامق', hex: '#16a34a' },
  { name: 'أزرق ملكي', hex: '#2563eb' },
  { name: 'أزرق سماوي', hex: '#0284c7' },
  { name: 'أحمر وردي', hex: '#f43f5e' },
  { name: 'أحمر قرمزي', hex: '#dc2626' },
  { name: 'برتقالي دافئ', hex: '#f97316' },
  { name: 'أصفر عنبري', hex: '#f59e0b' },
  { name: 'أرجواني بنفسجي', hex: '#8b5cf6' },
  { name: 'وردي زاهي', hex: '#ec4899' },
  { name: 'رمادي داكن', hex: '#475569' },
];

export const STATUS_COLORS_STORAGE_KEY = 'school_assessments_status_colors_v1';

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
