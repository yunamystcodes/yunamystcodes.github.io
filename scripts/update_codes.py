import html
import json
import re
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

# 20 independent code sources. A source can fail without stopping the update.
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

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
HISTORY = ROOT / "codes-history.json"
CODES_JSON = ROOT / "codes.json"

CODE_RE = re.compile(r"\b[A-Z0-9][A-Z0-9]{5,31}\b", re.I)
BANNED = {
    "ACTIVE", "EXPIRED", "WORKING", "AVAILABLE", "CODES", "CODE", "SUMMONERS",
    "WAR", "SKY", "ARENA", "ENERGY", "MANA", "SCROLL", "REDEEM", "COUPON",
    "COPY", "REWARD", "REWARDS", "LATEST", "NEW", "GUIDE", "GAME", "GAMES",
}


def fetch(url):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; YunaMyst-Code-Updater/4.0)",
            "Accept": "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.7",
        },
    )
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
        if not 6 <= len(code) <= 32 or code in BANNED or not re.search(r"[A-Z]", code) or not re.search(r"\d", code):
            continue
        if code not in seen:
            seen.add(code)
            out.append(code)
    return out


def active_block(text):
    lower = text.lower()
    starts = (
        "working summoners war codes", "working codes", "available codes",
        "active summoners war codes", "new & active summoners war codes",
        "new and active summoners war codes", "currently working summoners war codes",
        "all summoners war codes 2026", "new summoners war codes",
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
    blocks = active_block(text)
    # Prefer the explicitly active sections. If a page has no headings, use the first
    # part of the page, but never use its expired section.
    candidate_text = " ".join(blocks) if blocks else text[:120000]
    codes = normalize_codes(CODE_RE.findall(candidate_text))
    if name == "sw-teams":
        explicit = re.findall(r"\b([A-Za-z0-9]{6,32})\b\s+Active\b", text, flags=re.I)
        if explicit:
            codes = normalize_codes(explicit)
    return codes


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
    found = {}
    errors = []
    successful = 0
    for name, url in SOURCES:
        try:
            codes = parse_source(name, fetch(url))
            successful += 1
            print(f"Fonte {name}: {len(codes)} códigos candidatos")
            for code in codes:
                found.setdefault(code, {"code": code, "sources": set()})["sources"].add(name)
        except Exception as exc:
            errors.append(f"{name}: {exc}")
            print(f"Fonte {name}: ERRO - {exc}")

    # A code is published as active only after at least two independent sources agree.
    confirmed = sorted(
        [v for v in found.values() if len(v["sources"]) >= 2],
        key=lambda v: (-len(v["sources"]), v["code"]),
    )
    active = [v["code"] for v in confirmed]
    if not active:
        raise RuntimeError("Nenhum código foi confirmado por pelo menos 2 fontes; atualização abortada.")

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

    # A code missing from all currently readable active lists for two consecutive
    # hourly checks is moved to the expired history. It is never shown on the site.
    for code in list(previous_active - current):
        missing[code] = missing.get(code, 0) + 1
    for code in list(current):
        missing.pop(code, None)

    newly_expired = [code for code in previous_active if code not in current and missing.get(code, 0) >= 2]
    expired = normalize_codes(previous_expired + newly_expired)
    expired = [code for code in expired if code not in current]

    # New code = confirmed by 2+ sources. Existing active codes remain active while confirmed.
    INDEX.write_text(
        remove_expired_ui(
            replace_div_by_id(
                INDEX.read_text(encoding="utf-8"),
                "ativos",
                '<div id="ativos" class="code-list">\n' + "\n".join(card(c) for c in active) + '\n</div>',
            )
        ),
        encoding="utf-8",
    )

    details = {v["code"]: sorted(v["sources"]) for v in confirmed}
    CODES_JSON.write_text(
        json.dumps({"updated": now, "source_count": len(SOURCES), "successful_sources": successful, "codes": active, "sources": details}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    HISTORY.write_text(
        json.dumps({
            "active": active,
            "expired": expired,
            "missing": {k: v for k, v in missing.items() if k not in current and v < 2},
            "updated_at": now,
            "sources": details,
            "source_errors": errors,
        }, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"20 fontes configuradas: {len(SOURCES)}")
    print(f"Fontes que responderam: {successful}/{len(SOURCES)}")
    print(f"Códigos ativos publicados: {len(active)}")
    print(f"Novos códigos confirmados: {', '.join(sorted(current - previous_active)) or 'nenhum'}")
    print(f"Expirados nesta execução: {', '.join(newly_expired) or 'nenhum'}")


if __name__ == "__main__":
    main()
