class StartOfTurnAbilitiesState implements State {
  private game: GameAlias;
  private specialAbility!: string;

  constructor(game: GameAlias) {
    this.game = game;
  }

  onEnteringState(args: OnEnteringStartOfTurnAbilitiesArgs) {
    debug('Entering StartOfTurnAbilitiesState', args);
    const { specialAbility } = args;
    this.specialAbility = specialAbility;

    // TODO: find another solution for this?
    // Right now it's needed because initial setup is not yet done due to some async function
    // and availability of actions is determined based on incorrect data
    // => Add spies on card in same place as adding card
    // => add log texts to title bar
    wait(1).then(() => this.updateInterfaceInitialStep());
  }

  onLeavingState() {
    debug('Leaving StartOfTurnAbilitiesState');
  }

  //  .####.##....##.########.########.########..########....###.....######..########
  //  ..##..###...##....##....##.......##.....##.##.........##.##...##....##.##......
  //  ..##..####..##....##....##.......##.....##.##........##...##..##.......##......
  //  ..##..##.##.##....##....######...########..######...##.....##.##.......######..
  //  ..##..##..####....##....##.......##...##...##.......#########.##.......##......
  //  ..##..##...###....##....##.......##....##..##.......##.....##.##....##.##......
  //  .####.##....##....##....########.##.....##.##.......##.....##..######..########

  // ..######..########.########.########...######.
  // .##....##....##....##.......##.....##.##....##
  // .##..........##....##.......##.....##.##......
  // ..######.....##....######...########...######.
  // .......##....##....##.......##..............##
  // .##....##....##....##.......##........##....##
  // ..######.....##....########.##.........######.

  private updateInterfaceInitialStep() {
    this.game.clearPossible();
    this.game.clientUpdatePageTitle({
      text: _('${you} may place a spy on any ${regionName} court card without a spy'),
      args: {
        regionName: this.getRegionNameForSpecialAbility(),
      },
    });
    this.game.addPrimaryActionButton({
      id: 'skip_btn',
      text: _('Skip'),
      callback: () => this.game.takeAction({ action: 'specialAbilityPlaceSpyStartOfTurn', data: { skip: true } }),
    });
    this.setCourtCardsSelectable();
  }

  private updateInterfaceConfirmPlaceSpy({ cardId }: { cardId: string }) {
    this.game.clearPossible();
    document.getElementById(cardId)!.classList.add('pp_selected');
    this.game.clientUpdatePageTitle({
      text: _('Place a spy on ${cardName}?'),
      args: {
        cardName: _((this.game.getCardInfo(cardId) as CourtCard).name),
      },
    });
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () => this.game.takeAction({ action: 'specialAbilityPlaceSpyStartOfTurn', data: { cardId } }),
    });
    this.game.addDangerActionButton({
      id: 'cancel_btn',
      text: _('Cancel'),
      callback: () => this.game.onCancel(),
    });
  }
  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private getRegionNameForSpecialAbility() {
    switch (this.specialAbility) {
      case SA_BLACKMAIL_HERAT:
        return this.game.gamedatas.staticData.regions[HERAT].name;
      case SA_BLACKMAIL_KANDAHAR:
        return this.game.gamedatas.staticData.regions[KANDAHAR].name;
      default:
        return '';
    }
  }

  setCourtCardsSelectable() {
    const region = this.specialAbility === SA_BLACKMAIL_HERAT ? HERAT : KANDAHAR;
    this.game.playerManager.getAllCourtCards().forEach(({ id: cardId, region: cardRegion }: CourtCard) => {
      if (cardRegion === region && (this.game.cardManager.spies[cardId]?.getCards() || []).length === 0) {
        document.getElementById(cardId)?.classList.add(PP_SELECTABLE);
        this.game._connections.push(dojo.connect($(cardId), 'onclick', () => this.updateInterfaceConfirmPlaceSpy({ cardId })));
      }
    });
  }

  //  ..######..##.......####..######..##....##
  //  .##....##.##........##..##....##.##...##.
  //  .##.......##........##..##.......##..##..
  //  .##.......##........##..##.......#####...
  //  .##.......##........##..##.......##..##..
  //  .##....##.##........##..##....##.##...##.
  //  ..######..########.####..######..##....##

  // .##.....##....###....##....##.########..##.......########..######.
  // .##.....##...##.##...###...##.##.....##.##.......##.......##....##
  // .##.....##..##...##..####..##.##.....##.##.......##.......##......
  // .#########.##.....##.##.##.##.##.....##.##.......######....######.
  // .##.....##.#########.##..####.##.....##.##.......##.............##
  // .##.....##.##.....##.##...###.##.....##.##.......##.......##....##
  // .##.....##.##.....##.##....##.########..########.########..######.
}
