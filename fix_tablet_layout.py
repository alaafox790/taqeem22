import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Update App.tsx max-w-lg to max-w-4xl for the assessments view
old_app_view = """        {activeTab === 'assessments' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="max-w-lg mx-auto shadow-sm rounded-xl">"""
new_app_view = """        {activeTab === 'assessments' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="max-w-4xl mx-auto shadow-sm rounded-xl">"""
content = content.replace(old_app_view, new_app_view)

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/components/AssessmentGrid.tsx', 'r') as f:
    content = f.read()

# Update AssessmentGrid layout
old_grid = """    <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-4 sm:p-6 pt-2">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">"""
new_grid = """    <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-4 sm:p-6 pt-4">
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">"""
content = content.replace(old_grid, new_grid)

with open('src/components/AssessmentGrid.tsx', 'w') as f:
    f.write(content)

with open('src/components/ControlBar.tsx', 'r') as f:
    content = f.read()

# Update ControlBar layout
old_cb = """    <div className="bg-white rounded-t-xl border border-b-0 border-slate-200 p-4 sm:p-6 pb-2 space-y-4">
      {/* Title */}
      <h2 className="text-center text-slate-800 font-bold text-lg mb-2">سجل التقييمات</h2>

      {/* Academic Year Row */}
      <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-2 bg-slate-50/50">"""
new_cb = """    <div className="bg-white rounded-t-xl border border-b-0 border-slate-200 p-4 sm:p-6 pb-4 space-y-4 md:space-y-6">
      {/* Title */}
      <h2 className="text-center text-slate-800 font-bold text-lg md:text-xl">سجل التقييمات</h2>

      <div className="flex flex-col md:flex-row md:items-end gap-4">
      {/* Academic Year Row */}
      <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-2 bg-slate-50/50 md:flex-1 md:h-[42px]">"""

content = content.replace(old_cb, new_cb)

# Find the end of Month Selector row to close the flex div
old_end = """        </div>
      </div>
    </div>
  );
};"""
new_end = """        </div>
      </div>
      </div>
    </div>
  );
};"""
content = content.replace(old_end, new_end)

# Also update the space-y-1 inside ControlBar so they take up flex space on md
old_term = """      {/* Term Selector */}
      <div className="space-y-1">"""
new_term = """      {/* Term Selector */}
      <div className="space-y-1 md:flex-1">"""
content = content.replace(old_term, new_term)

old_month = """      {/* Month and Count Selector row */}
      <div className="flex items-center gap-2">"""
new_month = """      {/* Month and Count Selector row */}
      <div className="flex items-center gap-2 md:flex-[2]">"""
content = content.replace(old_month, new_month)

with open('src/components/ControlBar.tsx', 'w') as f:
    f.write(content)

