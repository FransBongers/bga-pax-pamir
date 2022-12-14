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

class MarketManager {
  private game: PaxPamirGame;
  private marketCards: Stock[][];
  private marketRupees: Zone[][];

  constructor(game: PaxPamirGame) {
    console.log('MarketManager');
    this.game = game;
    this.marketCards = [];
    this.marketRupees = [];

    // Set up market
    for (let row = 0; row <= 1; row++) {
      this.marketCards[row] = [];
      this.marketRupees[row] = [];
      for (let column = 0; column <= 5; column++) {
        // Set up stock component for each card in the market
        const containerId = `pp_market_${row}_${column}`;
        this.marketCards[row][column] = new ebg.stock();
        setupCardsStock({
          game,
          stock: this.marketCards[row][column],
          nodeId: containerId,
          className: 'pp_market_card',
        });

        // Set up zone for all rupees in the market
        const rupeeContainerId = `pp_market_${row}_${column}_rupees`;
        this.marketRupees[row][column] = new ebg.zone();
        setupTokenZone({
          game,
          zone: this.marketRupees[row][column],
          nodeId: rupeeContainerId,
          tokenWidth: RUPEE_WIDTH,
          tokenHeight: RUPEE_HEIGHT,
          itemMargin: -30,
        });

        // add cards
        const cardInMarket = game.gamedatas.market[row][column];
        if (cardInMarket) {
          placeCard({
            location: this.marketCards[row][column],
            id: cardInMarket.key,
          });
        }
      }
    }

    // Put all rupees in market locations
    Object.keys(game.gamedatas.rupees).forEach((rupeeId) => {
      const rupee = game.gamedatas.rupees[rupeeId];
      if (rupee.location.startsWith('market')) {
        const row = rupee.location.split('_')[1];
        const column = rupee.location.split('_')[2];
        placeToken({
          game,
          location: this.marketRupees[row][column],
          id: rupeeId,
          jstpl: 'jstpl_rupee',
          jstplProps: {
            id: rupeeId,
          },
        });
      }
    });
  }

  getMarketCardsStock({ row, column }: { row: number; column: number }) {
    return this.marketCards[row][column];
  }

  getMarketRupeesZone({ row, column }: { row: number; column: number }) {
    return this.marketRupees[row][column];
  }
}
