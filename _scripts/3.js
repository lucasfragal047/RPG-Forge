
// Importação, exportação e edição de imagens do mapa
(function(){
  const file=document.querySelector('#mapFile');
  const mapEl=document.querySelector('#map');
  const logEl=document.querySelector('#log');
  let selectedImage=null, zCounter=8;

  const style=document.createElement('style');
  style.textContent=`
    .mapImageObject{position:absolute;z-index:2;cursor:move;user-select:none;touch-action:none;box-shadow:0 0 0 2px transparent}
    .mapImageObject.selected{box-shadow:0 0 0 2px var(--accent),0 0 0 5px #d6a85d33}
    .mapImageObject img{display:block;width:100%;height:100%;object-fit:fill;pointer-events:none;user-select:none}
    .imageEditor{position:fixed;z-index:30;min-width:190px;background:#151922ee;border:1px solid var(--line);border-radius:9px;padding:8px;box-shadow:0 10px 28px #000b;display:grid;gap:5px}
    .imageEditor .title{font-weight:700;font-size:12px;margin-bottom:3px}
    .imageEditor button{background:#242a33;border:1px solid var(--line);color:#fff;border-radius:6px;padding:6px;cursor:pointer;text-align:left}
    .imageEditor button:hover{border-color:var(--accent)}
    .fogEditor{min-width:190px}.fogEditor .fogMoveToggle{border-color:var(--accent)}
    .resizeHandle{position:absolute;width:10px;height:10px;background:var(--accent);border:2px solid #111;border-radius:2px;display:none;z-index:2}
    .mapImageObject.selected .resizeHandle{display:block}
    .rh-nw{left:-6px;top:-6px;cursor:nwse-resize}.rh-ne{right:-6px;top:-6px;cursor:nesw-resize}.rh-sw{left:-6px;bottom:-6px;cursor:nesw-resize}.rh-se{right:-6px;bottom:-6px;cursor:nwse-resize}.rh-n{left:calc(50% - 5px);top:-6px;cursor:ns-resize}.rh-s{left:calc(50% - 5px);bottom:-6px;cursor:ns-resize}.rh-w{left:-6px;top:calc(50% - 5px);cursor:ew-resize}.rh-e{right:-6px;top:calc(50% - 5px);cursor:ew-resize}
  `;
  document.head.appendChild(style);

  function message(t){if(logEl){logEl.innerHTML='<div><b>Sistema:</b> '+t+'</div>'+logEl.innerHTML;logEl.scrollTop=0;}}
  function selectImage(el){
    document.querySelectorAll('.mapImageObject.selected').forEach(x=>x.classList.remove('selected'));
    selectedImage=el; if(el) el.classList.add('selected');
  }
  function removeEditor(){document.querySelectorAll('.imageEditor').forEach(x=>x.remove());}
  function currentScale(){ return (typeof scale==='number' && scale>0) ? scale : 1; }
  function editorFor(el){
    removeEditor();
    if(!el || !el.isConnected) return;
    const box=document.createElement('div'); box.className='imageEditor';
    box.innerHTML='<div class="title">🖼️ Imagem selecionada</div>';
    const add=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=e=>{e.preventDefault();e.stopPropagation();fn();};box.appendChild(b)};
    add('↑ Trazer para frente',()=>{
      const vals=[...mapEl.querySelectorAll('.mapImageObject,.token,.room,.forgeObj,.magicEffect,.spellArea')].map(n=>parseInt(n.style.zIndex)||1);
      const top=Math.max(10,...vals)+1; el.style.zIndex=String(top); zCounter=top; editorFor(el);
    });
    add('↓ Enviar para trás',()=>{
      el.style.zIndex='1'; editorFor(el);
    });
    add('↔ Aumentar largura',()=>{el.style.width=(Math.max(30,parseFloat(el.style.width)||30)+25)+'px'; editorFor(el)});
    add('↔ Diminuir largura',()=>{el.style.width=Math.max(30,(parseFloat(el.style.width)||30)-25)+'px'; editorFor(el)});
    add('↕ Aumentar altura',()=>{el.style.height=(Math.max(30,parseFloat(el.style.height)||30)+25)+'px'; editorFor(el)});
    add('↕ Diminuir altura',()=>{el.style.height=Math.max(30,(parseFloat(el.style.height)||30)-25)+'px'; editorFor(el)});
    add('🗑 Remover imagem',()=>{el.remove();selectedImage=null;removeEditor();});
    document.body.appendChild(box);
    const r=el.getBoundingClientRect(), gap=10;
    let left=r.right+gap, top=r.top;
    if(left+205>window.innerWidth) left=Math.max(8,r.left-215);
    if(top+300>window.innerHeight) top=Math.max(8,window.innerHeight-308);
    box.style.left=left+'px'; box.style.top=top+'px';
  }
  function bindImage(el){
    if(el.dataset.mapImageBound==='1') return;
    el.dataset.mapImageBound='1'; el.style.pointerEvents='auto'; el.style.touchAction='none';
    el.addEventListener('dblclick',e=>{e.preventDefault();e.stopPropagation();selectImage(el);editorFor(el);});
    el.addEventListener('pointerdown',e=>{
      if(e.button!==0 || e.target.classList.contains('resizeHandle')) return;
      e.preventDefault(); e.stopPropagation(); selectImage(el); removeEditor();
      const sx=e.clientX, sy=e.clientY, ox=parseFloat(el.style.left)||0, oy=parseFloat(el.style.top)||0, sc=currentScale();
      const move=ev=>{el.style.left=(ox+(ev.clientX-sx)/sc)+'px';el.style.top=(oy+(ev.clientY-sy)/sc)+'px';};
      const up=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);editorFor(el);};
      window.addEventListener('pointermove',move);window.addEventListener('pointerup',up,{once:true});
    });
    ['nw','n','ne','w','e','sw','s','se'].forEach(c=>{
      const h=document.createElement('span');h.className='resizeHandle rh-'+c;el.appendChild(h);
      h.addEventListener('pointerdown',e=>{
        e.preventDefault();e.stopPropagation();selectImage(el);removeEditor();
        const sx=e.clientX,sy=e.clientY,ow=parseFloat(el.style.width)||100,oh=parseFloat(el.style.height)||100,ol=parseFloat(el.style.left)||0,ot=parseFloat(el.style.top)||0,sc=currentScale();
        const move=ev=>{
          let dx=(ev.clientX-sx)/sc,dy=(ev.clientY-sy)/sc,nw=ow,nh=oh,nl=ol,nt=ot;
          if(c==='e'||c.includes('e')) nw=Math.max(30,ow+dx);
          if(c==='s'||c.includes('s')) nh=Math.max(30,oh+dy);
          if(c==='w'||c.includes('w')){nw=Math.max(30,ow-dx);nl=ol+(ow-nw)}
          if(c==='n'||c.includes('n')){nh=Math.max(30,oh-dy);nt=ot+(oh-nh)}
          el.style.width=nw+'px';el.style.height=nh+'px';el.style.left=nl+'px';el.style.top=nt+'px';
        };
        const up=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);editorFor(el);};
        window.addEventListener('pointermove',move);window.addEventListener('pointerup',up,{once:true});
      });
    });
  }
  function addImage(src,name,w,h,x,y,z){
    const el=document.createElement('div'); el.className='mapImageObject'; el.dataset.imageObject='1'; el.dataset.name=name||'Imagem';
    el.style.left=(x??500)+'px';el.style.top=(y??250)+'px';el.style.width=(w??600)+'px';el.style.height=(h??400)+'px';el.style.zIndex=z||(++zCounter);
    const img=document.createElement('img');img.src=src;img.alt=name||'Imagem do mapa';el.appendChild(img);mapEl.appendChild(el);bindImage(el);selectImage(el);return el;
  }
  // Reanexa o editor às imagens quando o sistema de cenários restaura o HTML do mapa.
  // O HTML pode ser recriado durante a troca de cenário, então os listeners antigos não existem mais.
  window.rpgForgeRebindAfterRemoteState=window.rpgForgeRebindAfterRemoteState||function(){
    mapEl.querySelectorAll('.mapImageObject').forEach(bindImage);
  };
  document.querySelector('#importMap').onclick=()=>file.click();
  document.querySelector('#exportMap').onclick=()=>{
    const objects=[...mapEl.children].filter(e=>!e.classList.contains('grid')&&!e.classList.contains('imageEditor')).map(e=>{
      const o={tag:e.tagName,className:e.className,text:e.textContent,style:e.getAttribute('style'),title:e.getAttribute('title'),item:e.dataset.item||null};
      if(e.dataset.imageObject){o.imageObject=true;o.name=e.dataset.name||'Imagem';o.src=e.querySelector('img')?.src||'';o.left=e.style.left;o.top=e.style.top;o.width=e.style.width;o.height=e.style.height;o.zIndex=e.style.zIndex;}
      return o;
    });
    const data={version:2,name:'Mapa RPG Forge',objects};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mapa-rpg-forge.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  };
  file.onchange=async()=>{
    const f=file.files[0];if(!f)return;
    if(f.type.startsWith('image/')){
      const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>addImage(reader.result,f.name,Math.min(900,img.width),Math.min(700,img.height),400,250,++zCounter);img.src=reader.result};reader.readAsDataURL(f);
    }else if(f.name.toLowerCase().endsWith('.json')){
      try{const data=JSON.parse(await f.text());mapEl.querySelectorAll(':scope > .mapImageObject').forEach(e=>e.remove());(data.objects||[]).forEach(o=>{
        if(o.imageObject&&o.src){addImage(o.src,o.name,parseFloat(o.width)||600,parseFloat(o.height)||400,parseFloat(o.left)||0,parseFloat(o.top)||0,parseInt(o.zIndex)||2);return;}
        const e=document.createElement(o.tag||'div');e.className=o.className||'';e.textContent=o.text||'';if(o.style)e.setAttribute('style',o.style);if(o.title)e.title=o.title;if(o.item)e.dataset.item=o.item;mapEl.appendChild(e);
      });message('Mapa importado com sucesso.');}catch(err){alert('Não foi possível importar este mapa.');}
    }file.value='';
  };
  mapEl.addEventListener('click',e=>{if(e.target===mapEl||e.target.classList.contains('grid')){selectImage(null);removeEditor()}});
})();
