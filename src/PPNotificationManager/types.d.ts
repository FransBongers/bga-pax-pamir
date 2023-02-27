/**
 * Note: we need to keep player_name in snake case, because the framework uses
 * it to add player colors to the log messages.
 */

interface NotifChangeRulerArgs {
  playerName: string;
  oldRuler: number | null;
  newRuler: number | null;
  region: string;
}

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
  player_name: string;
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
