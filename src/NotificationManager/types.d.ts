/**
 * Note: we need to keep player_name in snake case, because the framework uses
 * it to add player colors to the log messages.
 */
interface NotifPayBribeArgs {
  player_name: string;
  rulerId: number;
  briberId: number;
  rupees: number;
}

interface NotifChangeFavoredSuitArgs {
  logTokenFavoredSuit: string;
  from: string;
  to: string;
}

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
  state: number;
}

interface NotifMoveTokenArgs {
  moves: {
    tokenId: string;
    from: string;
    to: string;
    weight?: number;
  }[];
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
  playerId: number;
  player_name: string;
  receivedRupees: number;
  card: Token;
  cardName: string;
  marketLocation: string;
  newLocation: string;
  rupeesOnCards: { cardId: string; row: number; column: number; rupeeId: string }[];
}

interface NotifPurchaseGiftArgs {
  playerId: number;
  player_name: string;
  value: number;
  rupeesOnCards: { cardId: string; row: number; column: number; rupeeId: string }[];
  rupeeChange: number;
  influenceChange: number;
  tokenMove: {
    from: string;
    to: string;
    tokenId: string;
  };
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

interface NotifTaxMarketArgs {
  playerId: number;
  player_name: string;
  amount: number;
  logTokenRupee: string;
  selectedRupees: {
    rupeeId: string;
    row: number;
    column: number;
  }[];
}

interface NotifTaxPlayerArgs {
  playerId: number;
  player_name: string;
  amount: number;
  taxedPlayerId: number;
  logTokenRupee: string;
  logTokenPlayerName: string;
}

type NotifSmallRefreshInterfaceArgs = Omit<PaxPamirGamedatas, 'staticData'>;
