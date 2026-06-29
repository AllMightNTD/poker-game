import re
import html

with open('Know_Ledge_Block.drawio', 'r') as f:
    content = f.read()

matches = re.findall(r'value="([^"]+)"', content)
for m in matches:
    decoded = html.unescape(m)
    if '<b>' in decoded and '<hr' in decoded:
        name_match = re.search(r'<b>(.*?)</b>', decoded)
        if name_match:
            table_name = name_match.group(1)
            parts = re.split(r'<hr[^>]*>', decoded)
            fields = []
            for part in parts[1:]:
                clean_part = re.sub(r'<[^>]+>', '\n', part)
                lines = [line.strip() for line in clean_part.split('\n') if line.strip()]
                fields.extend(lines)
            print(f"Table: {table_name}")
            for f in fields:
                print(f"  {f}")
            print()
