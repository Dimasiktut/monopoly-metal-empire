import React, { useState, useEffect } from 'react';

interface DiceProps {
  value: number;
  rolling: boolean;
}

const Dice: React.FC<DiceProps> = ({ value, rolling }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (rolling) {
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 60);
      setTimeout(() => {
        clearInterval(interval);
        setDisplayValue(value);
      }, 600); // Animation duration
      return () => clearInterval(interval);
    } else {
        setDisplayValue(value);
    }
  }, [rolling, value]);

  const dotPositions: { [key: number]: string[] } = {
    1: ['center'],
    2: ['top-left', 'bottom-right'],
    3: ['top-left', 'center', 'bottom-right'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
    6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
  };

  const getDotClass = (pos: string) => {
    const base = 'absolute w-2.5 h-2.5 md:w-3 md:h-3 bg-zinc-900 rounded-full shadow-inner';
    const transform = 'transform -translate-x-1/2 -translate-y-1/2';
    switch (pos) {
      case 'top-left': return `${base} top-1/4 left-1/4 ${transform}`;
      case 'top-right': return `${base} top-1/4 left-3/4 ${transform}`;
      case 'center': return `${base} top-1/2 left-1/2 ${transform}`;
      case 'middle-left': return `${base} top-1/2 left-1/4 ${transform}`;
      case 'middle-right': return `${base} top-1/2 left-3/4 ${transform}`;
      case 'bottom-left': return `${base} top-3/4 left-1/4 ${transform}`;
      case 'bottom-right': return `${base} top-3/4 left-3/4 ${transform}`;
      default: return '';
    }
  };

  return (
    <div className={`relative w-14 h-14 md:w-16 md:h-16 rounded-lg shadow-lg transition-transform duration-500 ${rolling ? 'animate-spin' : ''}`}
      style={{
        background: 'linear-gradient(145deg, #71717a, #3f3f46)',
        boxShadow: '4px 4px 8px #1f2937, -4px -4px 8px #52525b'
      }}
    >
      <div className="w-full h-full p-2 relative">
        {dotPositions[displayValue]?.map(pos => <div key={pos} className={getDotClass(pos)}></div>)}
      </div>
    </div>
  );
};

export default Dice;