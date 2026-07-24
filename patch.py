with open('src/components/ClassRosterManager.tsx', 'r') as f:
    content = f.read()

import re

old_block = """      const canvas = await html2canvas(wrapper, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: wrapper.scrollWidth + 50,
        windowHeight: wrapper.scrollHeight + 50
      });
      
      document.body.removeChild(wrapper);

      const dataUrl = canvas.toDataURL('image/png');"""

new_block = """      const dataUrl = await toPng(wrapper, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        skipFonts: false,
      });
      
      document.body.removeChild(wrapper);"""

if old_block in content:
    content = content.replace(old_block, new_block)
    print("Patched!")
else:
    print("Could not find the block.")

with open('src/components/ClassRosterManager.tsx', 'w') as f:
    f.write(content)
