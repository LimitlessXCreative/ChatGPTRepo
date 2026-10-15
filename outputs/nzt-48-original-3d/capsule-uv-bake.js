/* Bake the actual Three.js PBR shader under the same HDR softboxes into capsule UVs.
   This is a rendered illumination bake, rather than drawing reflection stripes. */
(function(N,T){
N.bakeStudioCapsules=async function(V){
  const originals=new Map();N.flying[0].traverse(o=>{if(o.isMesh)originals.set(o.material,o.geometry);});
  const baked=new Map(),size=new T.Vector2();V.renderer.getSize(size);
  for(const [original,source] of originals){
    const geometry=source.clone(),uv=geometry.attributes.uv,index=geometry.index;
    // Keep the UV raster front-facing without altering the surface normals.
    for(let i=0;i<index.count;i+=3){const a=index.getX(i),b=index.getX(i+1),c=index.getX(i+2);const area=(uv.getX(b)-uv.getX(a))*(uv.getY(c)-uv.getY(a))-(uv.getY(b)-uv.getY(a))*(uv.getX(c)-uv.getX(a));
      if(area<0){index.setX(i+1,c);index.setX(i+2,b);}
    }
    const material=original.clone();material.side=T.FrontSide;
    material.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\ngl_Position = vec4(uv * 2.0 - 1.0, 0.0, 1.0);');};
    material.customProgramCacheKey=()=> 'NZT48_capsule_uv_bake';
    const scene=new T.Scene();scene.environment=V.scene.environment;
    for(const o of V.scene.children)if(o.isLight)scene.add(o.clone());
    const mesh=new T.Mesh(geometry,material);mesh.scale.setScalar(2);scene.add(mesh);
    const camera=new T.PerspectiveCamera(30,2,.01,10);camera.position.set(0,0,2);camera.lookAt(0,0,0);
    V.renderer.setSize(1024,512,false);V.renderer.render(scene,camera);
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const context=canvas.getContext('2d');context.drawImage(V.renderer.domElement,0,0);
    const front=context.getImageData(0,0,1024,512);
    camera.position.z=-2;camera.lookAt(0,0,0);V.renderer.render(scene,camera);context.drawImage(V.renderer.domElement,0,0);
    const rear=context.getImageData(0,0,1024,512);
    for(let y=0;y<512;y++)for(let x=0;x<1024;x++){const cosine=Math.cos((x+.5)/1024*Math.PI*2),weight=T.MathUtils.smoothstep(cosine,-.15,.15),i=(y*1024+x)*4;for(let k=0;k<3;k++)front.data[i+k]=Math.round(front.data[i+k]*weight+rear.data[i+k]*(1-weight));front.data[i+3]=255;}
    context.putImageData(front,0,0);
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;texture.name='HDR studio PBR illumination bake '+original.name;
    const result=new T.MeshBasicMaterial({name:original.name.replace('Studio golden amber','Studio baked amber'),map:texture,color:0xffffff,toneMapped:false});
    result.userData={lighting:'Actual PBR studio shader baked to UV texture',bakeResolution:[1024,512],toneMapped:false};baked.set(original,result);
    material.dispose();geometry.dispose();
  }
  for(const capsule of N.flying)capsule.traverse(o=>{if(o.isMesh&&baked.has(o.material))o.material=baked.get(o.material);});
  N.webCapsuleFactory=function(){const group=N.flying[0].clone();group.name='Golden_capsule';group.position.set(0,0,0);group.rotation.set(0,0,0);group.userData={capsuleScale:2,lighting:'UV baked HDR studio illumination'};return group;};
  N.lowPolyStats.capsuleLighting='UV baked HDR studio illumination (KHR_materials_unlit)';
  V.renderer.setSize(size.x,size.y,false);
};
})(window.NZT,THREE);
