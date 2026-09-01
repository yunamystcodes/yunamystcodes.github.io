(()=>{
'use strict';
const PT_EN={
'INÍCIO':'HOME','COMO USAR':'HOW TO USE','Sempre atualizados!':'Always updated!','Código ativo':'Active code','Códigos ativos':'Active codes','CÓDIGOS ATIVOS':'ACTIVE CODES','Copie o código':'Copy the code','Clica em COPIAR no código desejado.':'Click COPY on the desired code.','Abra o jogo':'Open the game','Entra no Summoners War: Sky Arena.':'Enter Summoners War: Sky Arena.','Resgata o código':'Redeem the code','Usa o link de resgate.':'Use the redeem link.','Aproveita!':'Enjoy!','Recebe a recompensa no jogo.':'Receive the reward in the game.','Onde coloco os códigos?':'Where do I enter the codes?','Os códigos expiram?':'Do the codes expire?','Posso usar no iPhone?':'Can I use them on iPhone?','SOBRE O SITE':'ABOUT THE SITE','Conteúdo diário de Summoners War!':'Daily Summoners War content!','Aqui encontras os códigos ativos de Summoners War: Sky Arena.':'Here you can find the active Summoners War: Sky Arena codes.','Guarda o site e volta sempre!':'Save the site and come back often!','Nome de player (opcional)':'Player name (optional)','Como você avalia o site?':'How do you rate the site?','Sua avaliação':'Your rating','Mensagem':'Message','Deixa a tua opinião ou sugestão...':'Leave your opinion or suggestion...','Deixa tua opinião ou sugestão...':'Leave your opinion or suggestion...','ENVIAR FEEDBACK':'SEND FEEDBACK','VER TODOS OS FEEDBACKS':'VIEW ALL FEEDBACKS','VER TODOS OS FEEDBACK':'VIEW ALL FEEDBACK','TODOS OS FEEDBACKS':'ALL FEEDBACKS','Ainda não há feedbacks enviados.':'No feedbacks have been submitted yet.','Ainda não há feedbacks enviados neste navegador.':'No feedbacks have been submitted on this browser yet.','A carregar todos os feedbacks...':'Loading all feedback...','Não foi possível carregar os feedbacks. Tenta novamente.':'Could not load feedbacks. Try again.','PARCERIA':'PARTNERSHIP','PARCERIA YUNAMYST':'YUNAMYST PARTNERSHIP','ENTRAR EM CONTATO':'CONTACT US','Site e letra de música':'Website and song lyrics','criados por YunaMyst':'created by YunaMyst','WHATSAPP':'WHATSAPP','COPIAR':'COPY','LINK iOS':'iOS LINK','Códigos expirados':'Expired codes','Códigos Expirados':'Expired Codes','FAQ':'FAQ','FEEDBACK':'FEEDBACK'};
const EN_PT={};for(const k of Object.keys(PT_EN))if(PT_EN[k]!==k)EN_PT[PT_EN[k]]=k;
const communityOriginal={};
function skip(n){const p=n&&n.parentElement;return !p||['SCRIPT','STYLE','NOSCRIPT'].includes(p.tagName)||p.closest('#langSwitch')||p.closest('#ativos .cinfo strong')||p.closest('.community-tab');}
function community(en){
 document.querySelectorAll('.community-tab.whatsapp,.community-tab.partnership').forEach(a=>{
  if(!communityOriginal[a]) communityOriginal[a]={html:a.innerHTML,href:a.getAttribute('href')};
  const label=en?(a.classList.contains('whatsapp')?'WHATSAPP':'PARTNERSHIP'):(a.classList.contains('whatsapp')?'WHATSAPP':'PARCERIA');
  let span=a.querySelector('.community-label');
  if(!span){
   a.querySelector('strong')?.remove();
   span=document.createElement('span');span.className='community-label';a.appendChild(span)
  }
  span.textContent=label;
  if(communityOriginal[a].href)a.setAttribute('href',communityOriginal[a].href);
  if(a.classList.contains('whatsapp')&&!a.querySelector('svg')){
   const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('class','whatsapp-icon');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d','M20.52 3.48A11.82 11.82 0 0 0 12.1 0C5.55 0 .23 5.32.23 11.87c0 2.09.55 4.13 1.6 5.93L.13 24l6.34-1.66a11.83 11.83 0 0 0 5.63 1.43h.01c6.55 0 11.87-5.32 11.87-11.87 0-3.17-1.24-6.15-3.46-8.42Zm-8.42 18.28a9.82 9.82 0 0 1-5.01-1.37l-.36-.21-3.76.98 1-3.66-.23-.38a9.82 9.82 0 1 1 8.36 4.64Zm5.39-7.36c-.29-.15-1.72-.85-1.99-.95-.27-.1-.47-.15-.67.15-.2.29-.77.95-.94 1.15-.17.2-.35.22-.64.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.35.44-.52.15-.17.2-.29.3-.49.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.29-1.03 1-1.03 2.44s1.06 2.83 1.21 3.03c.15.2 2.08 3.18 5.04 4.46.7.3 1.25.49 1.68.62.71.23 1.35.2 1.86.12.57-.09 1.72-.7 1.96-1.38.24-.68.24-1.27.17-1.39-.07-.12-.27-.2-.56-.34Z');s.appendChild(p);a.insertBefore(s,span);
  }
 });
}
function translate(en){
 const map=en?PT_EN:EN_PT;
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
 nodes.forEach(n=>{if(skip(n))return;const raw=n.nodeValue||'',t=raw.trim();if(!t)return;const out=map[t];if(out&&out!==t)n.nodeValue=raw.replace(t,out)});
 document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{const t=el.getAttribute('placeholder')||'',out=map[t];if(out&&out!==t)el.setAttribute('placeholder',out)});
 community(en);
 document.documentElement.lang=en?'en':'pt-BR';document.documentElement.dataset.siteLanguage=en?'en':'pt';
 const b=document.getElementById('langToggle');if(b)b.textContent=en?'🇬🇧 ENG':'🇧🇷 PT/BR';
 document.getElementById('langPTOption')?.classList.toggle('selected',!en);document.getElementById('langENOption')?.classList.toggle('selected',en);
 try{localStorage.setItem('yunamyst-language',en?'en':'pt');localStorage.setItem('yunamyst-lang',en?'en':'pt')}catch(e){}
}
function apply(en){en=!!en;translate(en);document.getElementById('langSwitch')?.classList.remove('open');requestAnimationFrame(()=>{translate(en);community(en)});setTimeout(()=>{translate(en);community(en)},100)}
function setup(){const sw=document.getElementById('langSwitch');if(!sw)return;
 document.addEventListener('click',e=>{const t=e.target?.closest?.('#langENOption,#langPTOption,#langToggle');if(!t)return;e.preventDefault();e.stopImmediatePropagation();if(t.id==='langENOption')apply(true);else if(t.id==='langPTOption')apply(false);else sw.classList.toggle('open')},true);
 document.addEventListener('click',e=>{if(!sw.contains(e.target))sw.classList.remove('open')},false);
 let saved='pt';try{saved=localStorage.getItem('yunamyst-language')||localStorage.getItem('yunamyst-lang')||'pt'}catch(e){}apply(saved==='en');
 const root=document.getElementById('ativos')||document.body;let timer=0;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>{const en=document.documentElement.lang==='en';translate(en);community(en)},30)}).observe(root,{childList:true,subtree:true});
}
(function(){const originalFetch=window.fetch;if(typeof originalFetch!=='function')return;window.fetch=function(input,init){return originalFetch.apply(this,arguments).then(response=>{try{const url=typeof input==='string'?input:(input&&input.url)||'',method=init&&init.method?String(init.method).toUpperCase():'GET';if(!url.includes('/functions/v1/feedbacks')||method!=='GET')return response;return response.clone().json().then(data=>{if(!Array.isArray(data))return response;const dated=data.map(item=>{if(!item||typeof item!=='object')return item;const raw=item.created_at||item.createdAt||item.date||item.created||null;if(!raw)return item;const d=new Date(raw);if(Number.isNaN(d.getTime()))return item;const date=new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Europe/Lisbon'}).format(d);const name=String(item.name||'Jogador').replace(/^\(\d{2}\/\d{2}\/\d{4}\)\s*/,'');return Object.assign({},item,{name:name+' ('+date+')'})});return new Response(JSON.stringify(dated),{status:response.status,statusText:response.statusText,headers:{'Content-Type':'application/json'}})}).catch(()=>response)}catch(e){return response}})}})();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();