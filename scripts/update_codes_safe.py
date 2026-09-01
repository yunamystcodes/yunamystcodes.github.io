import html
import json
import re
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CODES = ROOT / 'codes.json'
HISTORY = ROOT / 'codes-history.json'

# Fontes: quanto mais independentes, maior a probabilidade de apanhar um código novo.
SOURCES = (
    ('sw-teams', 'https://sw-teams.ovh/codes'),
    ('swcoupon', 'https://swcoupon.net/'),
    ('summonerswarcodes', 'https://summonerswarcodes.us/'),
    ('swquery', 'https://swquery.net/'),
    ('swgt', 'https://swgt.io/gamecodes/'),
    ('pocketgamer', 'https://www.pocketgamer.com/summoners-war/codes/'),
    ('pockettactics', 'https://www.pockettactics.com/summoners-war/codes'),
    ('levelgeeks', 'https://levelgeeks.net/summoners-war-codes/'),
    ('findingdulcinea', 'https://findingdulcinea.com/summoners-war-codes/'),
    ('gameskinny', 'https://www.gameskinny.com/tips/summoners-war-codes/'),
    ('pcgamesn', 'https://www.pcgamesn.com/summoners-war/codes'),
    ('gamezebo', 'https://www.gamezebo.com/walkthroughs/summoners-war-codes/'),
    ('thenerdstash', 'https://www.thenerdstash.com/summoners-war-codes/'),
    ('touchtapplay', 'https://www.touchtapplay.com/summoners-war-codes/'),
    ('droidgamers', 'https://www.droidgamers.com/guides/summoners-war-codes/'),
    ('mejoress', 'https://www.mejoress.com/en/summoners-war-codes/'),
    ('supercheats', 'https://www.supercheats.com/summoners-war-codes-cheats-tips'),
    ('mrguider', 'https://www.mrguider.org/codes/summoners-war-codes/'),
    ('tryhardguides', 'https://tryhardguides.com/summoners-war-codes/'),
    ('progameguides', 'https://progameguides.com/summoners-war/summoners-war-codes/'),
)
TRUSTED = {'sw-teams', 'swcoupon', 'summonerswarcodes', 'swquery', 'swgt'}

REJECTED = {
    'GLHF2026AMERICAS','SWC26X10LEGACYBND','PAI2026BANGKOK','APAC26LEGASEA',
    '912XUXIECHUANQI','SWC2026JUELEBA','LAST4PUNCHIN','IDTOP8GO','1SURPR1SE',
    '1SURPR1SEG1FT','JUNSW2026W6C','MAYSW2026Z2Q','APRSW2026M08',
    'LOTR4CO11ABON','26SWXLOTRS2','MARSW2026K61','COL3KY8G1FT15','FEBSW2026E82',
    'OSAKAK1T3YA314','2026TEAMJPDARE','JANSW2026C13','SW2025DEC','SW2025DEC9PJ',
    'SW2025NOV','SW2025NOVQ5W','SW2025OCT','SW2025OCTP3T','SW2025SEPJ6Z',
    'SW2025AUGR5Q','SW2025JUL9UA','SW2025JUNY5C','SW2025APR8C4','SW2025APR1C4',
    'SW2025MAR1N3','SW2025FEB3D9','SW2025JAN6A8','2NEWTOMORROW2',
    'NEXTWF25PARISA1GA','APAC25FUNA1NGY0','SWC25HAMBOISO','SWCPARISNOUSVOILA',
    '20FIGHT4GLORY25','SCHOENHIERSWC','SWSA100RUSH','GETUR5STAR','GEARING4PARIS',
    'SWCHZHU4NYINGNI25','RONGY4OZH1LUSWC','11BALIDENGNILAI1','20POURLESWC25',
    'BORASPBRASIL2025'
}

CODE_RE = re.compile(r'\b[A-Z0-9][A-Z0-9_-]{5,31}\b', re.I)
BANNED = {
    'ACTIVE','EXPIRED','WORKING','AVAILABLE','CODES','CODE','SUMMONERS','WAR',
    'SKY','ARENA','ENERGY','MANA','SCROLL','REDEEM','COUPON','COPY','REWARD',
    'REWARDS','LATEST','NEW','GUIDE','GAME','GAMES','COM2US','ANDROID','IPHONE',
    'WINDOWS','FACEBOOK','DISCORD','TWITTER','INSTAGRAM','YOUTUBE','CURRENTLY'
}
ACTIVE_MARKERS = (
    'working summoners war codes', 'working codes', 'available codes',
    'active summoners war codes', 'new & active summoners war codes',
    'new and active summoners war codes', 'currently working summoners war codes',
    'working summoners war codes', 'new summoners war codes',
    'all summoners war codes 2026', 'active promotional codes',
    'active codes', 'latest codes', 'new codes'
)
EXPIRED_MARKERS = ('expired summoners war codes', 'expired codes', 'expired')
STOP_MARKERS = ('how to redeem', 'how do i redeem', 'how to use', 'how to enter')


def fetch(url):
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (compatible; YunaMyst-Code-Updater/24.0)',
            'Accept-Language': 'en-US,en;q=0.9'
        }
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode('utf-8', 'ignore')


def clean(raw):
    raw = re.sub(r'<script\b[^>]*>.*?</script>', ' ', raw, flags=re.I | re.S)
    raw = re.sub(r'<style\b[^>]*>.*?</style>', ' ', raw, flags=re.I | re.S)
    raw = re.sub(r'<[^>]+>', ' ', raw)
    return re.sub(r'\s+', ' ', html.unescape(raw))


def norm(values):
    out = []
    for value in values:
        c = value.strip().strip('`.,:;()[]{}<>"\'').upper().replace('-', '').replace('_', '')
        if (
            6 <= len(c) <= 32
            and c not in BANNED
            and c not in REJECTED
            and re.search(r'[A-Z]', c)
            and re.search(r'\d', c)
            and c not in out
        ):
            out.append(c)
    return out


def sections(text, markers, stops):
    low = text.lower()
    blocks = []
    for marker in markers:
        start = 0
        while True:
            p = low.find(marker, start)
            if p < 0:
                break
            ends = [low.find(stop, p + len(marker)) for stop in stops]
            ends = [e for e in ends if e >= 0]
            end = min(ends) if ends else min(len(text), p + 20000)
            blocks.append(text[p:end])
            start = p + len(marker)
    return blocks


def parse(raw):
    text = clean(raw)
    active_blocks = sections(text, ACTIVE_MARKERS, EXPIRED_MARKERS + STOP_MARKERS)
    expired_blocks = sections(text, EXPIRED_MARKERS, STOP_MARKERS)

    active = set(norm(CODE_RE.findall('\n'.join(active_blocks)))) if active_blocks else set()
    expired = set(norm(CODE_RE.findall('\n'.join(expired_blocks)))) if expired_blocks else set()

    # Segunda passagem: encontra códigos próximos de palavras que indicam código ativo.
    # Isto cobre páginas cujo HTML mudou e já não usa os títulos esperados.
    low = text.lower()
    for match in CODE_RE.finditer(text):
        token = norm([match.group()])
        if not token:
            continue
        left = max(0, match.start() - 180)
        right = min(len(text), match.end() + 180)
        context = low[left:right]
        if any(k in context for k in ('active code', 'working code', 'new code', 'promo code', 'coupon code', 'redeem code')):
            if 'expired' not in context:
                active.update(token)

    # Também aceita códigos dentro de listas/tabelas quando a própria linha contém "code".
    for line in text.splitlines():
        ll = line.lower()
        if 'code' not in ll or 'expired' in ll:
            continue
        active.update(norm(CODE_RE.findall(line)))

    return active - expired, expired


def parse_rewards(raw, code):
    text = clean(raw)
    i = text.upper().find(code.upper())
    if i < 0:
        return []
    chunk = text[max(0, i - 500):i + 1200]
    out = []

    def add(kind, names):
        pattern = r'(?:x|×|:)??\s*([0-9][0-9,.]*)\s*(?:x|×)?\s*' + '|'.join(map(re.escape, names))
        p = re.search(pattern, chunk, re.I)
        if not p:
            p = re.search('|'.join(map(re.escape, names)) + r'\s*(?:x|×|:)?\s*([0-9][0-9,.]*)', chunk, re.I)
        if p:
            value = next((g for g in p.groups() if g), None)
            if value and not any(k == kind for k, _ in out):
                out.append([kind, 'x' + value.replace(',', '').replace('.', '')])

    add('energy', ['ENERGY', 'ENERGIA'])
    add('mana', ['MANA'])
    add('crystal', ['CRYSTAL', 'CRYSTALS', 'CRISTAIS'])
    add('gold', ['MYSTICAL SCROLL', 'MYSTICAL', 'SCROLL MYSTICAL', 'SCROLLS MYSTICAL', 'SCROLL'])
    add('red', ['FIRE SCROLL', 'SCROLL FIRE', 'FIRE'])
    add('blue', ['WATER SCROLL', 'SCROLL WATER', 'WATER'])
    add('yellow', ['WIND SCROLL', 'SCROLL WIND', 'WIND'])
    return out


def merge_rewards(hits):
    merged = {}
    for code, items in hits.items():
        counts = {}
        for _source, data in items:
            for kind, amount in data:
                counts[(kind, amount)] = counts.get((kind, amount), 0) + 1
        merged[code] = [list(k) for k, _v in sorted(counts.items(), key=lambda x: -x[1])]
    return merged


def load_previous():
    try:
        old = json.loads(CODES.read_text(encoding='utf-8'))
        if isinstance(old, dict):
            return {str(c).upper() for c in old.get('codes', [])}
    except Exception:
        pass
    return set()


def main():
    found = {}
    explicit_expired = {}
    errors = []
    reward_hits = {}

    for name, url in SOURCES:
        try:
            raw = fetch(url)
            active, expired = parse(raw)
            for code in active:
                found.setdefault(code, set()).add(name)
                rewards = parse_rewards(raw, code)
                if rewards:
                    reward_hits.setdefault(code, []).append((name, rewards))
            for code in expired:
                explicit_expired.setdefault(code, set()).add(name)
        except Exception as ex:
            errors.append(f'{name}: {ex}')

    confirmed = {
        code for code, sources in found.items()
        if len(sources & TRUSTED) >= 1 or len(sources) >= 2
    }
    confirmed_expired = {
        code for code, sources in explicit_expired.items()
        if len(sources & TRUSTED) >= 1 or len(sources) >= 2
    }

    previous = load_previous()

    # Se poucas fontes responderem, não apagamos toda a lista por causa de uma falha temporária.
    successful = len(SOURCES) - len(errors)
    if successful < 3:
        confirmed |= previous

    active = sorted((confirmed - REJECTED) - confirmed_expired)
    if not active:
        raise RuntimeError('Sem códigos seguros; atualização abortada.')

    rewards = merge_rewards(reward_hits)

    # Recompensas conhecidas manualmente continuam disponíveis até uma fonte fornecer dados melhores.
    known = {
        '2SOREIKENIPPON6': [['mana', 'x200000'], ['gold', 'x1']],
        '4READY4TDOT': [['mana', 'x200000'], ['gold', 'x1'], ['energy', 'x50']],
        'AMPRELIMSLEGACYDRP': [['energy', 'x100'], ['gold', 'x1']],
        'AUGSW2026V7N': [['red', 'x3'], ['energy', 'x100']],
        'LEGENDSWC2026HSL': [['energy', 'x100'], ['gold', 'x1']],
        'SWXFRIEREN2026': [['energy', 'x100'], ['mana', 'x300000'], ['gold', 'x3']],
        'YIQIZOUGUO10SWC': [['energy', 'x100'], ['gold', 'x1']],
        'APAC1K0UB4NGK0K': [['energy', 'x100'], ['gold', 'x1']],
    }
    for code in active:
        if code in known and not rewards.get(code):
            rewards[code] = known[code]

    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')
    details = {
        code: {
            'trusted': sorted(found.get(code, set()) & TRUSTED),
            'all': sorted(found.get(code, set()))
        }
        for code in active
    }

    try:
        old = json.loads(CODES.read_text(encoding='utf-8'))
        old_expired = set(old.get('expired', [])) if isinstance(old, dict) else set()
    except Exception:
        old_expired = set()

    expired = sorted(old_expired | REJECTED | confirmed_expired)
    payload = {
        'updated': now,
        'source_count': len(SOURCES),
        'successful_sources': successful,
        'trusted_confirmation': '1 trusted OR 2 independent',
        'codes': active,
        'rewards': {code: rewards.get(code, []) for code in active},
        'sources': details,
        'source_errors': errors,
    }
    CODES.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    HISTORY.write_text(json.dumps({
        'active': active,
        'expired': expired,
        'missing': {},
        'updated_at': now,
        'rewards': {code: rewards.get(code, []) for code in active},
        'sources': details,
        'source_errors': errors,
    }, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    print(f'Fontes OK: {successful}/{len(SOURCES)}')
    print(f'Códigos ativos publicados: {len(active)}')
    print('Códigos:', ', '.join(active))
    if errors:
        print('Falhas:', ' | '.join(errors))


if __name__ == '__main__':
    main()
