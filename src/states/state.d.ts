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




interface EnteringDiscardCourtArgs {
  numberOfDiscards: number;
}

interface EnteringDiscardHandArgs {
  numberOfDiscards: number;
}

interface OnEnteringNegotiateBribeArgs {
  active: number;
  briber: number;
  cardId: string;
  currentAmount: number;
  declined: number[];
  possible: number[];
  maxAmount: number;
  ruler: number;
}

interface OnEnteringPlaceRoadArgs {
  region: {
    id: string;
    name: string;
    borders: string[];
  };
}

interface OnEnteringPlaceSpyArgs {
  regionId: string;
}