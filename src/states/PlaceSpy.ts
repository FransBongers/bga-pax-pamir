class PlaceSpyState implements State {
  private game: PaxPamirGame;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ regionId }: OnEnteringPlaceSpyArgs) {
    this.updateInterfaceInitialStep({ regionId });
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

  private updateInterfaceInitialStep({ regionId }: { regionId: string }) {
    this.game.clearPossible();

    this.setPlaceSpyCardsSelectable({ regionId });
  }

  private updateInterfaceConfirmPlaceSpy({ cardId }: { cardId: string }) {
    this.game.clearPossible();
    dojo.query(`.pp_card_in_court.pp_${cardId}`).addClass('pp_selected');
    this.game.clientUpdatePageTitle({
      text: _('Place a spy on ${cardName}'),
      args: {
        cardName: (this.game.getCardInfo({ cardId }) as CourtCard).name,
      },
    });
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () => this.game.takeAction({ action: 'placeSpy', data: { cardId } }),
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

  setPlaceSpyCardsSelectable({ regionId }: { regionId: string }) {
    dojo.query(`.pp_card_in_court.pp_${regionId}`).forEach((node: HTMLElement, index: number) => {
      const cardId = node.id;
      dojo.addClass(node, 'pp_selectable');
      this.game._connections.push(dojo.connect(node, 'onclick', this, () => this.updateInterfaceConfirmPlaceSpy({ cardId })));
    });
  }
}
