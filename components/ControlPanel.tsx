import React from 'react';
import { GamePhase, Player, BoardSquare, SquareType } from '../types';
import Dice from './Dice';

interface ControlPanelProps {
  gamePhase: GamePhase;
  currentPlayer: Player;
  dice: [number, number];
  gameLog: string[];
  onRollDice: () => void;
  onBuyProperty: () => void;
  onEndTurn: () => void;
  board: BoardSquare[];
  isMyTurn: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  gamePhase,
  currentPlayer,
  dice,
  gameLog,
  onRollDice,
  onBuyProperty,
  onEndTurn,
  board,
  isMyTurn
}) => {
    const currentSquare = board[currentPlayer.position];
    const canBuy = gamePhase === GamePhase.ACTION &&
        isMyTurn &&
        (currentSquare.type === SquareType.PROPERTY || currentSquare.type === SquareType.RAILROAD || currentSquare.type === SquareType.UTILITY) &&
        !currentSquare.ownerId &&
        currentPlayer.money >= currentSquare.price;


  return (
    <div 
        className="absolute top-[12.5%] left-[12.5%] w-[75%] h-[75%] bg-gray-800/90 p-4 md:p-6 flex flex-col justify-between text-center border-4 border-gray-600 rounded-lg shadow-2xl backdrop-blur-sm"
        style={{boxShadow: 'inset 0 0 40px rgba(0,0,0,0.7)'}}
    >
      <div>
        <h2 className="font-bebas text-3xl md:text-4xl tracking-wider bg-clip-text text-transparent bg-gradient-to-b from-slate-200 to-slate-400"
            style={{ textShadow: `0 0 10px ${currentPlayer.color}` }}
        >
            Ход игрока: {currentPlayer.name}
        </h2>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center space-y-6">
        <div className="flex items-center justify-center space-x-4 md:space-x-6">
            <Dice value={dice[0]} rolling={gamePhase === GamePhase.DICE_ROLL} />
            <Dice value={dice[1]} rolling={gamePhase === GamePhase.DICE_ROLL} />
        </div>
        
        <div className="w-full max-w-xs space-y-3">
            <button
                onClick={onRollDice}
                disabled={gamePhase !== GamePhase.START_TURN || !isMyTurn}
                className="w-full font-bebas text-xl tracking-wider bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white py-2 rounded-md transition-all transform hover:enabled:scale-105 border-b-4 border-amber-800 hover:border-amber-700 disabled:border-slate-800"
            >
                Бросить кубики
            </button>
            <button
                onClick={onBuyProperty}
                disabled={!canBuy}
                className="w-full font-bebas text-xl tracking-wider bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white py-2 rounded-md transition-all transform hover:enabled:scale-105 border-b-4 border-sky-800 hover:border-sky-700 disabled:border-slate-800"
            >
                Купить
            </button>
            <button
                onClick={onEndTurn}
                disabled={gamePhase !== GamePhase.ACTION || !isMyTurn}
                className="w-full font-bebas text-xl tracking-wider bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white py-2 rounded-md transition-all transform hover:enabled:scale-105 border-b-4 border-slate-800 hover:border-slate-700 disabled:border-slate-800"
            >
                Завершить ход
            </button>
        </div>
      </div>

      <div className="h-24 bg-black/60 rounded-md p-2 text-left text-sm font-mono text-slate-300 overflow-y-auto border-2 border-slate-600 shadow-inner"
        style={{
            backgroundImage: 'linear-gradient(rgba(100, 255, 100, 0.05) 50%, transparent 50%)',
            backgroundSize: '100% 4px'
        }}
      >
        {gameLog.map((log, index) => (
            <p key={index} className="leading-tight">{'> '}{log}</p>
        ))}
      </div>
    </div>
  );
};

export default ControlPanel;