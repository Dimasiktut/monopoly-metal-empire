import React from 'react';
import { Player } from '../types';
import GameBoard from './GameBoard';
import PlayerInfoPanel from './PlayerInfoPanel';
import ControlPanel from './ControlPanel';
import GameEndModal from './GameEndModal';
import { UseMultiplayerReturn } from '../hooks/useMultiplayer';

interface GameScreenProps {
  multiPlayerState: UseMultiplayerReturn;
}

const GameScreen: React.FC<GameScreenProps> = ({ multiPlayerState }) => {
  const { gameData, playerId, sendGameAction, leaveRoom, gameActions } = multiPlayerState;
  
  // This should not happen if App.tsx is structured correctly, but it's good practice
  if (!gameData) {
    return <div className="flex items-center justify-center h-full">Загрузка игры...</div>;
  }

  const { gameState, confirmation } = gameData;
  const { players, board, currentPlayerIndex, dice, gamePhase, winner } = gameState;

  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = currentPlayer.id === playerId;

  const handleGameEnd = () => {
    leaveRoom();
  };
  
  const handleAction = (action: string, data?: any) => {
    if (gameActions) { // I am the host, call actions directly
        switch(action) {
            case 'ROLL_DICE': gameActions.rollDice(); break;
            case 'BUY_PROPERTY': gameActions.buyProperty(); break;
            case 'END_TURN': gameActions.endTurn(); break;
            case 'CONFIRM_ACTION': gameActions.confirmAction(data.confirmed); break;
        }
    } else { // I am a client, send action to the host
        sendGameAction(action, data);
    }
  };


  return (
    <main className="w-full h-full flex flex-col md:flex-row items-center justify-center p-2 md:p-4 lg:p-6 gap-4">
      {winner && <GameEndModal winner={winner} onNewGame={handleGameEnd} />}
      {confirmation && isMyTurn && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-slate-800 border-2 border-slate-700 rounded-lg shadow-2xl p-6 text-center w-full max-w-sm animate-fade-in">
            <p className="text-lg text-slate-200 mb-6">{confirmation.message}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleAction('CONFIRM_ACTION', { confirmed: false })}
                className="w-32 font-bebas text-xl tracking-wider bg-red-700 hover:bg-red-600 text-white py-2 rounded-md transition-all transform hover:scale-105 border-b-4 border-red-900 hover:border-red-800"
              >
                Отмена
              </button>
              <button
                onClick={() => handleAction('CONFIRM_ACTION', { confirmed: true })}
                className="w-32 font-bebas text-xl tracking-wider bg-green-700 hover:bg-green-600 text-white py-2 rounded-md transition-all transform hover:scale-105 border-b-4 border-green-900 hover:border-green-800"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}
      
      <PlayerInfoPanel players={players} currentPlayerId={currentPlayer.id} localPlayerId={playerId} />

      <div className="relative aspect-square w-full max-w-[95vh] md:w-auto md:h-full md:max-h-[95vh] flex items-center justify-center">
        <GameBoard board={board} players={players} />
        <ControlPanel
          gamePhase={gamePhase}
          currentPlayer={currentPlayer}
          dice={dice}
          gameLog={gameState.gameLog}
          onRollDice={() => handleAction('ROLL_DICE')}
          onBuyProperty={() => handleAction('BUY_PROPERTY')}
          onEndTurn={() => handleAction('END_TURN')}
          board={board}
          isMyTurn={isMyTurn}
        />
      </div>
      
       <div className="md:hidden w-full grid grid-cols-2 gap-2 px-2">
         {players.map(p => (
            <div key={p.id} className={`p-2 rounded-md shadow-lg ${p.id === currentPlayer.id ? 'ring-2 ring-white' : ''} ${p.id === playerId ? 'border-2 border-blue-400' : ''}`} style={{backgroundColor: p.color}}>
                <p className="font-bold text-white truncate text-shadow">{p.name}</p>
                <p className="text-lg font-semibold text-white">${p.money.toLocaleString()}</p>
            </div>
         ))}
      </div>
    </main>
  );
};

export default GameScreen;