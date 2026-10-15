const fs = require('fs'), path = require('path'), assert = require('assert/strict');
const base = __dirname, kit = path.join(base, 'web-kit');
function read(file) {
  const raw = fs.readFileSync(file), size = raw.readUInt32LE(12);
  assert.equal(raw.readUInt32LE(0), 0x46546c67);
  assert.equal(raw.readUInt32LE(4), 2);
  assert.equal(raw.readUInt32LE(8), raw.length);
  return { g: JSON.parse(raw.subarray(20, 20 + size)), bin: raw.subarray(28 + size), bytes: raw.length };
}
function positions(asset, node) {
  const a = asset.g.accessors[asset.g.meshes[node.mesh].primitives[0].attributes.POSITION];
  const v = asset.g.bufferViews[a.bufferView], stride = v.byteStride || 12;
  const start = (v.byteOffset || 0) + (a.byteOffset || 0), out = [];
  for (let i = 0; i < a.count; i++) out.push([0, 1, 2].map(k => asset.bin.readFloatLE(start + i * stride + k * 4)));
  assert(out.flat().every(Number.isFinite));
  return out;
}
function images(asset) {
  return asset.g.images.map(i => {
    const v = asset.g.bufferViews[i.bufferView];
    return asset.bin.subarray(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength);
  });
}
function checkStatic(asset) {
  assert.equal((asset.g.animations || []).length, 0);
  assert.equal((asset.g.skins || []).length, 0);
  for (const n of asset.g.nodes) assert.deepEqual(n.scale, [1, 1, 1]);
  for (const v of asset.g.bufferViews) assert((v.byteOffset || 0) + v.byteLength <= asset.bin.length);
  for (const m of asset.g.meshes) for (const p of m.primitives) assert(!p.targets);
}
const bottle = read(path.join(kit, 'nzt48-bottle-cap.glb'));
const pill = read(path.join(kit, 'nzt48-gold-pill.glb'));
checkStatic(bottle); checkStatic(pill);
const find = name => bottle.g.nodes.find(n => n.name === name);
const root = find('NZT48Product'), body = find('Bottle'), cap = find('Cap'), label = find('Label');
assert(root && body && cap && label && find('BottleBody'));
assert.deepEqual(root.children.map(i => bottle.g.nodes[i].name), ['Bottle', 'Cap']);
assert.deepEqual(body.children.map(i => bottle.g.nodes[i].name), ['BottleBody', 'Label']);
assert(!bottle.g.nodes.some(n => /pill|capsule/i.test(n.name)));
assert.deepEqual(cap.extras.closedPosition, cap.translation);
assert.deepEqual(cap.extras.closedQuaternion, cap.rotation);
const labelVertices = positions(bottle, label);
const labelHeight = Math.max(...labelVertices.map(v => v[1])) - Math.min(...labelVertices.map(v => v[1]));
const radius = Math.max(...labelVertices.map(v => Math.hypot(v[0], v[2])));
assert(Math.abs(labelHeight - 0.0508) < 1e-7);
assert(Math.abs(2 * Math.PI * radius - 0.1524) < 1e-7);
const bodyMinY = Math.min(...positions(bottle, find('BottleBody')).map(v => v[1])) + find('BottleBody').translation[1];
assert(Math.abs(bodyMinY) < 1e-7);
assert.equal(pill.g.nodes[0].name, 'GoldPill');
assert.deepEqual(pill.g.nodes[0].translation, [0, 0, 0]);
assert.equal(pill.g.nodes[0].extras.longAxis, 'X');
assert.equal(pill.g.nodes[0].extras.capsuleScale, 2);
for (const m of pill.g.materials) assert('KHR_materials_unlit' in m.extensions);
const pillY = pill.g.nodes.filter(n => n.mesh !== undefined).flatMap(n => positions(pill, n).map(v => v[1]));
const pillLength = Math.max(...pillY) - Math.min(...pillY);
assert(pillLength > 0.016 && pillLength < 0.018);
// Compare embedded images byte-for-byte against approved source GLBs.
const original = read(path.join(base, 'model/nzt48-web-lowpoly.glb'));
const originalPill = read(path.join(base, 'model/nzt48-capsule-gold-baked.glb'));
assert.equal(images(bottle).length, 2);
for (const img of images(bottle)) assert(images(original).some(source => source.equals(img)));
assert.equal(images(pill).length, 2);
for (const img of images(pill)) assert(images(originalPill).some(source => source.equals(img)));
const foil = bottle.g.materials.find(m => m.name === 'Matte black label with gold foil');
assert(foil.extensions.KHR_materials_specular.specularTexture);
assert(foil.pbrMetallicRoughness.metallicRoughnessTexture);
const result = {
  passed: true, animationClips: 0, unitRootScales: true, independentBottleAndCap: true,
  singleCenteredPill: true, pillSizeAlreadyDoubled: true,
  dimensions: { labelHeightMm: labelHeight * 1000, labelCircumferenceMm: 2 * Math.PI * radius * 1000, pillLengthMm: pillLength * 1000 },
  basePivotY: bodyMinY, capClosedPosition: cap.translation,
  approvedEmbeddedTexturesPreserved: true, foilAndMatteMasksPreserved: true,
  bakedCapsuleUnlitMaterialsPreserved: true,
  files: { 'nzt48-bottle-cap.glb': bottle.bytes, 'nzt48-gold-pill.glb': pill.bytes }
};
fs.writeFileSync(path.join(kit, 'verification.json'), JSON.stringify(result, null, 2));
console.log(result);
