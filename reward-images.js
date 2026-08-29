(()=>{
'use strict';
const id='yunamyst-exact-reward-images';
const SPRITE='/assets/rewards-exact-20260829.webp?v=20260829-3';
const REWARDS={
 '2SOREIKENIPPON6':[['gold','x1']],
 '4READY4TDOT':[['gold','x1'],['mana','x200K'],['energy','x50']],
 'AMPRELIMSLEGACYDRP':[['gold','x1'],['energy','x100']],
 'AUGSW2026V7N':[['gold','x3'],['energy','x100']],
 'LEGENDSWC2026HSL':[['gold','x1'],['energy','x100']],
 'SWXFRIEREN2026':[['gold','x3'],['mana','x300K'],['energy','x100']],
 'YIQIZOUGUO10SWC':[['gold','x1'],['energy','x100']]
};
function css(){
 let old=document.getElementById(id); if(old) old.remove();
 const s=document.createElement('style'); s.id=id;
 s.textContent=`
 .yunamyst-real-reward{width:64px!important;height:64px!important;min-width:64px!important;min-height:64px!important;display:block!important;flex:none!important;background-image:url('${SPRITE}')!important;background-repeat:no-repeat!important;background-size:448px 64px!important;background-color:transparent!important;border:0!important;border-radius:0!important;clip-path:none!important;filter:none!important;transform:none!important;margin:0 auto!important}
 .yunamyst-real-reward.energy{background-position:0 0!important}
 .yunamyst-real-reward.yellow{background-position:-64px 0!important}
 .yunamyst-real-reward.blue{background-position:-128px 0!important}
 .yunamyst-real-reward.red{background-position:-192px 0!important}
 .yunamyst-real-reward.crystal{background-position:-256px 0!important}
 .yunamyst-real-reward.gold{background-position:-320px 0!important}
 .yunamyst-real-reward.mana{background-position:-384px 0!important}
 .code .reward{min-width:0!important;overflow:visible!important;text-align:center!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:2px!important}
 .code .reward .reward-name{display:none!important}
 .code .reward b,.code .reward .qty{display:block!important;font-size:13px!important;line-height:1!important;margin-top:2px!important;white-space:nowrap!important;color:#fff!important}
 @media(max-width:850px){
  .yunamyst-real-reward{width:54px!important;height:54px!important;min-width:54px!important;min-height:54px!important;background-size:378px 54px!important}
  .yunamyst-real-reward.energy{background-position:0 0!important}.yunamyst-real-reward.yellow{background-position:-54px 0!important}.yunamyst-real-reward.blue{background-position:-108px 0!important}.yunamyst-real-reward.red{background-position:-162px 0!important}.yunamyst-real-reward.crystal{background-position:-216px 0!important}.yunamyst-real-reward.gold{background-position:-270px 0!important}.yunamyst-real-reward.mana{background-position:-324px 0!important}
  .code .reward b,.code .reward .qty{font-size:12px!important}
 }
 @media(max-width:390px){.yunamyst-real-reward{width:48px!important;height:48px!important;min-width:48px!important;min-height:48px!important;background-size:336px 48px!important}.yunamyst-real-reward.energy{background-position:0 0!important}.yunamyst-real-reward.yellow{background-position:-48px 0!important}.yunamyst-real-reward.blue{background-position:-96px 0!important}.yunamyst-real-reward.red{background-position:-144px 0!important}.yunamyst-real-reward.crystal{background-position:-192px 0!important}.yunamyst-real-reward.gold{background-position:-240px 0!important}.yunamyst-real-reward.mana{background-position:-288px 0!important}}
 `;
 document.head.appendChild(s);
}
function norm(s){return String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'')}
function makeIcon(kind){const d=document.createElement('span');d.className='yunamyst-real-reward '+kind;d.setAttribute('aria-hidden','true');return d}
function applyCard(card){
 const codeEl=card.querySelector('.cinfo strong'); if(!codeEl)return;
 const code=norm(codeEl.textContent); const data=REWARDS[code];
 const rewards=[...card.querySelectorAll(':scope > .reward')];
 if(!data && !rewards.length)return;
 if(data){
  const all=rewards.length?rewards:[];
  data.forEach(([kind,qty],i)=>{
   let r=all[i];
   if(!r){r=document.createElement('div');r.className='reward';card.appendChild(r)}
   r.innerHTML='';r.appendChild(makeIcon(kind));const b=document.createElement('b');b.className='qty';b.textContent=qty;r.appendChild(b);
  });
  for(let i=data.length;i<all.length;i++) all[i].remove();
 }
}
function apply(){css();document.querySelectorAll('.code').forEach(applyCard)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{apply();setTimeout(apply,300);setTimeout(apply,1500)},{once:true});else{apply();setTimeout(apply,300);setTimeout(apply,1500)}
})();
