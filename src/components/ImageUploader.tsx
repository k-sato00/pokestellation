import React, { useEffect, useState } from 'react';

const ImageUploader: React.FC<{ onImageUpload: (image: File) => void }> = ({ onImageUpload }) => {
    const [folderImages, setFolderImages] = useState<string[]>([]);
    const [selectedFolderImage, setSelectedFolderImage] = useState<string>('');
    const publicBase = process.env.PUBLIC_URL || '';

    useEffect(() => {
        let mounted = true;

        const loadManifest = async () => {
            try {
                const response = await fetch(`${publicBase}/images-manifest.json`, { cache: 'no-store' });
                if (!response.ok) {
                    return;
                }
                const manifest = await response.json() as { images?: string[] };
                const imageNames = Array.isArray(manifest.images) ? manifest.images : [];
                if (!mounted) {
                    return;
                }
                setFolderImages(imageNames);
            } catch {
                // images-manifest.jsonが存在しない場合はフォルダ選択UIを表示しない
            }
        };

        loadManifest();

        return () => {
            mounted = false;
        };
    }, []);

    const uploadFolderImage = async (imageName: string) => {
        if (!imageName) {
            return;
        }

        try {
            const imageUrl = `${publicBase}/images/${encodeURIComponent(imageName)}`;
            const response = await fetch(imageUrl);
            if (!response.ok) {
                return;
            }
            const blob = await response.blob();
            const file = new File([blob], imageName, {
                type: blob.type || 'image/png',
            });
            onImageUpload(file);
        } catch {
            // 通信エラー時は既存挙動を崩さないため何もしない
        }
    };

    const handleFolderImageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const imageName = event.target.value;
        setSelectedFolderImage(imageName);
        if (!imageName) {
            return;
        }
        uploadFolderImage(imageName);
    };

    return (
        <div>
            {folderImages.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                        value={selectedFolderImage}
                        onChange={handleFolderImageChange}
                        style={{ fontSize: '1.4em', lineHeight: 1.4, padding: '0.25em 0.4em' }}
                    >
                        <option value="">ポケモンを選択</option>
                        {folderImages.map((imageName) => (
                            <option key={imageName} value={imageName}>
                                {imageName.replace(/\.[^.]+$/, '')}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;