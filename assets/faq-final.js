(function(){
  const faqRoot=document.querySelector('.faq');
  if(!faqRoot) return;
  const items=[
    {pt:'Onde coloco os códigos?',en:'Where do I enter the codes?',apt:'Usa o código no jogo através da opção de resgate de códigos.',aen:'Use the code in the game through the code redemption option.'},
    {pt:'Os códigos expiram?',en:'Do the codes expire?',apt:'Sim. Alguns códigos têm validade limitada e podem deixar de funcionar.',aen:'Yes. Some codes have limited validity and may stop working.'},
    {pt:'Posso usar no iPhone?',en:'Can I use the codes on iPhone?',apt:'Sim. Os códigos podem ser resgatados no iPhone usando o link de resgate quando disponível.',aen:'Yes. Codes can be redeemed on iPhone using the redeem link when available.'}
  ];
  function lang(){return (document.documentElement.lang||'pt-BR').toLowerCase().startsWith('en')?'en':'pt';}
  function render(){
    const l=lang();
    faqRoot.innerHTML=items.map(x=>`<div class="faq-item"><div class="faq-q"><span>${l==='en'?x.en:x.pt}</span><span>+</span></div><div class="faq-a">${l==='en'?x.aen:x.apt}</div></div>`).join('');
    faqRoot.querySelectorAll('.faq-q').forEach(q=>q.addEventListener('click',()=>q.parentElement.classList.toggle('active')));
  }
  render();
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
