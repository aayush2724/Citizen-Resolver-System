import re

with open('client/src/App.jsx', 'r') as f:
    content = f.read()

# Add dark mode variants for text colors
content = content.replace('text-[#161d1a]', 'text-[#161d1a] dark:text-[#e8f0e9]')
content = content.replace('text-[#3c4a43]', 'text-[#3c4a43] dark:text-[#bbcac1]')
content = content.replace('text-[#6c7a72]', 'text-[#6c7a72] dark:text-[#bbcac1]')

# Add dark mode variants for background colors
content = content.replace('bg-white/80', 'bg-white/80 dark:bg-[#161d1a]/80')
content = content.replace('bg-white/95', 'bg-white/95 dark:bg-[#161d1a]/95')
content = content.replace('bg-[#e8f0e9]', 'bg-[#e8f0e9] dark:bg-[#2a322e]')
content = content.replace('bg-[#eef6ef]', 'bg-[#eef6ef] dark:bg-[#2a322e]')
content = content.replace('bg-[#eef6ef]/50', 'bg-[#eef6ef]/50 dark:bg-[#2a322e]/50')

# Specifically for bg-white (this one is tricky, let's use regex to avoid replacing white in combinations like bg-white/80, which we already replaced)
content = re.sub(r'\bbg-white\b(?!/)', 'bg-white dark:bg-[#161d1a]', content)

# Add dark mode variants for border colors
content = content.replace('border-[#bbcac1]/30', 'border-[#bbcac1]/30 dark:border-white/10')
content = content.replace('border-white/50', 'border-white/50 dark:border-white/10')
content = content.replace('border-[#6c7a72]/50', 'border-[#6c7a72]/50 dark:border-white/10')
content = content.replace('border-[#bbcac1]/20', 'border-[#bbcac1]/20 dark:border-white/10')

# For the Home page specific boxes: 
content = content.replace('bg-white dark:bg-[#161d1a]/80 backdrop-blur-sm', 'bg-white/80 dark:bg-[#161d1a]/80 backdrop-blur-sm')

# Make sure we didn't duplicate any
content = content.replace('dark:text-[#e8f0e9] dark:text-[#e8f0e9]', 'dark:text-[#e8f0e9]')
content = content.replace('dark:text-[#bbcac1] dark:text-[#bbcac1]', 'dark:text-[#bbcac1]')
content = content.replace('dark:bg-[#161d1a] dark:bg-[#161d1a]', 'dark:bg-[#161d1a]')

with open('client/src/App.jsx', 'w') as f:
    f.write(content)

print("Done")
