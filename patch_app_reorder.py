import re

with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

load_data_start = -1
load_data_end = -1
for i, line in enumerate(lines):
    if "const loadData = useCallback(async () => {" in line:
        load_data_start = i
    if load_data_start != -1 and "}, [teacher.id]);" in line:
        load_data_end = i
        break

if load_data_start != -1 and load_data_end != -1:
    load_data_lines = lines[load_data_start:load_data_end+1]
    
    # Remove it from the original location
    del lines[load_data_start:load_data_end+1]
    
    # Insert it before the first useEffect (at line 134 in the old numbering)
    for i, line in enumerate(lines):
        if "useEffect(() => {" in line:
            insert_idx = i
            break
            
    # Add a blank line before inserting
    lines.insert(insert_idx, "\\n")
    for j, l in enumerate(load_data_lines):
        lines.insert(insert_idx + 1 + j, l)
        
    with open('src/App.tsx', 'w') as f:
        f.writelines(lines)
