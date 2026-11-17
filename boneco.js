import * as THREE from 'three';

/* ---------- cores (mude aqui) ---------- */
const COR_PELE    = 0xa8744f;
const COR_PELE_2  = 0x96643f;
const COR_CABELO  = 0x1c120d;
const COR_MOLETOM = 0x161616;

/* ---------- cena ---------- */
const container = document.getElementById('boneco');
const larg = () => container.clientWidth || 400;
const alt = () => container.clientHeight || innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, larg() / alt(), 0.1, 100);
camera.position.set(0, -0.4, 9);
camera.lookAt(0, -0.8, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(larg(), alt());
renderer.setClearColor(0x000000, 0);
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1.0));
const luzPrincipal = new THREE.DirectionalLight(0xffffff, 1.7);
luzPrincipal.position.set(3, 5, 6);
scene.add(luzPrincipal);
const luzAzul = new THREE.DirectionalLight(0x6f9bff, 1.6);
luzAzul.position.set(-5, 2, -3);
scene.add(luzAzul);

const mat = (cor, rough = 0.7) => new THREE.MeshStandardMaterial({ color: cor, roughness: rough });
const matPele = mat(COR_PELE, 0.6);
const matPele2 = mat(COR_PELE_2, 0.6);
const matCabelo = mat(COR_CABELO, 0.9);
const matMoletom = mat(COR_MOLETOM, 0.85);
const matPreto = mat(0x050505, 0.25);
const matBranco = mat(0xf2f2f2, 0.6);

/* ---------- corpo ---------- */
const corpo = new THREE.Group();
scene.add(corpo);

// tronco (elipsoide)
const tronco = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), matMoletom);
tronco.scale.set(1.3, 1.5, 0.95);
tronco.position.y = -2.3;
corpo.add(tronco);

// pescoço
const pescoco = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.9, 24), matPele2);
pescoco.position.y = -0.8;
corpo.add(pescoco);

// capuz em volta do pescoço
const capuz = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.22, 20, 48), matMoletom);
capuz.rotation.x = Math.PI / 2 - 0.15;
capuz.scale.set(1.05, 1, 1);
capuz.position.set(0, -1.0, 0.05);
corpo.add(capuz);

// cordões do moletom
function zFrente(y, x) {
  const v = 1 - Math.pow((y + 2.3) / 1.5, 2) - Math.pow(x / 1.3, 2);
  return 0.95 * Math.sqrt(Math.max(v, 0));
}
for (const lado of [-1, 1]) {
  const x0 = lado * 0.28;
  const ys = [-1.3, -1.65, -2.0, -2.35, -2.7];
  const pts = ys.map((y, i) => new THREE.Vector3(x0 + lado * 0.03 * Math.sin(i * 1.6), y, zFrente(y, x0) + 0.05));
  const curva = new THREE.CatmullRomCurve3(pts);
  const cordao = new THREE.Mesh(new THREE.TubeGeometry(curva, 40, 0.04, 10, false), matBranco);
  corpo.add(cordao);
  const ponta = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 12), matPreto);
  const fim = pts[pts.length - 1];
  ponta.position.set(fim.x, fim.y - 0.08, fim.z);
  corpo.add(ponta);
}

// braços
for (const lado of [-1, 1]) {
  const braco = new THREE.Group();
  braco.position.set(lado * 1.05, -1.45, 0);
  braco.rotation.z = lado * 0.15;
  corpo.add(braco);

  const manga = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1.1, 8, 24), matMoletom);
  manga.position.y = -0.75;
  braco.add(manga);

  const mao = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 24), matPele);
  mao.position.y = -1.7;
  braco.add(mao);
}

/* ---------- cabeça ---------- */
const cabeca = new THREE.Group();
cabeca.position.y = 0.45;
scene.add(cabeca);

const escala = new THREE.Vector3(0.98, 1.15, 1);
const crânio = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), matPele);
crânio.scale.copy(escala);
cabeca.add(crânio);

// orelhas
for (const lado of [-1, 1]) {
  const orelha = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 20), matPele2);
  orelha.scale.set(0.5, 1, 0.8);
  orelha.position.set(lado * 0.99, -0.05, -0.05);
  cabeca.add(orelha);
}

// olhos (com brilho) e sobrancelhas
const olhoGeo = new THREE.SphereGeometry(0.12, 24, 24);
const brilhoGeo = new THREE.SphereGeometry(0.03, 12, 12);
for (const lado of [-1, 1]) {
  const olho = new THREE.Mesh(olhoGeo, matPreto);
  olho.scale.set(0.85, 1.3, 0.55);
  olho.position.set(lado * 0.36, 0.1, 0.9);
  cabeca.add(olho);

  const brilho = new THREE.Mesh(brilhoGeo, matBranco);
  brilho.position.set(lado * 0.36 + 0.03, 0.17, 0.96);
  cabeca.add(brilho);

  const arco = 1.1;
  const sobrancelha = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.04, 10, 24, arco), matCabelo);
  sobrancelha.scale.set(1, 0.8, 1);
  sobrancelha.rotation.z = Math.PI / 2 - arco / 2 + lado * -0.12;
  sobrancelha.position.set(lado * 0.37, 0.1, 0.9);
  cabeca.add(sobrancelha);
}

// nariz (cone)
const nariz = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.24, 20), matPele2);
nariz.rotation.x = Math.PI / 2;
nariz.position.set(0, -0.1, 0.98);
cabeca.add(nariz);

// boca
const boca = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.22, 4, 8), mat(0x4a2218, 0.6));
boca.rotation.z = Math.PI / 2;
boca.position.set(0, -0.46, 0.92);
cabeca.add(boca);

// bigode
for (const lado of [-1, 1]) {
  const bigode = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.2, 6, 12), matCabelo);
  bigode.rotation.z = Math.PI / 2 + lado * 0.3;
  bigode.position.set(lado * 0.12, -0.3, 0.97);
  cabeca.add(bigode);
}

// cabelo cacheado (anéis)
const NUM_CACHOS = 380;
const cachoGeo = new THREE.TorusGeometry(0.17, 0.065, 10, 18);
const cabelo = new THREE.InstancedMesh(cachoGeo, matCabelo, NUM_CACHOS);
const dummy = new THREE.Object3D();
let n = 0, tentativas = 0;
while (n < NUM_CACHOS && tentativas < 30000) {
  tentativas++;
  const y = -0.2 + Math.random() * 1.2;
  const fi = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const x = r * Math.cos(fi);
  const z = r * Math.sin(fi);
  if (z > 0.25 && y < 0.55) continue;           // testa livre
  if (Math.abs(x) > 0.85 && y < 0.15) continue;  // orelha livre
  const k = 1.0 + Math.random() * 0.1;
  dummy.position.set(escala.x * x * k, escala.y * y * k, z * k);
  dummy.scale.setScalar(0.8 + Math.random() * 0.5);
  dummy.rotation.set(Math.random() * 3.14, Math.random() * 3.14, Math.random() * 3.14);
  dummy.updateMatrix();
  cabelo.setMatrixAt(n++, dummy.matrix);
}
cabelo.count = n;
cabeca.add(cabelo);

/* ---------- interação com o mouse ---------- */
let alvoX = 0, alvoY = 0;
addEventListener('pointermove', (e) => {
  alvoY = (e.clientX / innerWidth - 0.5) * 1.4;
  alvoX = (e.clientY / innerHeight - 0.5) * 0.9;
});

addEventListener('resize', () => {
  camera.aspect = larg() / alt();
  camera.updateProjectionMatrix();
  renderer.setSize(larg(), alt());
});

const relogio = new THREE.Clock();
function animar() {
  const t = relogio.getElapsedTime();
  cabeca.rotation.y += (alvoY - cabeca.rotation.y) * 0.08;
  cabeca.rotation.x += (alvoX - cabeca.rotation.x) * 0.08;
  corpo.rotation.y += (alvoY * 0.25 - corpo.rotation.y) * 0.05;

  const respiro = Math.sin(t * 1.6) * 0.02;
  cabeca.position.y = 0.45 + respiro;
  corpo.position.y = respiro * 0.5;

  renderer.render(scene, camera);
  requestAnimationFrame(animar);
}
animar();