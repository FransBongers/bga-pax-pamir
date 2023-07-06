interface State {
  onEnteringState: (args: any) => void;
  onLeavingState: () => void;
}

interface ClientPlayCardStateArgs {
  cardId: string;
}

interface ClientPurchaseCardStateArgs {
  cardId: string;
  cost: number;
}

interface ClientCardActionStateArgs {
  cardId: string;
}

interface ClientResolveEventStateArgs {
  event: string;
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

interface OnEnteringNegotiateBribeArgs {
  bribee: {
    currentAmount?: number;
    playerId: number;
  };
  briber: {
    currentAmount: number;
    playerId: number;
  };
  ifAccepted: {
    action: 'playCard';
    cardId: string;
    side: 'left' | 'right';
  };
  maxAmount: number;
}

interface OnEnteringPlaceRoadArgs {
  region: {
    id: string;
    name: string;
    borders: string[];
  };
}

interface OnEnteringResolveEventArgs {
  event: string;
}

interface OnEnteringPlaceSpyArgs {
  regionId: string;
}

interface OnEnteringPlaceSASafeHouseArgs {
  cylinderId: string;
}

interface OnEnteringStartOfTurnAbilitiesArgs {
  specialAbilities: string[];
}
