interface State {
  onEnteringState: (args: any) => void;
  onLeavingState: () => void;
}

type BribeArgs = {
  amount: number;
  negotiated?: boolean;
} | null | undefined;

interface ClientPlayCardStateArgs {
  cardId: string;
  bribe: BribeArgs;
}

interface ClientPurchaseCardStateArgs {
  cardId: string;
  cost: number;
}

interface ClientCardActionStateArgs {
  cardId: string;
  bribe: BribeArgs;
}

type CardAction = 'battle' | 'betray' | 'build' | 'gift' | 'move' | 'tax';

type PlayerAction = 'playCard' | CardAction;

interface ClientInitialBribeCheckArgs {
  next: (props: {
    bribe: {
      amount: number;
      negotiated?: boolean;
    } | null;
  }) => void;
  action: PlayerAction;
  cardId: string;
}

interface EnteringDiscardCourtArgs {
  numberOfDiscards: number;
}

interface EnteringDiscardHandArgs {
  numberOfDiscards: number;
}

interface EnteringDiscardLeverageArgs {
  numberOfDiscards: number;
}

interface OnEnteringAcceptPrizeArgs {
  cardId: string;
}

interface OnEnteringDiscardArgs {
  from: ('hand' | 'court')[];
  loyalty?: string;
  region?: string;
  suit?: string;
}

interface OnEnteringEndGameCheckArgs {
}

interface OnEnteringNegotiateBribeArgs {
  bribee: {
    currentAmount?: number;
    playerId: number;
  };
  briber: {
    currentAmount: number;
    playerId: number;
  };
  action: PlayerAction;
  cardId: string;
  maxAmount: number;
}

type NegotiatedBribe = Omit<OnEnteringNegotiateBribeArgs, 'bribee'> & {
  bribee: {
    currentAmount: number;
    playerId: number;
  };
};

interface OnEnteringPlaceRoadArgs {
  region: {
    id: string;
    name: string;
    borders: string[];
  };
  // selectedPiece: string | null;
}

interface OnEnteringSelectPieceArgs {
  availablePieces: string[];
}

interface OnEnteringResolveEventArgs {
  event: string;
}

interface OnEnteringPlaceSpyArgs {
  regionId: string;
  selectedPiece: string | null;
}

interface OnEnteringPlaceSASafeHouseArgs {
  cylinderId: string;
  fromCardId: string;
}

type OnEnteringResolveEventStateArgs = null;

interface OnEnteringStartOfTurnAbilitiesArgs {
  specialAbility: string;
}
