interface UpdateInterfaceArgs {
  cardAction?: {
    cardId: string;
  };
  confirmPlaceSpy?: {
    cardId: string;
  };
  confirmPurchase?: {
    cardId: string;
    cost: number;
  };
  confirmSelectGift?: {
    value: number;
    cardId: string;
  };
  discardCourt?: {
    numberOfDiscards: number;
  };
  discardHand?: {
    numberOfDiscards: number;
  };
  negotiateBribe?: {
    amount: number;
    possible: number[];
    ruler: number;
  };
  placeRoad?: {
    borders: string[];
  };
  placeSpy?: {
    region: string;
  };
  playCardBribe?: {
    cardId: string;
    region: string;
    ruler: PPPlayer;
    rupees: number;
  };
  playCardConfirm?: {
    cardId: string;
    side: 'left' | 'right';
    firstCard: boolean;
    bribe: number;
  };
  playCardSelectSide?: {
    cardId: string;
    bribe: number;
  };
}

interface EnteringDiscardCourtArgs {
  numberOfDiscards: number;
}

interface EnteringDiscardHandArgs {
  numberOfDiscards: number;
}

interface EnteringNegotiateBribeArgs {
  active: number;
  briber: number;
  cardId: string;
  currentAmount: number;
  declined: number[];
  possible: number[];
  maxAmount: number;
  ruler: number;
  
}
