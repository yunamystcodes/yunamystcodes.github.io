(()=>{
'use strict';
const API='https://uxwbbaeupemihonwyszu.supabase.co/functions/v1/feedbacks';
if(window.__YUNA_FEEDBACK_GLOBAL__)return;
window.__YUNA_FEEDBACK_GLOBAL__=true;

const css=`
.ymgfb-inline{margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,.12)}
.ymgfb-inline-title{color:#f0c45c;font-size:14px;font-weight:900;margin-bottom:10px}
.ymgfb-list{display:flex;flex-direction:column;gap:9px}
.ymgfb-item{padding:12px;border:1px solid #be66ff40;border-radius:11px;background:#0a0518cc}
.ymgfb-head{display:flex;justify-content:space-between;gap:10px;font-size:12px;font-weight:800}
.ymgfb-name{overflow-wrap:anywhere;color:#fff}
.ymgfb-stars{color:#f0c45c;white-space:nowrap}
.ymgfb-text{margin-top:7px;color:#c9c0d0;font-size:12px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
.ymgfb-empty{text-align:center;color:#aaa1b3;font-size:12px;padding:14px 8px}
@media(max-width:850px){.ymgfb-head,.ymgfb-text{font-size:11px}.ymgfb-item{padding:10px}}
`;
function addStyle(){
 if(document.getElementById('ymgfb-style'))return;
 const s=document.createElement('style');s.id='ymgfb-style';s.textContent=css;document.head.appendChild(s)
}
function getRoot(){return document.getElementById('ym-feedback')}
function ensureList(){
 const root=getRoot();
 if(!root)return null;
 let box=document.getElementById('ymgfb-inline');
 if(box)return box.querySelector('.ymgfb-list');
 box=document.createElement('div');
 box.id='ymgfb-inline';
 box.className='ymgfb-inline';
 box.innerHTML='<div class="ymgfb-inline-title">💜 FEEDBACKS DOS JOGADORES</div><div id="ymgfb-inline-list" class="ymgfb-list"><div class="ymgfb-empty">A carregar os feedbacks...</div></div>';
 root.appendChild(box);
 return box.querySelector('.ymgfb-list')
}
async function load(){
 const list=ensureList();
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
   const box=document.createElement('div');box.className='ymgfb-item';
   const head=document.createElement('div');head.className='ymgfb-head';
   const name=document.createElement('span');name.className='ymgfb-name';name.textContent=x.name||x.nome||'Jogador';
   const stars=document.createElement('span');stars.className='ymgfb-stars';
   const n=Math.max(0,Math.min(5,Number(x.rating??x.stars)||0));
   stars.textContent='★'.repeat(n)+'☆'.repeat(5-n);
   head.append(name,stars);
   const text=document.createElement('div');text.className='ymgfb-text';text.textContent=x.message||x.mensagem||x.text||'';
   box.append(head,text);list.append(box)
  })
 }catch(e){
  console.error('[YunaCodes] Feedbacks:',e);
  list.innerHTML='<div class="ymgfb-empty">Não foi possível carregar os feedbacks agora. Tenta novamente.</div>'
 }
}
function bindForm(){
 const root=getRoot();if(!root)return;
 const submit=document.getElementById('ym-feedback-submit');
 if(!submit||submit.dataset.ymgfbBound)return;
 submit.dataset.ymgfbBound='1';
 let rating=0;
 const stars=[...root.querySelectorAll('.ym-star')];
 stars.forEach(s=>s.addEventListener('click',()=>{
  rating=Number(s.dataset.star)||0;
  stars.forEach(x=>x.classList.toggle('active',Number(x.dataset.star)<=rating))
 }));
 submit.addEventListener('click',async()=>{
  const name=(root.querySelector('.ym-feedback-name')?.value||'').trim()||'Jogador';
  const message=(root.querySelector('.ym-feedback-text')?.value||'').trim();
  if(!rating||!message){alert('Escolhe uma avaliação e escreve uma mensagem.');return}
  submit.disabled=true;
  try{
   const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name,rating,message})});
   if(!r.ok)throw new Error('POST '+r.status);
   const field=root.querySelector('.ym-feedback-text');if(field)field.value='';
   const nameField=root.querySelector('.ym-feedback-name');if(nameField)nameField.value='';
   rating=0;stars.forEach(x=>x.classList.remove('active'));
   await load();
  }catch(e){
   console.error('[YunaCodes] Envio:',e);
   alert('Não foi possível enviar o feedback. Tenta novamente')
  }finally{submit.disabled=false}
 });
}
function setup(){addStyle();if(!getRoot())return;ensureList();bindForm();load()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
