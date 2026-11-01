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
# Independent code directories used only to confirm expiry status.
STATUS_SOURCES = [
    'https://sw-teams.ovh/codes',
    'https://swcoupon.net/',
    'https://summonerswarcodes.us/',
    'https://swquery.net/',
    'https://swgt.io/gamecodes/',
    'https://mobi.gg/en/tips/free-summoners-war-codes/',
]
HEADERS = {'User-Agent': 'Mozilla/5.0 (YunaCodes automatic-code-maintenance)'}
CODE = re.compile(r'\b[A-Z0-9]{6,32}\b')
DATE = re.compile(r'20\d{2}[-/.]\d{1,2}[-/.]\d{1,2}')
LABEL = re.compile(r'(?:Coupon Code|Coupon Codes|Código do Cupom|Códigos do Cupom)\s*[:：]\s*([^<]{0,300})', re.I)
ANDROID = re.compile(r'\[(?:Android|ANDROID)\]\s*([A-Z0-9]{6,32})')
BAD = {'ANDROID','COUPON','CUPOM','SUMMONERS','WAR','SKYARENA','SKY','ARENA','COM2US','CODE','CODES','REWARD','REWARDS','ACTIVE','EXPIRED'}
EXPIRED_SIGNAL = re.compile(
    r'\b(expired|expirad[oa]s?|expirou|inactive|invalid code|not valid|'
    r'no longer works?|no longer working|not working|does not work|'
    r'doesn.t work|ended|already used up)\b', re.I
)

# Official expiry timestamps already verified for specific SWC coupons.
EXPIRY_UTC = {
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
    with urllib.request.urlopen(req, timeout=25) as response:
        return response.read().decode('utf-8', 'ignore')


def clean(raw):
    raw = re.sub(r'<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>', ' ', raw, flags=re.I|re.S)
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', raw))).strip()


def code_ok(code):
    return (6 <= len(code) <= 32 and code not in BAD
            and re.search(r'[A-Z]', code) and re.search(r'\d', code))


def links(raw):
    out = set()
    for href in re.findall(r'href=["\']([^"\']+)["\']', raw, re.I):
        if re.search(r'/skyarena/news/list/\d+', href):
            out.add(urljoin('https://www.summonerswar.com', href.split('?')[0]))
    return out


def published(text):
    match = DATE.search(text)
    if not match:
        return None
    for fmt in ('%Y-%m-%d', '%Y/%m/%d', '%Y.%m.%d'):
        try:
            return datetime.strptime(match.group(), fmt).replace(tzinfo=timezone.utc)
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
    for match in LABEL.finditer(text):
        found += CODE.findall(match.group(1).upper())
    found += ANDROID.findall(text.upper())
    for code in CODE.findall(text.upper()):
        pos = text.upper().find(code)
        around = text[max(0, pos-80):pos+len(code)+80]
        if '[ANDROID]' in around.upper() and code not in found:
            found.append(code)
    return [(code, url) for code in dict.fromkeys(found) if code_ok(code)]


def confirmed_expired_codes(candidates, errors):
    """Return codes explicitly marked expired by at least two independent sources."""
    evidence = {}
    successful = 0
    for url in STATUS_SOURCES:
        try:
            text = clean(fetch(url))
            successful += 1
            upper = text.upper()
            for code in candidates:
                start = 0
                while True:
                    pos = upper.find(code, start)
                    if pos < 0:
                        break
                    context = text[max(0, pos-220):pos+len(code)+220]
                    if EXPIRED_SIGNAL.search(context):
                        evidence.setdefault(code, set()).add(url)
                    start = pos + len(code)
        except Exception as exc:
            errors.append(f'{url}: {exc}')
    return {code for code, urls in evidence.items() if len(urls) >= 2}, successful, evidence


def expiry_has_passed(raw_expiry, now):
    value = str(raw_expiry).strip()
    # A date without a time means valid through the end of that UTC date.
    if re.fullmatch(r'20\d{2}-\d{2}-\d{2}', value):
        expiry = datetime.fromisoformat(value).replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
    else:
        expiry = datetime.fromisoformat(value.replace('Z', '+00:00'))
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
    return now >= expiry


def main():
    data = json.loads(CODES.read_text(encoding='utf-8')) if CODES.exists() else {}
    existing = list(dict.fromkeys(str(code).strip().upper() for code in data.get('codes', []) if str(code).strip()))
    try:
        history = json.loads(HISTORY.read_text(encoding='utf-8')) if HISTORY.exists() else {}
    except (OSError, json.JSONDecodeError):
        history = {}

    history_expired = {str(code).strip().upper() for code in history.get('expired', []) if str(code).strip()}
    rewards = data.get('rewards', {}) if isinstance(data.get('rewards'), dict) else {}
    sources = data.get('sources', {}) if isinstance(data.get('sources'), dict) else {}
    expiry_map = data.get('expires', {}) if isinstance(data.get('expires'), dict) else {}
    errors = []
    found = {}
    official_success = 0

    # Discover new codes from official Com2uS announcements.
    for base in OFFICIAL_LISTS:
        for page in range(1, 4):
            url = base.format(page)
            try:
                listing = fetch(url)
                official_success += 1
                for article_url in links(listing):
                    try:
                        for code, source in parse_page(article_url, fetch(article_url)):
                            found.setdefault(code, set()).add(source)
                    except Exception as exc:
                        errors.append(f'{article_url}: {exc}')
            except Exception as exc:
                errors.append(f'{url}: {exc}')

    # Remove anything already recorded as expired, even if a stale source republishes it.
    history_removed = [code for code in existing if code in history_expired]
    existing = [code for code in existing if code not in history_expired]
    for code in history_removed:
        rewards.pop(code, None)
        sources.pop(code, None)
        expiry_map.pop(code, None)

    additions = [code for code in found if code not in existing and code not in history_expired]
    existing.extend(additions)
    for code in additions:
        sources[code] = ['official-com2us']
        rewards.setdefault(code, [])

    now = datetime.now(timezone.utc)
    date_expired = set()
    for code in existing:
        raw_expiry = EXPIRY_UTC.get(code) or expiry_map.get(code)
        if not raw_expiry:
            continue
        try:
            if expiry_has_passed(raw_expiry, now):
                date_expired.add(code)
        except (TypeError, ValueError):
            errors.append(f'{code}: data de expiração inválida ({raw_expiry})')

    # Check remaining codes against independent live directories. Two confirmations
    # are required to avoid deleting a valid code because of one incorrect listing.
    candidates = set(existing) - date_expired
    source_expired, status_success, evidence = confirmed_expired_codes(candidates, errors)
    expired = date_expired | source_expired

    for code in expired:
        rewards.pop(code, None)
        sources.pop(code, None)
        expiry_map.pop(code, None)

    existing = [code for code in existing if code not in expired]
    existing = list(dict.fromkeys(existing))

    # Keep the history as a permanent blocklist so expired codes cannot reappear.
    history_expired.update(expired)
    history_expired.discard('')
    history['expired'] = sorted(history_expired)
    history['active'] = existing
    history['updated_at'] = now.replace(microsecond=0).isoformat().replace('+00:00', 'Z')
    history['rewards'] = {code: rewards.get(code, []) for code in existing}
    history['sources'] = {code: sources.get(code, []) for code in existing}
    HISTORY.write_text(json.dumps(history, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    now_text = now.replace(microsecond=0).isoformat().replace('+00:00', 'Z')
    data.update({
        'updated': now_text,
        'source_count': len(OFFICIAL_LISTS) * 3 + len(STATUS_SOURCES),
        'successful_sources': official_success + status_success,
        'rule': 'códigos expirados removidos por data de validade ou confirmação em pelo menos duas fontes independentes; histórico impede que códigos expirados reapareçam',
        'codes': existing,
        'rewards': rewards,
        'sources': sources,
        'expires': expiry_map,
        'source_errors': errors[:20],
    })
    CODES.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    confirmed_count = len(source_expired)
    print(
        f'Novos códigos oficiais: {len(additions)} | expirados por data: {len(date_expired)} '
        f'| expirados confirmados por fontes: {confirmed_count} | '
        f'expirados removidos do histórico/lista: {len(expired) + len(history_removed)} '
        f'| ativos: {len(existing)}'
    )


if __name__ == '__main__':
    main()
