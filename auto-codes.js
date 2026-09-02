(()=>{
'use strict';

const REDEEM='https://withhive.me/313/';
const SPRITE='/assets/rewards-exact-20260829.webp?v=20260829-4';
const FALLBACK={
  SEPSW2026I8B:[['blue','x3'],['mana','x300000']],
  SWGAJA2BKK:[['mana','x200000'],['yellow','x1']],
  SWCJOAAAKR26:[['yellow','x1']],
  '2SWCTORONTOTHE6IX':[['energy','x100'],['yellow','x1']],
  LAST4PUNCHIN:[['mana','x200000'],['yellow','x1']],
  APAC1K0UB4NGK0K:[['energy','x100'],['yellow','x1']],
  '2SOREIKENIPPON6':[['mana','x200000'],['yellow','x1']],
  SWXFRIEREN2026:[['energy','x100'],['mana','x300000'],['yellow','x3']],
  AUGSW2026V7N:[['energy','x100'],['red','x3']]
};
const blocked=new Set(['GLHF2026AMERICAS','SWC26X10LEGACYBND','912XUXIECHUANQI','SWC2026JUELEBA','PAI2026BANGKOK','APAC26LEGASEA']);
let rewards={...FALLBACK};
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const valid=s=>{const c=norm(s);return c.length>=6&&c.length<=32&&/[A-Z]/.test(c)&&/\d/.test(c)&&!blocked.has(c)};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function addStyles(){
 if(document.getElementById('ym-auto-code-style'))return;
 const style=document.createElement('style');
 style.id='ym-auto-code-style';
 style.textContent=`
.code.auto-code .reward{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;text-align:center!important;min-width:0!important}.code.auto-code .reward-icon{display:block;width:48px;height:48px;background-image:url('${SPRITE}');background-repeat:no-repeat;background-size:336px 48px}.reward-icon.energy{background-position:0 0}.reward-icon.yellow{background-position:-48px 0}.reward-icon.blue{background-position:-96px 0}.reward-icon.red{background-position:-144px 0}.reward-icon.crystal{background-position:-192px 0}.reward-icon.gold{background-position:-240px 0}.reward-icon.mana{background-position:-288px 0}.code.auto-code .reward b{display:block!important;font-size:13px!important;color:#fff!important;margin-top:2px!important}.code.auto-code .copy,.code.auto-code .link{height:44px!important;width:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}@media(min-width:851px){.code.auto-code .copy,.code.auto-code .link{min-width:118px!important;padding:0 10px!important;font-size:11px!important;white-space:nowrap!important}.code.auto-code{grid-template-columns:58px minmax(120px,1fr) 58px 58px 58px 128px 128px!important}.code.auto-code .copy{grid-column:6!important}.code.auto-code .link{grid-column:7!important}}
@media(max-width:850px){.code.auto-code{grid-template-columns:44px minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)!important;grid-template-rows:56px 62px 44px!important;grid-template-areas:'gift info info info' 'gift r1 r2 r3' 'copy copy link link'!important;min-height:174px!important}.code.auto-code>.gift{grid-area:gift}.code.auto-code>.cinfo{grid-area:info}.code.auto-code>.reward:nth-child(3){grid-area:r1}.code.auto-code>.reward:nth-child(4){grid-area:r2}.code.auto-code>.reward:nth-child(5){grid-area:r3}.code.auto-code>.copy{grid-area:copy}.code.auto-code>.link{grid-area:link}.code.auto-code .reward-icon{width:42px;height:42px;background-size:294px 42px}.code.auto-code .reward-icon.yellow{background-position:-42px 0}.code.auto-code .reward-icon.blue{background-position:-84px 0}.code.auto-code .reward-icon.red{background-position:-126px 0}.code.auto-code .reward-icon.crystal{background-position:-168px 0}.code.auto-code .reward-icon.gold{background-position:-210px 0}.code.auto-code .reward-icon.mana{background-position:-252px 0}}
`;
 document.head.appendChild(style);
}

function makeCard(code){
 const list=Array.isArray(rewards[code])?rewards[code]:[];
 const reward=list.map(x=>`<div class="reward"><span class="reward-icon ${esc(x[0])}"></span><b>${esc(x[1])}</b></div>`).join('');
 return `<article class="code auto-code reward-count-${Math.min(list.length,3)}"><div class="gift">🎁</div><div class="cinfo"><strong>${esc(code)}</strong><small>🔄 Código ativo</small></div>${reward}<button class="copy" type="button" data-code="${esc(code)}">▣ COPIAR</button><a class="link" href="${REDEEM}${encodeURIComponent(code)}" target="_blank" rel="noopener noreferrer">🔗 LINK iOS</a></article>`;
}

function bind(root){
 root.querySelectorAll('.copy[data-code]').forEach(button=>{
  if(button.dataset.ymBound)return;
  button.dataset.ymBound='1';
  button.addEventListener('click',async()=>{
   const code=button.dataset.code;
   try{await navigator.clipboard.writeText(code)}catch(e){const t=document.createElement('textarea');t.value=code;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}
   const old=button.textContent;button.textContent='✓ COPIADO!';setTimeout(()=>button.textContent=old,1400);
  });
 });
}

async function render(){
 const root=document.getElementById('ativos');
 if(!root)return;
 try{
  const response=await fetch('./codes.json?nocache='+Date.now(),{cache:'no-store'});
  if(!response.ok)throw new Error('codes.json '+response.status);
  const data=await response.json();
  if(data.rewards&&typeof data.rewards==='object'){
   for(const key of Object.keys(data.rewards))if(Array.isArray(data.rewards[key])&&data.rewards[key].length)rewards[norm(key)]=data.rewards[key];
  }
  const codes=Array.isArray(data.codes)?data.codes.map(norm).filter(valid):[];
  if(!codes.length)throw new Error('No active codes');
  root.innerHTML=[...new Set(codes)].map(makeCard).join('');
  bind(root);
 }catch(error){
  console.error('[YunaCodes] Falha ao carregar códigos:',error);
  // Do not destroy the server-rendered list when the JSON request fails.
  bind(root);
 }
}

function boot(){addStyles();render();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
