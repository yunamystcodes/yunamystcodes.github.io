(()=>{
'use strict';
const id='yunamyst-exact-reward-images';
const old=document.getElementById(id); if(old) old.remove();
const s=document.createElement('style');
s.id=id;
s.textContent=`
/* Usar somente as imagens de recompensa enviadas pelo utilizador. */
.reward-icon{
  width:64px!important;
  height:64px!important;
  display:block!important;
  flex:none!important;
  background-image:url('/assets/rewards-sprite.webp?v=20260829-4')!important;
  background-repeat:no-repeat!important;
  background-size:384px 64px!important;
  background-color:transparent!important;
  border:0!important;
  border-radius:0!important;
  clip-path:none!important;
  filter:none!important;
  transform:none!important;
  transform-origin:center!important;
  margin:0!important;
}
.reward-icon.scroll,.reward-icon.gold{background-position:0 0!important}
.reward-icon.scroll-yellow,.reward-icon.yellow{background-position:-64px 0!important}
.reward-icon.scroll-red,.reward-icon.red{background-position:-128px 0!important}
.reward-icon.crystal{background-position:-192px 0!important}
.reward-icon.mana{background-position:-256px 0!important}
.reward-icon.energy{background-position:-320px 0!important}
.reward-icon.scroll-blue,.reward-icon.blue{
  background-image:url('/assets/scroll-blue.svg?v=20260829-4')!important;
  background-position:center!important;
  background-size:contain!important;
  background-repeat:no-repeat!important;
}
.code.auto-code .reward{min-width:0!important;overflow:visible!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:2px!important}
@media(max-width:850px){
  .reward-icon{width:64px!important;height:64px!important;background-size:384px 64px!important;transform:scale(.72)!important;margin:-9px!important}
  .reward-icon.scroll-blue,.reward-icon.blue{transform:scale(.70)!important}
}
`;
document.head.appendChild(s);
})();
