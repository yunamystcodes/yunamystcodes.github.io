(()=>{
'use strict';
const redeem='https://withhive.me/313/';
const blocked=new Set(['GLHF2026AMERICAS','SWC26X10LEGACYBND']);
const REWARDS={
 '4READY4TDOT':[['scroll-gold','x1'],['mana','x100'],['energy','x50']],
 'AUGSW2026V7N':[['scroll-yellow','x1'],['crystals','x100'],['energy','x50']],
 'SWXFRIEREN2026':[['scroll-blue','x1'],['mana','x100'],['energy','x50']],
 'LEGENDSWC2026HSL':[['scroll-red','x1'],['crystals','x100'],['energy','x50']],
 'YIQIZOUGUO10SWC':[['scroll-gold','x1'],['mana','x100'],['energy','x50']]
};
const IMG={
 'scroll-gold':'data:image/png;base64,REPLACE_SCROLL_GOLD',
 'scroll-yellow':'data:image/png;base64,REPLACE_SCROLL_YELLOW',
 'scroll-red':'data:image/png;base64,REPLACE_SCROLL_RED',
 'scroll-blue':'data:image/png;base64,REPLACE_SCROLL_BLUE',
 'crystals':'data:image/png;base64,REPLACE_CRYSTALS',
 'mana':'data:image/png;base64,REPLACE_MANA',
 'energy':'data:image/png;base64,REPLACE_ENERGY'
};
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=c=>String(c).toUpperCase().replace(/[^A-Z0-9]/g,'');
const valid=c=>{c=norm(c);return /^[A-Z0-9]{6,32}$/.test(c)&&/[A-Z]/.test(c)&&/\d/.test(c)&&!blocked.has(c)};
function styles(){if(document.getElementById('yunamyst-real-rewards'))return;const s=document.createElement('style');s.id='yunamyst-real-rewards';s.textContent=`
.code.auto-code{grid-template-columns:58px minmax(150px,1fr) repeat(3,58px) 128px 128px;gap:8px;min-height:103px}
.reward{min-width:0;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;overflow:hidden}
.reward-icon{width:44px;height:44px;display:block;background-repeat:no-repeat;background-position:center;background-size:contain;object-fit:contain;filter:drop-shadow(0 2px 3px #0008)}
.reward b{font-size:12px;line-height:1}.reward small{font-size:8px;color:#d5ccd9;white-space:nowrap}
.copy,.link{height:44px!important;width:100%!important;border-radius:9px!important;font-weight:900;font-size:11px!important;display:flex!important;align-items:center;justify-content:center;text-decoration:none;cursor:pointer;touch-action:manipulation}
.copy{border:1px solid #edbd4e!important;background:linear-gradient(#f6cd70,#bd7d1d)!important;color:#251400!important}.link{border:1px solid #bba5f4!important;background:#f8f8fb!important;color:#151018!important}
@media(max-width:850px){
 .code.auto-code{grid-template-columns:44px minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)!important;grid-template-rows:56px 62px 44px!important;grid-template-areas:'gift info info info' 'gift r1 r2 r3' 'copy copy link link'!important;gap:7px!important;padding:11px 8px!important;min-height:174px!important}
 .code>.gift{grid-area:gift}.code>.cinfo{grid-area:info}.code>.reward:nth-child(3){grid-area:r1}.code>.reward:nth-child(4){grid-area:r2}.code>.reward:nth-child(5){grid-area:r3}.copy{grid-area:copy}.link{grid-area:link}
 .reward-icon{width:38px;height:38px}.reward b{font-size:11px}.reward small{display:none}.cinfo strong{font-size:15px}
}
`;
document.head.appendChild(s)}
function icon(kind){const src=IMG[kind]||IMG['scroll-gold'];return `<span class="reward-icon" style="background-image:url('${src}')" aria-hidden="true"></span>`}
function card(code){const rewards=REWARDS[code]||[['scroll-gold','x1'],['mana','x100'],['energy','x50']];return `<article class="code auto-code"><div class="gift">🎁</div><div class="cinfo"><strong>${esc(code)}</strong><small>🔄 Código ativo</small></div>${rewards.map(([k,q])=>`<div class="reward">${icon(k)}<b>${q}</b></div>`).join('')}<button class="copy" type="button" data-code="${esc(code)}">▣ COPIAR</button><a class="link" href="${redeem}${encodeURIComponent(code)}" target="_blank" rel="noopener noreferrer">🔗 LINK iOS</a></article>`}
function copy(code,b){const old=b.textContent,done=()=>{b.textContent='✓ COPIADO!';setTimeout(()=>b.textContent=old,1500)};if(navigator.clipboard&&isSecureContext)navigator.clipboard.writeText(code).then(done).catch(()=>fallback(code,b,old));else fallback(code,b,old)}
function fallback(code,b,old){try{const t=document.createElement('textarea');t.value=code;t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();if(document.execCommand('copy')){b.textContent='✓ COPIADO!';setTimeout(()=>b.textContent=old,1500);t.remove();return}t.remove()}catch(e){}window.prompt('Copie o código:',code)}
function bind(root=document){root.querySelectorAll('.copy[data-code]').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',e=>{e.preventDefault();copy(b.dataset.code,b)})})}
function clean(root){root.querySelectorAll('.code').forEach(x=>{const c=x.querySelector('.cinfo strong');if(c&&!valid(c.textContent))x.remove()})}
async function load(){const root=document.getElementById('ativos');if(!root)return;try{const r=await fetch('./codes.json?ts='+Date.now(),{cache:'no-store'});if(!r.ok)throw 0;const d=await r.json();const codes=[...new Set((Array.isArray(d.codes)?d.codes:[]).map(norm).filter(valid))];root.innerHTML=codes.map(card).join('');}catch(e){}clean(root);bind(root)}
function lang(){const sw=document.getElementById('langSwitch'),t=document.getElementById('langToggle');if(!sw||!t)return;if(!t.dataset.bound){t.dataset.bound='1';t.onclick=e=>{e.preventDefault();e.stopPropagation();sw.classList.toggle('open')}}}
function sound(){const a=document.getElementById('bgMusic'),b=document.getElementById('soundToggle');if(!a||!b||b.dataset.bound)return;b.dataset.bound='1';const k='yunamyst-mute-v3';try{a.muted=localStorage.getItem(k)==='1'}catch(e){}const sync=()=>b.textContent=a.muted?'🔇':'🔊';sync();b.onclick=e=>{e.preventDefault();a.muted=!a.muted;try{localStorage.setItem(k,a.muted?'1':'0')}catch(x){}if(!a.muted)a.play().catch(()=>{});sync()}}
function init(){styles();lang();sound();bind();load()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
