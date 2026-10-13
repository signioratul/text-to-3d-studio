"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    let width = 0;
    let height = 0;
    let animationId = 0;
    let particles: Particle[] = [];

    const pointer = {
      x: -1000,
      y: -1000,
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(
        100,
        Math.max(35, Math.floor((width * height) / 16000))
      );

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5,
      }));

      draw();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      // Subtle ambient glow.
      const glow = context.createRadialGradient(
        width * 0.5,
        height * 0.35,
        0,
        width * 0.5,
        height * 0.35,
        Math.max(width, height) * 0.7
      );

      glow.addColorStop(0, "rgba(76, 29, 149, 0.16)");
      glow.addColorStop(0.45, "rgba(30, 58, 138, 0.07)");
      glow.addColorStop(1, "rgba(9, 9, 11, 0)");

      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      // Cursor-reactive glow.
      if (pointer.x >= 0 && pointer.y >= 0) {
        const pointerGlow = context.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          240
        );

        pointerGlow.addColorStop(0, "rgba(124, 58, 237, 0.12)");
        pointerGlow.addColorStop(1, "rgba(124, 58, 237, 0)");

        context.fillStyle = pointerGlow;
        context.fillRect(0, 0, width, height);
      }

      // Particles and their nearby connections.
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        if (!reducedMotion.matches) {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < 0 || particle.x > width) {
            particle.vx *= -1;
          }

          if (particle.y < 0 || particle.y > height) {
            particle.vy *= -1;
          }

          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 130 && distance > 0) {
            const force = (130 - distance) / 130;

            particle.x += (dx / distance) * force * 0.7;
            particle.y += (dy / distance) * force * 0.7;
          }
        }

        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 125) {
            const opacity = (1 - distance / 125) * 0.24;

            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);
            context.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
            context.lineWidth = 0.7;
            context.stroke();
          }
        }

        context.beginPath();
        context.arc(
          particle.x,
          particle.y,
          particle.radius,
          0,
          Math.PI * 2
        );
        context.fillStyle = "rgba(196, 181, 253, 0.8)";
        context.fill();
      }

      if (!reducedMotion.matches) {
        animationId = window.requestAnimationFrame(draw);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;

      if (reducedMotion.matches) {
        draw();
      }
    };

    const handlePointerLeave = () => {
      pointer.x = -1000;
      pointer.y = -1000;

      if (reducedMotion.matches) {
        draw();
      }
    };

    const handleMotionPreference = () => {
      window.cancelAnimationFrame(animationId);
      draw();
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerleave", handlePointerLeave);
    reducedMotion.addEventListener("change", handleMotionPreference);

    resize();

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
      reducedMotion.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="interactive-background"
    />
  );
}