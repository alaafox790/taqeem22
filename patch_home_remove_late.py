import re

with open('src/components/HomeScreen.tsx', 'r') as f:
    content = f.read()

# Remove LateAssessments import
content = re.sub(r"import \{ LateAssessments \} from '\./LateAssessments';\n", "", content)

# Remove the section
content = re.sub(r"\s*\{\/\* Late Assessments Section \*\/}.*?<\/div>\s*(<\/div>\s*<\/div>\s*\);\s*};|<\/div>\s*\);\s*};)", r"\n    </div>\n  );\n};\n", content, flags=re.DOTALL)

with open('src/components/HomeScreen.tsx', 'w') as f:
    f.write(content)
