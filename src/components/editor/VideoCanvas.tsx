import { useEffect, useRef } from "react";

const VideoCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1920;
    canvas.height = 1080;

    // Draw placeholder background
    ctx.fillStyle = "hsl(220, 25%, 10%)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center grid pattern
    ctx.strokeStyle = "hsl(220, 15%, 18%)";
    ctx.lineWidth = 1;
    const gridSize = 50;

    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw "Video Preview" text
    ctx.fillStyle = "hsl(210, 15%, 60%)";
    ctx.font = "48px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Video Preview", canvas.width / 2, canvas.height / 2);
  }, []);

  return (
    <div className="relative w-full aspect-video bg-[hsl(var(--editor-bg))] rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default VideoCanvas;