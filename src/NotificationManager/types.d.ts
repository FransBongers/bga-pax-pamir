/**
 * Note: we need to keep player_name in snake case, because the framework uses
 * it to add player colors to the log messages.
 */
interface TokenMove {
  tokenId: string;
  from: string;
  to: string;
  weight?: number;
}

interface Log {
  log: string;
  args: Record<string,unknown>;
}

interface NotifBetrayArgs {
  player_name: string;
  playerId: number;
  logTokenCardName: string;
  logTokenLargeCard: string;
  rupeesOnCards: { cardId: string; row: number; column: number; rupeeId: string }[];
}

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

interface NotifDiscardAndTakePrizeArgs {
  cardId: string;
  courtOwnerPlayerId: string;
  playerId: number;
  player_name: string;
  logTokenCardName: string;
  logTokenLargeCard: string;
  moves: TokenMove[];
  returnedSpiesLog: Log | '';
}

interface NotifDiscardFromCourtArgs {
  cardId: string;
  courtOwnerPlayerId: string;
  playerId: number;
  player_name: string;
  logTokenCardName: string;
  logTokenLargeCard: string;
  moves: TokenMove[];
  returnedSpiesLog: Log | '';
}

interface NotifDiscardFromHandArgs {
  cardId: string;
  playerId: string;
  player_name: string;
  logTokenCardName: string;
  logTokenLargeCard: string;
}

interface NotifDiscardFromMarketArgs {
  cardId: string;
  playerId: string;
  player_name: string;
  from: string;
  logTokenLargeCard: string;
}

interface NotifMoveTokenArgs {
  moves: TokenMove[];
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

interface NotifUpdateCourtCardStatesArgs {
  playerId: number;
  cardStates: {
    cardId: string;
    state: number;
  }[];
}

type NotifSmallRefreshInterfaceArgs = Omit<PaxPamirGamedatas, 'staticData'>;
