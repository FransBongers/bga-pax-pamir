// Interface steps
const CARD_ACTION_BATTLE = 'cardActionBattle';
const CARD_ACTION_BETRAY = 'cardActionBetray';
const CARD_ACTION_BUILD = 'cardActionBuild';
const CARD_ACTION_GIFT = 'cardActionGift';
const CARD_ACTION_MOVE = 'cardActionMove';
const CARD_ACTION_TAX = 'cardActionTax';
const CHOOSE_LOYALTY = 'chooseLoyalty';
const CONFIRM_PLACE_SPY = 'confirmPlaceSpy';
const CONFIRM_PLAY = 'confirmPlay';
const CONFIRM_PURCHASE = 'confirmPurchase';
const CONFIRM_SELECT_GIFT = 'confirmSelectGift';
const DISCARD_COURT = 'discardCourt';
const DISCARD_HAND = 'discardHand';
const PLACE_ROAD = 'placeRoad';
const PLACE_SPY = 'placeSpy';
const PASS = 'pass';
const PLAYER_ACTIONS = 'playerActions';


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
