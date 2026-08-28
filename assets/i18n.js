(()=>{
'use strict';
const $=id=>document.getElementById(id);
const pt=$('langPTOption'),en=$('langENOption'),ls=$('langSwitch'),toggle=$('langToggle');
const T={
pt:{nav:['⌂ INÍCIO','⚔ SUMMONERS WAR','❔ COMO USAR'],profile:'Conteúdo diário de<br>Summoners War!',about:'<b>✦ SOBRE O SITE</b><br><br>Aqui encontras os <b>códigos ativos</b> de Summoners War: Sky Arena.<br><br>💜 Guarda o site e volta sempre!',updated:'⟳ Sempre atualizados!',active:'🟢 CÓDIGOS ATIVOS',how:'❓ COMO USAR',partner:'🤝 PARCERIA',partnerTitle:'🤝 PARCERIA YUNAMYST',partnerText:'Queres fazer uma parceria com a YunaMyst Codes? Este espaço é para criadores, marcas e projetos relacionados com Summoners War.',contact:'ENTRAR EM CONTATO',status:'🔄 Código ativo',copy:'▣ COPIAR',link:'🔗 LINK OFICIAL',footer:'YunaMyst • Summoners War: Sky Arena • Site de comunidade',button:'🇧🇷 PT/BR',steps:[['Copie o código','Clica em COPIAR no código desejado.'],['Abra o jogo','Entra no Summoners War: Sky Arena.'],['Resgata o código','Usa o link de resgate.'],['Aproveita!','Recebe a recompensa no jogo.']],faq:[['Onde coloco os códigos?','Copia o código e usa o link de resgate.'],['Os códigos expiram?','Sim. Quando expiram, deixam de aparecer na lista de códigos ativos.'],['Posso usar no iPhone?','Sim. O site funciona normalmente no telemóvel.']]},
en:{nav:['⌂ HOME','⚔ SUMMONERS WAR','❔ HOW TO USE'],profile:'Daily content from<br>Summoners War!',about:'<b>✦ ABOUT THE SITE</b><br><br>Here you can find the <b>active codes</b> for Summoners War: Sky Arena.<br><br>💜 Save the site and come back often!',updated:'⟳ Always updated!',active:'🟢 ACTIVE CODES',how:'❓ HOW TO USE',partner:'🤝 PARTNERSHIP',partnerTitle:'🤝 YUNAMYST PARTNERSHIP',partnerText:'Want to partner with YunaMyst Codes? This space is for creators, brands and projects related to Summoners War.',contact:'CONTACT US',status:'🔄 Active code',copy:'▣ COPY',link:'🔗 OFFICIAL LINK',footer:'YunaMyst • Summoners War: Sky Arena • Community website',button:'🇬🇧 ENG',steps:[['Copy the code','Click COPY on the code you want.'],['Open the game','Enter Summoners War: Sky Arena.'],['Redeem the code','Use the redemption link.'],['Enjoy!','Receive the reward in the game.']],faq:[['Where do I enter the codes?','Copy the code and use the redemption link.'],['Do codes expire?','Yes. Expired codes are removed from the active list.'],['Can I use it on iPhone?','Yes. The site works normally on mobile.']]}
};
let langText='pt';
function normalizeBrand(){
 const logo=document.querySelector('.logo');
 if(logo) logo.innerHTML='YunaM<span class="myst-y">Y</span>st<small>SUMMONERS WAR</small>';
 const meta=document.querySelector('meta[name="description"]');
 if(meta) meta.setAttribute('content','Códigos ativos de Summoners War — YunaMyst.');
 document.title='YunaMyst — Summoners War';
 const modal=document.querySelector('#parceriaModal p');
 if(modal) modal.textContent=langText==='en'?'Want to partner with YunaMyst Codes? This space is for creators, brands and projects related to Summoners War.':'Queres fazer uma parceria com a YunaMyst Codes? Este espaço é para criadores, marcas e projetos relacionados com Summoners War.';
}
function apply(lang){
 const t=T[lang]||T.pt;
 langText=lang==='en'?'en':'pt';
 document.documentElement.lang=lang==='en'?'en':'pt-BR';
 document.querySelectorAll('.navlinks a').forEach((x,i)=>x.textContent=t.nav[i]);
 const profile=$('perfilTexto');if(profile)profile.innerHTML=t.profile;
 const about=document.querySelector('.about');if(about)about.innerHTML=t.about;
 const updated=document.querySelector('.section-head span');if(updated)updated.textContent=t.updated;
 document.querySelectorAll('.cinfo small').forEach(x=>x.textContent=t.status);
 document.querySelectorAll('.copy').forEach(x=>x.textContent=t.copy);
 document.querySelectorAll('.link').forEach(x=>x.textContent=t.link);
 const active=$('tabAtivos');if(active)active.textContent=t.active;
 const how=document.querySelector('#como>.panel>h2');if(how)how.textContent=t.how;
 document.querySelectorAll('#como>.panel .step').forEach((x,i)=>{const d=t.steps[i];if(d)x.innerHTML='<div class="num">'+(i+1)+'</div><div><b>'+d[0]+'</b>'+d[1]+'</div>'});
 document.querySelectorAll('.faq-item').forEach((x,i)=>{const d=t.faq[i],q=x.querySelector('.faq-q'),a=x.querySelector('.faq-a');if(d){if(q)q.innerHTML=d[0]+'<span>＋</span>';if(a)a.textContent=d[1]}});
 const modal=$('parceriaModal');if(modal){const h=modal.querySelector('h3'),p=modal.querySelector('p');if(h)h.textContent=t.partnerTitle;if(p)p.textContent=t.partnerText;modal.querySelectorAll('.contact-link strong').forEach(x=>x.textContent=t.contact)}
 const partnership=document.querySelector('.community-tab.partnership strong');if(partnership)partnership.textContent=t.partner;
 const footer=$('rodape');if(footer)footer.textContent=t.footer;
 if(toggle)toggle.textContent=t.button;
 normalizeBrand();
 pt?.classList.toggle('selected',lang!=='en');en?.classList.toggle('selected',lang==='en');
 localStorage.setItem('yunamyst-lang',lang);
 if(ls)ls.classList.remove('open');
}
function toggleMenu(e){e?.stopPropagation();ls?.classList.toggle('open');}
toggle?.addEventListener('click',toggleMenu);
pt?.addEventListener('click',()=>apply('pt'));
en?.addEventListener('click',()=>apply('en'));
document.addEventListener('click',e=>{if(ls&&!ls.contains(e.target))ls.classList.remove('open')});
document.addEventListener('keydown',e=>{if(e.key==='Escape')ls?.classList.remove('open')});
apply(localStorage.getItem('yunamyst-lang')==='en'?'en':'pt');
// Recarrega o site a cada hora para mostrar automaticamente códigos novos e remover os expirados.
setInterval(()=>window.location.reload(),60*60*1000);
})();
