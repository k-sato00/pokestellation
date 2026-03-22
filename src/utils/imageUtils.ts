import { useEffect, useRef } from 'react';

export const adjustImageOpacity = (image: HTMLImageElement, opacity: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (ctx) {
        canvas.width = image.width;
        canvas.height = image.height;

        ctx.globalAlpha = opacity;
        ctx.drawImage(image, 0, 0);
    }

    return canvas;
};

export const drawStarsAndLines = (canvas: HTMLCanvasElement, stars: { x: number; y: number }[]): void => {
    const ctx = canvas.getContext('2d');

    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1;

        stars.forEach((star, index) => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.closePath();

            if (index > 0) {
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(stars[index - 1].x, stars[index - 1].y);
                ctx.lineTo(star.x, star.y);
                ctx.stroke();
                ctx.closePath();
            }
        });
    }
};