
/* Sistema de clima — overlay animado estilo VTT */
(function(){
  const stage=document.querySelector('#stage');
  if(!stage || document.querySelector('#weatherBtn')) return;
  const style=document.createElement('style');
  style.textContent=`
    .weatherOverlay{position:absolute;inset:0;z-index:8;pointer-events:none;overflow:hidden;display:none}
    .weatherOverlay.active{display:block}
    .weatherShade{position:absolute;inset:0;background:rgba(20,25,35,var(--shade,.04));pointer-events:none}
    .weatherParticle{position:absolute;pointer-events:none;will-change:transform,opacity}
    .weatherRain{width:2px;height:24px;background:linear-gradient(transparent,rgba(190,220,255,.9));transform:rotate(12deg);animation:weatherRain var(--dur) linear infinite;opacity:var(--op,.65)}
    .weatherSnow{width:var(--size,7px);height:var(--size,7px);border-radius:50%;background:rgba(255,255,255,.9);box-shadow:0 0 5px rgba(255,255,255,.55);animation:weatherSnow var(--dur) linear infinite;opacity:var(--op,.85)}
    .weatherAsh{width:5px;height:5px;border-radius:50%;background:#aaa;animation:weatherAsh var(--dur) linear infinite;opacity:.65}
    .weatherDust{width:8px;height:3px;border-radius:50%;background:rgba(194,166,112,.32);filter:blur(1px);animation:weatherDust var(--dur) linear infinite;opacity:.65}
    .weatherFogBank{position:absolute;left:-20%;width:140%;height:38%;background:radial-gradient(ellipse,rgba(220,225,230,.22),transparent 68%);filter:blur(18px);animation:weatherFog 12s ease-in-out infinite alternate}
    .weatherCloud{position:absolute;inset:-10%;background:radial-gradient(ellipse at 30% 15%,rgba(30,35,45,.55),transparent 40%),radial-gradient(ellipse at 70% 20%,rgba(20,25,35,.62),transparent 42%);animation:weatherCloud 18s ease-in-out infinite alternate}
    .weatherSun{position:absolute;right:9%;top:8%;width:110px;height:110px;border-radius:50%;background:radial-gradient(circle,rgba(255,244,178,.98) 0 18%,rgba(255,210,75,.32) 38%,transparent 72%);filter:blur(.5px);animation:weatherSun 3s ease-in-out infinite alternate}
    .weatherLightning{position:absolute;inset:0;background:rgba(235,245,255,0);animation:weatherFlash var(--flash,7s) infinite;mix-blend-mode:screen}.weatherBolt{position:absolute;top:-8%;width:7px;height:125%;opacity:0;filter:drop-shadow(0 0 7px rgba(220,245,255,.95));clip-path:polygon(48% 0,70% 0,57% 28%,78% 28%,35% 64%,48% 64%,18% 100%,29% 61%,8% 61%,43% 27%,25% 27%);background:linear-gradient(90deg,rgba(255,255,255,.25),#fff,rgba(180,225,255,.8));animation:weatherBolt var(--boltDur,850ms) ease-out forwards;z-index:3}.weatherGridFlash{position:absolute;inset:0;background:rgba(245,250,255,.8);opacity:0;z-index:2;pointer-events:none;animation:gridFlash 180ms ease-out forwards;mix-blend-mode:screen}
    .weatherPanel{position:fixed;right:18px;top:70px;width:min(330px,calc(100vw - 36px));z-index:120;background:#171a20ee;border:1px solid #444b57;border-radius:12px;padding:14px;box-shadow:0 18px 55px #000b;backdrop-filter:blur(8px)}
    .weatherPanel h2{margin:0 0 10px;font-size:17px}.weatherGrid{display:grid;grid-template-columns:1fr 1fr;gap:7px}.weatherGrid label{font-size:11px;color:#aeb6c3}.weatherGrid select,.weatherGrid input{margin-top:4px}.weatherActions{display:flex;gap:7px;margin-top:10px}.weatherActions .btn{flex:1}.weatherStatus{margin-top:9px;color:#aeb6c3;font-size:12px}.weatherIntensity{display:flex;align-items:center;gap:8px}.weatherIntensity input{padding:0}
    @keyframes weatherRain{from{transform:translate3d(var(--x,0),-40px,0) rotate(12deg)}to{transform:translate3d(calc(var(--x,0) + var(--wind,90px)),110vh,0) rotate(12deg)}}
    @keyframes weatherSnow{from{transform:translate3d(var(--x,0),-30px,0)}50%{transform:translate3d(calc(var(--x,0) + var(--sway,25px)),50vh,0)}to{transform:translate3d(calc(var(--x,0) + var(--sway2,-10px)),110vh,0)}}
    @keyframes weatherAsh{from{transform:translate3d(var(--x,0),110vh,0) rotate(0)}to{transform:translate3d(calc(var(--x,0) + var(--wind,80px)),-30px,0) rotate(260deg)}}
    @keyframes weatherDust{from{transform:translate3d(-20vw,var(--y,0),0)}to{transform:translate3d(130vw,calc(var(--y,0) + var(--rise,-30px)),0)}}
    @keyframes weatherFog{from{transform:translateX(-7%)}to{transform:translateX(7%)}}
    @keyframes weatherCloud{from{transform:translateX(-3%)}to{transform:translateX(3%)}}
    @keyframes weatherSun{from{transform:scale(.94);opacity:.75}to{transform:scale(1.08);opacity:1}}
    @keyframes weatherFlash{0%,82%,100%{background:rgba(235,245,255,0)}83%{background:rgba(235,245,255,.62)}84%{background:rgba(235,245,255,.05)}85%{background:rgba(235,245,255,.82)}86%{background:rgba(235,245,255,0)}}@keyframes weatherBolt{0%{opacity:0;transform:scaleY(.2) translateY(-10%)}12%{opacity:1}55%{opacity:1}100%{opacity:0;transform:scaleY(1) translateY(0)}}@keyframes gridFlash{0%{opacity:0}25%{opacity:.72}100%{opacity:0}
    @media(prefers-reduced-motion:reduce){.weatherParticle,.weatherFogBank,.weatherCloud,.weatherSun,.weatherLightning,.weatherBolt,.weatherGridFlash{animation:none!important}.weatherLightning{background:rgba(235,245,255,.05)}}
  `;
  document.head.appendChild(style);

  const btn=document.createElement('button');
  btn.id='weatherBtn'; btn.className='btn'; btn.textContent='🌦️ Clima'; btn.title='Abrir sistema de clima';
  const toolsPanel=document.querySelector('#mapToolsPanel');
  if(toolsPanel) toolsPanel.appendChild(btn); else document.querySelector('.toolbar')?.appendChild(btn);

  const overlay=document.createElement('div'); overlay.id='weatherOverlay'; overlay.className='weatherOverlay';
  overlay.innerHTML='<div class="weatherShade"></div><div id="weatherVisual"></div>';
  stage.appendChild(overlay);
  const visual=overlay.querySelector('#weatherVisual');
  let state={type:'clear',intensity:55,wind:45,lightning:true};
  let lightningTimer=null;
  function stopLightning(){if(lightningTimer){clearInterval(lightningTimer);lightningTimer=null;} visual.querySelectorAll('.weatherBolt,.weatherGridFlash').forEach(e=>e.remove());}
  function spawnLightning(){
    if(state.type!=='storm' || !state.lightning || !overlay.classList.contains('active')) return;
    const bolt=document.createElement('div'); bolt.className='weatherBolt';
    bolt.style.left=(6+Math.random()*88)+'%';
    bolt.style.width=(4+Math.random()*7)+'px';
    bolt.style.setProperty('--boltDur',(520+Math.random()*520)+'ms');
    bolt.style.transformOrigin='top center';
    visual.appendChild(bolt);
    const flash=document.createElement('div'); flash.className='weatherGridFlash'; visual.appendChild(flash);
    setTimeout(()=>{bolt.remove();flash.remove();},1300);
    if(Math.random()<0.28){setTimeout(()=>{if(state.type==='storm'&&state.lightning){spawnLightning();}},120+Math.random()*220);}
  }
  function startLightning(){
    stopLightning();
    if(state.type==='storm' && state.lightning){
      spawnLightning();
      lightningTimer=setInterval(()=>spawnLightning(),900+Math.random()*2200);
    }
  }

  const weatherNames={clear:'Limpo',sun:'Sol forte',cloudy:'Nublado',rain:'Chuva',storm:'Tempestade',snow:'Neve',blizzard:'Nevasca',fog:'Névoa',sand:'Tempestade de areia',ash:'Cinzas vulcânicas',magic:'Chuva mágica'};
  const particleCount=()=>Math.max(18,Math.min(180,Math.round(20+state.intensity*1.6)));
  function clearVisual(){visual.innerHTML='';}
  function particle(cls,props={}){const e=document.createElement('i');e.className='weatherParticle '+cls;Object.entries(props).forEach(([k,v])=>e.style.setProperty(k,v));visual.appendChild(e);}
  function build(){
    stopLightning();
    clearVisual(); overlay.classList.toggle('active',state.type!=='clear');
    const shade=state.type==='storm'?.28:state.type==='blizzard'?.16:state.type==='fog'?.12:state.type==='cloudy'?.08:state.type==='ash'?.14:0;
    overlay.querySelector('.weatherShade').style.setProperty('--shade',shade);
    if(state.type==='clear') return;
    if(state.type==='sun') {const s=document.createElement('div');s.className='weatherSun';visual.appendChild(s);}
    if(state.type==='cloudy'||state.type==='storm'||state.type==='rain'||state.type==='snow'||state.type==='blizzard'){const c=document.createElement('div');c.className='weatherCloud';visual.appendChild(c);}
    if(state.type==='fog'){for(let i=0;i<3;i++){const f=document.createElement('div');f.className='weatherFogBank';f.style.top=(12+i*28)+'%';f.style.animationDelay=(-i*3)+'s';visual.appendChild(f);}}
    const n=particleCount();
    if(['rain','storm'].includes(state.type)) for(let i=0;i<n;i++) particle('weatherRain',{'--x':(Math.random()*100)+'vw','--wind':(30+state.wind*2)+'px','--dur':(0.38+Math.random()*0.55)+'s','--op':(.35+state.intensity/120)});
    if(['snow','blizzard'].includes(state.type)) for(let i=0;i<n;i++) particle('weatherSnow',{'--x':(Math.random()*100)+'vw','--sway':(-30+Math.random()*60)+'px','--sway2':(-30+Math.random()*60)+'px','--dur':(state.type==='blizzard'?1.1:2.4)+Math.random()*2.5+'s','--size':(3+Math.random()*7)+'px'});
    if(state.type==='sand') for(let i=0;i<n;i++) particle('weatherDust',{'--y':(Math.random()*100)+'vh','--wind':(80+state.wind*3)+'px','--rise':(-30+Math.random()*60)+'px','--dur':(1.3+Math.random()*1.7)+'s'});
    if(state.type==='ash') for(let i=0;i<n;i++) particle('weatherAsh',{'--x':(Math.random()*100)+'vw','--wind':(-50+state.wind*3)+'px','--dur':(2+Math.random()*4)+'s'});
    if(state.type==='magic') for(let i=0;i<n;i++){const e=document.createElement('i');e.className='weatherParticle';e.textContent=Math.random()>.5?'✦':'✧';e.style.cssText=`left:${Math.random()*100}%;top:-20px;color:#c7a8ff;font-size:${10+Math.random()*14}px;text-shadow:0 0 10px #8f6bff;animation:weatherRain ${1.5+Math.random()*2}s linear infinite;animation-delay:${-Math.random()*3}s;`;visual.appendChild(e)}
    if(state.type==='storm' && state.lightning){const l=document.createElement('div');l.className='weatherLightning';l.style.setProperty('--flash',(5+Math.random()*5)+'s');visual.appendChild(l); startLightning();}
  }
  function openPanel(){
    document.querySelector('.weatherPanel')?.remove();
    const p=document.createElement('div');p.className='weatherPanel';
    p.innerHTML=`<h2>🌦️ Sistema de clima</h2><div class="weatherGrid">
      <label>Tipo<select id="weatherType">${Object.entries(weatherNames).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label>
      <label>Intensidade<div class="weatherIntensity"><input id="weatherIntensity" type="range" min="10" max="100" value="${state.intensity}"><span id="weatherIntensityVal">${state.intensity}%</span></div></label>
      <label>Vento<input id="weatherWind" type="range" min="0" max="100" value="${state.wind}"></label>
      <label style="display:flex;align-items:end;gap:6px"><input id="weatherLightning" type="checkbox" ${state.lightning?'checked':''} style="width:auto"> Relâmpagos</label>
    </div><div class="weatherActions"><button class="btn" id="weatherApply">Aplicar</button><button class="btn" id="weatherClear">☀️ Limpar</button><button class="btn" id="weatherClose">✕</button></div><div class="weatherStatus" id="weatherStatus">Clima atual: ${weatherNames[state.type]}</div>`;
    document.body.appendChild(p);
    p.querySelector('#weatherType').value=state.type;
    p.querySelector('#weatherIntensity').oninput=e=>p.querySelector('#weatherIntensityVal').textContent=e.target.value+'%';
    p.querySelector('#weatherApply').onclick=()=>{state={type:p.querySelector('#weatherType').value,intensity:+p.querySelector('#weatherIntensity').value,wind:+p.querySelector('#weatherWind').value,lightning:p.querySelector('#weatherLightning').checked};build();p.querySelector('#weatherStatus').textContent='Clima atual: '+weatherNames[state.type];logMsg('Clima alterado para '+weatherNames[state.type]+'.');};
    p.querySelector('#weatherClear').onclick=()=>{state={...state,type:'clear'};build();p.querySelector('#weatherStatus').textContent='Clima atual: Limpo';logMsg('Clima removido do mapa.');};
    p.querySelector('#weatherClose').onclick=()=>p.remove();
  }
  btn.onclick=openPanel;
  window.rpgForge=window.rpgForge||{}; window.rpgForge.weather=()=>({...state}); window.rpgForge.setWeather=(type)=>{if(weatherNames[type]){state.type=type;build();}};
  const savedWeather=window.rpgForgePageSnapshot?.weather;
  if(savedWeather&&weatherNames[savedWeather.type]){
    state={type:savedWeather.type,intensity:Number(savedWeather.intensity)||55,wind:Number(savedWeather.wind)||45,lightning:!!savedWeather.lightning};
    build();
  }
})();
