import re

with open('src/components/AssessmentModal.tsx', 'r') as f:
    content = f.read()

old_submit = """  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation checks
    if (!academicYear || !academicYear.trim()) {
      setValidationError('يرجى إدخال العام الدراسي أولاً في القائمة الرئيسية (مثال: 2026/2027).');
      return;
    }

    if (!grade) {
      setValidationError('يرجى اختيار الصف الدراسي.');
      return;
    }

    if (!classNum || classNum < 1 || classNum > 15) {
      setValidationError('يرجى اختيار رقم الفصل بين 1 و 15.');
      return;
    }

    if (!assessDate) {
      setValidationError('يرجى تحديد تاريخ التقييم.');
      return;
    }

    const partialRecord: Partial<AssessmentRecord> = {
      teacher_id: teacherId,
      academic_year: academicYear.trim(),
      term_id: selectedTerm,
      month_id: selectedMonth.id,
      assess_num: assessNum,
      grade,
      class_num: classNum,
      assess_date: assessDate,
      notes: notes.trim(),
      timing_status: timingResult.isExceptional ? 'exceptional' : 'normal',
      timing_period: timingResult.period,
      model_form: isRandomDistribution ? 'عشوائي' : modelForm,
    };

    onSave(partialRecord, timingResult.isExceptional);
  };"""

new_submit = """  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation checks
    if (!academicYear || !academicYear.trim()) {
      setValidationError('يرجى إدخال العام الدراسي أولاً في القائمة الرئيسية (مثال: 2026/2027).');
      return;
    }

    if (!grade) {
      setValidationError('يرجى اختيار الصف الدراسي.');
      return;
    }

    if (!classNum || classNum < 1 || classNum > 15) {
      setValidationError('يرجى اختيار رقم الفصل بين 1 و 15.');
      return;
    }

    if (!assessDate) {
      setValidationError('يرجى تحديد تاريخ التقييم.');
      return;
    }
    
    // Friday validation
    const dateObj = new Date(assessDate);
    if (!isHoliday && dateObj.getDay() === 5) { // 5 is Friday
      setValidationError('لا يمكن تسجيل تقييم يوم الجمعة. إذا كان عطلة يرجى تفعيل خيار العطلة.');
      return;
    }

    if (isHoliday && !holidayDesc) {
      setValidationError('يرجى تحديد سبب العطلة / الغياب.');
      return;
    }

    const partialRecord: Partial<AssessmentRecord> = {
      teacher_id: teacherId,
      academic_year: academicYear.trim(),
      term_id: selectedTerm,
      month_id: selectedMonth.id,
      assess_num: assessNum,
      grade,
      class_num: classNum,
      assess_date: assessDate,
      notes: notes.trim(),
      timing_status: timingResult.isExceptional ? 'exceptional' : 'normal',
      timing_period: timingResult.period,
      model_form: isRandomDistribution ? 'عشوائي' : modelForm,
      is_holiday: isHoliday,
      holiday_desc: isHoliday ? holidayDesc : undefined
    };

    onSave(partialRecord, timingResult.isExceptional);
  };"""

content = content.replace(old_submit, new_submit)

with open('src/components/AssessmentModal.tsx', 'w') as f:
    f.write(content)
