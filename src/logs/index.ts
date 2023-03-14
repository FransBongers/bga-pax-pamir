const LOG_TOKEN_ARMY = 'logTokenArmy';
const LOG_TOKEN_CARD = 'logTokenCard';
const LOG_TOKEN_CARD_LARGE = 'logTokenCardLarge';
const LOG_TOKEN_COALITION = 'logTokenCoalition';
const LOG_TOKEN_FAVORED_SUIT = 'logTokenFavoredSuit';
const LOG_TOKEN_NEW_CARDS = 'logTokenNewCards';
const LOG_TOKEN_ROAD = 'logTokenRoad';
const LOG_TOKEN_SPY = 'logTokenSpy';
const LOG_TOKEN_CYLINDER = 'logTokenCylinder';

const logTokenKeys = [
  LOG_TOKEN_ARMY,
  LOG_TOKEN_CARD,
  LOG_TOKEN_CARD_LARGE,
  LOG_TOKEN_COALITION,
  LOG_TOKEN_FAVORED_SUIT,
  LOG_TOKEN_NEW_CARDS,
  LOG_TOKEN_ROAD,
  LOG_TOKEN_SPY,
  LOG_TOKEN_CYLINDER,
];

const getLogTokenDiv = (key: string, args: Record<string, string | number | Record<string, any>>) => {
  const data = args[key];
  console.log('getLogTokenDiv', key, 'data', data);
  switch (key) {
    case LOG_TOKEN_ARMY:
      return tplLogTokenArmy({ coalition: data as string });
    case LOG_TOKEN_CARD:
      return tplLogTokenCard({ cardId: data as string });
    case LOG_TOKEN_CARD_LARGE:
      return tplLogTokenCard({ cardId: data as string, large: true });
    case LOG_TOKEN_FAVORED_SUIT:
      return tplLogTokenFavoredSuit({ suit: data as string });
    case LOG_TOKEN_CYLINDER:
      return tplLogTokenCylinder({ color: data as string });
    case LOG_TOKEN_COALITION:
      return tplLogTokenCoalition({ coalition: data as string });
    case LOG_TOKEN_NEW_CARDS:
      return tplLogTokenNewCards({ cards: data as { cardId: string }[] });
    case LOG_TOKEN_ROAD:
      return tplLogTokenRoad({ coalition: data as string });
    default:
      return args[key];
  }
};

const tplLogTokenArmy = ({ coalition }: { coalition: string }) => `<div class="pp_${coalition} pp_army pp_log_token"></div>`;

const tplLogTokenCard = ({ cardId, large }: { cardId: string; large?: boolean }) =>
  `<div class="pp_card pp_log_token pp_${cardId}${large ? ' pp_large' : ''}"></div>`;

const tplLogTokenCoalition = ({ coalition }: { coalition: string }) => `<div class="pp_log_token pp_loyalty_icon pp_${coalition}"></div>`;

const tplLogTokenCylinder = ({ color }: { color: string }) => `<div class="pp_cylinder pp_player_color_${color} pp_log_token"></div>`;

const tplLogTokenFavoredSuit = ({ suit }: { suit: string }) => `<div class="pp_log_token pp_impact_icon_suit ${suit}"></div>`;

const tplLogTokenNewCards = ({ cards }: { cards: { cardId: string }[] }) => {
  let newCards = '';
  cards.forEach((card) => {
    newCards += `<div class="pp_card pp_log_token pp_${card.cardId} pp_large" style="display: inline-block; margin-right: 4px;"></div>`;
  });
  return newCards;
};

const tplLogTokenRoad = ({ coalition }: { coalition: string }) => `<div class="pp_${coalition} pp_road pp_log_token"></div>`;
