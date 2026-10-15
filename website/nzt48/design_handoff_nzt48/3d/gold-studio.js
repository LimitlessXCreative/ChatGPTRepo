import * as THREE from './vendor/three.module.min.js';

// A reflection environment belongs to the website scene, never to the GLB.
// Its neutral fill keeps the gold visible on every side of a rotating capsule.
export function setupGoldStudio(renderer,scene){
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=.75;
  const width=512,height=256,data=new Float32Array(width*height*4),panels=[];
  function panel(center,w,h,power){
    const c=new THREE.Vector3(...center),n=c.clone().normalize();
    const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),n);
    if(right.lengthSq()<.01)right.set(1,0,0);right.normalize();
    const up=new THREE.Vector3().crossVectors(n,right).normalize();
    panels.push({c,n,right,up,w,h,power});
  }
  panel([-3,2,4],3.2,5,3.5);
  panel([3,1,3],2.3,5,2.6);
  panel([0,2,-4],4,4,2.4);
  panel([0,5,1],5,3,2.8);
  panel([-1,-3,2],5,3,1.2);
  const smooth=x=>{const t=THREE.MathUtils.clamp(x/.22+.5,0,1);return t*t*(3-2*t);};
  const ray=new THREE.Vector3(),hit=new THREE.Vector3();
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const phi=((x+.5)/width-.5)*Math.PI*2,el=((y+.5)/height-.5)*Math.PI;
    ray.set(Math.cos(el)*Math.cos(phi),Math.sin(el),Math.cos(el)*Math.sin(phi));
    let brightness=.68+.12*Math.max(ray.y,0);
    for(const p of panels){const dot=ray.dot(p.n);if(dot<=0)continue;
      hit.copy(ray).multiplyScalar(p.c.length()/dot).sub(p.c);
      brightness+=p.power*smooth(1-Math.abs(hit.dot(p.right))/(p.w*.5))*smooth(1-Math.abs(hit.dot(p.up))/(p.h*.5));
    }
    const i=(y*width+x)*4;data[i]=data[i+1]=data[i+2]=brightness;data[i+3]=1;
  }
  const hdr=new THREE.DataTexture(data,width,height,THREE.RGBAFormat,THREE.FloatType);
  hdr.mapping=THREE.EquirectangularReflectionMapping;hdr.needsUpdate=true;
  const pmrem=new THREE.PMREMGenerator(renderer),target=pmrem.fromEquirectangular(hdr);
  scene.environment=target.texture;hdr.dispose();pmrem.dispose();
  return {texture:target.texture,dispose(){if(scene.environment===target.texture)scene.environment=null;target.dispose();}};
}
