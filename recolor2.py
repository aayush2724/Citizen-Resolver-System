import os

color_map = {
    "#3b82f6": "#1e3a8a", # Replace bright blue with dark navy (blue-900)
    "#1d4ed8": "#172554", # Replace dark blue with even darker navy (blue-950)
    "#1e3a8a": "#0f172a", # Replace darker text blue with slate-900
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
