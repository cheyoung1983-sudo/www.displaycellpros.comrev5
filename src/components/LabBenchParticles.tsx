import React, { useEffect, useRef } from 'react';

interface LabBenchParticlesProps {
  density?: number;
  interactive?: boolean;
  className?: string;
  paused?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  colorType: 'blue' | 'cyan' | 'emerald' | 'white';
}

export const LabBenchParticles: React.FC<LabBenchParticlesProps> = ({
  density = 28,
  className = '',
  paused = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    const colorPalettes = {
      blue: '59, 130, 246',
      cyan: '6, 182, 212',
      emerald: '16, 185, 129',
      white: '226, 232, 240',
    };

    const types: Array<'blue' | 'cyan' | 'emerald' | 'white'> = [
      'blue', 'cyan', 'blue', 'emerald', 'white'
    ];

    const initParticles = (w: number, h: number) => {
      width = w;
      height = h;
      canvas.width = w * window.devicePixelRatio || w;
      canvas.height = h * window.devicePixelRatio || h;
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

      const count = Math.floor((w * h) / 16000) || density;
      const actualCount = Math.min(Math.max(count, 18), 45);

      particles = Array.from({ length: actualCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.3 - 0.08, // subtle upward draft
        radius: Math.random() * 1.6 + 0.8,
        baseAlpha: Math.random() * 0.35 + 0.12,
        alpha: Math.random() * 0.35 + 0.12,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulsePhase: Math.random() * Math.PI * 2,
        colorType: types[Math.floor(Math.random() * types.length)],
      }));
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          initParticles(w, h);
        }
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
      const rect = canvas.parentElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        initParticles(rect.width, rect.height);
      }
    }

    const render = () => {
      if (!ctx || width === 0 || height === 0) return;

      ctx.clearRect(0, 0, width, height);

      // Render subtle interconnected circuit traces between closely clustered lab particles
      const maxDistance = 75;
      const maxDistanceSq = maxDistance * maxDistance;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistanceSq) {
            const alpha = (1 - Math.sqrt(distSq) / maxDistance) * 0.09;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(96, 165, 250, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Render individual ions / micro-particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!paused) {
          p.x += p.vx;
          p.y += p.vy;
          p.pulsePhase += p.pulseSpeed;
          p.alpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.08;

          // Boundary wrapping with subtle padding
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;
        }

        const color = colorPalettes[p.colorType];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${Math.max(0.04, p.alpha)})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [density, paused]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 w-full h-full z-0 opacity-85 will-change-transform ${className}`}
    />
  );
};

export default LabBenchParticles;
