import React, { useState } from 'react';
// FIX: Corrected import paths from ../ to ./ as App.tsx is at the root level.
import { UseMultiplayerReturn } from './hooks/useMultiplayer';
import { PLAYER_COLORS } from './constants';
import useMultiplayer from './hooks/useMultiplayer';
import LobbyScreen from './components/LobbyScreen';
import GameScreen from './components/GameScreen';

interface RoomLobbyProps {
  multiPlayerState: UseMultiplayerReturn;
}

const RoomLobby: React.FC<RoomLobbyProps> = ({ multiPlayerState }) => {
  const { roomId, players, isHost, startGame, playerId, error, leaveRoom } = multiPlayerState;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="w-full max-w-md bg-slate-800/60 rounded-lg shadow-2xl p-8 border-2 border-t-slate-600 border-l-slate-600 border-b-slate-900 border-r-slate-900 backdrop-blur-sm">
        <h2 className="font-bebas text-3xl text-center mb-4 text-slate-300 tracking-wide">Лобби комнаты</h2>
        
        <div className="mb-6 text-center">
            <p className="text-slate-400">ID Комнаты:</p>
            <div className="flex items-center justify-center gap-2 mt-1">
                <p className="font-mono text-2xl tracking-widest text-amber-400">{roomId}</p>
                <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </button>
            </div>
            {copied && <p className="text-green-400 text-xs mt-1">Скопировано!</p>}
        </div>

        <h3 className="font-bebas text-2xl mb-3 text-slate-400">Игроки ({players.length}/4):</h3>
        <div className="space-y-3 mb-6 min-h-[160px]">
          {players.map((player, index) => (
            <div key={player.id} className="flex items-center space-x-3 bg-slate-800/50 p-2 rounded-md border border-slate-700">
              <div className="w-8 h-8 rounded-full shadow-inner" style={{ backgroundColor: PLAYER_COLORS[index] }}></div>
              <p className="flex-grow text-lg text-slate-200">{player.name} {player.id === playerId ? '(Вы)' : ''}</p>
              {player.isHost && <span className="text-xs font-bold text-amber-400 bg-amber-900/50 px-2 py-1 rounded">ХОСТ</span>}
            </div>
          ))}
        </div>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        
        {isHost ? (
          <button
            onClick={startGame}
            disabled={players.length < 2}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-700 text-white font-bebas text-2xl tracking-wider py-3 rounded-lg shadow-lg hover:shadow-orange-500/40 transition-all transform hover:scale-105 disabled:from-slate-700 disabled:to-slate-800 disabled:shadow-none disabled:cursor-not-allowed border-b-4 border-orange-800 hover:border-orange-700 disabled:border-slate-900"
          >
            Начать игру
          </button>
        ) : (
          <p className="text-center text-slate-400 animate-pulse">Ожидание начала игры от хоста...</p>
        )}

        <button
            onClick={leaveRoom}
            className="w-full mt-3 bg-gradient-to-r from-red-700 to-red-900 text-red-100 font-bebas text-xl tracking-wider py-2 rounded-lg hover:from-red-600 hover:to-red-800 transition-all border-b-4 border-red-900 hover:border-red-800"
        >
            Покинуть комнату
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
    const multiPlayerState = useMultiplayer();
    const { roomId, isGameStarted, gameData, isReconnecting } = multiPlayerState;

    const renderContent = () => {
        if (isReconnecting) {
            return (
                 <div className="flex flex-col items-center justify-center h-full text-white">
                    <svg className="animate-spin h-10 w-10 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-xl font-bebas tracking-wider">Переподключение к игре...</p>
                </div>
            )
        }
        if (!roomId) {
            return <LobbyScreen multiPlayerState={multiPlayerState} />;
        }
        if (roomId && !isGameStarted) {
            return <RoomLobby multiPlayerState={multiPlayerState} />;
        }
        if (isGameStarted && gameData) {
            return <GameScreen multiPlayerState={multiPlayerState} />;
        }
        return null; // Or some fallback UI
    }

    return (
        <div className="fixed inset-0 w-full h-full overflow-auto">
            {renderContent()}
        </div>
    );
};


export default App;