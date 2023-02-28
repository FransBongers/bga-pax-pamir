interface PlayerCounts {
  cards: number;
  cylinders: number;
  influence: number;
  rupees: number; // TODO (Frans): return as Number
  suits: {
    economic: number;
    intelligence: number;
    military: number;
    political: number;
  };
}

type Card = CourtCard | EventCard;

interface CourtCard {
  actions: Record<string, { type: string; left: number; top: number }>;
  flavorText: string;
  id: string;
  impactIcons: string[];
  loyalty: string | null;
  name: string;
  prize: string;
  rank: number;
  region: string;
  specialAbility: string;
  suit: string;
  type: 'court_card';
}

interface EventCard {
  discarded: {
    effect: string;
    title?: string;
    description?: string;
  };
  id: string;
  purchased: {
    effect: string;
    title: string;
    description: string;
  };
  type: 'event_card';
}

// TODO(Frans): check what we need
interface Suit {
  change: string;
  name: string;
  id: string;
  tooltip: string;
}

// TODO (Frans): separate Card / Token
interface Token {
  id: string;
  location: string;
  state: number; // TODO: cast to number in php
  used: number; // TODO: cast to number in php
}

/**
 * TODO (Frans):
 * - some objects are returned as array by php if there is no data and object if there is data. Check how to handle this.
 * - check typing of object keys (playerId: number vs string)
 */
interface PaxPamirGamedatas extends Gamedatas {
  activeEvents: Token[];
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
  coalitionBlocks: {
    [coalition: string]: Token[];
  };
  counts: Record<number, PlayerCounts>;
  //   [playerId: number]: PlayerCounts;
  // };
  court: { [playerId: number]: Token[] };
  cylinders: {
    [playerId: number]: Token[];
  };
  hand: Token[];
  // current_player_id: string;
  favoredSuit: string;
  gifts: {
    [playerId: number]: Record<
      '2' | '4' | '6',
      {
        [cylinderId: string]: Token;
      }
    >;
  };
  market: Token[][];
  players: Record<number, PaxPamirPlayer>;
  roads: {
    [border: string]: {
      [coalitionBlockId: string]: Token;
    };
  };
  rulers: {
    [region: string]: number | null;
  };
  rupees: Token[];
  specialAbilities: Record<string, {title: string; description: string;}>
  spies: {
    [cardId: string]: Token[];
  };
  suits: {
    [suit: string]: Suit;
  };
  tribes: {
    [region: string]: {
      [cylinderId: string]: Token;
    };
  };
}

interface PaxPamirGame extends Game {
  activeEvents: Zone;
  gamedatas: PaxPamirGamedatas;
  interactionManager: PPInteractionManager;
  map: PPMap;
  market: PPMarket;
  objectManager: PPObjectManager;
  playerManager: PPPlayerManager;
  playerCounts: Record<string, number>;
  spies: {
    [cardId: string]: Zone;
  };
  tooltipManager: PPTooltipManager;
  getCardInfo: ({ cardId }: { cardId: string }) => Card;
  getPlayerId: () => number;
  getZoneForLocation: ({ location }: { location: string }) => Zone;
  createSpyZone: ({ cardId }: { cardId: string }) => void;
  discardCard: (props: { id: string; from: Zone; order?: null }) => void;
  moveCard: (props: { id: string; from: Stock; to?: Stock | null; order?: number | null }) => void;
  move: (props: { id: string; to: Zone; from: Zone; weight?: number; addClass?: string[]; removeClass?: string[] }) => void;
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
