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

interface NotifPayBribeArgs {
  tkn_playerName: string;
  rulerId: number;
  briberId: number;
  rupees: number;
}

interface NotifChangeFavoredSuitArgs {
  tkn_favoredSuit: string;
  from: string;
  to: string;
}

interface NotifChangeRulerArgs {
  tkn_playerName: string;
  oldRuler: number | null;
  newRuler: number | null;
  region: string;
}

interface NotifChangeLoyaltyArgs {
  playerId: string;
  // tkn_playerName: string;
  coalition: string;
  // coalitionName: string;
}

interface NotifDiscardArgs {
  playerId: number;
  tkn_playerName: string;
  cardId: string;
  from: 'court' | 'hand' | string;
  to: 'discardPile' | 'tempDiscardPile';
}

interface NotifReturnAllSpiesArgs {
  playerId: number;
  tkn_playerName: string;
  cardId: string;
  spies: {
    [playerId: string]: {
      tokenId: string;
      weight?: number;
    }[];
  };
}

interface NotifReturnAllToSupplyArgs {
  playerId: number;
  tkn_playerName: string;
  regionId: string;
  armies: {
    [coalition: string]: {
      tokenId: string;
      weight?: number;
    }[];
  };
  tribes: {
    [playerId: string]: {
      tokenId: string;
      weight?: number;
    }[];
  };
}

interface NotifReturnCoalitionBlockArgs {
  playerId: number;
  tkn_playerName: string;
  from: string;
  blockId: string;
  weight?: number;
  type: 'army' | 'road';
  coalition: string;
}

interface NotifReturnCylinderArgs {
  playerId: number;
  tkn_playerName: string;
  from: string;
  cylinderId: string;
  weight?: number;
}

interface NotifDiscardFromMarketArgs {
  cardId: string;
  playerId: string;
  tkn_playerName: string;
  from: string;
  to: 'discardPile' | 'tempDiscardPile' | 'activeEvents';
  tkn_largeCard: string;
}

interface NotifDiscardPrizesArgs {
  prizes: CourtCard[];
  playerId: number;
  tkn_playerName: string;
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

interface TokenZoneInfo {
  id: string;
  weight?: number;
}

interface NotifDominanceCheckReturnBlocksArgs {
  blocks: {
    [AFGHAN]: TokenZoneInfo[];
    [BRITISH]: TokenZoneInfo[];
    [RUSSIAN]: TokenZoneInfo[];
  };
  fromLocations: string[];
}

interface NotifExchangeHandArgs {
  tkn_playerName: string;
  tkn_playerName_2: string;
  newHandCounts: {
    [playerId: number]: number;
  };
  newHandCards: {
    [playerId: number]: CourtCard[];
  } | null;
}

interface NotifPlaceArmyArgs {
  move: TokenMove;
}

interface NotifPlaceCylinderArgs {
  move: TokenMove;
}

interface NotifPlaceRoadArgs {
  move: TokenMove;
}

interface NotifMoveCardArgs {
  action: 'MOVE_EVENT';
  move: {
    from: string;
    id: string;
    to: string;
  } | null;
}

interface NotifMoveTokenArgs {
  move: TokenMove;
}

interface NotifPayRupeesToMarketArgs {
  playerId: number;
  tkn_playerName: string;
  rupeesOnCards?: { cardId: string; row: number; column: number; rupeeId: string }[];
}

interface NotifPlayCardArgs {
  playerId: number;
  tkn_playerName: string;
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
  tkn_playerName: string;
  receivedRupees: number;
  card: Token;
  cardName: string;
  marketLocation: string;
  newLocation: string;
  rupeesOnCards: { cardId: string; row: number; column: number; rupeeId: string }[];
}

interface NotifPurchaseGiftArgs {
  playerId: number;
  tkn_playerName: string;
  value: number;
  // rupeesOnCards: { cardId: string; row: number; column: number; rupeeId: string }[];
  // rupeeChange: number;
  // influenceChange: number;
  // tokenMove: {
  //   from: string;
  //   to: string;
  //   tokenId: string;
  // };
}

interface NotifShiftMarketArgs {
  move: {
    cardId: string;
    from: string;
    to: string;
  };
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
  tkn_playerName: string;
  amount: number;
}

type NotifDeclinePrizeArgs = NotifTakePrizeArgs;

interface NotifTakePrizeArgs {
  cardId: string;
  playerId: number;
  tkn_playerName: string;
}

interface NotifTakeRupeesFromSupplyArgs {
  playerId: number;
  tkn_playerName: string;
  amount: number;
}

interface NotifSmallRefreshHandArgs {
  playerId: number;
  hand: Token[];
}

interface NotifTaxMarketArgs {
  playerId: number;
  tkn_playerName: string;
  amount: number;
  tkn_rupee: string;
  selectedRupees: {
    rupeeId: string;
    row: number;
    column: number;
  }[];
}

interface NotifTaxPlayerArgs {
  playerId: number;
  tkn_playerName: string;
  amount: number;
  taxedPlayerId: number;
  tkn_rupee: string;
}

// interface NotifUpdateCourtCardStatesArgs {
//   playerId: number;
//   cardStates: {
//     cardId: string;
//     state: number;
//   }[];
// }

interface PlayerInfluence {
  type: 'playerInfluence';
  playerId: number;
  value: number;
}

interface WakhanInfluence {
  type: 'wakhanInfluence';
  influence: {
    afghan: number;
    british: number;
    russian: number;
  }
}

interface NotifUpdateInfluenceArgs {
  updates: (PlayerInfluence | WakhanInfluence)[];
}

interface NotifWakhanDrawCardArgs {
  deck: {
    from: string;
    to: string | null;
  },
  discardPile: {
    from: string | null;
    to: string;
  }
}

interface NotifWakhanRadicalizeArgs {
  marketLocation: string;
  newLocation: string;
  card: Token;
  receivedRupees: number;
  rupeesOnCards?: { cardId: string; row: number; column: number; rupeeId: string }[];
}

interface NotifWakhanReshuffleDeckArgs {
  topOfDeck: string;
  topOfDiscardPile: string;
}

interface NotifWakhanUpdatePragmaticLoyalty {
  pragmaticLoyalty: string | null;
}

type NotifSmallRefreshInterfaceArgs = Omit<PaxPamirGamedatas, 'staticData'>;
