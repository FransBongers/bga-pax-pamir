const placeCard = ({ location, id, order = null }) => {
  if (order != null) {
    location.changeItemsWeight({
      [id]: order,
    });
  }

  location.addToStockWithId(id, id, 'pp_market_deck');

  // this.setupCardSpyZone({location, cardId: id});

  // this.addTooltip( location.getItemDivId(id), id, '' );
};

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

// Function to setup stock components for cards
const setupCardsStock = ({ game, stock, nodeId, className }: { game: Game; stock: Stock; nodeId: string; className?: string }) => {
  const useLargeCards = false;
  stock.create(game, $(nodeId), CARD_WIDTH, CARD_HEIGHT);
  // const backgroundSize = useLargeCards ? '17550px 209px' : '17700px';
  const backgroundSize = useLargeCards ? '11700% 100%' : '11800% 100%';
  stock.image_items_per_row = useLargeCards ? 117 : 118;
  stock.item_margin = 10;
  // TODO: below is option to customize the created div (and add zones to card for example)
  stock.jstpl_stock_item =
    '<div id="${id}" class="stockitem pp_card ' +
    className +
    '" \
              style="top:${top}px;left:${left}px;width:${width}px;height:${height}px;z-index:${position};background-size:' +
    backgroundSize +
    ";\
              background-image:url('${image}');\"></div>";

  Object.keys(game.gamedatas.cards).forEach((cardId) => {
    const cardFileLocation = useLargeCards
      ? g_gamethemeurl + 'img/temp/cards/cards_tileset_original_495_692.jpg'
      : g_gamethemeurl + 'img/temp/cards_medium/cards_tileset_medium_215_300.jpg';
    stock.addItemType(cardId, 0, cardFileLocation, useLargeCards ? Number(cardId.split('_')[1]) - 1 : Number(cardId.split('_')[1]));
  });
  stock.extraClasses = `pp_card ${className}`;
  stock.setSelectionMode(0);
  stock.onItemCreate = dojo.hitch(game, 'setupNewCard');
};

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

const updatePlayerLoyalty = ({ playerId, coalition }) => {
  dojo
    .query(`#loyalty_icon_${playerId}`)
    .removeClass('pp_loyalty_afghan')
    .removeClass('pp_loyalty_british')
    .removeClass('pp_loyalty_russian')
    .addClass(`pp_loyalty_${coalition}`);

  dojo
    .query(`#pp_loyalty_dial_${playerId}`)
    .removeClass('pp_loyalty_afghan')
    .removeClass('pp_loyalty_british')
    .removeClass('pp_loyalty_russian')
    .addClass(`pp_loyalty_${coalition}`);
};
