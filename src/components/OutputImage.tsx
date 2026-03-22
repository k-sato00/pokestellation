import React from 'react';

interface OutputImageProps {
    imageSrc: string;
    stars: Array<{ x: number; y: number }>;
    showImage?: boolean;
    canvasRef?: React.RefObject<HTMLCanvasElement>;
    onCanvasClick?: (x: number, y: number) => void;
    onStarClick?: (starIdx: number) => void;
    onLineClick?: (lineIdx: number) => void;
    lines?: Array<[number, number]>; // 星インデックスのペア
    selectedPair?: number[]; // 選択中の星インデックス
    selectedLineIdx?: number; // 選択中の線インデックス
}

// 不要な重複定義を削除
const OutputImage = (props: OutputImageProps) => {
    const { imageSrc, stars, showImage, canvasRef: externalCanvasRef, onCanvasClick, onStarClick, onLineClick, lines, selectedPair, selectedLineIdx } = props;
    const internalCanvasRef = React.useRef<HTMLCanvasElement>(null);
    const canvasRef = externalCanvasRef ?? internalCanvasRef;

    // 星空背景のコードを削除

    // showImageはpropsで受け取る
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!imageSrc || !canvas) {
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            return;
        }
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = imageSrc;


        img.onload = () => {
            if (ctx) {
                // 紺色背景
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.save();
                ctx.fillStyle = '#001f3f';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.restore();

                // 星空背景の描画処理を削除

                // 画像サイズ取得
                const imgW = img.width;
                const imgH = img.height;
                if (props.showImage !== false) {
                    // 画像をcanvas全体に描画
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    ctx.globalAlpha = 0.5; // 透明度を50%に設定
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    ctx.globalAlpha = 1.0; // 透明度を元に戻す
                }
                // 星形を描画する関数
                const drawStar = (
                    ctx: CanvasRenderingContext2D | null,
                    cx: number,
                    cy: number,
                    spikes: number,
                    outerRadius: number,
                    innerRadius: number,
                    color: string
                ) => {
                    if (!ctx) return;
                    let rot = Math.PI / 2 * 3;
                    let x = cx;
                    let y = cy;
                    const step = Math.PI / spikes;
                    ctx.beginPath();
                    ctx.moveTo(cx, cy - outerRadius);
                    for (let i = 0; i < spikes; i++) {
                        x = cx + Math.cos(rot) * outerRadius;
                        y = cy + Math.sin(rot) * outerRadius;
                        ctx.lineTo(x, y);
                        rot += step;
                        x = cx + Math.cos(rot) * innerRadius;
                        y = cy + Math.sin(rot) * innerRadius;
                        ctx.lineTo(x, y);
                        rot += step;
                    }
                    ctx.lineTo(cx, cy - outerRadius);
                    ctx.closePath();
                    ctx.fillStyle = color;
                    ctx.fill();
                };

                // 星を描画（選択中は色を変え、四角で囲む）
                stars.forEach((star, idx) => {
                    const isSelected = selectedPair && selectedPair.includes(idx);
                    drawStar(ctx, star.x, star.y, 5, 12, 6, isSelected ? '#FFD700' : 'yellow');
                    if (isSelected) {
                        ctx.save();
                        ctx.strokeStyle = '#FFD700';
                        ctx.lineWidth = 2;
                        ctx.setLineDash([]);
                        ctx.strokeRect(star.x - 14, star.y - 14, 28, 28);
                        ctx.restore();
                    }
                });

                                // 指定されたペアのみ点線で繋ぐ
                if (lines) {
                    lines.forEach(([i, j], idx) => {
                        if (stars[i] && stars[j]) {
                            ctx.setLineDash([5, 5]);
                            ctx.beginPath();
                            ctx.moveTo(stars[i].x, stars[i].y);
                            ctx.lineTo(stars[j].x, stars[j].y);
                            // 選択中の線は色を変える
                            ctx.strokeStyle = (selectedLineIdx === idx) ? '#FF69B4' : 'white';
                            ctx.lineWidth = 3;
                            ctx.stroke();
                            ctx.lineWidth = 1;
                        }
                    });
                }
            }
        };
    }, [imageSrc, stars, lines, selectedPair, showImage]);

    // クリック時の座標取得
    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 線のクリック判定（線上から±5px以内）
        if (onLineClick && lines && stars.length > 1) {
            for (let idx = 0; idx < lines.length; idx++) {
                const [i, j] = lines[idx];
                const p1 = stars[i];
                const p2 = stars[j];
                if (!p1 || !p2) continue;
                // 線分上の最近点までの距離を計算
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const length2 = dx * dx + dy * dy;
                if (length2 === 0) continue;
                const t = Math.max(0, Math.min(1, ((x - p1.x) * dx + (y - p1.y) * dy) / length2));
                const closestX = p1.x + t * dx;
                const closestY = p1.y + t * dy;
                const dist = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);
                if (dist <= 5) {
                    onLineClick(idx);
                    return;
                }
            }
        }

        // 星のクリック判定（半径12px以内）
        if (onStarClick) {
            for (let i = 0; i < stars.length; i++) {
                const dx = x - stars[i].x;
                const dy = y - stars[i].y;
                if (Math.sqrt(dx * dx + dy * dy) <= 12) {
                    onStarClick(i);
                    return;
                }
            }
        }

        // 通常のcanvasクリック
        if (onCanvasClick) {
            onCanvasClick(x, y);
        }
    };

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={500}
                height={500}
                style={{border: '1px solid #ccc'}}
                onClick={handleClick}
            />
        </div>
    );
};

export default OutputImage;