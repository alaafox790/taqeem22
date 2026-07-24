import re

with open('src/components/ClassStats.tsx', 'r') as f:
    content = f.read()

# Add MONTHS_DATA import
content = content.replace("from '../types';", "from '../types';\nimport { MONTHS_DATA } from '../lib/constants';")
content = content.replace("import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line, PieChart, Pie, Cell } from 'recharts';", "import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line, LineChart, PieChart, Pie, Cell } from 'recharts';")

# Add new monthly data memo
old_memo = "const data = Array.from(classSet).map(classId => {"
new_memo = """
    const monthlyData = MONTHS_DATA.filter(m => m.termId === selectedTerm).map(month => {
      const monthRecords = termRecords.filter(r => r.month_id === month.id);
      
      const monthAttendance = attendance.filter(a => a.month_id === month.id);
      const presentCount = monthAttendance.filter(a => a.status === 'present').length;
      const totalAttendance = monthAttendance.length;
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;
      
      return {
        name: month.name.split(' ')[0],
        assessmentsCount: monthRecords.length,
        attendanceRate
      };
    });

    const data = Array.from(classSet).map(classId => {"""

content = content.replace(old_memo, new_memo)
content = content.replace("return data.sort((a, b) => a.sortKey.localeCompare(b.sortKey));", "return { classData: data.sort((a, b) => a.sortKey.localeCompare(b.sortKey)), monthlyData };")

# Fix references to chartData
content = content.replace("if (chartData.length === 0)", "if (chartData.classData.length === 0)")
content = content.replace("data={chartData}", "data={chartData.classData}")

# Add new chart section
old_end = """        </div>
      </div>
    </div>
  );"""

new_end = """        </div>
      </div>

      <div className="mt-8 border-t border-slate-100 pt-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          تطور الأداء عبر الشهور
        </h3>
        <div className="h-[350px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData.monthlyData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                yAxisId="left" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dx={-10}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dx={10}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'inherit', textAlign: 'right', direction: 'rtl' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span className="font-bold text-slate-700 ml-2">{value === 'assessmentsCount' ? 'عدد التقييمات' : 'معدل الحضور (%)'}</span>}
              />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="assessmentsCount" 
                name="assessmentsCount"
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="attendanceRate" 
                name="attendanceRate"
                stroke="#ec4899" 
                strokeWidth={3}
                dot={{ r: 6, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );"""

content = content.replace(old_end, new_end)

with open('src/components/ClassStats.tsx', 'w') as f:
    f.write(content)
