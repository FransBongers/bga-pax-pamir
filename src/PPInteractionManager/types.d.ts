interface UpdateInterfaceArgs {
  cardAction?: {
    cardId: string;
  };
  confirmPlaceSpy?: {
    cardId: string;
  };
  playCardBribe?: {
    cardId: string;
    region: string;
    ruler: PPPlayer;
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
  placeRoad?: {
    borders: string[];
  };
  placeSpy?: {
    region: string;
  };
}