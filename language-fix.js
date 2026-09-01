(function(){
'use strict';
const PT_EN={
  'INÍCIO':'HOME','HOME':'HOME','COMO USAR':'HOW TO USE','HOW TO USE':'HOW TO USE',
  'Sempre atualizados!':'Always updated!','Always updated!':'Always updated!',
  'Código ativo':'Active code','Active code':'Active code','CÓDIGOS ATIVOS':'ACTIVE CODES','ACTIVE CODES':'ACTIVE CODES',
  'Copie o código':'Copy the code','Copy the code':'Copy the code',
  'Clica em COPIAR no código desejado.':'Click COPY on the desired code.','Click COPY on the desired code.':'Click COPY on the desired code.',
  'Abra o jogo':'Open the game','Open the game':'Open the game',
  'Entra no Summoners War: Sky Arena.':'Enter Summoners War: Sky Arena.','Enter Summoners War: Sky Arena.':'Enter Summoners War: Sky Arena.',
  'Resgata o código':'Redeem the code','Redeem the code':'Redeem the code',
  'Usa o link de resgate.':'Use the redeem link.','Use the redeem link.':'Use the redeem link.',
  'Aproveita!':'Enjoy!','Enjoy!':'Enjoy!','Recebe a recompensa no jogo.':'Receive the reward in the game.','Receive the reward in the game.':'Receive the reward in the game.',
  'Onde coloco os códigos?':'Where do I enter the codes?','Where do I enter the codes?':'Where do I enter the codes?',
  'Os códigos expiram?':'Do the codes expire?','Do the codes expire?':'Do the codes expire?',
  'Posso usar no iPhone?':'Can I use on iPhone?','Can I use on iPhone?':'Can I use on iPhone?',
  'SOBRE O SITE':'ABOUT THE SITE','ABOUT THE SITE':'ABOUT THE SITE',
  'Conteúdo diário de Summoners War!':'Daily Summoners War content!','Daily Summoners War content!':'Daily Summoners War content!',
  'Nome de player (opcional)':'Player name (optional)','Player name (optional)':'Player name (optional)',
  'Como você avalia o site?':'How do you rate the site?','How do you rate the site?':'How do you rate the site?',
  'Sua avaliação':'Your rating','Your rating':'Your rating','Mensagem':'Message','Message':'Message',
  'Deixa a tua opinião ou sugestão...':'Leave your opinion or suggestion...','Leave a tua opinião ou sugestão...':'Leave your opinion or suggestion...',
  'Deixa tua opinião ou sugestão...':'Leave your opinion or suggestion...','Leave your opinion or suggestion...':'Leave your opinion or suggestion...',
  'ENVIAR FEEDBACK':'SEND FEEDBACK','SEND FEEDBACK':'SEND FEEDBACK','VER TODOS OS FEEDBACKS':'VIEW ALL FEEDBACK','VIEW ALL FEEDBACK':'VIEW ALL FEEDBACK',
  'TODOS OS FEEDBACKS':'ALL FEEDBACKS','ALL FEEDBACKS':'ALL FEEDBACKS',
  'Ainda não há feedbacks enviados.':'No feedbacks have been submitted yet.','No feedbacks have been submitted yet.':'No feedbacks have been submitted yet.',
  'PARTNERSHIP':'PARTNERSHIP','PARCERIA':'PARTNERSHIP','WHATSAPP':'WHATSAPP','COPIAR':'COPY','COPY':'COPY','LINK iOS':'iOS LINK','iOS LINK':'iOS LINK'
};
const reverse={};Object.keys(PT_EN).forEach(k=>{const v=PT_EN[k];if(k!==v)reverse[v]=k});
const originals=new WeakMap();
function textNodes(){const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;if(!p||['SCRIPT','STYLE','NOSCRIPT'].includes(p.tagName)||p.closest('.auto-code .cinfo strong'))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT}});const a=[];while(w.nextNode())a.push(w.currentNode);return a}
function setLang(en){
  textNodes().forEach(n=>{
    if(!originals.has(n)) originals.set(n,n.nodeValue);
    const raw=originals.get(n),trim=raw.trim();
    const translated=en?(PT_EN[trim]||trim):(reverse[trim]||trim);
    if(translated!==trim)n.nodeValue=raw.replace(trim,translated);
  });
  document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{if(!el.dataset.langOriginal)el.dataset.langOriginal=el.getAttribute('placeholder')||'';const o=el.dataset.langOriginal;el.setAttribute('placeholder',en?(PT_EN[o]||o):(reverse[o]||o))});
  document.documentElement.lang=en?'en':'pt-BR';
  const btn=document.getElementById('langToggle');if(btn)btn.textContent=en?'🇬🇧 ENG':'🇧🇷 PT/BR';
  document.getElementById('langPTOption')?.classList.toggle('selected',!en);document.getElementById('langENOption')?.classList.toggle('selected',en);
  document.getElementById('langSwitch')?.classList.remove('open');
  try{localStorage.setItem('yunamyst-language',en?'en':'pt')}catch(e){}
}
function setup(){
  const sw=document.getElementById('langSwitch'),toggle=document.getElementById('langToggle'),pt=document.getElementById('langPTOption'),en=document.getElementById('langENOption');
  if(!sw||!toggle||!pt||!en)return;
  toggle.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();sw.classList.toggle('open')},true);
  pt.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();setLang(false)},true);
  en.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();setLang(true)},true);
  document.addEventListener('click',e=>{if(!sw.contains(e.target))sw.classList.remove('open')},true);
  try{if(localStorage.getItem('yunamyst-language')==='en')setLang(true)}catch(e){}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
