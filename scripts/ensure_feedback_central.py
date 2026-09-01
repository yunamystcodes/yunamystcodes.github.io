from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# Remove old client-only feedback scripts before installing the shared server-backed one.
s = re.sub(r'<script id="yunamyst-feedback-js">.*?</script>', '', s, flags=re.S)
s = re.sub(r'<script id="yunamyst-feedback-all-js">.*?</script>', '', s, flags=re.S)
s = re.sub(r'<script id="yunamyst-feedback-central-js">.*?</script>', '', s, flags=re.S)

js = r'''<script id="yunamyst-feedback-central-js">
(function(){
const API='https://uxwbbaeupemihonwyszu.supabase.co/functions/v1/feedbacks';
const root=document.getElementById('ym-feedback');
const modal=document.getElementById('ym-feedback-modal');
const list=document.getElementById('ym-feedback-list');
const open=document.getElementById('ym-feedback-all');
const close=document.getElementById('ym-feedback-modal-close');
if(!root||!modal||!list||!open||!close)return;
let rating=0;
const stars=[...root.querySelectorAll('.ym-star')];
const submit=document.getElementById('ym-feedback-submit');
stars.forEach(star=>star.addEventListener('click',()=>{rating=Number(star.dataset.rating)||0;stars.forEach(x=>x.classList.toggle('active',Number(x.dataset.rating)<=rating));}));
async function loadFeedbacks(){
list.innerHTML='<div class="ym-feedback-empty">A carregar todos os feedbacks...</div>';
try{
const res=await fetch(API+'?t='+Date.now(),{cache:'no-store',headers:{'Accept':'application/json'}});
if(!res.ok)throw new Error('GET '+res.status);
const items=await res.json(); list.innerHTML='';
if(!Array.isArray(items)||!items.length){list.innerHTML='<div class="ym-feedback-empty">Ainda não há feedbacks enviados.</div>';return;}
items.forEach(x=>{
const box=document.createElement('div');box.className='ym-feedback-item';
const head=document.createElement('div');head.className='ym-feedback-item-head';
const name=document.createElement('div');name.className='ym-feedback-item-name';name.textContent=x.name||'Jogador';
const starsBox=document.createElement('div');starsBox.className='ym-feedback-item-stars';
const n=Math.max(0,Math.min(5,Number(x.rating)||0));starsBox.textContent='★'.repeat(n)+'☆'.repeat(5-n);
const text=document.createElement('div');text.className='ym-feedback-item-text';text.textContent=x.message||'';
head.append(name,starsBox);box.append(head,text);list.append(box);
});
}catch(e){console.error('Feedbacks:',e);list.innerHTML='<div class="ym-feedback-empty">Não foi possível carregar os feedbacks. Tenta novamente.</div>';}}
if(submit)submit.addEventListener('click',async()=>{
const name=(root.querySelector('.ym-feedback-name')?.value||'').trim()||'Jogador';
const message=(root.querySelector('.ym-feedback-text')?.value||'').trim();
if(!rating||!message){alert('Escolhe uma avaliação e escreve uma mensagem.');return;}
submit.disabled=true; const oldText=submit.textContent; submit.textContent='A ENVIAR...';
try{
const res=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name,rating,message})});
if(!res.ok)throw new Error('POST '+res.status);
root.querySelector('.ym-feedback-text').value='';stars.forEach(x=>x.classList.remove('active'));rating=0;
submit.textContent='FEEDBACK ENVIADO ✓'; await loadFeedbacks(); setTimeout(()=>submit.textContent=oldText,1800);
}catch(e){console.error('Envio de feedback:',e);alert('Não foi possível enviar o feedback. Tenta novamente.');submit.textContent=oldText;}finally{submit.disabled=false;}
});
open.addEventListener('click',()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false');loadFeedbacks();});
close.addEventListener('click',()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true');});
modal.addEventListener('click',e=>{if(e.target===modal)close.click();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))close.click();});
})();
</script>'''

if '</body>' not in s:
    raise SystemExit('ERRO: index.html não contém </body>')

s = s.replace('</body>', js + '\n</body>', 1)
p.write_text(s, encoding='utf-8')
print('OK: feedback centralizado instalado no index.html')
