import { useState, useCallback, useMemo } from 'react';
import { GameState, Player, GamePhase, BoardSquare, SquareType, PropertySquare, RailroadSquare, UtilitySquare } from '../types';
import { BOARD_LAYOUT } from '../constants';
import cloneDeep from 'lodash/cloneDeep';

export interface ConfirmationState {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const useGameEngine = (initialPlayers: Player[], initialGameState: GameState | null = null) => {
  const [gameState, setGameState] = useState<GameState>(() => initialGameState || ({
    board: cloneDeep(BOARD_LAYOUT),
    players: initialPlayers,
    currentPlayerIndex: 0,
    dice: [1, 1],
    gamePhase: GamePhase.START_TURN,
    gameLog: ['Игра начинается!'],
  }));

  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  
  const getNextTurnState = useCallback((
      players: Player[], 
      currentPlayerIndex: number, 
      log: string[]
  ): Partial<GameState> => {
      let newLog = [...log];
      const activePlayers = players.filter(p => p.money >= 0);
      
      if (activePlayers.length <= 1) {
          const winner = activePlayers[0];
          newLog = [`Игра окончена! ${winner?.name || ''} победил!`, ...newLog.slice(0, 4)];
          return {
              gamePhase: GamePhase.GAME_OVER,
              winner,
              gameLog: newLog,
          };
      }
      
      let nextIndex = (currentPlayerIndex + 1) % players.length;
      while(players[nextIndex].money < 0) {
          nextIndex = (nextIndex + 1) % players.length;
      }
      
      newLog = [`Ход переходит к ${players[nextIndex].name}.`, ...newLog.slice(0, 4)];
      return {
          currentPlayerIndex: nextIndex,
          gamePhase: GamePhase.START_TURN,
          gameLog: newLog,
      };
  }, []);

  const processTurn = useCallback((dice: [number, number]) => {
    setGameState(prev => {
        const { players, board, currentPlayerIndex, gameLog } = prev;
        
        let newLog = [...gameLog];
        const log = (msg: string) => {
            newLog = [msg, ...newLog.slice(0, 4)];
        };

        const player = players[currentPlayerIndex];
        const moveAmount = dice[0] + dice[1];
        const oldPosition = player.position;
        const newPosition = (oldPosition + moveAmount) % board.length;

        let newPlayers = cloneDeep(players);
        let playerToUpdate = newPlayers[currentPlayerIndex];

        const passedGo = newPosition < oldPosition;
        if (passedGo) {
            playerToUpdate.money += 200;
            log(`${player.name} проходит СТАРТ и получает $200.`);
        }
        playerToUpdate.position = newPosition;

        const square = board[newPosition] as BoardSquare;
        log(`${player.name} приземляется на "${square.name}".`);

        switch (square.type) {
            case SquareType.PROPERTY:
            case SquareType.RAILROAD:
            case SquareType.UTILITY:
                if (!square.ownerId) {
                    return { ...prev, players: newPlayers, gamePhase: GamePhase.ACTION, gameLog: newLog };
                } else if (square.ownerId !== player.id) {
                    const owner = newPlayers.find(p => p.id === square.ownerId);
                    if (owner) {
                        let rent = 0;
                        if (square.type === SquareType.PROPERTY) {
                           rent = square.rent[square.houses];
                        }
                        if (square.type === SquareType.RAILROAD) {
                            const ownedRailroads = board.filter(s => s.type === SquareType.RAILROAD && s.ownerId === owner.id).length;
                            rent = square.rent[ownedRailroads - 1];
                        }
                        if (square.type === SquareType.UTILITY) {
                            const ownedUtilities = board.filter(s => s.type === SquareType.UTILITY && s.ownerId === owner.id).length;
                            const multiplier = ownedUtilities === 1 ? 4 : 10;
                            rent = (dice[0] + dice[1]) * multiplier;
                        }
                        
                        const ownerToUpdate = newPlayers.find(p => p.id === owner.id)!;
                        playerToUpdate.money -= rent;
                        ownerToUpdate.money += rent;
                        log(`${player.name} платит $${rent} аренды игроку ${owner.name}.`);

                        if(playerToUpdate.money < 0) {
                            log(`${playerToUpdate.name} обанкротился!`);
                        }
                    }
                }
                return { ...prev, players: newPlayers, ...getNextTurnState(newPlayers, currentPlayerIndex, newLog) };
            
            case SquareType.TAX:
                const tax = square.amount || 0;
                playerToUpdate.money -= tax;
                log(`${player.name} платит налог $${tax}.`);
                return { ...prev, players: newPlayers, ...getNextTurnState(newPlayers, currentPlayerIndex, newLog) };

            case SquareType.GO_TO_JAIL:
                playerToUpdate.position = 10;
                playerToUpdate.inJail = true;
                log(`${player.name} отправляется в тюрьму.`);
                return { ...prev, players: newPlayers, ...getNextTurnState(newPlayers, currentPlayerIndex, newLog) };

            default:
                return { ...prev, players: newPlayers, ...getNextTurnState(newPlayers, currentPlayerIndex, newLog) };
        }
    });
  }, [getNextTurnState]);

  const rollDice = useCallback(() => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const dice: [number, number] = [d1, d2];
    
    setGameState(prev => {
        const newLog = [`${prev.players[prev.currentPlayerIndex].name} бросает ${d1} и ${d2}.`, ...prev.gameLog.slice(0, 4)];
        return {
            ...prev,
            dice,
            gamePhase: GamePhase.DICE_ROLL,
            gameLog: newLog,
        };
    });

    setTimeout(() => processTurn(dice), 1000);
  }, [processTurn]);

  const confirmAction = useCallback((confirmed: boolean) => {
    if (confirmation) {
      if (confirmed) {
        confirmation.onConfirm();
      } else {
        confirmation.onCancel();
      }
    }
    setConfirmation(null);
  }, [confirmation]);

  const buyProperty = useCallback(() => {
    const { players, board, currentPlayerIndex } = gameState;
    const player = players[currentPlayerIndex];
    const square = board[player.position] as PropertySquare | RailroadSquare | UtilitySquare;

    const performBuy = () => {
        setGameState(prev => {
            const { players, board, currentPlayerIndex, gameLog } = prev;
            const player = players[currentPlayerIndex];
            const square = board[player.position] as PropertySquare | RailroadSquare | UtilitySquare;
            
            if (player.money < square.price) {
                const newLog = [`${player.name} не может позволить себе "${square.name}".`, ...gameLog.slice(0, 4)];
                return {
                    ...prev,
                    ...getNextTurnState(players, currentPlayerIndex, newLog)
                };
            }

            const newPlayers = cloneDeep(players);
            const newBoard = cloneDeep(board);
            
            const playerToUpdate = newPlayers[currentPlayerIndex];
            const squareToUpdate = newBoard[playerToUpdate.position] as PropertySquare | RailroadSquare | UtilitySquare;
            
            playerToUpdate.money -= squareToUpdate.price;
            squareToUpdate.ownerId = playerToUpdate.id;
            
            const newLog = [`${playerToUpdate.name} покупает "${squareToUpdate.name}" за $${squareToUpdate.price}.`, ...gameLog.slice(0, 4)];

            return {
                ...prev,
                players: newPlayers,
                board: newBoard,
                ...getNextTurnState(newPlayers, currentPlayerIndex, newLog)
            };
        });
    };

    const cancelBuy = () => {
      setGameState(prev => ({
          ...prev,
          ...getNextTurnState(prev.players, prev.currentPlayerIndex, prev.gameLog)
      }));
    };

    setConfirmation({
        message: `Купить "${square.name}" за $${square.price}?`,
        onConfirm: performBuy,
        onCancel: cancelBuy,
    });
  }, [gameState, getNextTurnState]);

  const endTurn = useCallback(() => {
      setGameState(prev => ({
          ...prev,
          ...getNextTurnState(prev.players, prev.currentPlayerIndex, prev.gameLog)
      }));
  }, [getNextTurnState]);

  const initializeGame = useCallback((initialState: GameState) => {
    setGameState(initialState);
    setConfirmation(null);
  }, []);

  const actions = useMemo(() => ({
    rollDice,
    buyProperty,
    endTurn,
    confirmAction,
    initializeGame,
  }), [rollDice, buyProperty, endTurn, confirmAction, initializeGame]);

  return { gameState, actions, confirmation };
};

export default useGameEngine;