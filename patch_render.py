import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

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
