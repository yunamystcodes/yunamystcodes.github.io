(()=>{
'use strict';
const id='yunamyst-exact-reward-images';
const old=document.getElementById(id); if(old) old.remove();
const s=document.createElement('style');
s.id=id;
s.textContent=`
/* Recompensas: somente as 7 imagens enviadas pelo utilizador. */
.reward-icon{
  width:64px!important;
  height:64px!important;
  min-width:64px!important;
  min-height:64px!important;
  display:block!important;
  flex:none!important;
  background-image:url('/assets/rewards-exact-20260829.webp?v=20260829-1')!important;
  background-repeat:no-repeat!important;
  background-size:448px 64px!important;
  background-color:transparent!important;
  border:0!important;
  border-radius:0!important;
  clip-path:none!important;
  filter:none!important;
  transform:none!important;
  margin:0!important;
}
/* sprite: energia, scroll fogo, scroll azul, scroll vermelho, cristais, scroll dourado, mana */
.reward-icon.energy{background-position:0 0!important}
.reward-icon.scroll-yellow,.reward-icon.yellow{background-position:-64px 0!important}
.reward-icon.scroll-blue,.reward-icon.blue{background-position:-128px 0!important}
.reward-icon.scroll-red,.reward-icon.red{background-position:-192px 0!important}
.reward-icon.crystal{background-position:-256px 0!important}
.reward-icon.scroll,.reward-icon.gold{background-position:-320px 0!important}
.reward-icon.mana{background-position:-384px 0!important}
.code.auto-code .reward{
  min-width:0!important;
  overflow:visible!important;
  display:flex!important;
  flex-direction:column!important;
  align-items:center!important;
  justify-content:center!important;
  gap:2px!important;
}
.code.auto-code .reward .qty{display:block!important;white-space:nowrap!important}
@media(max-width:850px){
  .reward-icon{
    width:56px!important;
    height:56px!important;
    min-width:56px!important;
    min-height:56px!important;
    background-size:392px 56px!important;
  }
  .reward-icon.energy{background-position:0 0!important}
  .reward-icon.scroll-yellow,.reward-icon.yellow{background-position:-56px 0!important}
  .reward-icon.scroll-blue,.reward-icon.blue{background-position:-112px 0!important}
  .reward-icon.scroll-red,.reward-icon.red{background-position:-168px 0!important}
  .reward-icon.crystal{background-position:-224px 0!important}
  .reward-icon.scroll,.reward-icon.gold{background-position:-280px 0!important}
  .reward-icon.mana{background-position:-336px 0!important}
}
`;
document.head.appendChild(s);
})();
