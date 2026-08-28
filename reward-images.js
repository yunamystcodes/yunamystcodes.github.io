(()=>{"use strict";
const styleId="yunamyst-exact-reward-images";
if(!document.getElementById(styleId)){
 const s=document.createElement("style");s.id=styleId;
 s.textContent=`
.reward-icon{background-image:url("/assets/rewards-sprite.webp?v=20260828")!important;background-repeat:no-repeat!important;background-size:288px 48px!important;background-color:transparent!important;border-radius:0!important;clip-path:none!important;filter:drop-shadow(0 2px 3px #0008)!important}
.reward-icon.scroll{background-position:-4.5px -6px!important}
.reward-icon.scroll-yellow{background-position:-51.75px -6px!important}
.reward-icon.scroll-red{background-position:-102px -6.75px!important}
.reward-icon.crystal{background-position:-154.5px -14.25px!important}
.reward-icon.mana{background-position:-197.25px -4.5px!important}
.reward-icon.energy{background-position:-247.5px -2.25px!important}
@media(max-width:850px){
 .reward-icon{background-size:224px 37.333px!important}
 .reward-icon.scroll{background-position:-3.5px -4.67px!important}
 .reward-icon.scroll-yellow{background-position:-40.25px -4.67px!important}
 .reward-icon.scroll-red{background-position:-79.33px -5.25px!important}
 .reward-icon.crystal{background-position:-120.17px -11.08px!important}
 .reward-icon.mana{background-position:-153.42px -3.5px!important}
 .reward-icon.energy{background-position:-192.5px -1.75px!important}
}`;
 document.head.appendChild(s);
}
})();
