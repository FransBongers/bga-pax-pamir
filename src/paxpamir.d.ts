interface PlayerCounts {
  cards: number;
  cylinders: number;
  influence: PlayerInfluence | WakhanInfluence;
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

interface WakhanCard {
  id: string;
  back: {
    columnNumbers: number[];
    rowSide: string[];
  },
  front: {
    actions: string[];
    columnArrow: number;
    pragmaticLoyalty: string[];
    regionOrder: string[];
    rowSideArrow: number;
  }
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
  remainingActions: number;
  usedCards: string[];
  bribe: NegotiatedBribe | null;
}

/**
 * TODO (Frans):
 * - some objects are returned as array by php if there is no data and object if there is data. Check how to handle this.
 * - check typing of object keys (playerId: number vs string)
 */
interface PaxPamirGamedatas extends Gamedatas {
  canceledNotifIds: string[];
  deck: {
    cardCount: number;
    dominanceCheckCount: number;
  };
  discardPile: {
    cardCount: number;
    dominanceCheckCount: number;
    topCard: Card | null;
  };
  gameOptions: {
    openHands: boolean;
    wakhanEnabled: boolean;
  };
  tempDiscardPile: Card | null;
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
    loyalty: Record<
      string,
      {
        icon: number;
        id: string;
        name: string;
      }
    >;
    regions: Record<string, { id: string; name: string; borders: string[] }>;
    specialAbilities: Record<string, { title: string; description: string }>;
    suits: {
      [suit: string]: Suit;
    };
    wakhanCards: {
      [wakhanCardId: string]: WakhanCard;
    }
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
  paxPamirPlayerOrder: number[];
  paxPamirPlayers: Record<number, PaxPamirPlayer>;
  players: Record<number, BgaPlayer>;
  localState: LocalState;
  wakhanCards?: {
    deck: {
      cardCount: number;
      topCard: null | WakhanCard;
    },
    discardPile: {
      cardCount: number;
      topCard: null | WakhanCard;
    }
  }
  wakhanPragmaticLoyalty?: string | null;
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
  activeEvents: PPActiveEvents;
  activeStates: {
    clientCardActionBattle: ClientCardActionBattleState;
    clientCardActionBetray: ClientCardActionBetrayState;
    clientCardActionBuild: ClientCardActionBuildState;
    clientCardActionGift: ClientCardActionGiftState;
    clientCardActionMove: ClientCardActionMoveState;
    clientCardActionTax: ClientCardActionTaxState;
    clientPlayCard: ClientPlayCardState;
    clientPurchaseCard: ClientPurchaseCardState;
    negotiateBribe: NegotiateBribeState;
    placeRoad: PlaceRoadState;
    placeSpy: PlaceSpyState;
    playerActions: PlayerActionsState;
    setup: SetupState;
    specialAbilityInfrastructure: ClientCardActionBuildState;
    specialAbilitySafeHouse: SASafeHouseState;
    startOfTurnAbilities: StartOfTurnAbilitiesState;
  };
  animationManager: AnimationManager;
  gamedatas: PaxPamirGamedatas;
  gameOptions: PaxPamirGamedatas['gameOptions'];
  map: PPMap;
  market: Market;
  notificationManager: NotificationManager;
  objectManager: ObjectManager;
  playerManager: PlayerManager;
  playerCounts: Record<string, number>;
  playerOrder: number[];
  spies: {
    [cardId: string]: PaxPamirZone;
  };
  tooltipManager: PPTooltipManager;
  _connections: unknown[];
  localState: LocalState;
  addActionButtonClient: (props: AddActionButtonProps) => void;
  addCancelButton: () => void;
  addUndoButton: () => void;
  addPlayerButton: (props: { callback: () => void; player: PPPlayer }) => void;
  addPrimaryActionButton: (props: AddButtonProps) => void;
  addSecondaryActionButton: (props: AddButtonProps) => void;
  addDangerActionButton: (props: AddButtonProps) => void;
  cancelLogs: (notifIds: string[]) => void;
  clearInterface: () => void;
  clearPossible: () => void;
  format_string_recursive: (log: string, args: Record<string,unknown>) => string;
  getCardInfo: ({ cardId }: { cardId: string }) => Card;
  getCurrentPlayer: () => PPPlayer;
  getMinimumActionCost: (props: {action: string;}) => number | null;
  getPlayerId: () => number;
  getWakhanCardInfo: ({wakhanCardId}: {wakhanCardId: string;}) => WakhanCard;
  getZoneForLocation: ({ location }: { location: string }) => PaxPamirZone;
  createSpyZone: ({ cardId }: { cardId: string }) => void;
  // discardCard: (props: { id: string; from: Zone; order?: number }) => void;
  move: (props: { id: string; to: Zone; from: Zone; weight?: number; addClass?: string[]; removeClass?: string[] }) => void;
  onCancel: () => void;
  // returnSpiesFromCard: (props: { cardId: string }) => void;
  setCourtCardsSelectable: (props: { callback: (props: { cardId: string }) => void; loyalty?: string; suit?: string; region?: string; }) => void;
  setHandCardsSelectable: (props: { callback: (props: { cardId: string }) => void }) => void;
  // AJAX calls
  takeAction: (props: { action: string; data?: Record<string, unknown> }) => void;
  updateLocalState: (updates: Partial<LocalState>) => void;
  clientUpdatePageTitle: ({ text, args }: { text: string; args: Record<string, unknown> }) => void;
  clientUpdatePageTitleOtherPlayers: ({ text, args }: { text: string; args: Record<string, string | number> }) => void;
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
  hand: Token[]; // Will only contain cards if player is current player (or with open hands variant)
  hexColor: string;
  events: (EventCard & Token)[];
  loyalty: string;
  rupees: number;
  prizes: CourtCard[];
}
