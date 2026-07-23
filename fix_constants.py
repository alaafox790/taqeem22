import re

with open('src/lib/constants.ts', 'r') as f:
    content = f.read()

# Update MonthInfo interface in types.ts first
