import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function QuestionImage({ questionId }) {
  const [aspectRatio, setAspectRatio] = useState(1);

  const imageId = questionId + 1;
  const src = `/images/question${imageId}_image.png`;

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setAspectRatio(img.width / img.height || 1);
    };
  }, [src]);

  // Use a max width for desktop, but allow shrinking on small screens
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
        alt="question image"
        fill
        style={{ objectFit: 'contain' }}
        sizes="(max-width: 600px) 100vw, 500px"
      />
    </div>
  );
}