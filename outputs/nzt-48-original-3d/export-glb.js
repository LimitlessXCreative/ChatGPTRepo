/* Self-contained glTF 2.0 exporter for this asset. Embedded PNG, shared geometry,
   PBR materials and named cap/capsule reveal animation. Units: meters. */
(function(N,T){
N.exportGLB=async function(options={}){
  const animate=options.animations!==false;
  if(animate)N.setOpening(0);N.product.rotation.set(0,0,0);N.product.updateMatrixWorld(true);
  const g={asset:{version:'2.0',generator:'Limitless X native product asset builder',copyright:'Limitless X — reference artwork supplied by owner'},scene:0,scenes:[{name:'NZT48 Original',nodes:[0]}],nodes:[],meshes:[],materials:[],accessors:[],bufferViews:[],buffers:[],images:[],textures:[],samplers:[{magFilter:9729,minFilter:9987,wrapS:10497,wrapT:10497}],animations:[]};
  let offset=0;const chunks=[],matMap=new Map(),geoMap=new Map(),nodeMap=new Map();
  function bytes(a,target){const b=a instanceof Uint8Array?a:new Uint8Array(a.buffer,a.byteOffset,a.byteLength);const ix=g.bufferViews.length;g.bufferViews.push({buffer:0,byteOffset:offset,byteLength:b.byteLength,...(target?{target}:{} )});chunks.push({at:offset,data:b});offset+=b.byteLength;offset=(offset+3)&~3;return ix;}
  function accessor(a,size,type,bounds=false,target){const ix=g.accessors.length;const view=bytes(a,target);const d={bufferView:view,componentType:type,count:a.length/size,type:{1:'SCALAR',2:'VEC2',3:'VEC3',4:'VEC4'}[size]};if(bounds){d.min=Array(size).fill(Infinity);d.max=Array(size).fill(-Infinity);for(let i=0;i<a.length;i++){const j=i%size;d.min[j]=Math.min(d.min[j],a[i]);d.max[j]=Math.max(d.max[j],a[i]);}}g.accessors.push(d);return ix;}
  const textureMap=new Map(),usedTextures=new Set();
  N.product.traverse(o=>{if(o.isMesh){if(o.material.map)usedTextures.add(o.material.map);if(o.material.normalMap)usedTextures.add(o.material.normalMap);for(const slot of ['metalnessMap','roughnessMap','specularIntensityMap'])if(o.material[slot])usedTextures.add(o.material[slot]);}});
  for(const tex of usedTextures){
    const source=tex.image;let canvas=source;
    if(!source.toBlob){canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;canvas.getContext('2d').drawImage(source,0,0);}
    const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));
    const ix=g.images.length;g.images.push({name:tex.name||'Embedded product texture',bufferView:bytes(new Uint8Array(await blob.arrayBuffer())),mimeType:'image/png'});g.textures.push({sampler:0,source:ix});textureMap.set(tex,ix);
  }
  function extension(name){g.extensionsUsed??=[];if(!g.extensionsUsed.includes(name))g.extensionsUsed.push(name);}
  function material(m){
    if(matMap.has(m))return matMap.get(m);const ix=g.materials.length,c=m.color;
    const d={name:m.name,pbrMetallicRoughness:{baseColorFactor:[c.r,c.g,c.b,1],metallicFactor:m.metalness??0,roughnessFactor:m.roughness??1}};
    if(m.map)d.pbrMetallicRoughness.baseColorTexture={index:textureMap.get(m.map)};
    if(m.metalnessMap||m.roughnessMap)d.pbrMetallicRoughness.metallicRoughnessTexture={index:textureMap.get(m.metalnessMap||m.roughnessMap)};
    if(m.specularIntensityMap){extension('KHR_materials_specular');d.extensions={...d.extensions,KHR_materials_specular:{specularFactor:m.specularIntensity??1,specularTexture:{index:textureMap.get(m.specularIntensityMap)}}};}
    if(m.userData&&Object.keys(m.userData).length)d.extras=m.userData;
    if(m.normalMap)d.normalTexture={index:textureMap.get(m.normalMap),scale:m.normalScale.x};
    if(m.clearcoat>0){extension('KHR_materials_clearcoat');d.extensions={...d.extensions,KHR_materials_clearcoat:{clearcoatFactor:m.clearcoat,clearcoatRoughnessFactor:m.clearcoatRoughness}};}
    if(m.isMeshBasicMaterial){extension('KHR_materials_unlit');d.extensions={...d.extensions,KHR_materials_unlit:{}};d.extras={...m.userData,toneMapped:false};}
    if(m.side===T.DoubleSide)d.doubleSided=true;g.materials.push(d);matMap.set(m,ix);return ix;
  }
  function geometry(geo,mat){const key=geo.uuid+'_'+mat.uuid;if(geoMap.has(key))return geoMap.get(key);const attrs={};for(const [src,dst,size]of[['position','POSITION',3],['normal','NORMAL',3],['uv','TEXCOORD_0',2]]){const attr=geo.getAttribute(src);if(!attr)continue;const a=new Float32Array(attr.array);if(src==='uv')for(let i=1;i<a.length;i+=2)a[i]=1-a[i];attrs[dst]=accessor(a,size,5126,src==='position',34962);}const p={attributes:attrs,material:material(mat),mode:4};if(geo.index){const idx=geo.index.array;const a=idx instanceof Uint32Array?new Uint32Array(idx):new Uint16Array(idx);p.indices=accessor(a,1,a instanceof Uint32Array?5125:5123,false,34963);}const ix=g.meshes.length;g.meshes.push({name:geo.name||mat.name,primitives:[p]});geoMap.set(key,ix);return ix;}
  function node(o){const ix=g.nodes.length;nodeMap.set(o,ix);const d={name:o.name||'Part',translation:o.position.toArray(),rotation:o.quaternion.toArray(),scale:o.scale.toArray()};if(o===N.product)d.scale=Array(3).fill(N.UNIT_METERS);g.nodes.push(d);if(o.isMesh)d.mesh=geometry(o.geometry,o.material);if(o.children.length)d.children=o.children.map(node);if(o.userData&&Object.keys(o.userData).length)d.extras=o.userData;return ix;}node(N.product);
  if(animate){
  const samplers=[],channels=[],times=new Float32Array(91);for(let i=0;i<times.length;i++)times[i]=i/30;const timeIx=accessor(times,1,5126,true);
  const animated=[N.cap,...N.flying],tracks=animated.map(o=>({o,pos:[],rot:[]}));
  for(let i=0;i<times.length;i++){N.setOpening(i/(times.length-1));for(const tr of tracks){tr.pos.push(...tr.o.position.toArray());tr.rot.push(...tr.o.quaternion.toArray());}}
  for(const tr of tracks){for(const[path,vals,size]of[['translation',tr.pos,3],['rotation',tr.rot,4]]){const s=samplers.length;samplers.push({input:timeIx,output:accessor(new Float32Array(vals),size,5126),interpolation:'LINEAR'});channels.push({sampler:s,target:{node:nodeMap.get(tr.o),path}});}}
  g.animations.push({name:'Open cap and reveal golden capsules',samplers,channels});N.setOpening(0);
  }else delete g.animations;
  g.buffers.push({byteLength:offset});const raw=new Uint8Array(offset);for(const ch of chunks)raw.set(ch.data,ch.at);let json=new TextEncoder().encode(JSON.stringify(g));const jsonSize=(json.length+3)&~3;const padded=new Uint8Array(jsonSize);padded.fill(32);padded.set(json);const total=12+8+jsonSize+8+raw.length,out=new ArrayBuffer(total),v=new DataView(out),u=new Uint8Array(out);v.setUint32(0,0x46546c67,true);v.setUint32(4,2,true);v.setUint32(8,total,true);v.setUint32(12,jsonSize,true);v.setUint32(16,0x4e4f534a,true);u.set(padded,20);v.setUint32(20+jsonSize,raw.length,true);v.setUint32(24+jsonSize,0x004e4942,true);u.set(raw,28+jsonSize);return Array.from(u);
};
})(window.NZT,THREE);
