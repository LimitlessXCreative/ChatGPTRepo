"""Local, zero-credit rework of the existing studio turntable."""
from pathlib import Path
from collections import OrderedDict
import sys, math, json, subprocess
import numpy as np
from PIL import Image
sys.path.insert(0, '/private/tmp/nzt48-video-tools')
import cv2, imageio_ffmpeg

base = Path(__file__).resolve().parent
source = base.parent / 'nzt-48-melius-360/web-kit/frames'
out = base / 'web-kit'
frames = out / 'frames'
frames.mkdir(parents=True, exist_ok=True)
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
cv2.setNumThreads(2)
size, fps, total = 1080, 24, 480
images, flows = OrderedDict(), OrderedDict()
grid_x, grid_y = np.meshgrid(np.arange(960, dtype=np.float32), np.arange(960, dtype=np.float32))
# Hold the silhouette and cap highlights stationary in the source turntable.
# Optical interpolation only follows the rotating print within the label band.
label_window = np.minimum(np.clip((grid_y - 300) / 35, 0, 1), np.clip((845 - grid_y) / 30, 0, 1))
label_window *= np.minimum(np.clip((grid_x - 246) / 25, 0, 1), np.clip((714 - grid_x) / 25, 0, 1))

def load(n):
    if n not in images:
        images[n] = np.asarray(Image.open(source / f'frame-{n+1:04d}.webp').convert('RGBA')).copy()
        while len(images) > 6:
            images.popitem(last=False)
    images.move_to_end(n)
    return images[n]

def optical(a, b, key):
    if key not in flows:
        def gray(im):
            rgb = im[:, :, :3].copy()
            rgb[im[:, :, 3] < 128] = 0
            return cv2.cvtColor(cv2.resize(rgb, (384, 384)), cv2.COLOR_RGB2GRAY)
        ga, gb = gray(a), gray(b)
        def flow(x, y):
            f = cv2.calcOpticalFlowFarneback(x, y, None, .5, 4, 25, 5, 7, 1.5, 0)
            return cv2.resize(f, (960, 960)) * 2.5 * label_window[:, :, None]
        flows[key] = (flow(ga, gb), flow(gb, ga))
        while len(flows) > 2:
            flows.popitem(last=False)
    flows.move_to_end(key)
    return flows[key]

def interpolate(a, b, f, key):
    if f <= .00001: return a
    if f >= .99999: return b
    ab, ba = optical(a, b, key)
    def warp(im, flow, amount):
        p = im.astype(np.float32)
        p[:, :, :3] *= p[:, :, 3:4] / 255
        return cv2.remap(p, grid_x - amount * flow[:, :, 0], grid_y - amount * flow[:, :, 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    result = warp(a, ab, f) * (1-f) + warp(b, ba, 1-f) * f
    alpha = result[:, :, 3:4]
    result[:, :, :3] = np.divide(result[:, :, :3] * 255, alpha, out=np.zeros_like(result[:, :, :3]), where=alpha > .01)
    return np.clip(result, 0, 255).astype(np.uint8)

def source_pose(u):
    # Reserve the final 0.9 seconds for a motion-compensated closing bridge.
    # This removes the angle mismatch from the original AI clip.
    if u <= .955:
        p = u / .955 * 215
        a = min(int(p), 215)
        b = min(a+1, 215)
        return interpolate(load(a), load(b), p-a, (a, b))
    f = (u-.955) / .045
    f = f*f*(3-2*f)
    return interpolate(load(215), load(0), f, (215, 0))

def floating_frame(i):
    u = i / (total-1)
    theta = 2 * math.pi * u
    angle = -24 + 6.5*math.sin(theta) - 2.5*math.sin(2*theta)
    scale = .94 + .018*math.cos(theta)
    cx = size/2 + 20*math.sin(theta)
    cy = size/2 - 18*math.cos(theta) + 5*math.sin(2*theta)
    a = math.radians(angle)
    c, s = math.cos(a)/scale, math.sin(a)/scale
    transform = (c, -s, 480-c*cx+s*cy, s, c, 480-s*cx-c*cy)
    im = Image.fromarray(source_pose(u))
    return im.transform((size, size), Image.Transform.AFFINE, transform, resample=Image.Resampling.BICUBIC)

# Check the pose, color and alpha at both ends before rendering the video.
first, last = floating_frame(0), floating_frame(total-1)
assert np.array_equal(np.asarray(first), np.asarray(last)), 'Loop endpoints must match exactly.'
first.save(out/'poster.png')
last.save(base/'loop-endpoint.png')
dark = Image.new('RGBA', first.size, (6, 7, 10, 255)); dark.alpha_composite(first)
dark.convert('RGB').save(base/'floating-pose-preview.jpg', quality=95)
print('Matched loop endpoints; beginning 20-second render.', flush=True)

writer = subprocess.Popen([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{size}x{size}', '-r', str(fps), '-i', 'pipe:0', '-an', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '25', '-row-mt', '1', '-auto-alt-ref', '0', str(out/'nzt48-floating-20s-alpha.webm')], stdin=subprocess.PIPE)
samples, review = [], []
try:
    for i in range(total):
        im = first if i == 0 else last if i == total-1 else floating_frame(i)
        writer.stdin.write(im.tobytes())
        im.save(frames/f'frame-{i+1:04d}.webp', quality=88, method=4)
        if i in [0, 96, 192, 288, 384, 479]:
            alpha = np.asarray(im)[:, :, 3]
            assert (alpha == 0).mean() > .4 and (alpha == 255).mean() > .15
            assert alpha[:8].max() == 0 and alpha[-8:].max() == 0 and alpha[:, :8].max() == 0 and alpha[:, -8:].max() == 0, 'Bottle is cropped.'
            samples.append({'frame':i+1, 'transparentFraction':float((alpha==0).mean()), 'uncropped':True})
            bg = Image.new('RGBA', im.size, (6,7,10,255)); bg.alpha_composite(im)
            review.append(bg.convert('RGB').resize((360,360)))
        if (i+1) % 48 == 0: print(f'Rendered {(i+1)/fps:.0f}/20 seconds', flush=True)
finally:
    writer.stdin.close()
assert writer.wait() == 0
decoded = base/'encoded-alpha-check.png'
subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-c:v', 'libvpx-vp9', '-i', str(out/'nzt48-floating-20s-alpha.webm'), '-frames:v', '1', str(decoded)], check=True)
assert (np.asarray(Image.open(decoded).convert('RGBA'))[:, :, 3] == 0).mean() > .4
manifest={'frameCount':total, 'fps':fps, 'duration':20, 'width':size, 'height':size, 'framePattern':'frames/frame-{number}.webp', 'alpha':True, 'loopEndpointsMatch':True, 'additionalMeliusCredits':0, 'source':'Existing Melius render, processed locally with floating tilt, optical interpolation and loop closure'}
(out/'frames.json').write_text(json.dumps(manifest, indent=2))
(out/'verification.json').write_text(json.dumps({'durationSeconds':20, 'frameCount':total, 'fps':fps, 'exactLoopEndpointMatch':True, 'decodedWebmAlphaVerified':True, 'samples':samples, 'additionalMeliusRequests':0, 'additionalMeliusCredits':0}, indent=2))
board=Image.new('RGB',(1080,720),(6,7,10))
for i,im in enumerate(review):board.paste(im,((i%3)*360,(i//3)*360))
board.save(base/'floating-rotation-review.jpg',quality=95)
print(json.dumps(manifest), flush=True)
