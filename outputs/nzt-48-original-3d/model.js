/* Native, fully modeled product geometry. Label typography is deterministic,
   using the project's original vector NZT mark and original Limitless logo. */
window.NZT = {};
(function(N, T) {
  N.UNIT_METERS = .1524 / (2 * Math.PI * 1.017);
  N.LABEL_HEIGHT = .0508 / N.UNIT_METERS;
  const GOLD = '#ffbd16', WHITE = '#eeeee7', BLACK = '#080808';
  const loadImage = src => new Promise((resolve,reject) => { const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('Cannot load '+src));i.src=src; });
  function text(c,s,x,y,size=28,color=WHITE,weight=400){c.fillStyle=color;c.font=`${weight} ${size}px Geist, Arial, sans-serif`;c.fillText(s,x,y);}
  function spaced(c,s,x,y,size,spacing,color=WHITE){c.font=`500 ${size}px Geist, Arial, sans-serif`;c.fillStyle=color;for(const ch of s){c.fillText(ch,x,y);x+=c.measureText(ch).width+spacing;}}
  function wrap(c,s,x,y,width,size=26,leading=36,weight=400){c.font=`${weight} ${size}px Geist, Arial, sans-serif`;c.fillStyle=WHITE;let line='';for(const w of s.split(' ')){const next=line?line+' '+w:w;if(c.measureText(next).width>width&&line){c.fillText(line,x,y);y+=leading;line=w;}else line=next;}if(line){c.fillText(line,x,y);y+=leading;}return y;}
  function canvas(w,h){const a=document.createElement('canvas');a.width=w;a.height=h;return a;}
  N.makeLabel = async function(){
    const source=await loadImage('references/approved-label.png');
    // Source has 78 px bleed outside the 3600 x 1200 px, 6 x 2 inch dieline.
    // Keep the owner's artwork intact; do not reconstruct its typography/copy.
    const a=canvas(3600,1200);a.getContext('2d').drawImage(source,78,78,3600,1200,0,0,3600,1200);
    const texture=new T.CanvasTexture(a);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;
    N.labelCanvas=a;N.labelSource={file:'references/approved-label.png',crop:[78,78,3600,1200],capsulesPrinted:60};return texture;
  };
  function lathe(points,segments=128){return new T.LatheGeometry(points.map(p=>new T.Vector2(p[0],p[1])),segments);}
  function mesh(parent,name,geometry,material){const m=new T.Mesh(geometry,material);m.name=name;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function smoothProfile(ctrl,steps=8){const curve=new T.SplineCurve(ctrl.map(p=>new T.Vector2(p[0],p[1])));return curve.getPoints((ctrl.length-1)*steps).map(p=>[Math.max(.0001,p.x),p.y]);}
  function helix(radius,from,to,turns){const pts=[];for(let i=0;i<=360;i++){const t=i/360,ang=t*Math.PI*2*turns;pts.push(new T.Vector3(radius*Math.cos(ang),from+(to-from)*t,radius*Math.sin(ang)));}return new T.TubeGeometry(new T.CatmullRomCurve3(pts),360,.018,8,false);}
  N.build = async function(){
    const label=await N.makeLabel(),product=new T.Group();product.name='NZT48_ORIGINAL';
    product.userData={version:'30 capsules · revised reference bottle',reference:'references/bottle-shape-master.png',materialReference:'references/bottle-material-master.png',labelDimensions:{widthInches:6,heightInches:2,widthMm:152.4,heightMm:50.8},dimensions:'Scale anchored to 2 x 6 inch full-wrap label. Other bottle proportions derived from photographs; confirm overlap and manufacturing dimensions.',materialIntent:'Glossy deep amber-black body, matte charcoal label, reflective gold cap, golden amber gelatin capsules.'};
    const grain=canvas(512,512),gc=grain.getContext('2d'),pixels=gc.createImageData(512,512);let seed=48;for(let i=0;i<pixels.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;pixels.data[i]=128+(seed%19)-9;seed=(seed*1664525+1013904223)>>>0;pixels.data[i+1]=128+(seed%19)-9;pixels.data[i+2]=254;pixels.data[i+3]=255;}gc.putImageData(pixels,0,0);N.normalCanvas=grain;const normal=new T.CanvasTexture(grain);normal.wrapS=normal.wrapT=T.RepeatWrapping;
    const black=new T.MeshPhysicalMaterial({name:'Glossy amber-black bottle',color:0x1b1009,roughness:.13,metalness:0,clearcoat:.9,clearcoatRoughness:.08,envMapIntensity:1,normalMap:normal,normalScale:new T.Vector2(.025,.025)});
    const gold=new T.MeshStandardMaterial({name:'Reflective gold cap',color:0xf0c460,roughness:.2,metalness:1,envMapIntensity:1.25});
    const inner=new T.MeshStandardMaterial({name:'Cap interior gold',color:0x987331,roughness:.4,metalness:.85});
    const capsuleMat=new T.MeshPhysicalMaterial({name:'Golden capsule upper shell',color:0xf1b331,roughness:.22,metalness:0,clearcoat:.4,clearcoatRoughness:.2,envMapIntensity:.85});
    const capsuleLowerMat=capsuleMat.clone();capsuleLowerMat.name='Amber capsule lower shell';capsuleLowerMat.color.set(0xdf991c);
    const labelMat=new T.MeshStandardMaterial({name:'Matte printed label',map:label,roughness:.95,metalness:0,envMapIntensity:.38,normalMap:normal,normalScale:new T.Vector2(.08,.08)});
    const body=new T.Group();body.name='Bottle';product.add(body);
    // Revised from the user's hand-held product photograph: compact shoulder,
    // shorter exposed neck, reference cap-to-body ratio, substantial rolled base.
    const outer=smoothProfile([[.001,.08],[.78,.08],[.94,.12],[1,.22],[1.012,.34],[1.012,2.55],[1.002,2.64],[.966,2.74],[.85,2.85],[.715,2.91],[.684,2.97],[.684,3.23],[.672,3.25]]);
    const inside=[[.62,3.25],[.613,3.20],[.613,2.96],[.66,2.86],[.87,2.70],[.944,2.58],[.944,.29],[.85,.22],[.001,.22]];
    mesh(body,'Bottle hollow body',lathe([...outer,...inside],160),black);
    mesh(body,'Neck screw thread',helix(.69,3.015,3.19,1.75),black);
    const lip=mesh(body,'Mouth rim',new T.TorusGeometry(.649,.032,12,128),black);lip.rotation.x=Math.PI/2;lip.position.y=3.238;
    const baseRing=mesh(body,'Molded base rim',new T.TorusGeometry(.905,.028,10,128),black);baseRing.rotation.x=Math.PI/2;baseRing.position.y=.105;
    // Rotate UV seam to the rear-left so front artwork lands centrally at z+.
    const sleeve=mesh(body,'Wrap label',new T.CylinderGeometry(1.017,1.017,N.LABEL_HEIGHT,192,1,true),labelMat);sleeve.position.y=1.42;sleeve.rotation.y=-.19*Math.PI*2;
    const cap=new T.Group();cap.name='Cap';cap.position.y=3.155;product.add(cap);
    const capProfile=smoothProfile([[.707,0],[.738,.008],[.753,.025],[.756,.075],[.756,.477],[.751,.506],[.736,.524],[.68,.534],[.001,.534]]);
    const capInner=[[.001,.475],[.657,.475],[.704,.451],[.71,.05],[.707,0]];
    mesh(cap,'Gold cap shell',lathe([...capProfile,...capInner],160),gold);
    mesh(cap,'Cap internal screw thread',helix(.698,.09,.39,2.2),inner);
    const liner=mesh(cap,'Cap inner liner',new T.CylinderGeometry(.652,.652,.014,96),new T.MeshStandardMaterial({name:'Cap liner ivory',color:0xf0e9d6,roughness:.98}));liner.position.y=.459;
    const topRim=mesh(cap,'Gold cap top bevel',new T.TorusGeometry(.714,.01,8,128),gold);topRim.rotation.x=Math.PI/2;topRim.position.y=.519;
    const capsuleGeometry=[];
    function capsule(name){const g=new T.Group();g.name=name;
      const r=.058,half=.115;let p=[];for(let i=0;i<=16;i++){const ang=-Math.PI/2+i/16*Math.PI/2;p.push([Math.max(.00001,r*Math.cos(ang)),-half+r*Math.sin(ang)]);}p.push([r,0]);
      const lower=mesh(g,name+' lower shell',capsuleGeometry[0]||(capsuleGeometry[0]=lathe(p,32)),capsuleLowerMat);
      p=[[r*1.024,-.006],[r*1.024,half]];for(let i=1;i<=16;i++){const ang=i/16*Math.PI/2;p.push([Math.max(.00001,r*1.024*Math.cos(ang)),half+r*Math.sin(ang)]);}mesh(g,name+' upper shell',capsuleGeometry[1]||(capsuleGeometry[1]=lathe(p,32)),capsuleMat);
      const seam=mesh(g,name+' seam',capsuleGeometry[2]||(capsuleGeometry[2]=new T.TorusGeometry(r*1.015,.002,6,32)),capsuleMat);seam.rotation.x=Math.PI/2;return g;}
    const contents=new T.Group();contents.name='Capsules inside';product.add(contents);
    let rng=481;const rand=()=>{rng=(rng*1664525+1013904223)>>>0;return rng/4294967296;};
    for(let i=0;i<27;i++){const p=capsule('Inside capsule '+String(i+1).padStart(2,'0'));const a=rand()*Math.PI*2,rad=Math.sqrt(rand())*.5;p.position.set(Math.cos(a)*rad,2.5+rand()*.35,Math.sin(a)*rad);p.rotation.set(rand()*Math.PI,rand()*Math.PI,rand()*Math.PI);contents.add(p);}
    const flying=[];for(let i=0;i<3;i++){const p=capsule('Reveal capsule '+(i+1));p.scale.setScalar(2);product.add(p);p.userData.closed=[(i-1)*.13,2.65+i*.08,.05];p.userData.open=[-.42+i*.42,3.58+i*.36,.12+i*.07];p.userData.openRotation=[.2+i*.2,.3+i*.5,-.8+i*.55];flying.push(p);}
    N.product=product;N.cap=cap;N.flying=flying;N.capsuleFactory=capsule;N.materials={black,gold,capsuleMat,labelMat};N.setOpening(0);return product;
  };
  N.setOpening=function(progress){N.opening=progress;const twist=T.MathUtils.smoothstep(progress,0,.4),rise=T.MathUtils.smoothstep(progress,.17,.8),reveal=T.MathUtils.smoothstep(progress,.45,1);N.cap.position.set(rise*.25,3.155+rise*1.57,-rise*.17);N.cap.rotation.set(rise*.08,twist*Math.PI*3.8,rise*-.14);N.flying.forEach((p,i)=>{p.position.fromArray(p.userData.closed).lerp(new T.Vector3().fromArray(p.userData.open),reveal);p.rotation.set(...p.userData.openRotation.map(v=>v*reveal));});};
  N.makeEnvironment=function(renderer){const s=new T.Scene();s.background=new T.Color(0x777777);const plane=(w,h,x,y,z,color,rotY=0)=>{const p=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color,side:T.DoubleSide}));p.position.set(x,y,z);p.rotation.y=rotY;s.add(p);return p;};plane(3,9,-4,3,4,0xffffff,.7);plane(2.5,7,4,2,3,0xe0e4f0,-.8);plane(7,4,0,7,0,0xffffff).rotation.x=Math.PI/2;plane(8,8,0,1,-7,0x222222);const pm=new T.PMREMGenerator(renderer);const target=pm.fromScene(s,.05);pm.dispose();return target.texture;};
})(window.NZT,THREE);
