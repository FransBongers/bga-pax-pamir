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
  suit: 'economic' | 'military' | 'political' | 'intelligence';
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
  name: string;
  borders: string[];
}

interface LocalState {
  activePlayer: PaxPamirPlayer;
  remainingActions: number;
  usedCards: string[];
}

/**
 * TODO (Frans):
 * - some objects are returned as array by php if there is no data and object if there is data. Check how to handle this.
 * - check typing of object keys (playerId: number vs string)
 */
interface PaxPamirGamedatas extends Gamedatas {
  canceledNotifIds: string[];
  discardPile: Card | null;
  staticData: {
    borders: {
      [border: string]: {
        name: string;
        regions: string[];
      };
    };
    cards: {
      [cardId: string]: Card;
    };
    loyalty: Record<string, {
      icon: number;
      id: string;
      name: string;
    }>;
    regions: Record<string,{id: string; name: string; borders: string[];}>
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
  };
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
  localState: LocalState;
  // rupees: Token[];
}

interface AddButtonProps {
  id: string;
  text: string;
  callback: () => void;
  extraClasses?: string;
}

interface AddActionButtonProps extends AddButtonProps {
  color?: 'blue' | 'gray' | 'red' | 'none';
}

interface PaxPamirGame extends Game {
  activeEvents: Zone;
  gamedatas: PaxPamirGamedatas;
  map: PPMap;
  market: Market;
  objectManager: ObjectManager;
  playerManager: PlayerManager;
  playerCounts: Record<string, number>;
  spies: {
    [cardId: string]: Zone;
  };
  tooltipManager: PPTooltipManager;
  _connections: unknown[];
  localState: LocalState;
  addActionButtonClient: (props: AddActionButtonProps) => void;
  addCancelButton: () => void;
  addPrimaryActionButton: (props: AddButtonProps) => void;
  addSecondaryActionButton: (props: AddButtonProps) => void;
  addDangerActionButton: (props: AddButtonProps) => void;
  cancelLogs: (notifIds: string[]) => void;
  clearInterface: () => void;
  clearPossible: () => void;
  getCardInfo: ({ cardId }: { cardId: string }) => Card;
  getPlayerId: () => number;
  getZoneForLocation: ({ location }: { location: string }) => Zone;
  createSpyZone: ({ cardId }: { cardId: string }) => void;
  // discardCard: (props: { id: string; from: Zone; order?: number }) => void;
  move: (props: { id: string; to: Zone; from: Zone; weight?: number; addClass?: string[]; removeClass?: string[] }) => void;
  onCancel: () => void;
  // returnSpiesFromCard: (props: { cardId: string }) => void;
  setCourtCardsSelectable: ({ callback }: { callback: (props: { cardId: string }) => void }) => void;
  setHandCardsSelectable: ({ callback }: { callback: (props: { cardId: string }) => void }) => void;
  // AJAX calls
  takeAction: (props: { action: string; data?: Record<string, unknown> }) => void;
  updateLocalState: (updates: Partial<LocalState>) => void;
  clientUpdatePageTitle: ({ text, args }: { text: string; args: Record<string, string | number> }) => void;
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
  prizes: CourtCard[];
}
