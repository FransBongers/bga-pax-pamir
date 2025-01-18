const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const debug = isDebug ? console.info.bind(window.console) : () => {};

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getKeywords = ({ playerColor = '#000' }: { playerColor?: string }) => {
  return {
    you: '${you}',
    playerName: `<span style="font-weight:bold;color:#${playerColor};">\${playerName}</span>`,
    herat: '<div class="pp_keyword_token pp_herat_icon"></div>',
    kabul: '<div class="pp_keyword_token pp_kabul_icon"></div>',
    kandahar: '<div class="pp_keyword_token pp_kandahar_icon"></div>',
    persia: '<div class="pp_keyword_token pp_persia_icon"></div>',
    punjab: '<div class="pp_keyword_token pp_punjab_icon"></div>',
    transcaspia: '<div class="pp_keyword_token pp_transcaspia_icon"></div>',
  };
};

const substituteKeywords = ({
  string,
  args,
  playerColor,
}: {
  string: string;
  // use args to substitute strings that are not keywords
  args?: Record<string, string | number>;
  playerColor?: string;
}) => {
  return dojo.string.substitute(_(string), { ...getKeywords({ playerColor }), ...(args || {}) });
};

const extractId = (input: { id: string }): string => {
  return input.id;
};

const getArmy = (token: Token): CoalitionBlock => ({
  ...token,
  coalition: token.id.split('_')[1] as Coalition,
  type: 'army',
});

const getRoad = (token: Token): CoalitionBlock => ({
  ...token,
  coalition: token.id.split('_')[1] as Coalition,
  type: 'road',
});

const pxNumber = (px?: string): number => {
  if ((px || '').endsWith('px')) {
    return Number(px.slice(0, -2));
  } else {
    return 0;
  }
}

const getCoalitionForBlock = (coalitionBlockId: string): Coalition => coalitionBlockId.split('_')[1] as Coalition;