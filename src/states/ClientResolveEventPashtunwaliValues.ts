class ClientResolveEventPashtunwaliValuesState implements State {
  private game: PaxPamirGame;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ event }: ClientResolveEventStateArgs) {
    console.log('other player pashtunwali values');
    if (this.game.framework().isCurrentPlayerActive()) {
      this.updateInterfaceInitialStep();
    } else {
      this.updateInterfaceOtherPlayers();
    }
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

  private updateInterfaceOtherPlayers() {
    this.game.clearPossible();
    console.log('other player pashtunwali values');
    this.game.clientUpdatePageTitleOtherPlayers({
      text: _('${actplayer} must select a suit to favor'),
      args: {
        actplayer: '${actplayer}',
      },
    });
  }

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
        callback: () =>
          this.updateInterfaceConfirmSuit({suit, name}),
      });
    });
  }

  private updateInterfaceConfirmSuit({ suit, name }: { suit: string; name: string; }) {
    this.game.clearPossible();
    this.game.clientUpdatePageTitle({
      text: 'Choose ${name}?',
      args: {
        name,
      },
    });
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () =>
        this.game.takeAction({
          action: 'eventChoice',
          data: {
            data: JSON.stringify({ suit }),
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
