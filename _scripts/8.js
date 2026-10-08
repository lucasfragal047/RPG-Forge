
// PATCH: PV com valor atual/máximo independentes e CA com modificador separado.
(function(){
  const style=document.createElement('style');
  style.textContent=`
    .statEditor{display:flex;align-items:center;justify-content:flex-end;gap:5px;min-width:145px}
    .statEditor input{width:52px!important;text-align:center;padding:5px 4px}
    .statEditor .sep{color:#9ca5b3;font-weight:700}
    .statEditor .mod{width:58px!important}
  `;
  document.head.appendChild(style);

  function numberInput(value, cls){
    const i=document.createElement('input');
    i.type='number'; i.value=value; i.className=cls||'';
    i.addEventListener('click',e=>e.stopPropagation());
    i.addEventListener('dblclick',e=>e.stopPropagation());
    return i;
  }

  function setupStats(root){
    if(!root) return;
    root.querySelectorAll('.row').forEach(row=>{
      const label=row.querySelector('span:first-child');
      const value=row.querySelector('span:last-child');
      if(!label||!value||value.dataset.statEditor==='1') return;
      const name=label.textContent.trim();
      const raw=value.textContent.trim();

      if(name==='PV'){
        const m=raw.match(/^(-?\d+)\s*\/\s*(-?\d+)/);
        if(!m) return;
        const wrap=document.createElement('div'); wrap.className='statEditor';
        const cur=numberInput(m[1],'hpCurrent');
        const sep=document.createElement('span'); sep.className='sep'; sep.textContent='/';
        const max=numberInput(m[2],'hpMax');
        wrap.append(cur,sep,max); value.replaceWith(wrap);
        const update=()=>{
          let c=Math.max(0,Number(cur.value)||0), mx=Math.max(1,Number(max.value)||1);
          if(c>mx)c=mx;
          cur.value=c; max.value=mx;
          const bar=root.querySelector('.hpbar i');
          if(bar)bar.style.width=Math.max(0,Math.min(100,c/mx*100))+'%';
        };
        cur.addEventListener('input',update); max.addEventListener('input',update);
        value.dataset.statEditor='1';
      }

      if(name==='CA'){
        const m=raw.match(/^(-?\d+)(?:\s*([+-])\s*(\d+))?/);
        if(!m) return;
        const wrap=document.createElement('div'); wrap.className='statEditor';
        const ac=numberInput(m[1],'acBase');
        const sign=document.createElement('select');
        sign.innerHTML='<option value="+">+</option><option value="-">−</option>';
        sign.style.width='38px'; sign.style.padding='5px 2px';
        const mod=numberInput(m[3]||'0','mod');
        if(m[2]) sign.value=m[2];
        wrap.append(ac,sign,mod); value.replaceWith(wrap);
        value.dataset.statEditor='1';
      }
    });
  }

  function init(){
    setupStats(document.querySelector('#selected'));
    document.querySelectorAll('.forgeStat').forEach(setupStats);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
