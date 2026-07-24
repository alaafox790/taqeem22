import re

for filename in ['src/components/AssessmentModal.tsx', 'src/components/ClassRosterManager.tsx']:
    with open(filename, 'r') as f:
        content = f.read()

    content = content.replace("const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;", "const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;")

    with open(filename, 'w') as f:
        f.write(content)
