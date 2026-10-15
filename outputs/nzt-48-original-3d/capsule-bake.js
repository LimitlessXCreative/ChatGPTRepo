/* Soft baked amber illumination, combined with real studio specular reflections.
   The bake supplies warm shell depth; the HDR environment supplies moving shine. */
(function(N,T){
N.bakeCapsuleMaterial=function(geometry,name,warmth=0){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
  const ctx=canvas.getContext('2d'),image=ctx.createImageData(256,256);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    const u=(x+.5)/256,v=1-(y+.5)/256,phi=u*Math.PI*2;
    const edge=.82+.18*Math.pow(Math.abs(Math.cos(phi)),.7);
    const end=.93+.07*Math.sin(v*Math.PI),bounce=.025*Math.cos(phi-.8);
    const seam=name.includes('upper')?Math.exp(-v*190):Math.exp(-(1-v)*190);
    const shade=edge*end+bounce-seam*.09;
    const rgb=[255,136-warmth*8,10-warmth*4];const i=(y*256+x)*4;
    for(let k=0;k<3;k++)image.data[i+k]=Math.round(rgb[k]*shade);image.data[i+3]=255;
  }
  ctx.putImageData(image,0,0);const map=new T.CanvasTexture(canvas);map.name='Baked golden amber shell illumination';map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
  const material=new T.MeshPhysicalMaterial({name:'Studio golden amber '+name,map,color:0xffffff,metalness:.08,roughness:.16,clearcoat:1,clearcoatRoughness:.065,ior:1.48,envMapIntensity:1});
  material.userData={lighting:'Soft baked shell illumination with live HDR studio reflections',finish:'Glossy golden amber capsule',bakeResolution:[256,256]};return material;
};
})(window.NZT,THREE);
