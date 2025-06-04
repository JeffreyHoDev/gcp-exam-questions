import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function OptionImage({ questionId, index }) {
  const [aspectRatio, setAspectRatio] = useState(1);
  const [loaded, setLoaded] = useState(false);

  const imageId = questionId + 1;
  const src = `/images/q${imageId}_option${index + 1}.png`;

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setAspectRatio(img.width / img.height || 1);
      setLoaded(true);
    };
  }, [src]);

  if (!loaded) return null;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 500,
        aspectRatio: aspectRatio,
        position: 'relative',
      }}
    >
      <Image
        src={src}
        alt="option image"
        fill
        style={{ objectFit: 'contain' }}
        sizes="(max-width: 300px) 100vw, 400px"
      />
    </div>
  );
}