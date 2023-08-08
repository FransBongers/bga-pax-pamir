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
  console.log('color', playerColor);
  return dojo.string.substitute(_(string), { ...getKeywords({ playerColor }), ...(args || {}) });
};
