# 🧬 FlyBrain 3D — Conectoma Real, Neurociência & Simulação WebGL

> **Simulador Interativo Neuromecânico da Mosca-das-Frutas (*Drosophila melanogaster*)**  
> Integrando conectômica de microscopia eletrônica da Janelia Research Campus (`male-cns:v1.0`), simulação eletrofisiológica LIF em tempo real e biomecânica 3D em WebGL.

---

## ⚡ Como Rodar o Projeto (Guia Rápido)

O projeto já possui todos os dados morfológicos cerebrais e sinapses pré-extraídos em formato JSON otimizado (`frontend/public/data/`). Portanto, **você não precisa configurar Python nem baixar gigabytes de dados** para rodar e explorar a simulação 3D completa!

### 📋 Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior instalado.
- Navegador moderno com suporte a WebGL (Chrome, Edge, Firefox, Brave, Safari).

---

### 🚀 Passo a Passo para Iniciar a Aplicação

1. **Opção A — Executar direto da raiz do projeto**:
   ```bash
   npm install
   npm run dev
   ```

2. **Opção B — Entrar na pasta do frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Acesse no seu navegador**:
   O terminal exibirá o endereço local, geralmente:
   ```text
   http://localhost:5173
   ```

Pronto! A mosca, a arena 3D, o cérebro translúcido, o osciloscópio biológico e os efeitos sonoros estarão em execução instantaneamente.

---

## 🎮 Controles e Interação

### ⌨️ Teclado

| Tecla | Ação Biomecânica / Interface |
| :--- | :--- |
| <kbd>W</kbd> | Andar para a frente (marcha tripodal) ou avançar no ar |
| <kbd>S</kbd> | Andar de marcha à ré ou recuar no ar |
| <kbd>A</kbd> / <kbd>D</kbd> | Girar a mosca para a esquerda / direita |
| <kbd>Espaço</kbd> | **Decolar / Subir**: Ativa asas a 210 Hz e atinge voo pairado (*hovering*) |
| <kbd>Shift</kbd> | **Descer / Pousar**: Aciona postura reflexa de pouso (`DNp09`) até o solo |
| <kbd>F</kbd> | **Alimentar-se**: Extensão reflexa da probóscide para sugar néctar do morango |
| <kbd>T</kbd> | **Tutorial Interativo**: Abre o guia explicativo dos circuitos neurais e sinapses |
| <kbd>H</kbd> | **Ocultar / Mostrar HUD**: Alterna o modo cinema imersivo |
| <kbd>K</kbd> | Exibir o painel de atalhos rápidos |

### 🖱️ Mouse
- **Clique Esquerdo + Arrastar**: Rotaciona a câmera orbital 3D ao redor da mosca.
- **Scroll (Roda do Mouse)**: Zoom de aproximação / afastamento.
- **Passar o Mouse sobre as Esferas Sinápticas**: Revela o tooltip com identificação da região (ROI) e coordenadas tridimensionais da sinapse.

### 🎛️ HUD e Interface
- **Seletor de Circuitos (Topo)**: Alterne instantaneamente entre os 6 circuitos biológicos reais.
- **Modos de Visualização**:
  - `🌐 Arena 3D`: Ambiente de teste macroscópico com o morango e iluminação PBR.
  - `🔬 Raio-X Neural`: Exoesqueleto com efeito de cutícula translúcida, expondo o cérebro, nervos e sinapses.
  - `🖥️ Visão Dupla`: Combina acompanhamento global e inspeção celular.
- **Osciloscópio Eletrofisiológico (LIF)**:
  - Gráfico em tempo real de potencial de membrana (mV).
  - Botão de **Injeção de Corrente**: Dispare pulsos elétricos manuais para excitar a membrana.
  - Sliders para controle de corrente de estímulo.

---

## 🧠 Circuitos Biológicos Disponíveis

Os dados neurais foram extraídos diretamente do dataset **Janelia Research Campus `male-cns:v1.0`**:

1. **🍓 MBON03 (*Mushroom Body Output Neuron 03*)**:
   - Circuito de recompensa, apetite e valência alimentar positiva acoplado ao morango.
2. **🧭 ExR5 (*Ring Neuron Extrinsic 05*)**:
   - Bússola biológica interna no corpo elipsoide (*Central Complex*), codificando orientação 360°.
3. **⚡ DNge104 (*Descending Giant Fiber Neuron*)**:
   - Reflexo ultra-rápido de fuga e salto ao detectar aproximação súbita de predadores.
4. **⏰ s-LNv (*Small Lateral Neurons ventral*)**:
   - Marcapasso circadiano central, regulador dos ritmos de sono, vigília e temperatura.
5. **🧠 MBON01 (*Mushroom Body Output Neuron 01*)**:
   - Aprendizado aversivo, memória olfativa e consolidação de perigo.
6. **🛑 DNp09 (*Descending Neuron Landing Controller*)**:
   - Circuito motor de desaceleração, freio aéreo e extensão das pernas para o trem de pouso.

---

## 🔬 Pipeline de Neuroinformática & Python (Opcional)

> 💡 **Nota**: Esta etapa **não é necessária** para usar a aplicação 3D! Ela serve apenas para desenvolvedores ou neurocientistas que desejam extrair **novos circuitos neurais** ou atualizar os dados diretamente da base de dados do Janelia Research Campus.

### 1. Requisitos do Backend
- Python 3.10 ou superior.
- Token gratuito de acesso à API neuPrint Janelia.

### 2. Configuração do Ambiente Python
```bash
# Crie e ative um ambiente virtual
python -m venv .venv

# No Windows (PowerShell):
.venv\Scripts\Activate.ps1

# No Linux/macOS:
source .venv/bin/activate

# Instale os pacotes necessários
pip install -r requirements.txt
```

### 3. Configurar Credencial da API
1. Copie o arquivo de exemplo de ambiente:
   ```bash
   cp .env.example .env
   ```
2. Abra o arquivo `.env` e insira o seu token da Janelia:
   ```env
   token=SEU_TOKEN_AQUI
   ```
   *(Obtenha seu token gratuitamente fazendo login em [neuprint.janelia.org](https://neuprint.janelia.org))*

### 4. Scripts Disponíveis
- **`python export_data.py`**: Conecta à API neuPrint, calcula Convex Hulls dos lobos ópticos e cérebro central, extrai sinapses e salva os JSONs em `frontend/public/data/`.
- **`python test_navis.py`**: Valida a conexão com neuPrint e gera uma projeção 2D de esqueleto neuronal via biblioteca `navis`.
- **`python consulta_neuprint.py`**: Exemplo de query neuPrint para extração de matrizes de adjacência e conectividade sináptica.

---

## 📁 Estrutura de Pastas do Repositório

```text
Mosca/
├── frontend/                     # Aplicação WebGL Three.js + Vite
│   ├── index.html                # Ponto de entrada HTML e layout do HUD
│   ├── package.json              # Dependências do frontend (Three.js, Vite)
│   ├── public/                   # Arquivos estáticos servidos pelo Vite
│   │   └── data/                 # JSONs de morfologia neuronal e convex hulls
│   └── src/
│       ├── main.js               # Loop de renderização principal e inicialização
│       ├── fly.js                # Anatomia procedural e biomecânica (BiologicalFly)
│       ├── connectome.js         # Visualizador de esqueletos neurais e sinapses
│       ├── oscilloscope.js       # Simulação biofísica LIF em Canvas 2D
│       ├── audio.js              # Síntese sonora procedural (Web Audio API)
│       ├── environment.js        # Arena holográfica, morango 3D e iluminação
│       ├── tutorialData.js       # Textos neurocientíficos do tutorial
│       └── style.css             # Estilização cyber-bio, HUD e glassmorphism
├── docs/                         # Governança e auditoria
│   ├── README.md                 # Índice de documentação
│   └── todo.md                   # Backlog oficial do projeto
├── export_data.py                # Pipeline de extração neuPrint -> frontend/public/data/
├── requirements.txt              # Dependências Python para neuroinformática
├── .env.example                  # Template para credencial da Janelia API
├── GEMINI.md                     # Fonte primária da verdade arquitetural
└── README.md                     # Este documento
```

---

## 📚 Documentação Adicional e Governança

Para detalhes técnicos avançados sobre a arquitetura do software, modelos biomecânicos e pendências de desenvolvimento:
- [GEMINI.md](file:///c:/Users/ruben/Desktop/Projetinhos/Mosca/GEMINI.md) — Documentação da arquitetura do sistema e padrões técnicos.
- [docs/todo.md](file:///c:/Users/ruben/Desktop/Projetinhos/Mosca/docs/todo.md) — Backlog oficial único com status de todas as tarefas.
- [docs/README.md](file:///c:/Users/ruben/Desktop/Projetinhos/Mosca/docs/README.md) — Índice geral de documentação.

---

## 📜 Licença e Créditos Científicos
- **Dados Conectômicos**: [Janelia Research Campus / FlyEM Project](https://www.janelia.org/) (`male-cns:v1.0`).
- **Visualização Morfológica**: Desenvolvido com base no ecossistema [navis](https://navis.readthedocs.io/) e [neuprint-python](https://connectome-neuprint.github.io/neuprint-python/).
