import * as THREE from 'three';

export class ConnectomeVisualizer {
  constructor() {
    this.group = new THREE.Group();
    // Posiciona o cérebro centrado exatamente dentro da cabeça e nuca da mosca
    this.group.position.set(0, 1.5, 1.4);
    this.group.scale.set(0.65, 0.65, 0.65);

    this.hullsGroup = new THREE.Group();
    this.skeletonGroup = new THREE.Group();
    this.synapsesGroup = new THREE.Group();

    this.group.add(this.hullsGroup);
    this.group.add(this.skeletonGroup);
    this.group.add(this.synapsesGroup);

    this.pulseIntensity = 0;
    this.currentData = null;

    // Raycasting de sinapses para tooltip
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.preInstances = null;
    this.postInstances = null;
    this.preData = [];
    this.postData = [];

    this.loadHulls();
  }

  // Carrega os volumes anatômicos do MaleCNS
  async loadHulls() {
    try {
      const res = await fetch('/data/brain_hulls.json');
      const data = await res.json();

      Object.entries(data).forEach(([key, reg]) => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(reg.vertices, 3));
        geo.setIndex(reg.indices);
        geo.computeVertexNormals();

        const mat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(reg.color),
          transparent: true,
          opacity: 0.12,
          wireframe: false,
          depthWrite: false,
          side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geo, mat);
        this.hullsGroup.add(mesh);

        // Contorno wireframe sutil
        const wireMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(reg.color),
          transparent: true,
          opacity: 0.25,
          wireframe: true,
          depthWrite: false
        });
        const wireMesh = new THREE.Mesh(geo, wireMat);
        this.hullsGroup.add(wireMesh);
      });
    } catch (e) {
      console.warn('Hulls não encontrados:', e);
    }
  }

  // Carrega e monta os neurônios e nuvem de sinapses de um circuito
  async loadCircuit(circuitId) {
    try {
      const res = await fetch(`/data/${circuitId}.json`);
      this.currentData = await res.json();

      // Limpa camadas anteriores
      while (this.skeletonGroup.children.length) {
        this.skeletonGroup.remove(this.skeletonGroup.children[0]);
      }
      while (this.synapsesGroup.children.length) {
        this.synapsesGroup.remove(this.synapsesGroup.children[0]);
      }

      // 1. Esqueleto Neuronal (Ramos axonais e dendríticos com LineSegments)
      const segs = this.currentData.segments;
      if (segs && segs.length > 0) {
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));

        this.lineMaterial = new THREE.LineBasicMaterial({
          color: 0x00ffcc,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending
        });

        this.skeletonLines = new THREE.LineSegments(lineGeo, this.lineMaterial);
        this.skeletonGroup.add(this.skeletonLines);
      }

      // 2. Pré-sinapses (🟡 Botões transmissores em ouro elétrico)
      this.preData = this.currentData.synapses_pre || [];
      if (this.preData.length > 0) {
        const sphereGeo = new THREE.SphereGeometry(0.045, 8, 8);
        this.preMaterial = new THREE.MeshBasicMaterial({
          color: 0xfbbf24,
          transparent: true,
          opacity: 0.9
        });

        this.preInstances = new THREE.InstancedMesh(sphereGeo, this.preMaterial, this.preData.length);
        const dummy = new THREE.Object3D();

        this.preData.forEach((syn, i) => {
          dummy.position.set(syn[0], syn[1], syn[2]);
          dummy.updateMatrix();
          this.preInstances.setMatrixAt(i, dummy.matrix);
        });
        this.preInstances.instanceMatrix.needsUpdate = true;
        this.synapsesGroup.add(this.preInstances);
      }

      // 3. Pós-sinapses (🔵 Espinhos receptores em ciano brilhante)
      this.postData = this.currentData.synapses_post || [];
      if (this.postData.length > 0) {
        const sphereGeo = new THREE.SphereGeometry(0.035, 8, 8);
        this.postMaterial = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.8
        });

        this.postInstances = new THREE.InstancedMesh(sphereGeo, this.postMaterial, this.postData.length);
        const dummy = new THREE.Object3D();

        this.postData.forEach((syn, i) => {
          dummy.position.set(syn[0], syn[1], syn[2]);
          dummy.updateMatrix();
          this.postInstances.setMatrixAt(i, dummy.matrix);
        });
        this.postInstances.instanceMatrix.needsUpdate = true;
        this.synapsesGroup.add(this.postInstances);
      }

      return this.currentData;
    } catch (e) {
      console.error('Erro ao carregar circuito:', e);
      return null;
    }
  }

  // Pulso elétrico ao disparar sinapses
  pulse() {
    this.pulseIntensity = 1.0;
  }

  update(dt) {
    if (this.pulseIntensity > 0) {
      this.pulseIntensity = Math.max(0, this.pulseIntensity - dt * 3.5);

      if (this.lineMaterial) {
        // Interpolação para ouro brilhante no disparo
        const col = new THREE.Color(0x00ffcc).lerp(new THREE.Color(0xffd700), this.pulseIntensity);
        this.lineMaterial.color = col;
        this.lineMaterial.opacity = 0.85 + this.pulseIntensity * 0.15;
      }

      if (this.preMaterial) {
        this.preMaterial.color = new THREE.Color(0xfbbf24).lerp(new THREE.Color(0xffffff), this.pulseIntensity);
      }
    }
  }

  setVisible(visible) {
    this.group.visible = visible;
  }
}
