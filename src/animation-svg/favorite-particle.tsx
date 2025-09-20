import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const PARTICLE_COUNT = 50;
const LIKED_COLOR = "#ff4d8d";
const IDLE_COLOR = "#d1d5db";
const PARTICLE_COLORS = ["#ff8fb3", "#ffe066", "#8ce2ff", "#c8f152"];

type ParticleConfig = {
  id: string;
  delay: number;
  duration: number;
  finalX: number;
  finalY: number;
  peakScale: number;
  size: number;
  color: string;
};

type FavoriteParticleProps = {
  isLiked: boolean;
  onToggle: (next: boolean) => void;
};

export function FavoriteParticle({ isLiked, onToggle }: FavoriteParticleProps) {
  const [isBursting, setIsBursting] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const previousLikedRef = useRef(isLiked);

  const triggerBurst = useCallback(() => {
    setBurstKey((key) => key + 1);
    setIsBursting(true);
  }, []);

  const stopBurst = useCallback(() => {
    setIsBursting(false);
  }, []);

  const handleClick = useCallback(() => {
    onToggle(!isLiked);
  }, [isLiked, onToggle]);

  const handleAnimationEnd = useCallback(() => {
    setIsBursting(false);
  }, []);

  useEffect(() => {
    if (!previousLikedRef.current && isLiked) {
      triggerBurst();
    } else if (previousLikedRef.current && !isLiked) {
      stopBurst();
    }
    previousLikedRef.current = isLiked;
  }, [isLiked, triggerBurst, stopBurst]);

  const particleConfigs = useMemo<ParticleConfig[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
      const baseAngle = (360 / PARTICLE_COUNT) * index;
      const angleJitter = (Math.random() - 0.5) * 26;
      const finalAngle = baseAngle + angleJitter;
      const radians = (finalAngle * Math.PI) / 180;

      const distance = 22 + Math.random() * 10;
      const drift = (Math.random() - 0.5) * 10;
      const size = 4 + Math.random() * 6;

      const finalX = Math.cos(radians) * distance + drift;
      const finalY = -Math.sin(radians) * distance + (Math.random() - 0.5) * 6;

      const delay = Math.random() * 24;
      const duration = 400 + Math.random() * 160;
      const peakScale = 0.9 + Math.random() * 0.35;

      return {
        id: `${burstKey}-${index}`,
        delay,
        duration,
        finalX,
        finalY,
        peakScale,
        size,
        color: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
      };
    });
  }, [burstKey]);

  return (
    <div className="favorite-particle__wrapper">
      <style>
        {`
          .favorite-particle__wrapper {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
          }

          .favorite-particle__button {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: none;
            background: transparent;
            padding: 6px;
            cursor: pointer;
            transition: transform 160ms ease;
          }

          .favorite-particle__button:focus-visible {
            outline: 2px solid ${LIKED_COLOR};
            outline-offset: 2px;
          }

          .favorite-particle__button:hover {
            transform: scale(1.06);
          }

          .favorite-particle__button:active {
            transform: scale(0.95);
          }

          .favorite-particle__icon {
            width: 36px;
            height: 36px;
            transition: transform 220ms ease;
          }

          .favorite-particle__button[data-liked="true"] .favorite-particle__icon {
            transform: scale(1.12);
          }

          .favorite-particle__particles {
            position: absolute;
            inset: 0;
            pointer-events: none;
            overflow: visible;
          }

          .favorite-particle__particle {
            position: absolute;
            top: 50%;
            left: 50%;
            width: var(--particle-size, 9px);
            height: var(--particle-size, 9px);
            border-radius: 9999px;
            opacity: 0;
            transform: translate(-50%, -50%) translate(0, 0) scale(0.25);
            will-change: transform, opacity;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
            animation: favorite-particle__burst var(--duration, 480ms)
              cubic-bezier(0.2, 0.82, 0.3, 0.98) forwards;
            animation-delay: var(--delay);
            background: var(--particle-color, rgba(255, 77, 141, 1));
          }

          @keyframes favorite-particle__burst {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) translate(0, 0) scale(0.25);
            }
            18% {
              opacity: 1;
            }
            60% {
              opacity: 0.9;
              transform: translate(-50%, -50%) translate(var(--x, 0), var(--y, 0))
                scale(var(--peak-scale, 1));
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) translate(var(--x, 0), var(--y, 0))
                scale(var(--peak-scale, 1));
            }
          }
        `}
      </style>

      <button
        type="button"
        aria-pressed={isLiked}
        data-liked={isLiked}
        className="favorite-particle__button"
        onClick={handleClick}
      >
        <svg
          className="favorite-particle__icon"
          viewBox="0 0 24 24"
          role="img"
          aria-hidden="true"
        >
          <path
            d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z"
            fill={isLiked ? LIKED_COLOR : "transparent"}
            stroke={isLiked ? LIKED_COLOR : IDLE_COLOR}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isBursting && (
        <div
          aria-hidden="true"
          className="favorite-particle__particles"
          key={burstKey}
          onAnimationEnd={handleAnimationEnd}
        >
          {particleConfigs.map((particle) => {
            const style = {
              "--delay": `${particle.delay}ms`,
              "--duration": `${particle.duration}ms`,
              "--x": `${particle.finalX}px`,
              "--y": `${particle.finalY}px`,
              "--peak-scale": `${particle.peakScale}`,
              "--particle-color": particle.color,
              "--particle-size": `${particle.size}px`,
            } as CSSProperties;

            return (
              <span
                key={particle.id}
                className="favorite-particle__particle"
                style={style}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
