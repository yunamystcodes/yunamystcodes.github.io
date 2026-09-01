(()=>{
'use strict';

const PT_EN={
 'INÍCIO':'HOME','COMO USAR':'HOW TO USE','Sempre atualizados!':'Always updated!','Código ativo':'Active code','CÓDIGOS ATIVOS':'ACTIVE CODES',
 'Copie o código':'Copy the code','Clica em COPIAR no código desejado.':'Click COPY on the desired code.','Abra o jogo':'Open the game','Entra no Summoners War: Sky Arena.':'Enter Summoners War: Sky Arena.',
 'Resgata o código':'Redeem the code','Usa o link de resgate.':'Use the redeem link.','Aproveita!':'Enjoy!','Recebe a recompensa no jogo.':'Receive the reward in the game.',
 'Onde coloco os códigos?':'Where do I enter the codes?','Os códigos expiram?':'Do the codes expire?','Posso usar no iPhone?':'Can I use them on iPhone?',
 'SOBRE O SITE':'ABOUT THE SITE','Conteúdo diário de':'Daily','Summoners War!':'Summoners War!','Aqui encontras os':'Here you can find the','códigos ativos':'active codes','Guarda o site e volta sempre!':'Save the site and come back often!',
 'Nome de player (opcional)':'Player name (optional)','Como você avalia o site?':'How do you rate the site?','Sua avaliação':'Your rating','Mensagem':'Message',
 'Deixa tua opinião ou sugestão...':'Leave your opinion or suggestion...','ENVIAR FEEDBACK':'SEND FEEDBACK','VER TODOS OS FEEDBACKS':'VIEW ALL FEEDBACKS','TODOS OS FEEDBACKS':'ALL FEEDBACKS',
 'Ainda não há feedbacks enviados.':'No feedbacks have been submitted yet.','A carregar todos os feedbacks...':'Loading all feedback...', 'Não foi possível carregar os feedbacks. Tenta novamente.':'Could not load feedbacks. Try again.',
 'PARCERIA':'PARTNERSHIP','PARCERIA YUNAMYST':'YUNAMYST PARTNERSHIP','Queres fazer uma parceria com a YunaMyst Codes? Este espaço é para criadores, marcas e projetos relacionados com Summoners War.':'Want to partner with YunaMyst Codes? This space is for creators, brands and projects related to Summoners War.',
 'ENTRAR EM CONTATO':'CONTACT US','Site e letra de música':'Website and song lyrics','criados por YunaMyst':'created by YunaMyst',
 'WHATSAPP':'WHATSAPP','COPIAR':'COPY','LINK iOS':'iOS LINK','HOME':'HOME','HOW TO USE':'HOW TO USE','Always updated!':'Always updated!','Active code':'Active code','ACTIVE CODES':'ACTIVE CODES','Copy the code':'Copy the code','Click COPY on the desired code.':'Click COPY on the desired code.','Open the game':'Open the game','Enter Summoners War: Sky Arena.':'Enter Summoners War: Sky Arena.','Redeem the code':'Redeem the code','Use the redeem link.':'Use the redeem link.','Enjoy!':'Enjoy!','Receive the reward in the game.':'Receive the reward in the game.','Where do I enter the codes?':'Where do I enter the codes?','Do the codes expire?':'Do the codes expire?','Can I use them on iPhone?':'Can I use them on iPhone?','ABOUT THE SITE':'ABOUT THE SITE','Daily':'Daily','Here you can find the':'Here you can find the','Save the site and come back often!':'Save the site and come back often!','Player name (optional)':'Player name (optional)','How do you rate the site?':'How do you rate the site?','Your rating':'Your rating','Message':'Message','Leave your opinion or suggestion...':'Leave your opinion or suggestion...','SEND FEEDBACK':'SEND FEEDBACK','VIEW ALL FEEDBACKS':'VIEW ALL FEEDBACKS','ALL FEEDBACKS':'ALL FEEDBACKS','No feedbacks have been submitted yet.':'No feedbacks have been submitted yet.','Loading all feedback...':'Loading all feedback...','PARTNERSHIP':'PARTNERSHIP','YUNAMYST PARTNERSHIP':'YUNAMYST PARTNERSHIP','CONTACT US':'CONTACT US','Website and song lyrics':'Website and song lyrics','created by YunaMyst':'created by YunaMyst'
};

const EN_PT={
 'HOME':'INÍCIO','HOW TO USE':'COMO USAR','Always updated!':'Sempre atualizados!','Active code':'Código ativo','ACTIVE CODES':'CÓDIGOS ATIVOS',
 'Copy the code':'Copie o código','Click COPY on the desired code.':'Clica em COPIAR no código desejado.','Open the game':'Abra o jogo','Enter Summoners War: Sky Arena.':'Entra no Summoners War: Sky Arena.',
 'Redeem the code':'Resgata o código','Use the redeem link.':'Usa o link de resgate.','Enjoy!':'Aproveita!','Receive the reward in the game.':'Recebe a recompensa no jogo.',
 'Where do I enter the codes?':'Onde coloco os códigos?','Do the codes expire?':'Os códigos expiram?','Can I use them on iPhone?':'Posso usar no iPhone?',
 'ABOUT THE SITE':'SOBRE O SITE','Daily':'Diário','Here you can find the':'Aqui encontras os','active codes':'códigos ativos','Save the site and come back often!':'Guarda o site e volta sempre!',
 'Player name (optional)':'Nome de player (opcional)','How do you rate the site?':'Como você avalia o site?','Your rating':'Sua avaliação','Message':'Mensagem',
 'Leave your opinion or suggestion...':'Deixa tua opinião ou sugestão...','SEND FEEDBACK':'ENVIAR FEEDBACK','VIEW ALL FEEDBACKS':'VER TODOS OS FEEDBACKS','ALL FEEDBACKS':'TODOS OS FEEDBACKS',
 'No feedbacks have been submitted yet.':'Ainda não há feedbacks enviados.','Loading all feedback...':'A carregar todos os feedbacks...','Could not load feedbacks. Try again.':'Não foi possível carregar os feedbacks. Tenta novamente.',
 'PARTNERSHIP':'PARCERIA','YUNAMYST PARTNERSHIP':'PARCERIA YUNAMYST','CONTACT US':'ENTRAR EM CONTATO','Website and song lyrics':'Site e letra de música','created by YunaMyst':'criados por YunaMyst'
};

const skip=p=>!p||['SCRIPT','STYLE','NOSCRIPT'].includes(p.tagName)||p.closest('#ativos .cinfo strong');
function nodes(){const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>skip(n.parentElement)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});const a=[];while(w.nextNode())a.push(w.currentNode);return a}
function translate(en){
 const map=en?PT_EN:EN_PT;
 nodes().forEach(n=>{const raw=n.nodeValue,trim=raw.trim();if(!trim)return;const out=map[trim];if(out)n.nodeValue=raw.replace(trim,out)});
 document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{const p=el.getAttribute('placeholder')||'';const out=map[p];if(out)el.setAttribute('placeholder',out)});
 document.documentElement.lang=en?'en':'pt-BR';
 const btn=document.getElementById('langToggle');if(btn)btn.textContent=en?'🇬🇧 ENG':'🇧🇷 PT/BR';
 document.getElementById('langPTOption')?.classList.toggle('selected',!en);
 document.getElementById('langENOption')?.classList.toggle('selected',en);
 try{localStorage.setItem('yunamyst-language',en?'en':'pt');localStorage.setItem('yunamyst-lang',en?'en':'pt')}catch(e){}
}
function current(){try{return localStorage.getItem('yunamyst-language')||localStorage.getItem('yunamyst-lang')||'pt'}catch(e){return 'pt'}}
function setup(){
 const sw=document.getElementById('langSwitch'),toggle=document.getElementById('langToggle'),pt=document.getElementById('langPTOption'),en=document.getElementById('langENOption');
 if(!sw||!toggle||!pt||!en)return;
 toggle.onclick=e=>{e.preventDefault();e.stopPropagation();sw.classList.toggle('open')};
 pt.onclick=e=>{e.preventDefault();e.stopPropagation();sw.classList.remove('open');translate(false)};
 en.onclick=e=>{e.preventDefault();e.stopPropagation();sw.classList.remove('open');translate(true)};
 document.addEventListener('click',e=>{if(!sw.contains(e.target))sw.classList.remove('open')});
 const wanted=current();
 if(wanted==='en'){
   translate(false);translate(true);
 }else{
   translate(false);
 }
 const root=document.getElementById('ativos');
 if(root){new MutationObserver(()=>{if(document.documentElement.lang==='en')translate(true)}).observe(root,{childList:true,subtree:true})}
}

/* DATA DOS FEEDBACKS: acrescenta a data real depois do nome, sem alterar o conteúdo do feedback. */
(function(){
 const originalFetch=window.fetch;
 if(typeof originalFetch!=='function')return;
 window.fetch=function(input,init){
  return originalFetch.apply(this,arguments).then(response=>{
   try{
    const url=typeof input==='string'?input:(input&&input.url)||'';
    const method=init&&init.method?String(init.method).toUpperCase():'GET';
    if(!url.includes('/functions/v1/feedbacks')||method!=='GET')return response;
    return response.clone().json().then(data=>{
     if(!Array.isArray(data))return response;
     const dated=data.map(item=>{
      if(!item||typeof item!=='object')return item;
      const raw=item.created_at||item.createdAt||item.date||item.created||null;
      if(!raw)return item;
      const d=new Date(raw);
      if(Number.isNaN(d.getTime()))return item;
      const date=new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Europe/Lisbon'}).format(d);
      const name=String(item.name||'Jogador').replace(/^\(\d{2}\/\d{2}\/\d{4}\)\s*/,'');
      return Object.assign({},item,{name:name+' ('+date+')'});
     });
     return new Response(JSON.stringify(dated),{status:response.status,statusText:response.statusText,headers:{'Content-Type':'application/json'}});
    }).catch(()=>response);
   }catch(e){return response}
  });
 };
})();

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
