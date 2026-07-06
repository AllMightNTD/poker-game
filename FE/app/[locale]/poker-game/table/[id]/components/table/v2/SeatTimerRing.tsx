import React, { useEffect, useState } from 'react';

interface SeatTimerRingProps {
  endTime: number | null;
  maxTime?: number;
  size?: number;
}

const SeatTimerRing: React.FC<SeatTimerRingProps> = React.memo(({ endTime, maxTime = 30000, size = 68 }) => {
  const [timeLeft, setTimeLeft] = useState(maxTime);

  useEffect(() => {
    if (!endTime) {
      setTimeLeft(maxTime);
      return;
    }

    const update = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeLeft(remaining);
    };

    update();
    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, [endTime, maxTime]);

  if (!endTime || timeLeft <= 0) return null;

  const percentage = Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));
  
  let color = 'stroke-emerald-400';
  if (percentage < 20) color = 'stroke-rose-500';
  else if (percentage < 50) color = 'stroke-amber-400';

  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isCritical = timeLeft <= 5000;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center">
      {isCritical && (
        <div 
          className="absolute rounded-full border-2 border-rose-500 animate-ping opacity-75"
          style={{ width: size, height: size }}
        />
      )}
      <svg className="-rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.4)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={`${color} transition-colors duration-300`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease' }}
        />
      </svg>
    </div>
  );
});
SeatTimerRing.displayName = 'SeatTimerRing';
export default SeatTimerRing;
