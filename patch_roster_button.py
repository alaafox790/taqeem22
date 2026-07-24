import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

old_func = """  const renderAttendanceButton = (studentId: string, studentName: string, assessNum: number) => {

    const status = getAttendanceStatus(studentId, assessNum);
    
    let btnClass = "w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 shadow-sm mx-auto cursor-pointer border group-hover/btn:scale-110 group-hover/btn:-rotate-6 group-hover/btn:shadow-md active:scale-95";
    let icon = <Minus className="w-3 h-3 text-slate-400" />;

    if (status === 'present') {
      btnClass += " bg-emerald-100 border-emerald-300 group-hover/btn:bg-emerald-500 group-hover/btn:border-emerald-600";
      icon = <Check className="w-3.5 h-3.5 text-emerald-600 group-hover/btn:text-white transition-colors" strokeWidth={3} />;
    } else if (status === 'absent') {
      btnClass += " bg-rose-100 border-rose-300 group-hover/btn:bg-rose-500 group-hover/btn:border-rose-600";
      icon = <X className="w-3.5 h-3.5 text-rose-600 group-hover/btn:text-white transition-colors" strokeWidth={3} />;
    } else if (status === 'excused') {
      btnClass += " bg-amber-100 border-amber-300 group-hover/btn:bg-amber-500 group-hover/btn:border-amber-600";
      icon = <Minus className="w-3.5 h-3.5 text-amber-600 group-hover/btn:text-white transition-colors" strokeWidth={3} />;
    } else {
      btnClass += " bg-slate-50 border-slate-200 group-hover/btn:bg-emerald-50 group-hover/btn:border-emerald-200";
      icon = <Check className="w-3.5 h-3.5 text-transparent group-hover/btn:text-emerald-200 transition-colors" strokeWidth={3} />; 
    }

    return (
      <button
        onClick={() => toggleAttendance(studentId, studentName, assessNum)}
        className={`${btnClass} group/btn`}
        title={status === 'present' ? 'حاضر' : status === 'absent' ? 'غائب' : status === 'excused' ? 'بعذر' : 'غير مسجل'}
      >
        {icon}
      </button>
    );
  };"""

new_func = """  const renderAttendanceButton = (studentId: string, studentName: string, assessNum: number) => {
    // Check if this assessment is a holiday for this class
    const isHoliday = records.some(r => 
      r.grade === selectedGrade && 
      r.class_num.toString() === selectedClassNum && 
      r.term_id === selectedTerm && 
      r.assess_num === assessNum && 
      r.is_holiday
    );

    if (isHoliday) {
      return (
        <div 
          className="w-6 h-6 rounded-md flex items-center justify-center bg-rose-50 border border-rose-200 text-rose-400 mx-auto cursor-help"
          title="عطلة / غياب (تم تخطي التقييم)"
        >
          <span className="text-[9px] font-black leading-none">عطلة</span>
        </div>
      );
    }

    const status = getAttendanceStatus(studentId, assessNum);
    
    let btnClass = "w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 shadow-sm mx-auto cursor-pointer border group-hover/btn:scale-110 group-hover/btn:-rotate-6 group-hover/btn:shadow-md active:scale-95";
    let icon = <Minus className="w-3 h-3 text-slate-400" />;

    if (status === 'present') {
      btnClass += " bg-emerald-100 border-emerald-300 group-hover/btn:bg-emerald-500 group-hover/btn:border-emerald-600";
      icon = <Check className="w-3.5 h-3.5 text-emerald-600 group-hover/btn:text-white transition-colors" strokeWidth={3} />;
    } else if (status === 'absent') {
      btnClass += " bg-rose-100 border-rose-300 group-hover/btn:bg-rose-500 group-hover/btn:border-rose-600";
      icon = <X className="w-3.5 h-3.5 text-rose-600 group-hover/btn:text-white transition-colors" strokeWidth={3} />;
    } else if (status === 'excused') {
      btnClass += " bg-amber-100 border-amber-300 group-hover/btn:bg-amber-500 group-hover/btn:border-amber-600";
      icon = <Minus className="w-3.5 h-3.5 text-amber-600 group-hover/btn:text-white transition-colors" strokeWidth={3} />;
    } else {
      btnClass += " bg-slate-50 border-slate-200 group-hover/btn:bg-emerald-50 group-hover/btn:border-emerald-200";
      icon = <Check className="w-3.5 h-3.5 text-transparent group-hover/btn:text-emerald-200 transition-colors" strokeWidth={3} />; 
    }

    return (
      <button
        onClick={() => toggleAttendance(studentId, studentName, assessNum)}
        className={`${btnClass} group/btn`}
        title={status === 'present' ? 'حاضر' : status === 'absent' ? 'غائب' : status === 'excused' ? 'بعذر' : 'غير مسجل'}
      >
        {icon}
      </button>
    );
  };"""

content = content.replace(old_func, new_func)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
