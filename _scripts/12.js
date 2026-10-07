
(function(){
  // Inventário real: armazenamento independente do mapa, com adicionar/remover e quantidade.
  const inventoryKey='rpgForgeInventory';
  let storedInventory=[];
  try{storedInventory=JSON.parse(localStorage.getItem(inventoryKey)||'[]');if(!Array.isArray(storedInventory))storedInventory=[];}catch(e){storedInventory=[]}
  function saveInventory(){localStorage.setItem(inventoryKey,JSON.stringify(storedInventory));}
  function addInventoryItem(name,icon='📦',qty=1){
    name=String(name||'').trim(); if(!name)return; qty=Math.max(1,parseInt(qty)||1);
    const found=storedInventory.find(i=>i.name.toLowerCase()===name.toLowerCase());
    if(found)found.qty+=qty; else storedInventory.push({id:Date.now()+Math.random(),name,icon,qty});
    saveInventory();
  }
  function removeInventoryItem(id,qty=1){
    const item=storedInventory.find(i=>i.id===id); if(!item)return;
    item.qty-=Math.max(1,parseInt(qty)||1); if(item.qty<=0)storedInventory=storedInventory.filter(i=>i.id!==id);
    saveInventory();
  }
  function renderInventory(list){
    list.innerHTML='';
    if(!storedInventory.length){list.innerHTML='<div class="invEmpty">🎒 Inventário vazio<br><span>Adicione uma espada, poção ou qualquer outro item.</span></div>';return;}
    storedInventory.forEach(item=>{
      const row=document.createElement('div');row.className='storedInvItem';
      row.innerHTML='<div class="storedInvMain"><span class="storedInvIcon">'+item.icon+'</span><div><b>'+item.name.replaceAll('<','&lt;')+'</b><div class="small">Quantidade: <strong>'+item.qty+'</strong></div></div></div><div class="storedInvActions"><button class="btn invMinus">−</button><button class="btn invPlus">＋</button><button class="btn invRemove">🗑</button></div>';
      row.querySelector('.invMinus').onclick=()=>{removeInventoryItem(item.id,1);renderInventory(list)};
      row.querySelector('.invPlus').onclick=()=>{addInventoryItem(item.name,item.icon,1);renderInventory(list)};
      row.querySelector('.invRemove').onclick=()=>{storedInventory=storedInventory.filter(i=>i.id!==item.id);saveInventory();renderInventory(list)};
      list.appendChild(row);
    });
  }
  const oldInv=document.querySelector('#inventory');
  if(oldInv)oldInv.onclick=()=>{
    document.querySelectorAll('.inventoryStoragePanel').forEach(q=>q.remove());
    const p=document.createElement('div');p.className='forgePanel inventoryStoragePanel';
    p.style.cssText='position:fixed;z-index:100;right:24px;top:90px;left:auto;transform:none;background:#171a20;border:1px solid #555e6d;border-radius:12px;padding:18px;width:min(440px,calc(100vw - 48px));max-height:78vh;overflow:auto;box-shadow:0 18px 55px #000b';
    p.innerHTML='<button class="btn inventoryClose" style="float:right">✕</button><h2 style="margin:0 0 6px">📦 Inventário</h2><p class="small">Armazene os itens do personagem. A quantidade fica salva mesmo ao fechar o painel.</p><div class="inventoryAddBox"><input class="inventoryName" placeholder="Nome do item (ex.: Espada)"><input class="inventoryIcon" value="📦" maxlength="2" title="Ícone"><input class="inventoryQty" type="number" min="1" value="1" title="Quantidade"><button class="btn inventoryAdd">＋ Adicionar</button></div><div class="inventoryQuick"><button class="btn quickItem" data-name="Espada" data-icon="⚔️">⚔️ Espada</button><button class="btn quickItem" data-name="Poção" data-icon="🧪">🧪 Poção</button><button class="btn quickItem" data-name="Escudo" data-icon="🛡️">🛡️ Escudo</button><button class="btn quickItem" data-name="Moedas" data-icon="🪙">🪙 Moedas</button></div><div class="inventoryStorageList"></div>';
    const list=p.querySelector('.inventoryStorageList');
    const add=()=>{const name=p.querySelector('.inventoryName').value;const icon=p.querySelector('.inventoryIcon').value||'📦';const qty=p.querySelector('.inventoryQty').value;addInventoryItem(name,icon,qty);p.querySelector('.inventoryName').value='';p.querySelector('.inventoryQty').value=1;renderInventory(list)};
    p.querySelector('.inventoryAdd').onclick=add;p.querySelector('.inventoryName').onkeydown=e=>{if(e.key==='Enter')add()};
    p.querySelectorAll('.quickItem').forEach(b=>b.onclick=()=>{addInventoryItem(b.dataset.name,b.dataset.icon,1);renderInventory(list)});
    p.querySelector('.inventoryClose').onclick=()=>p.remove();
    document.body.appendChild(p);renderInventory(list);
  };
})();
