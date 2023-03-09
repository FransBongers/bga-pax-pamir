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
  type: 'courtCard';
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
  type: 'eventCard';
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

interface BorderGamedatas {
  roads: Token[];
}

interface RegionGamedatas {
  armies: Token[];
  tribes: Token[];
}

/**
 * TODO (Frans):
 * - some objects are returned as array by php if there is no data and object if there is data. Check how to handle this.
 * - check typing of object keys (playerId: number vs string)
 */
interface PaxPamirGamedatas extends Gamedatas {
  canceledNotifIds: string[];
  staticData: {
    borders: {
      [border: string]: {
        name: string;
        regions: string;
      };
    };
    cards: {
      [cardId: string]: Card;
    };
    specialAbilities: Record<string, { title: string; description: string }>;
    suits: {
      [suit: string]: Suit;
    };
  };
  map: {
    borders: Record<string, BorderGamedatas>;
    regions: Record<string, RegionGamedatas>;
    rulers: {
      [region: string]: number | null;
    };
  }
  activeEvents: Token[];
  coalitionBlocks: {
    [coalition: string]: Token[];
  };
  // current_player_id: string;
  favoredSuit: string;
  market: {
    cards: Token[][];
    rupees: Token[];
  };
  players: Record<number, PaxPamirPlayer>;
  // rupees: Token[];
}

interface PaxPamirGame extends Game {
  activeEvents: Zone;
  gamedatas: PaxPamirGamedatas;
  interactionManager: InteractionManager;
  map: PPMap;
  market: Market;
  objectManager: ObjectManager;
  playerManager: PlayerManager;
  playerCounts: Record<string, number>;
  spies: {
    [cardId: string]: Zone;
  };
  tooltipManager: PPTooltipManager;
  cancelLogs: (notifIds: string[]) => void;
  clearInterface: () => void;
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
  counts: Omit<PlayerCounts, 'rupees'>;
  court: {
    cards: Token[];
    spies: Record<string, Token[]>;
  };
  cylinders: Token[];
  gifts: Record<
    '2' | '4' | '6',
    {
      [cylinderId: string]: Token;
    }
  >;
  hand: Token[]; // Will only contain cards if player is current player (or with open hands variant?)
  loyalty: string;
  rupees: number;
}

interface EnteringDiscardCourtArgs {
  numberOfDiscards: number;
}

interface EnteringDiscardHandArgs {
  numberOfDiscards: number;
}
