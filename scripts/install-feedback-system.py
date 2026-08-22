from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

START = '<!-- YUNAMYST-FEEDBACK-SYSTEM-START -->'
END = '<!-- YUNAMYST-FEEDBACK-SYSTEM-END -->'

block = r'''<!-- YUNAMYST-FEEDBACK-SYSTEM-START -->
<style>
#ym-feedback-system{margin-top:12px;border:1px solid rgba(190,102,255,.4);border-radius:18px;background:linear-gradient(180deg,rgba(12,7,29,.97),rgba(5,4,17,.97));overflow:hidden}
#ym-feedback-system .ym-fb-head{padding:15px;border-bottom:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:space-between;gap:10px;font-weight:900;font-size:14px}
#ym-feedback-system .ym-fb-head span{color:#d99cff;font-size:11px}
#ym-feedback-system .ym-fb-summary{padding:16px;text-align:center}
#ym-feedback-system .ym-fb-rating{font-size:26px;font-weight:900;color:#f4c83d}
#ym-feedback-system .ym-fb-stars{letter-spacing:2px;color:#f4c83d;font-size:19px;margin:4px 0}
#ym-feedback-system .ym-fb-count{color:#aaa1b2;font-size:11px}
#ym-feedback-system .ym-fb-bars{padding:0 16px 12px;display:flex;flex-direction:column;gap:6px}
#ym-feedback-system .ym-fb-row{display:grid;grid-template-columns:42px 1fr 30px;gap:7px;align-items:center;font-size:10px;color:#cfc7d7}
#ym-feedback-system .ym-fb-track{height:6px;border-radius:8px;background:#21152d;overflow:hidden}
#ym-feedback-system .ym-fb-fill{height:100%;width:0;background:linear-gradient(90deg,#7e36b5,#e1a0ff);border-radius:8px}
#ym-feedback-system .ym-fb-list{padding:0 12px 12px;display:flex;flex-direction:column;gap:8px}
#ym-feedback-system .ym-fb-comment{padding:11px;border:1px solid rgba(180,80,255,.28);border-radius:11px;background:rgba(18,9,31,.7);font-size:11px;color:#d7cedc;line-height:1.45}
#ym-feedback-system .ym-fb-comment .stars{color:#f4c83d;margin-bottom:3px}
#ym-feedback-system .ym-fb-comment .name{color:#d99cff;font-weight:900}
#ym-feedback-system .ym-fb-note{padding:0 16px 14px;text-align:center;color:#8f8798;font-size:10px;line-height:1.4}
@media(max-width:850px){#ym-feedback-system{margin-top:12px}.ym-fb-summary{padding:13px!important}.ym-fb-rating{font-size:23px!important}}
</style>
<section id="ym-feedback-system" aria-label="Avaliação dos jogadores">
  <div class="ym-fb-head"><span>⭐</span><b>Avaliação dos jogadores</b><span id="ym-fb-toggle">⌄</span></div>
  <div class="ym-fb-summary">
    <div class="ym-fb-rating" id="ym-fb-average">— / 5</div>
    <div class="ym-fb-stars" id="ym-fb-average-stars">★★★★★</div>
    <div class="ym-fb-count" id="ym-fb-count">A carregar avaliações...</div>
  </div>
  <div class="ym-fb-bars" id="ym-fb-bars">
    <div class="ym-fb-row"><span>★★★★★</span><div class="ym-fb-track"><div class="ym-fb-fill"></div></div><b>0</b></div>
    <div class="ym-fb-row"><span>★★★★</span><div class="ym-fb-track"><div class="ym-fb-fill"></div></div><b>0</b></div>
    <div class="ym-fb-row"><span>★★★</span><div class="ym-fb-track"><div class="ym-fb-fill"></div></div><b>0</b></div>
    <div class="ym-fb-row"><span>★★</span><div class="ym-fb-track"><div class="ym-fb-fill"></div></div><b>0</b></div>
    <div class="ym-fb-row"><span>★</span><div class="ym-fb-track"><div class="ym-fb-fill"></div></div><b>0</b></div>
  </div>
  <div class="ym-fb-list" id="ym-fb-list"></div>
  <div class="ym-fb-note" id="ym-fb-note">Os comentários dos jogadores aparecerão aqui depois de ligar a leitura pública das respostas do Formspree.</div>
</section>
<script>
(function(){
  const form='https://formspree.io/f/mdenpbql';
  document.querySelectorAll('form').forEach(f=>{if(f.id&&/feedback/i.test(f.id)) f.action=form;});
  const key='YUNAMYST_FORMSPREE_READONLY_KEY';
  const url='https://formspree.io/api/0/forms/mdenpbql/submissions?limit=100&order=desc';
  const average=document.getElementById('ym-fb-average'), stars=document.getElementById('ym-fb-average-stars'), count=document.getElementById('ym-fb-count'), list=document.getElementById('ym-fb-list'), note=document.getElementById('ym-fb-note');
  function render(data){
    const rows=(data||[]).filter(x=>!x._status || !x._status.spam);
    const vals=rows.map(x=>Number(x.rating||x.estrelas||x['rating (1-5)']||x['Estrelas'])).filter(x=>x>=1&&x<=5);
    const total=vals.length;
    const avg=total?vals.reduce((a,b)=>a+b,0)/total:0;
    average.textContent=total?avg.toFixed(1).replace('.',',')+' / 5':'— / 5';
    stars.textContent=total?'★★★★★':'☆☆☆☆☆'; count.textContent=total?total+' avaliações':'Ainda não há avaliações publicadas';
    const counts=[5,4,3,2,1].map(n=>vals.filter(v=>v===n).length), max=Math.max(1,total);
    document.querySelectorAll('#ym-fb-bars .ym-fb-row').forEach((r,i)=>{r.querySelector('.ym-fb-fill').style.width=(counts[i]/max*100)+'%';r.querySelector('b').textContent=counts[i];});
    list.innerHTML='';
    rows.slice(0,8).forEach(x=>{const r=Number(x.rating||x.estrelas||x['rating (1-5)']||x['Estrelas']); const msg=x.message||x.mensagem||x.feedback||x['Feedback']||''; const name=x.name||x.nome||x['Nome']||'Player'; if(!msg)return; const d=document.createElement('div'); d.className='ym-fb-comment'; d.innerHTML='<div class="stars">'+('★'.repeat(Math.max(0,Math.min(5,r))))+('☆'.repeat(Math.max(0,5-r)))+'</div><div>'+String(msg).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))+'</div><div class="name">— '+String(name).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))+'</div>'; list.appendChild(d);});
    note.textContent=total?'Comentários recentes dos jogadores.':'Ainda não há avaliações publicadas.';
  }
  if(key!=='YUNAMYST_FORMSPREE_READONLY_KEY') fetch(url,{headers:{Authorization:'Bearer '+key}}).then(r=>r.ok?r.json():Promise.reject()).then(j=>render(j.submissions||[])).catch(()=>{});
})();
</script>
<!-- YUNAMYST-FEEDBACK-SYSTEM-END -->'''

if START in s and END in s:
    a=s.index(START); b=s.index(END,a)+len(END); s=s[:a]+block+s[b:]
else:
    marker='</body>'
    s=s.replace(marker,block+'\n'+marker,1)

# Ensure the existing feedback form posts to the supplied endpoint without changing unrelated site code.
s=s.replace('action="mailto:solange.hannah90@gmail.com"', 'action="https://formspree.io/f/mdenpbql" method="POST"')
s=s.replace("mailto:solange.hannah90@gmail.com", "https://formspree.io/f/mdenpbql")
p.write_text(s,encoding='utf-8')
print('feedback system installed')
