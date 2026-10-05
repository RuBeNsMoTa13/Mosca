import * as THREE from 'three';
import { bioAudio } from './audio.js';

export class BiologicalFly {
  constructor() {
    this.group = new THREE.Group();

    // Estado de locomoção
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.heading = 0; // radianos
    this.isWalking = false;
    this.gaitPhase = 0;
    this.stepCount = 0;
    this.distanceWalked = 0;
    this.isFeeding = false;
    this.proboscisExtend = 0;
    this.isFlying = false;
    this.wingAngle = 0;
    this.isXRay = false;

    // Sistema de Fome & Metabolismo
    this.hunger = 42.0; // 0 = 100% saciada, 100 = inanição / fome crítica
    this.metabolicRate = 1.0;

    // Frenagem e Pouso Biológico (DNp09)
    this.isLanding = false;

    // Pulso bioelétrico dos nervos motores
    this.nervePulse = 0;

    // Materiais PBR Realistas de Drosophila melanogaster
    this.cuticleMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b221b,
      roughness: 0.38,
      metalness: 0.22,
      transparent: true,
      opacity: 1.0,
    });

    this.scutellumMaterial = new THREE.MeshStandardMaterial({
      color: 0x382c22,
      roughness: 0.35,
      metalness: 0.20,
      transparent: true,
      opacity: 1.0,
    });

    this.abdomenMaterial = new THREE.MeshStandardMaterial({
      color: 0xc97a18,
      roughness: 0.42,
      metalness: 0.15,
      transparent: true,
      opacity: 1.0,
    });

    this.abdomenStripeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a140f,
      roughness: 0.38,
      metalness: 0.18,
      transparent: true,
      opacity: 1.0,
    });

    this.abdomenTipMaterial = new THREE.MeshStandardMaterial({
      color: 0x120d09,
      roughness: 0.30,
      metalness: 0.25,
      transparent: true,
      opacity: 1.0,
    });

    this.eyeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x991b1b,
      emissive: 0x450a0a,
      roughness: 0.12,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: 1.0,
    });

    this.wingMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.88,
      opacity: 0.70,
      transparent: true,
      roughness: 0.08,
      ior: 1.45,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.wingVeinMaterial = new THREE.LineBasicMaterial({
      color: 0x6d4827,
      transparent: true,
      opacity: 0.78,
      linewidth: 1
    });

    this.legMaterial = new THREE.MeshStandardMaterial({
      color: 0xa16207,
      roughness: 0.48,
      metalness: 0.20,
      transparent: true,
      opacity: 1.0,
    });

    this.jointMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.32,
      metalness: 0.30,
      transparent: true,
      opacity: 1.0,
    });

    this.buildBody();
    this.buildWings();
    this.buildLegs();
    this.buildMotorNerves();

    // Sombra suave sob a mosca
    const shadowGeo = new THREE.CircleGeometry(1.6, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.55
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.02;
    this.group.add(this.shadowMesh);
  }

  buildBody() {
    // 1. Tórax (Mesonoto muscular dorsal)
    const thoraxGeo = new THREE.SphereGeometry(1.2, 28, 24);
    thoraxGeo.scale(1.0, 0.95, 1.25);
    this.thorax = new THREE.Mesh(thoraxGeo, this.cuticleMaterial);
    this.thorax.position.set(0, 1.6, 0);
    this.thorax.castShadow = true;
    this.group.add(this.thorax);

    // Escutelo (Escudo triangular posterior do tórax - traço marcante dos dípteros)
    const scutellumGeo = new THREE.ConeGeometry(0.52, 0.62, 16);
    scutellumGeo.rotateX(Math.PI / 2);
    scutellumGeo.scale(1.25, 0.50, 1.0);
    this.scutellum = new THREE.Mesh(scutellumGeo, this.scutellumMaterial);
    this.scutellum.position.set(0, 2.05, -0.92);
    this.scutellum.castShadow = true;
    this.group.add(this.scutellum);

    // Conectivo Cervical (Pescoço flexível unindo cabeça ao tórax)
    const neckGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.45, 16);
    neckGeo.rotateX(Math.PI / 2);
    const neckMesh = new THREE.Mesh(neckGeo, this.cuticleMaterial);
    neckMesh.position.set(0, 1.52, 0.85);
    this.group.add(neckMesh);

    // 2. Cabeça
    const headGeo = new THREE.SphereGeometry(0.85, 22, 20);
    headGeo.scale(1.05, 0.9, 0.95);
    this.head = new THREE.Mesh(headGeo, this.cuticleMaterial);
    this.head.position.set(0, 1.5, 1.5);
    this.head.castShadow = true;
    this.group.add(this.head);

    // Olhos Compostos Rubi (Grandes, reniformes, facetados)
    const eyeGeo = new THREE.SphereGeometry(0.56, 20, 20);
    eyeGeo.scale(0.82, 1.18, 1.12);
    this.eyeL = new THREE.Mesh(eyeGeo, this.eyeMaterial);
    this.eyeL.position.set(0.65, 0.15, 0.1);
    this.eyeL.rotation.y = 0.35;
    this.head.add(this.eyeL);

    this.eyeR = new THREE.Mesh(eyeGeo, this.eyeMaterial);
    this.eyeR.position.set(-0.65, 0.15, 0.1);
    this.eyeR.rotation.y = -0.35;
    this.head.add(this.eyeR);

    // Ocelos (3 olhos simples no topo do crânio / vértex da mosca)
    const ocelliMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xca8a04,
      roughness: 0.12,
      metalness: 0.20
    });
    const ocellusGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const oc1 = new THREE.Mesh(ocellusGeo, ocelliMat);
    oc1.position.set(0, 0.78, 0.12);
    const oc2 = new THREE.Mesh(ocellusGeo, ocelliMat);
    oc2.position.set(0.08, 0.74, 0.02);
    const oc3 = new THREE.Mesh(ocellusGeo, ocelliMat);
    oc3.position.set(-0.08, 0.74, 0.02);
    this.head.add(oc1, oc2, oc3);

    // Antenas e Aristídeos Plumosos (com ramos laterais sensoriais)
    const antMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 });
    const antLGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0.2, 0.25, 0.6),
      new THREE.Vector3(0.35, 0.6, 1.1),
      new THREE.Vector3(0.5, 0.8, 1.4)
    ]);
    this.head.add(new THREE.Line(antLGeo, antMat));

    // Cerdas laterais da arista esquerda (plumose hairs)
    const plumLGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0.35, 0.6, 1.1), new THREE.Vector3(0.48, 0.72, 1.15),
      new THREE.Vector3(0.42, 0.7, 1.25), new THREE.Vector3(0.55, 0.82, 1.30)
    ]);
    this.head.add(new THREE.LineSegments(plumLGeo, antMat));

    const antRGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.2, 0.25, 0.6),
      new THREE.Vector3(-0.35, 0.6, 1.1),
      new THREE.Vector3(-0.5, 0.8, 1.4)
    ]);
    this.head.add(new THREE.Line(antRGeo, antMat));

    const plumRGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.35, 0.6, 1.1), new THREE.Vector3(-0.48, 0.72, 1.15),
      new THREE.Vector3(-0.42, 0.7, 1.25), new THREE.Vector3(-0.55, 0.82, 1.30)
    ]);
    this.head.add(new THREE.LineSegments(plumRGeo, antMat));

    // Probóscide (Aparelho bucal retrátil)
    const prGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.8, 12);
    prGeo.translate(0, -0.4, 0);
    this.proboscis = new THREE.Mesh(prGeo, this.cuticleMaterial);
    this.proboscis.position.set(0, -0.4, 0.4);
    this.proboscis.rotation.x = 0.4;
    this.head.add(this.proboscis);

    // Esponja labial na ponta da probóscide
    const labGeo = new THREE.SphereGeometry(0.18, 10, 10);
    labGeo.scale(1.2, 0.5, 1.0);
    const labMesh = new THREE.Mesh(labGeo, this.abdomenMaterial);
    labMesh.position.set(0, -0.8, 0);
    this.proboscis.add(labMesh);

    // 3. Abdômen Segmentado Biológico (6 Tergitos com faixas pretas e ápice escuro de Drosophila)
    this.abdomen = new THREE.Group();
    this.abdomen.position.set(0, 1.40, -0.80);
    this.group.add(this.abdomen);

    // Segmentos anatômicos de A1 a A6
    const segConfigs = [
      { z: -0.10, sx: 0.84, sy: 0.60, sz: 0.36, mat: this.abdomenMaterial, stripe: true, sRatio: 0.28 },
      { z: -0.42, sx: 0.96, sy: 0.68, sz: 0.40, mat: this.abdomenMaterial, stripe: true, sRatio: 0.32 },
      { z: -0.78, sx: 1.00, sy: 0.70, sz: 0.42, mat: this.abdomenMaterial, stripe: true, sRatio: 0.35 },
      { z: -1.14, sx: 0.92, sy: 0.64, sz: 0.40, mat: this.abdomenMaterial, stripe: true, sRatio: 0.42 },
      { z: -1.48, sx: 0.78, sy: 0.54, sz: 0.38, mat: this.abdomenTipMaterial, stripe: false },
      { z: -1.80, sx: 0.58, sy: 0.44, sz: 0.44, mat: this.abdomenTipMaterial, stripe: false }
    ];

    segConfigs.forEach((cfg) => {
      const segGeo = new THREE.SphereGeometry(1.0, 18, 16);
      segGeo.scale(cfg.sx, cfg.sy, cfg.sz);
      const segMesh = new THREE.Mesh(segGeo, cfg.mat);
      segMesh.position.set(0, 0, cfg.z);
      segMesh.castShadow = true;
      this.abdomen.add(segMesh);

      // Faixa posterior de melanina característica de cada tergito
      if (cfg.stripe) {
        const stripeGeo = new THREE.SphereGeometry(1.01, 18, 16);
        stripeGeo.scale(cfg.sx * 1.01, cfg.sy * 1.01, cfg.sz * cfg.sRatio);
        const stripeMesh = new THREE.Mesh(stripeGeo, this.abdomenStripeMaterial);
        stripeMesh.position.set(0, 0, cfg.z - cfg.sz * (1 - cfg.sRatio) * 0.5);
        this.abdomen.add(stripeMesh);
      }
    });
  }

  buildWings() {
    this.wingsGroup = new THREE.Group();
    // Posicionamento dorsolateral no mesotórax (garante que as asas repousem sobre o dorso do abdômen)
    this.wingsGroup.position.set(0, 2.28, -0.18);
    this.group.add(this.wingsGroup);

    // Geometria da asa anatômica de Drosophila melanogaster
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.bezierCurveTo(0.35, 0.6, 0.65, 1.8, 0.60, 3.0);
    wingShape.bezierCurveTo(0.55, 3.5, 0.25, 3.65, 0.0, 3.60);
    wingShape.bezierCurveTo(-0.45, 3.4, -0.65, 2.2, -0.60, 1.2);
    wingShape.bezierCurveTo(-0.45, 0.4, -0.20, 0.1, 0, 0);

    const wingGeo = new THREE.ShapeGeometry(wingShape);

    // Traçado das Nervuras Alares (L1 Costa, L2 R2+3, L3 R4+5, L4 M1, L5 CuA1 e transversais r-m, m-cu)
    const veinPaths = [
      [ [0, 0.1, 0.002], [0.30, 0.8, 0.002], [0.55, 1.8, 0.002], [0.58, 2.8, 0.002] ],
      [ [0, 0.1, 0.002], [0.22, 1.0, 0.002], [0.42, 2.2, 0.002], [0.46, 3.1, 0.002] ],
      [ [0, 0.1, 0.002], [0.12, 1.2, 0.002], [0.22, 2.4, 0.002], [0.18, 3.5, 0.002] ],
      [ [0, 0.1, 0.002], [-0.02, 1.1, 0.002], [-0.08, 2.2, 0.002], [-0.14, 3.3, 0.002] ],
      [ [0, 0.1, 0.002], [-0.20, 0.7, 0.002], [-0.38, 1.4, 0.002], [-0.46, 2.0, 0.002] ],
      [ [0.14, 1.8, 0.002], [-0.06, 1.75, 0.002] ],
      [ [-0.08, 2.3, 0.002], [-0.34, 2.1, 0.002] ]
    ];

    const createWingWithVeins = () => {
      const wingMesh = new THREE.Mesh(wingGeo, this.wingMaterial);
      veinPaths.forEach((pts) => {
        const v3s = pts.map((p) => new THREE.Vector3(...p));
        let geo;
        if (v3s.length > 2) {
          const curve = new THREE.CatmullRomCurve3(v3s);
          geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(14));
        } else {
          geo = new THREE.BufferGeometry().setFromPoints(v3s);
        }
        const line = new THREE.Line(geo, this.wingVeinMaterial);
        wingMesh.add(line);
      });
      return wingMesh;
    };

    // Escleritos axilares / Bases articulares alares (Hinges no mesotórax)
    const hingeGeo = new THREE.SphereGeometry(0.12, 10, 8);
    hingeGeo.scale(1.3, 0.7, 1.0);

    // Asa Esquerda (repousa perfeitamente sobre o dorso do abdômen)
    this.wingL = createWingWithVeins();
    this.wingL.position.set(0.46, 0, 0);
    this.wingL.rotation.set(-Math.PI / 2 - 0.04, 0.03, 0.10);
    this.wingsGroup.add(this.wingL);

    this.wingHingeL = new THREE.Mesh(hingeGeo, this.jointMaterial);
    this.wingHingeL.position.set(0.46, 0, 0);
    this.wingsGroup.add(this.wingHingeL);

    // Asa Direita (com micro-elevação de 0.02 para sobreposição natural de asas sem z-fighting)
    this.wingR = createWingWithVeins();
    this.wingR.position.set(-0.46, 0.02, 0);
    this.wingR.scale.set(-1, 1, 1);
    this.wingR.rotation.set(-Math.PI / 2 - 0.04, -0.03, -0.10);
    this.wingsGroup.add(this.wingR);

    this.wingHingeR = new THREE.Mesh(hingeGeo, this.jointMaterial);
    this.wingHingeR.position.set(-0.46, 0.02, 0);
    this.wingsGroup.add(this.wingHingeR);

    // Haltères Metatorácicos (Órgãos de Equilíbrio / Giroscópios em T3)
    this.halteresGroup = new THREE.Group();
    this.halteresGroup.position.set(0, 1.70, -0.48);
    this.group.add(this.halteresGroup);

    const stalkGeo = new THREE.CylinderGeometry(0.018, 0.025, 0.24, 6);
    stalkGeo.translate(0, 0.12, 0);
    stalkGeo.rotateZ(Math.PI / 2);
    const bulbGeo = new THREE.SphereGeometry(0.065, 8, 8);
    bulbGeo.scale(1.2, 0.8, 0.8);

    // Haltère Esquerdo
    this.haltereL = new THREE.Group();
    this.haltereL.position.set(0.55, 0, 0);
    const stalkL = new THREE.Mesh(stalkGeo, this.jointMaterial);
    const bulbL = new THREE.Mesh(bulbGeo, this.cuticleMaterial);
    bulbL.position.set(0.24, 0, 0);
    this.haltereL.add(stalkL);
    this.haltereL.add(bulbL);
    this.halteresGroup.add(this.haltereL);

    // Haltère Direito
    this.haltereR = new THREE.Group();
    this.haltereR.position.set(-0.55, 0, 0);
    this.haltereR.scale.x = -1;
    const stalkR = new THREE.Mesh(stalkGeo, this.jointMaterial);
    const bulbR = new THREE.Mesh(bulbGeo, this.cuticleMaterial);
    bulbR.position.set(0.24, 0, 0);
    this.haltereR.add(stalkR);
    this.haltereR.add(bulbR);
    this.halteresGroup.add(this.haltereR);
  }

  buildLegs() {
    this.legs = [];

    // Configuração das 6 pernas biológicas acopladas aos 3 neuromeros do VNC (T1, T2, T3):
    // origin: ponto de ancoragem no esterno ventral do tórax (adjacente ao VNC)
    // root (x, y, z): articulação trocanteriana da perna
    const legConfigs = [
      { id: 'L1', origin: [0.28, 1.10, 0.45], x: 0.58, y: 1.30, z: 0.52, side: 1, angle: 0.42, group: 'A' },
      { id: 'R1', origin: [-0.28, 1.10, 0.45], x: -0.58, y: 1.30, z: 0.52, side: -1, angle: -0.42, group: 'B' },
      { id: 'L2', origin: [0.38, 1.05, 0.00], x: 0.78, y: 1.25, z: 0.00, side: 1, angle: 1.45, group: 'B' },
      { id: 'R2', origin: [-0.38, 1.05, 0.00], x: -0.78, y: 1.25, z: 0.00, side: -1, angle: -1.45, group: 'A' },
      { id: 'L3', origin: [0.32, 1.05, -0.50], x: 0.65, y: 1.22, z: -0.54, side: 1, angle: 2.35, group: 'A' },
      { id: 'R3', origin: [-0.32, 1.05, -0.50], x: -0.65, y: 1.22, z: -0.54, side: -1, angle: -2.35, group: 'B' },
    ];

    legConfigs.forEach((cfg) => {
      // 1. Coxa muscular conectando o esterno torácico à articulação da perna
      const pOrig = new THREE.Vector3(...cfg.origin);
      const pRoot = new THREE.Vector3(cfg.x, cfg.y, cfg.z);
      const coxaMesh = this._createConnectingCylinder(pOrig, pRoot, 0.14, 0.10, this.cuticleMaterial);
      this.group.add(coxaMesh);

      // 2. Base da perna no trocanter
      const legRoot = new THREE.Group();
      legRoot.position.copy(pRoot);

      // Trocanter (junta esférica entre coxa e fêmur)
      const trochanter = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), this.jointMaterial);
      legRoot.add(trochanter);

      // 3. Fêmur
      const femurGeo = new THREE.CylinderGeometry(0.07, 0.055, 0.52, 10);
      femurGeo.translate(0, -0.26, 0);
      const femur = new THREE.Mesh(femurGeo, this.legMaterial);
      femur.rotation.z = cfg.side * 0.72;
      femur.rotation.y = cfg.angle;
      legRoot.add(femur);

      // 4. Joelho (articulação)
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), this.jointMaterial);
      knee.position.set(0, -0.52, 0);
      femur.add(knee);

      // 5. Tíbia
      const tibiaGeo = new THREE.CylinderGeometry(0.045, 0.03, 0.58, 10);
      tibiaGeo.translate(0, -0.29, 0);
      const tibia = new THREE.Mesh(tibiaGeo, this.legMaterial);
      tibia.rotation.z = -cfg.side * 0.88;
      knee.add(tibia);

      // 6. Tarso / Pata (toca o chão perfeitamente sem entrar no solo)
      const tarsusGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.26, 8);
      tarsusGeo.translate(0, -0.13, 0.04);
      const tarsus = new THREE.Mesh(tarsusGeo, this.legMaterial);
      tarsus.rotation.x = -0.4;
      tarsus.position.set(0, -0.58, 0);
      tibia.add(tarsus);

      this.group.add(legRoot);

      this.legs.push({
        id: cfg.id,
        root: legRoot,
        coxa: coxaMesh,
        femur,
        knee,
        tibia,
        tarsus,
        baseAngle: cfg.angle,
        side: cfg.side,
        group: cfg.group,
      });
    });
  }

  buildMotorNerves() {
    this.motorNervesGroup = new THREE.Group();
    this.motorNervesGroup.visible = false;
    this.group.add(this.motorNervesGroup);

    // Material de nervo eferente luminoso (Ciano elétrico bioativo com AdditiveBlending)
    this.motorNerveMaterial = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    // Material de junções neuromusculares (NMJ - Botões sinápticos dourados)
    this.nmjMaterial = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.95
    });

    const nmjGeo = new THREE.SphereGeometry(0.055, 8, 8);

    // 1. Nervos Motores das 6 Pernas (ligando os neuromeros T1, T2, T3 do VNC às Coxas)
    const legNervePaths = [
      { vnc: [0.10, 1.10, 0.45], coxaMid: [0.35, 1.18, 0.48], term: [0.58, 1.30, 0.52], group: 'A' },
      { vnc: [-0.10, 1.10, 0.45], coxaMid: [-0.35, 1.18, 0.48], term: [-0.58, 1.30, 0.52], group: 'B' },
      { vnc: [0.14, 1.05, 0.00], coxaMid: [0.45, 1.12, 0.00], term: [0.78, 1.25, 0.00], group: 'B' },
      { vnc: [-0.14, 1.05, 0.00], coxaMid: [-0.45, 1.12, 0.00], term: [-0.78, 1.25, 0.00], group: 'A' },
      { vnc: [0.10, 1.05, -0.50], coxaMid: [0.38, 1.12, -0.52], term: [0.65, 1.22, -0.54], group: 'A' },
      { vnc: [-0.10, 1.05, -0.50], coxaMid: [-0.38, 1.12, -0.52], term: [-0.65, 1.22, -0.54], group: 'B' },
    ];

    this.legNerveLines = [];
    legNervePaths.forEach((lp) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(...lp.vnc),
        new THREE.Vector3(...lp.coxaMid),
        new THREE.Vector3(...lp.term)
      ]);
      const pts = curve.getPoints(8);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, this.motorNerveMaterial.clone());
      this.motorNervesGroup.add(line);
      this.legNerveLines.push({ line, group: lp.group });

      // NMJ no trocanter
      const nmj = new THREE.Mesh(nmjGeo, this.nmjMaterial);
      nmj.position.set(...lp.term);
      this.motorNervesGroup.add(nmj);

      // Fibrilas musculares secundárias na coxa
      const fib1Geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...lp.coxaMid),
        new THREE.Vector3(lp.term[0] * 0.85, lp.term[1] - 0.08, lp.term[2] + 0.06)
      ]);
      this.motorNervesGroup.add(new THREE.Line(fib1Geo, this.motorNerveMaterial));
    });

    // 2. Nervos Motores Alares (Wing Motor Nerves de T2 subindo aos escleritos das Asas)
    const wingNervePaths = [
      { vnc: [0.12, 1.15, -0.05], mid: [0.35, 1.70, -0.12], term: [0.46, 2.26, -0.18] },
      { vnc: [-0.12, 1.15, -0.05], mid: [-0.35, 1.70, -0.12], term: [-0.46, 2.26, -0.18] }
    ];

    this.wingNerveLines = [];
    wingNervePaths.forEach((wp) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(...wp.vnc),
        new THREE.Vector3(...wp.mid),
        new THREE.Vector3(...wp.term)
      ]);
      const pts = curve.getPoints(14);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, this.motorNerveMaterial.clone());
      this.motorNervesGroup.add(line);
      this.wingNerveLines.push(line);

      // NMJ sináptica na base da asa
      const nmj = new THREE.Mesh(nmjGeo, this.nmjMaterial);
      nmj.position.set(...wp.term);
      this.motorNervesGroup.add(nmj);

      // Fibrilas nos músculos indiretos de voo (DVM/DLM no mesotórax)
      const dvmGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...wp.mid),
        new THREE.Vector3(wp.mid[0] * 0.7, wp.mid[1] + 0.15, wp.mid[2] + 0.18)
      ]);
      this.motorNervesGroup.add(new THREE.Line(dvmGeo, this.motorNerveMaterial));

      const dlmGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...wp.mid),
        new THREE.Vector3(wp.mid[0] * 0.6, wp.mid[1] + 0.18, wp.mid[2] - 0.22)
      ]);
      this.motorNervesGroup.add(new THREE.Line(dlmGeo, this.motorNerveMaterial));
    });

    // 3. Nervos dos Haltères (Sensoriomotor de T3 aos giroscópios)
    const haltereNerves = [
      { vnc: [0.10, 1.08, -0.48], term: [0.55, 1.70, -0.48] },
      { vnc: [-0.10, 1.08, -0.48], term: [-0.55, 1.70, -0.48] }
    ];
    haltereNerves.forEach((hp) => {
      const hGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...hp.vnc),
        new THREE.Vector3(...hp.term)
      ]);
      this.motorNervesGroup.add(new THREE.Line(hGeo, this.motorNerveMaterial));
    });
  }

  // Helper para cilindros de conexão direcional
  _createConnectingCylinder(p1, p2, r1, r2, material) {
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(r2, r1, len, 10);
    geo.translate(0, len / 2, 0);
    geo.rotateX(Math.PI / 2);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.copy(p1);
    mesh.lookAt(p2);
    return mesh;
  }

  // Acionamento do Freio de Pouso & Desaceleração (Sinapse DNp09)
  initiateBrakeOrLanding() {
    if (this.isFlying || this.y > 0.05) {
      // Se estiver no ar, inicia descida suave de pouso com pernas estendidas e corte de asas
      this.isLanding = true;
      this.isWalking = false;
      this.isFlying = false;
      bioAudio.playWingFlutter();
    } else {
      // Já está no solo: parada imediata / freio total
      this.isWalking = false;
      this.isFlying = false;
      this.isLanding = false;
    }
  }

  // Atualização em tempo real da animação (chamada a cada frame de renderização)
  update(dt) {
    const time = performance.now() * 0.001;

    // 1. Metabolismo & Fome Biológica
    let hungerRate = 0.45; // taxa basal em repouso
    if (this.isFlying) {
      hungerRate = 2.4; // Batimento alar a 210 Hz tem custo energético altíssimo
      this.metabolicRate = 2.4;
    } else if (this.isWalking) {
      hungerRate = 1.1; // Gasto motor nas 6 pernas
      this.metabolicRate = 1.2;
    } else {
      this.metabolicRate = 1.0;
    }

    if (this.isFeeding) {
      // Ao lamber o néctar do morango com a probóscide, sacia a fome rapidamente!
      this.hunger = Math.max(0, this.hunger - dt * 26.0);
    } else {
      this.hunger = Math.min(100, this.hunger + dt * hungerRate);
    }

    // Respiração sutil do abdômen
    const breath = 1.0 + 0.025 * Math.sin(time * 3.5);
    this.abdomen.scale.set(breath, breath, 1.0);

    // 2. Extensão da probóscide para lamber o açúcar ao chegar perto
    if (this.isFeeding) {
      this.proboscisExtend = Math.min(1.0, this.proboscisExtend + dt * 2.5);
      this.proboscis.position.y = -0.4 - 0.45 * this.proboscisExtend;
      this.proboscis.rotation.x = 0.4 + 0.3 * Math.sin(time * 8);
    } else {
      this.proboscisExtend = Math.max(0.0, this.proboscisExtend - dt * 2.0);
      this.proboscis.position.y = -0.4 - 0.45 * this.proboscisExtend;
      this.proboscis.rotation.x = 0.4;
    }

    // 3. Pouso Suave Controlado (DNp09) ou Voo ou Marcha
    if (this.isLanding) {
      // Descida gradual controlada
      this.isWalking = false;
      this.y = Math.max(0, this.y - dt * 5.8);

      // Desaceleração suave das asas e haltères (recolhendo para trás sobre o abdômen)
      this.wingAngle += dt * 38;
      const landFlap = Math.sin(this.wingAngle) * 0.15;
      this.wingL.rotation.set(-Math.PI / 2 - 0.04, 0.03, 0.10 - landFlap * 0.4);
      this.wingR.rotation.set(-Math.PI / 2 - 0.04, -0.03, -0.10 + landFlap * 0.4);
      if (this.haltereL) this.haltereL.rotation.z = -Math.sin(this.wingAngle) * 0.3;
      if (this.haltereR) this.haltereR.rotation.z = Math.sin(this.wingAngle) * 0.3;

      // Postura de trem de pouso reflexo (landing response: pernas estendidas prontas para o choque)
      this.legs.forEach((leg) => {
        leg.femur.rotation.y = leg.baseAngle + 0.10 * leg.side;
        leg.femur.rotation.z = leg.side * 0.65;
        leg.tibia.rotation.z = -leg.side * 0.82;
      });

      // Tocou o solo!
      if (this.y <= 0) {
        this.y = 0;
        this.isLanding = false;
        this.isFlying = false;
        this.isWalking = false;
        bioAudio.playStep();
      }
    } else if (this.isFlying) {
      this.isWalking = false;
      this.wingAngle += dt * 85; // Alta velocidade alar (210 Hz biológico)
      // Asas abertas lateralmente e batendo em alta frequência
      const flap = Math.sin(this.wingAngle) * 0.45;
      this.wingL.rotation.set(-Math.PI / 2 + flap * 0.35, flap * 0.20, -1.25 + flap * 0.25);
      this.wingR.rotation.set(-Math.PI / 2 + flap * 0.35, -flap * 0.20, 1.25 - flap * 0.25);
      if (this.haltereL) this.haltereL.rotation.z = -Math.sin(this.wingAngle) * 0.6;
      if (this.haltereR) this.haltereR.rotation.z = Math.sin(this.wingAngle) * 0.6;

      // Pernas recolhidas suavemente durante o voo aerodinâmico
      this.legs.forEach((leg) => {
        leg.femur.rotation.y = leg.baseAngle;
        leg.femur.rotation.z = leg.side * 0.35;
        leg.tibia.rotation.z = -leg.side * 1.35;
      });
    } else {
      // No solo ou caindo se estiver solto no ar
      if (this.y > 0.05) {
        // Proteção contra suspensão no ar: gravidade desce a mosca
        this.y = Math.max(0, this.y - dt * 7.5);
        this.isWalking = false;
        if (this.y <= 0) {
          this.y = 0;
          bioAudio.playStep();
        }
      }

      if (this.isWalking && this.y <= 0.05) {
        // Vibração alar sutil dobrada sobre o abdômen ao caminhar
        const scissor = 0.03 * Math.sin(time * 12);
        this.wingL.rotation.set(-Math.PI / 2 - 0.04, 0.03, 0.10 + scissor);
        this.wingR.rotation.set(-Math.PI / 2 - 0.04, -0.03, -0.10 - scissor);
        if (this.haltereL) this.haltereL.rotation.z = 0;
        if (this.haltereR) this.haltereR.rotation.z = 0;

        // Marcha Tripodal Biológica Real (Tripod Gait)
        this.gaitPhase += dt * 7.5; // Frequência da caminhada

        const prevPhaseInt = Math.floor((this.gaitPhase - dt * 7.5) / Math.PI);
        const curPhaseInt = Math.floor(this.gaitPhase / Math.PI);
        if (curPhaseInt > prevPhaseInt) {
          this.stepCount++;
          bioAudio.playStep();
        }

        this.legs.forEach((leg) => {
          // Tripé A vs Tripé B em oposição de fase (pi radianos)
          const phaseOffset = leg.group === 'A' ? 0 : Math.PI;
          const phase = this.gaitPhase + phaseOffset;

          // Swing: perna levanta e avança; Stance: perna apoia no solo
          const swing = Math.sin(phase);
          const lift = Math.max(0, swing); // só sobe na fase positiva

          leg.femur.rotation.y = leg.baseAngle + Math.cos(phase) * 0.24 * leg.side;
          leg.femur.rotation.z = leg.side * (0.72 - lift * 0.26);
          leg.tibia.rotation.z = -leg.side * (0.88 + lift * 0.28);
        });

        // Oscilação vertical e lateral sutil do corpo ao caminhar
        this.thorax.position.y = 1.6 + 0.04 * Math.abs(Math.sin(this.gaitPhase * 2));
        this.head.position.y = 1.5 + 0.03 * Math.sin(this.gaitPhase * 2);
      } else {
        // Posição de repouso das asas: dobradas elegantemente para TRÁS (-Z) sobre o abdômen
        this.wingL.rotation.set(-Math.PI / 2 - 0.04, 0.03, 0.10);
        this.wingR.rotation.set(-Math.PI / 2 - 0.04, -0.03, -0.10);
        if (this.haltereL) this.haltereL.rotation.z = 0;
        if (this.haltereR) this.haltereR.rotation.z = 0;

        // Repouso ou Limpeza de Patas (Grooming)
        const isGrooming = Math.sin(time * 0.6) > 0.7;

        this.legs.forEach((leg) => {
          if (isGrooming && (leg.id === 'L1' || leg.id === 'R1')) {
            // As duas patas dianteiras esfregam uma na outra
            const rub = Math.sin(time * 18);
            leg.femur.rotation.y = leg.baseAngle + rub * 0.16;
            leg.femur.rotation.z = leg.side * 0.78;
            leg.tibia.rotation.z = -leg.side * 0.75 + rub * 0.12;
          } else {
            leg.femur.rotation.y = leg.baseAngle;
            leg.femur.rotation.z = leg.side * 0.72;
            leg.tibia.rotation.z = -leg.side * 0.88;
          }
        });
        this.thorax.position.y = 1.6;
        this.head.position.y = 1.5;
      }
    }

    // 4. Bioeletricidade dos Nervos Motores Eferentes (Asas e Pernas)
    if (this.nervePulse > 0) {
      this.nervePulse = Math.max(0, this.nervePulse - dt * 3.5);
    }

    if (this.motorNervesGroup && this.motorNervesGroup.visible) {
      const pulseColor = new THREE.Color(0x00f0ff).lerp(new THREE.Color(0xffd700), this.nervePulse);

      if (this.isFlying) {
        // Voo: pulsos de alta frequência (210 Hz) nos nervos das asas
        const shimmer = 0.65 + 0.35 * Math.sin(time * 45);
        if (this.wingNerveLines) {
          this.wingNerveLines.forEach((l) => {
            l.material.color = pulseColor;
            l.material.opacity = shimmer;
          });
        }
      } else {
        if (this.wingNerveLines) {
          this.wingNerveLines.forEach((l) => {
            l.material.color = pulseColor;
            l.material.opacity = 0.5 + this.nervePulse * 0.5;
          });
        }
      }

      if (this.isWalking) {
        // Marcha: ativação motora alternada entre Tripé A e Tripé B
        const tripA = 0.4 + 0.6 * Math.max(0, Math.sin(this.gaitPhase));
        const tripB = 0.4 + 0.6 * Math.max(0, Math.sin(this.gaitPhase + Math.PI));
        if (this.legNerveLines) {
          this.legNerveLines.forEach((ln) => {
            const intensity = ln.group === 'A' ? tripA : tripB;
            ln.line.material.color = pulseColor;
            ln.line.material.opacity = 0.4 + intensity * 0.5 + this.nervePulse * 0.3;
          });
        }
      } else {
        if (this.legNerveLines) {
          this.legNerveLines.forEach((ln) => {
            ln.line.material.color = pulseColor;
            ln.line.material.opacity = 0.6 + this.nervePulse * 0.4;
          });
        }
      }

      if (this.nmjMaterial) {
        this.nmjMaterial.color = new THREE.Color(0xfbbf24).lerp(new THREE.Color(0xffffff), this.nervePulse);
      }
    }

    // Atualiza posição e inclinação do grupo no mundo 3D
    this.group.position.set(this.x, this.y, this.z);
    this.group.rotation.y = this.heading;

    // Atualiza sombra no chão
    if (this.shadowMesh) {
      this.shadowMesh.position.y = 0.02 - this.y; // mantém no chão mesmo voando
      const shadowScale = Math.max(0.2, 1.0 - this.y * 0.06);
      this.shadowMesh.scale.set(shadowScale, shadowScale, 1.0);
      this.shadowMesh.material.opacity = Math.max(0.1, 0.55 - this.y * 0.04);
    }
  }

  // CONTROLE MANUAL (WASD / SETAS / ESPAÇO)
  moveManual(keys, dt, arenaRadius = 36) {
    const isMovingForward = keys.forward;
    const isMovingBackward = keys.backward;
    const isTurningLeft = keys.left;
    const isTurningRight = keys.right;
    const isJumpOrFly = keys.jump;
    const isDescendOrLand = keys.descend;

    // Se estiver em processo de pouso controlado (DNp09)
    if (this.isLanding) {
      if (isJumpOrFly) {
        // Usuário cancela pouso e arremete
        this.isLanding = false;
        this.isFlying = true;
        this.y += 1.2;
        bioAudio.playWingFlutter();
      } else {
        const fruitDist = Math.sqrt(Math.pow(this.x - 18.0, 2) + Math.pow(this.z - 14.0, 2));
        return { speed: 0, fruitDist };
      }
    }

    // 1. Decolagem / Voo livre / Pouso
    if (isJumpOrFly) {
      if (!this.isFlying && this.y <= 0.05) {
        // Decola do solo!
        this.isFlying = true;
        this.isWalking = false;
        this.y += 1.5;
        bioAudio.playWingFlutter();
      } else {
        // Sobe na altitude
        this.isFlying = true;
        this.isWalking = false;
        this.y = Math.min(14.0, this.y + dt * 6.5);
      }
    }

    if (isDescendOrLand && (this.isFlying || this.y > 0)) {
      this.y -= dt * 7.5;
      if (this.y <= 0) {
        this.y = 0;
        this.isFlying = false;
        this.isWalking = false;
        bioAudio.playStep();
      }
    }

    // 2. Rotação / Curva (Yaw)
    const isAirborne = this.isFlying || this.y > 0.05;
    const turnSpeed = isAirborne ? 4.2 : 3.4;
    if (isTurningLeft) {
      this.heading += turnSpeed * dt;
      if (isAirborne) this.group.rotation.z = 0.28; // inclinação de curva em voo (banking)
    } else if (isTurningRight) {
      this.heading -= turnSpeed * dt;
      if (isAirborne) this.group.rotation.z = -0.28;
    } else {
      this.group.rotation.z *= 0.88;
    }

    // 3. Deslocamento Frontal / Traseiro
    let speed = 0;
    if (isAirborne) {
      // Voo livre no ar: paira no ar (hovering) parado a menos que o usuário pressione para mover
      this.isWalking = false;
      if (isMovingForward) {
        speed = 12.0; // Avanço de voo
      } else if (isMovingBackward) {
        speed = -5.0; // Voo reverso
      } else {
        speed = 0; // Pairar estático no ar (sem voar reto sozinho!)
      }

      if (speed !== 0) {
        this.x += Math.sin(this.heading) * speed * dt;
        this.z += Math.cos(this.heading) * speed * dt;
        this.distanceWalked += Math.abs(speed) * dt * 1000;
      }
    } else {
      // Locomoção no solo (marcha tripodal)
      if (isMovingForward) {
        speed = 5.8;
        this.isWalking = true;
      } else if (isMovingBackward) {
        speed = -3.2;
        this.isWalking = true;
      } else {
        this.isWalking = false;
      }

      if (this.isWalking) {
        this.x += Math.sin(this.heading) * speed * dt;
        this.z += Math.cos(this.heading) * speed * dt;
        this.distanceWalked += Math.abs(speed) * dt * 1000;
      }
    }

    // 4. Limites de colisão cilíndrica com a parede da arena
    const rCurrent = Math.sqrt(this.x * this.x + this.z * this.z);
    const maxR = arenaRadius - 1.8;
    if (rCurrent > maxR) {
      this.x = (this.x / rCurrent) * maxR;
      this.z = (this.z / rCurrent) * maxR;
    }

    // 5. Detecção de proximidade com o pequeno morango (18.0, 0, 14.0)
    const fruitDist = Math.sqrt(Math.pow(this.x - 18.0, 2) + Math.pow(this.z - 14.0, 2));
    if (fruitDist < 2.8 && this.y <= 0.6) {
      if (!this.isFeeding) {
        this.isFeeding = true;
        bioAudio.playFeedingChime();
      }
    } else {
      this.isFeeding = false;
    }

    return { speed, fruitDist };
  }

  // Caminha autonomamente em direção à fruta doce
  walkTowards(targetX, targetZ, speed, dt) {
    if (this.y > 0.05) {
      // Se estiver no ar, desce para tocar o solo e iniciar a caminhada
      this.y = Math.max(0, this.y - dt * 6.5);
      if (this.y <= 0) {
        this.y = 0;
        this.isFlying = false;
      }
    }

    const dx = targetX - this.x;
    const dz = targetZ - this.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 2.6) {
      this.isWalking = (this.y <= 0.05);
      this.isFeeding = false;

      const targetHeading = Math.atan2(dx, dz);
      let diffAngle = targetHeading - this.heading;
      while (diffAngle < -Math.PI) diffAngle += 2 * Math.PI;
      while (diffAngle > Math.PI) diffAngle -= 2 * Math.PI;
      this.heading += diffAngle * Math.min(1.0, dt * 5.0);

      const stepDist = speed * dt;
      this.x += Math.sin(this.heading) * stepDist;
      this.z += Math.cos(this.heading) * stepDist;
      this.distanceWalked += stepDist * 1000;
    } else {
      this.isWalking = false;
      if (!this.isFeeding && this.y <= 0.6) {
        this.isFeeding = true;
        bioAudio.playFeedingChime();
      }
    }
    return dist;
  }

  // Salto de fuga explosivo (fuga rápida antiesmagamento)
  performEscapeJump(dt) {
    this.isFlying = true;
    this.isWalking = false;
    this.y += dt * 16.0;
    this.z += dt * 8.0;
    bioAudio.playWingFlutter();
  }

  // Pulso elétrico propagando comandos aos nervos motores de asas e pernas
  pulseMotorNerves() {
    this.nervePulse = 1.0;
  }

  // Alterna o Modo Raio-X (Exoesqueleto Translúcido)
  setXRayMode(enabled) {
    this.isXRay = enabled;
    const targetOpacity = enabled ? 0.12 : 1.0;
    const targetDepth = !enabled;

    [
      this.cuticleMaterial,
      this.scutellumMaterial,
      this.abdomenMaterial,
      this.abdomenStripeMaterial,
      this.abdomenTipMaterial,
      this.legMaterial,
      this.jointMaterial
    ].forEach((mat) => {
      if (mat) {
        mat.opacity = targetOpacity;
        mat.depthWrite = targetDepth;
      }
    });

    this.eyeMaterial.opacity = enabled ? 0.45 : 1.0;

    if (this.motorNervesGroup) {
      this.motorNervesGroup.visible = enabled;
    }
  }
}
