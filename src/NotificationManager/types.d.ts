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
  args: Record<string, unknown>;
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

interface NotifBuildArgs {
  player_name: string;
  playerId: number;
  rupeesOnCards?: { cardId: string; row: number; column: number; rupeeId: string }[];
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

interface NotifChangeLoyaltyArgs {
  playerId: string;
  // player_name: string;
  coalition: string;
  // coalitionName: string;
}

interface NotifDiscardArgs {
  playerId: number;
  player_name: string;
  cardId: string;
  from: 'court' | 'hand' | string;
  to: 'discard' | 'temp_discard';
}

interface NotifReturnSpiesArgs {
  playerId: number;
  player_name: string;
  moves: TokenMove[];
}

// interface NotifDiscardAndTakePrizeArgs {
//   cardId: string;
//   courtOwnerPlayerId: string;
//   playerId: number;
//   player_name: string;
//   logTokenCardName: string;
//   logTokenLargeCard: string;
//   moves: TokenMove[];
//   returnedSpiesLog: Log | '';
// }

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
  to: string;
  logTokenLargeCard: string;
}

interface NotifDiscardPrizesArgs {
  prizes: CourtCard[];
  playerId: string;
  player_name: string;
}

interface NotifDominanceCheckScoresArgs {
  scores: {
    [playerId: string]: {
      currentScore: number;
      newScore: number;
      playerId: number;
    };
  };
}

interface NotifDominanceCheckReturnBlocksArgs {
  moves: TokenMove[];
}

interface NotifExchangeHandArgs {
  player_name: string;
  player_name2: string;
  newHandCounts: {
    [playerId: number]: number;
  };
}

interface NotifMoveCardArgs {
  action: 'PURCHASE_CARD' | 'MOVE_EVENT';
  moves: TokenMove[];
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

interface NotifPublicWithdrawalArgs {
  marketLocation: string;
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

interface NotifShiftMarketArgs {
  cardMoves: {
    cardId: string;
    from: string;
    to: string;
  }[];
}

interface NotifDrawMarketCardArgs {
  cardId: string;
  from: string;
  to: string;
}

interface NotifReplaceHandArgs {
  playerId: number;
  hand: Token[];
}

interface NotifReturnRupeesToSupplyArgs {
  playerId: number;
  player_name: string;
  amount: number;
}

type NotifDeclinePrizeArgs = NotifTakePrizeArgs;

interface NotifTakePrizeArgs {
  cardId: string;
  playerId: number;
  player_name: string;
}

interface NotifTakeRupeesFromSupplyArgs {
  playerId: number;
  player_name: string;
  amount: number;
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

interface NotifUpdateInterfaceArgs {
  updates: {
    playerId: number;
    value: number;
  }[];
}

type NotifSmallRefreshInterfaceArgs = Omit<PaxPamirGamedatas, 'staticData'>;
