(async function(){
const T=THREE,N=window.NZT,stage=document.getElementById('stage'),params=new URLSearchParams(location.search),capture=params.has('capture');
if(capture)document.body.classList.add('capture');
let renderer;try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});}catch(e){stage.innerHTML='<div class="error">Your browser could not start the 3D preview. Enable hardware acceleration or open this preview in Chrome. The packshot and 3D model are available from the download links.</div>';throw e;}
renderer.setPixelRatio(capture?1:Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.setClearColor(0x000000,0);stage.prepend(renderer.domElement);
const scene=new T.Scene();scene.environment=N.makeEnvironment(renderer);
const camera=new T.PerspectiveCamera(30,1,.05,100);camera.position.set(0,2.4,9.8);
scene.add(new T.HemisphereLight(0xffffff,0x8d8270,.8));
function light(color,intensity,x,y,z,size){const l=new T.DirectionalLight(color,intensity);l.position.set(x,y,z);l.castShadow=true;l.shadow.mapSize.set(size,size);l.shadow.camera.left=-5;l.shadow.camera.right=5;l.shadow.camera.top=7;l.shadow.camera.bottom=-3;l.shadow.bias=-.0004;l.shadow.normalBias=.015;scene.add(l);return l;}
light(0xfff7e9,3,-4,6,5,2048);light(0xe5eafe,1.2,4,4,-1,1024);light(0xffffff,.7,0,5,-4,512);
const product=await N.build();scene.add(product);
const ground=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.23}));ground.rotation.x=-Math.PI/2;ground.position.y=.07;ground.receiveShadow=true;scene.add(ground);
let yaw=-.12,targetYaw=yaw,pitch=.03,targetPitch=pitch,zoom=9.8,auto=false,goal=0,progress=0,last=performance.now(),drag=null,raf=0,view='front';
const input=document.getElementById('reveal'),open=document.getElementById('open'),angle=document.getElementById('angle'),spin=document.getElementById('spin');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function frame(now){const dt=Math.min((now-last)/1000,.05);last=now;const smooth=reduced?1:1-Math.exp(-dt*7);if(auto)targetYaw+=dt*.26;yaw+=(targetYaw-yaw)*smooth;pitch+=(targetPitch-pitch)*smooth;progress+=(goal-progress)*smooth;if(Math.abs(goal-progress)<.0001)progress=goal;N.setOpening(progress);product.rotation.y=yaw;
  const focus=2+progress*.72,dist=zoom*(1+progress*.25);camera.position.set(0,focus+Math.sin(pitch)*dist,Math.cos(pitch)*dist);camera.lookAt(0,focus,0);camera.updateProjectionMatrix();renderer.render(scene,camera);input.value=Math.round(progress*100);angle.textContent=(view==='top'?'TOP':view.toUpperCase())+' / '+String(Math.round(((-yaw*180/Math.PI)%360+360)%360)).padStart(3,'0')+'°';
  raf=0;if(!capture&&(auto||drag||Math.abs(targetYaw-yaw)>.001||Math.abs(targetPitch-pitch)>.001||Math.abs(goal-progress)>.0001))requestRender();}
function requestRender(){if(!raf){last=performance.now();raf=requestAnimationFrame(frame);}}
function resize(){renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/stage.clientHeight;camera.fov=camera.aspect<.75?36:30;camera.updateProjectionMatrix();requestRender();}new ResizeObserver(resize).observe(stage);resize();
N.viewer={renderer,scene,camera,ground,product};
N.renderState=function(name='front',opening=0,width=1200,height=1600,transparent=true){auto=false;progress=goal=opening;N.setOpening(opening);let turn=0;let elev=.07;let dist=9.8;switch(name){case'front-right':turn=-.44;break;case'right':turn=-Math.PI/2;break;case'back':turn=-Math.PI;break;case'left':turn=Math.PI/2;break;case'front-left':turn=.44;break;case'top':elev=1.51;dist=8;break;case'bottom':elev=-1.5;dist=8;break;case'open':turn=-.25;elev=.05;break;case'capsule':break;}
  N.product.rotation.set(0,turn,0);renderer.setSize(width,height,false);camera.aspect=width/height;camera.fov=30;const focus=opening>0?2.72:2;if(opening>0)dist=12.3;camera.position.set(0,focus+Math.sin(elev)*dist,Math.cos(elev)*dist);camera.lookAt(0,focus,0);camera.updateProjectionMatrix();scene.background=transparent?null:new T.Color(0x101110);ground.visible=!transparent;renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png');};
N.renderCapsule=function(width=1600,height=1000){product.visible=false;ground.visible=false;const p=N.capsuleFactory('Golden capsule detail');p.scale.setScalar(10);p.position.y=2;p.rotation.set(.08,.1,-.95);scene.add(p);renderer.setSize(width,height,false);camera.aspect=width/height;camera.fov=30;camera.position.set(0,2.7,10);camera.lookAt(0,2,0);camera.updateProjectionMatrix();renderer.render(scene,camera);const url=renderer.domElement.toDataURL('image/png');scene.remove(p);product.visible=true;return url;};
function setView(v){view=v;auto=false;spin.setAttribute('aria-pressed','false');const turns={front:0,left:Math.PI/2,back:Math.PI,right:-Math.PI/2,top:0};targetYaw=turns[v]??0;targetPitch=v==='top'?1.45:.03;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===v)));requestRender();}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
spin.onclick=()=>{auto=!auto;spin.setAttribute('aria-pressed',String(auto));if(auto){targetPitch=.06;view='rotation';}requestRender();};
open.onclick=()=>{goal=goal>.5?0:1;open.textContent=goal?'Close bottle ↙':'Open bottle ↗';open.setAttribute('aria-pressed',String(goal>0));targetPitch=.03;targetYaw=-.16;view='front';document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view==='front')));requestRender();};
input.oninput=()=>{goal=progress=Number(input.value)/100;open.setAttribute('aria-pressed',String(goal>.5));open.textContent=goal>.5?'Close bottle ↙':'Open bottle ↗';requestRender();};
stage.addEventListener('pointerdown',e=>{if(e.target.closest('button,input,a,label'))return;drag={x:e.clientX,y:e.clientY};auto=false;stage.setPointerCapture(e.pointerId);spin.setAttribute('aria-pressed','false');});
stage.addEventListener('pointermove',e=>{if(!drag)return;targetYaw+=(e.clientX-drag.x)*.008;targetPitch=T.MathUtils.clamp(targetPitch+(e.clientY-drag.y)*.006,-1.45,1.45);drag={x:e.clientX,y:e.clientY};view='rotation';requestRender();});
const stop=()=>{drag=null;requestRender();};stage.addEventListener('pointerup',stop);stage.addEventListener('pointercancel',stop);
stage.addEventListener('wheel',e=>{if(e.target.closest('.controls,.progress'))return;e.preventDefault();zoom=T.MathUtils.clamp(zoom+e.deltaY*.005,7.4,14);requestRender();},{passive:false});
if(capture){N.renderState(params.get('view')||'front',Number(params.get('open')||0),innerWidth,innerHeight,true);}else requestRender();
window.nztReady=true;
})();
