import re

with open('src/components/AssessmentModal.tsx', 'r') as f:
    content = f.read()

# 1. Fix default date logic
old_date_logic = """  // Default date to today formatted as YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const [assessDate, setAssessDate] = useState<string>(todayStr);"""

new_date_logic = """  // Default date based on selected month
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
content = content.replace(old_date_logic, new_date_logic)

# 2. Add isRandom distribution state
state_block_end = "  const [notes, setNotes] = useState<string>('');"
state_block_new = state_block_end + "\n  const [isRandomDistribution, setIsRandomDistribution] = useState<boolean>(false);"
content = content.replace(state_block_end, state_block_new)

# 3. Update the partialRecord in handleSubmit
old_partial = """      timing_status: timingResult.isExceptional ? 'exceptional' : 'normal',
      timing_period: timingResult.period,
      model_form: modelForm,
    };"""

new_partial = """      timing_status: timingResult.isExceptional ? 'exceptional' : 'normal',
      timing_period: timingResult.period,
      model_form: isRandomDistribution ? 'عشوائي' : modelForm,
    };"""
content = content.replace(old_partial, new_partial)

# 4. Remove overlapping absolute labels in the selects
old_grade_select_label = """              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-800 font-bold text-sm">
                اختر الصف
              </div>"""
content = content.replace(old_grade_select_label, "")

old_class_select_label = """              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-800 font-bold text-sm">
                اختر الفصل
              </div>"""
content = content.replace(old_class_select_label, "")

# 5. Fix the Form Model Strategy Banner
old_banner = """          {/* Form Model Strategy Banner */}
          <div className="bg-emerald-50 border border-dashed border-emerald-400 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1 text-emerald-700">
              <span className="font-bold text-xs">توزيع النماذج المقترح:</span>
              <BookOpen className="w-4 h-4" />
            </div>
            <p className="text-sm font-bold text-emerald-800">
              {modelForm === 'أ' ? '1-20 (أ) ، 21-35 (ب) ، الآخر (ج)' : 
               modelForm === 'ب' ? '1-20 (ب) ، 21-35 (ج) ، الآخر (أ)' : 
               '1-20 (ج) ، 21-35 (أ) ، الآخر (ب)'}
            </p>
          </div>"""

new_banner = """          {/* Form Model Strategy Banner */}
          <div className="bg-emerald-50 border border-dashed border-emerald-400 rounded-xl p-3 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-emerald-700">
              <BookOpen className="w-4 h-4" />
              <span className="font-bold text-xs">توزيع النماذج المقترح:</span>
            </div>
            
            <p className="text-sm font-bold text-emerald-800">
              {isRandomDistribution ? 'توزيع عشوائي للنماذج على الطلاب' : 
               modelForm === 'أ' ? '1-20 (أ) ، 21-35 (ب) ، الآخر (ج)' : 
               modelForm === 'ب' ? '1-20 (ب) ، 21-35 (ج) ، الآخر (أ)' : 
               '1-20 (ج) ، 21-35 (أ) ، الآخر (ب)'}
            </p>

            <label className="flex items-center justify-center gap-2 cursor-pointer text-sm font-bold text-emerald-700 hover:text-emerald-900 transition-colors pt-1">
              <input 
                type="checkbox" 
                checked={isRandomDistribution}
                onChange={(e) => setIsRandomDistribution(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600 border-emerald-300"
              />
              توزيع عشوائي
            </label>
          </div>"""

# Replace it using regex in case it's slightly different
import re
pattern = re.compile(r'\{\/\* Form Model Strategy Banner \*\/.*?<\/div>', re.DOTALL)
content = pattern.sub(new_banner, content)

with open('src/components/AssessmentModal.tsx', 'w') as f:
    f.write(content)

