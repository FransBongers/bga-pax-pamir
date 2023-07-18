class PlaceRoadState implements State {
  private game: PaxPamirGame;
  private selectedPiece: string | null;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ region, selectedPiece }: OnEnteringPlaceRoadArgs) {
    this.selectedPiece = selectedPiece;
    this.updateInterfaceInitialStep({ borders: region.borders });
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

  private updateInterfaceInitialStep({ borders }: { borders: string[] }) {
    this.game.clearPossible();
    if (this.selectedPiece) {
      this.setPieceSelected();
    }

    borders.forEach((border) => {
      this.game.addPrimaryActionButton({
        id: `${border}_btn`,
        text: _(this.game.gamedatas.staticData.borders[border].name),
        callback: () => {
          this.game.clearPossible();
          this.game.takeAction({ action: 'placeRoad', data: { border } });
        },
      });
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
}
