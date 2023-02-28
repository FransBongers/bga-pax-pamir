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

  addTooltipToCard({cardId}: {cardId: string;}): void {
    const cardInfo = this.game.getCardInfo({cardId});
    if (cardInfo.type === 'court_card') {
      const html = tplCourtCardTooltip({cardId, cardInfo, specialAbilities: this.game.gamedatas.specialAbilities,});
      this.game.framework().addTooltipHtml(cardId, html, 1000);
    } else {
      const html = tplEventCardTooltip({cardId, cardInfo});
      this.game.framework().addTooltipHtml(cardId, html, 1000);
    }
  }
}