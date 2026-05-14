import re
import os

color_map = {
    "#00c896": "#3b82f6", # blue-500 (Primary Bright)
    "#006c4f": "#1d4ed8", # blue-700 (Primary Dark)
    "#004d38": "#1e3a8a", # blue-900 (Darker Text)
    "#eef6ef": "#eff6ff", # blue-50 (Light Surface)
    "#e8f0e9": "#dbeafe", # blue-100 (Lighter Surface)
    "#bbcac1": "#bfdbfe", # blue-200 (Border)
    "#6c7a72": "#64748b", # slate-500 (Muted Text)
    "#f3fbf5": "#f8fafc", # slate-50 (Very Light Surface)
    "#3c4a43": "#334155", # slate-700 (Text Variant)
    "#e2eae4": "#bfdbfe", # blue-200 (Surface High)
}

def update_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
        
    with open(filepath, 'r') as f:
        content = f.read()

    # Apply all exact string replacements
    for old, new in color_map.items():
        content = content.replace(old, new)
        content = content.replace(old.upper(), new)

    with open(filepath, 'w') as f:
        f.write(content)
        
    print(f"Updated {filepath}")

# Update App.jsx and tailwind.config.js
update_file('client/src/App.jsx')
update_file('client/tailwind.config.js')

print("All done")
