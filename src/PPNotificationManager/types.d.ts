/**
 * Note: we need to keep player_name in snake case, because the framework uses
 * it to add player colors to the log messages.
 */

interface NotifChangeRulerArgs {
  player_name: string;
  oldRuler: number | null;
  newRuler: number | null;
  region: string;
}

interface NotifChooseLoyaltyArgs {
  playerId: string;
  player_name: string;
  coalition: string;
  coalitionName: string;
}

interface NotifDiscardCardArgs {
  cardId: string;
  playerId: string;
  player_name: string;
  cardName: string;
  courtCards: Token[];
  from: string;
}

interface NotifPlayCardArgs {
  playerId: string;
  player_name: string;
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

type NotifSmallRefreshInterfaceArgs = Omit<PaxPamirGamedatas, 'staticData'>;
