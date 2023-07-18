class PlaceSpyState implements State {
  private game: PaxPamirGame;
  private selectedPiece: string | null;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ regionId, selectedPiece }: OnEnteringPlaceSpyArgs) {
    this.selectedPiece = selectedPiece;
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
    if (this.selectedPiece) {
      this.setPieceSelected();
    }

    this.setPlaceSpyCardsSelectable({ regionId });
  }

  private updateInterfaceConfirmPlaceSpy({ cardId }: { cardId: string }) {
    this.game.clearPossible();
    dojo.query(`.pp_card_in_court.pp_${cardId}`).addClass('pp_selected');
    if (this.selectedPiece) {
      this.setPieceSelected();
    }
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

  private setPieceSelected() {
    const node = dojo.byId(this.selectedPiece);
    if (node) {
      dojo.addClass(node, PP_SELECTED);
    }
  }

  setPlaceSpyCardsSelectable({ regionId }: { regionId: string }) {
    dojo.query(`.pp_card_in_court.pp_${regionId}`).forEach((node: HTMLElement, index: number) => {
      const cardId = node.id;
      dojo.addClass(node, 'pp_selectable');
      this.game._connections.push(dojo.connect(node, 'onclick', this, () => this.updateInterfaceConfirmPlaceSpy({ cardId })));
    });
  }
}
