class SelectPieceState implements State {
  private game: GameAlias;
  private availablePieces!: string[];

  constructor(game: GameAlias) {
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
      node.classList.add(PP_SELECTED);
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
        node.classList.add(PP_SELECTABLE);
        this.game._connections.push(dojo.connect(node, 'onclick', () => this.updateInterfaceConfirm({ pieceId })));
      }
    });
  }
}
