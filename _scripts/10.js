
// Tokens: arrastar da lateral, imagem, travar/destravar e excluir
(function(){
  const mapEl=document.querySelector('#map');
  const stageEl=document.querySelector('#stage');
  if(!mapEl||!stageEl)return;
  let tokenSeq=1000;
  const input=document.createElement('input');
  input.type='file'; input.accept='image/*'; input.className='hidden';
  document.body.appendChild(input);
  let imageTarget=null;

  const css=document.createElement('style');
  css.textContent=`
    .token.locked{cursor:not-allowed!important;filter:saturate(.8);outline:2px dashed #df7474;outline-offset:2px}
    .token.hasImage{background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;color:transparent!important;text-shadow:none}
    .token[data-name]:not([data-name=''])::before{content:attr(data-name);position:absolute;left:50%;bottom:calc(100% + 5px);transform:translateX(-50%);padding:2px 6px;border:1px solid #303641;border-radius:5px;background:#101216ee;color:#eef1f5;font:600 11px system-ui,Segoe UI,sans-serif;line-height:1.2;white-space:nowrap;pointer-events:none;z-index:20;text-shadow:none}
    .tokenEditPanel{position:absolute;z-index:95;width:270px;background:#171a20;border:1px solid #555e6d;border-radius:10px;padding:10px;box-shadow:0 12px 35px #000b}
    .tokenEditPanel .rowEdit{display:flex;gap:7px;margin-top:7px}
    .tokenEditPanel .rowEdit .btn{flex:1}
    .tokenEditPanel input{width:100%;margin-top:5px}
    .tokenMenu{position:absolute;z-index:80;min-width:190px;background:#171a20;border:1px solid #555e6d;border-radius:9px;padding:8px;box-shadow:0 10px 30px #000b}
    .tokenMenu button{display:block;width:100%;margin:3px 0;text-align:left}
    .tokenMenu .small{padding:3px 5px}
  `;
  document.head.appendChild(css);

  function closeMenus(){document.querySelectorAll('.tokenMenu').forEach(m=>m.remove())}
  function tokenName(t){return t.title || t.dataset.name || t.textContent.trim() || 'Token'}
  function showMenu(t,e){
    e.preventDefault(); e.stopPropagation(); closeMenus();
    const menu=document.createElement('div'); menu.className='tokenMenu';
    const r=stageEl.getBoundingClientRect();
    menu.style.left=Math.max(8,e.clientX-r.left+8)+'px';
    menu.style.top=Math.max(8,e.clientY-r.top+8)+'px';
    menu.innerHTML='<div class="small"><b>'+tokenName(t)+'</b></div>';
    function menuButton(label, action){
      const b=document.createElement('button');
      b.type='button'; b.className='btn'; b.textContent=label;
      b.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault()});
      b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();action();});
      menu.appendChild(b); return b;
    }
    menuButton('✏️ Editar nome e foto',()=>{openTokenEditor(t,e.clientX,e.clientY);menu.remove()});
    menuButton('🖼️ Colocar/trocar imagem',()=>{imageTarget=t;input.value='';input.click();menu.remove()});
    const sizeRow=document.createElement('div'); sizeRow.className='small'; sizeRow.style.marginTop='5px'; sizeRow.textContent='Tamanho'; menu.appendChild(sizeRow);
    menuButton('➖ Diminuir',()=>{resizeToken(t,.85);});
    menuButton('➕ Aumentar',()=>{resizeToken(t,1.18);});
    menuButton('↔️ Virar horizontal',()=>{t.dataset.flip=t.dataset.flip==='1'?'0':'1';applyTokenTransform(t);});
    menuButton('↺ Girar -45°',()=>{setTokenRotation(t,(Number(t.dataset.rotation)||0)-45);});
    menuButton('↻ Girar +45°',()=>{setTokenRotation(t,(Number(t.dataset.rotation)||0)+45);});
    const lock=document.createElement('button'); lock.className='btn'; lock.textContent=t.dataset.locked==='1'?'🔓 Destravar token':'🔒 Travar token';
    lock.onclick=()=>{t.dataset.locked=t.dataset.locked==='1'?'0':'1';t.classList.toggle('locked',t.dataset.locked==='1');menu.remove()}; menu.appendChild(lock);
    const front=document.createElement('button'); front.className='btn'; front.textContent='⬆️ Trazer para frente';
    front.onclick=()=>{t.style.zIndex=++tokenSeq;menu.remove()}; menu.appendChild(front);
    const back=document.createElement('button'); back.className='btn'; back.textContent='⬇️ Enviar para trás';
    back.onclick=()=>{t.style.zIndex=2;menu.remove()}; menu.appendChild(back);
    if(t.classList.contains('hasImage')){
      const rem=document.createElement('button'); rem.className='btn'; rem.textContent='🖼️ Remover imagem';
      rem.onclick=()=>{t.style.backgroundImage='';t.classList.remove('hasImage');t.style.color='';t.dataset.image='';menu.remove()}; menu.appendChild(rem);
    }
    const del=document.createElement('button'); del.className='btn'; del.textContent='🗑️ Excluir token'; del.onclick=()=>{t.remove();menu.remove()}; menu.appendChild(del);
    stageEl.appendChild(menu);
  }

  function openTokenEditor(t,clientX,clientY){
    document.querySelectorAll('.tokenEditPanel').forEach(x=>x.remove());
    const panel=document.createElement('div');
    panel.className='tokenEditPanel';
    panel.style.position='fixed';
    panel.style.left=Math.max(8,Math.min(window.innerWidth-286,Number(clientX||120)+8))+'px';
    panel.style.top=Math.max(8,Math.min(window.innerHeight-275,Number(clientY||120)+8))+'px';
    panel.style.zIndex='10000';
    panel.addEventListener('pointerdown',e=>e.stopPropagation());
    panel.addEventListener('click',e=>e.stopPropagation());

    const title=document.createElement('div'); title.innerHTML='<b>Editar token</b>'; panel.appendChild(title);
    const label=document.createElement('label'); label.className='small'; label.style.display='block'; label.style.marginTop='8px'; label.textContent='Nome'; panel.appendChild(label);
    const name=document.createElement('input'); name.type='text'; name.placeholder='Nome do token'; name.value=t.dataset.name||t.title||''; panel.appendChild(name);

    const preview=document.createElement('div');
    preview.className='tokenEditPreview';
    preview.style.cssText='margin:9px auto 2px;width:58px;height:58px;border:1px solid #3a424f;border-radius:9px;background:#101216 center/cover no-repeat;display:flex;align-items:center;justify-content:center;color:#eee;font-weight:700';
    preview.textContent=t.classList.contains('hasImage')?'':'T';
    if(t.dataset.image) preview.style.backgroundImage='url("'+t.dataset.image+'")';
    panel.appendChild(preview);

    const row=document.createElement('div'); row.className='rowEdit';
    const photo=document.createElement('button'); photo.type='button'; photo.className='btn'; photo.textContent='🖼️ Foto';
    photo.onclick=e=>{e.preventDefault();e.stopPropagation();imageTarget={token:t,preview};input.value='';input.click()};
    const left=document.createElement('button'); left.type='button'; left.className='btn'; left.textContent='↺ Girar';
    left.onclick=e=>{e.preventDefault();e.stopPropagation();setTokenRotation(t,(Number(t.dataset.rotation)||0)-45);window.rpgForgeSaveCurrentPageNow?.()};
    const right=document.createElement('button'); right.type='button'; right.className='btn'; right.textContent='↻ Girar';
    right.onclick=e=>{e.preventDefault();e.stopPropagation();setTokenRotation(t,(Number(t.dataset.rotation)||0)+45);window.rpgForgeSaveCurrentPageNow?.()};
    row.appendChild(photo); row.appendChild(left); row.appendChild(right); panel.appendChild(row);

    const save=document.createElement('button'); save.type='button'; save.className='btn'; save.style.width='100%'; save.style.marginTop='7px'; save.textContent='Salvar';
    save.onclick=e=>{
      e.preventDefault(); e.stopPropagation();
      const v=name.value.trim();
      t.dataset.name=v; t.title=v||'Token';
      if(!v)t.removeAttribute('data-name');
      window.rpgForgeSaveCurrentPageNow?.();
      closeEditor();
    };
    panel.appendChild(save);
    const close=document.createElement('button'); close.type='button'; close.className='btn'; close.style.width='100%'; close.style.marginTop='7px'; close.textContent='Fechar'; close.onclick=e=>{e.preventDefault();e.stopPropagation();closeEditor()}; panel.appendChild(close);
    document.body.appendChild(panel);
    name.focus(); name.select();
    function closeEditor(){if(panel.isConnected)panel.remove();if(imageTarget&&imageTarget.token===t)imageTarget=null}
  }

  function applyTokenTransform(t){
    const rot=Number(t.dataset.rotation)||0;
    const flip=t.dataset.flip==='1'?-1:1;
    t.style.transform='rotate('+rot+'deg) scaleX('+flip+')';
  }
  function setTokenRotation(t,v){
    t.dataset.rotation=String(((v%360)+360)%360);
    applyTokenTransform(t);
  }
  function resizeToken(t,f){
    const currentW=parseFloat(t.style.width)||t.getBoundingClientRect().width||42;
    const currentH=parseFloat(t.style.height)||t.getBoundingClientRect().height||42;
    const w=Math.max(24,Math.min(180,currentW*f));
    const h=Math.max(24,Math.min(180,currentH*f));
    t.style.width=w+'px';
    t.style.height=h+'px';
    t.dataset.tokenWidth=String(w);
    t.dataset.tokenHeight=String(h);
  }

  input.onchange=()=>{
    const file=input.files&&input.files[0]; if(!file||!imageTarget)return;
    const target=imageTarget;
    const reader=new FileReader();
    reader.onload=()=>{
      const data=reader.result;
      const token=target.token||target;
      token.style.backgroundImage='url("'+data+'")';
      token.classList.add('hasImage');
      token.dataset.image=data;
      token.textContent='';
      if(target.preview){target.preview.style.backgroundImage='url("'+data+'")';target.preview.textContent=''}
      window.rpgForgeSaveCurrentPageNow?.();
      imageTarget=null;
    };
    reader.readAsDataURL(file);
  };

  function prepareToken(t){
    if(!t||t.dataset.tokenEnhanced==='1')return;
    t.dataset.tokenEnhanced='1';
    if(!t.id)t.id='token-'+(++tokenSeq);
    if(!t.dataset.rotation)t.dataset.rotation='0';
    if(!t.dataset.flip)t.dataset.flip='0';
    if(!t.dataset.locked)t.dataset.locked='0';
    if(t.dataset.image){t.style.backgroundImage='url("'+t.dataset.image+'")';t.classList.add('hasImage');t.textContent=''}
    if(t.dataset.name){t.title=t.dataset.name}
    else if(t.title){t.dataset.name=t.title}
    if(t.dataset.tokenWidth)t.style.width=t.dataset.tokenWidth+'px';
    if(t.dataset.tokenHeight)t.style.height=t.dataset.tokenHeight+'px';
    applyTokenTransform(t);
    t.addEventListener('dblclick',e=>{e.preventDefault();e.stopPropagation();openTokenEditor(t,e.clientX,e.clientY)});

    // Arraste independente do sistema global da mesa.
    let moving=false, ox=0, oy=0;
    t.addEventListener('pointerdown',e=>{
      if(e.button!==0 || t.dataset.locked==='1' || !canMoveVisionToken(t))return;
      if(e.target.closest('button'))return;
      e.stopPropagation();
      moving=true;
      const p=pos(e), left=parseFloat(t.style.left)||0, top=parseFloat(t.style.top)||0;
      ox=p[0]-left; oy=p[1]-top;
      t.classList.add('selected');
      document.querySelectorAll('.token').forEach(q=>{if(q!==t)q.classList.remove('selected')});
      t.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    t.addEventListener('pointermove',e=>{
      if(!moving)return;
      const p=pos(e); let nx=p[0]-ox, ny=p[1]-oy;
      const snapBtn=document.querySelector('#snap');
      if(snapBtn?.classList.contains('on')){nx=Math.round(nx/50)*50;ny=Math.round(ny/50)*50}
      t.style.left=nx+'px'; t.style.top=ny+'px';
      updateVisionFocusRing();
      if(typeof window.rpgForgeUpdateFogVision==='function')window.rpgForgeUpdateFogVision();
    });
    const stop=()=>{moving=false};
    t.addEventListener('pointerup',stop); t.addEventListener('pointercancel',stop);
  }

  mapEl.querySelectorAll('.token').forEach(prepareToken);

  document.querySelectorAll('.tokenItem[data-kind]').forEach(item=>{
    item.draggable=true;
    item.addEventListener('dragstart',e=>{e.dataTransfer.effectAllowed='copy';e.dataTransfer.setData('rpg-token-kind',item.dataset.kind);e.dataTransfer.setData('rpg-token-name',(item.textContent||'Token').replace(/PJ|NPC|Monstro/g,'').trim())});
  });

  stageEl.addEventListener('dragover',e=>{if(e.dataTransfer.types.includes('rpg-token-kind')){e.preventDefault();e.dataTransfer.dropEffect='copy'}});
  stageEl.addEventListener('drop',e=>{
    const kind=e.dataTransfer.getData('rpg-token-kind'); if(!kind)return;
    e.preventDefault();
    const name=e.dataTransfer.getData('rpg-token-name')||'Token';
    const p=pos(e);
    const el=document.createElement('div');
    el.className='token '+kind; el.id='token-'+(++tokenSeq); el.title=name; el.dataset.name=name;
    el.textContent=kind==='player'?'P':kind==='npc'?'N':'M';
    el.style.left=(p[0]-21)+'px'; el.style.top=(p[1]-21)+'px'; el.style.zIndex=4;
    mapEl.appendChild(el); prepareToken(el);
    if(typeof logMsg==='function')logMsg('Token '+name+' colocado no mapa.');
  });

  // Bloqueia o menu de clique direito nativo apenas sobre tokens.
  mapEl.addEventListener('contextmenu',e=>{if(e.target.closest('.token'))e.preventDefault()});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('.tokenMenu'))closeMenus()});

  // Reforça o bloqueio durante drag para tokens existentes e novos.
  const obs=new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1){if(n.matches?.('.token'))prepareToken(n);n.querySelectorAll?.('.token').forEach(prepareToken);}})));
  obs.observe(mapEl,{childList:true,subtree:true});
})();
