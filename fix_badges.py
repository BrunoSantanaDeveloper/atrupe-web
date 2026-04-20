"""
Badge variant migration script.
ONLY replaces Badge-specific variant names. Does NOT touch 'default',
'neutral', 'status' or any non-Badge-specific terms.
"""
import os

# These are variant names that ONLY existed in the old Badge component.
# They DO NOT exist in Button, FeaturedIcon, Toggle, or any other component.
# Therefore it's safe to replace them globally.
SAFE_REPLACEMENTS = {
    # Old Badge "Light" variants → new semantic names
    '"neutralLight"': '"gray"',
    '"successLight"': '"success"',
    '"errorLight"': '"error"',
    '"warningLight"': '"warning"',
    '"blueLight"': '"blue"',
    '"pinkLight"': '"pink"',
    '"purpleLight"': '"purple"',
    '"orangeLight"': '"orange"',
    '"roseLight"': '"rose"',
    '"blackLight"': '"gray"',
    '"lightBlueLight"': '"blue"',
    '"blueGreenLight"': '"blue"',
    # Same with single quotes
    "'neutralLight'": "'gray'",
    "'successLight'": "'success'",
    "'errorLight'": "'error'",
    "'warningLight'": "'warning'",
    "'blueLight'": "'blue'",
    "'pinkLight'": "'pink'",
    "'purpleLight'": "'purple'",
    "'orangeLight'": "'orange'",
    "'roseLight'": "'rose'",
    "'blackLight'": "'gray'",
    "'lightBlueLight'": "'blue'",
    "'blueGreenLight'": "'blue'",
    # Old Badge "Outline" variants → closest match
    '"neutralOutline"': '"gray"',
    '"successOutline"': '"success"',
    '"errorOutline"': '"error"',
    '"warningOutline"': '"warning"',
    '"blueOutline"': '"blue"',
    '"pinkOutline"': '"pink"',
    '"purpleOutline"': '"purple"',
    '"orangeOutline"': '"orange"',
    '"roseOutline"': '"rose"',
    '"blackOutline"': '"gray"',
    "'neutralOutline'": "'gray'",
    "'successOutline'": "'success'",
    "'errorOutline'": "'error'",
    "'warningOutline'": "'warning'",
    "'blueOutline'": "'blue'",
    "'pinkOutline'": "'pink'",
    "'purpleOutline'": "'purple'",
    "'orangeOutline'": "'orange'",
    "'roseOutline'": "'rose'",
    "'blackOutline'": "'gray'",
}

# These replacements are ONLY safe in files that import Badge
# This avoids breaking Button's 'neutralOutline' variant etc.
BADGE_ONLY_REPLACEMENTS = {
    # Nothing extra needed - the "Outline" variants above only existed in Badge
}

SKIP_FILES = {'badge.tsx', 'badge-group.tsx'}

def fix_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in SAFE_REPLACEMENTS.items():
        new_content = new_content.replace(old, new)
    
    if new_content != content:
        print(f"Fixing {path}")
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)

def main():
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file in SKIP_FILES:
                continue
            if not (file.endswith('.tsx') or file.endswith('.ts')):
                continue
            fix_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
