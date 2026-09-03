import html, json, re, urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
CODES = ROOT / 'codes.json'
OFFICIAL_LISTS = [
    'https://www.summonerswar.com/pt/skyarena/news/list?page={}',
    'https://www.summonerswar.com/en/skyarena/news/list?page={}',
]
HEADERS = {'User-Agent': 'Mozilla/5.0 (YunaCodes official-code-updater)'}
CODE = re.compile(r'\b[A-Z0-9]{6,32}\b')
DATE = re.compile(r'20\d{2}[-/.]\d{1,2}[-/.]\d{1,2}')
LABEL = re.compile(r'(?:Coupon Code|Coupon Codes|Código do Cupom|Códigos do Cupom)\s*[:：]\s*([^<]{0,300})', re.I)
ANDROID = re.compile(r'\[(?:Android|ANDROID)\]\s*([A-Z0-9]{6,32})')
BAD = {'ANDROID','COUPON','CUPOM','SUMMONERS','WAR','SKYARENA','SKY','ARENA','COM2US','CODE','CODES','REWARD','REWARDS','ACTIVE','EXPIRED'}


def fetch(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode('utf-8', 'ignore')


def clean(raw):
    raw = re.sub(r'<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>', ' ', raw, flags=re.I|re.S)
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', raw))).strip()


def code_ok(c):
    return (6 <= len(c) <= 32 and c not in BAD and re.search(r'[A-Z]', c)
            and re.search(r'\d', c))


def links(raw):
    out = set()
    for href in re.findall(r'href=["\']([^"\']+)["\']', raw, re.I):
        if re.search(r'/skyarena/news/list/\d+', href):
            out.add(urljoin('https://www.summonerswar.com', href.split('?')[0]))
    return out


def published(text):
    m = DATE.search(text)
    if not m:
        return None
    try:
        return datetime.strptime(m.group(), '%Y-%m-%d').replace(tzinfo=timezone.utc)
    except ValueError:
        try:
            return datetime.strptime(m.group(), '%Y/%m/%d').replace(tzinfo=timezone.utc)
        except ValueError:
            return None


def parse_page(url, raw):
    text = clean(raw)
    pub = published(text)
    if pub and pub < datetime.now(timezone.utc) - timedelta(days=60):
        return []
    if not re.search(r'coupon|cupom', text, re.I):
        return []
    found = []
    for m in LABEL.finditer(text):
        found += CODE.findall(m.group(1).upper())
    found += ANDROID.findall(text.upper())
    # Some official SWC posts place Android codes directly after a reward section.
    for c in CODE.findall(text.upper()):
        around = text[max(0, text.upper().find(c)-80):text.upper().find(c)+len(c)+80]
        if '[ANDROID]' in around.upper() and c not in found:
            found.append(c)
    result = []
    for c in dict.fromkeys(found):
        if code_ok(c):
            result.append((c, url))
    return result


def main():
    data = json.loads(CODES.read_text(encoding='utf-8')) if CODES.exists() else {}
    existing = [str(c).upper() for c in data.get('codes', [])]
    rewards = data.get('rewards', {})
    sources = data.get('sources', {})
    found = {}
    errors = []

    for base in OFFICIAL_LISTS:
        for page in range(1, 4):
            try:
                listing = fetch(base.format(page))
                for url in links(listing):
                    try:
                        for code, source in parse_page(url, fetch(url)):
                            found.setdefault(code, set()).add(source)
                    except Exception as exc:
                        errors.append(f'{url}: {exc}')
            except Exception as exc:
                errors.append(f'{base.format(page)}: {exc}')

    # Only official Com2uS coupon pages can add a new code.
    additions = [c for c in found if c not in existing]
    existing.extend(additions)

    # Confirmed expired legacy code from the previous site data.
    if datetime.now(timezone.utc).date() > datetime(2026, 8, 31):
        existing = [c for c in existing if c != 'AUGSW2026V7N']
        rewards.pop('AUGSW2026V7N', None)
        sources.pop('AUGSW2026V7N', None)

    existing = list(dict.fromkeys(existing))
    for c in additions:
        sources[c] = ['official-com2us']
        rewards.setdefault(c, [])

    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')
    data.update({
        'updated': now,
        'source_count': len(OFFICIAL_LISTS),
        'successful_sources': len(OFFICIAL_LISTS) - sum('/page=' in e for e in errors),
        'rule': 'apenas fontes oficiais Com2uS; novos códigos adicionados automaticamente; código expirado removido; recompensas não são inventadas',
        'codes': existing,
        'rewards': rewards,
        'sources': sources,
        'source_errors': errors[:20],
    })
    CODES.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Oficiais encontrados: {len(found)} | novos: {len(additions)} | ativos: {len(existing)}')


if __name__ == '__main__':
    main()
