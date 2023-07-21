class ResolveEventPashtunwaliValuesState implements State {
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
    this.game.clearPossible();
    this.game.clientUpdatePageTitle({
      text: '${you} must select a suit to favor',
      args: {
        you: '${you}',
      },
    });
    SUITS.forEach((suit) => {
      const name = this.game.gamedatas.staticData.suits[suit].name;
      this.game.addPrimaryActionButton({
        id: `${suit}_btn`,
        text: _(name),
        callback: () => this.updateInterfaceConfirmSuit({ suit, name }),
      });
    });
  }

  private updateInterfaceConfirmSuit({ suit, name }: { suit: string; name: string }) {
    this.game.clearPossible();
    this.game.clientUpdatePageTitle({
      text: 'Choose ${suitName}?',
      args: {
        suitName: name,
      },
    });
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () =>
        this.game.takeAction({
          action: 'eventCardPashtunwaliValues',
          data: {
            suit,
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
