import re

with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const [isModalOpen, setIsModalOpen] = useState(false);",
    "const [isModalOpen, setIsModalOpen] = useState(false);\n  const [showAllAssessments, setShowAllAssessments] = useState(false);"
)

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
