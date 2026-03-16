import pathlib, re
root = pathlib.Path('c:/Users/satwi/OneDrive/Desktop/LearningCodingAgents/pm/frontend/out')
pattern = re.compile(r'Chat')
count = 0
for p in root.rglob('*.js'):
    try:
        t = p.read_text(errors='ignore')
    except Exception:
        continue
    if pattern.search(t):
        print('found in', p)
        count += 1
        if count >= 10:
            break
print('total', count)
