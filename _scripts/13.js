
(function(){
  if(window.rpgForgePageAutosaveObserver)return; window.rpgForgePageAutosaveObserver=1;
  const map=document.getElementById('map'); if(!map)return; let timer=0;
  const queue=()=>{if(window.rpgForgePageSnapshot && window.rpgForgePageApplying)return; clearTimeout(timer);timer=setTimeout(()=>{if(!window.rpgForgePageApplying)window.rpgForgeSaveCurrentPage?.()},350)};
  new MutationObserver(m=>{if(m.some(x=>x.type==='childList'||x.type==='attributes'))queue()}).observe(map,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class','src','data-locked','data-item','data-obj']});
  document.addEventListener('input',e=>{if(e.target.closest?.('#map,#rpgFogControls,.rpgFogControls'))queue()});
  document.addEventListener('change',e=>{if(e.target.closest?.('#map,.rpgFogControls'))queue()});
})();
