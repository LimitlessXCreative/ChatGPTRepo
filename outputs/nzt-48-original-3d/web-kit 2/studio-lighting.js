import * as THREE from 'three';

/** HDR studio softboxes. Share this exact rig with the bottle and capsules. */
export function setupNZTStudio(renderer, scene) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const width=1024,height=512,data=new Float32Array(width*height*4);
  const panels=[];
  function softbox(center,w,h,power,color,softness=.06){
    const c=new THREE.Vector3(...center),n=c.clone().normalize();
    const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),n).normalize();
    const up=new THREE.Vector3().crossVectors(n,right).normalize();
    panels.push({c,n,right,up,w,h,power,color,softness});
  }
  softbox([-3.4,2,4],3.5,6,6,[1,.96,.88],.07); // Broad warm-white key.
  softbox([3.6,1.5,2],1.2,5.5,4,[.8,.9,1],.08); // Clean vertical edge.
  softbox([1.5,3,-3],2,5,6,[1,.79,.43],.09); // Gold rear rim.
  softbox([0,5,1],4,2,7,[1,1,1],.1); // Cap and shoulder softbox.
  softbox([-1,-1,3],4,1.3,1.1,[1,.84,.57],.18); // Low bounce card.
  const smooth=(x,s)=>{const t=THREE.MathUtils.clamp(x/s+.5,0,1);return t*t*(3-2*t);};
  const ray=new THREE.Vector3(),hit=new THREE.Vector3();
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const phi=((x+.5)/width-.5)*Math.PI*2,el=((y+.5)/height-.5)*Math.PI;
    ray.set(Math.cos(el)*Math.cos(phi),Math.sin(el),Math.cos(el)*Math.sin(phi));
    const rgb=[.16,.17,.19];
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
  add(0xfff6e8,2.5,[-3,4,5]);add(0xd8e8ff,.65,[4,1,3]);add(0xffce80,2.8,[2,3,-4]);
  const fill=new THREE.HemisphereLight(0xffffff,0x161018,.35);scene.add(fill);lights.push(fill);
  return {environment:target.texture,dispose(){for(const light of lights)scene.remove(light);if(scene.environment===target.texture)scene.environment=null;target.dispose();}};
}

export function applyNZTStudioMaterials(model, environment) {
  model.traverse(object => {
    if (!object.isMesh) return;
    const material=object.material;
    if(environment && !material.isMeshBasicMaterial)material.envMap=environment;
    if (material.name==='Reflective gold cap') {
      material.color.set(0xffbd16);material.envMapIntensity=3;material.roughness=.105;
    } else if (material.name==='Glossy amber-black bottle') {
      material.envMapIntensity=.72;
    } else if (material.name==='Matte black label with gold foil') {
      material.envMapIntensity=3;
    } else if (material.name==='Matte printed label') {
      material.envMapIntensity=.7;
    } else if (material.name.startsWith('Studio baked amber')) {
      material.toneMapped=false;
    } else if (material.name.startsWith('Studio golden amber')) {
      material.envMapIntensity=.8;
    }
  });
}
