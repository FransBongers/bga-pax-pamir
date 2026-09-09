class RupeeManager extends CardManager<Token> {
  constructor(public game: GameAlias) {
    super(game, {
      getId: (card) => `${card.id}`,
      setupDiv: (card, div) => this.setupDiv(card, div),
      setupFrontDiv: (card, div: HTMLElement) => this.setupFrontDiv(card, div),
      setupBackDiv: (card, div: HTMLElement) => this.setupBackDiv(card, div),
      isCardVisible: (card) => this.isCardVisible(card),
      animationManager: game.animationManager,
    });
  }

  clearInterface() {}

  setupDiv(cylinder: Token, div: HTMLElement) {
    div.classList.add('pp_rupee');
    // div.setAttribute('data-color', cylinder.color);
  }

  setupFrontDiv(cylinder: Token, div: HTMLElement) {
    div.classList.add('pp_rupee_side');
  }

  setupBackDiv(cylinder: Token, div: HTMLElement) {}

  isCardVisible(cylinder: Token) {
    return true;
  }
}
