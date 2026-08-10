import re

with open('index.html', 'r') as f:
    content = f.read()

script = """
    <script>
      window.deferredPrompt = null;
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        window.deferredPrompt = e;
        window.dispatchEvent(new Event('pwa-prompt-ready'));
      });
    </script>
  </head>
"""

content = content.replace("</head>", script)

with open('index.html', 'w') as f:
    f.write(content)

