import React from 'react';
import { Player } from '../types';

interface PlayerTokenProps {
  player: Player;
}

const PlayerToken: React.FC<PlayerTokenProps> = ({ player }) => {
  return (
    <div
      className="w-5 h-5 rounded-full border-2 border-white/80 shadow-lg relative"
      title={player.name}
      style={{ 
        backgroundColor: player.color,
        boxShadow: `0 0 8px ${player.color}, 0 0 12px ${player.color}80`,
      }}
    >
        <div 
            className="absolute top-1 left-1 w-2 h-2 rounded-full opacity-50"
            style={{background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)'}}
        />
    </div>
  );
};

export default PlayerToken;