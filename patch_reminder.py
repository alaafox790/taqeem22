import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_reminder_logic = """  // Auto-Reminder for upcoming assessments (Toast & Local Push Notification)
  useEffect(() => {
    const checkAndShowReminders = async () => {
      const lastReminderDate = localStorage.getItem('last_assessment_reminder_date');
      const today = new Date().toDateString();

      if (lastReminderDate === today) return; // Already shown today

      // Request browser notification permission if not determined
      if (window.Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        try {
          await Notification.requestPermission();
        } catch (e) {
          console.error('Notification permission error:', e);
        }
      }

      // Show in-app Toast
      setToast({
        type: 'info',
        message: '🔔 تذكير: لديك تقييمات قادمة يجب إنجازها خلال الـ 48 ساعة القادمة للحفاظ على مؤشر الالتزام.',
      });

      // Show Browser Push Notification
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('سجل التقييمات المدرسية', {
          body: 'تذكير: لديك تقييمات قادمة يرجى إنجازها خلال الـ 48 ساعة القادمة للفصول غير المنجزة.',
          icon: 'https://cdn-icons-png.flaticon.com/512/3234/3234972.png', // Fallback generic icon
        });
      }

      localStorage.setItem('last_assessment_reminder_date', today);
    };

    const timer = setTimeout(checkAndShowReminders, 3500);
    return () => clearTimeout(timer);
  }, []);"""

new_reminder_logic = """  // Auto-Reminder for upcoming assessments (Toast & Local Push Notification)
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkAndShowReminders = async () => {
      const lastReminderDate = localStorage.getItem('last_assessment_reminder_date');
      const todayDate = new Date();
      const todayStr = todayDate.toDateString();

      if (lastReminderDate === todayStr) return; // Already shown today

      // Calculate upcoming/overdue assessments for current month
      const currentYear = todayDate.getFullYear();
      const currentMonthNum = todayDate.getMonth() + 1;
      const currentDay = todayDate.getDate();

      const currentMonthInfo = MONTHS_DATA.find(m => m.monthNumber === currentMonthNum);
      
      let upcomingOrOverdue = null;

      if (currentMonthInfo && currentMonthInfo.assessments.length > 0) {
        const count = currentMonthInfo.assessments.length;
        const daysInMonth = new Date(currentYear, currentMonthNum, 0).getDate();
        const periodLength = daysInMonth / count;

        for (let i = 0; i < count; i++) {
          const assessNum = currentMonthInfo.assessments[i];
          const dueDateDay = Math.round(periodLength * (i + 1));
          const daysLeft = dueDateDay - currentDay;

          // Find if this assessment has been recorded for ANY class in the current term/month
          const hasRecords = records.some(r => r.month_id === currentMonthInfo.id && r.assess_num === assessNum);

          if (!hasRecords) {
            if (daysLeft < 0) {
              upcomingOrOverdue = `التقييم ${assessNum} متأخر (كان مستحقاً يوم ${dueDateDay})`;
              break;
            } else if (daysLeft <= 3) {
              upcomingOrOverdue = `التقييم ${assessNum} مستحق قريباً (يوم ${dueDateDay})`;
              break;
            }
          }
        }
      }

      if (!upcomingOrOverdue) {
        // No urgent reminders today, mark as checked so we don't keep polling unnecessarily
        // Only set if we actually have records loaded, so we don't accidentally silence it if records took long to load
        if (records.length > 0) {
          localStorage.setItem('last_assessment_reminder_date', todayStr);
        }
        return;
      }

      // Request browser notification permission if not determined
      if (window.Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        try {
          await Notification.requestPermission();
        } catch (e) {
          console.error('Notification permission error:', e);
        }
      }

      const message = `🔔 تنبيه استباقي: ${upcomingOrOverdue}. يرجى إنجازه في أقرب وقت.`;

      // Show in-app Toast
      setToast({
        type: 'info',
        message: message,
      });

      // Show Browser Push Notification
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('سجل التقييمات المدرسية', {
          body: message,
          icon: 'https://cdn-icons-png.flaticon.com/512/3234/3234972.png',
        });
      }

      localStorage.setItem('last_assessment_reminder_date', todayStr);
    };

    const timer = setTimeout(checkAndShowReminders, 4000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, records]);"""

content = content.replace(old_reminder_logic, new_reminder_logic)

with open('src/App.tsx', 'w') as f:
    f.write(content)
