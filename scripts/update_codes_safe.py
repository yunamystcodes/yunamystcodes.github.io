import html
import json
import re
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CODES = ROOT / 'codes.json'
HISTORY = ROOT / 'codes-history.json'

SOURCES = (
    ('sw-teams', 'https://sw-teams.ovh/codes'),
    ('swcoupon', 'https://swcoupon.net/'),
    ('summonerswarcodes', 'https://summonerswarcodes.us/'),
    ('swquery', 'https://swquery.net/codes'),
)
TRUSTED = {name for name, _url in SOURCES}
BASELINE_CODES = {'2SOREIKENIPPON6','2SWCTORONTOTHE6IX','APAC1K0UB4NGK0K','AUGSW2026V7N','LAST4PUNCHIN','SEPSW2026I8B','SWCJOAAAKR26','SWGAJA2BKK'}
KNOWN_BAD = {'9CIRCLE','CCXQDUIH4A4','SWC2026','THE10TH','GLHF2026AMERICAS','SWC26X10LEGACYBND','PAI2026BANGKOK','APAC26LEGASEA','912XUXIECHUANQI','SWC2026JUELEBA','H4MBURGISWAITING','HURRASWC2026','4MINGYIDAOXIAN','YYDSSWC26ZAN','1SURPR1SE','1SURPR1SEG1FT','2NEWTOMORROW2','SW25HSZN'}
BANNED = {'ACTIVE','EXPIRED','WORKING','AVAILABLE','CODES','CODE','SUMMONERS','WAR','SKY','ARENA','ENERGY','MANA','SCROLL','REDEEM','COUPON','COPY','REWARD','REWARDS','LATEST','NEW','GUIDE','GAME','GAMES','COM2US','ANDROID','IPHONE','WINDOWS','FACEBOOK','DISCORD','TWITTER','INSTAGRAM','YOUTUBE','CURRENTLY','PROMO','PROMOTIONAL','VERIFIED','NOEXPIRATION'}
CODE_RE = re.compile(r'(?<![A-Z0-9])[A-Z0-9][A-Z0-9_-]{5,31}(?![A-Z0-9])', re.I)
ACTIVE_WORDS = ('active','available','working','verified','no expiration','new & active','new and active','currently working')
EXPIRED_WORDS = ('expired','no longer working','inactive','not working')
KNOWN_REWARDS = {'SWGAJA2BKK':[['mana','x200000'],['yellow','x1']],'SWCJOAAAKR26':[['yellow','x1']],'2SWCTORONTOTHE6IX':[['energy','x100'],['yellow','x1']],'APAC1K0UB4NGK0K':[['energy','x100'],['yellow','x1']],'2SOREIKENIPPON6':[['mana','x200000'],['yellow','x1']],'AUGSW2026V7N':[['energy','x100'],['red','x3']],'LAST4PUNCHIN':[['mana','x200000'],['yellow','x1']],'SEPSW2026I8B':[['blue','x3'],['mana','x300000']]}

def fetch(url):
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; YunaMyst-Code-Updater/32.0)','Accept-Language':'en-US,en;q=0.9'})
    with urllib.request.urlopen(req,timeout=30) as r: return r.read().decode('utf-8','ignore')

def clean_lines(raw):
    raw=re.sub(r'<script\b[^>]*>.*?</script>','\n',raw,flags=re.I|re.S)
    raw=re.sub(r'<style\b[^>]*>.*?</style>','\n',raw,flags=re.I|re.S)
    raw=re.sub(r'<br\s*/?>','\n',raw,flags=re.I)
    raw=re.sub(r'</(?:tr|li|p|div|td|th|h1|h2|h3|h4|section)>','\n',raw,flags=re.I)
    raw=re.sub(r'<[^>]+>',' ',raw)
    return [re.sub(r'\s+',' ',x).strip() for x in html.unescape(raw).splitlines() if x.strip()]

def normalize(value):
    c=value.strip(' `.,:;()[]{}<>\"\'').upper().replace('-','').replace('_','')
    if not (6<=len(c)<=32) or c in BANNED or c in KNOWN_BAD: return ''
    if not re.search(r'[A-Z]',c) or not re.search(r'\d',c): return ''
    return c

def parse_source(raw):
    lines=clean_lines(raw); active,expired=set(),set()
    for i,line in enumerate(lines):
        window=' '.join(lines[max(0,i-1):min(len(lines),i+2)]).lower()
        tokens={normalize(m.group()) for m in CODE_RE.finditer(line)}-{''}
        if not tokens: continue
        is_expired=any(w in window for w in EXPIRED_WORDS)
        is_active=any(w in window for w in ACTIVE_WORDS) or 'no expiration' in window
        if is_expired: expired.update(tokens)
        if is_active and not is_expired: active.update(tokens)
    return active-expired,expired

def load_json(path,default):
    try:
        data=json.loads(path.read_text(encoding='utf-8')); return data if isinstance(data,dict) else default
    except Exception: return default

def main():
    previous=load_json(CODES,{})
    previous_codes={normalize(c) for c in previous.get('codes',[]) if normalize(c)}
    previous_rewards=previous.get('rewards',{}) if isinstance(previous.get('rewards',{}),dict) else {}
    previous_sources=previous.get('sources',{}) if isinstance(previous.get('sources',{}),dict) else {}
    found={}; expired_by_source={}; errors=[]
    for name,url in SOURCES:
        try:
            active,dead=parse_source(fetch(url))
            for c in active: found.setdefault(c,set()).add(name)
            for c in dead: expired_by_source.setdefault(c,set()).add(name)
        except Exception as e: errors.append(f'{name}: {e}')
    current=(previous_codes|BASELINE_CODES|set(found))-KNOWN_BAD
    confirmed_expired={c for c,sources in expired_by_source.items() if len(sources)>=2}
    current-=confirmed_expired
    today=datetime.now(timezone.utc)
    if today < datetime(2026,10,1,tzinfo=timezone.utc) and 'SEPSW2026I8B' not in confirmed_expired: current.add('SEPSW2026I8B')
    if len(current)<len(BASELINE_CODES): raise SystemExit('Proteção: a lista ativa ficou incompleta; atualização cancelada para não apagar códigos.')
    now=today.replace(microsecond=0).isoformat().replace('+00:00','Z')
    rewards={}; sources={}
    for c in sorted(current):
        old_reward=previous_rewards.get(c) or previous_rewards.get(c.upper())
        rewards[c]=old_reward if isinstance(old_reward,list) and old_reward else KNOWN_REWARDS.get(c,[])
        src=set(previous_sources.get(c,[])) if isinstance(previous_sources.get(c,[]),list) else set()
        src.update(found.get(c,set()))
        if not src and c=='SEPSW2026I8B': src.add('official-monthly')
        sources[c]=sorted(src)
    payload={'updated':now,'source_count':len(SOURCES),'successful_sources':len(SOURCES)-len(errors),'rule':'lista ativa protegida por baseline; novos códigos adicionados; remoção somente após confirmação em 2 fontes; falhas/leituras parciais nunca apagam códigos','codes':sorted(current),'rewards':rewards,'sources':sources,'source_errors':errors}
    CODES.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    old_history=load_json(HISTORY,{})
    old_dead=set(old_history.get('expired',[])) if isinstance(old_history.get('expired',[]),list) else set()
    HISTORY.write_text(json.dumps({'active':sorted(current),'expired':sorted(old_dead|confirmed_expired|KNOWN_BAD),'updated_at':now,'rewards':rewards,'sources':sources,'source_errors':errors},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('Ativos:',', '.join(sorted(current)))
    print('Expirados confirmados (2+ fontes):',', '.join(sorted(confirmed_expired)) or 'nenhum')

if __name__=='__main__': main()
