// Client states
const CLIENT_CARD_ACTION_BATTLE = 'clientCardActionBattle';
const CLIENT_CARD_ACTION_BETRAY = 'clientCardActionBetray';
const CLIENT_CARD_ACTION_BUILD = 'clientCardActionBuild';
const CLIENT_CARD_ACTION_GIFT = 'clientCardActionGift';
const CLIENT_CARD_ACTION_MOVE = 'clientCardActionMove';
const CLIENT_CARD_ACTION_TAX = 'clientCardActionTax';
const CLIENT_INITIAL_BRIBE_CHECK = 'clientInitialBribeCheck';
const CLIENT_PLAY_CARD = 'clientPlayCard';
const CLIENT_PURCHASE_CARD = 'clientPurchaseCard';
const CLIENT_RESOLVE_EVENT_CONFIDENCE_FAILURE = 'clientResolveConfidenceFailure';
const CLIENT_RESOLVE_EVENT_OTHER_PERSUASIVE_METHODS = 'clientResolveEventOtherPersuasiveMethods';
const CLIENT_RESOLVE_EVENT_PASHTUNWALI_VALUES = 'clientResolveEventPashtunwaliValues';
const CLIENT_RESOLVE_EVENT_REBUKE = 'clientResolveEventRebuke';
const CLIENT_RESOLVE_EVENT_RUMOR = 'clientResolveEventRumor';

/**
 * Action
 */
// default actions
const PLAY_CARD = 'playCard';
const PURCHASE_CARD = 'purchaseCard';
// card actions
const BATTLE = 'battle';
const BETRAY = 'betray';
const BUILD = 'build';
const GIFT = 'gift';
const MOVE = 'move';
const TAX = 'tax';

const CARD_ACTIONS_WITH_COST = [BETRAY, BUILD, GIFT];
const CARD_ACTIONS_WITHOUT_COST = [BATTLE, MOVE, TAX];

const cardActionClientStateMap = {
  [BATTLE]: CLIENT_CARD_ACTION_BATTLE,
  [BETRAY]: CLIENT_CARD_ACTION_BETRAY,
  [BUILD]: CLIENT_CARD_ACTION_BUILD,
  [GIFT]: CLIENT_CARD_ACTION_GIFT,
  [MOVE]: CLIENT_CARD_ACTION_MOVE,
  [TAX]: CLIENT_CARD_ACTION_TAX,
};

/**
 * Locations
 */
const ACTIVE_EVENTS = 'activeEvents';
const DISCARD = 'discardPile';
const TEMP_DISCARD = 'tempDiscardPile';
const HAND = 'hand';
const COURT = 'court';

const discardMap = {
  [DISCARD]: 'pp_pile_discarded_card',
  [TEMP_DISCARD]: 'pp_temp_discarded_card',
};
// const PLAYER_EVENTS = 'playerEvents';

// size of tokens
const CARD_WIDTH = 150;
const CARD_HEIGHT = 209;
const ARMY_HEIGHT = 40;
const ARMY_WIDTH = 25;
const COALITION_BLOCK_HEIGHT = 40;
const COALITION_BLOCK_WIDTH = 25;
const ROAD_HEIGHT = 27;
const ROAD_WIDTH = 40;
const TRIBE_WIDTH = 25;
const TRIBE_HEIGHT = 25;
const RUPEE_WIDTH = 50;
const RUPEE_HEIGHT = 50;
const CYLINDER_WIDTH = 30;
const CYLINDER_HEIGHT = 30;
const FAVORED_SUIT_MARKER_WIDTH = 22;
const FAVORED_SUIT_MARKER_HEIGHT = 50;
const RULER_TOKEN_WIDTH = 50;
const RULER_TOKEN_HEIGHT = 50;

// names etc.

// card types
const EVENT_CARD = 'eventCard';
const COURT_CARD = 'courtCard';

// suits
const ECONOMIC = 'economic';
const MILITARY = 'military';
const POLITICAL = 'political';
const INTELLIGENCE = 'intelligence';

const SUITS: ( 'economic' | 'intelligence' | 'military' | 'political')[] = [POLITICAL, INTELLIGENCE, ECONOMIC, MILITARY];

// coalitions
const AFGHAN = 'afghan';
const BRITISH = 'british';
const RUSSIAN = 'russian';

const COALITIONS = [AFGHAN, BRITISH, RUSSIAN];

// regions
const HERAT = 'herat';
const KABUL = 'kabul';
const KANDAHAR = 'kandahar';
const PERSIA = 'persia';
const PUNJAB = 'punjab';
const TRANSCASPIA = 'transcaspia';

const REGIONS = [HERAT, KABUL, KANDAHAR, PERSIA, PUNJAB, TRANSCASPIA];

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

const BORDERS = [
  HERAT_KABUL,
  HERAT_KANDAHAR,
  HERAT_PERSIA,
  HERAT_TRANSCASPIA,
  KABUL_KANDAHAR,
  KABUL_PUNJAB,
  KABUL_TRANSCASPIA,
  KANDAHAR_PUNJAB,
  PERSIA_TRANSCASPIA,
];

// impact icons
const IMPACT_ICON_ROAD = 'road';
const IMPACT_ICON_ARMY = 'army';
const IMPACT_ICON_LEVERAGE = 'leverage';
const IMPACT_ICON_SPY = 'spy';
const IMPACT_ICON_TRIBE = 'tribe';
const IMPACT_ICON_ECONOMIC_SUIT = 'economic';
const IMPACT_ICON_MILITARY_SUIT = 'military';
const IMPACT_ICON_POLITICAL_SUIT = 'political';
const IMPACT_ICON_INTELLIGENCE_SUIT = 'intelligence';

/**
 * Class names
 */
const PP_SELECTABLE = 'pp_selectable';
const PP_SELECTED = 'pp_selected';
const PP_CARD_IN_HAND = 'pp_card_in_hand';
const PP_CARD_IN_ZONE = 'pp_card_in_zone';
const PP_MARKET_CARD = 'pp_market_card';
const PP_ARMY = 'pp_army';
const PP_PRIZE = 'pp_prize';
const PP_ROAD = 'pp_road';
const PP_COALITION_BLOCK = 'pp_coalition_block';
const PP_TEMPORARY = 'pp_temporary';
const PP_AFGHAN = 'pp_afghan';
const PP_BRITISH = 'pp_british';
const PP_RUSSIAN = 'pp_russian';

/**
 * Events
 */
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
const ECE_PUBLIC_WITHDRAWAL_CARD_ID = 'card_111';
const ECE_REBUKE = 'rebuke';
const ECE_RIOTS_IN_HERAT = 'riotsInHerat';
const ECE_RIOTS_IN_KABUL = 'riotsInKabul';
const ECE_RIOTS_IN_PERSIA = 'riotsInPersia';
const ECE_RIOTS_IN_PUNJAB = 'riotsInPunjab';
const ECE_RUMOR = 'rumor';
const ECE_RUMOR_CARD_ID = 'card_108';

/**
 * Special abilities
 */
const SA_INDISPENSABLE_ADVISORS = 'indispensableAdvisors'; // card_1
const SA_INSURRESCTION = 'insurrection'; // card_3
const SA_CLAIM_OF_ANCIENT_LINEAGE = 'claimOfAncientLineage'; // card_5
const SA_BODYGUARDS = 'bodyguards'; // card_15 card_83
const SA_CITADEL_KABUL = 'citadelKabul'; // card_17
const SA_CITADEL_TRANSCASPIA = 'citadelTranscaspia'; // card_97
const SA_STRANGE_BEDFELLOWS = 'strangeBedfellows'; // card_21
const SA_CIVIL_SERVICE_REFORMS = 'civilServiceReforms'; // card_24
const SA_SAFE_HOUSE = 'safeHouse'; // card_41 card_72
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
 * Wakhan
 */
const WAKHAN_PLAYER_ID = 1;

const TOP_LEFT = 'topLeft';
const BOTTOM_RIGHT = 'bottomRight';

const BATTLE_HIGHEST_PRIORITY_COURT_CARD_WITH_MOST_SPIES_WHERE_WAKHAN_HAS_SPY =
  'battleHighestPriorityCourtCardWithMostSpiesWhereWakhanHasSpy';
const RADICALIZE = 'radicalize';
const RADICALIZE_IF_MILITARY_FAVORED_HIGHEST_RANKED_MILITARY = 'radicalizeIfMilitaryFavoredHighestRankedMilitary'; // wakhan_card_1
const RADICALIZE_IF_POLITICAL_FAVORED_HIGHEST_RANKED_ECONOMIC = 'radicalizeIfPoliticalFavoredHighestRankedEconomic'; // wakhan_card_2
const RADICALIZE_HIGHEST_RANKED_POLITICAL = 'radicalizeHighestRankedPolitical'; // wakhan_card_2
const RADICALIZE_HIGHEST_RANKED_INTELLIGENCE = 'radicalizeHighestRankedIntelligence'; // wakhan_card_3
const RADICALIZE_IF_FEWER_THAN_TWO_RUPEES_RADICALIZE_MOST_NET_RUPEES = 'radicalizeIfFewerThan2RupeesRadicalizeMostNetRupees';
const RADICALIZE_CARD_THAT_GIVES_CONTROL_OF_REGION = 'radicalizeCardThatGivesControlOfRegion';
const RADICALIZE_INTELLIGENCE = 'radicalizeIntelligence';
const RADICALIZE_CARD_THAT_WOULD_PLACE_MOST_BLOCKS = 'radicalizeCardThatWouldPlaceMostBlocks';
const RADICALIZE_IF_NO_DOMINANT_COALITION_CARD_THAT_WOULD_PLACE_MOST_CYLINDERS =
  'radicalizeIfNoDominantCoalitionCardThatWouldPlaceMostCylinders';
const RADICALIZE_IF_NO_CARD_WITH_MOVE_CARD_WITH_MOVE_ACTION = 'radicalizeIfNoCardWithMoveCardWithMoveAction';
const RADICALIZE_IF_DOMINANT_COALITION_MATCHING_PATRIOT = 'radicalizeIfDominantCoalitionMatchingPatriot';
const RADICALIZE_IF_COURT_SIZE_AT_LIMIT_HIGHEST_RANKED_POLITICAL = 'radicalizeIfCourtSizeAtLimitHighestRankedPolitical';
const RADICALIZE_IF_FEWER_SPIES_THAN_ANOTHER_PLAYER_HIGHEST_RANKED_INTELLIGENCE =
  'radicalizeIfFewerSpiesThanAnotherPlayerHighestRankedIntelligence';


/**
 * Influence types (used in frontend for notifs)
 */
const PLAYER_INFLUENCE = 'playerInfluence';
const WAKHAN_INFLUENCE = 'wakhanInfluence';
