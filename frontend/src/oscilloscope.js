// Osciloscópio Neural de Membrana (LIF Dynamics) em Canvas 2D
export class NeuralOscilloscope {
  constructor(canvasId, voltDisplayId, spikesCountId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.voltDisplay = document.getElementById(voltDisplayId);
    this.spikesDisplay = document.getElementById(spikesCountId);

    // Parâmetros Biofísicos LIF (Leaky Integrate-and-Fire)
    this.vRest = -52.0;    // mV
    this.vReset = -62.0;   // mV
    this.vThresh = 0.0;    // mV
    this.vPeak = 24.0;     // mV
    this.tau = 18.0;       // constante de tempo da membrana (ms)
    this.vMem = this.vRest;

    this.spikesTotal = 0;
    this.history = [];
    this.maxPoints = 140;

    // Inicializa histórico no potencial de repouso
    for (let i = 0; i < this.maxPoints; i++) {
      this.history.push(this.vRest);
    }
  }

  // Injeta corrente de estímulo elétrico (pA)
  stimulate(current_pA = 150) {
    // A corrente despolariza a membrana instantaneamente
    this.vMem += (current_pA / 6.0);
  }

  // Atualiza um passo de tempo dt (ms)
  step(dt = 0.5) {
    let spiked = false;

    // Dinâmica de decaimento passivo (Leaky)
    const leak = -(this.vMem - this.vRest) / this.tau;
    this.vMem += leak * dt;

    // Ruído térmico biológico sutil (±0.3 mV)
    this.vMem += (Math.random() - 0.5) * 0.4;

    // Disparo de potencial de ação (Spike)
    if (this.vMem >= this.vThresh) {
      this.history.push(this.vPeak);
      this.vMem = this.vReset;
      this.spikesTotal++;
      spiked = true;
    } else {
      this.history.push(this.vMem);
    }

    if (this.history.length > this.maxPoints) {
      this.history.shift();
    }

    // Atualiza badges de texto
    if (this.voltDisplay) {
      this.voltDisplay.textContent = `${this.vMem.toFixed(1)} mV`;
    }
    if (this.spikesDisplay) {
      this.spikesDisplay.textContent = `Spikes: ${this.spikesTotal}`;
    }

    return spiked;
  }

  // Renderiza no Canvas com estética Cyber-Bio
  draw() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    // Limpa fundo
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#050915';
    ctx.fillRect(0, 0, w, h);

    // Mapeamento Y (-70 mV a +35 mV)
    const vMin = -70.0;
    const vMax = 35.0;
    const getY = (v) => h - ((v - vMin) / (vMax - vMin)) * h;

    // Linhas de Grade
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';

    for (let v = -60; v <= 20; v += 20) {
      const y = getY(v);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Linha de Repouso (-52 mV)
    const yRest = getY(this.vRest);
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.beginPath();
    ctx.moveTo(0, yRest);
    ctx.lineTo(w, yRest);
    ctx.stroke();

    // Linha de Limiar (0 mV)
    const yThresh = getY(this.vThresh);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.beginPath();
    ctx.moveTo(0, yThresh);
    ctx.lineTo(w, yThresh);
    ctx.stroke();
    ctx.setLineDash([]);

    const isDepolarized = this.vMem > -40.0;
    const traceColor = isDepolarized ? '#fbbf24' : '#38bdf8';
    const stepX = w / (this.maxPoints - 1);

    // Gradiente translúcido sob a curva
    const grad = ctx.createLinearGradient(0, getY(this.vPeak), 0, h);
    grad.addColorStop(0, isDepolarized ? 'rgba(251, 191, 36, 0.22)' : 'rgba(56, 189, 248, 0.16)');
    grad.addColorStop(1, 'rgba(5, 9, 21, 0)');

    ctx.beginPath();
    for (let i = 0; i < this.history.length; i++) {
      const x = i * stepX;
      const y = getY(this.history[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Traçado nítido da Voltagem de Membrana
    ctx.beginPath();
    for (let i = 0; i < this.history.length; i++) {
      const x = i * stepX;
      const y = getY(this.history[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineWidth = 2.0;
    ctx.strokeStyle = traceColor;
    ctx.shadowColor = traceColor;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}
