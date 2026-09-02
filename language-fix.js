(()=>{
'use strict';
const PT_EN={'INÍCIO':'HOME','COMO USAR':'HOW TO USE','Sempre atualizados!':'Always updated!','Código ativo':'Active code','Códigos ativos':'Active codes','CÓDIGOS ATIVOS':'ACTIVE CODES','Copie o código':'Copy the code','Clica em COPIAR no código desejado.':'Click COPY on the desired code.','Abra o jogo':'Open the game','Entra no Summoners War: Sky Arena.':'Enter Summoners War: Sky Arena.','Resgata o código':'Redeem the code','Usa o link de resgate.':'Use the redeem link.','Aproveita!':'Enjoy!','Recebe a recompensa no jogo.':'Receive the reward in the game.','Onde coloco os códigos?':'Where do I enter the codes?','Os códigos expiram?':'Do the codes expire?','Posso usar no iPhone?':'Can I use it on iPhone?','SOBRE O SITE':'ABOUT THE SITE','Conteúdo diário de Summoners War!':'Daily Summoners War content!','Aqui encontras os códigos ativos de Summoners War: Sky Arena.':'Here you can find the active Summoners War: Sky Arena codes.','Guarda o site e volta sempre!':'Save the site and come back often!','Nome de player (opcional)':'Player name (optional)','Como você avalia o site?':'How do you rate the site?','Sua avaliação':'Your rating','Mensagem':'Message','Deixa a tua opinião ou sugestão...':'Leave your opinion or suggestion...','Deixa tua opinião ou sugestão...':'Leave your opinion or suggestion...','ENVIAR FEEDBACK':'SEND FEEDBACK','VER TODOS OS FEEDBACKS':'VIEW ALL FEEDBACK','VER TODOS OS FEEDBACK':'VIEW ALL FEEDBACK','TODOS OS FEEDBACKS':'ALL FEEDBACKS','Ainda não há feedbacks enviados.':'No feedbacks have been submitted yet.','Ainda não há feedbacks enviados neste navegador.':'No feedbacks have been submitted on this browser yet.','A carregar todos os feedbacks...':'Loading all feedback...','Não foi possível carregar os feedbacks. Tenta novamente.':'Could not load feedbacks. Try again.','PARCERIA':'PARTNERSHIP','PARCERIA YUNAMYST':'YUNAMYST PARTNERSHIP','ENTRAR EM CONTATO':'CONTACT US','Site e letra de música':'Website and song lyrics','criados por YunaMyst':'created by YunaMyst','WHATSAPP':'WHATSAPP','COPIAR':'COPY','LINK iOS':'iOS LINK','Códigos expirados':'Expired codes','Códigos Expirados':'Expired Codes','FAQ':'FAQ','FEEDBACK':'FEEDBACK'};
const EN_PT={};for(const k of Object.keys(PT_EN))if(PT_EN[k]!==k)EN_PT[PT_EN[k]]=k;
const communityOriginal={};
function skip(n){const p=n&&n.parentElement;return !p||['SCRIPT','STYLE','NOSCRIPT'].includes(p.tagName)||p.closest('#langSwitch')||p.closest('#ativos .cinfo strong')||p.closest('.community-tab');}
function community(en){document.querySelectorAll('.community-tab.whatsapp,.community-tab.partnership').forEach(a=>{if(!communityOriginal[a])communityOriginal[a]={html:a.innerHTML,href:a.getAttribute('href')};const label=en?(a.classList.contains('whatsapp')?'WHATSAPP':'PARTNERSHIP'):(a.classList.contains('whatsapp')?'WHATSAPP':'PARCERIA');let span=a.querySelector('.community-label');if(!span){a.querySelector('strong')?.remove();span=document.createElement('span');span.className='community-label';a.appendChild(span)}span.textContent=label;if(communityOriginal[a].href)a.setAttribute('href',communityOriginal[a].href);});}
function fixFAQ(en){
  const faq=document.querySelector('.faq');
  if(!faq)return;
  const items=[...faq.querySelectorAll('.faq-item')];
  if(items.length>3)items.slice(3).forEach(item=>item.remove());
  const clean=[...faq.querySelectorAll('.faq-item')];
  const q=en?['Where do I enter the codes?','Do the codes expire?','Can I use it on iPhone?']:['Onde coloco os códigos?','Os códigos expiram?','Posso usar no iPhone?'];
  const a=en?['Copy the code and use the redemption link.','Yes. When they expire, they are moved to the expired codes section.','Yes. The site works normally on iPhone.']:['Copia o código e usa o link de resgate.','Sim. Quando expiram, passam para a secção de códigos expirados.','Sim. O site funciona normalmente no iPhone.'];
  clean.slice(0,3).forEach((item,i)=>{
    const qel=item.querySelector('.faq-q');
    const ael=item.querySelector('.faq-a');
    if(qel){const span=qel.querySelector('span');if(span){span.textContent='＋';const text=[...qel.childNodes].find(n=>n.nodeType===3);if(text)text.nodeValue=q[i];else qel.insertBefore(document.createTextNode(q[i]),span);}else{qel.textContent=q[i];const s=document.createElement('span');s.textContent='＋';qel.appendChild(s);}}
    if(ael)ael.textContent=a[i];
  });
  faq.style.display='block';
  faq.style.width='100%';
  clean.forEach(item=>{item.style.display='block';item.style.width='100%';item.style.float='none';});
  const styleId='yunamyst-faq-identical-layout-v2';
  if(!document.getElementById(styleId)){
    const s=document.createElement('style');
    s.id=styleId;
    s.textContent=`
      .faq{display:block!important;width:100%!important;max-width:100%!important;overflow:hidden!important;box-sizing:border-box!important}
      .faq h2{display:flex!important;align-items:center!important;width:100%!important;height:54px!important;min-height:54px!important;margin:0!important;padding:18px!important;box-sizing:border-box!important}
      .faq .faq-item{display:block!important;width:100%!important;height:auto!important;min-height:0!important;margin:0!important;padding:0!important;float:none!important;box-sizing:border-box!important}
      .faq .faq-q{display:flex!important;align-items:center!important;justify-content:space-between!important;width:100%!important;height:52px!important;min-height:52px!important;margin:0!important;padding:15px!important;box-sizing:border-box!important;gap:10px!important;line-height:22px!important;white-space:nowrap!important;overflow:hidden!important}
      .faq .faq-q span{display:block!important;flex:0 0 18px!important;width:18px!important;height:22px!important;margin:0!important;text-align:center!important;line-height:22px!important}
      .faq .faq-a{display:none;width:100%!important;box-sizing:border-box!important;margin:0!important}
      .faq .faq-item.active .faq-a{display:block!important}
      @media(max-width:850px){
        .right .faq{width:100%!important;max-width:100%!important}
        .faq h2{height:52px!important;min-height:52px!important;padding:16px 14px!important}
        .faq .faq-q{height:52px!important;min-height:52px!important;padding:15px 14px!important;font-size:13px!important}
      }
    `;
    document.head.appendChild(s);
  }
}
function rewardLayoutFix(){
  const id='yunamyst-reward-layout-final-fix';
  if(document.getElementById(id))return;
  const s=document.createElement('style');s.id=id;s.textContent=`
    /* FIX APENAS DO LAYOUT DAS RECOMPENSAS. Não altera códigos nem imagens. */
    @media(min-width:851px){
      #ativos .code{display:grid!important;align-items:center!important;gap:8px!important;overflow:hidden!important;box-sizing:border-box!important;min-width:0!important}
      #ativos .code.reward-count-1{grid-template-columns:52px minmax(120px,1fr) 72px 220px!important}
      #ativos .code.reward-count-2{grid-template-columns:52px minmax(120px,1fr) 72px 72px 220px!important}
      #ativos .code.reward-count-3{grid-template-columns:52px minmax(105px,1fr) 64px 64px 64px 220px!important}
      #ativos .code>.gift{grid-column:auto!important;grid-row:1!important}
      #ativos .code>.cinfo{grid-column:auto!important;grid-row:1!important;min-width:0!important}
      #ativos .code>.reward{grid-column:auto!important;grid-row:1!important;min-width:0!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-direction:column!important;overflow:visible!important}
      #ativos .code>.copy{grid-column:auto!important;grid-row:1!important}
      #ativos .code>.link{grid-column:auto!important;grid-row:1!important}
      #ativos .code>.copy,#ativos .code>.link{width:100%!important;min-width:0!important;height:44px!important}
    }
    @media(max-width:850px){
      #ativos .code{display:grid!important;grid-template-columns:44px minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)!important;grid-template-rows:56px 62px 44px!important;grid-template-areas:'gift info info info' 'gift r1 r2 r3' 'copy copy link link'!important;gap:7px!important;padding:11px 8px!important;min-height:174px!important;width:100%!important;overflow:visible!important;box-sizing:border-box!important}
      #ativos .code>.gift{grid-area:gift!important}
      #ativos .code>.cinfo{grid-area:info!important;min-width:0!important}
      #ativos .code>.reward{display:flex!important;align-items:center!important;justify-content:center!important;flex-direction:column!important;min-width:0!important;overflow:visible!important;text-align:center!important}
      #ativos .code>.reward[data-slot='1']{grid-area:r1!important}
      #ativos .code>.reward[data-slot='2']{grid-area:r2!important}
      #ativos .code>.reward[data-slot='3']{grid-area:r3!important}
      #ativos .code>.copy{grid-area:copy!important;width:100%!important;min-width:0!important}
      #ativos .code>.link{grid-area:link!important;width:100%!important;min-width:0!important}
    }
  `;document.head.appendChild(s);
}
function translate(en){const map=en?PT_EN:EN_PT;const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(w.nextNode())nodes.push(w.currentNode);nodes.forEach(n=>{if(skip(n))return;const raw=n.nodeValue||'',t=raw.trim();if(!t)return;const out=map[t];if(out&&out!==t)n.nodeValue=raw.replace(t,out)});document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{const t=el.getAttribute('placeholder')||'',out=map[t];if(out&&out!==t)el.setAttribute('placeholder',out)});community(en);fixFAQ(en);document.documentElement.lang=en?'en':'pt-BR';document.documentElement.dataset.siteLanguage=en?'en':'pt';const b=document.getElementById('langToggle');if(b)b.textContent=en?'🇬🇧 ENG':'🇧🇷 PT/BR';document.getElementById('langPTOption')?.classList.toggle('selected',!en);document.getElementById('langENOption')?.classList.toggle('selected',en);try{localStorage.setItem('yunamyst-language',en?'en':'pt');localStorage.setItem('yunamyst-lang',en?'en':'pt')}catch(e){}}
function apply(en){en=!!en;translate(en);document.getElementById('langSwitch')?.classList.remove('open');requestAnimationFrame(()=>{translate(en);community(en);fixFAQ(en)});setTimeout(()=>{translate(en);community(en);fixFAQ(en)},100)}
function enforceActiveCodes(root,allowed){if(!root)return;root.querySelectorAll('.code, .auto-code, article.code').forEach(el=>{const code=(el.querySelector('.cinfo strong')?.textContent||el.dataset.code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(!allowed.has(code))el.remove()});document.querySelectorAll('.expired-list,.tab.expired').forEach(el=>el.remove())}
async function activeCodesGuard(){const root=document.getElementById('ativos');if(!root)return;try{const r=await fetch('./codes.json?active-guard='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('codes.json unavailable');const d=await r.json();const codes=Array.isArray(d.codes)?d.codes:[];const allowed=new Set(codes.map(x=>String(x).toUpperCase().replace(/[^A-Z0-9]/g,'')));enforceActiveCodes(root,allowed);new MutationObserver(()=>enforceActiveCodes(root,allowed)).observe(root,{childList:true,subtree:true})}catch(e){root.querySelectorAll('.code, .auto-code, article.code').forEach(el=>el.remove());document.querySelectorAll('.expired-list,.tab.expired').forEach(el=>el.remove())}}
function setup(){const sw=document.getElementById('langSwitch');if(!sw)return;rewardLayoutFix();activeCodesGuard();document.addEventListener('click',e=>{const t=e.target?.closest?.('#langENOption,#langPTOption,#langToggle');if(!t)return;e.preventDefault();e.stopImmediatePropagation();if(t.id==='langENOption')apply(true);else if(t.id==='langPTOption')apply(false);else sw.classList.toggle('open')},true);document.addEventListener('click',e=>{if(!sw.contains(e.target))sw.classList.remove('open')},false);let saved='pt';try{saved=localStorage.getItem('yunamyst-language')||localStorage.getItem('yunamyst-lang')||'pt'}catch(e){}apply(saved==='en');const root=document.getElementById('ativos')||document.body;let timer=0;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>{const en=document.documentElement.lang==='en';translate(en);community(en);fixFAQ(en)},30)}).observe(root,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();