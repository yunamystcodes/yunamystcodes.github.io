import html
import json
import re
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

SOURCES=(
    ("sw-teams","https://sw-teams.ovh/codes"),("swcoupon","https://swcoupon.net/"),("summonerswarcodes","https://summonerswarcodes.us/"),("swquery","https://swquery.net/"),("swgt","https://swgt.io/gamecodes/"),("pocketgamer","https://www.pocketgamer.com/summoners-war/codes/"),("pockettactics","https://www.pockettactics.com/summoners-war/codes"),("levelgeeks","https://levelgeeks.net/summoners-war-codes/"),("findingdulcinea","https://findingdulcinea.com/summoners-war-codes/"),("gameskinny","https://www.gameskinny.com/tips/summoners-war-codes/"),("pcgamesn","https://www.pcgamesn.com/summoners-war/codes"),("gamezebo","https://www.gamezebo.com/walkthroughs/summoners-war-codes/"),("thenerdstash","https://www.thenerdstash.com/summoners-war-codes/"),("touchtapplay","https://www.touchtapplay.com/summoners-war-codes/"),("droidgamers","https://www.droidgamers.com/guides/summoners-war-codes/"),("mejoress","https://www.mejoress.com/en/summoners-war-codes/"),("supercheats","https://www.supercheats.com/summoners-war-codes-cheats-tips"),("mrguider","https://www.mrguider.org/codes/summoners-war-codes/"),("tryhardguides","https://tryhardguides.com/summoners-war-codes/"),("progameguides","https://progameguides.com/summoners-war/summoners-war-codes/"))
TRUSTED={"sw-teams","swcoupon","summonerswarcodes","swquery","swgt"}
REJECTED={"GLHF2026AMERICAS","SWC26X10LEGACYBND","IDTOP8GO","1SURPR1SE","1SURPR1SEG1FT","JUNSW2026W6C","MAYSW2026Z2Q","APRSW2026M08","LOTR4CO11ABON","26SWXLOTRS2","MARSW2026K61","COL3KY8G1FT15","FEBSW2026E82","OSAKAK1T3YA314","2026TEAMJPDARE","JANSW2026C13","SW2025DEC","SW2025DEC9PJ","SW2025NOV","SW2025NOVQ5W","SW2025OCT","SW2025OCTP3T","SW2025SEPJ6Z","SW2025AUGR5Q","SW2025JUL9UA","SW2025JUNY5C","SW2025APR8C4","SW2025APR1C4","SW2025MAR1N3","SW2025FEB3D9","SW2025JAN6A8"}
ROOT=Path(__file__).resolve().parents[1]; INDEX=ROOT/"index.html"; HISTORY=ROOT/"codes-history.json"; CODES=ROOT/"codes.json"
CODE_RE=re.compile(r"\b[A-Z0-9][A-Z0-9]{5,31}\b",re.I)
BANNED={"ACTIVE","EXPIRED","WORKING","AVAILABLE","CODES","CODE","SUMMONERS","WAR","SKY","ARENA","ENERGY","MANA","SCROLL","REDEEM","COUPON","COPY","REWARD","REWARDS","LATEST","NEW","GUIDE","GAME","GAMES","COM2US","ANDROID","IPHONE","WINDOWS","FACEBOOK","DISCORD","TWITTER"}

def fetch(url):
 req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 (compatible; YunaMyst-Code-Updater/18.0)"})
 with urllib.request.urlopen(req,timeout=25) as r:return r.read().decode("utf-8","ignore")
def clean(raw):
 raw=re.sub(r"<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>"," ",raw,flags=re.I|re.S)
 return re.sub(r"\s+"," ",html.unescape(re.sub(r"<[^>]+>"," ",raw)))
def norm(tokens):
 out=[]
 for t in tokens:
  c=t.strip().strip("`.,:;()[]{}<>\"").upper()
  if 6<=len(c)<=32 and c not in BANNED and c not in REJECTED and re.search(r"[A-Z]",c) and re.search(r"\d",c) and c not in out:out.append(c)
 return out
def parse(raw):
 text=clean(raw); low=text.lower(); starts=["working summoners war codes","working codes","available codes","active summoners war codes","new & active summoners war codes","new and active summoners war codes","currently working summoners war codes","new summoners war codes","all summoners war codes 2026","active promotional codes"]
 blocks=[]
 for marker in starts:
  p=low.find(marker)
  if p>=0:
   ends=[low.find(x,p+len(marker)) for x in ("expired summoners war codes","expired codes","how to redeem","how do i redeem") if low.find(x,p+len(marker))>=0]
   blocks.append(text[p:min(ends) if ends else len(text)])
 candidates=norm(CODE_RE.findall(" ".join(blocks))) if blocks else []
 for m in CODE_RE.finditer(text):
  w=text[max(0,m.start()-90):m.end()+90].lower()
  if "active" in w and "expired" not in w:candidates+=norm([m.group()])
 return list(dict.fromkeys(candidates))
def replace_active(s,codes):
 m=re.search(r'<div\b(?=[^>]*\bid=["\']ativos["\'])[^>]*>',s,re.I)
 if not m:return s
 tags=re.compile(r"<div\b[^>]*>|</div\s*>",re.I);d=0;e=None
 for x in tags.finditer(s,m.start()):
  d+=1 if x.group().lower().startswith('<div') else -1
  if d==0:e=x.end();break
 if e is None:return s
 def card(c):
  q=html.escape(c,quote=True);return f'<article class="code auto-code"><div class="gift">🎁</div><div class="cinfo"><strong>{q}</strong><small>🔄 Código ativo</small></div><div class="reward"><span class="scroll"></span><b>—</b><small>Recompensa</small></div><div class="reward"><span class="energy">⚡</span><b>—</b><small>Energia</small></div><div class="reward"><span class="mana"></span><b>—</b><small>Mana</small></div><button class="copy" type="button" data-code="{q}">▣ COPIAR</button><a class="link" href="https://event.withhive.com/ci/smon/evt_coupon" target="_blank" rel="noopener noreferrer">🔗 LINK iOS</a></article>'
 return s[:m.start()]+'<div id="ativos" class="code-list">'+''.join(card(c) for c in codes)+'</div>'+s[e:]
def main():
 found={};errors=[]
 for name,url in SOURCES:
  try:
   for c in parse(fetch(url)):found.setdefault(c,set()).add(name)
  except Exception as e:errors.append(f"{name}: {e}")
 current={c for c,src in found.items() if len(src&TRUSTED)>=1 or len(src)>=2}
 previous=set()
 if CODES.exists():
  try:previous={str(c).upper() for c in json.loads(CODES.read_text(encoding="utf-8")).get("codes",[])}
  except Exception:pass
 # Ausência numa fonte não significa expiração. Só REJECTED/expiração explícita deve remover.
 active=sorted((current|previous)-REJECTED)
 if not active:raise RuntimeError("Nenhum código válido encontrado; publicação abortada.")
 now=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')
 details={c:{"trusted":sorted(found.get(c,set())&TRUSTED),"all":sorted(found.get(c,set()))} for c in active}
 CODES.write_text(json.dumps({"updated":now,"source_count":len(SOURCES),"successful_sources":len(SOURCES)-len(errors),"trusted_confirmation":"1 trusted OR 2 independent","codes":active,"sources":details},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 INDEX.write_text(replace_active(INDEX.read_text(encoding="utf-8"),active),encoding="utf-8")
 HISTORY.write_text(json.dumps({"active":active,"expired":sorted(REJECTED),"missing":{},"updated_at":now,"sources":details,"source_errors":errors},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print(f"Publicados: {len(active)} | rejeitados: {len(REJECTED)}")
if __name__=="__main__":main()
