interface PlayerCounts {
  cards: number;
  cylinders: number;
  influence: number;
  rupees: string; // TODO (Frans): return as number
}

type Card = CourtCard | DominanceCheckCard | EventCard;

interface CourtCard {
  actions: Record<string, { type: string; left: number; top: number }>;
  flavor_text: string;
  id: string;
  impact_icons: string[];
  loyalty: string | null;
  name: string;
  prize: string;
  rank: number;
  region: string;
  special_ability: string;
  suit: string;
  tooltip_action: string;
  type: 'court_card';
}

interface DominanceCheckCard {
  id: string;
  name: string;
  type: 'dominance_check_card';
}

interface EventCard {
  discarded: string;
  id: string;
  name: string;
  purchased: string;
  type: 'event_card';
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

/**
 * TODO (Frans):
 * - some objects are returned as array by php if there is no data and object if there is data. Check how to handle this.
 * - check typing of object keys (playerId: number vs string)
 */
interface PaxPamirGamedatas extends Gamedatas {
  active_events: Record<string, Token>;
  armies: {
    [region: string]: {
      [coalitionBlockId: string]: Token;
    };
  };
  borders: {
    [border: string]: {
      name: string;
      regions: string;
    };
  };
  cards: {
    [cardId: string]: Card;
  };
  coalition_blocks: {
    [coalition: string]: {
      [coalitionBlockId: string]: Token;
    };
  };
  counts: {
    [playerId: number]: PlayerCounts;
  };
  court: { [playerId: number]: Token[] };
  cylinders: {
    [playerId: number]: {
      [cylinderId: string]: Token;
    };
  };
  hand: {
    [cardId: string]: Token;
  };
  // current_player_id: string;
  favored_suit: Suit;
  gifts: {
    [playerId: number]: Record<
      '2' | '4' | '6',
      {
        [cylinderId: string]: Token;
      }
    >;
  };
  market: Token[][];
  players: { [playerId: number]: PaxPamirPlayer };
  roads: {
    [border: string]: {
      [coalitionBlockId: string]: Token;
    };
  };
  rulers: {
    [region: string]: string; // TODO (Frans): check if we need to cast as number in backend
  };
  rupees: {
    [rupeeId: string]: Token;
  };
  spies: {
    [cardId: string]: {
      [cylinderId: string]: Token;
    };
  };
  suits: Suit[];
  tribes: {
    [region: string]: {
      [cylinderId: string]: Token;
    };
  };
}

interface PaxPamirGame extends Game {
  activeEvents: Stock;
  gamedatas: PaxPamirGamedatas;
  interactionManager: PPInteractionManager;
  map: PPMap;
  market: PPMarket;
  objectManager: PPObjectManager;
  playerManager: PPPlayerManager;
  playerCounts: Record<string, number>;
  playerHand: Stock;
  spies: {
    [cardId: string]: Zone;
  };
  getPlayerId: () => string;
  getZoneForLocation: ({ location }: { location: string }) => Zone;
  discardCard: (props: { id: string; from: Stock; order?: null }) => void;
  moveCard: (props: { id: string; from: Stock; to?: Stock | null; order?: number | null }) => void;
  moveToken: (props: { id: string; to: Zone; from: Zone; weight?: number; addClass?: string; removeClass?: string }) => void;
  // AJAX calls
  takeAction: (props: { action: string; data?: Record<string, unknown> }) => void;
}

interface PaxPamirPlayer extends BgaPlayer {
  rupees: string;
  loyalty: string;
}

interface EnteringDiscardCourtArgs {
  numberOfDiscards: number;
}

interface EnteringDiscardHandArgs {
  numberOfDiscards: number;
}

interface NotifChooseLoyaltyArgs {
  player_id: string;
  player_name: string;
  coalition: string;
  coalition_name: string;
}
