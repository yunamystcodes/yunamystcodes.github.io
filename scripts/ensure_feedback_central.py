from pathlib import Path
import re
import subprocess

GOOD_COMMIT = '15065bddf909ae12b1042db6e2904e610dc3ef51'
INDEX = Path('index.html')


def restore_if_broken():
    s = INDEX.read_text(encoding='utf-8')
    broken = '<body>' not in s or s.count('</body>') != 1 or 'YUNAMYST FEEDBACK GLOBAL FINAL' in s
    if not broken:
        return s
    subprocess.run(['git', 'fetch', '--no-tags', 'origin', GOOD_COMMIT, '--depth=1'], check=True)
    good = subprocess.check_output(['git', 'show', 'FETCH_HEAD:index.html'], text=True)
    INDEX.write_text(good, encoding='utf-8')
    print('RESTORED index.html from known-good commit')
    return good

s = restore_if_broken()

# Remove only old feedback injections. Never remove the actual page body.
s = re.sub(r'\s*<!-- YUNAMYST FEEDBACK GLOBAL FINAL -->.*?(?=</head>)', '\n', s, flags=re.S)
s = re.sub(r'<script id="yunamyst-feedback-central-js">.*?</script>\s*', '', s, flags=re.S)
s = re.sub(r'<script id="yunamyst-feedback-legacy-migration">.*?</script>\s*', '', s, flags=re.S)
s = re.sub(r'<script>\(function\(\)\{const root=document\.getElementById\(\'ym-feedback\'\).*?</script>\s*', '', s, flags=re.S)

feedback_css = '''<style id="ym-feedback-global-clean">
.ym-feedback-modal{display:none;position:fixed;inset:0;z-index:99999;align-items:center;justify-content:center;padding:14px;background:rgba(2,1,8,.84);backdrop-filter:blur(7px)}
.ym-feedback-modal.open{display:flex}.ym-feedback-modal-card{position:relative;width:min(620px,calc(100% - 20px));max-height:78vh;overflow:auto;padding:22px 18px 16px;border:1px solid #be66ff;border-radius:18px;background:linear-gradient(180deg,#160a28f7,#070412f7);box-shadow:0 25px 90px #000c;color:#fff}
.ym-feedback-modal-card h3{margin:0 38px 14px 0;color:#f0c45c;font-size:17px}.ym-feedback-modal-close{position:absolute;top:9px;right:9px;width:31px;height:31px;border:1px solid #fff3;border-radius:50%;background:#12091f;color:#fff;font-size:19px;cursor:pointer}
.ym-feedback-list{display:flex;flex-direction:column;gap:9px}.ym-feedback-empty{text-align:center;color:#aaa1b3;font-size:12px;padding:16px}.ym-feedback-item{padding:11px;border:1px solid #be66ff40;border-radius:11px;background:#0a0518cc}.ym-feedback-item-head{display:flex;justify-content:space-between;gap:10px;font-size:12px;font-weight:800}.ym-feedback-item-stars{color:#f0c45c;white-space:nowrap}.ym-feedback-item-text{margin-top:6px;color:#c9c0d0;font-size:12px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
@media(max-width:600px){.ym-feedback-modal-card{width:calc(100% - 6px);padding:20px 13px 14px}.ym-feedback-modal-card h3{font-size:15px}.ym-feedback-item-head,.ym-feedback-item-text{font-size:11px}}
</style>'''
if 'id="ym-feedback-global-clean"' not in s:
    s = s.replace('</head>', feedback_css + '\n</head>', 1)

modal = '''<div class="ym-feedback-modal" id="ym-feedback-modal" aria-hidden="true"><div class="ym-feedback-modal-card" role="dialog" aria-modal="true" aria-labelledby="ym-feedback-modal-title"><button class="ym-feedback-modal-close" id="ym-feedback-modal-close" type="button" aria-label="Fechar">×</button><h3 id="ym-feedback-modal-title">💜 TODOS OS FEEDBACKS</h3><div id="ym-feedback-list" class="ym-feedback-list"></div></div></div>'''
if 'id="ym-feedback-modal"' not in s:
    s = s.replace('</body>', modal + '\n</body>', 1)

feedback_js = '''<script id="ym-feedback-global-clean-js">(()=>{const API='https://uxwbbaeupemihonwyszu.supabase.co/functions/v1/feedbacks',root=document.getElementById('ym-feedback'),modal=document.getElementById('ym-feedback-modal'),list=document.getElementById('ym-feedback-list'),open=document.getElementById('ym-feedback-all'),close=document.getElementById('ym-feedback-modal-close');if(!root||!modal||!list||!open||!close)return;let rating=0;const stars=[...root.querySelectorAll('.ym-star')],submit=document.getElementById('ym-feedback-submit');stars.forEach(x=>x.addEventListener('click',()=>{rating=+x.dataset.star||0;stars.forEach(y=>y.classList.toggle('active',+y.dataset.star<=rating))}));async function load(){list.innerHTML='<div class="ym-feedback-empty">A carregar todos os feedbacks...</div>';try{const r=await fetch(API+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw 0;const a=await r.json();list.innerHTML='';if(!Array.isArray(a)||!a.length){list.innerHTML='<div class="ym-feedback-empty">Ainda não há feedbacks enviados.</div>';return}a.forEach(x=>{const b=document.createElement('div');b.className='ym-feedback-item';const h=document.createElement('div');h.className='ym-feedback-item-head';const n=document.createElement('span');n.textContent=x.name||'Jogador';const st=document.createElement('span');st.className='ym-feedback-item-stars';const q=Math.max(0,Math.min(5,+x.rating||0));st.textContent='★'.repeat(q)+'☆'.repeat(5-q);const t=document.createElement('div');t.className='ym-feedback-item-text';t.textContent=x.message||'';h.append(n,st);b.append(h,t);list.append(b)})}catch(e){list.innerHTML='<div class="ym-feedback-empty">Não foi possível carregar os feedbacks. Tenta novamente.</div>'}}submit?.addEventListener('click',async()=>{const name=(root.querySelector('.ym-feedback-name')?.value||'').trim()||'Jogador',message=(root.querySelector('.ym-feedback-text')?.value||'').trim();if(!rating||!message){alert('Escolhe uma avaliação e escreve uma mensagem.');return}submit.disabled=true;try{const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,rating,message})});if(!r.ok)throw 0;root.querySelector('.ym-feedback-text').value='';stars.forEach(x=>x.classList.remove('active'));rating=0;await load()}catch(e){alert('Não foi possível enviar o feedback. Tenta novamente.')}finally{submit.disabled=false}});open.addEventListener('click',()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false');load()});close.addEventListener('click',()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true')});modal.addEventListener('click',e=>{if(e.target===modal)close.click()})})()</script>'''
if 'id="ym-feedback-global-clean-js"' not in s:
    s = s.replace('</body>', feedback_js + '\n</body>', 1)

s = s.replace('\\n<!-- YUNAMYST FEEDBACK GLOBAL FINAL -->', '')
s = s.replace('\\n', '\n')

if '<body>' not in s or s.count('</body>') != 1 or '<main class="container layout">' not in s:
    raise SystemExit('ERRO: index.html ainda está estruturalmente inválido')

INDEX.write_text(s, encoding='utf-8')
print('OK: index íntegro + feedback centralizado + modal dentro do body')
