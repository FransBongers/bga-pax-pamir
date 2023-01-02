interface PlayerCounts {
  cards: number;
  cylinders: number;
  influence: number;
  rupees: string; // TODO (Frans): return as number
}

// TODO(Frans): check what we need
interface Suit {
  change: string;
  name: string;
  suit: string; // change to id?
  tooltip: string;
}

interface Token {
  key: string;
  location: string;
  state: string; // TODO: cast to number in php
  used: string; // TODO: cast to number in php
}

declare enum COALITION {
  AFGHAN = 'afghan',
  BRITISH = 'british',
  RUSSIAN = 'russian',
}

/**
 * TODO (Frans):
 * - some objects are returned as array by php if there is no data and object if there is data. Check how to handle this.
 * - check typing of object keys (playerId: number vs string)
 */
interface PaxPamirGamedatas {
  active_events: Record<string, Token>;
  coalition_blocks: {
    [coalitionId in COALITION]: {
      [coalitionBlockId: string]: Token;
    }
  };
  counts: {
    [playerId: number]: PlayerCounts
  };
  court: { [playerId: number]: Token[] };
  cylinders: {
    [playerId: number]: {
      [cylinderId: string]: Token;
    };
  };
  current_player_id: string;
  favored_suit: Suit;
  gifts: {
    [playerId: number]: Record<'2' | '4' | '6',{
      [cylinderId: string]: Token;
    }>
  };
  players: { [playerId: number]: PaxPamirPlayer };
  suits: Suit[];
}

interface PaxPamirGame extends Game {
  gamedatas: PaxPamirGamedatas;
  objectManager: ObjectManager;
}

interface PaxPamirPlayer extends BgaPlayer {
  rupees: string;
  loyalty: string;
}
