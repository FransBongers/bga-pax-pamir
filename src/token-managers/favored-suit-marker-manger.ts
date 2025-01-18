class FavoredSuitMarkerManager extends CardManager<Token> {
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

  setupDiv(token: Token, div: HTMLElement) {
    div.classList.add('pp_favored_suit_marker');
  }

  setupFrontDiv(token: Token, div: HTMLElement) {
    div.classList.add('pp_favored_suit_marker_side');
  }

  setupBackDiv(token: Token, div: HTMLElement) {

  }

  isCardVisible(token: Token) {
    return true;
  }
}
