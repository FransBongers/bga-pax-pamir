const LOG_TOKEN_ARMY = 'army';
const LOG_TOKEN_CARD = 'card';
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

const getLogTokenDiv = ({ logToken, game }: { logToken: string; game: PaxPamirGame }) => {
  const [type, data] = logToken.split(':');
  switch (type) {
    case LOG_TOKEN_ARMY:
      return tplLogTokenArmy({ coalition: data });
    case LOG_TOKEN_CARD:
      return tplLogTokenCard({ cardId: data });
    case LOG_TOKEN_LARGE_CARD:
      return tplLogTokenCard({ cardId: data, large: true });
    case LOG_TOKEN_CARD_NAME:
      return tlpLogTokenBoldText({ text: data });
    case LOG_TOKEN_FAVORED_SUIT:
      return tplLogTokenFavoredSuit({ suit: data });
    case LOG_TOKEN_CYLINDER:
      return tplLogTokenCylinder({ color: game.playerManager.getPlayer({ playerId: Number(data) }).getColor() });
    case LOG_TOKEN_COALITION:
      return tplLogTokenCoalition({ coalition: data });
    case LOG_TOKEN_COALITION_NAME:
      return tlpLogTokenBoldText({ text: game.gamedatas.staticData.loyalty[data].name });
    case LOG_TOKEN_LEVERAGE:
      return tplLogTokenLeverage();
    case LOG_TOKEN_NEW_LINE:
      return '<br>';
    case LOG_TOKEN_PLAYER_NAME:
      const player = game.playerManager.getPlayer({ playerId: Number(data) });
      return tplLogTokenPlayerName({ name: player.getName(), color: player.getColor() });
    case LOG_TOKEN_REGION_NAME:
      return tplLogTokenRegionName({ name: game.gamedatas.staticData.regions[data].name, regionId: data });
    case LOG_TOKEN_ROAD:
      return tplLogTokenRoad({ coalition: data });
    case LOG_TOKEN_RUPEE:
      return tplLogTokenRupee();
    default:
      return type;
  }
};

const tplLogTokenArmy = ({ coalition }: { coalition: string }) => `<div class="pp_${coalition} pp_army pp_log_token"></div>`;

const tlpLogTokenBoldText = ({ text }) => `<span style="font-weight: 700;">${_(text)}</span>`;

const tplLogTokenCard = ({ cardId, large }: { cardId: string; large?: boolean }) =>
  `<div class="pp_card pp_log_token pp_${cardId}${large ? ' pp_large' : ''}"></div>`;

const tplLogTokenCoalition = ({ coalition }: { coalition: string }) => `<div class="pp_log_token pp_loyalty_icon pp_${coalition}"></div>`;

const tplLogTokenCylinder = ({ color }: { color: string }) => `<div class="pp_cylinder pp_player_color_${color} pp_log_token"></div>`;

const tplLogTokenFavoredSuit = ({ suit }: { suit: string }) => `<div class="pp_log_token pp_impact_icon_suit ${suit}"></div>`;

const tplLogTokenLeverage = () => `<div class="pp_leverage pp_log_token"></div>`;

const tplLogTokenNewCards = ({ cards }: { cards: { cardId: string }[] }) => {
  let newCards = '';
  cards.forEach((card) => {
    newCards += `<div class="pp_card pp_log_token pp_${card.cardId} pp_large" style="display: inline-block; margin-right: 4px;"></div>`;
  });
  return newCards;
};

const tplLogTokenPlayerName = ({ name, color }: { name: string; color: string }) =>
  `<span class="playername" style="color:#${color};">${name}</span>`;

const tplLogTokenRegionName = ({ name, regionId }: { name: string; regionId: string }) =>
  `<div style="display: inline-block;"><span style="font-weight: 700;">${_(
    name
  )}</span><div class="pp_log_token pp_${regionId} pp_region_icon"></div></div>`;

const tplLogTokenRoad = ({ coalition }: { coalition: string }) => `<div class="pp_${coalition} pp_road pp_log_token"></div>`;

const tplLogTokenRupee = () => `<div class="pp_log_token_rupee pp_log_token"></div>`;
