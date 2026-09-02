(()=>{
'use strict';
const API='https://uxwbbaeupemihonwyszu.supabase.co/functions/v1/feedbacks';
if(window.__YUNA_FEEDBACK_GLOBAL_V2__)return;
window.__YUNA_FEEDBACK_GLOBAL_V2__=true;

const css=`
.ymgfb-open-wrap{width:100%;display:flex;justify-content:center;margin:12px 0 0}
.ymgfb-open{display:flex!important;align-items:center;justify-content:center;width:100%;max-width:420px;min-height:44px;padding:10px 16px;border:1px solid #633487!important;border-radius:10px;background:linear-gradient(#7e36b5,#4d1b76)!important;color:#fff!important;font:900 12px Arial,sans-serif;cursor:pointer;touch-action:manipulation;box-shadow:0 8px 20px #0005}
.ymgfb-modal-v2{position:fixed!important;inset:0!important;z-index:2147483647!important;display:none!important;align-items:center!important;justify-content:center!important;padding:18px!important;background:rgba(0,0,0,.78)!important}
.ymgfb-modal-v2.is-open{display:flex!important}
.ymgfb-dialog-v2{position:relative;width:min(680px,100%);max-height:min(82vh,760px);overflow:hidden;border:1px solid #be66ff55;border-radius:16px;background:#090512;box-shadow:0 20px 70px #000b}
.ymgfb-head-v2{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid #ffffff18}
.ymgfb-title-v2{color:#f0c45c;font-size:15px;font-weight:900}
.ymgfb-close-v2{border:0;background:transparent;color:#fff;font-size:25px;line-height:1;cursor:pointer;padding:4px 7px}
.ymgfb-list-v2{display:flex;flex-direction:column;gap:10px;max-height:calc(min(82vh,760px) - 66px);overflow:auto;padding:16px}
.ymgfb-item-v2{padding:12px;border:1px solid #be66ff40;border-radius:11px;background:#0a0518cc}
.ymgfb-name-v2{color:#fff;font-size:12px;font-weight:800}
.ymgfb-stars-v2{float:right;color:#f0c45c;white-space:nowrap;font-size:12px}
.ymgfb-text-v2{margin-top:7px;color:#c9c0d0;font-size:12px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere;clear:both}
.ymgfb-empty-v2{text-align:center;color:#aaa1b3;font-size:12px;padding:20px 8px}
@media(max-width:850px){.ymgfb-open{max-width:100%;font-size:11px}.ymgfb-list-v2{padding:12px}.ymgfb-item-v2{padding:10px}.ymgfb-name-v2,.ymgfb-stars-v2,.ymgfb-text-v2{font-size:11px}}
`;
function style(){if(document.getElementById('ymgfb-style-v2'))return;const s=document.createElement('style');s.id='ymgfb-style-v2';s.textContent=css;document.head.appendChild(s)}
function findFeedback(){return document.getElementById('ym-feedback')||document.querySelector('[id*="feedback" i]')||document.querySelector('form')}
function makeModal(){
 let modal=document.getElementById('ym-feedback-modal-v2');
 if(!modal){
  modal=document.createElement('div');modal.id='ym-feedback-modal-v2';modal.className='ymgfb-modal-v2';
  modal.innerHTML='<div class="ymgfb-dialog-v2" role="dialog" aria-modal="true"><div class="ymgfb-head-v2"><div class="ymgfb-title-v2">💜 TODOS OS FEEDBACKS</div><button type="button" class="ymgfb-close-v2" aria-label="Fechar">×</button></div><div class="ymgfb-list-v2"><div class="ymgfb-empty-v2">A carregar os feedbacks...</div></div></div>';
  document.body.appendChild(modal);
  modal.querySelector('.ymgfb-close-v2').addEventListener('click',()=>modal.classList.remove('is-open'));
  modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('is-open')});
 }
 return {modal,list:modal.querySelector('.ymgfb-list-v2')}
}
async function load(list){
 list.innerHTML='<div class="ymgfb-empty-v2">A carregar os feedbacks...</div>';
 try{
  const r=await fetch(API+'?t='+Date.now(),{cache:'no-store',headers:{Accept:'application/json'}});
  if(!r.ok)throw new Error('GET '+r.status);
  const raw=await r.json();
  const items=Array.isArray(raw)?raw:(Array.isArray(raw?.items)?raw.items:(Array.isArray(raw?.data)?raw.data:[]));
  list.innerHTML='';
  if(!items.length){list.innerHTML='<div class="ymgfb-empty-v2">Ainda não há feedbacks enviados.</div>';return}
  items.forEach(x=>{
   const item=document.createElement('div');item.className='ymgfb-item-v2';
   const name=document.createElement('span');name.className='ymgfb-name-v2';name.textContent=x.name||x.nome||'Jogador';
   const stars=document.createElement('span');stars.className='ymgfb-stars-v2';const n=Math.max(0,Math.min(5,Number(x.rating??x.stars)||0));stars.textContent='★'.repeat(n)+'☆'.repeat(5-n);
   const text=document.createElement('div');text.className='ymgfb-text-v2';text.textContent=x.message||x.mensagem||x.text||'';
   item.append(name,stars,text);list.appendChild(item)
  })
 }catch(e){console.error('[YunaCodes] Feedbacks:',e);list.innerHTML='<div class="ymgfb-empty-v2">Não foi possível carregar os feedbacks agora. Tenta novamente.</div>'}
}
function setup(){
 style();
 const target=findFeedback();
 if(!target)return;
 let old=document.getElementById('ym-feedback-all');
 if(!old){old=document.querySelector('.ymgfb-open')} 
 let button=old;
 if(!button){
  const wrap=document.createElement('div');wrap.className='ymgfb-open-wrap';button=document.createElement('button');button.type='button';button.className='ymgfb-open';button.textContent='💜 VER TODOS OS FEEDBACKS';wrap.appendChild(button);target.insertAdjacentElement('afterend',wrap)
 }else{
  const clone=button.cloneNode(true);clone.removeAttribute('id');clone.className='ymgfb-open';clone.textContent='💜 VER TODOS OS FEEDBACKS';
  const wrap=document.createElement('div');wrap.className='ymgfb-open-wrap';wrap.appendChild(clone);button.replaceWith(wrap);button=clone
 }
 const {modal,list}=makeModal();
 button.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();modal.classList.add('is-open');load(list)},true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();