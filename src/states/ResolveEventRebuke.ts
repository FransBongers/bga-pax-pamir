class ResolveEventRebukeState implements State {
  private game: PaxPamirGame;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState(_props: OnEnteringResolveEventStateArgs) {
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
    // this.game.clearPossible();
    this.game.clientUpdatePageTitle({
      text: _('${you} must select a region'),
      args: {
        you: '${you}',
      },
    });

    this.game.map.setSelectable();

    REGIONS.forEach((regionId) => {
      const element = document.getElementById(`pp_region_${regionId}`);
      if (element) {
        element.classList.add('pp_selectable');
        this.game._connections.push(dojo.connect(element, 'onclick', this, () => this.updateInterfaceRegionSelected({ regionId })));
      }
    });
  }

  private updateInterfaceRegionSelected({ regionId }: { regionId: string }) {
    this.game.clearPossible();

    // dojo.removeClass('confirm_btn', 'disabled');
    this.game.map.setSelectable();
    const element = document.getElementById(`pp_region_${regionId}`);
    if (element) {
      element.classList.add(PP_SELECTED);
    }
    this.game.clientUpdatePageTitle({
      text: _('Remove all tribes and armies from ${regionName}?'),
      args: {
        regionName: _(this.game.gamedatas.staticData.regions[regionId].name),
      },
    });
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () =>
        this.game.takeAction({
          action: 'eventCardRebuke',
          data: {
            regionId,
          },
        }),
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
}
