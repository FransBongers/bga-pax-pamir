//  .########..#######...#######..##.......########.####.########.
//  ....##....##.....##.##.....##.##..........##.....##..##.....##
//  ....##....##.....##.##.....##.##..........##.....##..##.....##
//  ....##....##.....##.##.....##.##..........##.....##..########.
//  ....##....##.....##.##.....##.##..........##.....##..##.......
//  ....##....##.....##.##.....##.##..........##.....##..##.......
//  ....##.....#######...#######..########....##....####.##.......

//  .##.....##....###....##....##....###.....######...########.########.
//  .###...###...##.##...###...##...##.##...##....##..##.......##.....##
//  .####.####..##...##..####..##..##...##..##........##.......##.....##
//  .##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
//  .##.....##.#########.##..####.#########.##....##..##.......##...##..
//  .##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
//  .##.....##.##.....##.##....##.##.....##..######...########.##.....##

class PPTooltipManager {
  private game: PaxPamirGame;

  constructor(game) {
    this.game = game;
  }

  public addTooltipToCard({ cardId, cardIdSuffix = '' }: { cardId: string; cardIdSuffix?: string; }): void {
    const cardInfo = this.game.getCardInfo({ cardId });
    if (cardInfo.type === COURT_CARD) {
      const html = tplCourtCardTooltip({ cardId, cardInfo, specialAbilities: this.game.gamedatas.staticData.specialAbilities });
      this.game.framework().addTooltipHtml(`${cardId}${cardIdSuffix}`, html, 500);
    } else {
      const html = tplEventCardTooltip({ cardId, cardInfo });
      this.game.framework().addTooltipHtml(`${cardId}${cardIdSuffix}`, html, 500);
    }
  }

  // Function for setup of generic tooltips as last step of setup
  public setupTooltips() {
    this.setupCardCounterTooltips();
  }

  private setupCardCounterTooltips() {
    this.game.framework().addTooltip('pp_deck_counter_container', _('Total number of cards in the deck'), '', 500);
    this.game
      .framework()
      .addTooltip('pp_deck_counter_dominance_check_container', _('Number of Dominance Check cards in the deck'), '', 500);
    this.game.framework().addTooltip('pp_discard_pile_counter_container', _('Total number of cards in the discard pile'), '', 500);
    this.game
      .framework()
      .addTooltip('pp_discard_pile_counter_dominance_check_container', _('Number of Dominance Check cards in the discard pile'), '', 500);
  }
}
