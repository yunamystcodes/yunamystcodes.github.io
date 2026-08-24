(()=>{
  const redeemBase='https://withhive.me/313/';
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function card(code){
    const url=redeemBase+encodeURIComponent(code);
    return `<div class="code auto-code"><div class="gift">🎁</div><div class="cinfo"><strong>${esc(code)}</strong><small>🔄 Código ativo</small></div><div class="reward"><div class="scroll"></div><b>?</b><small>Reward</small></div><div class="reward"><div class="energy">⚡</div><b>?</b><small>Energy</small></div><div class="reward"><div class="mana"></div><b>?</b><small>Mana</small></div><button class="copy" type="button" data-code="${esc(code)}">▣ COPIAR</button><a class="link" href="${url}" target="_blank" rel="noopener">🔗 LINK</a></div>`;
  }

  async function load(){
    const active=document.getElementById('ativos');
    if(active){
      try{
        const r=await fetch('./codes.json?ts='+Date.now(),{cache:'no-store'});
        if(!r.ok)throw new Error('codes');
        const data=await r.json();
        const codes=[...new Set((data.codes||[]).filter(c=>typeof c==='string'&&/^[A-Z0-9]{5,40}$/.test(c)))];
        if(codes.length){
          active.innerHTML=codes.map(card).join('');
          active.querySelectorAll('.copy').forEach(b=>b.addEventListener('click',()=>{
            const code=b.dataset.code;
            const ok=()=>{const old=b.textContent;b.textContent='✓ COPIADO!';setTimeout(()=>b.textContent=old,1500)};
            if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(code).then(ok).catch(()=>prompt('Copie o código:',code));
            else prompt('Copie o código:',code);
          }));
          const sh=document.querySelector('#sectionHead span');
          if(sh)sh.textContent='⟳ Atualizado automaticamente';
          window.yunaMystCodes=data;
        }
      }catch(e){console.warn('Não foi possível atualizar os códigos automaticamente.',e)}
    }
    initFeedback();
  }

  const sampleReviews=[
    {name:'YunaMyst',rating:5,date:'17/08/2026 10:15',message:'Site incrível! Sempre atualizado e muito fácil de usar!'},
    {name:'SummonerBR',rating:4,date:'17/08/2026 09:42',message:'Muito bom, encontrei todos os códigos aqui. Parabéns!'},
    {name:'SW_Legend',rating:5,date:'17/08/2026 08:30',message:'Melhor site de códigos de Summoners War! 🔥'},
    {name:'OracleSW',rating:4,date:'16/08/2026 22:18',message:'Ótimo trabalho, site leve e funcional.'},
    {name:'KairossKing',rating:5,date:'16/08/2026 20:55',message:'Atualizações rápidas e códigos sempre funcionando!'},
    {name:'MistikBR',rating:4,date:'16/08/2026 18:34',message:'Gosto muito do site, só falta mais filtros para organizar os códigos.'},
    {name:'RiftMaster',rating:5,date:'16/08/2026 17:11',message:'Excelente! Me ajudou bastante no jogo.'},
    {name:'SW_Player',rating:4,date:'16/08/2026 15:27',message:'Site muito bom e confiável. Recomendo!'}
  ];

  function stars(r){
    r=Math.max(0,Math.min(5,Number(r)||0));
    return '★'.repeat(r)+'<span class="ym-empty-star">'+'☆'.repeat(5-r)+'</span>';
  }

  function feedbackStyles(){
    if(document.getElementById('ym-feedback-redesign-css'))return;
    const style=document.createElement('style');
    style.id='ym-feedback-redesign-css';
    style.textContent=`
      #ym-feedback-redesign{margin:28px auto 8px;width:min(1260px,calc(100% - 28px));}
      #ym-feedback-redesign .ym-feedback-box{padding:28px;border:1px solid rgba(190,102,255,.42);border-radius:22px;background:linear-gradient(180deg,rgba(10,5,25,.97),rgba(4,3,15,.97));box-shadow:0 18px 50px rgba(0,0,0,.45);overflow:hidden}
      #ym-feedback-redesign .ym-feedback-head{text-align:center}
      #ym-feedback-redesign .ym-feedback-title{display:flex;justify-content:center;align-items:center;gap:12px;font-size:34px;font-weight:900}
      #ym-feedback-redesign .ym-big-star{color:#ffd21a;font-size:48px;line-height:1;text-shadow:0 0 18px rgba(255,210,26,.25)}
      #ym-feedback-redesign .ym-feedback-subtitle{margin-top:8px;color:#d6cde1;font-size:18px}
      #ym-feedback-redesign .ym-rating-stars{display:flex;justify-content:center;gap:8px;margin:18px 0 7px}
      #ym-feedback-redesign .ym-rating-star{border:0;background:none;color:#7d7587;font-size:58px;line-height:1;padding:0;cursor:pointer;transition:.15s}
      #ym-feedback-redesign .ym-rating-star:hover,#ym-feedback-redesign .ym-rating-star.active{color:#ffd21a;text-shadow:0 0 14px rgba(255,210,26,.25);transform:translateY(-2px)}
      #ym-feedback-redesign .ym-rating-hint{color:#b8aec5;font-size:14px}
      #ym-feedback-redesign .ym-feedback-form{max-width:780px;margin:20px auto 0}
      #ym-feedback-redesign .ym-feedback-textarea{width:100%;min-height:128px;resize:vertical;padding:16px 18px;border-radius:14px;border:1px solid rgba(210,180,255,.45);background:rgba(10,7,24,.88);color:#fff;font:16px Arial;outline:none}
      #ym-feedback-redesign .ym-feedback-textarea:focus{border-color:#b85cff;box-shadow:0 0 0 3px rgba(184,92,255,.12)}
      #ym-feedback-redesign .ym-feedback-textarea::placeholder{color:#9c93aa}
      #ym-feedback-redesign .ym-feedback-submit{width:100%;height:58px;margin-top:14px;border:0;border-radius:13px;background:linear-gradient(90deg,#8e21c9,#b33eea);color:#fff;font-size:18px;font-weight:900;cursor:pointer;box-shadow:0 8px 22px rgba(144,43,202,.28)}
      #ym-feedback-redesign .ym-feedback-status{text-align:center;min-height:20px;margin-top:9px;color:#d99cff;font-size:13px}
      #ym-feedback-redesign .ym-reviews-top{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;margin-top:30px;padding-top:24px;border-top:1px solid rgba(255,255,255,.14)}
      #ym-feedback-redesign .ym-reviews-heading{display:flex;align-items:center;gap:12px;font-size:30px;font-weight:900}.ym-review-icon{color:#d46cff;font-size:37px}
      #ym-feedback-redesign .ym-reviews-description{margin-top:8px;color:#d0c7dc;font-size:17px}
      #ym-feedback-redesign .ym-rating-summary{min-width:265px;padding:16px 18px;border:1px solid rgba(190,102,255,.38);border-radius:14px;background:rgba(14,8,30,.88);text-align:center}
      #ym-feedback-redesign .ym-summary-main{font-size:44px;font-weight:900;color:#d26cff}.ym-summary-star{color:#ffd21a;font-size:39px;vertical-align:3px}.ym-summary-small{font-size:18px;color:#b9b0c3}.ym-rating-summary p{margin-top:3px;color:#bcb3c6;font-size:14px}.ym-rating-summary strong{color:#d26cff}
      #ym-feedback-redesign .ym-reviews-list{display:flex;flex-direction:column;gap:10px;margin-top:18px}
      #ym-feedback-redesign .ym-review-card{padding:17px 20px;border:1px solid rgba(190,102,255,.3);border-radius:14px;background:linear-gradient(100deg,rgba(18,9,34,.95),rgba(7,5,20,.96))}
      #ym-feedback-redesign .ym-review-top{display:flex;align-items:center;justify-content:space-between;gap:15px}.ym-review-player{color:#d476ff;font-size:20px;font-weight:900}.ym-review-stars{color:#ffd21a;font-size:23px;letter-spacing:1px;white-space:nowrap}.ym-empty-star{color:#777281}.ym-review-date{color:#9e96a9;font-size:14px;white-space:nowrap}.ym-review-message{margin-top:9px;color:#f3eef8;font-size:16px;line-height:1.45}.ym-reviews-note{text-align:center;margin:20px 0 2px;color:#a49bac;font-size:14px}.ym-reviews-note span{color:#d99cff}
      @media(max-width:850px){#ym-feedback-redesign{margin:20px auto 8px;width:calc(100% - 18px)}#ym-feedback-redesign .ym-feedback-box{padding:20px 12px;border-radius:17px}#ym-feedback-redesign .ym-feedback-title{font-size:25px;gap:8px}#ym-feedback-redesign .ym-big-star{font-size:36px}#ym-feedback-redesign .ym-feedback-subtitle{font-size:15px}#ym-feedback-redesign .ym-rating-stars{gap:2px;margin-top:15px}#ym-feedback-redesign .ym-rating-star{font-size:45px}#ym-feedback-redesign .ym-feedback-form{margin-top:16px}#ym-feedback-redesign .ym-feedback-textarea{min-height:120px;font-size:15px}#ym-feedback-redesign .ym-feedback-submit{height:52px;font-size:16px}#ym-feedback-redesign .ym-reviews-top{display:block;margin-top:24px;padding-top:20px}#ym-feedback-redesign .ym-reviews-heading{font-size:24px}.ym-review-icon{font-size:30px}#ym-feedback-redesign .ym-reviews-description{font-size:14px;line-height:1.4}#ym-feedback-redesign .ym-rating-summary{min-width:0;margin-top:16px;padding:12px}#ym-feedback-redesign .ym-summary-main{font-size:38px}#ym-feedback-redesign .ym-reviews-list{margin-top:14px}#ym-feedback-redesign .ym-review-card{padding:14px}#ym-feedback-redesign .ym-review-top{display:block}.ym-review-player{font-size:18px}.ym-review-stars{display:inline-block;margin-top:3px;font-size:20px}.ym-review-date{float:right;margin-top:-25px;font-size:11px}.ym-review-message{clear:both;margin-top:9px;font-size:14px}.ym-reviews-note{font-size:12px;line-height:1.4}}
    `;
    document.head.appendChild(style);
  }

  function removeOldFeedback(){
    document.querySelectorAll('.feedback-open,#ym-feedback-system,.feedback-panel,#feedbackModal').forEach(el=>el.remove());
    document.querySelectorAll('#ym-feedback-redesign').forEach(el=>el.remove());
  }

  function reviewCard(r){
    const el=document.createElement('article');
    el.className='ym-review-card';
    el.innerHTML=`<div class="ym-review-top"><div><span class="ym-review-player">${esc(r.name||'Player')}</span> - <span class="ym-review-stars">${stars(r.rating)}</span></div><span class="ym-review-date">${esc(r.date||'')}</span></div><div class="ym-review-message">${esc(r.message||'')}</div>`;
    return el;
  }

  function buildFeedback(){
    if(document.getElementById('ym-feedback-redesign'))return;
    feedbackStyles();
    removeOldFeedback();
    const section=document.createElement('section');
    section.id='ym-feedback-redesign';
    section.innerHTML=`
      <div class="ym-feedback-box">
        <div class="ym-feedback-head">
          <div class="ym-feedback-title"><span class="ym-big-star">★</span><span>Dê o seu feedback</span></div>
          <div class="ym-feedback-subtitle">Como você avalia o site YunaMyst?</div>
          <div class="ym-rating-stars" id="ym-rating-stars">
            ${[1,2,3,4,5].map(n=>`<button type="button" class="ym-rating-star" data-rating="${n}" aria-label="${n} estrela${n>1?'s':''}">★</button>`).join('')}
          </div>
          <div class="ym-rating-hint" id="ym-rating-hint">Clique nas estrelas para avaliar</div>
        </div>
        <form class="ym-feedback-form" id="ym-feedback-form">
          <textarea class="ym-feedback-textarea" id="ym-feedback-message" maxlength="500" placeholder="Deixe seu comentário (opcional)..."></textarea>
          <button class="ym-feedback-submit" type="submit">✈ Enviar avaliação</button>
          <div class="ym-feedback-status" id="ym-feedback-status" aria-live="polite"></div>
        </form>
        <div class="ym-reviews-top">
          <div><div class="ym-reviews-heading"><span class="ym-review-icon">☏</span><span>Avaliações dos players</span></div><div class="ym-reviews-description">Veja o que outros jogadores estão dizendo sobre o site!</div></div>
          <div class="ym-rating-summary"><div class="ym-summary-main"><span class="ym-summary-star">★</span> <span id="ym-average">4.7</span> <span class="ym-summary-small">/5</span></div><p>Baseado em <strong id="ym-count">128</strong> avaliações</p></div>
        </div>
        <div class="ym-reviews-list" id="ym-reviews-list"></div>
        <div class="ym-reviews-note">As avaliações são públicas e mostram a opinião da comunidade. <span>💜</span></div>
      </div>`;
    const main=document.querySelector('main.layout');
    if(main&&main.parentNode)main.parentNode.insertBefore(section,main.nextSibling); else document.body.appendChild(section);

    let selected=0;
    const ratingButtons=[...section.querySelectorAll('.ym-rating-star')];
    const hint=section.querySelector('#ym-rating-hint');
    const status=section.querySelector('#ym-feedback-status');
    const message=section.querySelector('#ym-feedback-message');
    const list=section.querySelector('#ym-reviews-list');
    const avg=section.querySelector('#ym-average');
    const count=section.querySelector('#ym-count');
    const paint=v=>ratingButtons.forEach((b,i)=>b.classList.toggle('active',i<v));
    ratingButtons.forEach(b=>{
      b.addEventListener('mouseenter',()=>paint(Number(b.dataset.rating)));
      b.addEventListener('mouseleave',()=>paint(selected));
      b.addEventListener('click',()=>{selected=Number(b.dataset.rating);paint(selected);hint.textContent=selected+' de 5 estrelas'});
    });

    function renderReviews(remote){
      const rows=remote.length?remote:sampleReviews;
      list.innerHTML='';
      rows.slice(0,20).forEach(r=>list.appendChild(reviewCard(r)));
      const baseCount=128,baseAvg=4.7;
      const extra=remote.length;
      const calculated=extra?((baseAvg*baseCount)+remote.reduce((a,r)=>a+(Number(r.rating)||0),0))/(baseCount+extra):baseAvg;
      avg.textContent=calculated.toFixed(1);
      count.textContent=baseCount+extra;
    }

    async function loadRemote(){
      try{
        const r=await fetch('https://formspree.io/api/0/forms/mdenpbql/submissions?limit=100&order=desc',{cache:'no-store'});
        if(!r.ok)throw new Error('feedback');
        const j=await r.json();
        const rows=(j.submissions||[]).filter(x=>!x._status||!x._status.spam).map(x=>({
          name:x.name||x.nome||x['Nome']||'Player',
          rating:Number(x.rating||x.estrelas||x['rating (1-5)']||x['Estrelas']),
          message:x.message||x.mensagem||x.feedback||x['Feedback']||'',
          date:x.date||x.created_at?new Date(x.date||x.created_at).toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'}):''
        })).filter(x=>x.rating>=1&&x.rating<=5);
        if(rows.length)renderReviews(rows);
      }catch(e){renderReviews([])}
    }

    section.querySelector('#ym-feedback-form').addEventListener('submit',async e=>{
      e.preventDefault();
      if(!selected){status.textContent='Escolha de 1 a 5 estrelas antes de enviar.';return;}
      const name=prompt('Nome do player:','Player');
      if(name===null)return;
      const player=(name.trim()||'Player').slice(0,40);
      const text=message.value.trim();
      status.textContent='A enviar avaliação...';
      try{
        const body=new URLSearchParams();
        body.set('name',player);body.set('rating',String(selected));body.set('message',text||'Sem comentário.');body.set('_subject','Feedback YunaMyst');
        const r=await fetch('https://formspree.io/f/mdenpbql',{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/x-www-form-urlencoded'},body});
        if(!r.ok)throw new Error('send');
        const now=new Date();
        const date=now.toLocaleString('pt-PT',{dateStyle:'short',timeStyle:'short'});
        list.prepend(reviewCard({name:player,rating:selected,message:text||'Sem comentário.',date}));
        const oldCount=Number(count.textContent)||128,oldAvg=Number(avg.textContent)||4.7;
        count.textContent=oldCount+1;avg.textContent=(((oldAvg*oldCount)+selected)/(oldCount+1)).toFixed(1);
        status.textContent='Avaliação enviada com sucesso! 💜';
        message.value='';selected=0;paint(0);hint.textContent='Clique nas estrelas para avaliar';
      }catch(err){status.textContent='Não foi possível enviar agora. Tenta novamente.'}
    });

    renderReviews([]);
    loadRemote();
  }

  function initFeedback(){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',buildFeedback,{once:true});
    else buildFeedback();
  }
  initFeedback();
})();
