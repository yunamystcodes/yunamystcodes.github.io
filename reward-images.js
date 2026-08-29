(()=>{
'use strict';
const id='yunamyst-exact-reward-images';
const old=document.getElementById(id); if(old) old.remove();
const s=document.createElement('style');
s.id=id;
s.textContent=`
/* IMAGENS ORIGINAIS ENVIADAS PELO UTILIZADOR — cada recompensa usa o seu quadrado completo do sprite */
.reward-icon{
  width:64px!important;
  height:64px!important;
  display:block!important;
  flex:none!important;
  background-image:url('/assets/rewards-sprite.webp?v=20260829-2')!important;
  background-repeat:no-repeat!important;
  background-size:384px 64px!important;
  background-color:transparent!important;
  border:0!important;
  border-radius:0!important;
  clip-path:none!important;
  filter:drop-shadow(0 2px 3px #0008)!important;
  transform:scale(.72)!important;
  transform-origin:center!important;
  margin:-9px!important;
}
.reward-icon.scroll,
.reward-icon.gold{background-position:0 0!important;background-image:url('/assets/rewards-sprite.webp?v=20260829-2')!important}
.reward-icon.scroll-yellow,
.reward-icon.yellow{background-position:-64px 0!important;background-image:url('/assets/rewards-sprite.webp?v=20260829-2')!important}
.reward-icon.scroll-red,
.reward-icon.red{background-position:-128px 0!important;background-image:url('/assets/rewards-sprite.webp?v=20260829-2')!important}
.reward-icon.crystal{background-position:-192px 0!important;background-image:url('/assets/rewards-sprite.webp?v=20260829-2')!important}
.reward-icon.mana{background-position:-256px 0!important;background-image:url('/assets/rewards-sprite.webp?v=20260829-2')!important}
.reward-icon.energy{background-position:-320px 0!important;background-image:url('/assets/rewards-sprite.webp?v=20260829-2')!important}
.reward-icon.scroll-blue,
.reward-icon.blue{
  background-image:url('/assets/scroll-blue.svg?v=20260829-2')!important;
  background-position:center!important;
  background-size:contain!important;
  background-repeat:no-repeat!important;
  transform:scale(.70)!important;
}
/* O tamanho visual fica igual no PC e continua a caber no cartão */
.code.auto-code .reward{min-width:0;overflow:visible!important}
@media(max-width:850px){
  .reward-icon{
    width:64px!important;
    height:64px!important;
    background-size:384px 64px!important;
    transform:scale(.58)!important;
    margin:-13px!important;
  }
  .reward-icon.scroll-blue,
  .reward-icon.blue{transform:scale(.56)!important}
}
`;
document.head.appendChild(s);
})();
