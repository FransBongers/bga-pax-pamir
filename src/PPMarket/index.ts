//  .##.....##....###....########..##....##.########.########
//  .###...###...##.##...##.....##.##...##..##..........##...
//  .####.####..##...##..##.....##.##..##...##..........##...
//  .##.###.##.##.....##.########..#####....######......##...
//  .##.....##.#########.##...##...##..##...##..........##...
//  .##.....##.##.....##.##....##..##...##..##..........##...
//  .##.....##.##.....##.##.....##.##....##.########....##...

//  .##.....##....###....##....##....###.....######...########.########.
//  .###...###...##.##...###...##...##.##...##....##..##.......##.....##
//  .####.####..##...##..####..##..##...##..##........##.......##.....##
//  .##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
//  .##.....##.#########.##..####.#########.##....##..##.......##...##..
//  .##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
//  .##.....##.##.....##.##....##.##.....##..######...########.##.....##

class PPMarket {
  private game: PaxPamirGame;
  private marketCards: Zone[][];
  private marketRupees: Zone[][];

  constructor(game: PaxPamirGame) {
    this.game = game;
    this.marketCards = [];
    this.marketRupees = [];
    const gamedatas = game.gamedatas;

    // Set up market
    for (let row = 0; row <= 1; row++) {
      this.marketCards[row] = [];
      this.marketRupees[row] = [];
      for (let column = 0; column <= 5; column++) {
        this.setupMarketCardZone({ row, column, gamedatas });
        this.setupMarketRupeeZone({ row, column, gamedatas });
      }
    }
  }

  setupMarketCardZone({ row, column, gamedatas }: { row: number; column: number; gamedatas: PaxPamirGamedatas }) {
    const containerId = `pp_market_${row}_${column}`;
    this.marketCards[row][column] = new ebg.zone();
    this.marketCards[row][column].create(this.game, containerId, CARD_WIDTH, CARD_HEIGHT);
    this.marketCards[row][column].instantaneous = true;

    // add cards
    const cardInMarket = gamedatas.market[row][column];
    if (cardInMarket) {
      dojo.place(tplCard({ cardId: cardInMarket.id, extraClasses: 'pp_market_card' }), this.marketCards[row][column].container_div);
      this.marketCards[row][column].placeInZone(cardInMarket.id);
    }
    this.marketCards[row][column].instantaneous = false;
  }

  setupMarketRupeeZone({ row, column, gamedatas }: { row: number; column: number; gamedatas: PaxPamirGamedatas }) {
    // Set up zone for all rupees in the market
    const rupeeContainerId = `pp_market_${row}_${column}_rupees`;
    this.marketRupees[row][column] = new ebg.zone();
    setupTokenZone({
      game: this.game,
      zone: this.marketRupees[row][column],
      nodeId: rupeeContainerId,
      tokenWidth: RUPEE_WIDTH,
      tokenHeight: RUPEE_HEIGHT,
      itemMargin: -30,
    });
    this.marketRupees[row][column].instantaneous = true;
    gamedatas.rupees
      .filter((rupee: Token) => rupee.location === `market_${row}_${column}_rupees`)
      .forEach((rupee: Token) => {
        this.placeRupeeSetup({ row, column, rupeeId: rupee.id, fromDiv: this.marketRupees[row][column].container_div, setup: true });
      });
    this.marketRupees[row][column].instantaneous = false;
  }

  getMarketCardZone({ row, column }: { row: number; column: number }): Zone {
    return this.marketCards[row][column];
  }

  getMarketRupeesZone({ row, column }: { row: number; column: number }): Zone {
    return this.marketRupees[row][column];
  }

  removeRupeesFromCard({ row, column, to }: { row: number; column: number; to: string }) {
    this.marketRupees[row][column].getAllItems().forEach((rupeeId) => {
      this.marketRupees[row][column].removeFromZone(rupeeId, true, to);
    });
  }

  placeRupeeSetup({
    row,
    column,
    rupeeId,
    fromDiv,
    setup = false,
  }: {
    row: number;
    column: number;
    rupeeId: string;
    fromDiv: string;
    setup?: boolean;
  }) {
    // TODO (chech why this does not slide from player player panel in case fromDiv is panelId)
    dojo.place(tplRupee({ rupeeId }), fromDiv);
    this.marketRupees[row][column].placeInZone(rupeeId);
  }

  placeRupeeOnCard({ row, column, rupeeId, fromDiv }: { row: number; column: number; rupeeId: string; fromDiv: string }) {
    dojo.place(tplRupee({ rupeeId }), fromDiv);
    const div = this.marketRupees[row][column].container_div;
    attachToNewParentNoDestroy(rupeeId , div);
    this.game.framework().slideToObject(rupeeId, div).play();
    this.marketRupees[row][column].placeInZone(rupeeId);
  }
}
