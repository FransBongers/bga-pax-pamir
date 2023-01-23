interface NotifChooseLoyaltyArgs {
  player_id: string;
  player_name: string;
  coalition: string;
  coalition_name: string;
}

interface NotifPurchaseCardArgs {
  playerId: string;
  playerName: string;
  card: Token;
  cardName: string;
  marketLocation: string;
  newLocation: string;
  updatedCards: { cardId: string; row: number; column: number; rupeeId: string }[];
}

interface NotifRefreshMarketArgs {
  cardMoves: {
    cardId: string;
    from: string;
    to: string;
  }[];
  newCards: {
    cardId: string;
    from: string;
    to: string;
  }[];
}
