(()=>{
'use strict';
const redeem='https://withhive.me/313/';
const blocked=new Set(['GLHF2026AMERICAS','SWC26X10LEGACYBND','912XUXIECHUANQI','SWC2026JUELEBA','PAI2026BANGKOK','APAC26LEGASEA']);
const FALLBACK_CODES=[];
const REWARDS={
 '4READY4TDOT':[['gold','x1'],['mana','x200K'],['energy','x50']],
 'AMPRELIMSLEGACYDRP':[['gold','x1'],['energy','x100']],
 'LEGENDSWC2026HSL':[['gold','x1'],['energy','x100']],
 'YIQIZOUGUO10SWC':[['gold','x1'],['energy','x100']],
 'AUGSW2026V7N':[['yellow','x3'],['energy','x100']],
 'SWXFRIEREN2026':[['gold','x3'],['mana','x300K'],['energy','x100']]
};
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=c=>String(c).toUpperCase().replace(/[^A-Z0-9]/g,'');
const valid=c=>{c=norm(c);return /^[A-Z0-9]{6,32}$/.test(c)&&/[A-Z]/.test(c)&&/\d/.test(c)&&!blocked.has(c)};
function styles(){if(document.getElementById('yunamyst-auto-links'))return;const s=document.createElement('style');s.id='yunamyst-auto-links';s.textContent=`
.code.auto-code .reward{min-width:0!important;text-align:center!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:3px!important;overflow:visible!important}
.reward b{font-size:12px!important;line-height:1!important;white-space:nowrap!important}
.copy,.link{height:44px!important;width:100%!important;border-radius:9px!important;font-weight:900;font-size:11px!important;display:flex!important;align-items:center!important;justify-content:center!important;text-decoration:none!important;cursor:pointer!important;touch-action:manipulation!important;white-space:nowrap!important}
/* Desktop: the number of rewards determines the columns, so one reward never creates empty visual gaps. */
@media(min-width:851px){
 .code.auto-code.reward-count-1{grid-template-columns:58px minmax(150px,1fr) 72px 128px 128px!important}
 .code.auto-code.reward-count-2{grid-template-columns:58px minmax(120px,1fr) 72px 72px 128px 128px!important}
 .code.auto-code.reward-count-3{grid-template-columns:58px minmax(105px,1fr) 64px 64px 64px 128px 128px!important}
 .code.auto-code .reward{width:100%!important}
}
@media(max-width:850px){
 .code.auto-code{grid-template-columns:44px minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)!important;grid-template-rows:56px 68px 44px!important;grid-template-areas:'gift info info info' 'gift r1 r2 r3' 'copy copy link link'!important;gap:7px!important;padding:11px 8px!important;min-height:180px!important}
 .code>.gift{grid-area:gift}.code>.cinfo{grid-area:info}.code>.reward:nth-child(3){grid-area:r1}.code>.reward:nth-child(4){grid-area:r2}.code>.reward:nth-child(5){grid-area:r3}.copy{grid-area:copy}.link{grid-area:link}
}
`;document.head.appendChild(s)}
function profileFix(){const p=document.querySelector('.left .profile');if(!p)return;p.querySelectorAll('*').forEach(el=>{const txt=(el.childNodes.length===1?el.textContent:'').trim();if(/^https?:\/\//i.test(txt)||/^www\./i.test(txt))el.remove()});p.querySelectorAll('a').forEach(a=>{a.style.color='#fff';a.style.textDecoration='none'})}
function card(code){const rewards=REWARDS[code]||[];const slots=rewards.map(()=>'<div class="reward"></div>').join('');const empty=Math.max(0,3-rewards.length);return `<article class="code auto-code reward-count-${Math.min(rewards.length,3)}"><div class="gift">🎁</div><div class="cinfo"><strong>${esc(code)}</strong><small>🔄 Código ativo</small></div>${slots}${'<div class="reward"></div>'.repeat(empty)}<button class="copy" type="button" data-code="${esc(code)}">▣ COPIAR</button><a class="link" href="${redeem}${encodeURIComponent(code)}" target="_blank" rel="noopener noreferrer">🔗 LINK iOS</a></article>`}
function copy(code,b){const old=b.textContent,done=()=>{b.textContent='✓ COPIADO!';setTimeout(()=>b.textContent=old,1500)};if(navigator.clipboard&&isSecureContext)navigator.clipboard.writeText(code).then(done).catch(()=>fallback(code,b));else fallback(code,b)}
function fallback(code,b){try{const t=document.createElement('textarea');t.value=code;t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();if(document.execCommand('copy')){b.textContent='✓ COPIADO!';setTimeout(()=>b.textContent='▣ COPIAR',1500)}t.remove()}catch(e){window.prompt('Copie o código:',code)}}
function bind(root=document){root.querySelectorAll('.copy[data-code]').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',e=>{e.preventDefault();copy(b.dataset.code,b)})})}
function clean(root){root.querySelectorAll('.code').forEach(x=>{const c=x.querySelector('.cinfo strong');if(c&&!valid(c.textContent))x.remove()})}
function render(codes,root){const unique=[...new Set(codes.map(norm).filter(valid))];root.innerHTML=unique.map(card).join('');clean(root);bind(root)}
async function load(){const root=document.getElementById('ativos');if(!root)return;try{const r=await fetch('./codes.json?ts='+Date.now(),{cache:'no-store'});if(!r.ok)throw 0;const d=await r.json();const codes=Array.isArray(d.codes)?d.codes:[];if(codes.length===0)throw 0;render(codes,root)}catch(e){render(FALLBACK_CODES,root)}profileFix()}
function lang(){const sw=document.getElementById('langSwitch'),t=document.getElementById('langToggle');if(!sw||!t)return;if(!t.dataset.bound){t.dataset.bound='1';t.onclick=e=>{e.preventDefault();e.stopPropagation();sw.classList.toggle('open')}}}
function sound(){const a=document.getElementById('bgMusic'),b=document.getElementById('soundToggle');if(!a||!b||b.dataset.bound)return;b.dataset.bound='1';const k='yunamyst-mute-v3';try{a.muted=localStorage.getItem(k)==='1'}catch(e){}const sync=()=>b.textContent=a.muted?'🔇':'🔊';sync();b.onclick=e=>{e.preventDefault();e.stopPropagation();a.muted=!a.muted;try{localStorage.setItem(k,a.muted?'1':'0')}catch(x){}if(!a.muted)a.play().catch(()=>{});sync()}}
function init(){styles();lang();sound();bind();load();profileFix();setInterval(load,60*60*1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();