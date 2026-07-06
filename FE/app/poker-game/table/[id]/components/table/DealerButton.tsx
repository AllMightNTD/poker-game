import React from 'react';

const DealerButton: React.FC = React.memo(() => {
  return (
    <div className="absolute w-5 h-5 md:w-6 md:h-6 rounded-full bg-white border border-slate-300 shadow-md flex items-center justify-center -right-2 top-0 z-20">
      <span className="text-[9px] md:text-[10px] font-black text-slate-800">D</span>
    </div>
  );
});
DealerButton.displayName = 'DealerButton';
export default DealerButton;
