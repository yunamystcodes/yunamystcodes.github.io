import html, json, re, urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
CODES = ROOT / 'codes.json'
HISTORY = ROOT / 'codes-history.json'
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

# Known expiry times published for the current SWC 2026 coupon set (JST = UTC+9).
EXPIRY_UTC = {
    # SWC Asia-Pacific 2026 coupons expired on 24 Oct 2026 at 14:00 BRT (17:00 UTC).
    'GAOTO10THSWC2026': '2026-10-24T17:00:00Z',
    'L3TSGO2SEOUL14NOV': '2026-10-24T17:00:00Z',
    'WELCOME2KRNGTHP': '2026-10-24T17:00:00Z',
    '2SOREIKENIPPON6': '2026-09-03T14:59:00Z',
    'APAC1K0UB4NGK0K': '2026-09-03T14:59:00Z',
    '2SWCTORONTOTHE6IX': '2026-09-04T07:00:00Z',
    'LAST4PUNCHIN': '2026-09-04T07:00:00Z',
    'SWCJOAAAKR26': '2026-09-04T15:00:00Z',
    'SWGAJA2BKK': '2026-09-04T15:00:00Z',
}


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
    for fmt in ('%Y-%m-%d', '%Y/%m/%d', '%Y.%m.%d'):
        try:
            return datetime.strptime(m.group(), fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            pass
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
    for c in CODE.findall(text.upper()):
        pos = text.upper().find(c)
        around = text[max(0, pos-80):pos+len(c)+80]
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
    # The history file is the site's persistent record of codes already confirmed expired.
    # Never publish a historically expired code again from a stale listing scrape.
    try:
        history = json.loads(HISTORY.read_text(encoding='utf-8')) if HISTORY.exists() else {}
    except (OSError, json.JSONDecodeError):
        history = {}
    history_expired = {str(c).upper() for c in history.get('expired', []) if str(c).strip()}
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

    # Remove codes already confirmed expired in the history before processing new findings.
    history_removed = [c for c in existing if c in history_expired]
    existing = [c for c in existing if c not in history_expired]
    for c in history_removed:
        rewards.pop(c, None)
        data.get('sources', {}).pop(c, None)
        data.get('expires', {}).pop(c, None)

    # Add only codes discovered on official Com2uS pages, excluding codes already
    # recorded as expired in the history so stale pages cannot resurrect them.
    additions = [c for c in found if c not in existing and c not in history_expired]
    existing.extend(additions)

    # Remove codes whose expiry is known either from the built-in official list
    # or from the per-code `expires` map in codes.json. Accept ISO-8601 timestamps
    # and date-only values; keep codes when an expiry value is malformed.
    now = datetime.now(timezone.utc)
    expiry_map = data.get('expires', {})
    expired = []
    for c in existing:
        raw_expiry = EXPIRY_UTC.get(c) or expiry_map.get(c)
        if not raw_expiry:
            continue
        try:
            value = str(raw_expiry).strip()
            expiry = datetime.fromisoformat(value.replace('Z', '+00:00'))
            if expiry.tzinfo is None:
                expiry = expiry.replace(tzinfo=timezone.utc)
            if now >= expiry:
                expired.append(c)
        except (TypeError, ValueError):
            errors.append(f'{c}: data de expiração inválida ({raw_expiry})')
    for c in expired:
        if c in existing:
            existing.remove(c)
        rewards.pop(c, None)
        sources.pop(c, None)
        expiry_map.pop(c, None)

    existing = list(dict.fromkeys(existing))
    for c in additions:
        sources[c] = ['official-com2us']
        rewards.setdefault(c, [])

    now_text = now.replace(microsecond=0).isoformat().replace('+00:00', 'Z')
    data.update({
        'updated': now_text,
        'source_count': len(OFFICIAL_LISTS),
        'successful_sources': len(OFFICIAL_LISTS) - sum('/page=' in e for e in errors),
        'rule': 'apenas fontes oficiais Com2uS; novos códigos adicionados automaticamente; códigos expirados removidos por data de validade; recompensas não são inventadas',
        'codes': existing,
        'rewards': rewards,
        'sources': sources,
        'expires': expiry_map,
        'source_errors': errors[:20],
    })
    CODES.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Oficiais encontrados: {len(found)} | novos: {len(additions)} | expirados removidos: {len(expired) + len(history_removed)} | ativos: {len(existing)}')


if __name__ == '__main__':
    main()
