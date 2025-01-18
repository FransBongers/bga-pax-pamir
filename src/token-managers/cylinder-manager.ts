class CylinderManager extends CardManager<Cylinder> {
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

  setupDiv(cylinder: Cylinder, div: HTMLElement) {
    div.classList.add('pp_cylinder');
    div.setAttribute('data-color', cylinder.color);
  }

  setupFrontDiv(cylinder: Cylinder, div: HTMLElement) {
    div.classList.add('pp_cylinder_side');
  }

  setupBackDiv(cylinder: Cylinder, div: HTMLElement) {

  }

  isCardVisible(cylinder: Cylinder) {
    return true;
  }
}
