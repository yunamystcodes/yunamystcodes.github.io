import html,json,re,urllib.request
from datetime import datetime,timezone
from pathlib import Path
SOURCES=(
('sw-teams','https://sw-teams.ovh/codes'),('swcoupon','https://swcoupon.net/'),('summonerswarcodes','https://summonerswarcodes.us/'),('swquery','https://swquery.net/'),('swgt','https://swgt.io/gamecodes/'),('pocketgamer','https://www.pocketgamer.com/summoners-war/codes/'),('pockettactics','https://www.pockettactics.com/summoners-war/codes'),('levelgeeks','https://levelgeeks.net/summoners-war-codes/'),('findingdulcinea','https://findingdulcinea.com/summoners-war-codes/'),('touchtapplay','https://www.touchtapplay.com/summoners-war-codes/'),('mejoress','https://www.mejoress.com/en/summoners-war-codes/'))
TRUSTED={'sw-teams','swcoupon','summonerswarcodes','swquery','swgt'}
REJECTED={'GLHF2026AMERICAS','SWC26X10LEGACYBND','PAI2026BANGKOK','APAC26LEGASEA','912XUXIECHUANQI','SWC2026JUELEBA','LAST4PUNCHIN','IDTOP8GO','1SURPR1SE','1SURPR1SEG1FT','JUNSW2026W6C','MAYSW2026Z2Q','APRSW2026M08','LOTR4CO11ABON','26SWXLOTRS2','MARSW2026K61','COL3KY8G1FT15','FEBSW2026E82','OSAKAK1T3YA314','2026TEAMJPDARE','JANSW2026C13','SW2025DEC','SW2025DEC9PJ','SW2025NOV','SW2025NOVQ5W','SW2025OCT','SW2025OCTP3T','SW2025SEPJ6Z','SW2025AUGR5Q','SW2025JUL9UA','SW2025JUNY5C','SW2025APR8C4','SW2025APR1C4','SW2025MAR1N3','SW2025FEB3D9','SW2025JAN6A8','2NEWTOMORROW2','NEXTWF25PARISA1GA','APAC25FUNA1NGY0','SWC25HAMBOISO','SWCPARISNOUSVOILA','20FIGHT4GLORY25','SCHOENHIERSWC','SWSA100RUSH','GETUR5STAR','GEARING4PARIS','SWCHZHU4NYINGNI25','RONGY4OZH1LUSWC','11BALIDENGNILAI1','20POURLESWC25','BORASPBRASIL2025'}
ROOT=Path(__file__).resolve().parents[1]; CODES=ROOT/'codes.json'; HISTORY=ROOT/'codes-history.json'
CODE_RE=re.compile(r'\b[A-Z0-9][A-Z0-9]{5,31}\b',re.I)
BANNED={'ACTIVE','EXPIRED','WORKING','AVAILABLE','CODES','CODE','SUMMONERS','WAR','SKY','ARENA','ENERGY','MANA','SCROLL','REDEEM','COUPON','COPY','REWARD','REWARDS','LATEST','NEW','GUIDE','GAME','GAMES','COM2US','ANDROID','IPHONE','WINDOWS','FACEBOOK','DISCORD','TWITTER'}
def fetch(url):
 r=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; YunaMyst-Code-Updater/19.0)'})
 with urllib.request.urlopen(r,timeout=25) as x:return x.read().decode('utf-8','ignore')
def clean(raw):
 raw=re.sub(r'<script\b[^>]*>.*?</script>',' ',raw,flags=re.I|re.S);raw=re.sub(r'<style\b[^>]*>.*?</style>',' ',raw,flags=re.I|re.S)
 return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',raw)))
def norm(xs):
 out=[]
 for x in xs:
  c=x.strip('`.,:;()[]{}<>"').upper()
  if 6<=len(c)<=32 and c not in BANNED and c not in REJECTED and re.search(r'[A-Z]',c) and re.search(r'\d',c) and c not in out:out.append(c)
 return out
def sections(text,starts,stops):
 lo=text.lower();blocks=[]
 for marker in starts:
  p=lo.find(marker)
  if p<0:continue
  ends=[lo.find(s,p+len(marker)) for s in stops if lo.find(s,p+len(marker))>=0]
  e=min(ends) if ends else len(text);blocks.append(text[p:min(e,p+16000)])
 return blocks
def parse(raw):
 text=clean(raw)
 active=sections(text,('working summoners war codes','working codes','available codes','active summoners war codes','new & active summoners war codes','new and active summoners war codes','currently working summoners war codes','working summoners war codes','new summoners war codes','all summoners war codes 2026','active promotional codes'),('expired summoners war codes','expired codes','expired','how to redeem','how do i redeem','how to use'))
 expired=sections(text,('expired summoners war codes','expired codes'),('how to redeem','how do i redeem','how to use'))
 a=set(norm(CODE_RE.findall(' '.join(active)))) if active else set(); e=set(norm(CODE_RE.findall(' '.join(expired)))) if expired else set()
 for m in CODE_RE.finditer(text):
  w=text[max(0,m.start()-100):m.end()+100].lower()
  if 'active' in w and 'expired' not in w:a.update(norm([m.group()]))
 return a,e
def main():
 found={}; explicit={};errors=[]
 for name,url in SOURCES:
  try:
   a,e=parse(fetch(url))
   for c in a:found.setdefault(c,set()).add(name)
   for c in e:explicit.setdefault(c,set()).add(name)
  except Exception as ex:errors.append(f'{name}: {ex}')
 confirmed={c for c,s in found.items() if len(s&TRUSTED)>=1 or len(s)>=2}
 confirmed_expired={c for c,s in explicit.items() if len(s&TRUSTED)>=1 or len(s)>=2}
 # Publicar somente o conjunto confirmado nas fontes ao vivo. Nunca recuperar um snapshot antigo.
 active=sorted(confirmed-REJECTED-confirmed_expired)
 if not active:raise RuntimeError('Sem códigos seguros; atualização abortada.')
 now=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')
 details={c:{'trusted':sorted(found.get(c,set())&TRUSTED),'all':sorted(found.get(c,set()))} for c in active}
 try:old=json.loads(CODES.read_text(encoding='utf-8')); old_exp=set(old.get('expired',[])) if isinstance(old,dict) else set()
 except Exception:old_exp=set()
 expired=sorted(old_exp|REJECTED|confirmed_expired)
 CODES.write_text(json.dumps({'updated':now,'source_count':len(SOURCES),'successful_sources':len(SOURCES)-len(errors),'trusted_confirmation':'1 trusted OR 2 independent','codes':active,'sources':details},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 HISTORY.write_text(json.dumps({'active':active,'expired':expired,'missing':{},'updated_at':now,'sources':details,'source_errors':errors},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print('Ativos:',', '.join(active));print('Expirados removidos:',', '.join(sorted(REJECTED|confirmed_expired)))
if __name__=='__main__':main()
