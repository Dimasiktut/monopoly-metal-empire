
export enum SquareType {
  PROPERTY,
  RAILROAD,
  UTILITY,
  CHANCE,
  COMMUNITY_CHEST,
  TAX,
  GO,
  JAIL,
  FREE_PARKING,
  GO_TO_JAIL,
}

export interface BaseSquare {
  id: number;
  name: string;
}

export interface PropertySquare extends BaseSquare {
  type: SquareType.PROPERTY;
  price: number;
  rent: number[];
  color: string;
  ownerId?: string;
  houses: number;
}

export interface RailroadSquare extends BaseSquare {
  type: SquareType.RAILROAD;
  price: number;
  rent: number[];
  ownerId?: string;
}

export interface UtilitySquare extends BaseSquare {
  type: SquareType.UTILITY;
  price: number;
  ownerId?: string;
}

export interface SpecialSquare extends BaseSquare {
  type:
    | SquareType.CHANCE
    | SquareType.COMMUNITY_CHEST
    | SquareType.TAX
    | SquareType.GO
    | SquareType.JAIL
    | SquareType.FREE_PARKING
    | SquareType.GO_TO_JAIL;
  amount?: number; // For tax squares
}

export type BoardSquare = PropertySquare | RailroadSquare | UtilitySquare | SpecialSquare;

export interface Player {
  id: string;
  name: string;
  money: number;
  position: number;
  color: string;
  inJail: boolean;
  jailTurns: number;
  getOutOfJailFreeCards: number;
}

export enum GamePhase {
  START_TURN,
  DICE_ROLL,
  ACTION,
  END_TURN,
  GAME_OVER,
}

export interface GameState {
  board: BoardSquare[];
  players: Player[];
  currentPlayerIndex: number;
  dice: [number, number];
  gamePhase: GamePhase;
  gameLog: string[];
  winner?: Player;
}
