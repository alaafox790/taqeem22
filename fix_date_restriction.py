import re

with open('src/components/AssessmentModal.tsx', 'r') as f:
    content = f.read()

# Replace the initial date logic and add min/max calculation
old_date_logic = """  // Default date based on selected month
  const todayStr = new Date().toISOString().split('T')[0];
  const [assessDate, setAssessDate] = useState<string>(() => {
    const today = new Date();
    if (selectedMonth && selectedMonth.monthNumber !== today.getMonth() + 1) {
      let year = today.getFullYear();
      if (today.getMonth() + 1 >= 9 && selectedMonth.monthNumber <= 6) {
        year += 1;
      } else if (today.getMonth() + 1 <= 6 && selectedMonth.monthNumber >= 9) {
        year -= 1;
      }
      return `${year}-${String(selectedMonth.monthNumber).padStart(2, '0')}-01`;
    }
    return todayStr;
  });"""

new_date_logic = """  // Calculate exact year and limits based on academicYear and selectedMonth
  const getYearForMonth = () => {
    try {
      const [year1, year2] = academicYear.split('/').map(Number);
      if (selectedMonth.monthNumber >= 9) {
        return year1;
      } else {
        return year2 || (year1 + 1);
      }
    } catch {
      return new Date().getFullYear();
    }
  };

  const targetYear = getYearForMonth();
  const monthStr = String(selectedMonth.monthNumber).padStart(2, '0');
  
  // Create first and last days of the month
  const firstDay = `${targetYear}-${monthStr}-01`;
  const lastDayObj = new Date(targetYear, selectedMonth.monthNumber, 0);
  const lastDay = `${targetYear}-${monthStr}-${String(lastDayObj.getDate()).padStart(2, '0')}`;

  const todayStr = new Date().toISOString().split('T')[0];
  
  const [assessDate, setAssessDate] = useState<string>(() => {
    // If today is within the month, use today, else use the 1st of the month
    if (todayStr >= firstDay && todayStr <= lastDay) {
      return todayStr;
    }
    return firstDay;
  });"""

content = content.replace(old_date_logic, new_date_logic)

# Add min/max to the input
old_input = """            <input
              type="date"
              required
              value={assessDate}
              onChange={(e) => setAssessDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-500 text-sm font-bold text-slate-900 bg-white dir-ltr text-left"
            />"""

new_input = """            <input
              type="date"
              required
              min={firstDay}
              max={lastDay}
              value={assessDate}
              onChange={(e) => setAssessDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-cyan-500 text-sm font-bold text-slate-900 bg-white dir-ltr text-left"
            />"""

content = content.replace(old_input, new_input)

with open('src/components/AssessmentModal.tsx', 'w') as f:
    f.write(content)

