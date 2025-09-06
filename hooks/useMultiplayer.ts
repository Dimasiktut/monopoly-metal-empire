import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Player, GameState, GamePhase } from '../types';
import { PLAYER_COLORS, BOARD_LAYOUT } from '../constants';
import useGameEngine from './useGameEngine';
import cloneDeep from 'lodash/cloneDeep';

const SESSION_KEY = 'metal-empire-session';
const GAME_STATE_KEY_PREFIX = 'metal-empire-gamestate-';

type PlayerProfile = {
  id: string;
  name: string;
  isHost: boolean;
};

type GameData = {
    gameState: GameState;
    confirmation: { message: string } | null;
}

type Message = 
  | { type: 'PLAYER_JOIN_REQUEST'; payload: { id: string, name: string } }
  | { type: 'HOST_PRESENCE'; payload: { hostId: string, players: PlayerProfile[] } }
  | { type: 'PLAYER_LIST_UPDATE'; payload: { players: PlayerProfile[] } }
  | { type: 'GAME_START'; payload: { initialGameState: GameState } }
  | { type: 'GAME_STATE_UPDATE'; payload: GameData }
  | { type: 'GAME_ACTION'; payload: { playerId: string, action: string, data?: any } }
  | { type: 'PLAYER_LEAVE'; payload: { playerId: string } }
  | { type: 'PLAYER_RECONNECTED'; payload: { playerId: string } };

const generateId = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export type UseMultiplayerReturn = ReturnType<typeof useMultiplayer>;

const useMultiplayer = () => {
    const [session, setSession] = useState(() => {
        try {
            const saved = sessionStorage.getItem(SESSION_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Failed to parse session state:", e);
            sessionStorage.removeItem(SESSION_KEY);
            return null;
        }
    });

    const [hostPersistedState, setHostPersistedState] = useState(() => {
        if (session?.isHost && session?.roomId) {
            try {
                const saved = sessionStorage.getItem(GAME_STATE_KEY_PREFIX + session.roomId);
                return saved ? JSON.parse(saved) : null;
            } catch (e) {
                console.error("Failed to parse game state:", e);
                sessionStorage.removeItem(GAME_STATE_KEY_PREFIX + session.roomId);
                return null;
            }
        }
        return null;
    });

    const [roomId, setRoomId] = useState<string | null>(session?.roomId || null);
    const [playerId, setPlayerId] = useState<string | null>(session?.playerId || null);
    const [isHost, setIsHost] = useState<boolean>(session?.isHost || false);
    const [players, setPlayers] = useState<PlayerProfile[]>(hostPersistedState?.players || []);
    const [isGameStarted, setIsGameStarted] = useState(hostPersistedState?.isGameStarted || false);
    const [gameData, setGameData] = useState<GameData | null>(hostPersistedState?.gameData || null);
    const [error, setError] = useState<string | null>(null);
    const [isReconnecting, setIsReconnecting] = useState(!!session);
    
    const channelRef = useRef<BroadcastChannel | null>(null);
    
    const hostInitialPlayers = useMemo(() => players.map((p, i): Player => ({
        id: p.id,
        name: p.name,
        money: 1500,
        position: 0,
        color: PLAYER_COLORS[i],
        inJail: false,
        jailTurns: 0,
        getOutOfJailFreeCards: 0,
    })), [players]);

    const { gameState: hostGameState, actions: gameActions, confirmation: hostConfirmation } = useGameEngine(
        hostInitialPlayers,
        hostPersistedState?.gameData?.gameState || null
    );
    
    useEffect(() => {
        if (roomId && playerId) {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({ roomId, playerId, isHost }));
        } else {
            sessionStorage.removeItem(SESSION_KEY);
        }
    }, [roomId, playerId, isHost]);

    // Sync host's engine state to the serializable `gameData` state
    useEffect(() => {
        if (isHost) {
            setGameData({
                gameState: hostGameState,
                confirmation: hostConfirmation ? { message: hostConfirmation.message } : null
            });
        }
    }, [isHost, hostGameState, hostConfirmation]);
    
    // Persist host's game state to session storage
    useEffect(() => {
        if (isHost && roomId) {
            const stateToSave = {
                players,
                isGameStarted,
                gameData, // gameData is now guaranteed to be serializable
            };
            sessionStorage.setItem(GAME_STATE_KEY_PREFIX + roomId, JSON.stringify(stateToSave));
        }
    }, [isHost, roomId, players, isGameStarted, gameData]);


    const postMessage = useCallback((message: Message) => {
        channelRef.current?.postMessage(message);
    }, []);

    const handleMessage = useCallback((event: MessageEvent<Message>) => {
        const { type, payload } = event.data;
        setError(null);

        if (isHost) {
            switch(type) {
                case 'PLAYER_JOIN_REQUEST':
                    if (players.length >= 4 || isGameStarted) return;
                    setPlayers(prev => {
                        if (prev.some(p => p.id === payload.id)) return prev;
                        const newPlayers = [...prev, { id: payload.id, name: payload.name, isHost: false }];
                        postMessage({ type: 'PLAYER_LIST_UPDATE', payload: { players: newPlayers }});
                        return newPlayers;
                    });
                    break;
                case 'PLAYER_RECONNECTED':
                     if (players.some(p => p.id === payload.playerId)) {
                         if (isGameStarted && gameData) {
                            postMessage({ type: 'GAME_STATE_UPDATE', payload: gameData });
                         } else {
                            postMessage({ type: 'PLAYER_LIST_UPDATE', payload: { players } });
                         }
                     }
                    break;
                case 'GAME_ACTION':
                    if (payload.playerId !== hostGameState.players[hostGameState.currentPlayerIndex].id) return;
                    switch(payload.action) {
                        case 'ROLL_DICE': gameActions.rollDice(); break;
                        case 'BUY_PROPERTY': gameActions.buyProperty(); break;
                        case 'END_TURN': gameActions.endTurn(); break;
                        case 'CONFIRM_ACTION': gameActions.confirmAction(payload.data.confirmed); break;
                    }
                    break;
                case 'PLAYER_LEAVE':
                    setPlayers(prev => {
                        const newPlayers = prev.filter(p => p.id !== payload.playerId);
                        if (!isGameStarted) {
                            postMessage({ type: 'PLAYER_LIST_UPDATE', payload: { players: newPlayers }});
                        }
                        return newPlayers;
                    });
                    break;
            }
        } else { // Client logic
            switch(type) {
                case 'HOST_PRESENCE':
                    setIsHost(false);
                    setPlayers(payload.players);
                    break;
                case 'PLAYER_LIST_UPDATE':
                    setPlayers(payload.players);
                    if (isReconnecting) setIsReconnecting(false);
                    break;
                case 'GAME_START':
                    setGameData({ gameState: payload.initialGameState, confirmation: null });
                    setIsGameStarted(true);
                    break;
                case 'GAME_STATE_UPDATE':
                    setGameData(payload);
                    setIsGameStarted(true);
                    if (isReconnecting) setIsReconnecting(false);
                    break;
            }
        }
    }, [isHost, players, gameActions, postMessage, hostGameState, isGameStarted, isReconnecting, gameData]);

    const setupChannel = useCallback((currentRoomId: string) => {
        if (channelRef.current && channelRef.current.name === currentRoomId) return;
        if (channelRef.current) {
            channelRef.current.close();
        }
        const newChannel = new BroadcastChannel(currentRoomId);
        newChannel.onmessage = handleMessage;
        channelRef.current = newChannel;
    }, [handleMessage]);

    useEffect(() => {
        if (roomId) {
            setupChannel(roomId);
        }
        return () => {
            if (channelRef.current) {
                channelRef.current.close();
                channelRef.current = null;
            }
        }
    }, [roomId, setupChannel]);

    useEffect(() => {
        if (isReconnecting && !isHost && playerId && channelRef.current) {
             const timeout = setTimeout(() => {
                postMessage({ type: 'PLAYER_RECONNECTED', payload: { playerId } });
            }, 250);

            const reconnectTimeout = setTimeout(() => {
                if (isReconnecting) {
                    setError("Не удалось переподключиться к хосту.");
                    setIsReconnecting(false);
                }
            }, 5000);

            return () => { clearTimeout(timeout); clearTimeout(reconnectTimeout); };
        }
        if (isReconnecting && isHost) {
            setIsReconnecting(false);
        }
    }, [isReconnecting, isHost, playerId, postMessage]);

    const createRoom = useCallback((playerName: string) => {
        const newPlayerId = generateId(8);
        const newRoomId = generateId(5);
        
        setIsHost(true);
        setPlayerId(newPlayerId);
        setPlayers([{ id: newPlayerId, name: playerName, isHost: true }]);
        setRoomId(newRoomId);
    }, []);

    const joinRoom = useCallback((roomIdToJoin: string, playerName: string) => {
        const newPlayerId = generateId(8);
        setIsHost(false);
        setPlayerId(newPlayerId);
        setRoomId(roomIdToJoin);
        setTimeout(() => {
            postMessage({ type: 'PLAYER_JOIN_REQUEST', payload: { id: newPlayerId, name: playerName } });
        }, 100);
    }, [postMessage]);

    const startGame = useCallback(() => {
        if (isHost) {
            const initialGameState: GameState = {
                board: cloneDeep(BOARD_LAYOUT),
                players: hostInitialPlayers,
                currentPlayerIndex: 0,
                dice: [1, 1],
                gamePhase: GamePhase.START_TURN,
                gameLog: ['Игра начинается!'],
            };
    
            gameActions.initializeGame(initialGameState);
    
            setIsGameStarted(true);
            setGameData({ gameState: initialGameState, confirmation: null });
            postMessage({ type: 'GAME_START', payload: { initialGameState } });
        }
    }, [isHost, postMessage, gameActions, hostInitialPlayers]);

    const sendGameAction = useCallback((action: string, data?: any) => {
        // This function is now only for clients to send actions to the host.
        if (playerId && !isHost) {
            postMessage({ type: 'GAME_ACTION', payload: { playerId, action, data } });
        }
    }, [playerId, postMessage, isHost]);
    
    const leaveRoom = useCallback(() => {
        if (playerId) {
            postMessage({ type: 'PLAYER_LEAVE', payload: { playerId } });
        }
        if (roomId) {
            sessionStorage.removeItem(GAME_STATE_KEY_PREFIX + roomId);
        }
        sessionStorage.removeItem(SESSION_KEY);
        
        channelRef.current?.close();
        channelRef.current = null;
        setRoomId(null);
        setPlayerId(null);
        setPlayers([]);
        setIsHost(false);
        setIsGameStarted(false);
        setGameData(null);
        setError(null);
        setSession(null);
    }, [playerId, postMessage, roomId]);
    
    // Broadcast host's game state changes
    useEffect(() => {
        if (isHost && isGameStarted && gameData) {
            const message: Message = {
                type: 'GAME_STATE_UPDATE',
                payload: gameData
            };
            channelRef.current?.postMessage(message);
        }
    }, [gameData, isHost, isGameStarted]);


    return {
        roomId,
        playerId,
        players,
        isHost,
        isGameStarted,
        gameData,
        error,
        isReconnecting,
        createRoom,
        joinRoom,
        startGame,
        sendGameAction,
        leaveRoom,
        gameActions: isHost ? gameActions : null,
    };
}

export default useMultiplayer;