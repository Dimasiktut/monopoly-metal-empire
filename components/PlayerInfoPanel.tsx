import React from 'react';
import { Player } from '../types';

interface PlayerInfoPanelProps {
  players: Player[];
  currentPlayerId: string;
  localPlayerId: string | null;
}

const PlayerInfoPanel: React.FC<PlayerInfoPanelProps> = ({ players, currentPlayerId, localPlayerId }) => {
  return (
    <aside className="hidden md:flex flex-col justify-center gap-6 h-full">
      {players.map((player) => {
        const isCurrent = player.id === currentPlayerId;
        const isLocal = player.id === localPlayerId;
        
        let borderColor = 'border-slate-700/80';
        if (isCurrent) borderColor = player.color;
        else if (isLocal) borderColor = '#06b6d4'; // A distinct cyan color for the local player

        return (
          <div
            key={player.id}
            className={`w-52 p-4 rounded-lg shadow-lg border-2 transition-all duration-300 transform
              ${isCurrent ? 'scale-105 shadow-2xl' : 'scale-95 opacity-80'}
              ${player.money < 0 ? 'bg-red-900/50' : 'bg-slate-900/70'}
            `}
            style={{
              boxShadow: isCurrent ? `0 0 20px ${player.color}` : 'none',
              borderColor: borderColor,
            }}
          >
            <div className="flex items-center mb-3">
              <div
                className="w-8 h-8 rounded-full mr-3 border-2 border-white/50 shadow-inner"
                style={{ backgroundColor: player.color }}
              ></div>
              <h3 className="font-bebas text-2xl tracking-wide truncate" title={player.name}>{player.name}</h3>
            </div>
            <div className="text-3xl font-light text-green-400">
              {player.money < 0 ? 'Банкрот' : `$${player.money.toLocaleString()}`}
            </div>
            {isLocal && <div className="text-center text-xs text-cyan-400 mt-2 font-bold">(Это вы)</div>}
          </div>
        )
      })}
    </aside>
  );
};

export default PlayerInfoPanel;