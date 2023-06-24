class SASafeHouseState implements State {
  private game: PaxPamirGame;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState(props: OnEnteringPlaceSASafeHouseArgs) {
    debug('safeHouseProps', props);
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {}

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

    const player = this.game.getCurrentPlayer();
    const safeHouseCards = player.getCourtCardsWithSpecialAbility({ specialAbility: SA_SAFE_HOUSE });
    if (safeHouseCards.length === 1) {
      this.updateInterfaceConfirmSafeHouse({card: safeHouseCards[0], showCancelButton: false});
    } else {
      this.game.clientUpdatePageTitle({
        text: _('${you} may select a card to place a spy on'),
        args: {
          you: '${you}',
        },
      });
      safeHouseCards.forEach((card: CourtCard) => {
        const node = dojo.byId(card.id);
        dojo.addClass(node, PP_SELECTABLE);
        this.game._connections.push(dojo.connect(node, 'onclick', this, () => this.updateInterfaceConfirmSafeHouse({ card, showCancelButton: true })));
      })
      this.game.addDangerActionButton({
        id: 'do_not_place_btn',
        text: _('Do not place spy'),
        callback: () => this.game.takeAction({ action: 'specialAbilitySafeHouse', data: { cardId: null } }),
      });
      // If player has both cards enable step where player selects on which card to place spy 

    }

    // this.setPlaceSpyCardsSelectable({ regionId });
  }

  private updateInterfaceConfirmSafeHouse({ card, showCancelButton }: { card: CourtCard; showCancelButton: boolean }) {
    this.game.clearPossible();
    const node = dojo.byId(card.id)
    dojo.addClass(node, PP_SELECTED);
    this.game.clientUpdatePageTitle({
      text: _('Place spy on ${cardName}?'),
      args: {
        cardName: card.name,
      },
    });
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () => this.game.takeAction({ action: 'specialAbilitySafeHouse', data: { cardId: card.id } }),
    });
    if (showCancelButton) {
      this.game.addCancelButton();
    } else {
      this.game.addDangerActionButton({
        id: 'do_not_place_btn',
        text: _('Do not place spy'),
        callback: () => this.game.takeAction({ action: 'specialAbilitySafeHouse', data: { cardId: null } }),
      });
    }
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...
}
