import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

old_header = "      {/* Table Container - Compact for minimal scrolling */}"
new_header = """      {/* Selected Class Banner */}
      {selectedGrade && selectedClassNum && (
        <div className={`mt-4 mb-2 p-3 rounded-xl flex items-center justify-between border ${currentAppearance.color}`}>
          <div className="flex items-center gap-2">
            {renderIcon(currentAppearance.icon, "w-5 h-5")}
            <h3 className="font-bold text-sm">
              الصف {selectedGrade} - فصل {selectedClassNum}
            </h3>
          </div>
          <button
            onClick={() => setIsAppearanceModalOpen(true)}
            className="p-1.5 hover:bg-white/50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <Palette className="w-4 h-4" />
            تخصيص
          </button>
        </div>
      )}

      {/* Table Container - Compact for minimal scrolling */}"""

content = content.replace(old_header, new_header)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
