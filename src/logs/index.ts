const LOG_TOKEN_ARMY = 'logTokenArmy';
const LOG_TOKEN_CARD = 'logTokenCard';
const LOG_TOKEN_COALITION = 'logTokenCoalition';
const LOG_TOKEN_NEW_CARDS = 'logTokenNewCards';
const LOG_TOKEN_SPY = 'logTokenSpy';
const LOG_TOKEN_TRIBE = 'logTokenTribe';

const logTokenKeys = [LOG_TOKEN_CARD, LOG_TOKEN_COALITION, LOG_TOKEN_NEW_CARDS, LOG_TOKEN_ARMY, LOG_TOKEN_TRIBE, LOG_TOKEN_SPY];

const getLogTokenDiv = (key: string, args: Record<string, string | number | Record<string, any>>) => {
  // console.log('key', key, 'args', args);
  const data = args[key];
  switch (key) {
    case LOG_TOKEN_ARMY:
      return tplLogTokenArmy({ coalition: data as string });
    case LOG_TOKEN_CARD:
      return tplLogTokenCard({ cardId: data as string });
    case LOG_TOKEN_TRIBE:
      return tplLogTokenTribe({ color: data as string });
    case LOG_TOKEN_COALITION:
      return tplLogTokenCoalition({ coalition: data as string });
    case LOG_TOKEN_NEW_CARDS:
      return tplLogTokenNewCards({ cards: data as { cardId: string }[] });
    default:
      return args[key];
  }
};

const tplLogTokenArmy = ({ coalition }: { coalition: string }) => `<div class="pp_${coalition} pp_army pp_log_token"></div>`;

const tplLogTokenCard = ({ cardId }: { cardId: string }) => `<div class="pp_card pp_card_in_log pp_${cardId}"></div>`;

const tplLogTokenCoalition = ({ coalition }: { coalition: string }) =>
  `<div class="pp_icon_log pp_loyalty_icon_log pp_${coalition}"></div>`;

const tplLogTokenTribe = ({ color }: { color: string }) => `<div class="pp_cylinder pp_player_color_${color} pp_log_token"></div>`;

const tplLogTokenNewCards = ({ cards }: { cards: { cardId: string }[] }) => {
  let newCards = '';
  cards.forEach((card) => {
    newCards += `<div class="pp_card pp_card_in_log pp_${card.cardId}" style="display: inline-block; margin-right: 4px;"></div>`;
  });
  return newCards;
};
