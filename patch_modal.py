import re

with open('src/components/TeacherProfileModal.tsx', 'r') as f:
    content = f.read()

# Add icon imports
content = content.replace("import { X, User, Check, Save, Calendar, Plus, Trash2 } from 'lucide-react';", "import { X, User, Check, Save, Calendar, Plus, Trash2, Book, Calculator, Globe, FlaskConical, Languages, Music, Palette, PenTool, Dna, Code } from 'lucide-react';")

# Add state for subjectIcon
content = content.replace("const [subject, setSubject] = useState(teacher.subject);", "const [subject, setSubject] = useState(teacher.subject);\n  const [subjectIcon, setSubjectIcon] = useState(teacher.subjectIcon || 'Book');")

# Find handleSubmit function
handle_submit_match = re.search(r"const handleSubmit = \(e: React\.FormEvent\) => \{.*?e\.preventDefault\(\);.*?const updated: TeacherProfile = \{.*?\};", content, re.DOTALL)
if handle_submit_match:
    # Actually wait, handleSubmit was NOT printed because it was truncated. Let's find out how it's written.
    pass

