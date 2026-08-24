from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

patterns = [
    r'\s*<section class="feedback-section" id="feedback">[\s\S]*?</section>',
    r'\s*<div class="feedback-section" id="feedback">[\s\S]*?</div>\s*',
    r'\s*<div class="feedback-section-new" id="feedbackNew">[\s\S]*?</div>\s*',
    r'\s*<section id="ym-feedback-system"[\s\S]*?</section>\s*',
    r'\s*<div class="feedback-modal-new" id="feedbackModalNew">[\s\S]*?</div>\s*',
    r'\s*<div class="feedback-modal" id="feedbackModal">[\s\S]*?</div>\s*',
    r'\s*<button class="feedback-open"[\s\S]*?</button>\s*'
]

removed = 0
for pattern in patterns:
    s, n = re.subn(pattern, '', s, count=1, flags=re.S)
    removed += n

p.write_text(s, encoding='utf-8')
print(f'Feedback removido: {removed} bloco(s)')
