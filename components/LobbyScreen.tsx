import React, { useState, useCallback } from 'react';
import { UseMultiplayerReturn } from '../hooks/useMultiplayer';
import RulesModal from './RulesModal';

interface LobbyScreenProps {
  multiPlayerState: UseMultiplayerReturn;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ multiPlayerState }) => {
  const { createRoom, joinRoom, error } = multiPlayerState;
  const [playerName, setPlayerName] = useState('Игрок 1');
  const [roomId, setRoomId] = useState('');
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  const handleCreateRoom = useCallback(() => {
    if (playerName.trim()) {
      createRoom(playerName.trim());
    }
  }, [playerName, createRoom]);

  const handleJoinRoom = useCallback(() => {
    if (playerName.trim() && roomId.trim()) {
      joinRoom(roomId.trim().toUpperCase(), playerName.trim());
    }
  }, [playerName, roomId, joinRoom]);

  return (
    <>
      {isRulesModalOpen && <RulesModal onClose={() => setIsRulesModalOpen(false)} />}
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center mb-10">
          <h1 className="font-bebas text-8xl tracking-wider bg-gradient-to-b from-slate-200 to-slate-400 bg-clip-text text-transparent"
            style={{ textShadow: '0 4px 15px rgba(0, 0, 0, 0.5)' }}>
            Metal Empire
          </h1>
          <p className="text-xl text-slate-400 font-roboto-condensed tracking-wide">Постройте свою металлургическую империю</p>
        </div>

        <div className="w-full max-w-md bg-slate-800/60 rounded-lg shadow-2xl p-8 border-2 border-t-slate-600 border-l-slate-600 border-b-slate-900 border-r-slate-900 backdrop-blur-sm">
          <h2 className="font-bebas text-3xl text-center mb-6 text-slate-300 tracking-wide">Сетевая игра</h2>

          <div className="space-y-4 mb-6">
            <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-inner"
                placeholder="Ваше имя"
              />
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-inner"
                placeholder="ID Комнаты (для подключения)"
              />
          </div>

          {error && <p className="text-red-400 text-center mb-4">{error}</p>}

          <div className="space-y-3">
              <button
                onClick={handleCreateRoom}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-700 text-white font-bebas text-2xl tracking-wider py-3 rounded-lg shadow-lg hover:shadow-orange-500/40 transition-all transform hover:scale-105 border-b-4 border-orange-800 hover:border-orange-700 disabled:border-slate-900"
              >
                Создать комнату
              </button>
              <button
                onClick={handleJoinRoom}
                disabled={!roomId}
                className="w-full bg-slate-800 text-slate-300 font-bebas text-2xl tracking-wider py-3 rounded-lg border-2 border-slate-700 hover:bg-slate-700/80 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed disabled:border-slate-800"
              >
                Присоединиться к игре
              </button>
          </div>
          <div className="text-center mt-6">
              <button 
                  onClick={() => setIsRulesModalOpen(true)}
                  className="text-slate-400 hover:text-amber-400 font-roboto-condensed tracking-wide transition-colors text-lg"
              >
                  Как играть? (Правила игры)
              </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LobbyScreen;