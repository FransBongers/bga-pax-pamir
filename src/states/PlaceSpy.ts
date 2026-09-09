class PlaceSpyState implements State {
  private game: GameAlias;
  private selectedPiece!: string | null;

  constructor(game: GameAlias) {
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
    document.getElementById(cardId)!.classList.add('pp_selected');
    if (this.selectedPiece) {
      this.setPieceSelected();
    }
    this.game.clientUpdatePageTitle({
      text: _('Place a spy on ${cardName}'),
      args: {
        cardName: _((this.game.getCardInfo(cardId) as CourtCard).name),
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
    const node = dojo.byId(this.selectedPiece as string);
    if (node) {
      node.classList.add(PP_SELECTED);
    }
  }

  setPlaceSpyCardsSelectable({ regionId }: { regionId: string }) {
    dojo.query(`.pp_court .pp_card.pp_${regionId}`).forEach((node: HTMLElement, index: number) => {
      const cardId = node.id;
      node.classList.add(PP_SELECTABLE);
      this.game._connections.push(dojo.connect(node, 'onclick', () => this.updateInterfaceConfirmPlaceSpy({ cardId })));
    });
  }
}
