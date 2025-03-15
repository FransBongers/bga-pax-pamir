class PPCardManager extends CardManager<Card> {
  constructor(public game: PaxPamirGame) {
    super(game, {
      getId: (card) => card.id,
      setupDiv: (card, div) => this.setupDiv(card, div),
      setupFrontDiv: (card, div: HTMLElement) => this.setupFrontDiv(card, div),
      setupBackDiv: (card, div: HTMLElement) => this.setupBackDiv(card, div),
      isCardVisible: (card) => this.isCardVisible(card),
      animationManager: game.animationManager,
    });
  }

  clearInterface() {}

  setupDiv(card: Card, div: HTMLElement) {
    if (card.type === 'courtCard') {
      const { actions, region, id } = card;

      div.classList.add(`pp_${region}`);

      Object.keys(actions).forEach((action, index) => {
        const actionId = action + '_' + id;
        dojo.place(
          `<div id="${actionId}" class="pp_card_action" style="left: calc(var(--cardScale) * ${actions[action].left}px); top: calc(var(--cardScale) * ${actions[action].top}px);"></div>`,
          id
        );
      });

      const spyZoneId = 'spies_' + card.id;
      dojo.place(`<div id="${spyZoneId}" class="pp_spy_zone"></div>`, card.id);
      // if (!this.game.spies[card.id]) {
      // ** setup for zone
      this.game.spies[card.id] = new LineStock<Cylinder>(this.game.cylinderManager, document.getElementById(spyZoneId), {
        center: false,
        gap: '0px',
      });
      // }
    }

    // div.style.position = 'relative';
    div.classList.add('pp_card');

    if (card.id.includes('select')) {
      div.classList.add('pp_card_select');
    }
  }

  setupFrontDiv(card: Card, div: HTMLElement) {
    div.classList.add(`pp_${card.id}`);

    if (!card.id.includes('select')) {
      this.game.tooltipManager.addTooltipToCard({ cardId: card.id });
      div.classList.add('pp_card_side');
    } else {
      div.classList.add('pp_card_select_side');
    }
  }

  setupBackDiv(card: Card, div: HTMLElement) {
    div.classList.add('pp_card_side');
    div.classList.add('pp_card_back');
  }

  isCardVisible(card: Card) {
    return (card.type === 'eventCard' || card.type === 'courtCard') && card.location === 'deck' ? false : true;
  }
}
