<?php
require_once 'gameoptions.inc.php';
/**
 * State names
 */

const ST_GAME_SETUP = 1;
const ST_PLAYER_SETUP = 2;
const ST_PREPARE_TURN = 3;
const ST_NEXT_PLAYER = 4;
const ST_START_OF_TURN_ABILITIES = 5;

const ST_DISPATCH_ACTION = 10;


const ST_PLAYER_ACTIONS = 20;
const ST_PLACE_ROAD = 21;
const ST_PLACE_SPY = 22;
const ST_NEGOTIATE_BRIBE = 23;
const ST_ACCEPT_PRIZE = 24;
const ST_DISCARD = 25;
const ST_SELECT_PIECE = 26;

const ST_CLEANUP = 40;
const ST_CLEANUP_DISCARD_EVENTS = 41;
const ST_REFILL_MARKET = 42;

const ST_SA_SAFE_HOUSE = 50;
const ST_SA_INFRASTRUCTURE = 51;

const ST_RESOLVE_ECE_OTHER_PERSUASIVE_METHODS = 60;
const ST_RESOLVE_ECE_PASHTUNWALI_VALUES = 61;
const ST_RESOLVE_ECE_REBUKE = 62;
const ST_RESOLVE_ECE_RUMOR = 63;

const ST_WAKHAN_TURN = 90;
const ST_WAKHAN_PAUSE = 91;
const ST_CONFIRM_PARTIAL_TURN = 94;
const ST_CHANGE_ACTIVE_PLAYER = 95;
const ST_END_GAME_CHECK = 97;
const ST_CALCULATE_TIE_BREAKER = 98;
const ST_END_GAME = 99;


/**
 * Player color map
 */
const COLOR_MAP = [
  '006A8F' => 'blue',
  'AB2C29' => 'red',
  'D7A461' => 'yellow',
  '7A6E66' => 'gray',
  '231F20' => 'black',
  '8A70B2' => 'purple',
  // original colors
  '98B3C0' => 'blue',
  'C19B9E' => 'red',
  'DFCFB6' => 'yellow',
  'B9B6B1' => 'gray',
  '807F7F' => 'black',
];

const DB_UPGRADE_COLOR_MAP = [
  '98B3C0' => '006A8F',
  'C19B9E' => 'AB2C29',
  'DFCFB6' => 'D7A461',
  'B9B6B1' => '7A6E66',
  '807F7F' => '231F20',
];


/**
 * Decclined Bribe limit
 */
const DECLINED_BRIBES_LIMIT = 3;

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
 * Influence types (used in frontend for notifs)
 */
const PLAYER_INFLUENCE = 'playerInfluence';
const WAKHAN_INFLUENCE = 'wakhanInfluence';

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
const ECE_COURTLY_MANNERS_CARD_ID = 'card_107';
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
const ECE_PUBLIC_WITHDRAWAL_CARD_ID = 'card_111';
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

// borders (for all borders regions are in alphabetical order)
const HERAT_KABUL = 'herat_kabul';
const HERAT_KANDAHAR = 'herat_kandahar';
const HERAT_PERSIA = 'herat_persia';
const HERAT_TRANSCASPIA = 'herat_transcaspia';
const KABUL_KANDAHAR = 'kabul_kandahar';
const KABUL_PUNJAB = 'kabul_punjab';
const KABUL_TRANSCASPIA = 'kabul_transcaspia';
const KANDAHAR_PUNJAB = 'kandahar_punjab';
const PERSIA_TRANSCASPIA = 'persia_transcaspia';


/**
 * Special abilities
 */
const SA_INDISPENSABLE_ADVISORS = 'indispensableAdvisors'; // card_1
const SA_INDISPENSABLE_ADVISORS_CARD_ID = 'card_1';
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
const SA_SAFE_HOUSE_CARD_IDS = ['card_41', 'card_72'];
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
const DECK = 'deck';
const DISCARD = 'discardPile';
const TEMP_DISCARD = 'tempDiscardPile';
const ACTIVE_EVENTS = 'activeEvents';
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
const DISPATCH_ACCEPT_PRIZE_CHECK = 'dispAcceptPrizeCheck';

const DISPATCH_CLEANUP_CHECK_COURT = 'dispCleanupCheckCourt';
const DISPATCH_CLEANUP_CHECK_HAND = 'dispCleanupCheckHand';
const DISPATCH_CLEANUP_DISCARD_EVENT = 'dispCleanupDiscardEvent';
const DISPATCH_DISCARD = 'dispatchDiscard';
const DISPATCH_DISCARD_BETRAYED_CARD = 'dispDiscardBetrayedCard';
const DISPATCH_DISCARD_PATRIOTS = 'dispatchDiscardPatriots';
const DISPATCH_DISCARD_SINGLE_CARD = 'dispDiscardSingleCard';


const DISPATCH_DISCARD_ALL_COURT_CARDS_OF_TYPE = 'dispatchDiscardAllCourtOfType';

const DISPATCH_DOMINANCE_CHECK_AFTER_ABILITIES = 'dispDominanceAfterAbilities';
const DISPATCH_DOMINANCE_CHECK_DISCARD_EVENTS_IN_PLAY = 'dispDominanceCheckDiscardEventsInPlay';
const DISPATCH_DOMINANCE_CHECK_END_GAME_CHECK = 'dispDominanceCheckEndGameCheck';
const DISPATCH_DOMINANCE_CHECK_REMOVE_COALITION_BLOCKS = 'dispDominanceRemoveBlocks';
const DISPATCH_DOMINANCE_CHECK_RESOLVE = 'dispDominanceCheckResolve';
const DISPATCH_DOMINANCE_CHECK_SETUP = 'dispDominanceCheckSetup';

const DISPATCH_EVENT_RESOLVE_PURCHASED = 'dispEventResolvePurchased';
// const DISPATCH_EVENT_RESOLVE_PLAYER_ACTION = 'dispEventResolvePlayerAction';

// const DISPATCH_IMPACT_ICON_ARMY = 'dispatchImpactArmy';
const DISPATCH_IMPACT_ICON_ECONOMIC = 'dispatchImpactEconomic';
const DISPATCH_IMPACT_ICON_INTELLIGENCE = 'dispatchImpactIntelligence';
const DISPATCH_IMPACT_ICON_MILITARY = 'dispatchImpactMilitary';
const DISPATCH_IMPACT_ICON_LEVERAGE = 'dispatchImpactLeverage';
const DISPATCH_IMPACT_ICON_POLITICAL = 'dispatchImpactPolitical';
const DISPATCH_IMPACT_ICON_ROAD = 'dispatchImpactRoad';
const DISPATCH_IMPACT_ICON_SPY = 'dispatchImpactSpy';
// const DISPATCH_IMPACT_ICON_TRIBE = 'dispatchImpactTribe';
const DISPATCH_PAY_RUPEES_TO_MARKET = 'dispPayRupeesToMarket';

const DISPATCH_PLACE_ARMY = 'distPlaceArmy';
const DISPATCH_PLACE_ROAD = 'dispPlaceRoad';
// const DISPATCH_PLACE_SPY = 'dispPlaceSpy';
const DISPATCH_PLACE_CYLINDER = 'dispPlaceCylinder';

const DISPATCH_OVERTHROW_TRIBE = 'dispatchOverthrowTribe';
const DISPATCH_REFILL_MARKET_DRAW_CARDS = 'dispRefillMarketDraw';
const DISPATCH_REFILL_MARKET_SHIFT_CARDS = 'dispRefillMarketShift';

const DISPATCH_SA_SAFE_HOUSE = 'dispSASafeHouse';

const DISPATCH_TAKE_PRIZE = 'dispTakePrize';
const DISPATCH_TRANSITION = 'dispatchTransition';
const DISPATCH_UPDATE_INFLUENCE = 'dispUpdateInfluence';

const DISPATCH_WAKHAN_ACTIVATE = 'dispWakhanActivate';
const DISPATCH_WAKHAN_ACTIONS = 'dispWakhanActions';
const DISPATCH_WAKHAN_BONUS_ACTION = 'dispWakhanBonusAction';
const DISPATCH_WAKHAN_DRAW_AI_CARD = 'dispWakhanDrawAICard';
const DISPATCH_WAKHAN_SETUP_BONUS_ACTIONS = 'dispWakhanSetupBonusActions';
const DISPATCH_WAKHAN_START_OF_TURN_ABILITIES = 'dispWakhanStartOfTurnAbilities';


const IMPACT_ICON_DISPATCH_MAP = [
  ARMY => DISPATCH_PLACE_ARMY,
  ECONOMIC_SUIT => DISPATCH_IMPACT_ICON_ECONOMIC,
  INTELLIGENCE_SUIT => DISPATCH_IMPACT_ICON_INTELLIGENCE,
  MILITARY_SUIT => DISPATCH_IMPACT_ICON_MILITARY,
  LEVERAGE => DISPATCH_IMPACT_ICON_LEVERAGE,
  POLITICAL_SUIT => DISPATCH_IMPACT_ICON_POLITICAL,
  ROAD => DISPATCH_IMPACT_ICON_ROAD,
  SPY => DISPATCH_IMPACT_ICON_SPY,
  TRIBE => DISPATCH_PLACE_CYLINDER
];

/**
 * 
 */
const USED = 1;
const NOT_USED = 0;

/**
 * Wakhan
 */
const WAKHAN_PLAYER_ID = 1;

const TOP_LEFT = 'topLeft';
const BOTTOM_RIGHT = 'bottomRight';

const BATTLE_HIGHEST_PRIORITY_COURT_CARD_WITH_MOST_SPIES_WHERE_WAKHAN_HAS_SPY = 'battleHighestPriorityCourtCardWithMostSpiesWhereWakhanHasSpy';
const RADICALIZE = 'radicalize';
const RADICALIZE_IF_MILITARY_FAVORED_HIGHEST_RANKED_MILITARY = 'radicalizeIfMilitaryFavoredHighestRankedMilitary'; // wakhan_card_1
const RADICALIZE_IF_POLITICAL_FAVORED_HIGHEST_RANKED_ECONOMIC = 'radicalizeIfPoliticalFavoredHighestRankedEconomic'; // wakhan_card_2
const RADICALIZE_HIGHEST_RANKED_POLITICAL = 'radicalizeHighestRankedPolitical'; // wakhan_card_2
const RADICALIZE_HIGHEST_RANKED_INTELLIGENCE = 'radicalizeHighestRankedIntelligence'; // wakhan_card_3
const RADICALIZE_IF_FEWER_THAN_TWO_RUPEES_RADICALIZE_MOST_NET_RUPEES = 'radicalizeIfFewerThan2RupeesRadicalizeMostNetRupees';
const RADICALIZE_CARD_THAT_GIVES_CONTROL_OF_REGION = 'radicalizeCardThatGivesControlOfRegion';
const RADICALIZE_INTELLIGENCE = 'radicalizeIntelligence';
const RADICALIZE_CARD_THAT_WOULD_PLACE_MOST_BLOCKS = 'radicalizeCardThatWouldPlaceMostBlocks';
const RADICALIZE_IF_NO_DOMINANT_COALITION_CARD_THAT_WOULD_PLACE_MOST_CYLINDERS = 'radicalizeIfNoDominantCoalitionCardThatWouldPlaceMostCylinders';
const RADICALIZE_IF_NO_CARD_WITH_MOVE_CARD_WITH_MOVE_ACTION = 'radicalizeIfNoCardWithMoveCardWithMoveAction';
const RADICALIZE_IF_DOMINANT_COALITION_MATCHING_PATRIOT = 'radicalizeIfDominantCoalitionMatchingPatriot';
const RADICALIZE_IF_COURT_SIZE_AT_LIMIT_HIGHEST_RANKED_POLITICAL = 'radicalizeIfCourtSizeAtLimitHighestRankedPolitical';
const RADICALIZE_IF_FEWER_SPIES_THAN_ANOTHER_PLAYER_HIGHEST_RANKED_INTELLIGENCE = 'radicalizeIfFewerSpiesThanAnotherPlayerHighestRankedIntelligence';


/**
 * Stats
 */
const STAT_PLAYER_TURN_COUNT = 10;
const STAT_ACTION_PURCHASE_CARD = 11;
const STAT_ACTION_PLAY_CARD = 12;
const STAT_ACTION_BATTLE = 13;
const STAT_ACTION_BETRAY = 14;
const STAT_ACTION_BUILD = 15;
const STAT_ACTION_GIFT = 16;
const STAT_ACTION_MOVE = 17;
const STAT_ACTION_TAX = 18;
const STAT_LOYALTY_CHANGE_COUNT = 19;

const STAT_TURN_COUNT = 29;
const STAT_SUCCESSFUL_DOMINANCE_CHECK = 30;
const STAT_UNSUCCESSFUL_DOMINANCE_CHECK = 31;
const STAT_WAKHAN_ENABLED = 32;
const STAT_WAKHAN_WINS = 33;
