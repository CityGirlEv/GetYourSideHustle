/**
 * Lightweight canvas fireworks / party streamers (no external confetti dependency).
 */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  kind: "spark" | "streamer";
  rot: number;
  vr: number;
};

const COLORS = ["#9B2F28", "#D7C697", "#2d2a26", "#e8a54b", "#fff8e8", "#c45c4a", "#6b8f71"];

function burst(particles: Particle[], cx: number, cy: number, count: number, kind: Particle["kind"]) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = kind === "streamer" ? 2 + Math.random() * 5 : 3 + Math.random() * 7;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (kind === "streamer" ? 2 : 4),
      life: 0,
      maxLife: kind === "streamer" ? 70 + Math.random() * 40 : 45 + Math.random() * 35,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      size: kind === "streamer" ? 3 + Math.random() * 4 : 2 + Math.random() * 3,
      kind,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
    });
  }
}

/** Run a short fireworks show on a full-viewport canvas. Returns a stop fn. */
export function runFireworks(canvas: HTMLCanvasElement, durationMs = 4500): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => undefined;

  let raf = 0;
  let running = true;
  const particles: Particle[] = [];
  const start = performance.now();
  let lastBurst = 0;

  const resize = () => {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const tick = (now: number) => {
    if (!running) return;
    const elapsed = now - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (elapsed < durationMs - 800 && now - lastBurst > 280) {
      lastBurst = now;
      const cx = window.innerWidth * (0.15 + Math.random() * 0.7);
      const cy = window.innerHeight * (0.12 + Math.random() * 0.45);
      burst(particles, cx, cy, 28 + Math.floor(Math.random() * 18), "spark");
      if (Math.random() > 0.35) {
        burst(particles, cx, cy + 40, 14, "streamer");
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]!;
      p.life += 1;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.kind === "streamer" ? 0.12 : 0.08;
      p.vx *= 0.99;
      p.rot += p.vr;
      const alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      if (p.kind === "streamer") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillRect(-p.size * 0.4, -p.size * 2.2, p.size * 0.8, p.size * 4.4);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    if (elapsed < durationMs || particles.length > 0) {
      raf = requestAnimationFrame(tick);
    } else {
      running = false;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  };

  // Opening double burst
  burst(particles, window.innerWidth * 0.35, window.innerHeight * 0.28, 40, "spark");
  burst(particles, window.innerWidth * 0.65, window.innerHeight * 0.22, 36, "spark");
  burst(particles, window.innerWidth * 0.5, window.innerHeight * 0.18, 20, "streamer");
  raf = requestAnimationFrame(tick);

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  };
}
