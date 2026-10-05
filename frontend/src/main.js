import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BiologicalFly } from './fly.js';
import { VirtualArena } from './environment.js';
import { ConnectomeVisualizer } from './connectome.js';
import { NeuralOscilloscope } from './oscilloscope.js';
import { bioAudio } from './audio.js';
import { TUTORIAL_CIRCUITS, TUTORIAL_BIO_GUIDE } from './tutorialData.js';

class FlyBrainApp {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.initThree();
    this.initComponents();
    this.initEvents();
    this.initTutorial();
    this.loadCatalog();

    this.activeMode = 'world'; // 'world', 'xray', 'split'
    this.camMode = 'orbit';
    this.currentStimulus = 150;
    this.autoWalk = false;

    // Estado das teclas de controle manual (WASD / Setas / Espaço / Shift)
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      descend: false
    };

    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    // 1. Renderer com sombras suaves e tone mapping cinematográfico
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // 2. Cena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070a13);
    this.scene.fog = new THREE.FogExp2(0x070a13, 0.015);

    // 3. Câmera
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(16, 12, 20);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Não atravessar o chão
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 80.0;
    this.controls.target.set(0, 1.5, 0);

    // 5. Iluminação PBR Realista
    const ambientLight = new THREE.AmbientLight(0x1e293b, 0.85);
    this.scene.add(ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffedd5, 2.4);
    this.sunLight.position.set(16, 26, -14);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 70;
    this.sunLight.shadow.camera.left = -25;
    this.sunLight.shadow.camera.right = 25;
    this.sunLight.shadow.camera.top = 25;
    this.sunLight.shadow.camera.bottom = -25;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    rimLight.position.set(-16, 10, 16);
    this.scene.add(rimLight);
  }

  initComponents() {
    // 1. Arena Virtual
    this.arena = new VirtualArena();
    this.scene.add(this.arena.group);

    // 2. Mosca 3D Biológica
    this.fly = new BiologicalFly();
    this.scene.add(this.fly.group);

    // 3. Conectoma Neural 3D (acoplado diretamente dentro da cabeça da mosca!)
    this.connectome = new ConnectomeVisualizer();
    this.fly.group.add(this.connectome.group);
    this.connectome.setVisible(false); // No modo Arena pura começa oculto

    // 4. Osciloscópio Neural de Membrana
    this.oscilloscope = new NeuralOscilloscope('osc-canvas', 'osc-voltage-val', 'osc-spikes-count');

    // Raycaster para inspecionar sinapses com tooltip
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.tooltip = document.getElementById('synapse-tooltip');
    this.tooltipTitle = document.getElementById('tooltip-title');
    this.tooltipRoi = document.getElementById('tooltip-roi');
    this.tooltipCoords = document.getElementById('tooltip-coords');
  }

  async loadCatalog() {
    try {
      const res = await fetch('/data/catalog.json');
      this.catalog = await res.json();
      this.selectCircuit('MBON03');
    } catch (e) {
      console.warn('Catálogo local não encontrado, carregando padrão MBON03:', e);
      this.selectCircuit('MBON03');
    }
  }

  async selectCircuit(circuitId) {
    const data = await this.connectome.loadCircuit(circuitId);
    if (!data) return;

    this.activeCircuit = data;

    // Atualiza interface
    document.getElementById('circuit-select').value = circuitId;
    document.getElementById('circuit-roi-tag').textContent = data.local.toUpperCase();
    document.getElementById('mission-text').textContent = data.motor_desc;
    document.getElementById('tele-motor-mode').textContent = data.funcao;
    document.getElementById('stat-branch-count').textContent = data.num_segments.toLocaleString();
    document.getElementById('stat-pre-count').textContent = data.num_pre.toLocaleString();
    document.getElementById('stat-post-count').textContent = data.num_post.toLocaleString();

    // Se estiver em modo Raio-X, garante visibilidade
    if (this.activeMode === 'xray' || this.activeMode === 'split') {
      this.connectome.setVisible(true);
      this.fly.setXRayMode(true);
    }
  }

  stimulate() {
    bioAudio.playSpike();
    this.oscilloscope.stimulate(this.currentStimulus);
    this.connectome.pulse();

    const badge = document.getElementById('behavior-badge');
    badge.className = 'status-pill active';
    badge.textContent = '⚡ TRANSMITINDO SINAPSE!';

    setTimeout(() => {
      badge.className = 'status-pill resting';
      badge.textContent = 'EM REPOUSO';
    }, 1800);

    // Resposta neuromuscular baseada no circuito ativo
    if (this.activeCircuit) {
      const mode = this.activeCircuit.motor_mode;
      if (mode === 'walk_food') {
        this.autoWalk = true;
        document.getElementById('btn-walk-toggle').textContent = '⏸️ Pausar Caminhada';
      } else if (mode === 'patrol') {
        this.autoWalk = true;
      } else if (mode === 'escape') {
        this.fly.performEscapeJump(0.04);
      } else if (mode === 'landing') {
        this.autoWalk = false;
        this.fly.initiateBrakeOrLanding();
      }
    }
  }

  initEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Seletor de circuitos
    document.getElementById('circuit-select').addEventListener('change', (e) => {
      this.selectCircuit(e.target.value);
    });

    // Modos de Exibição
    document.getElementById('btn-mode-world').addEventListener('click', () => {
      this.setMode('world');
    });
    document.getElementById('btn-mode-xray').addEventListener('click', () => {
      this.setMode('xray');
    });
    document.getElementById('btn-mode-split').addEventListener('click', () => {
      this.setMode('split');
    });

    // Botão de Estímulo Principal
    document.getElementById('btn-stimulate').addEventListener('click', () => {
      this.stimulate();
    });

    // Controles pelo Teclado (WASD / Setas / Espaço / Shift / C / E / 1-5)
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          this.autoWalk = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          this.autoWalk = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          this.autoWalk = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          this.autoWalk = false;
          break;
        case 'Space':
          e.preventDefault();
          this.keys.jump = true;
          this.autoWalk = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyC':
          this.keys.descend = true;
          break;
        case 'KeyE':
        case 'Enter':
          e.preventDefault();
          this.stimulate();
          break;
        case 'Digit1':
          this.setCameraPreset('orbit');
          break;
        case 'Digit2':
          this.setCameraPreset('follow');
          break;
        case 'Digit3':
          this.setCameraPreset('head');
          break;
        case 'Digit4':
          this.setCameraPreset('fruit');
          break;
        case 'Digit5':
          this.setCameraPreset('top');
          break;
        case 'KeyH':
          this.toggleHUD();
          break;
        case 'KeyK':
          this.toggleKeyboardGuide();
          break;
        case 'KeyT':
          this.toggleTutorial();
          break;
        case 'KeyF':
          this.triggerFeed();
          break;
        case 'Escape':
          this.closeTutorial();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
        case 'Space':
          this.keys.jump = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyC':
          this.keys.descend = false;
          break;
      }
    });

    // Alternar caminhada contínua
    const walkBtn = document.getElementById('btn-walk-toggle');
    walkBtn.addEventListener('click', () => {
      this.autoWalk = !this.autoWalk;
      walkBtn.textContent = this.autoWalk ? '⏸️ Pausar Caminhada' : '▶️ Caminhar até a Fruta';
    });

    // Slider de corrente
    const slider = document.getElementById('current-slider');
    slider.addEventListener('input', (e) => {
      this.currentStimulus = parseFloat(e.target.value);
      document.getElementById('slider-val').textContent = `${this.currentStimulus} pA`;
      document.getElementById('stat-current-val').textContent = `${this.currentStimulus} pA`;
    });

    // Efeitos Sonoros
    const audioBtn = document.getElementById('btn-audio');
    audioBtn.addEventListener('click', () => {
      const active = bioAudio.toggle();
      audioBtn.textContent = active ? '🔊' : '🔇';
    });

    // Reset Câmera
    document.getElementById('btn-reset-cam').addEventListener('click', () => {
      this.setCameraPreset('orbit');
    });

    // Câmeras Rápidas
    document.querySelectorAll('.cam-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.cam-btn').forEach((b) => b.classList.remove('active'));
        e.target.classList.add('active');
        this.setCameraPreset(e.target.dataset.cam);
      });
    });

    // Painéis Laterais Recolhíveis (Drawer de Telemetria e Neurociência)
    const leftPanel = document.getElementById('telemetry-panel');
    const tabOpenTele = document.getElementById('tab-open-telemetry');
    const btnCollapseTele = document.getElementById('btn-collapse-telemetry');

    if (btnCollapseTele && leftPanel && tabOpenTele) {
      btnCollapseTele.addEventListener('click', () => {
        leftPanel.classList.add('collapsed');
        tabOpenTele.classList.remove('hidden');
      });
      tabOpenTele.addEventListener('click', () => {
        leftPanel.classList.remove('collapsed');
        tabOpenTele.classList.add('hidden');
      });
    }

    const rightPanel = document.getElementById('neuro-drawer');
    const tabOpenNeuro = document.getElementById('tab-open-neuro');
    const btnCollapseNeuro = document.getElementById('btn-collapse-neuro');

    if (btnCollapseNeuro && rightPanel && tabOpenNeuro) {
      btnCollapseNeuro.addEventListener('click', () => {
        rightPanel.classList.add('collapsed');
        tabOpenNeuro.classList.remove('hidden');
      });
      tabOpenNeuro.addEventListener('click', () => {
        rightPanel.classList.remove('collapsed');
        tabOpenNeuro.classList.add('hidden');
      });
    }

    // Modo Imersivo (Ocultar/Exibir HUD)
    document.getElementById('btn-toggle-hud')?.addEventListener('click', () => {
      this.toggleHUD();
    });
    document.getElementById('btn-restore-hud')?.addEventListener('click', () => {
      this.toggleHUD();
    });

    // Barra de Atalhos de Teclado
    document.getElementById('btn-toggle-kbd')?.addEventListener('click', () => {
      this.toggleKeyboardGuide();
    });
    document.getElementById('btn-close-kbd')?.addEventListener('click', () => {
      document.getElementById('keyboard-guide-bar')?.classList.add('hidden');
    });

    // Alternar Modo de Tela Cheia
    document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Mouse move para raycast de sinapses
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (this.tooltip && !this.tooltip.classList.contains('hidden')) {
        this.tooltip.style.left = `${e.clientX + 14}px`;
        this.tooltip.style.top = `${e.clientY + 14}px`;
      }
    });
  }

  toggleHUD() {
    const overlay = document.getElementById('ui-overlay');
    const restoreBtn = document.getElementById('btn-restore-hud');
    if (!overlay || !restoreBtn) return;
    const isHidden = overlay.classList.toggle('hud-hidden');
    restoreBtn.classList.toggle('hidden', !isHidden);
  }

  toggleKeyboardGuide() {
    const guide = document.getElementById('keyboard-guide-bar');
    if (guide) guide.classList.toggle('hidden');
  }

  initTutorial() {
    this.tutorialModal = document.getElementById('tutorial-modal');
    this.tutorialBody = document.getElementById('tutorial-content-body');
    this.activeTutorialTab = 'MBON03';

    // Botões de abertura
    document.getElementById('btn-tutorial')?.addEventListener('click', () => {
      this.openTutorial();
    });
    document.getElementById('btn-open-tutorial-neuro')?.addEventListener('click', () => {
      this.openTutorial();
    });

    // Botão de fechar
    document.getElementById('btn-close-tutorial')?.addEventListener('click', () => {
      this.closeTutorial();
    });

    // Fechar ao clicar fora do card
    this.tutorialModal?.addEventListener('click', (e) => {
      if (e.target === this.tutorialModal) {
        this.closeTutorial();
      }
    });

    // Abas de seleção de circuito
    document.querySelectorAll('.tut-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const circuit = e.currentTarget.dataset.circuit;
        this.selectTutorialTab(circuit);
      });
    });

    // Botão de alimentação rápida no card de fome
    document.getElementById('btn-feed-fly')?.addEventListener('click', () => {
      this.triggerFeed();
    });
  }

  openTutorial(circuitId = null) {
    if (!this.tutorialModal) return;
    const target = circuitId || (this.activeCircuit ? this.activeCircuit.id : 'MBON03');
    this.selectTutorialTab(target);
    this.tutorialModal.classList.remove('hidden');
  }

  closeTutorial() {
    if (!this.tutorialModal) return;
    this.tutorialModal.classList.add('hidden');
  }

  toggleTutorial() {
    if (this.tutorialModal?.classList.contains('hidden')) {
      this.openTutorial();
    } else {
      this.closeTutorial();
    }
  }

  triggerFeed() {
    this.selectCircuit('MBON03');
    this.autoWalk = true;
    document.getElementById('btn-walk-toggle').textContent = '⏸️ Pausar Caminhada';
    const badge = document.getElementById('behavior-badge');
    badge.className = 'status-pill active';
    badge.textContent = '🍓 BUSCANDO MORANGO!';
    bioAudio.playSpike();

    // Se estiver em voo, pousa suavemente ou direciona para o solo
    if (this.fly.isFlying || this.fly.y > 0.05) {
      this.fly.initiateBrakeOrLanding();
    }
  }

  selectTutorialTab(tabId) {
    this.activeTutorialTab = tabId;
    document.querySelectorAll('.tut-tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.circuit === tabId);
    });

    if (tabId === 'BIO') {
      this.renderBioTab();
    } else {
      this.renderCircuitTab(tabId);
    }
  }

  renderCircuitTab(circuitId) {
    const data = TUTORIAL_CIRCUITS[circuitId];
    if (!data || !this.tutorialBody) return;

    this.tutorialBody.innerHTML = `
      <div class="tut-circuit-hero">
        <div class="tut-hero-icon" style="color: ${data.cor}">${data.icone}</div>
        <div class="tut-hero-text">
          <h3>${data.nome} (${data.id})</h3>
          <p>${data.apelido}</p>
          <span class="tut-roi-pill">📍 Região Anatômica: ${data.roi}</span>
        </div>
      </div>

      <div class="tut-grid">
        <div class="tut-card-box">
          <h4>🧬 O Que Faz na Biologia Real (Janelia neuPrint)</h4>
          <p>${data.biologiaReal}</p>
        </div>
        <div class="tut-card-box">
          <h4>🎮 Comportamento no Simulador FlyBrain 3D</h4>
          <p>${data.efeitoSimulador}</p>
        </div>
      </div>

      <div class="tut-stats-strip">
        <div class="tut-stat-chip">
          <span>🟡 Pré-sinapses:</span>
          <strong>${data.dadosNeuprint.pre}</strong>
        </div>
        <div class="tut-stat-chip">
          <span>🔵 Pós-sinapses:</span>
          <strong>${data.dadosNeuprint.post}</strong>
        </div>
        <div class="tut-stat-chip">
          <span>🌳 Ramos Axonais:</span>
          <strong>${data.dadosNeuprint.ramos}</strong>
        </div>
        <div class="tut-stat-chip">
          <span>🧪 Neurotransmissor:</span>
          <strong>${data.dadosNeuprint.neurotransmissor}</strong>
        </div>
      </div>

      <div class="tut-action-row">
        <div class="tut-tip-text">💡 ${data.dica}</div>
        <button id="btn-tut-test-${data.id}" class="tut-test-btn" style="background: linear-gradient(135deg, ${data.cor}dd 0%, ${data.cor}99 100%)">
          ⚡ Testar Circuito ${data.id} Agora!
        </button>
      </div>
    `;

    document.getElementById(`btn-tut-test-${data.id}`)?.addEventListener('click', () => {
      this.selectCircuit(data.id);
      this.closeTutorial();
      this.setMode('xray');
      setTimeout(() => {
        this.stimulate();
      }, 300);
    });
  }

  renderBioTab() {
    if (!this.tutorialBody) return;
    this.tutorialBody.innerHTML = `
      <div class="tut-circuit-hero">
        <div class="tut-hero-icon" style="color: #fbbf24">⚡</div>
        <div class="tut-hero-text">
          <h3>${TUTORIAL_BIO_GUIDE.titulo}</h3>
          <p>Como a eletrofisiologia celular, o gasto de glicose e os reflexos mecânicos funcionam juntos</p>
        </div>
      </div>

      ${TUTORIAL_BIO_GUIDE.secoes.map((sec) => `
        <div class="tut-bio-section">
          <h4>${sec.titulo}</h4>
          <p>${sec.conteudo}</p>
        </div>
      `).join('')}

      <div class="tut-action-row" style="justify-content: flex-end;">
        <button id="btn-tut-close-bio" class="tut-test-btn">
          ✨ Entendi! Voltar ao Simulador
        </button>
      </div>
    `;

    document.getElementById('btn-tut-close-bio')?.addEventListener('click', () => {
      this.closeTutorial();
    });
  }

  setMode(mode) {
    this.activeMode = mode;
    document.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));

    if (mode === 'world') {
      document.getElementById('btn-mode-world').classList.add('active');
      this.fly.setXRayMode(false);
      this.connectome.setVisible(false);
      this.controls.target.set(this.fly.x, 1.5, this.fly.z);
    } else if (mode === 'xray') {
      document.getElementById('btn-mode-xray').classList.add('active');
      this.fly.setXRayMode(true);
      this.connectome.setVisible(true);
      this.setCameraPreset('head');
    } else if (mode === 'split') {
      document.getElementById('btn-mode-split').classList.add('active');
      this.fly.setXRayMode(true);
      this.connectome.setVisible(true);
      this.setCameraPreset('follow');
    }
  }

  setCameraPreset(preset) {
    this.camMode = preset;
    document.querySelectorAll('.cam-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.cam === preset);
    });

    const fx = this.fly.x;
    const fz = this.fly.z;
    const h = this.fly.heading;

    if (preset === 'orbit') {
      this.controls.target.set(fx, 1.5, fz);
      this.camera.position.set(fx + 14, 10, fz + 18);
    } else if (preset === 'follow') {
      this.controls.target.set(fx, 1.6, fz);
      this.camera.position.set(fx - Math.sin(h) * 9, 5.0, fz - Math.cos(h) * 9);
    } else if (preset === 'head') {
      this.controls.target.set(fx, 1.6, fz + 0.6);
      this.camera.position.set(fx + Math.sin(h) * 3.8, 2.2, fz + Math.cos(h) * 3.8);
    } else if (preset === 'fruit') {
      this.controls.target.set(this.arena.fruitPos.x, 2.0, this.arena.fruitPos.z);
      this.camera.position.set(this.arena.fruitPos.x + 6, 4.5, this.arena.fruitPos.z + 8);
    } else if (preset === 'top') {
      this.controls.target.set(0, 0, 0);
      this.camera.position.set(0, 48, 0.01);
    }
    this.controls.update();
  }

  animate() {
    requestAnimationFrame(this.animate);

    const dt = Math.min(this.clock.getDelta(), 0.1);

    // 1. Locomoção física da mosca (Manual pelo Teclado ou Autônoma até a Fruta)
    const moveResult = this.fly.moveManual(this.keys, dt, 36);

    if (this.autoWalk) {
      const dist = this.fly.walkTowards(this.arena.fruitPos.x, this.arena.fruitPos.z, 5.2, dt);
      if (Math.random() < 0.2) {
        this.arena.addFootprint(this.fly.x, this.fly.z);
      }

      if (dist <= 3.0) {
        this.autoWalk = false;
        document.getElementById('btn-walk-toggle').textContent = '🍓 Alimentando-se!';
      }
    } else if (this.fly.isWalking && Math.random() < 0.22) {
      this.arena.addFootprint(this.fly.x, this.fly.z);
    }

    // Eletrofisiologia motora em tempo real: movimento gera micro-depolarização no osciloscópio
    if (Math.abs(moveResult.speed) > 0.1 || this.fly.isFlying) {
      this.oscilloscope.stimulate(this.fly.isFlying ? 32 : 16);
    }

    this.fly.update(dt);
    this.arena.update(dt);
    this.connectome.update(dt);

    // Distância atualizada até a fruta doce
    const fruitDist = Math.sqrt(
      Math.pow(this.fly.x - this.arena.fruitPos.x, 2) + Math.pow(this.fly.z - this.arena.fruitPos.z, 2)
    );
    document.getElementById('tele-dist-food').textContent = `${(fruitDist * 2.8).toFixed(1)} µm`;

    // Atualiza padrão motor na telemetria
    const teleMode = document.getElementById('tele-motor-mode');
    if (this.fly.isLanding) {
      teleMode.textContent = '🛑 Freio DNp09: Pouso Suave...';
    } else if (this.fly.isFeeding) {
      teleMode.textContent = '🍓 Probóscide (Alimentando-se)';
    } else if (this.fly.isFlying) {
      if (Math.abs(moveResult.speed) > 0.5) {
        teleMode.textContent = `🪰 Voo Direcional (${this.fly.y.toFixed(1)}m alt)`;
      } else {
        teleMode.textContent = `🪰 Pairando no Ar (${this.fly.y.toFixed(1)}m alt)`;
      }
    } else if (this.fly.isWalking) {
      teleMode.textContent = '⚡ Marcha Tripodal Ativa';
    } else {
      teleMode.textContent = '💤 Repouso / Grooming';
    }

    // Telemetria de Fome & Metabolismo
    const hungerVal = Math.round(this.fly.hunger);
    const navHungerFill = document.getElementById('nav-hunger-fill');
    const navHungerText = document.getElementById('nav-hunger-text');
    const teleHungerFill = document.getElementById('tele-hunger-fill');
    const teleHungerPercent = document.getElementById('tele-hunger-percent');
    const teleHungerBadge = document.getElementById('tele-hunger-badge');
    const teleHungerBurn = document.getElementById('tele-hunger-burn');

    if (navHungerFill) navHungerFill.style.width = `${hungerVal}%`;
    if (navHungerText) navHungerText.textContent = `${hungerVal}% Fome`;
    if (teleHungerFill) teleHungerFill.style.width = `${hungerVal}%`;
    if (teleHungerPercent) teleHungerPercent.textContent = `${hungerVal}%`;

    if (teleHungerBadge) {
      if (hungerVal < 30) {
        teleHungerBadge.textContent = 'SACIADA (0-30%)';
        teleHungerBadge.className = 'hunger-badge satiated';
      } else if (hungerVal < 75) {
        teleHungerBadge.textContent = 'APETITE MODERADO';
        teleHungerBadge.className = 'hunger-badge moderate';
      } else {
        teleHungerBadge.textContent = 'FAMINTA (CRÍTICA)';
        teleHungerBadge.className = 'hunger-badge starving';
      }
    }

    if (teleHungerBurn) {
      if (this.fly.isFeeding) {
        teleHungerBurn.textContent = '🍓 Saciedade (-26x)';
      } else if (this.fly.isFlying) {
        teleHungerBurn.textContent = '⚡ Gasto: Voo 210Hz (2.4x)';
      } else if (this.fly.isWalking) {
        teleHungerBurn.textContent = '🚶 Gasto: Solo (1.1x)';
      } else {
        teleHungerBurn.textContent = '💤 Gasto: Repouso (0.45x)';
      }
    }

    // Micro-disparos dopaminérgicos de recompensa no osciloscópio ao sugar néctar
    if (this.fly.isFeeding && Math.random() < 0.12) {
      this.oscilloscope.stimulate(35);
    }

    // Atualiza telemetria de passos e asas
    document.getElementById('tele-steps').textContent = this.fly.stepCount;
    document.getElementById('tele-wing-hz').textContent = this.fly.isWalking
      ? '18 Hz'
      : (this.fly.isFlying ? '210 Hz' : (this.fly.isLanding ? '40 Hz' : '0 Hz'));

    // 2. Passo do osciloscópio
    this.oscilloscope.step(dt * 100);
    this.oscilloscope.draw();

    // 3. Acompanhamento suave de câmera no modo 'follow'
    if (this.camMode === 'follow') {
      const h = this.fly.heading;
      this.controls.target.lerp(new THREE.Vector3(this.fly.x, 1.6, this.fly.z), 0.1);
      const desiredCamPos = new THREE.Vector3(
        this.fly.x - Math.sin(h) * 9,
        this.fly.y + 4.5,
        this.fly.z - Math.cos(h) * 9
      );
      this.camera.position.lerp(desiredCamPos, 0.08);
    }

    // 4. Raycasting de sinapses para tooltip
    if (this.activeMode !== 'world' && this.connectome.preInstances) {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects([
        this.connectome.preInstances,
        this.connectome.postInstances
      ].filter(Boolean));

      if (intersects.length > 0) {
        const hit = intersects[0];
        const isPre = hit.object === this.connectome.preInstances;
        const synData = isPre ? this.connectome.preData[hit.instanceId] : this.connectome.postData[hit.instanceId];

        if (synData) {
          this.tooltip.classList.remove('hidden');
          this.tooltipTitle.textContent = isPre ? '🟡 Pré-sinapse (Transmissão)' : '🔵 Pós-sinapse (Receptor)';
          this.tooltipRoi.textContent = `Região (ROI): ${synData[3]}`;
          this.tooltipCoords.textContent = `XYZ: (${(synData[0]*12000).toFixed(0)}, ${(synData[1]*12000).toFixed(0)}, ${(synData[2]*12000).toFixed(0)}) nm`;
        }
      } else {
        this.tooltip.classList.add('hidden');
      }
    } else {
      this.tooltip.classList.add('hidden');
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// Inicializa a aplicação quando a página carrega
window.addEventListener('DOMContentLoaded', () => {
  new FlyBrainApp();
});
