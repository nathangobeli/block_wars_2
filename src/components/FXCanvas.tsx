import React, { useEffect, useRef, useCallback } from 'react';
import { FloatingCombatText, Particle } from '../types';

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  lineWidth: number;
}

interface DrillBeam {
  x: number;
  startY: number;
  endY: number;
  alpha: number;
  width: number;
}

export interface FXTriggerMethods {
  addSparks: (x: number, y: number, color: string, count?: number) => void;
  addExplosion: (x: number, y: number, isGiganto?: boolean) => void;
  addDrillBeam: (x: number, height: number) => void;
  addFloatingText: (text: string, x: number, y: number, color: string) => void;
  triggerScreenShake: (intensity?: number) => void;
  clearFX: () => void;
}

interface FXCanvasProps {
  onRegisterTriggers: (triggers: FXTriggerMethods) => void;
}

export const FXCanvas: React.FC<FXCanvasProps> = ({ onRegisterTriggers }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const drillBeamsRef = useRef<DrillBeam[]>([]);
  const combatTextsRef = useRef<FloatingCombatText[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Screen shake ref
  const shakeRef = useRef<{ x: number; y: number; trauma: number }>({ x: 0, y: 0, trauma: 0 });

  const clearFX = useCallback(() => {
    particlesRef.current = [];
    shockwavesRef.current = [];
    drillBeamsRef.current = [];
    combatTextsRef.current = [];
    shakeRef.current = { x: 0, y: 0, trauma: 0 };
    const root = document.getElementById('root');
    if (root && root.style.transform !== '') {
      root.style.transform = '';
    }
  }, []);

  const triggerScreenShake = useCallback((intensity: number = 8) => {
    shakeRef.current.trauma = Math.min(shakeRef.current.trauma + intensity, 25);
  }, []);

  const addSparks = useCallback((x: number, y: number, color: string, count: number = 24) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color,
        size: 2 + Math.random() * 4,
        alpha: 1,
        life: 0,
        maxLife: 25 + Math.random() * 20,
        type: 'spark',
      });
    }
  }, []);

  const addExplosion = useCallback((x: number, y: number, isGiganto: boolean = false) => {
    const particleCount = isGiganto ? 120 : 60;
    const colors = isGiganto
      ? ['#ff00aa', '#bc13fe', '#ffaa00', '#ffffff', '#ff2a55']
      : ['#ff4400', '#ffaa00', '#ffff00', '#ffffff', '#ff2a55'];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (isGiganto ? 4 : 2) + Math.random() * (isGiganto ? 14 : 9);
      const color = colors[Math.floor(Math.random() * colors.length)];
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * (isGiganto ? 8 : 5),
        alpha: 1,
        life: 0,
        maxLife: 30 + Math.random() * 30,
        type: 'spark',
      });
    }

    // Shockwave ring
    shockwavesRef.current.push({
      x,
      y,
      radius: 5,
      maxRadius: isGiganto ? 220 : 120,
      color: isGiganto ? '#bc13fe' : '#ffaa00',
      alpha: 1,
      lineWidth: isGiganto ? 6 : 4,
    });

    triggerScreenShake(isGiganto ? 16 : 8);
  }, [triggerScreenShake]);

  const addDrillBeam = useCallback((x: number, height: number) => {
    drillBeamsRef.current.push({
      x,
      startY: 0,
      endY: height,
      alpha: 1,
      width: 28,
    });

    // Sparks along the column
    for (let i = 0; i < 40; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 20,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 6,
        color: '#00f3ff',
        size: 2 + Math.random() * 4,
        alpha: 1,
        life: 0,
        maxLife: 20 + Math.random() * 15,
        type: 'spark',
      });
    }

    triggerScreenShake(7);
  }, [triggerScreenShake]);

  const addFloatingText = useCallback((text: string, x: number, y: number, color: string) => {
    combatTextsRef.current.push({
      id: Math.random().toString(36).substring(2, 9),
      text,
      playerId: 'p1',
      x,
      y,
      color,
      duration: 50,
    });
  }, []);

  useEffect(() => {
    onRegisterTriggers({
      addSparks,
      addExplosion,
      addDrillBeam,
      addFloatingText,
      triggerScreenShake,
      clearFX,
    });
  }, [onRegisterTriggers, addSparks, addExplosion, addDrillBeam, addFloatingText, triggerScreenShake, clearFX]);

  // Main Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      if (!running) return;

      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Screen shake translation
      if (shakeRef.current.trauma > 0) {
        const angle = Math.random() * Math.PI * 2;
        const offset = shakeRef.current.trauma * 0.6;
        shakeRef.current.x = Math.cos(angle) * offset;
        shakeRef.current.y = Math.sin(angle) * offset;
        shakeRef.current.trauma = Math.max(0, shakeRef.current.trauma * 0.9 - 0.2);
        const root = document.getElementById('root');
        if (root) {
          root.style.transform = `translate(${shakeRef.current.x}px, ${shakeRef.current.y}px)`;
        }
      } else {
        const root = document.getElementById('root');
        if (root && root.style.transform !== '') {
          root.style.transform = '';
        }
      }

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // 1. Draw Shockwaves
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.radius += (sw.maxRadius - sw.radius) * 0.18 + 2;
        sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha;
        ctx.lineWidth = sw.lineWidth;
        ctx.stroke();

        if (sw.radius >= sw.maxRadius || sw.alpha <= 0.01) {
          shockwavesRef.current.splice(i, 1);
        }
      }

      // 2. Draw Drill Beams
      for (let i = drillBeamsRef.current.length - 1; i >= 0; i--) {
        const beam = drillBeamsRef.current[i];
        beam.alpha -= 0.05;
        beam.width *= 0.92;

        ctx.beginPath();
        ctx.moveTo(beam.x, beam.startY);
        ctx.lineTo(beam.x, beam.endY);
        ctx.strokeStyle = '#00f3ff';
        ctx.globalAlpha = Math.max(0, beam.alpha);
        ctx.lineWidth = Math.max(1, beam.width);
        ctx.stroke();

        // Inner white core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1, beam.width * 0.35);
        ctx.stroke();

        if (beam.alpha <= 0.01) {
          drillBeamsRef.current.splice(i, 1);
        }
      }

      // 3. Draw Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // Gravity
        p.vx *= 0.97;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - (p.life / p.maxLife) * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        if (p.life >= p.maxLife || p.alpha <= 0.01) {
          particlesRef.current.splice(i, 1);
        }
      }

      // 4. Draw Floating Combat Text
      ctx.restore();
      ctx.save();
      ctx.font = '900 20px Orbitron, Rajdhani, sans-serif';
      ctx.textAlign = 'center';

      for (let i = combatTextsRef.current.length - 1; i >= 0; i--) {
        const ct = combatTextsRef.current[i];
        ct.y -= 1.2;
        if (ct.duration !== undefined) {
          ct.duration--;
        }

        const alpha = ct.duration ? Math.min(1, ct.duration / 15) : 1;
        ctx.globalAlpha = alpha;

        // Glow outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeText(ct.text, ct.x, ct.y);

        ctx.fillStyle = ct.color;
        ctx.fillText(ct.text, ct.x, ct.y);

        if (ct.duration !== undefined && ct.duration <= 0) {
          combatTextsRef.current.splice(i, 1);
        }
      }
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-40 w-full h-full"
    />
  );
};
