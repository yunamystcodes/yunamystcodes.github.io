(()=>{
'use strict';
const API='https://uxwbbaeupemihonwyszu.supabase.co/functions/v1/feedbacks';
if(window.__YUNA_FEEDBACK_GLOBAL__)return;
window.__YUNA_FEEDBACK_GLOBAL__=true;

const css=`
.ymgfb-open-wrap{width:100%;display:flex;justify-content:center;margin:12px 0 0}
.ymgfb-open{display:flex;align-items:center;justify-content:center;width:100%;max-width:420px;min-height:44px;padding:10px 16px;border:1px solid #633487;border-radius:10px;background:linear-gradient(#7e36b5,#4d1b76);color:#fff;font:900 12px Arial,sans-serif;cursor:pointer;touch-action:manipulation;box-shadow:0 8px 20px #0005}
.ymgfb-open:hover{filter:brightness(1.08)}
.ymgfb-modal{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.72)}
.ymgfb-modal.is-open{display:flex}
.ymgfb-dialog{position:relative;width:min(680px,100%);max-height:min(82vh,760px);overflow:hidden;border:1px solid #be66ff55;border-radius:16px;background:#090512;box-shadow:0 20px 70px #000b}
.ymgfb-modal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid #ffffff18}
.ymgfb-modal-title{color:#f0c45c;font-size:15px;font-weight:900}
.ymgfb-close{border:0;background:transparent;color:#fff;font-size:25px;line-height:1;cursor:pointer;padding:4px 7px}
.ymgfb-list{display:flex;flex-direction:column;gap:10px;max-height:calc(min(82vh,760px) - 66px);overflow:auto;padding:16px}
.ymgfb-item{padding:12px;border:1px solid #be66ff40;border-radius:11px;background:#0a0518cc}
.ymgfb-head{display:flex;justify-content:space-between;gap:10px;font-size:12px;font-weight:800}
.ymgfb-name{overflow-wrap:anywhere;color:#fff}
.ymgfb-stars{color:#f0c45c;white-space:nowrap}
.ymgfb-text{margin-top:7px;color:#c9c0d0;font-size:12px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
.ymgfb-empty{text-align:center;color:#aaa1b3;font-size:12px;padding:20px 8px}
@media(max-width:850px){.ymgfb-open{max-width:100%;font-size:11px}.ymgfb-list{padding:12px}.ymgfb-item{padding:10px}.ymgfb-head,.ymgfb-text{font-size:11px}}
`;
function addStyle(){
 if(document.getElementById('ymgfb-style'))return;
 const s=document.createElement('style');s.id='ymgfb-style';s.textContent=css;document.head.appendChild(s)
}
function root(){return document.getElementById('ym-feedback')}
function makeModal(){
 let modal=document.getElementById('ym-feedback-modal');
 if(!modal){
  modal=document.createElement('div');modal.id='ym-feedback-modal';modal.className='ymgfb-modal';
  modal.innerHTML='<div class="ymgfb-dialog" role="dialog" aria-modal="true" aria-labelledby="ymgfb-title"><div class="ymgfb-modal-head"><div id="ymgfb-title" class="ymgfb-modal-title">💜 TODOS OS FEEDBACKS</div><button type="button" id="ym-feedback-modal-close" class="ymgfb-close" aria-label="Fechar">×</button></div><div id="ym-feedback-list" class="ymgfb-list"><div class="ymgfb-empty">A carregar os feedbacks...</div></div></div>';
  document.body.appendChild(modal);
 }
 const list=document.getElementById('ym-feedback-list');
 const close=document.getElementById('ym-feedback-modal-close');
 if(close&&!close.dataset.ymgfbBound){close.dataset.ymgfbBound='1';close.addEventListener('click',()=>modal.classList.remove('is-open'))}
 if(modal&&!modal.dataset.ymgfbBound){modal.dataset.ymgfbBound='1';modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('is-open')})}
 return {modal,list}
}
async function load(list){
 if(!list)return;
 list.innerHTML='<div class="ymgfb-empty">A carregar os feedbacks...</div>';
 try{
  const r=await fetch(API+'?t='+Date.now(),{cache:'no-store',headers:{Accept:'application/json'}});
  if(!r.ok)throw new Error('GET '+r.status);
  const raw=await r.json();
  const items=Array.isArray(raw)?raw:(Array.isArray(raw?.items)?raw.items:(Array.isArray(raw?.data)?raw.data:[]));
  list.innerHTML='';
  if(!items.length){list.innerHTML='<div class="ymgfb-empty">Ainda não há feedbacks enviados.</div>';return}
  items.forEach(x=>{
   const item=document.createElement('div');item.className='ymgfb-item';
   const head=document.createElement('div');head.className='ymgfb-head';
   const name=document.createElement('span');name.className='ymgfb-name';name.textContent=x.name||x.nome||'Jogador';
   const stars=document.createElement('span');stars.className='ymgfb-stars';
   const n=Math.max(0,Math.min(5,Number(x.rating??x.stars)||0));stars.textContent='★'.repeat(n)+'☆'.repeat(5-n);
   head.append(name,stars);
   const text=document.createElement('div');text.className='ymgfb-text';text.textContent=x.message||x.mensagem||x.text||'';
   item.append(head,text);list.append(item)
  })
 }catch(e){
  console.error('[YunaCodes] Feedbacks:',e);
  list.innerHTML='<div class="ymgfb-empty">Não foi possível carregar os feedbacks agora. Tenta novamente.</div>'
 }
}
function ensureButton(){
 const r=root();if(!r)return;
 document.querySelectorAll('.ymgfb-floating,#ymgfb-open').forEach(el=>el.remove());
 let button=document.getElementById('ym-feedback-all');
 let wrap=button?.parentElement?.classList.contains('ymgfb-open-wrap')?button.parentElement:null;
 if(!button){
  wrap=document.createElement('div');wrap.className='ymgfb-open-wrap';
  button=document.createElement('button');button.type='button';button.id='ym-feedback-all';button.className='ymgfb-open';button.textContent='💜 VER TODOS OS FEEDBACKS';
  wrap.appendChild(button);
  r.insertAdjacentElement('afterend',wrap);
 }else{
  button.classList.add('ymgfb-open');
  if(!wrap){wrap=document.createElement('div');wrap.className='ymgfb-open-wrap';button.replaceWith(wrap);wrap.appendChild(button)}
 }
 const {modal,list}=makeModal();
 if(!button.dataset.ymgfbBound){
  button.dataset.ymgfbBound='1';
  button.addEventListener('click',()=>{modal.classList.add('is-open');load(list)})
 }
 document.addEventListener('keydown',e=>{if(e.key==='Escape')modal.classList.remove('is-open')},{once:false});
}
function setup(){addStyle();ensureButton()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();