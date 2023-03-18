//  .##.....##....###....########..##....##.########.########
//  .###...###...##.##...##.....##.##...##..##..........##...
//  .####.####..##...##..##.....##.##..##...##..........##...
//  .##.###.##.##.....##.########..#####....######......##...
//  .##.....##.#########.##...##...##..##...##..........##...
//  .##.....##.##.....##.##....##..##...##..##..........##...
//  .##.....##.##.....##.##.....##.##....##.########....##...

class Market {
  private game: PaxPamirGame;
  private marketCards: Zone[][];
  private marketRupees: Zone[][];

  constructor(game: PaxPamirGame) {
    this.game = game;
    this.marketCards = [];
    this.marketRupees = [];
    const gamedatas = game.gamedatas;

    this.setupMarket({ gamedatas });
  }

  setupMarket({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    console.log('marketCards', this.marketCards);
    // Set up market
    for (let row = 0; row <= 1; row++) {
      if (!this.marketCards[row]) {
        this.marketCards[row] = [];
      }
      if (!this.marketRupees[row]) {
        this.marketRupees[row] = [];
      }
      for (let column = 0; column <= 5; column++) {
        this.setupMarketCardZone({ row, column, gamedatas });
        this.setupMarketRupeeZone({ row, column, gamedatas });
      }
    }
  }

  setupMarketCardZone({ row, column, gamedatas }: { row: number; column: number; gamedatas: PaxPamirGamedatas }) {
    const containerId = `pp_market_${row}_${column}`;
    dojo.place(`<div id="pp_market_${row}_${column}_rupees" class="pp_market_rupees"></div>`, containerId);
    if (this.marketCards[row][column]) {
      this.marketCards[row][column].removeAll();
      // return;
    } else {
      this.marketCards[row][column] = new ebg.zone();
      this.marketCards[row][column].create(this.game, containerId, CARD_WIDTH, CARD_HEIGHT);
    }

    this.marketCards[row][column].instantaneous = true;
    // add cards
    const cardInMarket = gamedatas.market.cards[row][column];
    if (cardInMarket) {
      const cardId = cardInMarket.id;
      dojo.place(tplCard({ cardId, extraClasses: 'pp_market_card' }), this.marketCards[row][column].container_div);
      this.marketCards[row][column].placeInZone(cardId);
      this.game.tooltipManager.addTooltipToCard({ cardId });
    }
    this.marketCards[row][column].instantaneous = false;
  }

  setupMarketRupeeZone({ row, column, gamedatas }: { row: number; column: number; gamedatas: PaxPamirGamedatas }) {
    // Set up zone for all rupees in the market
    const rupeeContainerId = `pp_market_${row}_${column}_rupees`;
    if (this.marketRupees[row][column]) {
      this.marketRupees[row][column].removeAll();
    } else {
      this.marketRupees[row][column] = new ebg.zone();
      setupTokenZone({
        game: this.game,
        zone: this.marketRupees[row][column],
        nodeId: rupeeContainerId,
        tokenWidth: RUPEE_WIDTH,
        tokenHeight: RUPEE_HEIGHT,
        itemMargin: -30,
      });
    }

    this.marketRupees[row][column].instantaneous = true;
    gamedatas.market.rupees
      .filter((rupee: Token) => rupee.location === `market_${row}_${column}_rupees`)
      .forEach((rupee: Token) => {
        dojo.place(tplRupee({ rupeeId: rupee.id }), this.marketRupees[row][column].container_div);
        this.marketRupees[row][column].placeInZone(rupee.id);
      });
    this.marketRupees[row][column].instantaneous = false;
  }

  clearInterface() {
    for (let row = 0; row <= 1; row++) {
      for (let column = 0; column <= 5; column++) {
        dojo.empty(this.marketCards[row][column].container_div);
        this.marketCards[row][column] = undefined;
        this.marketRupees[row][column] = undefined;
      }
    }
    console.log('marketCards after clearInterface', this.marketCards);
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

  placeRupeeOnCard({ row, column, rupeeId, fromDiv }: { row: number; column: number; rupeeId: string; fromDiv: string }) {
    dojo.place(tplRupee({ rupeeId }), fromDiv);
    const div = this.marketRupees[row][column].container_div;
    attachToNewParentNoDestroy(rupeeId, div);
    this.game.framework().slideToObject(rupeeId, div).play();
    this.marketRupees[row][column].placeInZone(rupeeId);
  }

  addCardFromDeck({ cardId, to }: { cardId: string; to: MarketLocation }) {
    dojo.place(tplCard({ cardId, extraClasses: 'pp_market_card' }), 'pp_market_deck');
    const div = this.getMarketCardZone({ row: to.row, column: to.column }).container_div;
    attachToNewParentNoDestroy(cardId, div);
    this.game.framework().slideToObject(cardId, div).play();
    this.getMarketCardZone({ row: to.row, column: to.column }).placeInZone(cardId);
    this.game.tooltipManager.addTooltipToCard({ cardId });
  }

  /**
   * Move card and all rupees on it.
   */
  moveCard({ cardId, from, to }: { cardId: string; from: MarketLocation; to: MarketLocation }) {
    this.game.move({
      id: cardId,
      from: this.getMarketCardZone({ row: from.row, column: from.column }),
      to: this.getMarketCardZone({ row: to.row, column: to.column }),
    });
    // TODO (Frans): check why in case of moving multiple rupees at the same time
    // they overlap
    this.getMarketRupeesZone({ row: from.row, column: from.column })
      .getAllItems()
      .forEach((rupeeId) => {
        this.game.move({
          id: rupeeId,
          to: this.getMarketRupeesZone({ row: to.row, column: to.column }),
          from: this.getMarketRupeesZone({ row: from.row, column: from.row }),
        });
      });
    this.game.tooltipManager.addTooltipToCard({ cardId });
  }

  discardCard({ cardId, row, column }: { cardId: string; row: number; column: number }) {
    // Move card to discard pile
    this.getMarketCardZone({ row, column }).removeFromZone(cardId, false);
    attachToNewParentNoDestroy(cardId, 'pp_discard_pile');
    discardCardAnimation({cardId, game: this.game});
    // this.game.framework().slideToObject(cardId, 'pp_discard_pile').play();
  }
}
