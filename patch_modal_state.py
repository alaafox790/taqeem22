import re

with open('src/components/AssessmentModal.tsx', 'r') as f:
    content = f.read()

old_state = """  const [notes, setNotes] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);"""

new_state = """  const [notes, setNotes] = useState<string>('');
  const [isHoliday, setIsHoliday] = useState<boolean>(false);
  const [holidayDesc, setHolidayDesc] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);"""

content = content.replace(old_state, new_state)

with open('src/components/AssessmentModal.tsx', 'w') as f:
    f.write(content)
