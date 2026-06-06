import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { getPlaceholderImageUrl, resolveImageUrl } from '../utils/imageHelper';

interface ResolvedImageProps {
  prompt: string;
  seed: number;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  eager?: boolean;
}

export const ResolvedImage: React.FC<ResolvedImageProps> = ({
  prompt,
  seed,
  alt,
  className = '',
  style,
  eager = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(eager);

  useEffect(() => {
    if (eager) return;
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '240px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [eager]);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    setLoading(true);

    resolveImageUrl(prompt, seed)
      .then((url) => {
        if (!cancelled) {
          setSrc(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSrc(getPlaceholderImageUrl(alt, seed));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [visible, prompt, seed, alt]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-black/15 flex items-center justify-center z-10">
          <RefreshCw size={16} className="animate-spin text-white/90" />
        </div>
      )}
      {src && (
        <img
          src={src}
          alt={alt}
          style={style}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setSrc(getPlaceholderImageUrl(alt, seed));
          }}
        />
      )}
    </div>
  );
};
