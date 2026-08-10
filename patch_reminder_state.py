import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("  const [toast, setToast] = useState<ToastMessage | null>(null);", "  const [toast, setToast] = useState<ToastMessage | null>(null);\n  const [reminderMessage, setReminderMessage] = useState<string | null>(null);")
content = content.replace("import { Toast, ToastMessage } from './components/Toast';", "import { Toast, ToastMessage } from './components/Toast';\nimport { SnackbarReminder } from './components/SnackbarReminder';")

reminder_logic_find = """      // Show in-app Toast
      setToast({
        type: 'info',
        message: message,
      });"""

reminder_logic_replace = """      // Show in-app custom Snackbar Reminder
      setReminderMessage(message);"""

content = content.replace(reminder_logic_find, reminder_logic_replace)

toast_render_find = """      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>"""

toast_render_replace = """      <Toast toast={toast} onDismiss={() => setToast(null)} />
      {reminderMessage && (
        <SnackbarReminder 
          message={reminderMessage} 
          onDismiss={() => setReminderMessage(null)} 
          duration={15000} 
        />
      )}
    </div>"""

content = content.replace(toast_render_find, toast_render_replace)

with open('src/App.tsx', 'w') as f:
    f.write(content)
