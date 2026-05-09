import React, { useMemo } from 'react';
import { Baby, Heart, Stars, Cloud } from 'lucide-react';

const icons = [Baby, Heart, Stars, Cloud];

export const FloatingParticles: React.FC = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const Icon = icons[Math.floor(Math.random() * icons.length)];
      const size = Math.random() * 20 + 15;
      const left = Math.random() * 100;
      const duration = Math.random() * 10 + 15;
      const delay = Math.random() * 10;
      
      return (
        <div
          key={i}
          className="particle"
          style={{
            left: `${left}%`,
            animationDuration: `${duration}s`,
            animationDelay: `-${delay}s`,
            color: i % 2 === 0 ? '#3b82f6' : '#ec4899',
          }}
        >
          <Icon size={size} strokeWidth={1} />
        </div>
      );
    });
  }, []);

  return <div className="particles-container">{particles}</div>;
};
