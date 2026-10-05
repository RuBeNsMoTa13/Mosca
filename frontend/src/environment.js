import * as THREE from 'three';

export class VirtualArena {
  constructor() {
    this.group = new THREE.Group();
    this.fruitPos = new THREE.Vector3(18.0, 0, 14.0);

    this.buildFloor();
    this.buildWalls();
    this.buildFruit();
    this.buildSun();
    this.buildPredator();
    this.buildFootprints();
  }

  buildFloor() {
    // 1. Piso da Arena com grade óptica
    const floorGeo = new THREE.CircleGeometry(38, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070c18,
      roughness: 0.65,
      metalness: 0.25,
      side: THREE.DoubleSide
    });
    this.floor = new THREE.Mesh(floorGeo, floorMat);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.receiveShadow = true;
    this.group.add(this.floor);

    // 2. Anéis concêntricos de navegação (Rosa dos Ventos)
    for (let r = 6; r <= 36; r += 6) {
      const ringGeo = new THREE.RingGeometry(r - 0.04, r + 0.04, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: r === 36 ? 0.45 : 0.18,
        side: THREE.DoubleSide
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.01;
      this.group.add(ringMesh);
    }

    // 3. Linhas radiais de coordenadas de bússola
    const lineMat = new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.22 });
    for (let i = 0; i < 8; i++) {
      const ang = (i * Math.PI) / 4;
      const pts = [
        new THREE.Vector3(0, 0.02, 0),
        new THREE.Vector3(Math.cos(ang) * 36, 0.02, Math.sin(ang) * 36)
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      this.group.add(new THREE.Line(geo, lineMat));
    }
  }

  buildWalls() {
    // Cúpula cilíndrica com colunas verticais de LED
    const colMat = new THREE.LineBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.25 });
    for (let i = 0; i < 16; i++) {
      const ang = (i * 2 * Math.PI) / 16;
      const x = Math.cos(ang) * 36;
      const z = Math.sin(ang) * 36;
      const pts = [new THREE.Vector3(x, 0, z), new THREE.Vector3(x, 16, z)];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      this.group.add(new THREE.Line(geo, colMat));
    }

    // Anel superior de contenção
    const topRingGeo = new THREE.RingGeometry(35.9, 36.1, 64);
    const topRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const topRing = new THREE.Mesh(topRingGeo, topRingMat);
    topRing.rotation.x = -Math.PI / 2;
    topRing.position.y = 16;
    this.group.add(topRing);
  }

  buildFruit() {
    this.fruitGroup = new THREE.Group();
    this.fruitGroup.position.copy(this.fruitPos);

    // 1. Corpo volumétrico da fruta (morangos / frutas doces)
    const fruitGeo = new THREE.SphereGeometry(1.8, 24, 24);
    fruitGeo.scale(1.0, 1.25, 1.0);
    const fruitMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.25,
      metalness: 0.1,
      bumpScale: 0.05
    });
    this.fruitMesh = new THREE.Mesh(fruitGeo, fruitMat);
    this.fruitMesh.position.y = 1.9;
    this.fruitMesh.castShadow = true;
    this.fruitGroup.add(this.fruitMesh);

    // 2. Coroa e folhas verdes do caule
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 });
    const stalkGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.8, 8);
    const stalk = new THREE.Mesh(stalkGeo, stemMat);
    stalk.position.set(0, 3.8, 0);
    stalk.rotation.z = 0.2;
    this.fruitGroup.add(stalk);

    for (let i = 0; i < 5; i++) {
      const ang = (i * 2 * Math.PI) / 5;
      const leafGeo = new THREE.ConeGeometry(0.35, 1.2, 5);
      const leaf = new THREE.Mesh(leafGeo, stemMat);
      leaf.position.set(Math.cos(ang) * 0.6, 3.5, Math.sin(ang) * 0.6);
      leaf.rotation.set(0.6 * Math.sin(ang), ang, 0.6 * Math.cos(ang));
      this.fruitGroup.add(leaf);
    }

    // 3. Luz pontual suave de néctar doce
    const fruitLight = new THREE.PointLight(0xef4444, 2.5, 12);
    fruitLight.position.set(0, 2.5, 0);
    this.fruitGroup.add(fruitLight);

    // 4. Partículas flutuantes de néctar & aroma
    const pCount = 35;
    const pGeo = new THREE.BufferGeometry();
    const pCoords = [];
    for (let i = 0; i < pCount; i++) {
      pCoords.push(
        (Math.random() - 0.5) * 4.5,
        Math.random() * 4.0 + 0.5,
        (Math.random() - 0.5) * 4.5
      );
    }
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pCoords, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.18,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    this.particles = new THREE.Points(pGeo, pMat);
    this.fruitGroup.add(this.particles);

    // 5. Ondas de aroma concêntricas no solo
    for (let ar = 2.8; ar <= 7.0; ar += 2.0) {
      const aGeo = new THREE.RingGeometry(ar - 0.05, ar + 0.05, 32);
      const aMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
      const aMesh = new THREE.Mesh(aGeo, aMat);
      aMesh.rotation.x = -Math.PI / 2;
      aMesh.position.y = 0.02;
      this.fruitGroup.add(aMesh);
    }

    this.group.add(this.fruitGroup);
  }

  buildSun() {
    // Sol Polarizado no alto
    this.sunGroup = new THREE.Group();
    this.sunGroup.position.set(16, 24, -16);

    const sunGeo = new THREE.SphereGeometry(2.5, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.sunGroup.add(sunMesh);

    // Raio de luz estelar para o solo
    const rayPts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(-16, -24, 16)];
    const rayGeo = new THREE.BufferGeometry().setFromPoints(rayPts);
    const rayMat = new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.35 });
    this.sunGroup.add(new THREE.Line(rayGeo, rayMat));

    this.group.add(this.sunGroup);
  }

  buildPredator() {
    // Sombra ameaçadora do predador na parede
    const predGeo = new THREE.CircleGeometry(4.5, 32);
    const predMat = new THREE.MeshBasicMaterial({
      color: 0xdc2626,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    this.predatorMesh = new THREE.Mesh(predGeo, predMat);
    this.predatorMesh.position.set(-24, 12, -22);
    this.predatorMesh.rotation.y = Math.PI / 4;
    this.group.add(this.predatorMesh);
  }

  buildFootprints() {
    this.footprints = [];
    this.footprintGeo = new THREE.CircleGeometry(0.12, 8);
    this.footprintMat = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
  }

  addFootprint(x, z) {
    if (this.footprints.length > 80) {
      const old = this.footprints.shift();
      this.group.remove(old);
    }
    const fp = new THREE.Mesh(this.footprintGeo, this.footprintMat);
    fp.rotation.x = -Math.PI / 2;
    fp.position.set(x, 0.03, z);
    this.group.add(fp);
    this.footprints.push(fp);
  }

  update(dt) {
    const time = performance.now() * 0.001;
    // Animação sutil das partículas de aroma da fruta
    if (this.particles) {
      this.particles.rotation.y = time * 0.25;
    }
    // Pulsação sutil da sombra ameaçadora
    if (this.predatorMesh) {
      const scale = 1.0 + 0.12 * Math.sin(time * 3);
      this.predatorMesh.scale.set(scale, scale, 1);
    }
  }
}
