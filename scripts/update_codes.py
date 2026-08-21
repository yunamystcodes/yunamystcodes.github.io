import html
import json
import re
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

PRIMARY_URL = "https://sw-teams.ovh/codes"
FALLBACK_URL = "https://nerdschalk.com/summoners-war-codes/"
ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
HISTORY = ROOT / "codes-history.json"


def fetch_html(url):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; YunaMyst-Code-Updater/2.0)",
            "Accept": "text/html,application/xhtml+xml",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read().decode("utf-8", "ignore")


def clean_text(raw):
    raw = re.sub(r"<script\b[^>]*>.*?</script>", " ", raw, flags=re.I | re.S)
    raw = re.sub(r"<style\b[^>]*>.*?</style>", " ", raw, flags=re.I | re.S)
    text = html.unescape(re.sub(r"<[^>]+>", " ", raw))
    return re.sub(r"\s+", " ", text)


def parse_primary(raw):
    text = clean_text(raw)
    codes = re.findall(r"\b([A-Za-z0-9]{6,32})\b\s+Active\b", text, flags=re.I)
    return unique_codes(codes)


def parse_fallback(raw):
    text = clean_text(raw)
    start = text.lower().find("working summoners war codes")
    end = text.lower().find("how to redeem codes in summoners war", start + 1)
    if start == -1:
        return []
    block = text[start:end if end != -1 else len(text)]
    tokens = block.split()
    codes = []
    for i, token in enumerate(tokens):
        token = token.strip("`.,:;()[]")
        if not re.fullmatch(r"[A-Za-z0-9]{6,32}", token):
            continue
        # In this source the reward text normally follows the code.
        if i + 1 < len(tokens):
            nxt = tokens[i + 1].strip("`.,:;()[]").lower()
            if re.match(r"^\d", nxt) or nxt in {"one", "two", "three", "five", "new"}:
                codes.append(token)
    return unique_codes(codes)


def unique_codes(items):
    out = []
    seen = set()
    for item in items:
        code = item.strip()
        if not 6 <= len(code) <= 32:
            continue
        key = code.upper()
        if key not in seen:
            seen.add(key)
            out.append(code)
    return out


def fetch_source():
    errors = []

    for name, url, parser in (
        ("primary", PRIMARY_URL, parse_primary),
        ("fallback", FALLBACK_URL, parse_fallback),
    ):
        try:
            raw = fetch_html(url)
            codes = parser(raw)
            print(f"Fonte {name}: {len(codes)} códigos encontrados")
            if len(codes) >= 6:
                return codes, name
            errors.append(f"{name}: apenas {len(codes)} códigos")
        except Exception as exc:
            errors.append(f"{name}: {exc}")

    raise RuntimeError("Nenhuma fonte devolveu uma lista segura de códigos ativos. " + " | ".join(errors))


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
    """Replace a complete <div id="..."> element, including nested divs."""
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
    current, source = fetch_source()
    current_keys = {c.upper() for c in current}

    history = json.loads(HISTORY.read_text(encoding="utf-8"))
    previous_active = unique_codes(history.get("active", []))
    previous_expired = unique_codes(history.get("expired", []))

    # Safety: never replace a healthy list with an unexpectedly tiny result.
    if previous_active and len(current) < max(3, len(previous_active) // 2):
        raise RuntimeError(
            f"Fonte {source} retornou poucos códigos ({len(current)}; antes eram {len(previous_active)}). "
            "Atualização abortada por segurança."
        )

    newly_expired = [c for c in previous_active if c.upper() not in current_keys]
    expired = unique_codes(newly_expired + previous_expired)
    expired = [c for c in expired if c.upper() not in current_keys]
    active = unique_codes(current)

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
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    print(f"Fonte usada: {source}")
    print(f"Códigos ativos: {len(active)}")
    print(f"Códigos expirados no histórico: {len(expired)}")
    print("Novos expirados nesta execução:", ", ".join(newly_expired) if newly_expired else "nenhum")


if __name__ == "__main__":
    main()
