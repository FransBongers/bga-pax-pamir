interface UpdateInterfaceArgs {
  cardAction?: {
    cardId: string;
  };
  confirmPlaceSpy?: {
    cardId: string;
  };
  playCardConfirm?: {
    cardId: string;
    side: 'left' | 'right';
    firstCard: boolean;
  };
  playCardSelectSide?: {
    cardId: string;
  };
  confirmPurchase?: {
    cardId: string;
    cost: string;
  };
  confirmSelectGift?: {
    value: string;
    cardId: string;
  };
  discardCourt?: {
    numberOfDiscards: number;
  };
  discardHand?: {
    numberOfDiscards: number;
  };
  placeRoad?: {
    borders: string[];
  };
  placeSpy?: {
    region: string;
  };
}