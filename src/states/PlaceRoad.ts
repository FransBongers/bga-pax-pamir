class PlaceRoadState implements State {
  private game: PaxPamirGame;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ region }: OnEnteringPlaceRoadArgs) {
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
    this.setBordersSelectable({borders});
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private setBordersSelectable({ borders }: { borders: string[] }) {
    const container = document.getElementById(`pp_map_areas_borders_regions`);
    container.classList.add('pp_selectable');

    borders.forEach((border) => {
      const element = document.getElementById(`pp_${border}_border_select`);
      if (element) {
        element.classList.add('pp_selectable');
        this.game._connections.push(dojo.connect(element, 'onclick', this, () => {
          this.game.clearPossible();
          this.game.takeAction({ action: 'placeRoad', data: { border } });
        }));
      }
    })
  }
}
