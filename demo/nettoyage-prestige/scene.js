import * as THREE from 'three';
import { GLTFLoader } from './lib/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './lib/jsm/loaders/DRACOLoader.js';
import { Reflector } from './lib/jsm/objects/Reflector.js';
import { EffectComposer } from './lib/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './lib/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './lib/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './lib/jsm/postprocessing/OutputPass.js';

const canvas = document.getElementById('atelier');
const petit = matchMedia('(max-width:820px)').matches;
const seg = (p, a, b) => Math.max(0, Math.min(1, (p - a) / (b - a)));
const doux = t => t * t * (3 - 2 * t);
const mix = (a, b, t) => a + (b - a) * t;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, petit ? 1.3 : 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

const scene = new THREE.Scene();
const noir = new THREE.Color(0x030304), chaud = new THREE.Color(0x4a1f06);
scene.background = noir.clone();
scene.fog = new THREE.Fog(noir.clone(), 9, 26);
const camera = new THREE.PerspectiveCamera(32, 1, .02, 80);

/* ---------- Reflets : l'atelier vu par la peinture, du froid au chaud ---------- */
function creerReflets(chaleur) {
  const s = new THREE.Scene();
  s.background = new THREE.Color(.004 + chaleur * .05, .004 + chaleur * .022, .005 + chaleur * .004);
  const lampe = (l, x, y, z, w, d, ry = 0, r = 1, g = 1, b = 1) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ color: new THREE.Color(r * l, g * l, b * l), side: THREE.DoubleSide }));
    m.position.set(x, y, z);
    m.rotation.set(Math.PI / 2, 0, ry);
    s.add(m);
    return m;
  };
  const f = 1 - chaleur * .55;
  /* Bandes de plafond, celles qu'on voit glisser sur le capot et le toit */
  [-3, -1.5, 0, 1.5, 3].forEach((x, i) => lampe(16 * f, x, 5, 0, .22 + (i === 2 ? .2 : 0), 13));
  lampe(9 * f, 0, 5, -3.2, 10, .22);
  lampe(9 * f, 0, 5, 3.2, 10, .22);
  /* Panneaux latéraux doux */
  [-8, 8].forEach(x => { const m = lampe(1.5 * f, x, 1.8, 0, 12, 1.4); m.rotation.set(0, Math.PI / 2, 0); });
  /* La lumière de la porte, derrière */
  if (chaleur > 0) {
    const p = lampe(3.4 * chaleur, 0, 1.6, -9, 26, 3, 0, 1, .42, .1);
    p.rotation.set(0, 0, 0);
    const q = lampe(.32 * chaleur, 0, -2, 0, 22, 22, 0, 1, .5, .18);
    q.rotation.set(Math.PI / 2, 0, 0);
  }
  return s;
}
const pmrem = new THREE.PMREMGenerator(renderer);
const reflets = [0, .25, .5, .75, 1].map(c => pmrem.fromScene(creerReflets(c), .012).texture);
scene.environment = reflets[0];

/* ---------- L'atelier ---------- */
const sol = new THREE.Group();
scene.add(sol);
let miroir = null;
if (!petit) {
  miroir = new Reflector(new THREE.PlaneGeometry(60, 60), { textureWidth: 1024, textureHeight: 1024, clipBias: .002, color: 0xffffff });
  miroir.rotation.x = -Math.PI / 2;
  miroir.position.y = -.002;
  sol.add(miroir);
}
const dalle = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: .34, metalness: .1, transparent: !petit, opacity: petit ? 1 : .83 }));
dalle.rotation.x = -Math.PI / 2;
sol.add(dalle);

/* Ombre de contact, peinte en dégradé */
const ombreC = document.createElement('canvas'); ombreC.width = ombreC.height = 256;
{
  const g = ombreC.getContext('2d'), r = g.createRadialGradient(128, 128, 30, 128, 128, 128);
  r.addColorStop(0, 'rgba(0,0,0,.96)'); r.addColorStop(.62, 'rgba(0,0,0,.72)'); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, 256, 256);
}
const ombre = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 6.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(ombreC), transparent: true, depthWrite: false }));
ombre.rotation.x = -Math.PI / 2; ombre.position.y = .004;
sol.add(ombre);

/* Rampes lumineuses visibles au plafond */
const blanc = new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 5, 5.2), fog: false });
[-3, -1.5, 0, 1.5, 3].forEach(x => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(.1, .03, 14), blanc);
  m.position.set(x, 3.7, -1); scene.add(m);
});
[[-7.2], [4.8]].forEach(([z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(7, .03, .1), blanc); m.position.set(0, 3.7, z); scene.add(m); });

/* Le mur du fond et sa porte */
const matMur = new THREE.MeshStandardMaterial({ color: 0x08080a, roughness: .7, metalness: .2 });
const mur = (w, h, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .1), matMur); m.position.set(x, y, z); scene.add(m); return m; };
mur(8, 5, -15, 2.5, -8); mur(8, 5, 15, 2.5, -8); mur(22, 1.1, 0, 4.45, -8);
const porte = new THREE.Group(); scene.add(porte);
for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(22, .38, .06), new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: .42, metalness: .55 })); m.position.set(0, .2 + i * .39, -7.95); porte.add(m); }
const coucher = document.createElement('canvas'); coucher.width = 16; coucher.height = 256;
{ const g = coucher.getContext('2d'), r = g.createLinearGradient(0, 0, 0, 256); r.addColorStop(0, '#3a1206'); r.addColorStop(.5, '#a33d0b'); r.addColorStop(.74, '#f08a2a'); r.addColorStop(.83, '#ffc777'); r.addColorStop(1, '#5a2008'); g.fillStyle = r; g.fillRect(0, 0, 16, 256); }
const texCouch = new THREE.CanvasTexture(coucher); texCouch.colorSpace = THREE.SRGBColorSpace;
const dehors = new THREE.Mesh(new THREE.PlaneGeometry(50, 12), new THREE.MeshBasicMaterial({ map: texCouch, color: new THREE.Color(0, 0, 0), fog: false }));
dehors.position.set(0, 4, -8.6); scene.add(dehors);

/* ---------- La saleté et les micro-rayures, dans le rendu de la peinture ---------- */
const U = {
  uLavage: { value: 6 }, uRayures: { value: 0 }, uPoli: { value: 0 },
  uCentre: { value: new THREE.Vector3() }, uSale: { value: 1 }
};
const GLSL = /* glsl */`
uniform float uLavage,uRayures,uPoli,uSale;uniform vec3 uCentre;varying vec3 vPosM;varying vec3 vNorM;
float h31(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vb(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x),mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x),mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*vb(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return s;}
`;
function salir(mat, opt = {}) {
  const force = opt.force ?? 1;
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vPosM;varying vec3 vNorM;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPosM=(modelMatrix*vec4(position,1.)).xyz;vNorM=normalize(mat3(modelMatrix)*normal);');
    let f = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + GLSL);
    /* Le corps de la saleté : poussière claire, boue plus épaisse vers le bas */
    f = f.replace('#include <lights_physical_fragment>', `
      float bord=fbm(vPosM*vec3(5.,5.,3.))-.5;
      float front=smoothstep(-.03,.05,uLavage-vPosM.z-bord*.55);
      float tache=fbm(vPosM*vec3(3.4));
      float gros=fbm(vPosM*vec3(38.));
      float fin=vb(vPosM*vec3(210.));
      float coul=fbm(vec3(vPosM.x*26.,vPosM.y*2.,vPosM.z*26.));
      float haut=clamp(1.15-vPosM.y*.72,0.,1.);
      float d=.6+(tache-.5)*.85+haut*.22+(coul-.5)*.5+(gros-.5)*.75;
      d=smoothstep(.22,.82,d);
      d=clamp(d*${force.toFixed(2)},0.,1.)*front*uSale;
      vec3 boue=mix(vec3(.15,.122,.092),vec3(.055,.042,.03),clamp(gros*.9+haut*.5-.3,0.,1.))*(.8+.4*fin);
      diffuseColor.rgb=mix(diffuseColor.rgb,boue,d);
      roughnessFactor=mix(roughnessFactor,.93,d);
      metalnessFactor=mix(metalnessFactor,0.,d);
      #include <lights_physical_fragment>
      #ifdef USE_CLEARCOAT
      material.clearcoat*=(1.-d);
      #endif
      `);
    if (opt.peinture) {
      /* Micro-rayures : de fins arcs autour du point inspecté, effacés par le polissage */
      f = f.replace('#include <clearcoat_normal_fragment_maps>', `#include <clearcoat_normal_fragment_maps>
      {vec3 rel=vPosM-uCentre;rel-=vNorM*dot(rel,vNorM);float dist=length(rel);
       vec3 ut=normalize(cross(vNorM,vec3(0.,0.,1.)));vec3 vt=cross(vNorM,ut);
       float ang=atan(dot(rel,vt),dot(rel,ut));
       float ri=floor(dist*1500.);float bande=fract(dist*1500.);
       float n1=h31(vec3(ri,3.,7.));
       float secteur=floor((ang+n1*6.28)*(2.+n1*5.));
       float actif=step(.68,h31(vec3(ri,secteur,1.)));
       float ligne=smoothstep(.0,.3,bande)*smoothstep(1.,.7,bande);
       float reste=smoothstep(uPoli-.03,uPoli+.05,dist);
       float amp=uRayures*actif*ligne*reste*(.4+n1*.8)*smoothstep(1.6,.05,dist);
       vec3 rad=dist>1e-4?rel/dist:ut;
       vec3 rv=normalize((viewMatrix*vec4(rad,0.)).xyz);
       normal=normalize(normal+rv*amp*.4);
       #ifdef USE_CLEARCOAT
       clearcoatNormal=normalize(clearcoatNormal+rv*amp*.4);
       #endif
      }`);
    }
    sh.fragmentShader = f;
  };
  mat.customProgramCacheKey = () => 'sale' + force + (opt.peinture ? 'p' : '');
  return mat;
}

/* ---------- La voiture ---------- */
const voiture = new THREE.Group(); scene.add(voiture);
const peinture = salir(new THREE.MeshPhysicalMaterial({ color: 0x030405, metalness: 0, roughness: .42, clearcoat: 1, clearcoatRoughness: .012, envMapIntensity: 1.15 }), { peinture: true });
const peinture2 = salir(new THREE.MeshPhysicalMaterial({ color: 0x030303, metalness: .1, roughness: .34, clearcoat: 1, clearcoatRoughness: .03 }), { peinture: true });
const vitre = salir(new THREE.MeshPhysicalMaterial({ color: 0x0a0d10, metalness: .1, roughness: .03, transparent: true, opacity: .55, clearcoat: 1, clearcoatRoughness: .02 }), { force: .62 });
const cuir = new THREE.MeshStandardMaterial({ color: 0x8f6a2c, roughness: .46 });
const or = new THREE.MeshStandardMaterial({ color: 0xc69433, roughness: .2, metalness: 1 });
const phares = [];
const lampes = { h: new THREE.PointLight(0xdfe9ff, 0, 7, 2) };

/* Les éléments marchent en ombre : ces maillages portent des logos tiers */
const CACHE = new Set(['License Plate', 'InteriorSteeringEmblem']);
function habiller(root) {
  root.traverse(o => {
    if (!o.isMesh) return;
    const ancetre = n => { let a = o; while (a) { if (a.name && a.name.startsWith(n)) return true; a = a.parent; } return false; };
    if (CACHE.has(o.name) || ancetre('License Plate')) { o.visible = false; return; }
    const n = (o.material && o.material.name) || '';
    if (n.startsWith('Paint 1')) o.material = peinture;
    else if (n.startsWith('Paint 2')) o.material = peinture2;
    else if (n === 'Glass') o.material = vitre;
    else if (n.startsWith('Interior 3')) o.material = cuir;
    else if (n === 'Brake') o.material = or;
    else if (n === 'Headlight') { const m = o.material.clone(); m.emissive = new THREE.Color(.82, .9, 1); m.emissiveIntensity = 0; o.material = salir(m, { force: .7 }); phares.push(m); }
    else if (n === 'Brakelight') { o.material = salir(o.material.clone(), { force: .8 }); }
    else if (n === 'Mirror') { o.material = salir(o.material.clone(), { force: .55 }); }
    else if (!/^(Interior|Floormat|Dashboard|Mechanical)/.test(n)) { o.material = salir(o.material.clone(), { force: /Tire/.test(n) ? 1.1 : 1 }); }
  });
}

/* Le portique de lavage : un arc lumineux et son rideau de lumière */
const portique = new THREE.Group(); scene.add(portique);
const arc = new THREE.Mesh(new THREE.TorusGeometry(1.95, .018, 10, 80, Math.PI), new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 11, 13), fog: false }));
portique.add(arc);
const rideauC = document.createElement('canvas'); rideauC.width = 4; rideauC.height = 128;
{ const g = rideauC.getContext('2d'), r = g.createLinearGradient(0, 0, 0, 128); r.addColorStop(0, 'rgba(210,228,255,.0)'); r.addColorStop(.2, 'rgba(210,228,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,.14)'); g.fillStyle = r; g.fillRect(0, 0, 4, 128); }
const rideau = new THREE.Mesh(new THREE.CircleGeometry(1.95, 48, 0, Math.PI), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(rideauC), transparent: true, opacity: .34, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
portique.add(rideau);
const lumierePortique = new THREE.PointLight(0xdce8ff, 0, 7, 1.6); lumierePortique.position.y = 1.5; portique.add(lumierePortique);
portique.visible = false;

/* La bruine soulevée par le lavage */
const N = petit ? 320 : 900;
const gBruine = new THREE.BufferGeometry();
const aPos = new Float32Array(N * 3), aGraine = new Float32Array(N * 3);
for (let i = 0; i < N; i++) { aGraine[i * 3] = Math.random(); aGraine[i * 3 + 1] = Math.random(); aGraine[i * 3 + 2] = Math.random(); }
gBruine.setAttribute('position', new THREE.BufferAttribute(aPos, 3));
const pt = document.createElement('canvas'); pt.width = pt.height = 32;
{ const g = pt.getContext('2d'), r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); }
const bruine = new THREE.Points(gBruine, new THREE.PointsMaterial({ map: new THREE.CanvasTexture(pt), size: .05, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, color: 0xcfe0ff, fog: false }));
bruine.frustumCulled = false; scene.add(bruine);

/* Les gouttes qui perlent sur le capot */
const NG = 46;
const matGoutte = new THREE.MeshPhysicalMaterial({ color: 0xe6edf2, metalness: 1, roughness: .02, transparent: true, opacity: .9 });
const gouttes = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 32, 22), matGoutte, NG);
gouttes.frustumCulled = false; gouttes.visible = false; scene.add(gouttes);
const graines = Array.from({ length: NG }, (_, i) => i === 0 ? { a: 0, d: 0, r: .03, t: 0 } : { a: Math.random() * 6.283, d: .03 + Math.sqrt(Math.random()) * .18, r: .004 + Math.random() * .013, t: .1 + Math.random() * .75 });
const repere = new THREE.Object3D();

/* Lampe d'inspection, pour lire la peinture en gros plan */
const lampeI = new THREE.SpotLight(0xffffff, 0, 3.2, .5, .75, 1.2);
scene.add(lampeI, lampeI.target);

/* Éclairage de studio : une nappe au-dessus de la voiture et un contre-jour */
const nappe = new THREE.SpotLight(0xf2f5ff, 150, 16, .72, .85, 1.25); nappe.position.set(0, 7, .4); nappe.target.position.set(0, 0, .2); scene.add(nappe, nappe.target);
const face = new THREE.DirectionalLight(0xdfe7ff, .42); face.position.set(4, 2.2, 6); scene.add(face);
const cote = new THREE.DirectionalLight(0xcdd8ff, .45); cote.position.set(-5, 2, -2); scene.add(cote);
scene.add(new THREE.HemisphereLight(0xbcc6d8, 0x18181a, .32));

/* Lumières chaudes de la fin */
const soleil = new THREE.DirectionalLight(0xff9a46, 0); soleil.position.set(0, 2.2, -9); scene.add(soleil);
const reflet = new THREE.PointLight(0xffa24d, 0, 14, 1.4); reflet.position.set(0, .3, -4); scene.add(reflet);

/* ---------- Rendu ---------- */
let composer = null, bloom = null;
function taille() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  if (composer) { composer.setSize(w, h); }
  sale = true;
}
const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: petit ? 0 : 4 });
composer = new EffectComposer(renderer, rt);
composer.setPixelRatio(renderer.getPixelRatio());
composer.addPass(new RenderPass(scene, camera));
bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), petit ? .16 : .22, .5, .95);
composer.addPass(bloom);
composer.addPass(new OutputPass());

/* ---------- Trajectoire de la caméra ---------- */
let capot = new THREE.Vector3(0, .85, 1.1);
const NORM_CAPOT = new THREE.Vector3(0, .98, .18).normalize();
const P = (x, y, z) => new THREE.Vector3(x, y, z);
const V3 = new THREE.Vector3(), T3 = new THREE.Vector3();
function cles() {
  const c = capot;
  const portrait = camera.aspect < 1;
  const r = Math.max(1, Math.min(2.6, 1.55 / camera.aspect));
  scene.fog.near = 9 * r; scene.fog.far = 26 * r;
  const e = v => P(v.x * r, v.y * (portrait ? 1.3 : 1), v.z * r);
  return [
    [0, e(P(3.7, .92, 5.1)), P(0, .46, .15), 30],
    [.10, e(P(3.9, .82, 4.9)), P(0, .46, .1), 30],
    [.30, e(P(4.9, .74, 2.9)), P(0, .46, -.1), 29],
    [.36, e(P(4.5, .9, 3.3)), P(0, .5, .1), 29],
    [.46, P(c.x + .95, c.y + .62, c.z + 1.25), c, 28],
    [.53, P(c.x + .17, c.y + .3, c.z + .32), c, 30],
    [.72, P(c.x + .12, c.y + .26, c.z + .27), c, 30],
    [.81, P(c.x + .1, c.y + .18, c.z + .22), c, 30],
    [.86, e(P(1.2, 1.25, 4.8)), P(0, .55, .5), 28],
    [.93, e(P(-3.4, .66, 5.3)), P(0, .52, .1), 30],
    [1, e(P(-3.05, .6, 5.5)), P(0, .52, .05), 30]
  ];
}
let trajet = cles();
function placer(p) {
  let i = 0;
  while (i < trajet.length - 2 && p > trajet[i + 1][0]) i++;
  const a = trajet[i], b = trajet[i + 1], t = doux(seg(p, a[0], b[0]));
  V3.lerpVectors(a[1], b[1], t); T3.lerpVectors(a[2], b[2], t);
  camera.position.copy(V3); camera.lookAt(T3);
  const fov = mix(a[3], b[3], t);
  if (fov !== camera.fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
}

let actuel = 0, sale = true, dernier = -1, fps = 0, fN = 0, fT = 0, fD = 0;
function etat(p) {
  /* 1. Le portique lave la voiture de l'avant vers l'arrière */
  const w = doux(seg(p, .05, .30));
  const zL = mix(3.1, -3.3, w);
  /* La saleté part derrière le portique : uLavage est la limite côté arrière */
  U.uLavage.value = p <= .05 ? 6.4 : zL;
  /* La partie lavée est celle située en avant du portique : front=vPosM.z<limite */
  portique.visible = w > 0 && w < 1;
  portique.position.z = zL;
  lumierePortique.intensity = 7 * Math.min(1, Math.min(w, 1 - w) * 12);
  rideau.material.opacity = .32 * Math.min(1, Math.min(w, 1 - w) * 12);
  bruine.material.opacity = .55 * Math.min(1, Math.min(w, 1 - w) * 12);
  bruine.visible = portique.visible;
  ombre.material.opacity = .95;

  /* Les phares s'allument une fois lavés */
  const ph = seg(p, .17, .26);
  phares.forEach(m => { m.emissiveIntensity = ph * 2.6; });
  lampes.h.intensity = ph * 1.2;

  /* 2. Gros plan : rayures, polissage, gouttes */
  const macro = seg(p, .47, .54);
  U.uRayures.value = macro * (1 - seg(p, .78, .82));
  U.uPoli.value = doux(seg(p, .56, .71)) * 1.7;
  const dansMacro = doux(seg(p, .44, .52)) * (1 - doux(seg(p, .81, .86)));
  lampeI.intensity = 9 * dansMacro;
  nappe.intensity = 150 * (1 - dansMacro * .9);
    cote.intensity = .45 * (1 - dansMacro * .9);
  scene.environmentIntensity = 1 - dansMacro * .55;
  lampeI.position.set(capot.x - .62, capot.y + .85, capot.z + .34);
  lampeI.target.position.copy(capot);

  const g = seg(p, .71, .79);
  gouttes.visible = g > 0 && p < .85;
  if (gouttes.visible) {
    const ux = new THREE.Vector3(1, 0, 0), uz = new THREE.Vector3().crossVectors(ux, NORM_CAPOT).normalize();
    graines.forEach((s, i) => {
      const a = seg(g, s.t, Math.min(1, s.t + .22)), k = 1 - Math.pow(1 - a, 3);
      const ch = i === 0 ? (1 - k) * .28 : 0;
      repere.position.copy(capot).addScaledVector(ux, Math.cos(s.a) * s.d).addScaledVector(uz, Math.sin(s.a) * s.d).addScaledVector(NORM_CAPOT, ch + s.r * .42 * k);
      repere.scale.set(s.r * k + 1e-5, s.r * k * .6 + 1e-5, s.r * k + 1e-5);
      repere.updateMatrix();
      gouttes.setMatrixAt(i, repere.matrix);
    });
    gouttes.instanceMatrix.needsUpdate = true;
  }

  /* 3. La porte s'ouvre sur un coucher de soleil */
  const c = doux(seg(p, .82, .93));
  porte.position.y = c * 3.9;
  const dx = c;
  dehors.material.color.setRGB(1.05 * dx, 1.05 * dx, 1.05 * dx);
  soleil.intensity = 1.3 * c;
  reflet.intensity = 7 * c;
  nappe.intensity *= 1 - c * .72;
  face.intensity = .42 * (1 - dansMacro * .95) * (1 - c * .45);
  scene.background.copy(noir).lerp(chaud, c);
  scene.fog.color.copy(noir).lerp(chaud, c);
  scene.environment = reflets[Math.min(4, Math.round(c * 4))];
  renderer.toneMappingExposure = 1 - c * .08;
  placer(p);
}

function mettreBruine(t) {
  const z = portique.position.z;
  for (let i = 0; i < N; i++) {
    const a = aGraine[i * 3], b = aGraine[i * 3 + 1], s = aGraine[i * 3 + 2];
    const v = (t * (.28 + s * .5) + a) % 1;
    aPos[i * 3] = (b - .5) * 3.8 + Math.sin(t * 2 + i) * .03;
    aPos[i * 3 + 1] = .04 + v * (1.1 + s * 1.3);
    aPos[i * 3 + 2] = z - .08 + (s - .5) * .7 + v * .8;
  }
  gBruine.attributes.position.needsUpdate = true;
}

let niveau = 0;
function alleger() {
  niveau++;
  if (niveau === 1) { renderer.setPixelRatio(Math.min(renderer.getPixelRatio(), 1)); composer.setPixelRatio(renderer.getPixelRatio()); bloom.enabled = false; taille(); }
  if (niveau === 2 && miroir) { miroir.visible = false; dalle.material.transparent = false; dalle.material.opacity = 1; dalle.material.needsUpdate = true; sale = true; }
}
function boucle(ms) {
  requestAnimationFrame(boucle);
  const enLavage = portique.visible;
  if (actuel !== dernier) { etat(actuel); dernier = actuel; sale = true; }
  if (enLavage) { mettreBruine(ms / 1000); sale = true; }
  if (!sale || document.hidden) return;
  composer.render();
  sale = false;
  /* Seules les images rendues à la suite comptent : au repos, rien n'est dessiné */
  if (fT && ms - fT < 300) {
    fD += ms - fT; fN++;
    if (fN >= 36) { fps = 1000 * fN / fD; if (fps < 22 && niveau < 2) alleger(); fN = 0; fD = 0; }
  }
  fT = ms;
}

const dracoL = new DRACOLoader().setDecoderPath('lib/draco/');
const loader = new GLTFLoader().setDRACOLoader(dracoL);
const barre = document.getElementById('charge');
addEventListener('resize', () => { taille(); trajet = cles(); dernier = -1; });

loader.load('car.glb', gltf => {
  const m = gltf.scene;
  habiller(m);
  /* On couche la voiture dans l'axe Z, avant vers +Z, posée au sol, longue de 4,4 unités */
  let b = new THREE.Box3().setFromObject(m), t = b.getSize(new THREE.Vector3());
  const hood = m.getObjectByName('BodyHood');
  if (t.x > t.z) m.rotation.y = Math.PI / 2;
  m.updateMatrixWorld(true);
  b = new THREE.Box3().setFromObject(m); t = b.getSize(new THREE.Vector3());
  let h = new THREE.Box3().setFromObject(hood).getCenter(new THREE.Vector3());
  const cz = (b.min.z + b.max.z) / 2;
  if (h.z < cz) { m.rotation.y += Math.PI; m.updateMatrixWorld(true); b = new THREE.Box3().setFromObject(m); }
  const k = 4.4 / b.getSize(new THREE.Vector3()).z;
  m.scale.multiplyScalar(k); m.updateMatrixWorld(true);
  b = new THREE.Box3().setFromObject(m);
  m.position.x -= (b.min.x + b.max.x) / 2; m.position.z -= (b.min.z + b.max.z) / 2; m.position.y -= b.min.y;
  m.updateMatrixWorld(true);
  voiture.add(m);
  const hb = new THREE.Box3().setFromObject(hood);
  capot = new THREE.Vector3((hb.min.x + hb.max.x) / 2 + .02, hb.max.y + .004, (hb.min.z + hb.max.z) / 2 + .1);
  U.uCentre.value.copy(capot);
  lampes.h.position.set(0, .55, 2.8); scene.add(lampes.h);
  taille();
  trajet = cles();
  etat(actuel);
  renderer.compile(scene, camera);
  composer.render();
  document.documentElement.classList.add('pret3d');
  sale = true;
  requestAnimationFrame(boucle);
  window.NP3D = { aller(p) { actuel = p; }, capot, voiture: m, get fps() { return fps; } };
}, e => { if (barre && e.total) barre.style.transform = 'scaleX(' + (e.loaded / e.total) + ')'; }, () => {
  document.documentElement.classList.remove('anim');
});

window.addEventListener('np:progress', e => { actuel = e.detail; });
