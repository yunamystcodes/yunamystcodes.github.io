(()=>{
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const redeem='https://withhive.me/313/';
  const removeExtras=()=>{
    document.querySelectorAll('.feedback-summary,.feedback-list,.feedback-message,[class*="rating"],[class*="review"],[class*="avaliac"]').forEach(el=>el.remove());
    document.querySelectorAll('.contact-mail').forEach(el=>el.remove());
  };
  const card=code=>`<article class="code auto-code"><div class="gift">🎁</div><div class="cinfo"><strong>${esc(code)}</strong><small>🔄 Código ativo</small></div><div class="reward"><span class="scroll"></span><b>—</b><small>Recompensa</small></div><div class="reward"><span class="energy">⚡</span><b>—</b><small>Info</small></div><div class="reward"><span class="mana"></span><b>—</b><small>Info</small></div><button class="copy" type="button" data-code="${esc(code)}">▣ COPIAR</button><a class="link" href="${redeem}${encodeURIComponent(code)}" target="_blank" rel="noopener noreferrer">🔗 LINK</a></article>`;
  async function load(){
    const active=document.getElementById('ativos');
    if(!active)return;
    try{
      const r=await fetch('./codes.json?ts='+Date.now(),{cache:'no-store'});
      if(!r.ok)throw new Error('codes');
      const data=await r.json();
      const codes=[...new Set((data.codes||[]).filter(c=>typeof c==='string'&&/^[A-Z0-9]{5,40}$/.test(c)))];
      if(codes.length)active.innerHTML=codes.map(card).join('');
      active.querySelectorAll('.copy').forEach(b=>b.addEventListener('click',()=>{
        const code=b.dataset.code,old=b.textContent;
        const done=()=>{b.textContent='✓ COPIADO!';setTimeout(()=>b.textContent=old,1500)};
        if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(code).then(done).catch(()=>prompt('Copie o código:',code));else prompt('Copie o código:',code);
      }));
      const sh=document.querySelector('#sectionHead span');if(sh)sh.textContent='⟳ Atualizado automaticamente';
    }catch(e){console.warn('Não foi possível atualizar os códigos automaticamente.',e)}
  }
  function fix(){
    removeExtras();
    const modal=document.getElementById('parceriaModal');
    if(modal){
      const card=modal.querySelector('.partnership-card');
      if(card){
        card.querySelectorAll('.feedback-summary,.feedback-list,.feedback-message,[class*="rating"],[class*="review"],[class*="avaliac"]').forEach(el=>el.remove());
        const h=card.querySelector('#parceriaTitulo');if(h)h.innerHTML='🤝 PARCERIA YUNAMYST CODES';
        const p=card.querySelector('#parceriaTexto');if(p)p.textContent='Queres fazer uma parceria com o YunaMyst Codes? Este espaço é para criadores, marcas e projetos relacionados com Summoners War. Entra em contacto através das redes sociais do YunaMyst para apresentar a tua proposta.';
      }
    }
    const styleId='yunamyst-partnership-clean';
    if(!document.getElementById(styleId)){
      const s=document.createElement('style');s.id=styleId;s.textContent=`.contact-mail{display:none!important}.feedback-summary,.feedback-list,.feedback-message,[class*="rating"],[class*="review"],[class*="avaliac"]{display:none!important}.community-links{visibility:visible!important;opacity:1!important}.community-tab.whatsapp{display:flex!important;visibility:visible!important;opacity:1!important}`;document.head.appendChild(s);
    }
  }
  const start=()=>{load();fix();const obs=new MutationObserver(fix);obs.observe(document.body,{childList:true,subtree:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
