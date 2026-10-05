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

    // Materiais PBR
    this.cuticleMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.32,
      metalness: 0.28,
      transparent: true,
      opacity: 1.0,
    });

    this.abdomenMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.42,
      metalness: 0.18,
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
      color: 0xbae6fd,
      transmission: 0.82,
      opacity: 0.65,
      transparent: true,
      roughness: 0.08,
      ior: 1.42,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.legMaterial = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.5,
      metalness: 0.2,
      transparent: true,
      opacity: 1.0,
    });

    this.jointMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      metalness: 0.4,
      transparent: true,
      opacity: 1.0,
    });

    this.buildBody();
    this.buildWings();
    this.buildLegs();

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
    // 1. Tórax (Mesotórax muscular)
    const thoraxGeo = new THREE.SphereGeometry(1.2, 24, 24);
    thoraxGeo.scale(1.0, 0.95, 1.25);
    this.thorax = new THREE.Mesh(thoraxGeo, this.cuticleMaterial);
    this.thorax.position.set(0, 1.6, 0);
    this.thorax.castShadow = true;
    this.group.add(this.thorax);

    // 2. Cabeça
    const headGeo = new THREE.SphereGeometry(0.85, 20, 20);
    headGeo.scale(1.05, 0.9, 0.95);
    this.head = new THREE.Mesh(headGeo, this.cuticleMaterial);
    this.head.position.set(0, 1.5, 1.5);
    this.head.castShadow = true;
    this.group.add(this.head);

    // Olho Rubi Esquerdo
    const eyeGeo = new THREE.SphereGeometry(0.55, 18, 18);
    eyeGeo.scale(0.8, 1.15, 1.1);
    this.eyeL = new THREE.Mesh(eyeGeo, this.eyeMaterial);
    this.eyeL.position.set(0.65, 0.15, 0.1);
    this.eyeL.rotation.y = 0.35;
    this.head.add(this.eyeL);

    // Olho Rubi Direito
    this.eyeR = new THREE.Mesh(eyeGeo, this.eyeMaterial);
    this.eyeR.position.set(-0.65, 0.15, 0.1);
    this.eyeR.rotation.y = -0.35;
    this.head.add(this.eyeR);

    // Antenas e Aristídeos
    const antMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 });
    const antLGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0.2, 0.25, 0.6),
      new THREE.Vector3(0.35, 0.6, 1.1),
      new THREE.Vector3(0.5, 0.8, 1.4)
    ]);
    this.head.add(new THREE.Line(antLGeo, antMat));

    const antRGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.2, 0.25, 0.6),
      new THREE.Vector3(-0.35, 0.6, 1.1),
      new THREE.Vector3(-0.5, 0.8, 1.4)
    ]);
    this.head.add(new THREE.Line(antRGeo, antMat));

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

    // 3. Abdômen Segmentado
    const abGeo = new THREE.SphereGeometry(1.25, 24, 24);
    abGeo.scale(0.95, 0.85, 1.6);
    this.abdomen = new THREE.Mesh(abGeo, this.abdomenMaterial);
    this.abdomen.position.set(0, 1.45, -1.6);
    this.abdomen.rotation.x = -0.15;
    this.abdomen.castShadow = true;
    this.group.add(this.abdomen);

    // Anéis escuros nos segmentos do abdômen
    for (let i = -0.8; i <= 0.8; i += 0.4) {
      const ringGeo = new THREE.TorusGeometry(1.18, 0.04, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x78350f });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, 0, i);
      ring.scale.set(0.95, 0.85, 1.0);
      this.abdomen.add(ring);
    }
  }

  buildWings() {
    this.wingsGroup = new THREE.Group();
    this.wingsGroup.position.set(0, 2.1, -0.1);
    this.group.add(this.wingsGroup);

    // Geometria da asa
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.bezierCurveTo(0.4, 0.6, 0.8, 2.2, 0.6, 3.6);
    wingShape.bezierCurveTo(0.4, 4.4, -0.2, 4.2, -0.5, 3.2);
    wingShape.bezierCurveTo(-0.8, 2.0, -0.5, 0.8, 0, 0);

    const wingGeo = new THREE.ShapeGeometry(wingShape);

    // Asa Esquerda
    this.wingL = new THREE.Mesh(wingGeo, this.wingMaterial);
    this.wingL.position.set(0.5, 0, 0);
    this.wingL.rotation.set(Math.PI / 2, -0.2, -0.3);
    this.wingsGroup.add(this.wingL);

    // Asa Direita
    this.wingR = new THREE.Mesh(wingGeo, this.wingMaterial);
    this.wingR.position.set(-0.5, 0, 0);
    this.wingR.rotation.set(Math.PI / 2, 0.2, 0.3);
    this.wingsGroup.add(this.wingR);
  }

  buildLegs() {
    this.legs = [];

    // Configuração das 6 pernas: [nome, x_base, y_base, z_base, lado(1 ou -1), ângulo_repouso]
    const legConfigs = [
      { id: 'L1', x: 0.65, y: 1.4, z: 0.6, side: 1, angle: 0.45, group: 'A' },
      { id: 'R1', x: -0.65, y: 1.4, z: 0.6, side: -1, angle: -0.45, group: 'B' },
      { id: 'L2', x: 0.85, y: 1.35, z: 0.0, side: 1, angle: 1.45, group: 'B' },
      { id: 'R2', x: -0.85, y: 1.35, z: 0.0, side: -1, angle: -1.45, group: 'A' },
      { id: 'L3', x: 0.70, y: 1.3, z: -0.6, side: 1, angle: 2.35, group: 'A' },
      { id: 'R3', x: -0.70, y: 1.3, z: -0.6, side: -1, angle: -2.35, group: 'B' },
    ];

    legConfigs.forEach((cfg) => {
      const legRoot = new THREE.Group();
      legRoot.position.set(cfg.x, cfg.y, cfg.z);

      // Coxa / Fêmur
      const femurGeo = new THREE.CylinderGeometry(0.08, 0.06, 1.2, 10);
      femurGeo.translate(0, -0.6, 0);
      const femur = new THREE.Mesh(femurGeo, this.legMaterial);
      femur.rotation.z = cfg.side * 0.7;
      femur.rotation.y = cfg.angle;
      legRoot.add(femur);

      // Joelho (articulação)
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), this.jointMaterial);
      knee.position.set(0, -1.2, 0);
      femur.add(knee);

      // Tíbia
      const tibiaGeo = new THREE.CylinderGeometry(0.05, 0.035, 1.3, 10);
      tibiaGeo.translate(0, -0.65, 0);
      const tibia = new THREE.Mesh(tibiaGeo, this.legMaterial);
      tibia.rotation.z = -cfg.side * 0.9;
      knee.add(tibia);

      // Tarso / Pata (toca o chão)
      const tarsusGeo = new THREE.CylinderGeometry(0.03, 0.015, 0.6, 8);
      tarsusGeo.translate(0, -0.3, 0.1);
      const tarsus = new THREE.Mesh(tarsusGeo, this.legMaterial);
      tarsus.rotation.x = -0.5;
      tarsus.position.set(0, -1.3, 0);
      tibia.add(tarsus);

      this.group.add(legRoot);

      this.legs.push({
        id: cfg.id,
        root: legRoot,
        femur,
        knee,
        tibia,
        baseAngle: cfg.angle,
        side: cfg.side,
        group: cfg.group,
      });
    });
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
    this.abdomen.scale.set(0.95 * breath, 0.85 * breath, 1.6);

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

      // Desaceleração suave das asas
      this.wingAngle += dt * 38;
      this.wingL.rotation.z = Math.sin(this.wingAngle) * 0.4 - 0.2;
      this.wingR.rotation.z = -Math.sin(this.wingAngle) * 0.4 + 0.2;

      // Postura de trem de pouso reflexo (landing response: pernas estendidas prontas para o choque)
      this.legs.forEach((leg) => {
        leg.femur.rotation.y = leg.baseAngle + 0.12 * leg.side;
        leg.femur.rotation.z = leg.side * 0.48;
        leg.tibia.rotation.z = -leg.side * 0.85;
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
      this.wingL.rotation.z = Math.sin(this.wingAngle) * 0.75 - 0.3;
      this.wingR.rotation.z = -Math.sin(this.wingAngle) * 0.75 + 0.3;
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
        // Vibração alar sutil ao caminhar
        this.wingL.rotation.z = -0.3 + 0.05 * Math.sin(time * 12);
        this.wingR.rotation.z = 0.3 - 0.05 * Math.sin(time * 12);

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

          // Swing: perna levanta e avança; Stance: perna apoia e empurra para trás
          const swing = Math.sin(phase);
          const lift = Math.max(0, swing); // só sobe na fase positiva

          leg.femur.rotation.y = leg.baseAngle + Math.cos(phase) * 0.32 * leg.side;
          leg.femur.rotation.z = leg.side * (0.7 - lift * 0.38);
          leg.tibia.rotation.z = -leg.side * (0.9 + lift * 0.45);
        });

        // Oscilação vertical e lateral sutil do corpo ao caminhar
        this.thorax.position.y = 1.6 + 0.06 * Math.abs(Math.sin(this.gaitPhase * 2));
        this.head.position.y = 1.5 + 0.04 * Math.sin(this.gaitPhase * 2);
      } else {
        // Posição de repouso das asas
        this.wingL.rotation.set(Math.PI / 2, -0.15, -0.3);
        this.wingR.rotation.set(Math.PI / 2, 0.15, 0.3);

        // Repouso ou Limpeza de Patas (Grooming)
        const isGrooming = Math.sin(time * 0.6) > 0.7;

        this.legs.forEach((leg) => {
          if (isGrooming && (leg.id === 'L1' || leg.id === 'R1')) {
            // As duas patas dianteiras esfregam uma na outra
            const rub = Math.sin(time * 18);
            leg.femur.rotation.y = leg.baseAngle + rub * 0.18;
            leg.femur.rotation.z = leg.side * 0.85;
            leg.tibia.rotation.z = -leg.side * 0.6 + rub * 0.2;
          } else {
            leg.femur.rotation.y = leg.baseAngle;
            leg.femur.rotation.z = leg.side * 0.7;
            leg.tibia.rotation.z = -leg.side * 0.9;
          }
        });
        this.thorax.position.y = 1.6;
        this.head.position.y = 1.5;
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

  // Alterna o Modo Raio-X (Exoesqueleto Translúcido)
  setXRayMode(enabled) {
    this.isXRay = enabled;
    const targetOpacity = enabled ? 0.12 : 1.0;
    const targetDepth = !enabled;

    [this.cuticleMaterial, this.abdomenMaterial, this.legMaterial].forEach((mat) => {
      mat.opacity = targetOpacity;
      mat.depthWrite = targetDepth;
    });

    this.eyeMaterial.opacity = enabled ? 0.45 : 1.0;
  }
}
