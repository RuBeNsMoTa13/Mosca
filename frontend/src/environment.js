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

    // 1. Corpo volumétrico do pequeno morango (LatheGeometry com curva cônica anatômica)
    const strawberryPoints = [
      new THREE.Vector2(0.00, 0.02),   // ponta inferior (tocando o chão da arena)
      new THREE.Vector2(0.16, 0.16),
      new THREE.Vector2(0.34, 0.40),
      new THREE.Vector2(0.52, 0.72),
      new THREE.Vector2(0.68, 1.05),
      new THREE.Vector2(0.78, 1.38),   // ombro mais largo do morango
      new THREE.Vector2(0.72, 1.62),
      new THREE.Vector2(0.55, 1.82),   // topo arredondado
      new THREE.Vector2(0.28, 1.92),
      new THREE.Vector2(0.08, 1.86),   // concavidade onde entra o cabinho
      new THREE.Vector2(0.00, 1.84)
    ];

    const strawberryGeo = new THREE.LatheGeometry(strawberryPoints, 32);
    const strawberryMat = new THREE.MeshPhysicalMaterial({
      color: 0xe11d48, // Vermelho rubi vibrante de morango fresco
      roughness: 0.28,
      metalness: 0.06,
      clearcoat: 0.82,
      clearcoatRoughness: 0.16,
      reflectivity: 0.6
    });

    this.fruitMesh = new THREE.Mesh(strawberryGeo, strawberryMat);
    this.fruitMesh.castShadow = true;
    this.fruitGroup.add(this.fruitMesh);

    // 2. Sementinhas douradas realistas (Aquênios) distribuídas na casca
    const seedGeo = new THREE.SphereGeometry(0.035, 6, 6);
    seedGeo.scale(0.8, 1.3, 0.8);
    const seedMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.38,
      metalness: 0.22
    });

    const seedCount = 80;
    this.seedsMesh = new THREE.InstancedMesh(seedGeo, seedMat, seedCount);
    const dummy = new THREE.Object3D();
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const goldenAngle = 2 * Math.PI * (1 - 1 / goldenRatio);

    for (let i = 0; i < seedCount; i++) {
      const t = (i + 1) / (seedCount + 1); // 0 a 1
      const y = 0.18 + t * 1.58;
      // Perfil aproximado do raio nesta altura
      let r = 0.76 * Math.sin(t * Math.PI * 0.92);
      if (t > 0.72) r *= 1.0 - (t - 0.72) * 0.75;
      r = Math.max(0.12, r * 1.02);

      const theta = i * goldenAngle;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      dummy.position.set(x, y, z);
      dummy.rotation.set(0, theta, 0);
      dummy.updateMatrix();
      this.seedsMesh.setMatrixAt(i, dummy.matrix);
    }
    this.seedsMesh.instanceMatrix.needsUpdate = true;
    this.fruitGroup.add(this.seedsMesh);

    // 3. Cálice de sépalas verdes (Folhas no topo do morango)
    const calyxMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.42,
      side: THREE.DoubleSide
    });

    const numLeaves = 7;
    for (let i = 0; i < numLeaves; i++) {
      const ang = (i * 2 * Math.PI) / numLeaves;
      const leafShape = new THREE.Shape();
      leafShape.moveTo(0, 0);
      leafShape.quadraticCurveTo(0.16, 0.32, 0.0, 0.68);
      leafShape.quadraticCurveTo(-0.16, 0.32, 0, 0);
      const leafGeo = new THREE.ShapeGeometry(leafShape);
      const leaf = new THREE.Mesh(leafGeo, calyxMat);
      leaf.position.set(0, 1.84, 0);
      leaf.rotation.set(Math.PI / 2 - 0.22, 0, ang);
      leaf.castShadow = true;
      this.fruitGroup.add(leaf);
    }

    // 4. Pedicelo / Cabinho verde curvado
    const stalkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.84, 0),
      new THREE.Vector3(0.06, 2.12, 0.04),
      new THREE.Vector3(0.18, 2.36, 0.10)
    ]);
    const stalkGeo = new THREE.TubeGeometry(stalkCurve, 8, 0.05, 6, false);
    const stalkMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
    const stalk = new THREE.Mesh(stalkGeo, stalkMat);
    stalk.castShadow = true;
    this.fruitGroup.add(stalk);

    // 5. Luz pontual suave de néctar doce
    const fruitLight = new THREE.PointLight(0xf43f5e, 1.8, 8);
    fruitLight.position.set(0, 1.2, 0);
    this.fruitGroup.add(fruitLight);

    // 6. Partículas flutuantes de aroma adocicado do morango
    const pCount = 32;
    const pGeo = new THREE.BufferGeometry();
    const pCoords = [];
    for (let i = 0; i < pCount; i++) {
      pCoords.push(
        (Math.random() - 0.5) * 2.6,
        Math.random() * 2.4 + 0.3,
        (Math.random() - 0.5) * 2.6
      );
    }
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pCoords, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xfda4af,
      size: 0.14,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    this.particles = new THREE.Points(pGeo, pMat);
    this.fruitGroup.add(this.particles);

    // 7. Ondas de aroma concêntricas no solo ao redor do morango
    for (let ar = 1.6; ar <= 4.2; ar += 1.3) {
      const aGeo = new THREE.RingGeometry(ar - 0.04, ar + 0.04, 32);
      const aMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.22, side: THREE.DoubleSide });
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
