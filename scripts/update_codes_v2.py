import html, json, re, urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CODES, HISTORY = ROOT / 'codes.json', ROOT / 'codes-history.json'
SOURCES = {
    'com2us-official': 'https://summonerswar.com/pt/skyarena/news',
    'sw-teams': 'https://sw-teams.ovh/codes',
    'swcoupon': 'https://swcoupon.net/',
    'summonerswarcodes': 'https://summonerswarcodes.us/',
    'swquery': 'https://swquery.net/',
}
BAD = {'9CIRCLE','CCXQDUIH4A4','SWC2026','THE10TH','GLHF2026AMERICAS','SWC26X10LEGACYBND','PAI2026BANGKOK','APAC26LEGASEA','912XUXIECHUANQI','SWC2026JUELEBA','H4MBURGISWAITING','HURRASWC2026','4MINGYIDAOXIAN','YYDSSWC26ZAN','1SURPR1SE','1SURPR1SEG1FT','2NEWTOMORROW2','SW25HSZN'}
BANNED = {'ACTIVE','EXPIRED','WORKING','AVAILABLE','CODES','CODE','SUMMONERS','WAR','SKY','ARENA','ENERGY','MANA','SCROLL','REDEEM','COUPON','COPY','REWARD','REWARDS','LATEST','NEW','GUIDE','GAME','GAMES','COM2US','ANDROID','IPHONE','WINDOWS','FACEBOOK','DISCORD','TWITTER','INSTAGRAM','YOUTUBE','PROMO','PROMOTIONAL','VERIFIED','NOEXPIRATION'}
RE = re.compile(r'(?<![A-Z0-9])[A-Z0-9][A-Z0-9_-]{5,31}(?![A-Z0-9])', re.I)
ACTIVE = ('active','available','working','verified','no expiration')
EXPIRED = ('expired','no longer working','inactive','not working')
REWARD_FALLBACKS = {
 'SWGAJA2BKK':[['mana','x200000'],['gold','x1']], 'SWCJOAAAKR26':[['gold','x1']],
 '2SWCTORONTOTHE6IX':[['energy','x100'],['gold','x1']], 'APAC1K0UB4NGK0K':[['energy','x100'],['gold','x1']],
 '2SOREIKENIPPON6':[['mana','x200000'],['gold','x1']], 'AUGSW2026V7N':[['red','x3'],['energy','x100']],
 'LAST4PUNCHIN':[['mana','x200000'],['gold','x1']], 'SWXFRIEREN2026':[['energy','x100'],['mana','x300000'],['gold','x3']],
 'SEPSW2026I8B':[['blue','x3'],['mana','x300000']],
}

def fetch(url):
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 YunaMystCodesBot/31.0','Accept-Language':'en-US,en;q=0.9'})
    with urllib.request.urlopen(req,timeout=30) as r: return r.read().decode('utf-8','ignore')

def lines(raw):
    raw=re.sub(r'<script\b[^>]*>.*?</script>','\n',raw,flags=re.I|re.S)
    raw=re.sub(r'<style\b[^>]*>.*?</style>','\n',raw,flags=re.I|re.S)
    raw=re.sub(r'<br\s*/?>','\n',raw,flags=re.I)
    raw=re.sub(r'</(?:tr|li|p|div|td|th|h1|h2|h3|h4|section)>','\n',raw,flags=re.I)
    raw=re.sub(r'<[^>]+>',' ',raw)
    return [re.sub(r'\s+',' ',x).strip() for x in html.unescape(raw).splitlines() if x.strip()]

def norm(x):
    c=x.strip(' `.,:;()[]{}<>\"\'').upper().replace('-','').replace('_','')
    return c if 6<=len(c)<=32 and c not in BANNED and c not in BAD and re.search(r'[A-Z]',c) and re.search(r'\d',c) else ''

def parse(raw):
    ls=lines(raw); active=set(); expired=set()
    for i,line in enumerate(ls):
        window=' '.join(ls[max(0,i-1):min(len(ls),i+2)]).lower()
        codes={c for c in (norm(m.group()) for m in RE.finditer(line)) if c}
        if not codes: continue
        if any(x in window for x in EXPIRED): expired |= codes
        elif any(x in window for x in ACTIVE) or 'no expiration' in window: active |= codes
    return active-expired, expired

def load_json(path, default):
    try:
        data=json.loads(path.read_text(encoding='utf-8'))
        return data if isinstance(data,dict) else default
    except Exception:
        return default

def main():
    # IMPORTANT: never rebuild the public list from scratch.
    # Keep every code already known to the site and only add newly confirmed codes.
    # A code is removed from the active list only when a source explicitly marks it expired.
    previous=load_json(CODES,{})
    previous_codes={norm(c) for c in previous.get('codes',[]) if norm(c)}
    previous_rewards=previous.get('rewards',{}) if isinstance(previous.get('rewards',{}),dict) else {}
    previous_sources=previous.get('sources',{}) if isinstance(previous.get('sources',{}),dict) else {}

    found={}; explicitly_expired=set(); errors=[]
    for name,url in SOURCES.items():
        try:
            active,dead=parse(fetch(url))
            for c in active: found.setdefault(c,set()).add(name)
            explicitly_expired |= dead
        except Exception as e:
            errors.append(f'{name}: {e}')

    # Add new codes discovered by any successful source.
    current=(previous_codes | set(found)) - explicitly_expired - BAD

    # The September monthly code is known and must not disappear during a source hiccup.
    today=datetime.now(timezone.utc)
    if today < datetime(2026,10,1,tzinfo=timezone.utc) and 'SEPSW2026I8B' not in explicitly_expired:
        current.add('SEPSW2026I8B')

    if not current:
        raise SystemExit('Nenhum código disponível; atualização cancelada para proteger a lista existente.')

    now=today.replace(microsecond=0).isoformat().replace('+00:00','Z')
    rewards={}
    sources={}
    for c in sorted(current):
        # Preserve an existing reward definition first; fallback only fills missing data.
        old_reward=previous_rewards.get(c) or previous_rewards.get(c.upper())
        rewards[c]=old_reward if isinstance(old_reward,list) and old_reward else REWARD_FALLBACKS.get(c,[])
        src=set(previous_sources.get(c,[])) if isinstance(previous_sources.get(c,[]),list) else set()
        src.update(found.get(c,set()))
        if not src and c=='SEPSW2026I8B': src.add('official-monthly')
        sources[c]=sorted(src)

    payload={
        'updated':now,
        'source_count':len(SOURCES),
        'successful_sources':len(SOURCES)-len(errors),
        'rule':'lista preservada; novos códigos ativos adicionados; códigos removidos somente quando explicitamente marcados como expirados; falhas de fontes não apagam códigos',
        'codes':sorted(current),
        'rewards':rewards,
        'sources':sources,
        'source_errors':errors
    }
    CODES.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

    old_history=load_json(HISTORY,{})
    old_dead=set(old_history.get('expired',[])) if isinstance(old_history.get('expired',[]),list) else set()
    old_active=set(old_history.get('active',[])) if isinstance(old_history.get('active',[]),list) else set()
    history={
        'active':sorted(current),
        'expired':sorted(old_dead|explicitly_expired|BAD),
        'updated_at':now,
        'rewards':rewards,
        'sources':sources,
        'source_errors':errors
    }
    HISTORY.write_text(json.dumps(history,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('Ativos:',', '.join(sorted(current)))
    print('Adicionados:',', '.join(sorted(set(found)-previous_codes)) or 'nenhum')
    print('Expirados confirmados:',', '.join(sorted(explicitly_expired)) or 'nenhum')

if __name__=='__main__': main()
