const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getTokenDiv = (key: string, args: Record<string, string | number | Record<string, any>>) => {
  // console.log('key', key, 'args', args);
  const data = args[key];
  switch(key) {
    case 'card_log':
      return `<div class="pp_card pp_card_in_log pp_${data}"></div>`
    case 'coalition_log_token':
      return `<div class="pp_icon_log pp_loyalty_icon_log pp_${data}"></div>`
    case 'new_cards_log':
      let newCards = '';
      (data as any[]).forEach((card) => {
        newCards += `<div class="pp_card pp_card_in_log pp_${card.cardId}" style="display: inline-block; margin-right: 4px;"></div>`
      })
      return newCards
    default:
      return args[key]
  }
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

// const placeCard = ({ location, id, order = null }) => {
//   if (order != null) {
//     location.changeItemsWeight({
//       [id]: order,
//     });
//   }

//   location.addToStockWithId(id, id, 'pp_market_deck');

//   // this.setupCardSpyZone({location, cardId: id});

//   // this.addTooltip( location.getItemDivId(id), id, '' );
// };

// TODO(Frans): detereming jstpl based on id?
const placeToken = ({
  game,
  location,
  id,
  jstpl,
  jstplProps,
  weight = 0,
  classes = [],
  from = null,
}: {
  game: PaxPamirGame;
  location: Zone;
  id: string;
  jstpl: string;
  jstplProps: Record<string, unknown>;
  weight?: number;
  classes?: string[];
  from?: string | null; // TODO (Frans): this is defined as action. Check what this actually does
}) => {
  // console.log('from', from)
  dojo.place(game.framework().format_block(jstpl, jstplProps), from || 'pp_supply');
  classes.forEach((className) => {
    dojo.addClass(id, className);
  });
  location.placeInZone(id, weight);
};

// // Function to setup stock components for cards
// const setupCardsStock = ({ game, stock, nodeId, className }: { game: Game; stock: Stock; nodeId: string; className?: string }) => {
//   const useLargeCards = false;
//   stock.create(game, $(nodeId), CARD_WIDTH, CARD_HEIGHT);
//   // const backgroundSize = useLargeCards ? '17550px 209px' : '17700px';
//   const backgroundSize = useLargeCards ? '11700% 100%' : '11800% 100%';
//   stock.image_items_per_row = useLargeCards ? 117 : 118;
//   stock.item_margin = 10;
//   // TODO: below is option to customize the created div (and add zones to card for example)
//   stock.jstpl_stock_item =
//     '<div id="${id}" class="stockitem pp_card ' +
//     className +
//     '" \
//               style="top:${top}px;left:${left}px;width:${width}px;height:${height}px;z-index:${position};background-size:' +
//     backgroundSize +
//     ";\
//               background-image:url('${image}');\"></div>";

//   Object.keys(game.gamedatas.cards).forEach((cardId) => {
//     const cardFileLocation = useLargeCards
//       ? g_gamethemeurl + 'img/temp/cards/cards_tileset_original_495_692.jpg'
//       : g_gamethemeurl + 'img/temp/cards_medium/cards_tileset_medium_215_300.jpg';
//     stock.addItemType(cardId, 0, cardFileLocation, useLargeCards ? Number(cardId.split('_')[1]) - 1 : Number(cardId.split('_')[1]));
//   });
//   stock.extraClasses = `pp_card ${className}`;
//   stock.setSelectionMode(0);
//   stock.onItemCreate = dojo.hitch(game, 'setupNewCard');
// };

// Function to set up zones for tokens (armies, tribes, cylinders etc.)
const setupTokenZone = ({
  game,
  zone,
  nodeId,
  tokenWidth,
  tokenHeight,
  itemMargin = null,
  instantaneous = false,
  pattern = null,
  customPattern = null,
}: {
  game: PaxPamirGame;
  zone: Zone;
  nodeId: string;
  tokenWidth: number;
  tokenHeight: number;
  itemMargin?: number | null;
  instantaneous?: boolean;
  pattern?: string | null;
  customPattern?: null | Zone['itemIdToCoords'];
}) => {
  zone.create(game, nodeId, tokenWidth, tokenHeight);
  if (itemMargin) {
    zone.item_margin = itemMargin;
  }
  zone.instantaneous = instantaneous;
  if (pattern) {
    zone.setPattern(pattern);
  }
  if (pattern == 'custom' && customPattern) {
    zone.itemIdToCoords = customPattern;
  }
};
