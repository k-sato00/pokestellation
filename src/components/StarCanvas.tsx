import React, { useRef, useEffect } from 'react';

interface Star {
  x: number;
  y: number;
}


interface StarCanvasProps {
  stars: Star[];
  onAddStar: (star: Star) => void;
}

const StarCanvas: React.FC<StarCanvasProps> = ({ stars, onAddStar }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawStars = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    stars.forEach((star) => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.setLineDash([5, 5]);
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        ctx.beginPath();
        ctx.moveTo(stars[i].x, stars[i].y);
        ctx.lineTo(stars[j].x, stars[j].y);
        ctx.stroke();
      }
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (stars.length < 10) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        onAddStar({ x, y });
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawStars(ctx);
      }
    }
  }, [stars]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={500}
      onClick={handleCanvasClick}
      style={{ border: '1px solid black' }}
    />
  );
};

export default StarCanvas;