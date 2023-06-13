class ClientResolveEventOtherPersuasiveMethodsState implements State {
  private game: PaxPamirGame;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ event }: ClientResolveEventStateArgs) {
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

    this.game.clientUpdatePageTitleOtherPlayers({
      text: _('${actplayer} must exchange hand with another player'),
      args: {
        actplayer: '${actplayer}',
      },
    });
  }

  private updateInterfaceInitialStep() {
    this.game.clearPossible();
    this.game.clientUpdatePageTitle({
      text: '${you} must select a player to exchange your hand with',
      args: {
        you: '${you}',
      },
    });
    const players = this.game.playerManager.getPlayers();
    players
      .filter((player) => player.getPlayerId() !== this.game.getPlayerId())
      .forEach((player) => {
        this.game.addPlayerButton({
          callback: () => this.updateInterfaceConfirmPlayer({ player }),
          player,
        });
      });
  }

  private updateInterfaceConfirmPlayer({ player }: { player: PPPlayer }) {
    this.game.clearPossible();
    this.game.clientUpdatePageTitle({
      text: 'Choose ${player_name}?',
      args: {
        player_name: player.getName(),
      },
    });
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () =>
        this.game.takeAction({
          action: 'eventChoice',
          data: {
            data: JSON.stringify({ playerId: player.getPlayerId() }),
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
