interface NotifChooseLoyaltyArgs {
  player_id: string;
  player_name: string;
  coalition: string;
  coalition_name: string;
}

interface NotifDiscardCardArgs {
  cardId: string;
  playerId: string;
  playerName: string;
  cardName: string;
  courtCards: Token[];
  from: string;
}

interface NotifPlayCardArgs {
  playerId: string;
  playerName: string;
  card: Token;
  cardName: string;
  courtCards: Token[];
  bribe: boolean;
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