export const TUTORIAL_CIRCUITS = {
  MBON03: {
    id: 'MBON03',
    nome: 'Mushroom Body Output Neuron 03',
    apelido: 'Circuito de Recompensa & Alimento (Glicose / Fome)',
    icone: '🍓',
    cor: '#ef4444',
    roi: 'Lobos Alfa/Beta do Mushroom Body (Corpo Cogumelo)',
    resumo: 'Controla a sensação de fome, valor de recompensa de açúcar e direcionamento para alimentos doces.',
    biologiaReal: `No cérebro da mosca-das-frutas, o <strong>Mushroom Body</strong> é o principal centro de aprendizado, memória e processamento de recompensas. 
    Quando os receptores gustativos nas patas e antenas detectam sacarose (açúcar presente em frutas maduras como morangos), neurônios dopaminérgicos do agrupamento PAM (Protocerebral Anterior Medial) disparam sinapses sobre os dendritos do <strong>MBON03</strong>.
    Essa via sinaliza que o estímulo é benéfico e vital para a sobrevivência, suprimindo comportamentos de fuga e ativando a motivação para se alimentar.`,
    efeitoSimulador: `No FlyBrain 3D, quando este circuito é ativado, a mosca calcula a rota até o <strong>pequeno morango</strong>, inicia a marcha tripodal vigorosa em direção à fruta e, ao chegar perto, estende a probóscide (aparelho bucal) para sugar o néctar doce, <strong>reduzindo a fome biológica</strong> e restabelecendo o nível de glicose.`,
    dadosNeuprint: {
      pre: 800,
      post: 800,
      ramos: '9.876 segmentos',
      neurotransmissor: 'Acetilcolina / Dopamina (PAM)'
    },
    dica: 'Use este circuito quando o medidor de fome estiver elevado para guiar a mosca até o morango!'
  },

  ExR5: {
    id: 'ExR5',
    nome: 'Ring ExR Neuron 5 (Complexo Central)',
    apelido: 'Bússola Biológica 360° (Navegação & Rumo Espacial)',
    icone: '🧭',
    cor: '#38bdf8',
    roi: 'Corpo Elipsoide (Ellipsoid Body - EB) no Complexo Central',
    resumo: 'Atua como a bússola viva da mosca, mantendo o ângulo e direção em relação ao Sol e pontos de referência.',
    biologiaReal: `O <strong>Corpo Elipsoide</strong> é uma estrutura em forma de anel (toroide) localizada no centro da cabeça da mosca. 
    Os neurônios <strong>ExR5</strong> e os 'neurônios em anel' codificam a orientação espacial da mosca em 360 graus. 
    Conforme a mosca gira, um ponto de atividade bioelétrica (chamado de <em>bump de atividade</em>) viaja ao redor do anel como a agulha de uma bússola, integrando informações visuais da luz polarizada do Sol e giros corporais.`,
    efeitoSimulador: `Ao injetar estímulo no ExR5, a mosca executa uma <strong>patrulha circular coordenada</strong> na arena, corrigindo o rumo espacial com base nos anéis de coordenadas ópticas do solo.`,
    dadosNeuprint: {
      pre: 750,
      post: 750,
      ramos: '8.450 segmentos',
      neurotransmissor: 'GABA / Glutamato'
    },
    dica: 'Observe a orientação da mosca alinhando-se com a luz solar da arena ao ativar esta bússola.'
  },

  DNge104: {
    id: 'DNge104',
    nome: 'Descending Neuron giant escape 104',
    apelido: 'Reflexo de Fuga Rápida (Giant Fiber Escape)',
    icone: '⚡',
    cor: '#f59e0b',
    roi: 'Cérebro Posterior descendo pelo Cordão Nervoso Ventral (VNC)',
    resumo: 'Dispara um salto catapulta de emergência em menos de 10 milissegundos para evitar predadores ou esmagamento.',
    biologiaReal: `As <strong>Fibras Gigantes (Giant Fiber System)</strong> são os axônios mais espessos do sistema nervoso da mosca, projetados para velocidade extrema de condução bioelétrica. 
    Quando os olhos compostos detectam uma sombra se expandindo subitamente (um predador atacando ou uma mão humana se aproximando), o sinal viaja do lobo óptico diretamente para o <strong>DNge104</strong> sem atraso de interneurônios intermediários. 
    O potencial de ação estimula os músculos tergotrocantéricos das pernas médias, que agem como molas comprimidas.`,
    efeitoSimulador: `No simulador, o estímulo provoca um <strong>salto catapulta explosivo</strong> com abertura imediata das asas translúcidas em decolagem de emergência, escapando da sombra do predador na parede da arena.`,
    dadosNeuprint: {
      pre: 620,
      post: 620,
      ramos: '7.120 segmentos',
      neurotransmissor: 'Acetilcolina (Transmissão Ultrarrápida)'
    },
    dica: 'Se a mosca estiver no solo sob ameaça, acione o DNge104 para testemunhar o salto balístico antiesmagamento!'
  },

  's-LNv': {
    id: 's-LNv',
    nome: 'Small Ventrolateral Clock Neurons',
    apelido: 'Marcapasso Circadiano (Relógio Biológico Sono / Vigília)',
    icone: '⏰',
    cor: '#a855f7',
    roi: 'Lobos Ventrolaterais com projeção dorsal',
    resumo: 'Marca o ritmo de 24 horas da mosca, regulando quando ela acorda para forragear e quando dorme.',
    biologiaReal: `Descobertos nos célebres estudos ganhadores do Prêmio Nobel de Medicina sobre os genes <em>Period</em> e <em>Clock</em>, os neurônios <strong>s-LNv</strong> geram uma oscilação molecular que dura precisamente 24 horas. 
    Eles liberam o peptídeo <strong>PDF (Pigment Dispersing Factor)</strong>, sincronizando todo o cérebro com o ciclo de dia e noite. 
    Pela manhã, a atividade dos s-LNv sobe, induzindo o 'pico matinal' de locomoção e busca por parceiros ou alimento.`,
    efeitoSimulador: `Ao estimular o s-LNv, a mosca entra em modo de <strong>vigília matinal calma</strong>, iniciando caminhada exploratória em linha reta com respiração abdominal regular.`,
    dadosNeuprint: {
      pre: 580,
      post: 580,
      ramos: '6.300 segmentos',
      neurotransmissor: 'Peptídeo PDF / Neuropeptídeos'
    },
    dica: 'Excelente para observar a marcha tripodal rítmica estável sob a luz suave da manhã.'
  },

  MBON01: {
    id: 'MBON01',
    nome: 'Mushroom Body Output Neuron 01',
    apelido: 'Memória & Aprendizado Olfativo Aversivo',
    icone: '🧠',
    cor: '#ec4899',
    roi: 'Lobos Gama e Pedúnculo do Mushroom Body',
    resumo: 'Centro de memória associativa que armazena lembranças de perigos aprendidos e comanda desvio de rota.',
    biologiaReal: `Se a mosca sente um cheiro neutro e simultaneamente sofre uma punição (como calor excessivo ou choque leve em experimentos de laboratório), sinapses entre as células de Kenyon e o <strong>MBON01</strong> sofrem <em>Depressão de Longa Duração (LTD)</em>. 
    A partir de então, quando a mosca volta a sentir aquele cheiro, a rota neural aprendida sinaliza 'PERIGO!', provocando respostas instantâneas de aversão e esquiva.`,
    efeitoSimulador: `O estímulo dispara uma resposta motora de <strong>desvio defensivo de trajetória</strong>: a mosca corrige o ângulo corporal e vira para o lado oposto, simulando a evasão de uma área perigosa memorizada.`,
    dadosNeuprint: {
      pre: 850,
      post: 850,
      ramos: '10.200 segmentos',
      neurotransmissor: 'Glutamato / Acetilcolina'
    },
    dica: 'Combine este circuito com o modo Raio-X para ver o intrincado emaranhado nos lobos gama do Mushroom Body.'
  },

  DNp09: {
    id: 'DNp09',
    nome: 'Descending Neuron posterior 09',
    apelido: 'Freio de Pouso & Desaceleração Pré-motora',
    icone: '🛑',
    cor: '#f87171',
    roi: 'Nuca descendo para os Centros Motores do Tórax',
    resumo: 'Comanda o pouso suave cortando a força das asas e estendendo as pernas como amortecedores de impacto.',
    biologiaReal: `O <strong>DNp09</strong> é um dos principais neurônios de comando pré-motor descendente. 
    Durante o voo, sua ativação envia sinais inibitórios aos geradores de padrão central (CPGs) que controlam as asas e simultaneamente ativa o reflexo de <strong>extensão de pouso (Landing Response)</strong> nas 6 pernas. 
    Isso desacelera a velocidade aerodinâmica e prepara as patas para absorver a energia cinética ao tocar o solo. Se a mosca já estiver andando, o DNp09 comanda a interrupção imediata da marcha.`,
    efeitoSimulador: `<strong>Correção do Voo:</strong> Se a mosca estiver voando no ar, a sinapse DNp09 inicia uma descida controlada suave, desacelerando as asas e estendendo as pernas para pousar firmemente no solo, <em>sem nunca flutuar ou andar no vazio</em>. Se estiver no chão, comanda parada total em repouso.`,
    dadosNeuprint: {
      pre: 710,
      post: 710,
      ramos: '8.900 segmentos',
      neurotransmissor: 'GABA / Acetilcolina'
    },
    dica: 'Decole com [ESPAÇO] e, em pleno ar, aperte [E] com o DNp09 selecionado para assistir ao pouso biológico amortecido!'
  }
};

export const TUTORIAL_BIO_GUIDE = {
  titulo: '⚡ Biofísica LIF, Fome & Eletrofisiologia',
  secoes: [
    {
      titulo: '1. O Modelo LIF (Leaky Integrate-and-Fire)',
      conteudo: `O osciloscópio no HUD simula a membrana biológica de um neurônio real em tempo real.
      <br><br>
      • <strong>Potencial de Repouso (-52 mV):</strong> Voltagem elétrica natural mantida pela bomba de sódio-potássio.<br>
      • <strong>Injeção de Corrente (pA):</strong> Ao clicar em ESTIMULAR ou pressionar [E], você injeta corrente despolarizante.<br>
      • <strong>Limiar de Disparo (0 mV):</strong> Se a carga acumulada ultrapassar o limiar, canais de voltagem abrem e disparam um <em>Spike</em> (+24 mV).<br>
      • <strong>Reset Refratário (-62 mV):</strong> Imediatamente após o disparo, a célula hiperpolariza temporariamente antes de relaxar passivamente.`
    },
    {
      titulo: '2. Sistema de Fome & Metabolismo Realista',
      conteudo: `Insetos pequenos têm alta razão área/volume e perdem energia rapidamente. No FlyBrain 3D, a mosca possui metabolismo dinâmico:
      <br><br>
      • <strong>Custo de Voo (210 Hz):</strong> Bater as asas centenas de vezes por segundo gasta quase <strong>3x mais energia</strong> do que ficar em repouso! A fome sobe rapidamente durante voos prolongados.<br>
      • <strong>Alimentação no Pequeno Morango:</strong> Quando a mosca chega perto do morango doce (18.0, 14.0) e estende a probóscide, o néctar consumido sacia a fome de volta a 0%, gerando picos de dopamina no circuito MBON03!<br>
      • <strong>Níveis de Fome:</strong> Verde (Saciada: 0-30%), Amarelo (Apetite: 31-65%), Vermelho (Faminta: 66-100%).`
    },
    {
      titulo: '3. Conectoma 3D do Janelia Research Campus',
      conteudo: `Os dados 3D visualizados no interior da cabeça da mosca são extraídos do dataset oficial <code>male-cns:v1.0</code> do Janelia.
      <br><br>
      • <strong>Linhas Brilhantes:</strong> O esqueleto de ramos axonais e dendríticos traçados por microscopia eletrônica.<br>
      • <strong>Pontos Dourados/Amarelos:</strong> Sinapses pré-sinápticas (onde o neurônio envia neurotransmissores).<br>
      • <strong>Pontos Azuis/Ciano:</strong> Sinapses pós-sinápticas (onde a célula recebe sinais). Passe o mouse sobre elas em modo Raio-X para inspecionar as coordenadas nanométricas reais!`
    }
  ]
};
