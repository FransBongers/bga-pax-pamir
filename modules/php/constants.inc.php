<?php

/**
 * Actions 
 */
const PLAY_CARD = 'playCard';
const PURCHASE_CARD = 'purchaseCard';
// card actions
const BATTLE = 'battle';
const BETRAY = 'betray';
const BUILD = 'build';
const GIFT = 'gift';
const MOVE = 'move';
const TAX = 'tax';

/**
 * Card types
 */
const EVENT_CARD = 'eventCard';
const COURT_CARD = 'courtCard';

/**
 * Coalitions
 */
const AFGHAN = 'afghan';
const BRITISH = 'british';
const RUSSIAN = 'russian';

const COALITIONS = [
  AFGHAN,
  BRITISH,
  RUSSIAN,
];

/**
 * Event card effects & cardIds
 */
const ECE_BACKING_OF_PERSIAN_ARISTOCRACY = 'backingOfPersianAristocracy';
const ECE_CONFIDENCE_FAILURE = 'confidenceFailure';
const ECE_CONFLICT_FATIGUE = 'conflictFatigue';
const ECE_CONFLICT_FATIGUE_CARD_ID = 'card_109';
const ECE_COURTLY_MANNERS = 'courtlyManners';
const ECE_DISREGARD_FOR_CUSTOMS = 'disregardForCustoms';
const ECE_DOMINANCE_CHECK = 'dominanceCheck';
const ECE_EMBARRASSEMENT_OF_RICHES = 'embarrassementOfRiches';
const ECE_FAILURE_TO_IMPRESS = 'failureToImpress';
const ECE_INTELLIGENCE_SUIT = 'intelligenceSuit';
const ECE_KOH_I_NOOR_RECOVERED = 'kohINoorRecovered';
const ECE_MILITARY_SUIT = 'militarySuit';
const ECE_NATION_BUILDING = 'nationBuilding';
const ECE_NATION_BUILDING_CARD_ID = 'card_112';
const ECE_NATIONALISM = 'nationalism';
const ECE_NATIONALISM_CARD_ID = 'card_110';
const ECE_NEW_TACTICS = 'newTactics';
const ECE_NO_EFFECT = 'noEffect';
const ECE_OTHER_PERSUASIVE_METHODS = 'otherPersuasiveMethods';
const ECE_PASHTUNWALI_VALUES = 'pashtunwaliValues';
const ECE_PASHTUNWALI_VALUES_CARD_ID = 'card_115';
const ECE_POLITICAL_SUIT = 'politicalSuit';
const ECE_PUBLIC_WITHDRAWAL = 'publicWithdrawal';
const ECE_REBUKE = 'rebuke';
const ECE_RIOTS_IN_HERAT = 'riotsInHerat';
const ECE_RIOTS_IN_KABUL = 'riotsInKabul';
const ECE_RIOTS_IN_PERSIA = 'riotsInPersia';
const ECE_RIOTS_IN_PUNJAB = 'riotsInPunjab';
const ECE_RUMOR = 'rumor';

/**
 * Impact Icons
 */
const ROAD = 'road';
const ARMY = 'army';
const LEVERAGE = 'leverage';
const SPY = 'spy';
const TRIBE = 'tribe';
const ECONOMIC_SUIT = 'economic';
const MILITARY_SUIT = 'military';
const POLITICAL_SUIT = 'political';
const INTELLIGENCE_SUIT = 'intelligence';

/**
 * Regions
 */
const TRANSCASPIA = 'transcaspia';
const KABUL = 'kabul';
const PERSIA = 'persia';
const HERAT = 'herat';
const KANDAHAR = 'kandahar';
const PUNJAB = 'punjab';


/**
 * Special abilities
 */
const SA_INDISPENSABLE_ADVISORS = 'indispensableAdvisors'; // card_1
const SA_INSURRESCTION = 'insurrection'; // card_3
const SA_CLAIM_OF_ANCIENT_LINEAGE = 'claimOfAncientLineage'; // card_5
const SA_CLAIM_OF_ANCIENT_LINEAGE_CARD_ID = 'card_5';
const SA_BODYGUARDS = 'bodyguards'; // card_15 card_83
const SA_CITADEL_KABUL = 'citadelKabul'; // card_17
const SA_CITADEL_KABUL_CARD_ID = 'card_17';
const SA_CITADEL_TRANSCASPIA = 'citadelTranscaspia'; // card_97
const SA_CITADEL_TRANSCASPIA_CARD_ID = 'card_97';
const SA_STRANGE_BEDFELLOWS = 'strangeBedfellows'; // card_21
const SA_CIVIL_SERVICE_REFORMS = 'civilServiceReforms'; // card_24
const SA_SAFE_HOUSE = 'safeHouse'; // card_41 card_72
const SA_SAFE_HOUSE_CARD_IDS = ['card_41','card_72'];
const SA_CHARISMATIC_COURTIERS = 'charismaticCourtiers'; // card_42
const SA_BLACKMAIL_HERAT = 'blackmailHerat'; // card_54
const SA_BLACKMAIL_KANDAHAR = 'blackmailKandahar'; // card_43
const SA_INDIAN_SUPPLIES = 'indianSupplies'; // card_51
const SA_WELL_CONNECTED = 'wellConnected'; // card_56
const SA_HERAT_INFLUENCE = 'heratInfluence'; // card_66
const SA_PERSIAN_INFLUENCE = 'persianInfluence'; // card_68
const SA_RUSSIAN_INFLUENCE = 'russianInfluence'; // card_70
const SA_INFRASTRUCTURE = 'infrastructure'; // card_78
const SA_SAVVY_OPERATOR = 'savvyOperator'; // card_91
const SA_IRREGULARS = 'irregulars'; // card_99

/**
 * Suits
 */
const ECONOMIC = 'economic';
const MILITARY = 'military';
const POLITICAL = 'political';
const INTELLIGENCE = 'intelligence';

/**
 * Supply locations
 */
const RUPEE_SUPPLY = 'rupeePool';
const BLOCKS_AFGHAN_SUPPLY = 'blocks_afghan';
const BLOCKS_BRITISH_SUPPLY = 'blocks_british';
const BLOCKS_RUSSIAN_SUPPLY = 'blocks_russian';

/**
 * Card locations
 */
const DISCARD = 'discard';
const TEMP_DISCARD = 'temp_discard';
const ACTIVE_EVENTS = 'active_events';
const HAND = 'hand';
const COURT = 'court';

/**
 * Bribe status
 */

const BRIBE_ACCEPTED = 'bribe_accepted';
const BRIBE_DECLINED = 'bribe_declined';
const BRIBE_UNRESOLVED = null;


/**
 * Log tokens
 */
const LOG_TOKEN_ARMY = 'army';
const LOG_TOKEN_CARD = 'card';
const LOG_TOKEN_CARD_ICON = 'cardIcon';
const LOG_TOKEN_CARD_NAME = 'cardName';
const LOG_TOKEN_COALITION = 'coalition';
const LOG_TOKEN_COALITION_NAME = 'coalitionName';
const LOG_TOKEN_CYLINDER = 'cylinder';
const LOG_TOKEN_FAVORED_SUIT = 'favoredSuit';
const LOG_TOKEN_LARGE_CARD = 'largeCard';
const LOG_TOKEN_LEVERAGE = 'leverage';
const LOG_TOKEN_NEW_LINE = 'newLine';
const LOG_TOKEN_PLAYER_NAME = 'playerName';
const LOG_TOKEN_REGION_NAME = 'regionName';
const LOG_TOKEN_ROAD = 'road';
const LOG_TOKEN_RUPEE = 'rupee';

/*
 * Game options
 */

/*
 * Stats
 */

 /**
  * Dispatch actions
  */
  const DISPATCH_CLEANUP_CHECK_COURT = 'dispCleanupCheckCourt';
  const DISPATCH_CLEANUP_CHECK_HAND = 'dispCleanupCheckHand';
  const DISPATCH_CLEANUP_DISCARD_EVENT = 'dispCleanupDiscardEvent';
  const DISPATCH_DISCARD = 'dispatchDiscard';
  const DISPATCH_DISCARD_PATRIOTS = 'dispatchDiscardPatriots';
  const DISPATCH_DISCARD_ALL_COURT_CARDS_OF_TYPE = 'dispatchDiscardAllCourtOfType';

  const DISPATCH_IMPACT_ICON_ARMY = 'dispatchImpactArmy';
  const DISPATCH_IMPACT_ICON_ECONOMIC = 'dispatchImpactEconomic';
  const DISPATCH_IMPACT_ICON_INTELLIGENCE = 'dispatchImpactIntelligence';
  const DISPATCH_IMPACT_ICON_MILITARY = 'dispatchImpactMilitary';
  const DISPATCH_IMPACT_ICON_LEVERAGE = 'dispatchImpactLeverage';
  const DISPATCH_IMPACT_ICON_POLITICAL = 'dispatchImpactPolitical';
  const DISPATCH_IMPACT_ICON_ROAD = 'dispatchImpactRoad';
  const DISPATCH_IMPACT_ICON_SPY = 'dispatchImpactSpy';
  const DISPATCH_IMPACT_ICON_TRIBE = 'dispatchImpactTribe';
  
  const DISPATCH_OVERTHROW_TRIBE = 'dispatchOverthrowTribe';
  const DISPATCH_REFILL_MARKET_DRAW_CARDS = 'dispRefillMarketDraw';
  const DISPATCH_REFILL_MARKET_SHIFT_CARDS = 'dispRefillMarketShift';
  const DISPATCH_TRANSITION = 'dispatchTransition';

  const IMPACT_ICON_DISPATCH_MAP = [
    ARMY => DISPATCH_IMPACT_ICON_ARMY,
    ECONOMIC_SUIT => DISPATCH_IMPACT_ICON_ECONOMIC,
    INTELLIGENCE_SUIT => DISPATCH_IMPACT_ICON_INTELLIGENCE,
    MILITARY_SUIT => DISPATCH_IMPACT_ICON_MILITARY,
    LEVERAGE => DISPATCH_IMPACT_ICON_LEVERAGE,
    POLITICAL_SUIT => DISPATCH_IMPACT_ICON_POLITICAL,
    ROAD => DISPATCH_IMPACT_ICON_ROAD,
    SPY => DISPATCH_IMPACT_ICON_SPY,
    TRIBE => DISPATCH_IMPACT_ICON_TRIBE
  ];

  /**
   * 
   */
  const USED = 1;
  const NOT_USED = 0;