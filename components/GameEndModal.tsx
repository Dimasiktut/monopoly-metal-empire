import React from 'react';
import { Player } from '../types';

interface GameEndModalProps {
  winner: Player;
  onNewGame: () => void;
}

const GameEndModal: React.FC<GameEndModalProps> = ({ winner, onNewGame }) => {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-xl shadow-2xl p-8 text-center w-full max-w-md"
        style={{boxShadow: `0 0 30px ${winner.color}, inset 0 0 20px rgba(0,0,0,0.5)`}}
      >
        <h2 className="font-bebas text-6xl text-amber-400 mb-4 tracking-wider" style={{ textShadow: '0 0 10px #facc15' }}>Игра окончена!</h2>
        <p className="text-xl text-slate-300 mb-2">Победитель:</p>
        <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="w-10 h-10 rounded-full border-2 border-white" style={{backgroundColor: winner.color}}></div>
            <p className="font-bebas text-5xl" style={{ color: winner.color, textShadow: `0 0 15px ${winner.color}` }}>
                {winner.name}
            </p>
        </div>
        <button
          onClick={onNewGame}
          className="bg-gradient-to-r from-amber-500 to-orange-700 text-white font-bebas text-2xl tracking-wider py-3 px-8 rounded-lg shadow-lg hover:shadow-orange-500/50 transition-all transform hover:scale-105 border-b-4 border-orange-800 hover:border-orange-700"
        >
          Новая игра
        </button>
      </div>
    </div>
  );
};

export default GameEndModal;