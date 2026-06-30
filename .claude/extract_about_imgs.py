#!/usr/bin/env python3
import re

h = open('source/official-current-website/about(.renuesystems.com.about).html', encoding='utf-8', errors='ignore').read()
imgs = re.findall(r'https://static\.wixstatic\.com/media/[^"\s\)>,]+', h)
seen = set()
for img in imgs:
    if img not in seen:
        seen.add(img)
        print(img)
