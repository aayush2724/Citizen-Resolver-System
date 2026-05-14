import os

color_map = {
    "#3b82f6": "#213D76", # Primary Bright -> Primary IRCTC Blue
    "#1d4ed8": "#1F345E", # Primary Dark -> Dark Navy Blue
    "#1e3a8a": "#1F345E", # Darker Text -> Dark Navy Blue
    "#eff6ff": "#E0EDF8", # Light Surface -> Very Light Blue Background
    "#dbeafe": "#E0EDF8", # Lighter Surface -> Very Light Blue Background
    "#bfdbfe": "#7E8AA9", # Border -> Medium Slate Blue
    "#64748b": "#7E8AA9", # Muted Text -> Medium Slate Blue
    "#f8fafc": "#E0EDF8", # Very Light Surface -> Very Light Blue Background
    "#334155": "#1F345E", # Dark Text variant -> Dark Navy Blue
}

def update_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
        
    with open(filepath, 'r') as f:
        content = f.read()

    # Apply all exact string replacements safely
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
