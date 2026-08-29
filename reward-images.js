(()=>{
'use strict';
const id='yunamyst-exact-reward-images';
if(document.getElementById(id))return;
const s=document.createElement('style');s.id=id;s.textContent=`
.reward-icon{width:48px!important;height:48px!important;display:block!important;background-image:url('/assets/rewards-sprite.webp?v=20260829')!important;background-repeat:no-repeat!important;background-size:288px 48px!important;background-color:transparent!important;border:0!important;border-radius:0!important;clip-path:none!important;filter:drop-shadow(0 2px 3px #0008)!important}
.reward-icon.gold{background-position:0 0!important}.reward-icon.yellow{background-position:-48px 0!important}.reward-icon.red{background-position:-96px 0!important}.reward-icon.crystal{background-position:-144px 0!important}.reward-icon.mana{background-position:-192px 0!important}.reward-icon.energy{background-position:-240px 0!important}
.reward-icon.blue{background-image:url('/assets/scroll-blue.svg?v=20260829')!important;background-position:center!important;background-size:contain!important;background-repeat:no-repeat!important}
@media(max-width:850px){.reward-icon{width:38px!important;height:38px!important;background-size:228px 38px!important}.reward-icon.gold{background-position:0 0!important}.reward-icon.yellow{background-position:-38px 0!important}.reward-icon.red{background-position:-76px 0!important}.reward-icon.crystal{background-position:-114px 0!important}.reward-icon.mana{background-position:-152px 0!important}.reward-icon.energy{background-position:-190px 0!important}.reward-icon.blue{background-position:center!important;background-size:contain!important}}
`;
document.head.appendChild(s);
})();
