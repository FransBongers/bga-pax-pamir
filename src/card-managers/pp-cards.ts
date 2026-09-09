class PPCardManager extends CardManager<Card> {
  public spies: Record<string, LineStock<Cylinder>> = {}; // spies per cards

  constructor(public game: GameAlias) {
    super(game, {
      getId: (card) => card.id,
      setupDiv: (card, div) => this.setupDiv(card, div),
      setupFrontDiv: (card, div: HTMLElement) => this.setupFrontDiv(card, div),
      setupBackDiv: (card, div: HTMLElement) => this.setupBackDiv(card, div),
      isCardVisible: (card) => this.isCardVisible(card),
      animationManager: game.animationManager,
    });
  }

  public clearInterface() {
    Object.keys(this.spies).forEach((key) => {
      if (this.spies[key]) {
        this.spies[key].removeAll();
      }
    });
  }

  setupDiv(card: Card, div: HTMLElement) {
    if (card.type === 'courtCard') {
      const { actions, region, id } = card;

      div.classList.add(`pp_${region}`);

      Object.keys(actions).forEach((action, index) => {
        const actionId = action + '_' + id;
        dojo.place(
          `<div id="${actionId}" class="pp_card_action" style="left: calc(var(--cardScale) * ${actions[action].left}px); top: calc(var(--cardScale) * ${actions[action].top}px);"></div>`,
          id,
        );
      });

      const spyZoneId = 'spies_' + card.id;
      dojo.place(`<div id="${spyZoneId}" class="pp_spy_zone"></div>`, card.id);

      this.spies[card.id] = new LineStock<Cylinder>(this.game.cylinderManager, document.getElementById(spyZoneId)!, {
        center: false,
        gap: '0px',
      });
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
