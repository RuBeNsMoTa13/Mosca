# Backlog Oficial de Desenvolvimento — FlyBrain 3D

> **Rastreabilidade e Governança**  
> **Data / Hora**: 2026-10-05 03:25 (UTC-3)  
> **Branch**: `main` (repositório local)  
> **Commit de Referência**: `6b5e839`  
> **Status**: Atualizado  

Este documento é a fonte oficial única de backlog e auditoria de funcionalidades do projeto **FlyBrain 3D** (simulador neuromecânico e conectoma 3D da *Drosophila melanogaster*).

---

## 1. O Que Já Foi Implementado (`[x]`)

### 1.1. Pipeline de Dados & Neuroinformática (Python)
- [x] Conexão com a API neuPrint Janelia Research Campus via dataset `male-cns:v1.0`.
- [x] Extração e cálculo geométrico de *Convex Hulls* para os volumes cerebrais (`brain_hulls.json`):
  - [x] Lobo óptico esquerdo e direito.
  - [x] Cérebro central.
  - [x] Cordão nervoso ventral.
- [x] Extração de morfologia neural 3D (esqueletos axonais/dendríticos) e nuvens de sinapses pré e pós com identificação de ROIs:
  - [x] `MBON03` (Circuito de Recompensa & Alimento).
  - [x] `ExR5` (Bússola Biológica 360° / Rumo Espacial).
  - [x] `DNge104` (Reflexo de Fuga Rápida Antiesmagamento).
  - [x] `s-LNv` (Marcapasso Circadiano Sono/Vigília).
  - [x] `MBON01` (Memória e Aprendizado Olfativo).
  - [x] `DNp09` (Freio de Pouso & Desaceleração).
- [x] Geração automatizada do manifesto de circuitos (`catalog.json`).
- [x] Scripts de exploração e visualização 2D via `navis` e `neuprint-python`.

### 1.2. Modelo 3D da Mosca & Cinemática Biomecânica
- [x] Construção anatômica procedural completa em Three.js (`BiologicalFly`):
  - [x] Cabeça com antenas, aristas plumosas com cerdas laterais, probóscide móvel, 3 ocelos no vértex cranial e grandes olhos facetados compostos.
  - [x] **Tórax e Escutelo**: Mesonoto quitinoso realista e **Escutelo posterior** (escudo triangular díptero entre as raízes alares) com anel cervical flexível.
  - [x] **Abdômen Segmentado Biológico**: 6 segmentos anatômicos verdadeiros (tergitos A1 a A6 + ápice arredondado), com faixas basais âmbar e bandas pretas posteriores de melanina, além de ápice negro brilhante característico do macho de *Drosophila melanogaster*.
  - [x] **Asas com Nervuras Autênticas e Repouso Dorsal Sem Colisão**: Posicionamento dorsolateral no mesotórax ($Y = 2.28, Z = -0.18$) com folga de $+0.11$ a $+0.63$ acima do abdômen, eliminando qualquer penetração. Traçado das nervuras alares (L1 Costa, L2 R2+3, L3 R4+5, L4 M1, L5 CuA1 e transversais r-m, m-cu) e micro-offset ($0.02$) para sobreposição natural sem z-fighting.
  - [x] 6 pernas articuladas completas (coxa muscular no esterno, trocânter, fêmur, joelho, tíbia e tarso) com calibração precisa no piso da arena ($Y \approx 0.02 - 0.05$).
  - [x] **Escleritos Articulares das Asas**: Bases axilares alares ancorando as asas no mesotórax e conectadas aos nervos motores alares.
  - [x] **Haltères Metatorácicos**: Órgãos de equilíbrio giroscópicos em T3 vibrando em contrafase durante o voo.
  - [x] **Rede Neural Motora Eferente (Fiação Asas & Pernas)**: Tratos de nervos motores bioelétricos conectando o VNC (neuromeros T1, T2 e T3) diretamente às 6 pernas e às 2 asas, com junções neuromusculares (NMJs) pulsantes sincronizadas com a marcha tripodal e voo a 210 Hz.
- [x] Cinemática de marcha tripodal verdadeira (ondas de apoio e balanço em tripés alternados).
- [x] Mecanismo de extensão da probóscide para alimentação.
- [x] Transição para Modo Raio-X com exoesqueleto translúcido (vidro/esmerilhado) cobrindo todos os materiais de cutícula e expondo a anatomia interna e a fiação neural.
- [x] Movimentação manual pelo teclado (WASD para andar, Espaço para decolar, Shift para descer).
- [x] **Correção do Freio de Voo (`DNp09`)**: Eliminação de locomoção no ar, descida controlada suave com postura reflexa de trem de pouso estendido e gravidade protetora no ar.
- [x] **Controle de Voo e Hovering Estático**: Eliminação de velocidade residual de cruzeiro no ar. A mosca agora paira estática no ar (*hovering*) ao decolar e só avança se `W` for pressionado ou recua se `S` for pressionado.
- [x] **Sistema de Fome & Metabolismo Dinâmico**: Gasto energético em repouso (0.5x), solo (1.2x) e voo acelerado (2.4x / 210 Hz), com saciação rápida ao alimentar-se do néctar.

### 1.3. Conectoma 3D & Visualizador Cerebral
- [x] Acoplamento geométrico exato das estruturas neurais dentro da cabeça e nuca da mosca.
- [x] **Orientação Anatômica Real do Cordão Nervoso Ventral (VNC)**: Correção da rotação do VNC (`nerve_cord`) e dos tratos motores descendentes (`DNge104` e `DNp09`). O cordão agora curva-se ~90° através do canal do pescoço (conectivo cervical) e projeta-se horizontalmente para trás ao longo do assoalho ventral do tórax e abdômen anterior, eliminando a projeção vertical errônea em direção ao solo provocada pela orientação dos eixos do volume de microscopia eletrônica de Janelia (`male-cns:v1.0`).
- [x] Renderização de esqueleto neuronal com `THREE.LineSegments` e blending aditivo.
- [x] Renderização de sinapses em alta performance via `THREE.InstancedMesh` (pré em ciano, pós em magenta).
- [x] Efeito visual dinâmico de pulso sináptico luminoso propagado por interpolação.
- [x] Inspecionador de sinapses com Raycasting e tooltip interativo (ROI e coordenadas).

### 1.4. Simulação Biofísica LIF (Leaky Integrate-and-Fire)
- [x] Modelo biofísico de membrana no osciloscópio (`NeuralOscilloscope`):
  - [x] Potencial de repouso (-52 mV), limiar (0 mV), pico de ação (+24 mV) e reset (-62 mV).
  - [x] Decaimento passivo com constante de tempo $\tau = 18\text{ ms}$.
  - [x] Ruído térmico biológico estocástico.
- [x] Renderização em Canvas 2D com estética cibernética (grade em mV, linha pontilhada de repouso, brilho neon).
- [x] Contador de disparos (*spikes*) e indicador de voltagem em tempo real.
- [x] Injeção de pulso de corrente elétrica ajustável.
- [x] Disparos dopaminérgicos acoplados ao consumo de glicose do morango.

### 1.5. Ambiente 3D & Iluminação
- [x] Arena circular tecnológica com grid holográfico e iluminação PBR com sombras suaves (PCFSoftShadowMap).
- [x] **Pequeno Morango Realista**: Modelo 3D anatômico cônico proporcional à mosca, com 80 aquênios (sementes) douradas, cálice de 7 sépalas verdes, cabinho curvado e ondas de aroma adocicado.
- [x] Partículas de poeira ambiental em suspensão.

### 1.6. Áudio Procedural (Web Audio API)
- [x] Síntese procedural de zumbido de asas dependente da frequência motora.
- [x] Estalidos bioelétricos sincronizados com os *spikes* do osciloscópio.
- [x] Efeitos de passos mecânicos no solo e repouso.

### 1.7. Interface HUD & Experiência do Usuário
- [x] Barra superior com seletor de circuito, botões de modo (Arena, Raio-X, Visão Dupla).
- [x] **Medidor de Fome Compacto**: Mini-barra de glicose na barra superior com porcentagem em tempo real.
- [x] **Card de Fome Biológica**: Telemetria biomecânica com taxa metabólica instantânea e botão de ação rápida para alimentar a mosca.
- [x] **Tutorial Interativo das Sinapses**: Modal didático completo explicando cada um dos 6 circuitos biológicos (`MBON03`, `ExR5`, `DNge104`, `s-LNv`, `MBON01`, `DNp09`), o osciloscópio LIF e botão para testar cada circuito em tempo real.
- [x] Painel Neurocientífico com osciloscópio integrado e estatísticas do circuito.
- [x] Modo imersivo (ocultar HUD com tecla H) e tela cheia.
- [x] Guia de atalhos de teclado (tecla K), com novos atalhos [T] (Tutorial) e [F] (Comer).

---

## 2. O Que Falta Implementar (`[ ]`)

### 2.1. Conectoma & Neurociência Avançada
- [ ] **Propagação Direcional de Potencial de Ação**: Implementar onda viajante ao longo do esqueleto neuronal (soma $\to$ axônio $\to$ terminais sinápticos) em vez de apenas brilho uniforme estático.
- [ ] **Visualização Multi-Circuito / Conectividade Sináptica Cruzada**: Permitir carregar mais de um circuito simultaneamente e destacar conexões sinápticas convergentes (ex: `MBON03` comunicando com `DNge104`).
- [ ] **Neuropilos e Regiões Cerebrais Específicas**: Adicionar malhas e contornos 3D dedicados para sub-regiões chave (ex: Mushroom Body calyx/lobes, Fan-shaped Body, Protocerebral Bridge).
- [ ] **API Backend Dinâmica para neuPrint**: Criar servidor leve (FastAPI ou script CLI interativo) que consulte e baixe qualquer neurônio arbitrário por ID ou nome sob demanda, sem precisar reiniciar o frontend.

### 2.2. Biomecânica, Física & Simulação
- [ ] **Motor de Física Rígida (ex: Rapier.js ou Cannon-es)**:
  - [ ] Colisão física real com paredes da arena e obstáculos tridimensionais.
  - [ ] Física de pouso e impacto nas pernas com amortecimento dinâmico.
- [ ] **Aerodinâmica de Voo Avançada**:
  - [ ] Sustentação vetorial (*lift/drag*), arrasto do ar e inércia de rotação em curvas fechadas.
  - [ ] Efeito de solo (*ground effect*) ao voar muito próximo da superfície da arena.
- [ ] **Interação Interativa com Alimento**: Consumo progressivo da fruta com animação da probóscide tocando o alimento e feedback em tempo real no circuito de recompensa.

### 2.3. Câmera, Modos Visuais & Shaders
- [ ] **Câmera "Fly Eye" (Visão Composta da Mosca)**:
  - [ ] Shader de pós-processamento simulando a visão omatídea facetada em hexágonos.
  - [ ] Simulação de visão sensível à luz polarizada ultravioleta.
- [ ] **Modo Split Screen WebGL Real**: Divisão da tela com duas câmeras e viewports Three.js independentes (uma acompanhando a mosca no mundo e outra focada no cérebro com zoom orbital micro).

### 2.4. Eletrofisiologia & Dinâmica de Rede
- [ ] **Sinapses Excitatórias e Inibitórias (EPSP / IPSP)**:
  - [ ] Modelagem de canais iônicos e neurotransmissores (Acetilcolina vs. GABA/Glutamato).
  - [ ] Diferenciação visual nas sinapses de acordo com neurotransmissor predito.
- [ ] **Painel de Controle de Parâmetros Biofísicos**:
  - [ ] Sliders no HUD para configurar resistência de membrana ($R_m$), capacitância ($C_m$) e limiar de disparo.

### 2.5. Qualidade de Código, Testes & Documentação
- [x] Criação da Trindade de Governança (`GEMINI.md`, `docs/README.md`, `docs/todo.md`).
- [ ] Configuração de testes unitários para a cinemática de marcha e simulação LIF (Vitest).
- [x] Adição de arquivo `.env.example` com template da chave da Janelia API.
- [x] Criação do [README.md](file:///c:/Users/ruben/Desktop/Projetinhos/Mosca/README.md) raiz e `requirements.txt` com instruções completas de execução e controles.
- [x] Configuração de [package.json](file:///c:/Users/ruben/Desktop/Projetinhos/Mosca/package.json) na raiz com NPM Workspaces para execução direta.
