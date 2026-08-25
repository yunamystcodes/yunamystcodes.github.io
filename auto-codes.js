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

    /* Deixar somente o botão PARCERIA na barra: remove WhatsApp e qualquer outro botão comunitário. */
    document.querySelectorAll('.community-links .community-tab:not(.partnership)').forEach(el=>el.remove());
    const community=document.querySelector('.community-links');
    if(community){
      community.style.width='min(330px,calc(100% - 24px))';
      community.style.maxWidth='330px';
      community.style.margin='0 auto 18px';
    }

    const removeFeedback=()=>{
      const selectors='.feedback-summary,.feedback-list,.rating,.ratings,.reviews,.review-list,.player-feedback,.feedback,.avaliacoes,.avaliacoes-players,[class*="feedback"],[class*="rating"],[class*="review"]';
      card.querySelectorAll(selectors).forEach(el=>el.remove());
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

    const h=card.querySelector('h3');
    if(h)h.innerHTML='🤝 PARCERIA<br>YUNAMYST CODES';
    const p=card.querySelector('p');
    if(p)p.textContent='Queres fazer uma parceria com o YunaMyst Codes? Este espaço é para criadores, marcas e projetos relacionados com Summoners War. Entra em contacto através das redes sociais do YunaMyst para apresentar a tua proposta.';

    card.style.width='min(640px,calc(100vw - 32px))';
    card.style.maxWidth='640px';
    card.style.boxSizing='border-box';
    card.style.maxHeight='calc(100vh - 32px)';
    card.style.overflowY='auto';
    card.style.padding='38px 34px 34px';
    card.style.border='1px solid #9b55ff';
    card.style.borderRadius='28px';
    card.style.textAlign='center';

    document.getElementById('yunamyst-partnership-fix')?.remove();
    const style=document.createElement('style');
    style.id='yunamyst-partnership-fix';
    style.textContent=`
      .community-links .community-tab:not(.partnership){display:none!important}
      .community-links:has(.community-tab.partnership){width:min(330px,calc(100% - 24px))!important;max-width:330px!important}
      #parceriaModal{position:fixed!important;inset:0!important;z-index:99999!important;display:none;align-items:center!important;justify-content:center!important;padding:16px!important;overflow:auto!important;background:rgba(2,1,8,.78)!important;}
      #parceriaModal.open{display:flex!important;}
      #parceriaModal .partnership-card{position:relative!important;width:min(640px,calc(100vw - 32px))!important;max-width:640px!important;max-height:calc(100vh - 32px)!important;margin:auto!important;box-sizing:border-box!important;overflow-y:auto!important;border:1px solid #9b55ff!important;border-radius:28px!important;text-align:center!important;background:linear-gradient(180deg,rgba(22,10,40,.99),rgba(7,4,18,.99))!important;}
      #parceriaModal .partnership-card h3{color:#f0ce70!important;font-family:Georgia,serif!important;font-size:32px!important;line-height:1.12!important;margin:0 42px 24px!important;font-weight:900!important;}
      #parceriaModal .partnership-card p{color:#c9c0d0!important;font-size:18px!important;line-height:1.55!important;padding:0!important;margin:0!important;}
      #parceriaModal .modal-close{position:absolute!important;top:10px!important;right:12px!important;z-index:20!important;touch-action:manipulation!important;}
      @media(max-width:600px){
        #parceriaModal{padding:12px!important;}
        #parceriaModal .partnership-card{width:calc(100vw - 24px)!important;max-width:none!important;max-height:calc(100vh - 24px)!important;padding:46px 34px 38px!important;border-radius:28px!important;}
        #parceriaModal .partnership-card h3{font-size:32px!important;line-height:1.12!important;margin:0 22px 26px!important;}
        #parceriaModal .partnership-card p{font-size:18px!important;line-height:1.55!important;}
      }
    `;
    document.head.appendChild(style);

    if(!modal.dataset.yunaPartnershipObserver){
      modal.dataset.yunaPartnershipObserver='1';
      const observer=new MutationObserver(()=>{removeFeedback();document.querySelectorAll('.community-links .community-tab:not(.partnership)').forEach(el=>el.remove());});
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
