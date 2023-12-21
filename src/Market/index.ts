//  .##.....##....###....########..##....##.########.########
//  .###...###...##.##...##.....##.##...##..##..........##...
//  .####.####..##...##..##.....##.##..##...##..........##...
//  .##.###.##.##.....##.########..#####....######......##...
//  .##.....##.#########.##...##...##..##...##..........##...
//  .##.....##.##.....##.##....##..##...##..##..........##...
//  .##.....##.##.....##.##.....##.##....##.########....##...

class Market {
  private game: PaxPamirGame;
  private marketCards: PaxPamirZone[][];
  private marketRupees: PaxPamirZone[][];

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

    this.marketCards[row][column] = new PaxPamirZone({
      animationManager: this.game.animationManager,
      containerId,
      itemHeight: CARD_HEIGHT,
      itemWidth: CARD_WIDTH,
    });

    // add cards
    const cardInMarket = gamedatas.market.cards[row][column];
    if (cardInMarket) {
      const cardId = cardInMarket.id;
      this.marketCards[row][column].setupItems({ id: cardId, element: tplCard({ cardId, extraClasses: PP_MARKET_CARD }), zIndex: 0 });
      this.game.tooltipManager.addTooltipToCard({ cardId });
    }
  }

  setupMarketRupeeZone({ row, column, gamedatas }: { row: number; column: number; gamedatas: PaxPamirGamedatas }) {
    // Set up zone for all rupees in the market
    const rupeeContainerId = `pp_market_${row}_${column}_rupees`;

    this.marketRupees[row][column] = new PaxPamirZone({
      animationManager: this.game.animationManager,
      containerId: rupeeContainerId,
      itemHeight: RUPEE_HEIGHT,
      itemWidth: RUPEE_WIDTH,
      itemGap: -30,
    });

    const rupees = gamedatas.market.rupees.filter((rupee: Token) => rupee.location === `market_${row}_${column}_rupees`);
    this.marketRupees[row][column].setupItems(
      rupees.map((rupee) => ({ id: rupee.id, element: tplRupee({ rupeeId: rupee.id }), zIndex: 11 }))
    );
  }

  clearInterface() {
    for (let row = 0; row <= 1; row++) {
      for (let column = 0; column <= 5; column++) {
        dojo.empty(this.marketCards[row][column].getContainerId());
        this.marketCards[row][column] = undefined;
        this.marketRupees[row][column] = undefined;
      }
    }
    console.log('marketCards after clearInterface', this.marketCards);
  }

  getMarketCardZone({ row, column }: { row: number; column: number }): PaxPamirZone {
    return this.marketCards[row][column];
  }

  getMarketRupeesZone({ row, column }: { row: number; column: number }): PaxPamirZone {
    return this.marketRupees[row][column];
  }

  setMilitarySuitIndicatorVisible({visible}: {visible: boolean}) {
    const node = document.getElementById('pp_market_board_military_suit_icon');
    if (!node) {
      return;
    }
    if (visible) {
      node.style.opacity = '1';
      this.game.tooltipManager.addMiltiarySuitIndicatorMarketTooltip();
    } else {
      node.style.opacity = '0';
      this.game.tooltipManager.removeMiltiarySuitIndicatorMarketTooltip();
    }
  }

  async removeSingleRupeeFromCard({ row, column, to, rupeeId }: { row: number; column: number; to: string; rupeeId: string }) {
    await this.marketRupees[row][column].removeTo({ id: rupeeId, to });
  }

  async removeRupeesFromCard({ row, column, to }: { row: number; column: number; to: string }): Promise<void> {
    const rupeesToRemove = this.marketRupees[row][column].getItems();
    return this.marketRupees[row][column].removeTo(rupeesToRemove.map((rupee) => ({ id: rupee, to })));
  }

  async placeRupeeOnCard({
    row,
    column,
    rupeeId,
    fromDiv,
    cardId,
  }: {
    row: number;
    column: number;
    rupeeId: string;
    fromDiv: string;
    cardId: string;
  }) {
    await this.marketRupees[row][column].placeInZone({ element: tplRupee({ rupeeId }), id: rupeeId, from: fromDiv, zIndex: 11 });
    if (cardId === ECE_PUBLIC_WITHDRAWAL_CARD_ID) {
      this.marketRupees[row][column].remove({ input: rupeeId, destroy: true });
    }
  }

  async addCardFromDeck({ cardId, to }: { cardId: string; to: MarketLocation }) {
    await this.getMarketCardZone({ row: to.row, column: to.column }).placeInZone(
      {
        element: tplCard({ cardId, extraClasses: PP_MARKET_CARD }),
        id: cardId,
        from: 'pp_market_deck',
      },
      (this.game.animationManager.getSettings().duration || 0) / 2
    );
    this.game.tooltipManager.addTooltipToCard({ cardId });
  }

  /**
   * Move card and all rupees on it.
   */
  async moveCard({ cardId, from, to }: { cardId: string; from: MarketLocation; to: MarketLocation }) {
    const rupeesToMove = this.getMarketRupeesZone({ row: from.row, column: from.column }).getItems();
    const movePromises: Promise<unknown>[] = [
      this.getMarketCardZone({ row: to.row, column: to.column }).moveToZone({
        elements: { id: cardId },
        duration: (this.game.animationManager.getSettings().duration || 0) / 2,
        zIndex: 5,
      }),
    ];
    if (rupeesToMove.length > 0) {
      movePromises.push(
        this.getMarketRupeesZone({ row: to.row, column: to.column }).moveToZone({
          elements: rupeesToMove.map((id) => ({ id })),
          duration: (this.game.animationManager.getSettings().duration || 0) / 2,
          zIndex: 11,
        })
      );
    }
    // const rupeesInDestination = this.getMarketRupeesZone({ row: to.row, column: to.column }).getItems();
    await Promise.all(movePromises);
    const removePromises = [this.getMarketCardZone({ row: from.row, column: from.column }).remove({ input: cardId })];
    if (rupeesToMove.length > 0) {
      movePromises.push(this.getMarketRupeesZone({ row: from.row, column: from.column }).remove({ input: rupeesToMove }));
    }
    await Promise.all(removePromises);
  }

  // Move card to (temp) discard pile
  async discardCard({
    cardId,
    row,
    column,
    to = DISCARD,
  }: {
    cardId: string;
    row: number;
    column: number;
    to?: 'discardPile' | 'tempDiscardPile';
  }) {
    if (to === TEMP_DISCARD) {
      this.game.objectManager.tempDiscardPile.getZone().moveToZone({
        elements: { id: cardId },
        classesToRemove: [PP_MARKET_CARD],
      });
    } else {
      this.game.objectManager.discardPile.discardCardFromZone({
        cardId,
        zone: this.getMarketCardZone({ row, column }),
      });
    }
  }
}
