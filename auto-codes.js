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
    const card=modal.querySelector('.partnership-card');
    if(!card)return;

    const removeFeedback=()=>{
      const selectors='.feedback-summary,.feedback-list,.rating,.ratings,.reviews,.review-list,.player-feedback,.feedback,.avaliacoes,.avaliacoes-players,[class*="feedback"],[class*="rating"],[class*="review"]';
      card.querySelectorAll(selectors).forEach(el=>el.remove());

      // Remove any remaining rating/review block, including elements with no known class.
      Array.from(card.querySelectorAll('*')).reverse().forEach(el=>{
        if(el===card || el.matches('h1,h2,h3,h4,h5,h6,p,button'))return;
        const text=(el.textContent||'').replace(/\s+/g,' ').trim();
        if(!text)return;
        if(/\b\d+(?:[.,]\d+)?\s*\/\s*5\b/.test(text) || /\bavaliaç(?:ão|ões)\b/i.test(text) || /avaliações?\s+de\s+players/i.test(text)){
          if(el.children.length<=3 || text.length<180)el.remove();
        }
      });
    };

    removeFeedback();

    card.style.width='min(560px,calc(100vw - 32px))';
    card.style.maxWidth='560px';
    card.style.boxSizing='border-box';
    card.style.maxHeight='calc(100vh - 32px)';
    card.style.overflowY='auto';
    card.style.padding='28px 26px 24px';

    document.getElementById('yunamyst-partnership-fix')?.remove();
    const style=document.createElement('style');
    style.id='yunamyst-partnership-fix';
    style.textContent=`
      #parceriaModal{position:fixed!important;inset:0!important;z-index:99999!important;display:none;align-items:center!important;justify-content:center!important;padding:16px!important;overflow:auto!important;background:rgba(2,1,8,.78)!important;}
      #parceriaModal.open{display:flex!important;}
      #parceriaModal .partnership-card{position:relative!important;width:min(560px,calc(100vw - 32px))!important;max-width:560px!important;max-height:calc(100vh - 32px)!important;margin:auto!important;box-sizing:border-box!important;overflow-y:auto!important;border-radius:16px!important;}
      #parceriaModal .modal-close{position:absolute!important;top:10px!important;right:12px!important;z-index:20!important;touch-action:manipulation!important;}
      @media(max-width:600px){
        #parceriaModal{padding:12px!important;}
        #parceriaModal .partnership-card{width:calc(100vw - 24px)!important;max-width:none!important;max-height:calc(100vh - 24px)!important;padding:22px 18px 20px!important;border-radius:14px!important;}
        #parceriaModal .partnership-card h3{font-size:17px!important;line-height:1.3!important;padding-right:38px!important;margin-bottom:12px!important;}
        #parceriaModal .partnership-card p{font-size:14px!important;line-height:1.55!important;padding-right:0!important;}
      }
    `;
    document.head.appendChild(style);

    // Keep feedback completely outside the partnership popup even if another script recreates it.
    if(!modal.dataset.yunaPartnershipObserver){
      modal.dataset.yunaPartnershipObserver='1';
      const observer=new MutationObserver(removeFeedback);
      observer.observe(card,{childList:true,subtree:true});
    }

    const close=modal.querySelector('.modal-close');
    if(close&&!close.dataset.yunaPartnershipClose){
      close.dataset.yunaPartnershipClose='1';
      close.addEventListener('click',()=>modal.classList.remove('open'));
    }
    if(!modal.dataset.yunaPartnershipEvents){
      modal.dataset.yunaPartnershipEvents='1';
      modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open')});
      document.addEventListener('keydown',e=>{if(e.key==='Escape')modal.classList.remove('open')});
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{load();fixPartnership();},{once:true});
  }else{
    load();
    fixPartnership();
  }
})();
