import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

find = """      const message = `🔔 تنبيه استباقي: ${upcomingOrOverdue}. يرجى إنجازه في أقرب وقت.`;

      // Show in-app Toast
      setToast({
        type: 'info',
        message: message,
      });"""

replace = """      const message = `تنبيه استباقي: ${upcomingOrOverdue}. يرجى إنجازه في أقرب وقت.`;

      // Show in-app custom Snackbar Reminder
      setReminderMessage(message);"""

content = content.replace(find, replace)

with open('src/App.tsx', 'w') as f:
    f.write(content)
