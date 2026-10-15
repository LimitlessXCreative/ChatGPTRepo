/* Web model: smooth normals on sparse geometry, one 3072px embedded label,
   merged bottle parts, three reveal capsules, no hidden capsule pile. */
(function(N,T){
const lathe=(pts,n=64)=>new T.LatheGeometry(pts.map(p=>new T.Vector2(...p)),n);
function add(g,name,geo,mat){const m=new T.Mesh(geo,mat);m.name=name;g.add(m);return m;}
function merge(parts){const positions=[],normals=[],uvs=[],indices=[];let start=0;for(const m of parts){m.updateMatrix();const g=m.geometry.clone().applyMatrix4(m.matrix);positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);uvs.push(...g.attributes.uv.array);for(const i of g.index.array)indices.push(i+start);start+=g.attributes.position.count;}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeBoundingSphere();return g;}
function helix(radius,from,to,turns){const pts=[];for(let i=0;i<=72;i++){const u=i/72,a=u*Math.PI*2*turns;pts.push(new T.Vector3(radius*Math.cos(a),from+(to-from)*u,radius*Math.sin(a)));}return new T.TubeGeometry(new T.CatmullRomCurve3(pts),72,.015,3,false);}
N.buildLowPoly=async function(){
  if(!N.materials)await N.build();
  const original=N.labelCanvas;const texCanvas=document.createElement('canvas');texCanvas.width=3072;texCanvas.height=1024;texCanvas.getContext('2d').drawImage(original,0,0,3072,1024);N.labelCanvas=texCanvas;
  const tex=new T.CanvasTexture(texCanvas);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;
  const black=N.materials.black.clone();black.normalMap=null;black.name='Glossy amber-black bottle';black.color.set(0x160b05);black.roughness=.18;black.clearcoat=.8;black.clearcoatRoughness=.1;
  const gold=N.materials.gold.clone();gold.name='Reflective gold cap';gold.color.set(0xffc43d);gold.roughness=.115;
  // Packed PBR atlas: G=roughness, B=metalness, A=dielectric specular intensity.
  // Gold artwork is foil. Black stock and white print remain matte dielectric.
  const pbrCanvas=document.createElement('canvas');pbrCanvas.width=texCanvas.width;pbrCanvas.height=texCanvas.height;
  const pixels=texCanvas.getContext('2d').getImageData(0,0,texCanvas.width,texCanvas.height);
  const pbrContext=pbrCanvas.getContext('2d'),packed=pbrContext.createImageData(pbrCanvas.width,pbrCanvas.height);
  let foilPixels=0;
  for(let i=0;i<pixels.data.length;i+=4){
    const r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2];
    const coverage=Math.max(0,Math.min(1,(r-b-12)/243,(g-b-12)/230));
    // The supplied yellow spot artwork indicates gold foil, not yellow ink.
    if(coverage>0){pixels.data[i]=Math.round(r*(1-coverage)+255*coverage);pixels.data[i+1]=Math.round(g*(1-coverage)+189*coverage);pixels.data[i+2]=Math.round(b*(1-coverage)+22*coverage);}
    packed.data[i]=255;packed.data[i+1]=Math.round(250-223*coverage);packed.data[i+2]=Math.round(255*coverage);packed.data[i+3]=Math.round(26+229*coverage);
    if(coverage>.95)foilPixels++;
  }
  texCanvas.getContext("2d").putImageData(pixels,0,0);tex.needsUpdate=true;
  pbrContext.putImageData(packed,0,0);N.foilPbrCanvas=pbrCanvas;
  const foilMap=new T.CanvasTexture(pbrCanvas);foilMap.name='Matte black stock and reflective gold foil PBR mask';foilMap.colorSpace=T.NoColorSpace;foilMap.anisotropy=8;
  const label=new T.MeshPhysicalMaterial({name:'Matte black label with gold foil',map:tex,color:0xffffff,metalness:1,roughness:1,metalnessMap:foilMap,roughnessMap:foilMap,specularIntensity:1,specularIntensityMap:foilMap,clearcoat:0,envMapIntensity:3});
  label.userData={substrate:'Matte black',gold:'Reflective metallic foil, matched to gold cap #ffbd16',white:'Matte printed ink',foilRoughness:27/255,stockRoughness:250/255,packedMap:'G roughness / B metalness / A dielectric specular intensity'};
  tex.name='Matte black label albedo with cap-matched gold foil artwork';
  const root=new T.Group();root.name='NZT48_ORIGINAL';root.userData={variant:'WEB LOW POLY',labelDimensions:{widthInches:6,heightInches:2,widthMm:152.4,heightMm:50.8},reference:'User-supplied bottle and capsule photographs; approved-label.png artwork',materialIntent:'Glossy deep amber-black body; matte black label with reflective gold foil; matching reflective gold cap; glossy golden amber capsules with baked shell illumination and HDR reflections',scaleBasis:'6 inch full circumference, no overlap. Bottle dimensions beyond label inferred from reference photographs.'};
  const parts=new T.Group();
  const profile=[[0,.08],[.78,.08],[.91,.105],[.972,.155],[1.004,.23],[1.012,.34],[1.012,2.54],[1.006,2.615],[.993,2.67],[.965,2.724],[.919,2.775],[.85,2.825],[.77,2.865],[.715,2.895],[.689,2.925],[.684,2.965],[.684,3.228],[.672,3.249],[.635,3.249],[.613,3.225],[.613,2.965],[.659,2.853],[.868,2.696],[.944,2.58],[.944,.29],[.854,.22],[0,.22]];
  add(parts,'Bottle body',lathe(profile),black);
  add(parts,'Neck thread',helix(.69,3.015,3.19,1.75),black);
  const mouth=add(parts,'Mouth rim',new T.TorusGeometry(.649,.028,5,64),black);mouth.rotation.x=Math.PI/2;mouth.position.y=3.238;
  const base=add(parts,'Base rim',new T.TorusGeometry(.905,.022,3,64),black);base.rotation.x=Math.PI/2;base.position.y=.105;
  const bottle=add(root,'Bottle',merge(parts.children),black);
  const sleeve=add(root,'Label',new T.CylinderGeometry(1.017,1.017,N.LABEL_HEIGHT,64,1,true),label);sleeve.position.y=1.42;sleeve.rotation.y=-.56*Math.PI*2;
  const cap=new T.Group();cap.name='Cap';cap.position.y=3.155;root.add(cap);
  const goldParts=new T.Group();
  add(goldParts,'Cap shell',lathe([[.707,0],[.738,.009],[.752,.028],[.756,.075],[.756,.477],[.751,.506],[.735,.525],[.68,.534],[0,.534],[0,.475],[.657,.475],[.703,.451],[.71,.05],[.707,0]]),gold);
  add(goldParts,'Cap inside thread',helix(.698,.09,.39,2),gold);
  add(cap,'Gold cap',merge(goldParts.children),gold);
  const liner=add(cap,'Cap liner',new T.CylinderGeometry(.652,.652,.013,24),new T.MeshStandardMaterial({name:'Cap liner',color:0xf0e9d6,roughness:1}));liner.position.y=.459;
  const r=.058,half=.115,lowerPts=[];for(let i=0;i<=8;i++){const a=-Math.PI/2+i/8*Math.PI/2;lowerPts.push([Math.max(0,r*Math.cos(a)),-half+r*Math.sin(a)]);}lowerPts.push([r,0]);const upperPts=[[r*1.024,-.006],[r*1.024,half]];for(let i=1;i<=8;i++){const a=i/8*Math.PI/2;upperPts.push([Math.max(0,r*1.024*Math.cos(a)),half+r*Math.sin(a)]);}const lowerGeo=lathe(lowerPts,24),upperGeo=lathe(upperPts,24);
  const upper=N.bakeCapsuleMaterial(upperGeo,'upper shell');
  const lower=N.bakeCapsuleMaterial(lowerGeo,'lower shell',1);
  N.webCapsuleFactory=function(){const c=new T.Group();c.name='Golden_capsule';c.scale.setScalar(2);add(c,'Gold_upper_shell',upperGeo,upper);add(c,'Gold_lower_shell',lowerGeo,lower);c.userData={capsuleScale:2,lighting:'Baked shell illumination and HDR specular reflections',color:'Gold'};return c;};
  const flying=[];for(let i=0;i<3;i++){const p=new T.Group();p.name='Capsule_'+(i+1);p.scale.setScalar(2);add(p,'Capsule_'+(i+1)+'_gold',upperGeo,upper);add(p,'Capsule_'+(i+1)+'_amber',lowerGeo,lower);p.userData.closed=[(i-1)*.13,2.65+i*.08,.05];p.userData.open=[-.42+i*.42,3.58+i*.36,.12+i*.07];p.userData.openRotation=[.2+i*.2,.3+i*.5,-.8+i*.55];root.add(p);flying.push(p);}
  N.product=root;N.cap=cap;N.flying=flying;N.materials={black,gold,labelMat:label,capsuleMat:upper};N.setOpening(0);
  let triangles=0,vertices=0,drawCalls=0;const unique=new Set();root.traverse(o=>{if(o.isMesh){drawCalls++;triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;if(!unique.has(o.geometry)){vertices+=o.geometry.attributes.position.count;unique.add(o.geometry);}}});N.lowPolyStats={triangles,uniqueVertices:vertices,drawCalls,textureWidth:3072,textureHeight:1024,insideCapsules:0,revealCapsules:3,capsuleScale:2,capsuleLighting:'Baked shell illumination + PBR studio reflections',bottleFinish:'Glossy deep amber-black',labelFinish:{stock:"Matte black",gold:"Reflective gold foil",goldColor:"#ffbd16",foilPixels,artworkSource:N.labelSource},labelInches:{width:6,height:2}};return root;
};
})(window.NZT,THREE);
