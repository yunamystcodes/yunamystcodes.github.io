import html
import json
import re
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

# 20 independent sources. A source may fail without stopping the hourly update.
SOURCES = (
    ("sw-teams", "https://sw-teams.ovh/codes"),
    ("swcoupon", "https://swcoupon.net/"),
    ("summonerswarcodes", "https://summonerswarcodes.us/"),
    ("swquery", "https://swquery.net/"),
    ("swgt", "https://swgt.io/gamecodes/"),
    ("pocketgamer", "https://www.pocketgamer.com/summoners-war/codes/"),
    ("pockettactics", "https://www.pockettactics.com/summoners-war/codes"),
    ("levelgeeks", "https://levelgeeks.net/summoners-war-codes/"),
    ("findingdulcinea", "https://findingdulcinea.com/summoners-war-codes/"),
    ("gameskinny", "https://www.gameskinny.com/tips/summoners-war-codes/"),
    ("pcgamesn", "https://www.pcgamesn.com/summoners-war/codes"),
    ("gamezebo", "https://www.gamezebo.com/walkthroughs/summoners-war-codes/"),
    ("thenerdstash", "https://www.thenerdstash.com/summoners-war-codes/"),
    ("touchtapplay", "https://www.touchtapplay.com/summoners-war-codes/"),
    ("droidgamers", "https://www.droidgamers.com/guides/summoners-war-codes/"),
    ("mejoress", "https://www.mejoress.com/en/summoners-war-codes/"),
    ("supercheats", "https://www.supercheats.com/summoners-war-codes-cheats-tips"),
    ("mrguider", "https://www.mrguider.org/codes/summoners-war-codes/"),
    ("tryhardguides", "https://tryhardguides.com/summoners-war-codes/"),
    ("progameguides", "https://progameguides.com/summoners-war/summoners-war-codes/"),
)
TRUSTED = {"sw-teams", "swcoupon", "summonerswarcodes", "swquery", "swgt"}

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
HISTORY = ROOT / "codes-history.json"
CODES_JSON = ROOT / "codes.json"

CODE_RE = re.compile(r"\b[A-Z0-9][A-Z0-9]{5,31}\b", re.I)
BANNED = {
    "ACTIVE", "EXPIRED", "WORKING", "AVAILABLE", "CODES", "CODE", "SUMMONERS",
    "WAR", "SKY", "ARENA", "ENERGY", "MANA", "SCROLL", "REDEEM", "COUPON",
    "COPY", "REWARD", "REWARDS", "LATEST", "NEW", "GUIDE", "GAME", "GAMES",
    "COM2US", "ANDROID", "IPHONE", "WINDOWS", "FACEBOOK", "DISCORD", "TWITTER",
}


def fetch(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; YunaMyst-Code-Updater/6.0)",
        "Accept": "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.7",
    })
    with urllib.request.urlopen(req, timeout=25) as response:
        return response.read().decode("utf-8", "ignore")


def clean_text(raw):
    raw = re.sub(r"<script\b[^>]*>.*?</script>", " ", raw, flags=re.I | re.S)
    raw = re.sub(r"<style\b[^>]*>.*?</style>", " ", raw, flags=re.I | re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", raw)))


def normalize_codes(tokens):
    out, seen = [], set()
    for token in tokens:
        code = token.strip().strip("`.,:;()[]{}<>\"").upper()
        if not 6 <= len(code) <= 32:
            continue
        if code in BANNED or not re.search(r"[A-Z]", code) or not re.search(r"\d", code):
            continue
        if code not in seen:
            seen.add(code)
            out.append(code)
    return out


def active_blocks(text):
    lower = text.lower()
    starts = (
        "working summoners war codes", "working codes", "available codes",
        "active summoners war codes", "new & active summoners war codes",
        "new and active summoners war codes", "currently working summoners war codes",
        "working summoners war codes", "new summoners war codes",
        "all summoners war codes 2026",
    )
    stops = (
        "expired summoners war codes", "expired codes", "expired",
        "how to redeem", "how do i redeem", "how to use",
    )
    blocks = []
    for marker in starts:
        start = lower.find(marker)
        if start < 0:
            continue
        end = len(text)
        for stop in stops:
            pos = lower.find(stop, start + len(marker))
            if pos >= 0:
                end = min(end, pos)
        blocks.append(text[start:end])
    return blocks


def parse_source(name, raw):
    text = clean_text(raw)
    blocks = active_blocks(text)
    candidates = set(normalize_codes(CODE_RE.findall(" ".join(blocks)))) if blocks else set()

    # Also recognize table-style pages where each code is explicitly marked Active.
    # The local window prevents codes from an expired section being accepted.
    for match in CODE_RE.finditer(text):
        window = text[max(0, match.start() - 90): match.end() + 90].lower()
        if "active" in window and "expired" not in window:
            candidates.update(normalize_codes([match.group(0)]))

    if name == "sw-teams":
        explicit = re.findall(r"\b([A-Za-z0-9]{6,32})\b\s+Active\b", text, flags=re.I)
        candidates.update(normalize_codes(explicit))
    return sorted(candidates)


def replace_div_by_id(text, element_id, replacement):
    opening = re.compile(rf'<div\b(?=[^>]*\bid=["\']{re.escape(element_id)}["\'])[^>]*>', re.I)
    match = opening.search(text)
    if not match:
        raise RuntimeError(f'Elemento <div id="{element_id}"> não encontrado')
    tags = re.compile(r"<div\b[^>]*>|</div\s*>", re.I)
    depth = 0
    end = None
    for tag in tags.finditer(text, match.start()):
        depth += 1 if tag.group(0).lower().startswith("<div") else -1
        if depth == 0:
            end = tag.end()
            break
    if end is None:
        raise RuntimeError(f'Fecho de <div id="{element_id}"> não encontrado')
    return text[:match.start()] + replacement + text[end:]


def remove_expired_ui(index):
    index = re.sub(r'<button\b(?=[^>]*\bexpired\b)[^>]*>.*?</button>', '', index, flags=re.I | re.S)
    index = re.sub(r'<button\b[^>]*>\s*[^<]*CÓDIGOS\s+EXPIRADOS[^<]*</button>', '', index, flags=re.I | re.S)
    try:
        index = replace_div_by_id(index, "expirados", '<div id="expirados" class="code-list expired-list" style="display:none!important"></div>')
    except RuntimeError:
        pass
    index = index.replace('Códigos ativos e expirados de Summoners War — YunaMyst.', 'Códigos ativos de Summoners War — YunaMyst.')
    index = index.replace('códigos ativos e expirados', 'códigos ativos')
    return index


def card(code):
    safe = html.escape(code, quote=True)
    js = code.replace("\\", "\\\\").replace("'", "\\'")
    return (
        '<article class="code auto-code"><div class="gift">🎁</div>'
        f'<div class="cinfo"><strong>{safe}</strong><small>🔄 Código ativo</small></div>'
        '<div class="reward"><span class="scroll"></span><b>—</b><small>Recompensa</small></div>'
        '<div class="reward"><span class="energy">⚡</span><b>—</b><small>Energia</small></div>'
        '<div class="reward"><span class="mana"></span><b>—</b><small>Mana</small></div>'
        f'<button class="copy" type="button" data-code="{safe}" onclick="copiar(\'{js}\',this)">▣ COPIAR</button>'
        f'<a class="link" href="https://withhive.me/313/{safe}" target="_blank" rel="noopener noreferrer">🔗 LINK</a></article>'
    )


def main():
    found, errors = {}, []
    successful = 0
    for name, url in SOURCES:
        try:
            codes = parse_source(name, fetch(url))
            successful += 1
            print(f"Fonte {name}: {len(codes)} candidatos ativos")
            for code in codes:
                found.setdefault(code, {"code": code, "sources": set()})["sources"].add(name)
        except Exception as exc:
            errors.append(f"{name}: {exc}")
            print(f"Fonte {name}: ERRO - {exc}")

    # Discovery uses all 20 sources, but publication requires confirmation from
    # at least two trusted live trackers. This prevents stale guide pages from
    # reviving old codes while still allowing the 20-source network to discover them.
    confirmed = sorted(
        [v for v in found.values() if len(v["sources"] & TRUSTED) >= 2],
        key=lambda v: (-len(v["sources"] & TRUSTED), -len(v["sources"]), v["code"]),
    )
    active = [v["code"] for v in confirmed]
    if not active:
        raise RuntimeError("Nenhum código confirmado por 2 fontes confiáveis; atualização abortada por segurança.")

    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    history = {"active": [], "expired": [], "missing": {}, "updated_at": now, "sources": {}, "source_errors": []}
    if HISTORY.exists():
        try:
            history.update(json.loads(HISTORY.read_text(encoding="utf-8")))
        except Exception:
            pass

    previous_active = {str(c).upper() for c in history.get("active", [])}
    previous_expired = normalize_codes(history.get("expired", []))
    current = set(active)
    missing = {str(k).upper(): int(v) for k, v in history.get("missing", {}).items()}

    # If a code disappears from all trusted active sources for two consecutive
    # hourly checks, mark it expired in history. It is never displayed on the site.
    for code in previous_active - current:
        missing[code] = missing.get(code, 0) + 1
    for code in current:
        missing.pop(code, None)

    newly_expired = [code for code in previous_active if code not in current and missing.get(code, 0) >= 2]
    expired = normalize_codes(previous_expired + newly_expired)
    expired = [code for code in expired if code not in current]

    index = INDEX.read_text(encoding="utf-8")
    index = replace_div_by_id(index, "ativos", '<div id="ativos" class="code-list">\n' + "\n".join(card(c) for c in active) + '\n</div>')
    INDEX.write_text(remove_expired_ui(index), encoding="utf-8")

    details = {v["code"]: {
        "trusted": sorted(v["sources"] & TRUSTED),
        "all": sorted(v["sources"]),
    } for v in confirmed}
    CODES_JSON.write_text(json.dumps({
        "updated": now,
        "source_count": len(SOURCES),
        "successful_sources": successful,
        "trusted_confirmation": 2,
        "codes": active,
        "sources": details,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    HISTORY.write_text(json.dumps({
        "active": active,
        "expired": expired,
        "missing": {k: v for k, v in missing.items() if k not in current and v < 2},
        "updated_at": now,
        "sources": details,
        "source_errors": errors,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"20 fontes configuradas: {len(SOURCES)}")
    print(f"Fontes que responderam: {successful}/{len(SOURCES)}")
    print(f"Códigos ativos publicados: {len(active)}")
    print(f"Novos códigos confirmados: {', '.join(sorted(current - previous_active)) or 'nenhum'}")
    print(f"Expirados nesta execução: {', '.join(newly_expired) or 'nenhum'}")


if __name__ == "__main__":
    main()
