class RulerTokenManager extends CardManager<RulerToken> {
  constructor(public game: PaxPamirGame) {
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

  setupDiv(token: RulerToken, div: HTMLElement) {
    div.classList.add('pp_ruler_token');
    div.setAttribute('data-region', token.region);
  }

  setupFrontDiv(token: RulerToken, div: HTMLElement) {
    div.classList.add('pp_ruler_token_side');
  }

  setupBackDiv(token: RulerToken, div: HTMLElement) {

  }

  isCardVisible(token: RulerToken) {
    return true;
  }
}
