import React from 'react';

const LoadingOrb: React.FC<{ text?: string }> = ({ text = 'AI is thinking...' }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Pulsing Outer Ring */}
        <div className="absolute inset-0 rounded-full border border-nerox-indigo/30 animate-ping" />
        
        {/* Rotating Inner Dash Ring */}
        <div className="absolute w-12 h-12 rounded-full border-2 border-dashed border-nerox-cyan/60 animate-spin-slow" />
        
        {/* Glowing Central Orb */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-nerox-indigo to-nerox-violet animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.6)]" />
      </div>
      <span className="text-xs font-grotesk text-gray-400 tracking-wider uppercase animate-pulse">{text}</span>
    </div>
  );
};

export default LoadingOrb;
