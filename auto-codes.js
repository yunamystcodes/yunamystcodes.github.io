(()=>{
  const redeemBase='https://withhive.me/313/';
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function card(code){
    const url=redeemBase+encodeURIComponent(code);
    return `<div class="code auto-code"><div class="gift">🎁</div><div class="cinfo"><strong>${esc(code)}</strong><small>🔄 Código ativo</small></div><div class="reward"><div class="scroll"></div><b>?</b><small>Reward</small></div><div class="reward"><div class="energy">⚡</div><b>?</b><small>Energy</small></div><div class="reward"><div class="mana"></div><b>?</b><small>Mana</small></div><button class="copy" type="button" data-code="${esc(code)}">▣ COPIAR</button><a class="link" href="${url}" target="_blank" rel="noopener">🔗 LINK</a></div>`;
  }

  async function load(){
    const active=document.getElementById('ativos');
    if(!active)return;
    try{
      const r=await fetch('./codes.json?ts='+Date.now(),{cache:'no-store'});
      if(!r.ok)throw new Error('codes');
      const data=await r.json();
      const codes=[...new Set((data.codes||[]).filter(c=>typeof c==='string'&&/^[A-Z0-9]{5,40}$/.test(c)))];
      if(!codes.length)return;
      active.innerHTML=codes.map(card).join('');
      active.querySelectorAll('.copy').forEach(b=>b.addEventListener('click',()=>{
        const code=b.dataset.code;
        const ok=()=>{const old=b.textContent;b.textContent='✓ COPIADO!';setTimeout(()=>b.textContent=old,1500)};
        if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(code).then(ok).catch(()=>prompt('Copie o código:',code));
        else prompt('Copie o código:',code);
      }));
      const sh=document.querySelector('#sectionHead span');
      if(sh)sh.textContent='⟳ Atualizado automaticamente';
      window.yunaMystCodes=data;
    }catch(e){
      console.warn('Não foi possível atualizar os códigos automaticamente.',e);
    }
  }

  function fixPartnership(){
    const modal=document.getElementById('parceriaModal');
    if(!modal)return;

    // Remove the old feedback elements accidentally placed inside the partnership popup.
    modal.querySelectorAll('.feedback-summary,.feedback-list').forEach(el=>el.remove());

    const card=modal.querySelector('.partnership-card');
    if(card){
      card.style.width='min(560px, calc(100vw - 32px))';
      card.style.maxWidth='560px';
      card.style.boxSizing='border-box';
      card.style.maxHeight='calc(100vh - 32px)';
      card.style.overflowY='auto';
      card.style.padding='28px 26px 24px';
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{load();fixPartnership();},{once:true});
  }else{
    load();
    fixPartnership();
  }
})();
