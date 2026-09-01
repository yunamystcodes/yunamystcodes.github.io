import html
import json
import re
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CODES = ROOT / 'codes.json'
HISTORY = ROOT / 'codes-history.json'

# Fontes que mantêm listas de cupons atualizadas. A lista publicada é sempre
# reconstruída a partir do estado atual dessas fontes; não recuperamos códigos
# antigos só porque estavam no snapshot anterior.
SOURCES = (
    ('sw-teams', 'https://sw-teams.ovh/codes'),
    ('swcoupon', 'https://swcoupon.net/'),
    ('summonerswarcodes', 'https://summonerswarcodes.us/'),
    ('swquery', 'https://swquery.net/'),
)
TRUSTED = {name for name, _url in SOURCES}

# Falsos positivos/códigos que já foram identificados no site e devem deixar
# de aparecer imediatamente. Depois disso, a remoção normal é automática:
# se um código desaparecer das fontes ativas, ele sai do codes.json.
KNOWN_BAD = {
    '9CIRCLE',
    'CCXQDUIH4A4',
    'SWC2026',
    'THE10TH',
    'GLHF2026AMERICAS', 'SWC26X10LEGACYBND', 'PAI2026BANGKOK',
    'APAC26LEGASEA', '912XUXIECHUANQI', 'SWC2026JUELEBA',
    'LAST4PUNCHIN',
    'H4MBURGISWAITING', 'HURRASWC2026', '4MINGYIDAOXIAN',
    'YYDSSWC26ZAN', '1SURPR1SE', '1SURPR1SEG1FT',
    'AUGSW2026V7N', 'SWXFRIEREN2026'
}

BANNED = {
    'ACTIVE','EXPIRED','WORKING','AVAILABLE','CODES','CODE','SUMMONERS','WAR',
    'SKY','ARENA','ENERGY','MANA','SCROLL','REDEEM','COUPON','COPY','REWARD',
    'REWARDS','LATEST','NEW','GUIDE','GAME','GAMES','COM2US','ANDROID','IPHONE',
    'WINDOWS','FACEBOOK','DISCORD','TWITTER','INSTAGRAM','YOUTUBE','CURRENTLY',
    'PROMO','PROMOTIONAL','VERIFIED','NOEXPIRATION'
}

CODE_RE = re.compile(r'(?<![A-Z0-9])[A-Z0-9][A-Z0-9_-]{5,31}(?![A-Z0-9])', re.I)
ACTIVE_WORDS = (
    'active', 'available', 'working', 'verified', 'no expiration',
    'new & active', 'new and active', 'currently working'
)
EXPIRED_WORDS = ('expired', 'no longer working', 'inactive', 'not working')

# Recompensas conhecidas para códigos que aparecem sem recompensa legível na
# página. Novos códigos continuam sendo descobertos automaticamente.
KNOWN_REWARDS = {
    'SWGAJA2BKK': [['mana','x200000'],['gold','x1']],
    'SWCJOAAAKR26': [['gold','x1']],
    '2SWCTORONTOTHE6IX': [['energy','x100'],['gold','x1']],
    'APAC1K0UB4NGK0K': [['energy','x100'],['gold','x1']],
    '2SOREIKENIPPON6': [['mana','x200000'],['gold','x1']],
    'SWXFRIEREN2026': [['energy','x100'],['mana','x300000'],['gold','x3']],
    'SEPSW2026I8B': [['blue','x3'],['mana','x300000']],
}


def fetch(url):
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (compatible; YunaMyst-Code-Updater/27.0)',
            'Accept-Language': 'en-US,en;q=0.9',
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode('utf-8', 'ignore')


def clean_lines(raw):
    # Mantém quebras entre elementos da tabela para evitar interpretar IDs,
    # URLs, títulos e outros textos como cupons.
    raw = re.sub(r'<script\b[^>]*>.*?</script>', '\n', raw, flags=re.I | re.S)
    raw = re.sub(r'<style\b[^>]*>.*?</style>', '\n', raw, flags=re.I | re.S)
    raw = re.sub(r'<br\s*/?>', '\n', raw, flags=re.I)
    raw = re.sub(r'</(?:tr|li|p|div|td|th|h1|h2|h3|h4|section)>', '\n', raw, flags=re.I)
    raw = re.sub(r'<[^>]+>', ' ', raw)
    raw = html.unescape(raw)
    return [re.sub(r'\s+', ' ', x).strip() for x in raw.splitlines() if x.strip()]


def normalize(value):
    c = value.strip(' `.,:;()[]{}<>\"\'').upper().replace('-', '').replace('_', '')
    if not (6 <= len(c) <= 32):
        return ''
    if c in BANNED or c in KNOWN_BAD:
        return ''
    if not re.search(r'[A-Z]', c) or not re.search(r'\d', c):
        return ''
    return c


def parse_source(raw):
    lines = clean_lines(raw)
    active = set()
    expired = set()
    reward_hits = {}

    for i, line in enumerate(lines):
        low = line.lower()
        window = ' '.join(lines[max(0, i-1):min(len(lines), i+2)]).lower()
        tokens = [normalize(m.group()) for m in CODE_RE.finditer(line)]
        tokens = {t for t in tokens if t}
        if not tokens:
            continue

        is_expired = any(w in window for w in EXPIRED_WORDS)
        is_active = any(w in window for w in ACTIVE_WORDS) or 'no expiration' in window
        if is_expired:
            expired.update(tokens)
        if is_active and not is_expired:
            active.update(tokens)

            # Recompensas mais comuns quando estão no mesmo bloco da tabela.
            around = ' '.join(lines[max(0, i-2):min(len(lines), i+3)])
            pairs = []
            patterns = [
                ('energy', r'(?:energy|energia)\s*[×x:]?\s*(\d[\d,.]*)'),
                ('mana', r'mana\s*[×x:]?\s*(\d[\d,.]*)'),
                ('crystal', r'(?:crystal|crystals|cristais)\s*[×x:]?\s*(\d[\d,.]*)'),
                ('gold', r'(?:mystical scroll|scroll m[íi]stico|scroll)\s*[×x:]?\s*(\d[\d,.]*)'),
                ('red', r'(?:fire scroll|scroll fire)\s*[×x:]?\s*(\d[\d,.]*)'),
                ('blue', r'(?:water scroll|scroll water)\s*[×x:]?\s*(\d[\d,.]*)'),
                ('yellow', r'(?:wind scroll|scroll wind)\s*[×x:]?\s*(\d[\d,.]*)'),
            ]
            for kind, pattern in patterns:
                m = re.search(pattern, around, re.I)
                if m:
                    pairs.append([kind, 'x' + m.group(1).replace(',', '').replace('.', '')])
            for code in tokens:
                if pairs:
                    reward_hits.setdefault(code, []).append(pairs)

    return active - expired, expired, reward_hits


def main():
    found = {}
    explicit_expired = set()
    rewards = {}
    errors = []

    for name, url in SOURCES:
        try:
            raw = fetch(url)
            active, expired, reward_hits = parse_source(raw)
            for code in active:
                found.setdefault(code, set()).add(name)
            explicit_expired.update(expired)
            for code, items in reward_hits.items():
                rewards.setdefault(code, []).extend(items)
        except Exception as ex:
            errors.append(f'{name}: {ex}')

    # Pelo menos uma fonte confiável precisa confirmar o código atual. Se todas
    # falharem, abortamos sem tocar no codes.json para não publicar lixo.
    confirmed = {code for code, sources in found.items() if sources & TRUSTED}
    confirmed -= explicit_expired
    confirmed -= KNOWN_BAD

    if not confirmed:
        raise RuntimeError('Nenhum código ativo confirmado; atualização abortada para não apagar a lista válida.')

    # Consolida recompensas e aplica os fallbacks conhecidos.
    merged_rewards = {}
    for code in sorted(confirmed):
        counts = {}
        for source_items in rewards.get(code, []):
            for item in source_items:
                key = tuple(item)
                counts[key] = counts.get(key, 0) + 1
        if counts:
            merged_rewards[code] = [list(k) for k, _ in sorted(counts.items(), key=lambda x: -x[1])]
        elif code in KNOWN_REWARDS:
            merged_rewards[code] = KNOWN_REWARDS[code]
        else:
            merged_rewards[code] = []

    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')
    active = sorted(confirmed)
    source_details = {
        code: sorted(found.get(code, set()))
        for code in active
    }

    try:
        old = json.loads(CODES.read_text(encoding='utf-8'))
        old_expired = set(old.get('expired', [])) if isinstance(old, dict) else set()
    except Exception:
        old_expired = set()

    expired = sorted(old_expired | KNOWN_BAD | explicit_expired)
    payload = {
        'updated': now,
        'source_count': len(SOURCES),
        'successful_sources': len(SOURCES) - len(errors),
        'rule': 'somente códigos atualmente confirmados nas fontes; expirados removidos automaticamente; sem snapshot antigo',
        'codes': active,
        'rewards': {code: merged_rewards.get(code, []) for code in active},
        'sources': source_details,
        'source_errors': errors,
    }
    CODES.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    HISTORY.write_text(json.dumps({
        'active': active,
        'expired': expired,
        'updated_at': now,
        'rewards': payload['rewards'],
        'sources': source_details,
        'source_errors': errors,
    }, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    print(f'Fontes OK: {len(SOURCES) - len(errors)}/{len(SOURCES)}')
    print(f'Códigos ativos publicados: {len(active)}')
    print('Códigos:', ', '.join(active))
    if errors:
        print('Falhas:', ' | '.join(errors))


if __name__ == '__main__':
    main()
