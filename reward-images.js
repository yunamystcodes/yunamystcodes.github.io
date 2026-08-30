(()=>{
'use strict';
const id='yunamyst-exact-reward-images';
const SPRITE='/assets/rewards-exact-20260829.webp?v=20260829-4';
const FALLBACK={
 '2SOREIKENIPPON6':[['mana','x200000'],['gold','x1']],
 '4READY4TDOT':[['mana','x200000'],['gold','x1'],['energy','x50']],
 'AMPRELIMSLEGACYDRP':[['energy','x100'],['gold','x1']],
 'AUGSW2026V7N':[['red','x3'],['energy','x100']],
 'LEGENDSWC2026HSL':[['energy','x100'],['gold','x1']],
 'SWXFRIEREN2026':[['energy','x100'],['mana','x300000'],['gold','x3']],
 'YIQIZOUGUO10SWC':[['energy','x100'],['gold','x1']],
 'APAC1K0UB4NGK0K':[['energy','x100'],['gold','x1']]
};
let REWARDS={...FALLBACK};
function css(){
 let old=document.getElementById(id); if(old)old.remove();
 const s=document.createElement('style');s.id=id;
 s.textContent=`
 .yunamyst-real-reward{width:48px!important;height:48px!important;min-width:48px!important;min-height:48px!important;display:block!important;flex:none!important;background-image:url('${SPRITE}')!important;background-repeat:no-repeat!important;background-size:336px 48px!important;background-color:transparent!important;border:0!important;border-radius:0!important;clip-path:none!important;filter:none!important;transform:none!important;margin:0 auto!important}
 .yunamyst-real-reward.energy{background-position:0 0!important}.yunamyst-real-reward.yellow{background-position:-48px 0!important}.yunamyst-real-reward.blue{background-position:-96px 0!important}.yunamyst-real-reward.red{background-position:-144px 0!important}.yunamyst-real-reward.crystal{background-position:-192px 0!important}.yunamyst-real-reward.gold{background-position:-240px 0!important}.yunamyst-real-reward.mana{background-position:-288px 0!important}
 .code .reward{min-width:0!important;overflow:visible!important;text-align:center!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:1px!important}
 .code .reward .reward-name{display:none!important}.code .reward b,.code .reward .qty{display:block!important;font-size:13px!important;line-height:1!important;margin-top:1px!important;white-space:nowrap!important;color:#fff!important}
 @media(max-width:850px){.yunamyst-real-reward{width:42px!important;height:42px!important;min-width:42px!important;min-height:42px!important;background-size:294px 42px!important}.yunamyst-real-reward.energy{background-position:0 0!important}.yunamyst-real-reward.yellow{background-position:-42px 0!important}.yunamyst-real-reward.blue{background-position:-84px 0!important}.yunamyst-real-reward.red{background-position:-126px 0!important}.yunamyst-real-reward.crystal{background-position:-168px 0!important}.yunamyst-real-reward.gold{background-position:-210px 0!important}.yunamyst-real-reward.mana{background-position:-252px 0!important}.code .reward b,.code .reward .qty{font-size:12px!important}}
 @media(max-width:390px){.yunamyst-real-reward{width:38px!important;height:38px!important;min-width:38px!important;min-height:38px!important;background-size:266px 38px!important}.yunamyst-real-reward.energy{background-position:0 0!important}.yunamyst-real-reward.yellow{background-position:-38px 0!important}.yunamyst-real-reward.blue{background-position:-76px 0!important}.yunamyst-real-reward.red{background-position:-114px 0!important}.yunamyst-real-reward.crystal{background-position:-152px 0!important}.yunamyst-real-reward.gold{background-position:-190px 0!important}.yunamyst-real-reward.mana{background-position:-228px 0!important}}
 `;
 document.head.appendChild(s);
}
function norm(s){return String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'')}
function makeIcon(kind){const d=document.createElement('span');d.className='yunamyst-real-reward '+kind;d.setAttribute('aria-hidden','true');return d}
function applyCard(card){
 const codeEl=card.querySelector('.cinfo strong');if(!codeEl)return;
 const code=norm(codeEl.textContent),data=REWARDS[code];
 const rewards=[...card.querySelectorAll(':scope > .reward')];
 if(!data)return;
 data.forEach(([kind,qty],i)=>{
  let r=rewards[i];if(!r){r=document.createElement('div');r.className='reward';card.appendChild(r)}
  r.innerHTML='';r.appendChild(makeIcon(kind));const b=document.createElement('b');b.className='qty';b.textContent=qty;r.appendChild(b);
 });
 for(let i=data.length;i<rewards.length;i++)rewards[i].remove();
}
function apply(){css();document.querySelectorAll('.code').forEach(applyCard)}
async function load(){
 try{
  const r=await fetch('/codes.json?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('codes.json');
  const d=await r.json();const remote=d.rewards||{};
  Object.keys(remote).forEach(c=>{if(Array.isArray(remote[c])&&remote[c].length)REWARDS[norm(c)]=remote[c]});
 }catch(e){}
 apply();setTimeout(apply,300);setTimeout(apply,1000);setTimeout(apply,2000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
