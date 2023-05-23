// Client states
const CLIENT_CARD_ACTION_BATTLE = 'clientCardActionBattle';
const CLIENT_CARD_ACTION_BETRAY = 'clientCardActionBetray';
const CLIENT_CARD_ACTION_BUILD = 'clientCardActionBuild';
const CLIENT_CARD_ACTION_GIFT = 'clientCardActionGift';
const CLIENT_CARD_ACTION_MOVE = 'clientCardActionMove';
const CLIENT_CARD_ACTION_TAX = 'clientCardActionTax';
const CLIENT_PLAY_CARD = 'clientPlayCard';
const CLIENT_PURCHASE_CARD = 'clientPurchaseCard';

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
 * Card actions types
 */
 const TYPE_BATTLE = 'battle';
 const TYPE_BETRAY = 'betray';
 const TYPE_BUILD = 'build';
 const TYPE_GIFT = 'gift';
 const TYPE_MOVE = 'move';
 const TYPE_TAX = 'tax';

 const CARD_ACTIONS_WITH_COST = [TYPE_BETRAY,TYPE_BUILD,TYPE_GIFT];
 const CARD_ACTIONS_WITHOUT_COST = [TYPE_BATTLE,TYPE_MOVE,TYPE_TAX];

 /**
  * Class names
  */
 const PP_SELECTABLE = 'pp_selectable';
 const PP_SELECTED = 'pp_selected';