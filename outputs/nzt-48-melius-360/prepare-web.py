"""Create transparent studio assets from the Melius turntable intermediate."""
from pathlib import Path
import argparse,json,subprocess,sys
from PIL import Image,ImageFilter,ImageDraw
import numpy as np
sys.path.insert(0,'/private/tmp/nzt48-video-tools')
import imageio_ffmpeg
parser=argparse.ArgumentParser();parser.add_argument('source',type=Path)
args=parser.parse_args();base=Path(__file__).resolve().parent;out=base/'web-kit';frames=out/'frames';frames.mkdir(parents=True,exist_ok=True)
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
def run(options):subprocess.run([ffmpeg,'-hide_banner','-loglevel','error','-y',*options],check=True)
sample=base/'source-first-frame.png';run(['-i',str(args.source),'-frames:v','1',str(sample)])
rgb=np.asarray(Image.open(sample).convert('RGB'));background=np.median(np.concatenate([rgb[:30,:30].reshape(-1,3),rgb[:30,-30:].reshape(-1,3)]),axis=0).astype(int)
assert background[1]>max(background[0],background[2])+60
color='0x'+''.join(f'{int(v):02x}' for v in background)
key=f'huesaturation=colors=y:saturation=-0.18:intensity=-0.06,colorkey={color}:0.22:0.065,despill=type=green:mix=1:expand=0'
w=h=1080;fps=24
reader=subprocess.Popen([ffmpeg,'-hide_banner','-loglevel','error','-i',str(args.source),'-an','-vf',key+',scale=1080:1080:flags=lanczos,fps=24','-f','rawvideo','-pix_fmt','rgba','pipe:1'],stdout=subprocess.PIPE)
writer=subprocess.Popen([ffmpeg,'-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgba','-s',f'{w}x{h}','-r',str(fps),'-i','pipe:0','-an','-c:v','libvpx-vp9','-pix_fmt','yuva420p','-b:v','0','-crf','25','-row-mt','1','-auto-alt-ref','0',str(out/'nzt48-studio-360-alpha.webm')],stdin=subprocess.PIPE)
count=0;stats=[];review=[];ys=np.arange(h);xs=np.arange(w)
# The bottle silhouette is stationary throughout this axial turntable.
# Use the unkeyed source to avoid interpreting green spill on the plinth as glass.
foot_source=np.asarray(Image.open(sample).convert("RGB").resize((w,h),Image.Resampling.LANCZOS))
foot_dark=foot_source.max(2)<95
try:
 while True:
  raw=reader.stdout.read(w*h*4)
  if not raw:break
  assert len(raw)==w*h*4
  a=np.frombuffer(raw,np.uint8).reshape(h,w,4).copy()
  # The unrequested white plinth is confined to the foot region. Recover the
  # dark bottle silhouette row-by-row without changing its studio reflections.
  top=round(h*.85);dark=foot_dark
  left=np.full(h,w*.265);right=np.full(h,w*.735)
  for y in range(top,h):
   candidates=np.where(dark[y] & (xs>w*.25)&(xs<w*.75))[0]
   if len(candidates)>8:
    bound=np.interp(y/h,[.85,.871],[.733,.727])
    left[y]=max(candidates.min(),w*(.997-bound));right[y]=min(candidates.max(),w*bound)
   else:left[y]=w/2;right[y]=w/2-1
  matte=np.full((h,w),255,np.uint8)
  for y in range(top,h):
   matte[y]=0
   if right[y]>left[y]:matte[y,round(left[y]):round(right[y])+1]=255
  mask=np.asarray(Image.fromarray(matte).filter(ImageFilter.GaussianBlur(.8))).copy()
  a[:,:,3]=np.minimum(a[:,:,3],mask)
  # Remove white contamination from the antialiased foot edge using nearby
  # bottle pixels, rather than allowing a pale fringe on a dark website.
  for y in range(top,h):
   edge=np.where((mask[y]>0)&(mask[y]<254))[0]
   if not len(edge):continue
   sy=y
   while sy>=top and right[sy]-left[sy]<12:sy-=1
   if sy<top:continue
   samplexs=np.clip(edge,int(left[sy])+3,int(right[sy])-3)
   a[y,edge,:3]=a[sy,samplexs,:3]
  a[a[:,:,3]==0,:3]=0
  writer.stdin.write(a.tobytes())
  im=Image.fromarray(a).resize((960,960),Image.Resampling.LANCZOS)
  count+=1;im.save(frames/f'frame-{count:04d}.webp',quality=88,method=4)
  if count==1:im.save(out/'poster.png')
  if count in [1,49,97,145,193,216]:
   alpha=np.asarray(im)[:,:,3];assert (alpha==0).mean()>.35;assert (alpha==255).mean()>.1
   stats.append({'frame':count,'transparentPixels':int((alpha==0).sum()),'opaquePixels':int((alpha==255).sum()),'plinthRemoved':True})
   im.save(base/f'review/transparent-{count:04d}.png')
   darkbg=Image.new('RGBA',im.size,(8,9,11,255));darkbg.alpha_composite(im);review.append(darkbg.convert('RGB').resize((360,360)))
  if count%24==0:print(f'Processed {count} frames',flush=True)
finally:
 writer.stdin.close();reader.stdout.close()
assert reader.wait()==0;assert writer.wait()==0;assert count>=216
manifest={'frameCount':count,'fps':fps,'duration':count/fps,'width':960,'height':960,'framePattern':'frames/frame-{number}.webp','alpha':True,'source':'Melius generated turntable; chroma matte converted to true RGBA; white plinth removed'}
(out/'frames.json').write_text(json.dumps(manifest,indent=2))
decoded=base/'alpha-video-verification.png';run(['-c:v','libvpx-vp9','-i',str(out/'nzt48-studio-360-alpha.webm'),'-frames:v','1',str(decoded)])
videoAlpha=np.asarray(Image.open(decoded).convert('RGBA'))[:,:,3];assert (videoAlpha==0).mean()>.35
(out/'alpha-verification.json').write_text(json.dumps({'passed':True,'sampledKeyColor':color,'samples':stats,'webmDecodedAlphaVerified':True,'webmBytes':(out/'nzt48-studio-360-alpha.webm').stat().st_size},indent=2))
board=Image.new('RGB',(1080,720),(8,9,11))
for i,im in enumerate(review[:6]):board.paste(im,((i%3)*360,(i//3)*360))
board.save(base/'transparent-rotation-review.jpg',quality=95)
print(json.dumps(manifest),flush=True)
