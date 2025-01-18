class SelectPieceState implements State {
  private game: PaxPamirGame;
  private availablePieces: string[];

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ availablePieces }: OnEnteringSelectPieceArgs) {
    this.availablePieces = availablePieces;
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
    this.setPiecesSelectable();
  }

  private updateInterfaceConfirm({ pieceId }: { pieceId: string }) {
    this.game.clearPossible();
    const node = dojo.byId(pieceId);
    if (node) {
      dojo.addClass(node, PP_SELECTED);
    }
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () => this.game.takeAction({ action: 'selectPiece', data: { pieceId } }),
    });
    this.game.addCancelButton();
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private setPiecesSelectable() {
    this.availablePieces.forEach((pieceId) => {
      const node = dojo.byId(pieceId);
      if (node) {
        dojo.addClass(node, PP_SELECTABLE);
        this.game._connections.push(dojo.connect(node, 'onclick', this, () => this.updateInterfaceConfirm({ pieceId })));
      }
    });
  }
}
