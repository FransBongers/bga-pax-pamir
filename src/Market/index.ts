//  .##.....##....###....########..##....##.########.########
//  .###...###...##.##...##.....##.##...##..##..........##...
//  .####.####..##...##..##.....##.##..##...##..........##...
//  .##.###.##.##.....##.########..#####....######......##...
//  .##.....##.#########.##...##...##..##...##..........##...
//  .##.....##.##.....##.##....##..##...##..##..........##...
//  .##.....##.##.....##.##.....##.##....##.########....##...

class Market {
  private game: PaxPamirGame;
  private marketCards: LineStock<Card>[][];
  private marketRupees: LineStock<Token>[][];
  private deck: LineStock<Card>;

  constructor(game: PaxPamirGame) {
    this.game = game;
    this.marketCards = [];
    this.marketRupees = [];
    const gamedatas = game.gamedatas;

    this.setupMarket({ gamedatas });
    this.setupDeck();
  }

  setupDeck() {
    this.deck = new LineStock<Card>(this.game.cardManager, document.getElementById('pp_market_deck_stock'));
  }

  setupMarket({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
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

    this.marketCards[row][column] = new LineStock(this.game.cardManager, document.getElementById(`pp_market_${row}_${column}`));

    // add cards
    const cardInMarket = gamedatas.market.cards[row][column];
    if (cardInMarket) {
      this.marketCards[row][column].addCard(cardInMarket);
    }
  }

  setupMarketRupeeZone({ row, column, gamedatas }: { row: number; column: number; gamedatas: PaxPamirGamedatas }) {
    // Set up zone for all rupees in the market
    const rupeeContainerId = `pp_market_${row}_${column}_rupees`;

    this.marketRupees[row][column] = new LineStock<Token>(this.game.rupeeManager, document.getElementById(rupeeContainerId), {
      center: false,
      gap: `calc(var(--tokenScale) * -30px)`,
    });

    const rupees = gamedatas.market.rupees.filter((rupee: Token) => rupee.location === `market_${row}_${column}_rupees`);
    this.marketRupees[row][column].addCards(rupees);
  }

  clearInterface() {
    for (let row = 0; row <= 1; row++) {
      for (let column = 0; column <= 5; column++) {
        this.marketCards[row][column].removeAll();
        this.marketRupees[row][column].removeAll();
        // dojo.empty(this.marketCards[row][column].getContainerId());
        this.marketCards[row][column] = undefined;
        this.marketRupees[row][column] = undefined;
      }
    }
    this.deck.removeAll();
  }

  getMarketCardZone({ row, column }: { row: number; column: number }): LineStock<Card> {
    return this.marketCards[row][column];
  }

  getMarketRupeesZone({ row, column }: { row: number; column: number }): LineStock<Token> {
    return this.marketRupees[row][column];
  }

  setMilitarySuitIndicatorVisible({ visible }: { visible: boolean }) {
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

  async removeSingleRupeeFromCard({
    row,
    column,
    to,
    rupeeId,
    index,
  }: {
    row: number;
    column: number;
    to: string;
    rupeeId: string;
    index?: number;
  }) {
    await this.game.framework().wait(index * ANIMATION_WAIT_MS);
    // TODO: animate to
    const element = document.getElementById(rupeeId);

    await moveToAnimation({
      game: this.game,
      element,
      toId: to,
      remove: true,
    });
    await this.marketRupees[row][column].removeCard({ id: rupeeId, state: 0, used: 0, location: '' });
  }

  async removeRupeesFromCard({ row, column, to }: { row: number; column: number; to: string }): Promise<void> {
    const rupees = this.marketRupees[row][column].getCards().reverse();
    await Promise.all(rupees.map((rupee, index) => this.removeSingleRupeeFromCard({ row, column, to, rupeeId: rupee.id, index })));
  }

  async placeRupeeOnCard({
    row,
    column,
    rupeeId,
    fromDiv,
    cardId,
    index = 0,
  }: {
    row: number;
    column: number;
    rupeeId: string;
    fromDiv: string;
    cardId: string;
    index?: number;
  }) {
    const rupee = {
      id: rupeeId,
      state: 0,
      used: 0,
      location: '',
    };
    await this.game.framework().wait(index * ANIMATION_WAIT_MS);
    await this.marketRupees[row][column].addCard(rupee, { fromElement: document.getElementById(fromDiv) });
    if (cardId === ECE_PUBLIC_WITHDRAWAL_CARD_ID) {
      await this.marketRupees[row][column].removeCard(rupee);
    }
  }

  async addCardFromDeck({ card: cardInfo, to }: { card: CardStaticData; to: MarketLocation }) {
    const card = {
      ...cardInfo,
      state: 0,
      used: 0,
      location: 'deck',
    };
    await this.deck.addCard(card);
    card.location = `market_${to.row}_${to.column}`;

    await this.getMarketCardZone({ row: to.row, column: to.column }).addCard(card);
  }

  /**
   * Move card and all rupees on it.
   */
  async moveCard({ card, from, to }: { card: CardStaticData; from: MarketLocation; to: MarketLocation }) {
    const rupeesToMove = this.getMarketRupeesZone({ row: from.row, column: from.column }).getCards();
    const movePromises: Promise<unknown>[] = [
      // TODO: keep zIndex lower for rupees?
      this.getMarketCardZone({ row: to.row, column: to.column }).addCard({
        ...card,
        state: 0,
        used: 0,
        location: `market_${to.row}_${to.column}`,
      }),
    ];
    if (rupeesToMove.length > 0) {
      movePromises.push(this.getMarketRupeesZone({ row: to.row, column: to.column }).addCards(rupeesToMove));
    }
    // const rupeesInDestination = this.getMarketRupeesZone({ row: to.row, column: to.column }).getItems();
    await Promise.all(movePromises);
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
      this.game.objectManager.tempDiscardPile.getZone().addCard(
        this.game.getCard({
          id: cardId,
          state: 0,
          used: 0,
          location: `market_${row}_${column}`,
        })
      );
    } else {
      this.game.objectManager.discardPile.discardCardFromZone(cardId);
    }
  }
}
