import re

with open('src/lib/validation.ts', 'r') as f:
    content = f.read()

new_func = """
/**
 * Calculates adjusted due date by pushing the due date forward for each official holiday
 */
export function getAdjustedDueDate(year: number, month: number, originalDueDate: number, officialHolidays: string[]): number {
  if (!officialHolidays || officialHolidays.length === 0) return originalDueDate;
  
  const holidaysInMonth = officialHolidays
    .map(d => new Date(d))
    .filter(d => d.getFullYear() === year && d.getMonth() + 1 === month)
    .map(d => d.getDate())
    .sort((a, b) => a - b);
    
  let adjustedDueDate = originalDueDate;
  for (const hDay of holidaysInMonth) {
    if (hDay <= adjustedDueDate) {
      adjustedDueDate++;
    }
  }
  
  return adjustedDueDate;
}
"""

content = content + new_func

with open('src/lib/validation.ts', 'w') as f:
    f.write(content)
