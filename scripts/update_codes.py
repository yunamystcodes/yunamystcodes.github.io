import html
import json
import re
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

# We use several independent public code lists so a single stale/failed
# source cannot stop the YunaMyst list from receiving new codes.
SOURCES = (
    ("sw-teams", "https://sw-teams.ovh/codes"),
    ("allthings", "https://allthings.how/summoners-war-codes/"),
    ("nerdschalk", "https://nerdschalk.com/summoners-war-codes/"),
    ("summonerswarcodes", "https://summonerswarcodes.us/"),
)
ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
HISTORY = ROOT / "codes-history.json"

CODE_RE = re.compile(r"\b[A-Z0-9][A-Z0-9]{5,31}\b", re.I)


def fetch_html(url):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; YunaMyst-Code-Updater/3.0)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read().decode("utf-8", "ignore")


def clean_text(raw):
    raw = re.sub(r"<script\b[^>]*>.*?</script>", " ", raw, flags=re.I | re.S)
    raw = re.sub(r"<style\b[^>]*>.*?</style>", " ", raw, flags=re.I | re.S)
    text = html.unescape(re.sub(r"<[^>]+>", " ", raw))
    return re.sub(r"\s+", " ", text)


def unique_codes(items):
    out = []
    seen = set()
    for item in items:
        code = item.strip().strip("`.,:;()[]{}<>\"")
        if not 6 <= len(code) <= 32:
            continue
        key = code.upper()
        # Ignore ordinary English words that happen to look code-like.
        if key in {"ACTIVE", "EXPIRED", "WORKING", "CODES", "SUMMONERS", "REDEEM", "NEWCODE"}:
            continue
        if key not in seen:
            seen.add(key)
            out.append(code)
    return out


def parse_active_block(text):
    """Extract code-looking tokens from sections explicitly describing working codes."""
    lower = text.lower()
    blocks = []
    markers = (
        "working summoners war codes",
        "working codes",
        "available codes",
        "active summoners war codes",
        "new & active summoners war codes",
        "new and active summoners war codes",
    )
    stop_markers = (
        "how to redeem",
        "how to use",
        "expired summoners war codes",
        "expired codes",
        "expired",
    )
    for marker in markers:
        start = lower.find(marker)
        if start < 0:
            continue
        end = len(text)
        for stop in stop_markers:
            pos = lower.find(stop, start + len(marker))
            if pos >= 0:
                end = min(end, pos)
        blocks.append(text[start:end])

    codes = []
    for block in blocks:
        for token in CODE_RE.findall(block):
            # Coupon codes in this game are normally mixed alphanumeric and
            # contain at least one digit. This removes headings/normal words.
            if re.search(r"\d", token):
                codes.append(token)
    return unique_codes(codes)


def parse_source(name, raw):
    text = clean_text(raw)
    codes = parse_active_block(text)

    # sw-teams explicitly writes "CODE Active"; this parser is more precise.
    if name == "sw-teams":
        explicit = re.findall(r"\b([A-Za-z0-9]{6,32})\b\s+Active\b", text, flags=re.I)
        codes = unique_codes(explicit)

    return codes


def fetch_sources():
    found = {}
    errors = []
    for name, url in SOURCES:
        try:
            raw = fetch_html(url)
            codes = parse_source(name, raw)
            print(f"Fonte {name}: {len(codes)} códigos encontrados")
            for code in codes:
                found.setdefault(code.upper(), {"code": code, "sources": []})["sources"].append(name)
        except Exception as exc:
            errors.append(f"{name}: {exc}")
            print(f"Fonte {name}: ERRO - {exc}")

    if not found:
        raise RuntimeError("Nenhuma fonte devolveu códigos ativos. " + " | ".join(errors))

    # A code is accepted when at least two independent sources currently list
    # it as active. This catches new codes while filtering most stale entries.
    # If fewer than two sources are available, do not publish a speculative list.
    source_count = sum(1 for _name, _url in SOURCES if _name not in {e.split(":", 1)[0] for e in errors})
    if source_count >= 2:
        active = [v["code"] for v in found.values() if len(set(v["sources"])) >= 2]
    else:
        active = []

    if len(active) < 3:
        raise RuntimeError(
            f"A verificação encontrou apenas {len(active)} códigos confirmados por pelo menos 2 fontes. "
            "Atualização abortada para não publicar códigos duvidosos."
        )

    return unique_codes(active), found, errors


def active_card(code):
    safe = html.escape(code, quote=True)
    js_code = code.replace("\\", "\\\\").replace("'", "\\'")
    return (
        '<article class="code auto-code">'
        '<div class="gift">🎁</div>'
        f'<div class="cinfo"><strong>{safe}</strong><small>🔄 Código ativo</small></div>'
        '<div class="reward"><span class="scroll"></span><b>—</b><small>Recompensa</small></div>'
        '<div class="reward"><span class="energy">⚡</span><b>—</b><small>Info</small></div>'
        '<div class="reward"><span class="mana"></span><b>—</b><small>Info</small></div>'
        f'<button class="copy" onclick="copiar(\'{js_code}\',this)">▣ COPIAR</button>'
        '<a class="link" href="https://withhive.me/313/000000000" target="_blank" rel="noopener">🔗 LINK</a>'
        '</article>'
    )


def expired_card(code):
    safe = html.escape(code, quote=True)
    return (
        '<article class="code expired-code auto-expired">'
        '<div class="gift">🎁</div>'
        f'<div class="cinfo"><strong>{safe}</strong><small>Não disponível para resgate</small></div>'
        '<div class="badge-expired">⛔ EXPIRADO</div>'
        '</article>'
    )


def replace_div_by_id(text, element_id, replacement):
    opening = re.compile(
        rf'<div\b(?=[^>]*\bid=["\']{re.escape(element_id)}["\'])[^>]*>',
        flags=re.I,
    )
    match = opening.search(text)
    if not match:
        raise RuntimeError(f'Elemento <div id="{element_id}"> não encontrado no index.html')

    tag_re = re.compile(r"<div\b[^>]*>|</div\s*>", flags=re.I)
    depth = 0
    end = None
    for tag in tag_re.finditer(text, match.start()):
        if tag.group(0).lower().startswith("<div"):
            depth += 1
        else:
            depth -= 1
            if depth == 0:
                end = tag.end()
                break

    if end is None:
        raise RuntimeError(f'Não foi possível localizar o fechamento de <div id="{element_id}">')

    return text[:match.start()] + replacement + text[end:]


def update_expired_count(index, count):
    index = re.sub(r"🔴\s*\d+\s+códigos expirados", f"🔴 {count} códigos expirados", index)
    index = re.sub(r"🔴\s*\d+\s+expired codes", f"🔴 {count} expired codes", index)
    return index


def main():
    active, details, errors = fetch_sources()
    active_keys = {c.upper() for c in active}

    history = json.loads(HISTORY.read_text(encoding="utf-8"))
    previous_active = unique_codes(history.get("active", []))
    previous_expired = unique_codes(history.get("expired", []))

    # Never replace a healthy list with a suspiciously small result.
    if previous_active and len(active) < max(3, len(previous_active) // 2):
        raise RuntimeError(
            f"Foram confirmados apenas {len(active)} códigos; antes eram {len(previous_active)}. "
            "Atualização abortada por segurança."
        )

    # Anything that was active but is no longer confirmed by the sources is
    # moved to the expired/history section on this run.
    newly_expired = [c for c in previous_active if c.upper() not in active_keys]
    expired = unique_codes(newly_expired + previous_expired)
    expired = [c for c in expired if c.upper() not in active_keys]

    index = INDEX.read_text(encoding="utf-8")
    active_html = (
        '<div id="ativos" class="code-list">\n'
        + "\n".join(active_card(c) for c in active)
        + "\n</div>"
    )
    index = replace_div_by_id(index, "ativos", active_html)

    expired_html = (
        '<div id="expirados" class="code-list expired-list">\n'
        + "\n".join(expired_card(c) for c in expired)
        + f'\n<div class="more">🔴 {len(expired)} códigos expirados • Esta aba guarda o histórico.</div>\n'
        + "</div>"
    )
    index = replace_div_by_id(index, "expirados", expired_html)
    index = update_expired_count(index, len(expired))
    index = re.sub(
        r'(<meta name="build-version" content=")[^"]*(")',
        rf"\g<1>auto-codes-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M')}\g<2>",
        index,
    )

    INDEX.write_text(index, encoding="utf-8")
    HISTORY.write_text(
        json.dumps(
            {
                "active": active,
                "expired": expired,
                "updated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
                "sources": {k: v["sources"] for k, v in details.items() if k in active_keys},
                "source_errors": errors,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    print(f"Códigos ativos confirmados: {len(active)}")
    print(f"Códigos expirados no histórico: {len(expired)}")
    print("Novos expirados nesta execução:", ", ".join(newly_expired) if newly_expired else "nenhum")
    print("Novos/ativos:", ", ".join(active))


if __name__ == "__main__":
    main()
