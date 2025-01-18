class CoalitionBlockManager extends CardManager<CoalitionBlock> {
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

  setupDiv(block: CoalitionBlock, div: HTMLElement) {
    div.classList.add('pp_coalition_block');
    // div.setAttribute('data-type', block.type);
    if (block.id.startsWith('temp')) {
      div.classList.add(PP_TEMPORARY);
    }
  }

  setupFrontDiv(block: CoalitionBlock, div: HTMLElement) {
    div.classList.add('pp_coalition_block_side');
    div.setAttribute('data-coalition', block.coalition);
  }

  setupBackDiv(block: CoalitionBlock, div: HTMLElement) {

  }

  isCardVisible(block: CoalitionBlock) {
    return true;
  }
}
