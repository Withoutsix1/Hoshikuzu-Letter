import { useState } from 'react';

export default function GalleryImage({ src, alt, className, loading = 'lazy' }: {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  return src && src !== failedSource ? (
    <img className={className} src={src} alt={alt} loading={loading} decoding="async"
      draggable={false} onError={() => setFailedSource(src)} />
  ) : (
    <span className={`gallery-image-missing ${className ?? ''}`} role="img" aria-label={`${alt}（图片暂不可用）`}>
      <span aria-hidden="true">✦</span><small>图片暂不可用</small>
    </span>
  );
}
