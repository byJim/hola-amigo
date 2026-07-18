"use client";

import { useEffect, useRef } from "react";

const GLYPHS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const FRAME_INTERVAL = 1000 / 30;

type RainColumn = {
  y: number;
  speed: number;
};

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let reducedMotion = motionPreference.matches;
    let frameId = 0;
    let lastFrame = 0;
    let width = 0;
    let height = 0;
    let fontSize = 18;
    let columns: RainColumn[] = [];

    const randomGlyph = () =>
      GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

    const resetColumns = () => {
      const columnCount = Math.ceil(width / fontSize);
      columns = Array.from({ length: columnCount }, () => ({
        y: -Math.random() * (height / fontSize),
        speed: 0.55 + Math.random() * 0.8,
      }));
    };

    const paintBackground = () => {
      context.shadowBlur = 0;
      context.fillStyle = "#020705";
      context.fillRect(0, 0, width, height);
    };

    const drawStaticRain = () => {
      paintBackground();
      context.font = `${fontSize}px ui-monospace, monospace`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "rgba(31, 255, 119, 0.2)";

      const rows = Math.ceil(height / fontSize);
      columns.forEach((_, columnIndex) => {
        for (let row = 0; row < rows; row += 1) {
          if (Math.random() > 0.84) {
            context.fillText(
              randomGlyph(),
              columnIndex * fontSize + fontSize / 2,
              row * fontSize + fontSize / 2,
            );
          }
        }
      });
    };

    const drawFrame = () => {
      context.shadowBlur = 0;
      context.fillStyle = "rgba(2, 7, 5, 0.13)";
      context.fillRect(0, 0, width, height);
      context.font = `${fontSize}px ui-monospace, monospace`;
      context.textAlign = "center";
      context.textBaseline = "middle";

      columns.forEach((column, index) => {
        const x = index * fontSize + fontSize / 2;
        const y = column.y * fontSize;
        const brightHead = Math.random() > 0.8;

        context.fillStyle = brightHead ? "#d9ffe7" : "#20f977";
        context.shadowColor = "#00ff66";
        context.shadowBlur = brightHead ? 9 : 3;
        context.fillText(randomGlyph(), x, y);

        if (y > height + fontSize && Math.random() > 0.975) {
          column.y = -Math.random() * 18;
          column.speed = 0.55 + Math.random() * 0.8;
        } else {
          column.y += column.speed;
        }
      });
    };

    const animate = (timestamp: number) => {
      if (timestamp - lastFrame >= FRAME_INTERVAL) {
        drawFrame();
        lastFrame = timestamp;
      }
      frameId = window.requestAnimationFrame(animate);
    };

    const syncMotion = () => {
      window.cancelAnimationFrame(frameId);
      reducedMotion = motionPreference.matches;
      if (reducedMotion) {
        drawStaticRain();
      } else {
        lastFrame = 0;
        frameId = window.requestAnimationFrame(animate);
      }
    };

    const resizeCanvas = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(window.innerWidth, 1);
      height = Math.max(window.innerHeight, 1);
      fontSize = width < 640 ? 15 : 18;

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      resetColumns();

      if (reducedMotion) drawStaticRain();
    };

    resizeCanvas();
    syncMotion();
    window.addEventListener("resize", resizeCanvas);
    motionPreference.addEventListener("change", syncMotion);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resizeCanvas);
      motionPreference.removeEventListener("change", syncMotion);
    };
  }, []);

  return <canvas ref={canvasRef} className="matrix-rain" aria-hidden="true" />;
}
