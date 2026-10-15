const fs = require('fs'), path = require('path'), assert = require('assert/strict');
const base = __dirname;
const input = path.join(base, '../nzt-48-original-3d/web-kit/nzt48-gold-pill.glb');
const raw = fs.readFileSync(input), jsonLength = raw.readUInt32LE(12);
const original = JSON.parse(raw.subarray(20, 20+jsonLength));
const binary = raw.subarray(28+jsonLength);
const positions = [], normals = [], indices = [];
function floats(accessorId) {
  const a = original.accessors[accessorId], v = original.bufferViews[a.bufferView];
  assert.equal(a.componentType, 5126);
  const result=[];
  for (let i=0;i<a.count;i++) for (let k=0;k<3;k++)
    result.push(binary.readFloatLE((v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||12)+k*4));
  return result;
}
for (const mesh of original.meshes) for (const p of mesh.primitives) {
  const vertexOffset=positions.length/3, xyz=floats(p.attributes.POSITION);
  // Keep the approved profile and doubled dimensions, while making the rim
  // smooth enough for polished metal. Repair the original non-unit pole normals.
  const profile=Array.from({length:10},(_,j)=>({y:xyz[j*3+1],r:Math.hypot(xyz[j*3],xyz[j*3+2])}));
  const upper=profile[9].y>0,radialRadius=Math.max(...profile.map(p=>p.r));
  const centerY=upper?profile[1].y:profile[8].y;
  const axialRadius=Math.abs((upper?profile[9].y:profile[0].y)-centerY);
  const segments=48;
  for(let ring=0;ring<=segments;ring++)for(const p of profile){
    const phi=ring/segments*Math.PI*2,x=p.r*Math.sin(phi),z=p.r*Math.cos(phi);
    positions.push(p.y,-x,z);
    const cap=upper?p.y>centerY:p.y<centerY;
    let nx=x,ny=0,nz=z;
    if(cap){nx=x/(radialRadius**2);ny=(p.y-centerY)/(axialRadius**2);nz=z/(radialRadius**2);}
    const length=Math.hypot(nx,ny,nz);assert(length>0);
    normals.push(ny/length,-nx/length,nz/length);
  }
  for(let ring=0;ring<segments;ring++)for(let j=0;j<9;j++){
    const a=vertexOffset+ring*10+j,b=vertexOffset+(ring+1)*10+j;
    if(profile[j].r>1e-10)indices.push(a,b,a+1);
    if(profile[j+1].r>1e-10)indices.push(b,b+1,a+1);
  }
}
const min=[0,1,2].map(k=>Math.min(...positions.filter((_,i)=>i%3===k)));
const max=[0,1,2].map(k=>Math.max(...positions.filter((_,i)=>i%3===k)));
const chunks=[], views=[]; let offset=0;
function append(array,bytes,target){
  const b=Buffer.alloc(array.length*bytes);
  array.forEach((v,i)=>bytes===4?b.writeFloatLE(v,i*4):b.writeUInt16LE(v,i*2));
  const index=views.length;views.push({buffer:0,byteOffset:offset,byteLength:b.length,target});chunks.push({offset,b});offset=(offset+b.length+3)&~3;return index;
}
const pv=append(positions,4,34962),nv=append(normals,4,34962),iv=append(indices,2,34963);
const g={
  asset:{version:'2.0',generator:'NZT-48 uniform PBR gold capsule'},scene:0,
  scenes:[{name:'GoldPill',nodes:[0]}],
  nodes:[{name:'GoldPill',mesh:0,translation:[0,0,0],rotation:[0,0,0,1],scale:[1,1,1],extras:{units:'meters',pivot:'Capsule center',longAxis:'X',capsuleScale:2,lighting:'Dynamic PBR reflections; no baked lighting',animationClips:0}}],
  meshes:[{name:'Gold capsule with center seam',primitives:[{attributes:{POSITION:0,NORMAL:1},indices:2,material:0,mode:4}]}],
  materials:[{name:'Polished uniform gold',pbrMetallicRoughness:{baseColorFactor:[1,.55,.045,1],metallicFactor:1,roughnessFactor:.15},emissiveFactor:[0,0,0],alphaMode:'OPAQUE',doubleSided:false}],
  accessors:[{bufferView:pv,componentType:5126,count:positions.length/3,type:'VEC3',min,max},{bufferView:nv,componentType:5126,count:normals.length/3,type:'VEC3'},{bufferView:iv,componentType:5123,count:indices.length,type:'SCALAR'}],
  bufferViews:views,buffers:[{byteLength:offset}]
};
const bin=Buffer.alloc(offset);chunks.forEach(c=>c.b.copy(bin,c.offset));
const j=Buffer.from(JSON.stringify(g)),jp=Buffer.alloc((j.length+3)&~3,32);j.copy(jp);
const result=Buffer.alloc(28+jp.length+bin.length);
result.writeUInt32LE(0x46546c67,0);result.writeUInt32LE(2,4);result.writeUInt32LE(result.length,8);
result.writeUInt32LE(jp.length,12);result.writeUInt32LE(0x4e4f534a,16);jp.copy(result,20);
result.writeUInt32LE(bin.length,20+jp.length);result.writeUInt32LE(0x004e4942,24+jp.length);bin.copy(result,28+jp.length);
assert.equal(g.materials.length,1);assert(!g.images && !g.textures && !g.extensionsUsed && !g.animations);
assert(!g.meshes[0].primitives[0].attributes.COLOR_0);
assert(Math.abs((min[0]+max[0])/2)<1e-8);
assert(max[0]-min[0]>.016 && max[0]-min[0]<.018);
assert(indices.every(i=>i<positions.length/3));assert(positions.every(Number.isFinite));
for(let i=0;i<normals.length;i+=3)assert(Math.abs(Math.hypot(...normals.slice(i,i+3))-1)<1e-5);
fs.writeFileSync(path.join(base,'nzt48-gold-pill-pbr.glb'),result);
fs.mkdirSync(path.join(base,'review'),{recursive:true});
fs.writeFileSync(path.join(base,'review/nzt48-gold-pill-baked-before.glb'),raw);
const report={passed:true,bytes:result.length,triangles:indices.length/3,vertices:positions.length/3,drawCalls:1,materials:1,embeddedTextures:0,bakedLighting:false,unlitMaterial:false,animations:0,dimensionsMm:max.map((x,i)=>(x-min[i])*1000),units:'meters',longAxis:'X',origin:[0,0,0],scale:2,metalness:1,roughness:.15};
fs.writeFileSync(path.join(base,'verification.json'),JSON.stringify(report,null,2));console.log(report);
