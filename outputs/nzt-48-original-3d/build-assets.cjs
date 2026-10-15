// Rebuild renders and animated GLB from the exact same model as the viewer.
const fs=require('fs');const path=require('path');
const runtime='/Users/arunshourie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {chromium}=require(path.join(runtime,'playwright'));const sharp=require(path.join(runtime,'sharp'));
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});const page=await browser.newPage({viewport:{width:1400,height:1050},deviceScaleFactor:1});
 page.on('pageerror',e=>console.error('PAGE ERROR',e.message));
 await page.goto('http://127.0.0.1:4186/outputs/nzt-48-original-3d/');await page.waitForFunction(()=>window.nztReady,{timeout:30000});
 console.log(await page.evaluate(()=>({three:THREE.REVISION,parts:NZT.product.children.map(x=>x.name),bodyRoughness:NZT.materials.black.roughness,label:[NZT.labelCanvas.width,NZT.labelCanvas.height]})));
 await page.screenshot({path:path.join(__dirname,'renders/studio-desktop.png')});
 const views=['front','front-right','right','back','left','front-left','top','bottom','open'];
 for(const name of views){const url=await page.evaluate(n=>NZT.renderState(n,n==='open'?1:0,1800,2400,true),name);fs.writeFileSync(path.join(__dirname,'renders',name+'.png'),Buffer.from(url.split(',')[1],'base64'));console.log('Rendered',name);}
 const capsule=await page.evaluate(()=>NZT.renderCapsule());fs.writeFileSync(path.join(__dirname,'renders/golden-capsule.png'),Buffer.from(capsule.split(',')[1],'base64'));
 const label=await page.evaluate(()=>NZT.labelCanvas.toDataURL('image/png'));fs.writeFileSync(path.join(__dirname,'model/label-wrap-30.png'),Buffer.from(label.split(',')[1],'base64'));
 await sharp(Buffer.from(label.split(',')[1],'base64')).withMetadata({density:1024}).png().toFile(path.join(__dirname,'model/label-visualization-6x2in.png'));
 const glb=await page.evaluate(()=>NZT.exportGLB());fs.writeFileSync(path.join(__dirname,'model/nzt48-original-animated.glb'),Buffer.from(glb));console.log('GLB',glb.length);
 // Both exposed sides of the fully modeled cap.
 for(const type of ['top','underside']){const url=await page.evaluate(t=>{const V=NZT.viewer;NZT.product.visible=false;const cap=NZT.cap.clone();cap.position.set(0,0,0);cap.rotation.set(0,0,0);V.scene.add(cap);V.renderer.setSize(1400,1400,false);V.camera.aspect=1;V.camera.fov=30;V.camera.position.set(0,t==='top'?3.9:-3.3,3.2);V.camera.lookAt(0,.26,0);V.camera.updateProjectionMatrix();V.renderer.render(V.scene,V.camera);const u=V.renderer.domElement.toDataURL('image/png');V.scene.remove(cap);NZT.product.visible=true;return u;},type);fs.writeFileSync(path.join(__dirname,'renders','cap-'+type+'.png'),Buffer.from(url.split(',')[1],'base64'));}
 // Visual QA after real interactions, on desktop and mobile.
 await page.reload();await page.waitForFunction(()=>window.nztReady);await page.getByRole('button',{name:'Back',exact:true}).click();await page.waitForTimeout(1100);await page.screenshot({path:path.join(__dirname,'renders/qa-back.png')});
 await page.getByRole('button',{name:'Open bottle ↗',exact:true}).click();await page.waitForTimeout(1700);console.log('Open state',await page.evaluate(()=>({progress:NZT.opening,capY:NZT.cap.position.y})));await page.screenshot({path:path.join(__dirname,'renders/studio-open.png')});
 await page.setViewportSize({width:390,height:844});await page.reload();await page.waitForFunction(()=>window.nztReady);await page.screenshot({path:path.join(__dirname,'renders/studio-mobile.png'),fullPage:true});
 await browser.close();
 const labels=['FRONT','FRONT / RIGHT','RIGHT · SUPPLEMENT FACTS','BACK · PRODUCT INFORMATION','LEFT','FRONT / LEFT','TOP','BOTTOM','OPEN · CAPSULE REVEAL'];const tileW=640,tileH=860;const pieces=[];
 for(let i=0;i<views.length;i++){const img=await sharp(path.join(__dirname,'renders',views[i]+'.png')).resize(530,710,{fit:'contain'}).toBuffer();pieces.push({input:img,left:(i%3)*tileW+55,top:Math.floor(i/3)*tileH+150});const svg=Buffer.from(`<svg width="640" height="80"><text x="55" y="30" font-family="Arial" font-size="16" letter-spacing="2" fill="#c9b779">${labels[i]}</text></svg>`);pieces.push({input:svg,left:(i%3)*tileW,top:Math.floor(i/3)*tileH+110});}
 const header=Buffer.from('<svg width="1920" height="95"><text x="55" y="45" font-family="Arial" font-size="28" fill="#f0e6cc">LIMITLESS / NZT-48 ORIGINAL</text><text x="55" y="76" font-family="Arial" font-size="15" letter-spacing="2" fill="#92968b">SATIN BLACK · MATTE LABEL · GOLD CAP · GOLDEN CAPSULES</text></svg>');pieces.push({input:header,left:0,top:15});
 await sharp({create:{width:1920,height:2680,channels:4,background:'#101110'}}).composite(pieces).png().toFile(path.join(__dirname,'renders/all-angles.png'));
 console.log('All assets saved');
})().catch(e=>{console.error(e);process.exit(1)});
