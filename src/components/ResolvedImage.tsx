import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { getPlaceholderImageUrl, getStockFallbackUrl, resolveImageUrl } from '../utils/imageHelper';

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
  const instantSrc = useMemo(() => getStockFallbackUrl(prompt, seed), [prompt, seed]);
  const [src, setSrc] = useState(instantSrc);
  const [upgrading, setUpgrading] = useState(false);
  const [visible, setVisible] = useState(eager);

  useEffect(() => {
    setSrc(instantSrc);
  }, [instantSrc]);

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
      { rootMargin: eager ? '0px' : '120px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [eager]);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    setUpgrading(true);

    resolveImageUrl(prompt, seed)
      .then((url) => {
        if (!cancelled && url) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc(getPlaceholderImageUrl(alt, seed));
      })
      .finally(() => {
        if (!cancelled) setUpgrading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [visible, prompt, seed, alt]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {upgrading && (
        <div className="absolute top-1 right-1 z-10 bg-black/40 rounded-full p-0.5">
          <RefreshCw size={10} className="animate-spin text-white/90" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        style={style}
        onError={() => setSrc(getPlaceholderImageUrl(alt, seed))}
      />
    </div>
  );
};
