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
    req = urllib.request.Request(url, headers={"User-Agent": "YunaMyst-Code-Updater/1.2"})
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
    start = text.find("Working Summoners War codes")
    end = text.find("How to redeem codes in Summoners War", start + 1)
    if start == -1 or end == -1:
        return []
    block = text[start:end]
    tokens = block.split()
    codes = []
    for i, token in enumerate(tokens[:-1]):
        token = token.strip("`.,:;()[]")
        if not re.fullmatch(r"[A-Za-z0-9]{6,32}", token):
            continue
        nxt = tokens[i + 1].strip("`.,:;()[]").lower()
        if re.match(r"^\d", nxt) or nxt == "one":
            codes.append(token)
    return unique_codes(codes)


def unique_codes(items):
    out = []
    seen = set()
    for item in items:
        code = item.strip()
        if len(code) < 6 or len(code) > 32:
            continue
        key = code.upper()
        if key not in seen:
            seen.add(key)
            out.append(code)
    return out


def fetch_source():
    primary_error = None
    try:
        codes = parse_primary(fetch_html(PRIMARY_URL))
        if len(codes) >= 6:
            return codes, "primary"
    except Exception as exc:
        primary_error = exc

    try:
        codes = parse_fallback(fetch_html(FALLBACK_URL))
        if len(codes) >= 6:
            return codes, "fallback"
    except Exception as exc:
        if primary_error:
            raise RuntimeError(f"As duas fontes falharam: {primary_error}; {exc}")
        raise

    raise RuntimeError("As fontes não devolveram uma quantidade segura de códigos ativos.")


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


def replace_between(text, start_marker, end_marker, replacement):
    start = text.find(start_marker)
    if start == -1:
        raise RuntimeError(f"Marcador inicial não encontrado: {start_marker}")
    end = text.find(end_marker, start)
    if end == -1:
        raise RuntimeError(f"Marcador final não encontrado: {end_marker}")
    return text[:start] + replacement + text[end:]


def main():
    current, source = fetch_source()
    current_keys = {c.upper() for c in current}

    history = json.loads(HISTORY.read_text(encoding="utf-8"))
    previous_active = history.get("active", [])
    expired = list(history.get("expired", []))

    if previous_active and len(current) <= max(3, len(previous_active) // 2):
        raise RuntimeError(
            f"Fonte {source} retornou poucos códigos ({len(current)}; antes eram {len(previous_active)}). "
            "Atualização abortada por segurança."
        )

    newly_expired = [c for c in previous_active if c.upper() not in current_keys]
    expired = newly_expired + expired
    expired = [c for c in unique_codes(expired) if c.upper() not in current_keys]

    active = unique_codes(current)
    history = {
        "active": active,
        "expired": expired,
        "updated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
    }

    index = INDEX.read_text(encoding="utf-8")

    active_start = '<div id="ativos" class="code-list">'
    active_end = '</div><div class="tabs">'
    active_html = active_start + "\n" + "\n".join(active_card(c) for c in active) + "\n"
    index = replace_between(index, active_start, active_end, active_html)

    expired_start = '<div id="expirados" class="code-list expired-list">'
    expired_end = '</div>\n</section><aside'
    expired_html = expired_start + "\n" + "\n".join(expired_card(c) for c in expired)
    expired_html += f'<div class="more">🔴 {len(expired)} códigos expirados • Esta aba guarda o histórico.</div>\n'
    index = replace_between(index, expired_start, expired_end, expired_html)

    index = re.sub(r"🔴\s*\d+\s+códigos expirados", f"🔴 {len(expired)} códigos expirados", index)
    index = re.sub(r"🔴\s*\d+\s+expired codes", f"🔴 {len(expired)} expired codes", index)
    index = re.sub(
        r'(<meta name="build-version" content=")[^"]*(")',
        rf"\g<1>auto-codes-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M')}\g<2>",
        index,
    )

    INDEX.write_text(index, encoding="utf-8")
    HISTORY.write_text(json.dumps(history, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Fonte usada: {source}")
    print(f"Códigos ativos: {len(active)}")
    print(f"Códigos expirados no histórico: {len(expired)}")
    print("Novos expirados nesta execução:", ", ".join(newly_expired) if newly_expired else "nenhum")


if __name__ == "__main__":
    main()
