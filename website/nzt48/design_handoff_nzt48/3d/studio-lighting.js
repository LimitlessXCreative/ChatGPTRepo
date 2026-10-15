import * as THREE from './vendor/three.module.min.js';

/** HDR studio softboxes. Share this exact rig with the bottle and capsules. */
export function setupNZTStudio(renderer, scene) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const width=1536,height=768,data=new Float32Array(width*height*4);
  const panels=[];
  function softbox(center,w,h,power,color,softness=.06){
    const c=new THREE.Vector3(...center),n=c.clone().normalize();
    const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),n).normalize();
    const up=new THREE.Vector3().crossVectors(n,right).normalize();
    panels.push({c,n,right,up,w,h,power,color,softness});
  }
  // Photographic product rig: one tall soft key, two crisp vertical strips for glass edges, a gold kicker, a wide overhead box for the cap.
  softbox([-3.2,1.6,4.2],2.6,7,9,[1,.97,.9],.05); // Tall warm key, left-front.
  softbox([-1.2,1.2,5],.35,7,7,[1,1,1],.03); // Thin specular strip, front-left (sharp glass highlight).
  softbox([3.8,1,2.4],.8,7,6,[.86,.92,1],.04); // Cool right edge strip.
  softbox([2.2,2.6,-3.2],1.6,6,7,[1,.8,.46],.07); // Gold kicker, rear-right.
  softbox([0,5.4,.6],5,2.4,10,[1,.99,.96],.06); // Overhead softbox: cap disc and shoulder.
  softbox([-.6,-1.6,3.4],5,1,1.6,[1,.86,.6],.14); // Warm floor bounce.
  const smooth=(x,s)=>{const t=THREE.MathUtils.clamp(x/s+.5,0,1);return t*t*(3-2*t);};
  const ray=new THREE.Vector3(),hit=new THREE.Vector3();
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const phi=((x+.5)/width-.5)*Math.PI*2,el=((y+.5)/height-.5)*Math.PI;
    ray.set(Math.cos(el)*Math.cos(phi),Math.sin(el),Math.cos(el)*Math.sin(phi));
    const rgb=[.07+.04*Math.max(ray.y,0),.072+.04*Math.max(ray.y,0),.082+.045*Math.max(ray.y,0)];
    for(const p of panels){const dot=ray.dot(p.n);if(dot<=0)continue;hit.copy(ray).multiplyScalar(p.c.length()/dot).sub(p.c);
      const a=smooth(1-Math.abs(hit.dot(p.right))/(p.w*.5),p.softness),b=smooth(1-Math.abs(hit.dot(p.up))/(p.h*.5),p.softness),strength=a*b*p.power;
      for(let k=0;k<3;k++)rgb[k]+=strength*p.color[k];
    }
    const i=(y*width+x)*4;data[i]=rgb[0];data[i+1]=rgb[1];data[i+2]=rgb[2];data[i+3]=1;
  }
  const hdr=new THREE.DataTexture(data,width,height,THREE.RGBAFormat,THREE.FloatType);
  hdr.mapping=THREE.EquirectangularReflectionMapping;hdr.needsUpdate=true;
  const pmrem=new THREE.PMREMGenerator(renderer);pmrem.compileEquirectangularShader();
  const target=pmrem.fromEquirectangular(hdr);scene.environment=target.texture;hdr.dispose();pmrem.dispose();
  const lights=[];
  const add=(color,power,xyz)=>{const light=new THREE.DirectionalLight(color,power);light.position.set(...xyz);scene.add(light);lights.push(light);};
  add(0xfff3e0,2.2,[-3,4,5]);add(0xd8e8ff,.5,[4,1,3]);add(0xffc975,3.2,[2,3,-4]);
  const fill=new THREE.HemisphereLight(0xfff4e6,0x0c0a0c,.22);scene.add(fill);lights.push(fill);
  return {environment:target.texture,dispose(){for(const light of lights)scene.remove(light);if(scene.environment===target.texture)scene.environment=null;target.dispose();}};
}

export function applyNZTStudioMaterials(model, environment) {
  model.traverse(object => {
    if (!object.isMesh) return;
    const material=object.material;
    if(environment && !material.isMeshBasicMaterial)material.envMap=environment;
    if (material.name==='Reflective gold cap') {
      material.color.set(0xf2b322);material.metalness=1;material.envMapIntensity=2.6;material.roughness=.16;if('clearcoat' in material){material.clearcoat=.35;material.clearcoatRoughness=.12;}
    } else if (material.name==='Glossy amber-black bottle') {
      material.color.set(0x0a0806);if(material.attenuationColor)material.attenuationColor.set(0x1a1008);if('attenuationDistance' in material)material.attenuationDistance=Math.min(material.attenuationDistance,.04);if('transmission' in material)material.transmission=Math.min(material.transmission,.25);material.envMapIntensity=1.15;material.roughness=Math.min(material.roughness,.08);if('clearcoat' in material){material.clearcoat=1;material.clearcoatRoughness=.06;}if('specularIntensity' in material)material.specularIntensity=1.2;
    } else if (material.name==='Matte black label with gold foil') {
      material.envMapIntensity=2.4;material.roughness=Math.max(material.roughness,.42);
    } else if (material.name==='Matte printed label') {
      material.envMapIntensity=.7;
    } else if (material.name.startsWith('Studio baked amber')) {
      material.toneMapped=false;
    } else if (material.name.startsWith('Studio golden amber')) {
      material.envMapIntensity=.8;
    }
  });
}
