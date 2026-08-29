(()=> {
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
const IMG=__IMG__;
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=c=>String(c).toUpperCase().replace(/[^A-Z0-9]/g,'');
const valid=c=>{c=norm(c);return /^[A-Z0-9]{6,32}$/.test(c)&&/[A-Z]/.test(c)&&/\d/.test(c)&&!blocked.has(c)};
function styles(){if(document.getElementById('yunamyst-real-rewards'))return;const s=document.createElement('style');s.id='yunamyst-real-rewards';s.textContent=`
.reward-icon{width:48px!important;height:48px!important;display:block!important;object-fit:contain!important;object-position:center!important;flex:none!important;background:none!important;border:0!important;border-radius:0!important;clip-path:none!important;filter:none!important;transform:none!important;margin:0!important}
.code.auto-code .reward{min-width:0!important;text-align:center!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:3px!important;overflow:visible!important}
.reward b{font-size:12px!important;line-height:1!important;white-space:nowrap!important}
.copy,.link{height:44px!important;width:100%!important;border-radius:9px!important;font-weight:900;font-size:11px!important;display:flex!important;align-items:center!important;justify-content:center!important;text-decoration:none;cursor:pointer;touch-action:manipulation}
.copy{border:1px solid #edbd4e!important;background:linear-gradient(#f6cd70,#bd7d1d)!important;color:#251400!important}
.link{border:1px solid #bba5f4!important;background:#f8f8fb!important;color:#151018!important}
@media(max-width:850px){
.reward-icon{width:42px!important;height:42px!important}
.code.auto-code{grid-template-columns:44px minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)!important;grid-template-rows:56px 68px 44px!important;grid-template-areas:'gift info info info' 'gift r1 r2 r3' 'copy copy link link'!important;gap:7px!important;padding:11px 8px!important;min-height:180px!important}
.code>.gift{grid-area:gift}.code>.cinfo{grid-area:info}.code>.reward:nth-child(3){grid-area:r1}.code>.reward:nth-child(4){grid-area:r2}.code>.reward:nth-child(5){grid-area:r3}.copy{grid-area:copy}.link{grid-area:link}
.reward b{font-size:11px!important}.cinfo strong{font-size:15px!important}
}
@media(max-width:390px){.reward-icon{width:38px!important;height:38px!important}.code.auto-code{grid-template-rows:54px 64px 42px!important;min-height:174px!important}.copy,.link{height:42px!important;font-size:11px!important}.reward b{font-size:11px!important}}
`;document.head.appendChild(s)}
function profileFix(){const p=document.querySelector('.left .profile');if(!p)return;p.querySelectorAll('*').forEach(el=>{const txt=(el.childNodes.length===1?el.textContent:'').trim();if(/^https?:\/\//i.test(txt)||/^www\./i.test(txt))el.remove()});p.querySelectorAll('a').forEach(a=>{a.style.color='#fff';a.style.textDecoration='none';if(a.textContent.trim().match(/^https?:\/\//i))a.textContent=''})}
function icon(k){const src=IMG[k]||IMG.gold;return `<img class="reward-icon" src="${src}" alt="" aria-hidden="true">`}
function card(code){const rewards=REWARDS[code]||[['gold','x1']];return `<article class="code auto-code"><div class="gift">🎁</div><div class="cinfo"><strong>${esc(code)}</strong><small>🔄 Código ativo</small></div>${rewards.map(([k,q])=>`<div class="reward">${icon(k)}<b>${q}</b></div>`).join('')}${[...Array(Math.max(0,3-rewards.length))].map(()=>'<div class="reward"></div>').join('')}<button class="copy" type="button" data-code="${esc(code)}">▣ COPIAR</button><a class="link" href="${redeem}${encodeURIComponent(code)}" target="_blank" rel="noopener noreferrer">🔗 LINK iOS</a></article>`}
function copy(code,b){const old=b.textContent,done=()=>{b.textContent='✓ COPIADO!';setTimeout(()=>b.textContent=old,1500)};if(navigator.clipboard&&isSecureContext)navigator.clipboard.writeText(code).then(done).catch(()=>fallback(code,b,old));else fallback(code,b,old)}
function fallback(code,b,old){try{const t=document.createElement('textarea');t.value=code;t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();if(document.execCommand('copy')){b.textContent='✓ COPIADO!';setTimeout(()=>b.textContent=old,1500);t.remove();return}t.remove()}catch(e){}window.prompt('Copie o código:',code)}
function bind(root=document){root.querySelectorAll('.copy[data-code]').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',e=>{e.preventDefault();copy(b.dataset.code,b)})})}
function clean(root){root.querySelectorAll('.code').forEach(x=>{const c=x.querySelector('.cinfo strong');if(c&&!valid(c.textContent))x.remove()})}
function render(codes,root){const unique=[...new Set(codes.map(norm).filter(valid))];root.innerHTML=unique.map(card).join('');clean(root);bind(root)}
async function load(){const root=document.getElementById('ativos');if(!root)return;try{const r=await fetch('./codes.json?ts='+Date.now(),{cache:'no-store'});if(!r.ok)throw 0;const d=await r.json();const codes=Array.isArray(d.codes)?d.codes:[];if(codes.length===0)throw 0;render(codes,root)}catch(e){render(FALLBACK_CODES,root)}profileFix()}
function lang(){const sw=document.getElementById('langSwitch'),t=document.getElementById('langToggle');if(!sw||!t)return;if(!t.dataset.bound){t.dataset.bound='1';t.onclick=e=>{e.preventDefault();e.stopPropagation();sw.classList.toggle('open')}}}
function sound(){const a=document.getElementById('bgMusic'),b=document.getElementById('soundToggle');if(!a||!b||b.dataset.bound)return;b.dataset.bound='1';const k='yunamyst-mute-v3';try{a.muted=localStorage.getItem(k)==='1'}catch(e){}const sync=()=>b.textContent=a.muted?'🔇':'🔊';sync();b.onclick=e=>{e.preventDefault();e.stopPropagation();a.muted=!a.muted;try{localStorage.setItem(k,a.muted?'1':'0')}catch(x){}if(!a.muted)a.play().catch(()=>{});sync()}}
function init(){styles();lang();sound();bind();load();profileFix();setInterval(load,60*60*1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();