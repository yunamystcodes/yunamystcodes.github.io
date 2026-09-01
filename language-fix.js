(()=>{
'use strict';

const PT_EN={
'INÍCIO':'HOME','COMO USAR':'HOW TO USE','Sempre atualizados!':'Always updated!','Código ativo':'Active code','Códigos ativos':'Active codes','CÓDIGOS ATIVOS':'ACTIVE CODES','Copie o código':'Copy the code','Clica em COPIAR no código desejado.':'Click COPY on the desired code.','Abra o jogo':'Open the game','Entra no Summoners War: Sky Arena.':'Enter Summoners War: Sky Arena.','Resgata o código':'Redeem the code','Usa o link de resgate.':'Use the redeem link.','Aproveita!':'Enjoy!','Recebe a recompensa no jogo.':'Receive the reward in the game.','Onde coloco os códigos?':'Where do I enter the codes?','Os códigos expiram?':'Do the codes expire?','Posso usar no iPhone?':'Can I use them on iPhone?','SOBRE O SITE':'ABOUT THE SITE','Conteúdo diário de':'Daily','Conteúdo diário de Summoners War!':'Daily Summoners War content!','Aqui encontras os':'Here you can find the','códigos ativos':'active codes','Aqui encontras os códigos ativos de Summoners War: Sky Arena.':'Here you can find the active Summoners War: Sky Arena codes.','Guarda o site e volta sempre!':'Save the site and come back often!','Guarda o site e volta sempre!':'Save the site and come back often!','Nome de player (opcional)':'Player name (optional)','Como você avalia o site?':'How do you rate the site?','Sua avaliação':'Your rating','Mensagem':'Message','Deixa tua opinião ou sugestão...':'Leave your opinion or suggestion...','Deixa a tua opinião ou sugestão...':'Leave your opinion or suggestion...','ENVIAR FEEDBACK':'SEND FEEDBACK','VER TODOS OS FEEDBACKS':'VIEW ALL FEEDBACKS','VER TODOS OS FEEDBACK':'VIEW ALL FEEDBACK','TODOS OS FEEDBACKS':'ALL FEEDBACKS','ALL FEEDBACKS':'ALL FEEDBACKS','Ainda não há feedbacks enviados.':'No feedbacks have been submitted yet.','Ainda não há feedbacks enviados neste navegador.':'No feedbacks have been submitted on this browser yet.','A carregar todos os feedbacks...':'Loading all feedback...','Não foi possível carregar os feedbacks. Tenta novamente.':'Could not load feedbacks. Try again.','PARCERIA':'PARTNERSHIP','PARCERIA YUNAMYST':'YUNAMYST PARTNERSHIP','ENTRAR EM CONTATO':'CONTACT US','Site e letra de música':'Website and song lyrics','criados por YunaMyst':'created by YunaMyst','WHATSAPP':'WHATSAPP','COPIAR':'COPY','LINK iOS':'iOS LINK','Códigos expirados':'Expired codes','Expired codes':'Expired codes','SUMMONERS WAR':'SUMMONERS WAR','FAQ':'FAQ','FEEDBACK':'FEEDBACK'};
const EN_PT={};Object.keys(PT_EN).forEach(k=>{if(!EN_PT[PT_EN[k]])EN_PT[PT_EN[k]]=k});
Object.assign(PT_EN,{'HOME':'HOME','HOW TO USE':'HOW TO USE','Always updated!':'Always updated!','Active code':'Active code','Active codes':'Active codes','ACTIVE CODES':'ACTIVE CODES','Copy the code':'Copy the code','Click COPY on the desired code.':'Click COPY on the desired code.','Open the game':'Open the game','Enter Summoners War: Sky Arena.':'Enter Summoners War: Sky Arena.','Redeem the code':'Redeem the code','Use the redeem link.':'Use the redeem link.','Enjoy!':'Enjoy!','Receive the reward in the game.':'Receive the reward in the game.','Where do I enter the codes?':'Where do I enter the codes?','Do the codes expire?':'Do the codes expire?','Can I use them on iPhone?':'Can I use them on iPhone?','ABOUT THE SITE':'ABOUT THE SITE','Daily':'Daily','Here you can find the':'Here you can find the','active codes':'active codes','Save the site and come back often!':'Save the site and come back often!','Player name (optional)':'Player name (optional)','How do you rate the site?':'How do you rate the site?','Your rating':'Your rating','Message':'Message','Leave your opinion or suggestion...':'Leave your opinion or suggestion...','SEND FEEDBACK':'SEND FEEDBACK','VIEW ALL FEEDBACKS':'VIEW ALL FEEDBACKS','ALL FEEDBACKS':'ALL FEEDBACKS','No feedbacks have been submitted yet.':'No feedbacks have been submitted yet.','Loading all feedback...':'Loading all feedback...','Could not load feedbacks. Try again.':'Could not load feedbacks. Try again.','PARTNERSHIP':'PARTNERSHIP','YUNAMYST PARTNERSHIP':'YUNAMYST PARTNERSHIP','CONTACT US':'CONTACT US','Website and song lyrics':'Website and song lyrics','created by YunaMyst':'created by YunaMyst'});

function shouldSkip(n){const p=n&&n.parentElement;return !p||['SCRIPT','STYLE','NOSCRIPT'].includes(p.tagName)||p.closest('#langSwitch')||p.closest('#ativos .cinfo strong');}
function translateText(en){
 const map=en?PT_EN:EN_PT;
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
 nodes.forEach(n=>{if(shouldSkip(n))return;const raw=n.nodeValue||'',trim=raw.trim();if(!trim)return;const out=map[trim];if(out&&out!==trim)n.nodeValue=raw.replace(trim,out)});
 document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{const p=el.getAttribute('placeholder')||'',out=map[p];if(out&&out!==p)el.setAttribute('placeholder',out)});
 document.documentElement.lang=en?'en':'pt-BR';
 document.documentElement.dataset.siteLanguage=en?'en':'pt';
 const b=document.getElementById('langToggle');if(b)b.textContent=en?'🇬🇧 ENG':'🇧🇷 PT/BR';
 document.getElementById('langPTOption')?.classList.toggle('selected',!en);
 document.getElementById('langENOption')?.classList.toggle('selected',en);
 try{localStorage.setItem('yunamyst-language',en?'en':'pt');localStorage.setItem('yunamyst-lang',en?'en':'pt')}catch(e){}
}
function apply(en){
 translateText(!!en);
 document.getElementById('langSwitch')?.classList.remove('open');
 requestAnimationFrame(()=>translateText(!!en));
 setTimeout(()=>translateText(!!en),80);
}
function setup(){
 const sw=document.getElementById('langSwitch');if(!sw)return;
 // One delegated capture handler prevents the old duplicated language scripts from fighting each other.
 document.addEventListener('click',e=>{
   const target=e.target&&e.target.closest?e.target.closest('#langENOption,#langPTOption,#langToggle'):null;
   if(!target)return;
   e.preventDefault();e.stopImmediatePropagation();
   if(target.id==='langENOption')apply(true);
   else if(target.id==='langPTOption')apply(false);
   else sw.classList.toggle('open');
 },true);
 document.addEventListener('pointerup',e=>{
   const target=e.target&&e.target.closest?e.target.closest('#langENOption,#langPTOption'):null;
   if(!target)return;
   e.preventDefault();e.stopImmediatePropagation();
   apply(target.id==='langENOption');
 },true);
 document.addEventListener('click',e=>{if(!sw.contains(e.target))sw.classList.remove('open')},false);
 let saved='pt';try{saved=localStorage.getItem('yunamyst-language')||localStorage.getItem('yunamyst-lang')||'pt'}catch(e){}
 apply(saved==='en');
 const root=document.getElementById('ativos')||document.body;
 let timer=0;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>{try{if(document.documentElement.lang==='en')translateText(true)}catch(e){}},20)}).observe(root,{childList:true,subtree:true});
}

/* DATA DOS FEEDBACKS: acrescenta a data real depois do nome. */
(function(){
 const originalFetch=window.fetch;if(typeof originalFetch!=='function')return;
 window.fetch=function(input,init){return originalFetch.apply(this,arguments).then(response=>{
  try{
   const url=typeof input==='string'?input:(input&&input.url)||'';const method=init&&init.method?String(init.method).toUpperCase():'GET';
   if(!url.includes('/functions/v1/feedbacks')||method!=='GET')return response;
   return response.clone().json().then(data=>{if(!Array.isArray(data))return response;const dated=data.map(item=>{if(!item||typeof item!=='object')return item;const raw=item.created_at||item.createdAt||item.date||item.created||null;if(!raw)return item;const d=new Date(raw);if(Number.isNaN(d.getTime()))return item;const date=new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Europe/Lisbon'}).format(d);const name=String(item.name||'Jogador').replace(/^\(\d{2}\/\d{2}\/\d{4}\)\s*/,'');return Object.assign({},item,{name:name+' ('+date+')'})});return new Response(JSON.stringify(dated),{status:response.status,statusText:response.statusText,headers:{'Content-Type':'application/json'}})}).catch(()=>response)
  }catch(e){return response}
 })};
})();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();