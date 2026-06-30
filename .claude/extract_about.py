#!/usr/bin/env python3
import re

def extract(path):
    h = open(path, encoding='utf-8', errors='ignore').read()
    imgs = re.findall(r'<img[^>]+src=["\'](https?://[^"\']+)["\'][^>]*>', h, re.I)
    h = re.sub(r'<script.*?</script>', ' ', h, flags=re.S|re.I)
    h = re.sub(r'<style.*?</style>', ' ', h, flags=re.S|re.I)
    h = re.sub(r'<svg.*?</svg>', ' ', h, flags=re.S|re.I)
    h = re.sub(r'<!--.*?-->', ' ', h, flags=re.S)
    h = re.sub(r'<br\s*/?>', '\n', h, flags=re.I)
    h = re.sub(r'</(p|div|li|h[1-6]|span|tr)>', '\n', h, flags=re.I)
    text = re.sub(r'<[^>]+>', ' ', h)
    text = (text.replace('&nbsp;', ' ').replace('&amp;', '&')
            .replace('&rsquo;', '\u2019').replace('&ldquo;', '\u201c')
            .replace('&rdquo;', '\u201d').replace('&reg;', '\u00ae')
            .replace('&trade;', '\u2122').replace('&#39;', "'"))
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n[ \t]+', '\n', text)
    text = re.sub(r'\n{2,}', '\n', text)
    lines = [l.strip() for l in text.split('\n')]
    lines = [l for l in lines if l and len(l) > 2]
    return lines, imgs

lines, imgs = extract('source/official-current-website/about(.renuesystems.com.about).html')
print('=== TEXT CONTENT ===')
for l in lines:
    print(l)
print()
print('=== IMAGES ===')
for img in imgs[:30]:
    print(img)
