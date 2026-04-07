
import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import OutputImage from './components/OutputImage';
import RayquazaImage from './components/RayquazaImage';

const App: React.FC = () => {
  const appBgColor = '#001f3f';
  // 星座線表示/非表示のstate
  const [showLines, setShowLines] = useState(true);
  // 星座線表示/非表示切り替え
  const handleToggleLines = () => {
    setShowLines((prev) => !prev);
  };
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [showImage, setShowImage] = useState(true);
  const outputCanvasRef = React.useRef<HTMLCanvasElement>(null);
  // 画像表示/非表示切り替え
  const handleToggleImage = () => {
    setShowImage((prev) => !prev);
  };
  const [stars, setStars] = useState<Array<{ x: number; y: number }>>([]);
  const [addStarMode, setAddStarMode] = useState(false);
  const [activeStepOverride, setActiveStepOverride] = useState<number | null>(null);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  // 星ペア（線を引くペア）のstate
  const [selectedPair, setSelectedPair] = useState<number[]>([]); // 選択中の星インデックス
  const [lines, setLines] = useState<Array<[number, number]>>([]); // [index1, index2]の配列
  const [selectedLineIdx, setSelectedLineIdx] = useState<number | null>(null); // 選択中の線インデックス

  // 星の最大数
  const MAX_STARS = 10;

  // 画像アップロード時の処理
  const handleImageUpload = (image: File) => {
    // 先に状態をリセット
    setStars([]);
    setLines([]);
    setSelectedPair([]);
    setSelectedLineIdx(null);
    setAddStarMode(true);
    setActiveStepOverride(null);
    setImageFileName(image.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        setImageSrc(e.target.result);
      }
    };
    reader.readAsDataURL(image);
  };


  // StarCanvasから星が追加されたときの処理
  const handleAddStar = (star: { x: number; y: number }) => {
    setStars((prev) => [...prev, star]);
  };

  // JSX外のstars.length >= MAX_STARSの誤りを削除
  const handleOutputImageClick = (x: number, y: number) => {
    if (addStarMode && stars.length < MAX_STARS) {
      setStars((prev) => [...prev, { x, y }]);
    }
  };

  // 星ペア選択時の処理（画像上の星クリックで呼ばれる）
  const handleSelectStar = (idx: number) => {
    setSelectedLineIdx(null); // 星クリック時は線選択解除
    if (selectedPair.length === 0) {
      setSelectedPair([idx]);
    } else if (selectedPair.length === 1) {
      if (selectedPair[0] === idx) {
        setSelectedPair([]); // 同じ星を2回クリックで解除
      } else {
        setLines((prev) => [...prev, [selectedPair[0], idx]]);
        setActiveStepOverride(null);
        setSelectedPair([]);
      }
    }
  };
  // 線クリック時の処理
  const handleLineClick = (lineIdx: number) => {
    setSelectedLineIdx((prev) => (prev === lineIdx ? null : lineIdx));
    setSelectedPair([]); // 線クリック時は星選択解除
  };

  // 線削除処理
  const handleDeleteLine = () => {
    if (selectedLineIdx !== null) {
      setLines((prev) => prev.filter((_, idx) => idx !== selectedLineIdx));
      setSelectedLineIdx(null);
    }
  };

  // 追加した星と星座線のみをリセット（選択画像は維持）
  const handleResetConstellation = () => {
    setStars([]);
    setLines([]);
    setSelectedPair([]);
    setSelectedLineIdx(null);
    setActiveStepOverride(null);
  };

  const getDefaultScreenshotName = () => {
    if (!imageFileName) {
      return 'ポケモン座';
    }
    const baseName = imageFileName.replace(/\.[^.]+$/, '');
    const cleaned = baseName.replace(/^No\.\d+\s*[ 　]*/i, '').trim();
    return `${cleaned || 'ポケモン'}座`;
  };

  const handleCaptureCanvas = () => {
    const canvas = outputCanvasRef.current;
    if (!canvas) {
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${getDefaultScreenshotName()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    }, 'image/png');
  };

  const activeStep = (() => {
    if (!imageSrc) {
      return 0;
    }
    if (activeStepOverride !== null) {
      return activeStepOverride;
    }
    if (lines.length > 0) {
      return 3;
    }
    if (!addStarMode && stars.length >= 2) {
      return 2;
    }
    return 1;
  })();

  const guidanceMessage = (() => {
    if (!imageSrc) {
      return 'ポケモンを選んで自分だけのポケモン星座をつくりましょう ！';
    }
    if (lines.length > 0) {
      return 'スクリーンショットボタンから保存できます．';
    }
    if (stars.length < 2) {
      return '星を2つ以上置くと，星座線を引けるようになります (星は10個まで)．';
    }
    if (addStarMode) {
      return '星座線を引くを押して，線を引く．';
    }
    return '繋ぎたい星をクリックして，星座線を引いてください．';
  })();

  const handleSwitchToAddStarMode = () => {
    setAddStarMode(true);
    setActiveStepOverride(1);
  };

  const handleSwitchToDrawLineMode = () => {
    setAddStarMode(false);
    setActiveStepOverride(2);
  };

  // 星を削除する処理
  const handleStarDelete = (starIdx: number) => {
    setStars((prev) => prev.filter((_, idx) => idx !== starIdx));
    // 削除した星に関係する線も消す
    setLines((prev) => prev.filter(([i, j]) => i !== starIdx && j !== starIdx));
  };

  // 星背景canvas生成
  const [starBgUrl] = React.useState(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#001f3f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 300; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 1.5 + 0.5;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.globalAlpha = Math.random() * 0.7 + 0.3;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.restore();
      }
    }
    return canvas.toDataURL();
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: `${appBgColor} url(${starBgUrl}) center/cover`,
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Pokestelationロゴを左上に配置 */}
      <img 
        src={`${process.env.PUBLIC_URL}/Pokestelationロゴ.png`} 
        alt="Pokestellation Logo" 
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          height: '80px',
          width: 'auto',
          zIndex: 10
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#FFD700', fontWeight: 'bold', letterSpacing: '2px', margin: 0 }}>
          Pokestellation Maker
        </h1>
        <RayquazaImage />
      </div>
      <button
        onClick={() => setShowHelpPanel((prev) => !prev)}
        aria-expanded={showHelpPanel}
        aria-controls="usage-help-panel"
        style={{
          marginBottom: '10px',
          padding: '6px 14px',
          borderRadius: '16px',
          border: '1px solid white',
          background: 'transparent',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1em',
          cursor: 'pointer',
        }}
      >
        {showHelpPanel ? '閉じる' : '使い方'}
      </button>
      {showHelpPanel && (
        <div
          id="usage-help-panel"
          style={{
            width: 'fit-content',
            maxWidth: '92vw',
            margin: '0 0 10px',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.5)',
            background: 'rgba(0, 31, 63, 0.75)',
            color: '#EAF6FF',
            lineHeight: 1.7,
            fontSize: '1em',
          }}
        >
          <div>1. ポケモンを選択して，星を置きます (10個まで)(再タップで消せます)．</div>
          <div>2. 星座線を引くを押して，繋ぎたい星をクリックして星座線を引きます．</div>
          <div>3. カメラボタンでポケモン星座を保存します．</div>
        </div>
      )}
      <ImageUploader onImageUpload={handleImageUpload} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          margin: '10px 0 6px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {[1, 2, 3].map((step) => {
          const labels: Record<number, string> = {
            1: '1. 星を置く',
              2: '2. 星座線を引く',
            3: '3. 保存',
          };
          const isActive = step === activeStep;
          const isDone = step < activeStep;
          const isModeButton = step === 1 || step === 2;
          const isSaveButton = step === 3;
          const isDisabled = !imageSrc;

          const handleStepClick = () => {
            if (step === 1) {
              handleSwitchToAddStarMode();
            } else if (step === 2) {
              handleSwitchToDrawLineMode();
            } else if (step === 3) {
              setActiveStepOverride(3);
              handleCaptureCanvas();
            }
          };

          return (
            <button
              key={step}
              type="button"
              onClick={isModeButton || isSaveButton ? handleStepClick : undefined}
              disabled={isDisabled}
              aria-pressed={isModeButton ? isActive : undefined}
              title={isSaveButton ? `${getDefaultScreenshotName()}を撮影する` : undefined}
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                border: `1px solid ${isActive ? '#FFD700' : 'rgba(255,255,255,0.45)'}`,
                background: isActive ? 'rgba(255, 215, 0, 0.18)' : isDone ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: isActive || isDone ? '#ffffff' : 'rgba(255,255,255,0.72)',
                fontWeight: isActive ? 'bold' : 500,
                fontSize: '1em',
                letterSpacing: '0.3px',
                cursor: !isDisabled ? 'pointer' : 'default',
                opacity: 1,
                outline: 'none',
              }}
            >
              {labels[step]}
            </button>
          );
        })}
      </div>
      <div
        style={{
          margin: '0 0 10px',
          color: '#E6F2FF',
          fontSize: '1em',
          textAlign: 'center',
          minHeight: '1.5em',
        }}
      >
        {guidanceMessage}
      </div>
      {imageSrc && (
        <div style={{ display: 'flex', gap: '12px', margin: '8px 0' }}>
          <button
            onClick={handleToggleImage}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: '1px solid white',
              background: showImage ? appBgColor : 'white',
              color: showImage ? 'white' : appBgColor,
              fontWeight: 'bold',
              fontSize: '1em',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {showImage ? 'ポケモンを非表示にする' : 'ポケモンを表示する'}
          </button>
          <button
            onClick={handleToggleLines}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: '1px solid white',
              background: showLines ? appBgColor : 'white',
              color: showLines ? 'white' : appBgColor,
              fontWeight: 'bold',
              fontSize: '1em',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {showLines ? '星座線を非表示にする' : '星座線を表示する'}
          </button>
        </div>
      )}
      {stars.length >= MAX_STARS && (
        <div style={{color: 'yellow', marginBottom: 8}}>星は最大{MAX_STARS}個までです</div>
      )}

      <div style={{ marginTop: imageSrc ? 0 : 16 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <OutputImage
            imageSrc={imageSrc}
            stars={stars}
            showImage={showImage}
            canvasRef={outputCanvasRef}
            onCanvasClick={addStarMode ? handleOutputImageClick : undefined}
            onStarClick={addStarMode ? handleStarDelete : handleSelectStar}
            onLineClick={!addStarMode ? handleLineClick : undefined}
            lines={showLines ? lines : []}
            selectedPair={!addStarMode ? selectedPair : undefined}
            selectedLineIdx={!addStarMode ? selectedLineIdx ?? undefined : undefined}
          />
          {imageSrc && (
            <button
              onClick={handleResetConstellation}
              aria-label="星と星座線をリセット"
              title="星と星座線とリセットする"
              style={{
                position: 'absolute',
                top: 0,
                left: 'calc(100% + 8px)',
                width: '60px',
                height: '60px',
                border: '1px solid #ffffff',
                background: appBgColor,
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                cursor: 'pointer',
              }}
              disabled={stars.length === 0 && lines.length === 0}
            >
              <img
                src={`${process.env.PUBLIC_URL}/リセットアイコン.png`}
                alt="リセット"
                style={{ width: '40px', height: '40px', objectFit: 'contain', pointerEvents: 'none' }}
              />
            </button>
          )}
          {imageSrc && (
            <button
              onClick={handleCaptureCanvas}
              aria-label="スクリーンショットを保存"
              title={`${getDefaultScreenshotName()}を撮影する`}
              style={{
                position: 'absolute',
                top: '76px',
                left: 'calc(100% + 8px)',
                width: '60px',
                height: '60px',
                border: '1px solid #ffffff',
                background: appBgColor,
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              <img
                src={`${process.env.PUBLIC_URL}/カメラアイコン.png`}
                alt="スクリーンショット"
                style={{ width: '48px', height: '48px', objectFit: 'contain', pointerEvents: 'none' }}
              />
            </button>
          )}
          {!addStarMode && selectedLineIdx !== null && (
            <button
              onClick={handleDeleteLine}
              style={{
                position: 'absolute',
                top: '152px',
                left: 'calc(100% + 8px)',
                margin: 0,
                padding: '6px 16px',
                background: '#FF69B4',
                color: 'black',
                border: 'none',
                borderRadius: 4,
                 fontSize: '1.2em',
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              星座線を削除
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
