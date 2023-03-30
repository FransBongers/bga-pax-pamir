class SetupState implements State {
  private game: PaxPamirGame;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState() {
    this.updateInterfaceInitialStep();
    console.log('onEntering setup')
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
    this.game.addPrimaryActionButton({
      id: 'afghan_button',
      text: _('Afghan'),
      callback: () => this.game.takeAction({ action: 'chooseLoyalty', data: { coalition: AFGHAN } }),
      extraClasses: 'loyalty_button',
    });
    this.game.addPrimaryActionButton({
      id: 'british_button',
      text: _('British'),
      callback: () => this.game.takeAction({ action: 'chooseLoyalty', data: { coalition: BRITISH } }),
      extraClasses: 'loyalty_button',
    });
    this.game.addPrimaryActionButton({
      id: 'russian_button',
      text: _('Russian'),
      callback: () => this.game.takeAction({ action: 'chooseLoyalty', data: { coalition: RUSSIAN } }),
      extraClasses: 'loyalty_button',
    });
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...
}
