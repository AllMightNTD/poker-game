import React from 'react';

const DealerDeck: React.FC = () => {
  return (
    <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
      {/* 3D Stack of Cards */}
      <div className="relative w-8 h-12 md:w-10 md:h-14">
        {/* Shadow layers for 3D thickness */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i}
            className="absolute inset-0 bg-slate-200 border border-slate-400 rounded-sm md:rounded"
            style={{
              transform: `translateY(-${i * 1.5}px) translateX(${i * 0.5}px)`,
              boxShadow: i === 0 ? '0 10px 20px rgba(0,0,0,0.5)' : 'none',
              zIndex: i
            }}
          />
        ))}
        {/* Top card back */}
        <div 
          className="absolute inset-0 bg-rose-900 border-2 border-slate-200 rounded-sm md:rounded flex items-center justify-center overflow-hidden shadow-sm"
          style={{
            transform: `translateY(-7.5px) translateX(2.5px)`,
            zIndex: 5
          }}
        >
          <div className="w-full h-full opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, white 2px, white 4px)' }} />
          <div className="absolute w-5 h-5 border border-white/50 rounded-full flex items-center justify-center">
            <span className="text-white/50 text-[8px]">♠</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerDeck;
