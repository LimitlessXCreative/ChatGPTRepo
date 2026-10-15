// Convert the existing approved geometry/materials into independently animatable,
// meter-scale meshes. No animation clips, skins, morphs, or pill meshes in the bottle.
const fs=require('fs'),path=require('path');
const base=__dirname,kit=path.join(base,'web-kit');
function read(file){const raw=fs.readFileSync(file),size=raw.readUInt32LE(12);return{g:JSON.parse(raw.subarray(20,20+size)),bin:Buffer.from(raw.subarray(28+size))};}
function write(file,g,bin){const json=Buffer.from(JSON.stringify(g)),padded=Buffer.alloc((json.length+3)&~3,32);json.copy(padded);const binary=Buffer.alloc((bin.length+3)&~3);bin.copy(binary);g.buffers[0].byteLength=bin.length;const out=Buffer.alloc(28+padded.length+binary.length);out.writeUInt32LE(0x46546c67,0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(padded.length,12);out.writeUInt32LE(0x4e4f534a,16);padded.copy(out,20);out.writeUInt32LE(binary.length,20+padded.length);out.writeUInt32LE(0x004e4942,24+padded.length);binary.copy(out,28+padded.length);fs.writeFileSync(file,out);return out.length;}
function compact(g,bin){
 const nodes=[];const nodeMap=new Map();function visit(i){if(nodeMap.has(i))return;nodeMap.set(i,nodes.length);nodes.push(g.nodes[i]);for(const child of g.nodes[i].children||[])visit(child);}for(const i of g.scenes[g.scene||0].nodes)visit(i);
 const meshes=[],materials=[],textures=[],images=[],accessors=[],views=[],chunks=[];let offset=0;
 const maps={mesh:new Map(),material:new Map(),texture:new Map(),image:new Map(),accessor:new Map(),view:new Map()};
 function view(i){if(maps.view.has(i))return maps.view.get(i);const old=g.bufferViews[i],n=views.length;maps.view.set(i,n);const bytes=bin.subarray(old.byteOffset||0,(old.byteOffset||0)+old.byteLength);views.push({...old,buffer:0,byteOffset:offset});chunks.push({offset,bytes});offset=(offset+bytes.length+3)&~3;return n;}
 function accessor(i){if(maps.accessor.has(i))return maps.accessor.get(i);const a=g.accessors[i],n=accessors.length;maps.accessor.set(i,n);accessors.push({...a,bufferView:view(a.bufferView)});return n;}
 function image(i){if(maps.image.has(i))return maps.image.get(i);const a=g.images[i],n=images.length;maps.image.set(i,n);images.push({...a,bufferView:view(a.bufferView)});return n;}
 function texture(i){if(maps.texture.has(i))return maps.texture.get(i);const a=g.textures[i],n=textures.length;maps.texture.set(i,n);textures.push({...a,source:image(a.source)});return n;}
 function material(i){if(maps.material.has(i))return maps.material.get(i);const a=structuredClone(g.materials[i]),n=materials.length;maps.material.set(i,n);function walk(o){if(!o||typeof o!=='object')return;if(Number.isInteger(o.index))o.index=texture(o.index);for(const [key,value]of Object.entries(o))if(key!=='index')walk(value);}walk(a);materials.push(a);return n;}
 function mesh(i){if(maps.mesh.has(i))return maps.mesh.get(i);const a=structuredClone(g.meshes[i]),n=meshes.length;maps.mesh.set(i,n);for(const p of a.primitives){p.material=material(p.material);p.indices=accessor(p.indices);for(const key of Object.keys(p.attributes))p.attributes[key]=accessor(p.attributes[key]);}meshes.push(a);return n;}
 for(const n of nodes){if(n.children)n.children=n.children.map(i=>nodeMap.get(i));if(n.mesh!==undefined)n.mesh=mesh(n.mesh);}
 g.nodes=nodes;g.scenes=[{name:g.scenes[g.scene||0].name,nodes:[0]}];g.scene=0;g.meshes=meshes;g.materials=materials;g.textures=textures;g.images=images;g.accessors=accessors;g.bufferViews=views;g.buffers=[{byteLength:offset}];delete g.animations;
 g.extensionsUsed=[...new Set(materials.flatMap(m=>Object.keys(m.extensions||{})))];const raw=Buffer.alloc(offset);for(const c of chunks)c.bytes.copy(raw,c.offset);return raw;
}
function normalize(g,bin,scale){
 const done=new Set();for(const mesh of g.meshes)for(const p of mesh.primitives){const i=p.attributes.POSITION;if(done.has(i))continue;done.add(i);const a=g.accessors[i],v=g.bufferViews[a.bufferView],start=(v.byteOffset||0)+(a.byteOffset||0);if(a.componentType!==5126)throw Error('Expected float positions');for(let j=0;j<a.count*3;j++){const offset=start+j*4;bin.writeFloatLE(bin.readFloatLE(offset)*scale,offset);}if(a.min)a.min=a.min.map(x=>x*scale);if(a.max)a.max=a.max.map(x=>x*scale);}
 for(const n of g.nodes){if(n.translation)n.translation=n.translation.map(x=>x*scale);n.scale=[1,1,1];}
}
function stats(g,bytes){let triangles=0;for(const n of g.nodes)if(n.mesh!==undefined)for(const p of g.meshes[n.mesh].primitives)triangles+=g.accessors[p.indices].count/3;return{fileBytes:bytes,triangles,meshDrawCalls:g.nodes.filter(n=>n.mesh!==undefined).length,embeddedTextures:g.images.length,animationClips:0,units:'meters'};}
const bottle=read(path.join(base,'model/nzt48-web-lowpoly.glb')),g=bottle.g,u=g.nodes[0].scale[0],find=name=>g.nodes.findIndex(n=>n.name===name);
const body=find('Bottle'),label=find('Label'),cap=find('Cap');if([body,label,cap].some(i=>i<0))throw Error('Missing named parts');
normalize(g,bottle.bin,u);const baseOffset=.08*u;g.nodes[body].translation[1]-=baseOffset;g.nodes[label].translation[1]-=baseOffset;g.nodes[cap].translation[1]-=baseOffset;
g.nodes[body].name='BottleBody';const bottleGroup=g.nodes.length;g.nodes.push({name:'Bottle',translation:[0,0,0],rotation:[0,0,0,1],scale:[1,1,1],children:[body,label],extras:{pivot:'Bottle axis at base',units:'meters'}});
g.nodes[0].name='NZT48Product';g.nodes[0].children=[bottleGroup,cap];g.nodes[0].extras={...g.nodes[0].extras,variant:'PIECE BY PIECE WEB MODEL',units:'meters',animationReady:true,animationClips:0,parts:['Bottle','Cap'],labelArtwork:'Approved supplied label, 60 CAPS',labelFinish:'Matte black with reflective gold foil'};
g.nodes[cap].extras={units:'meters',pivot:'Cap center at underside; twist about local Y',closedPosition:g.nodes[cap].translation.slice(),closedQuaternion:g.nodes[cap].rotation.slice(),screwPitchMeters:.00238,suggestedUnscrewTurns:1.75};
const bodyBin=compact(g,bottle.bin),bodyBytes=write(path.join(kit,'nzt48-bottle-cap.glb'),g,bodyBin);
const pill=read(path.join(base,'model/nzt48-capsule-gold-baked.glb')),p=pill.g;normalize(p,pill.bin,p.nodes[0].scale[0]*2);
p.nodes[0].name='GoldPill';p.nodes[0].extras={units:'meters',pivot:'Capsule center',longAxis:'X',capsuleScale:2,animationClips:0,lighting:'Baked HDR studio illumination'};
for(const n of p.nodes){if(n.name==='Golden_capsule')n.name='Pill';if(n.name.startsWith('Capsule_1'))n.name=n.name.endsWith('_gold')?'PillUpper':'PillLower';if(n!==p.nodes[0])delete n.extras;}
const pillBin=compact(p,pill.bin),pillBytes=write(path.join(kit,'nzt48-gold-pill.glb'),p,pillBin);
const summary={bottleCap:stats(g,bodyBytes),singlePill:stats(p,pillBytes),labelInches:{width:6,height:2},labelFinish:'Matte black + cap-matched gold foil',capClosedPosition:g.nodes.find(n=>n.name==='Cap').translation};fs.writeFileSync(path.join(kit,'model-stats.json'),JSON.stringify(summary,null,2));console.log(summary);
