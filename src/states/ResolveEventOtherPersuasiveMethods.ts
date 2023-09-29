class ResolveEventOtherPersuasiveMethodsState implements State {
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
      text: 'Choose ${tkn_playerName}?',
      args: {
        tkn_playerName: player.getName(),
      },
    });
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () =>
        this.game.takeAction({
          action: 'eventCardOtherPersuasiveMethods',
          data: {
            playerId: player.getPlayerId(),
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
