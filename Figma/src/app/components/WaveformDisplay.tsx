import { useEffect, useRef } from "react";

interface WaveformDisplayProps {
  data: number[];
  currentTime: number;
  duration: number;
  isRecording: boolean;
}

export const WaveformDisplay = ({
  data,
  currentTime,
  duration,
  isRecording,
}: WaveformDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const W = container.clientWidth || 400;
    const H = container.clientHeight || 80;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const clearBg = () => {
      ctx.fillStyle = "rgba(7,7,15,0)";
      ctx.clearRect(0, 0, W, H);
    };

    if (isRecording) {
      cancelAnimationFrame(animRef.current);
      let frame = 0;
      const animRec = () => {
        clearBg();
        const bars = 80;
        const barW = W / bars;
        for (let i = 0; i < bars; i++) {
          const t = i / bars;
          const phase = frame * 0.07;
          const amp = Math.min(
            1,
            Math.abs(
              Math.sin(t * 18 + phase) * 0.45 +
                Math.sin(t * 8 + phase * 1.4) * 0.3 +
                Math.sin(t * 3 + phase * 0.6) * 0.25
            )
          );
          const barH = amp * H * 0.85;
          const x = i * barW;
          const y = (H - barH) / 2;
          const grad = ctx.createLinearGradient(x, y, x, y + barH);
          grad.addColorStop(0, `rgba(239,68,68,${0.5 + amp * 0.5})`);
          grad.addColorStop(0.5, `rgba(239,68,68,0.95)`);
          grad.addColorStop(1, `rgba(239,68,68,${0.5 + amp * 0.5})`);
          ctx.fillStyle = grad;
          ctx.fillRect(x + 0.5, y, Math.max(1, barW - 1.5), barH);
        }
        frame++;
        animRef.current = requestAnimationFrame(animRec);
      };
      animRef.current = requestAnimationFrame(animRec);
      return () => cancelAnimationFrame(animRef.current);
    }

    cancelAnimationFrame(animRef.current);
    clearBg();

    if (data.length === 0) {
      ctx.strokeStyle = "rgba(99,102,241,0.18)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      return;
    }

    const barCount = data.length;
    const barW = W / barCount;
    const playheadX = duration > 0 ? (currentTime / duration) * W : 0;

    for (let i = 0; i < barCount; i++) {
      const x = i * barW;
      const amp = data[i];
      const barH = Math.max(2, amp * H * 0.92);
      const y = (H - barH) / 2;
      const isPast = x < playheadX;

      if (isPast) {
        const grad = ctx.createLinearGradient(x, y, x, y + barH);
        grad.addColorStop(0, "rgba(167,139,250,0.85)");
        grad.addColorStop(0.5, "rgba(99,102,241,1)");
        grad.addColorStop(1, "rgba(167,139,250,0.85)");
        ctx.fillStyle = grad;
      } else {
        const grad = ctx.createLinearGradient(x, y, x, y + barH);
        grad.addColorStop(0, "rgba(99,102,241,0.28)");
        grad.addColorStop(0.5, "rgba(79,70,229,0.4)");
        grad.addColorStop(1, "rgba(99,102,241,0.28)");
        ctx.fillStyle = grad;
      }
      ctx.fillRect(x + 0.5, y, Math.max(1, barW - 1), barH);
    }

    if (duration > 0 && currentTime > 0) {
      ctx.shadowColor = "rgba(167,139,250,0.9)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.fillRect(playheadX - 1, 0, 2, H);
      ctx.shadowBlur = 0;
    }
  }, [data, currentTime, duration, isRecording]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};
