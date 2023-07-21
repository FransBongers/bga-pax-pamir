class ResolveEventRumor implements State {
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
      text: '${you} must select a player',
      args: {
        you: '${you}',
      },
    });
    const players = this.game.playerManager.getPlayers();
    players.forEach((player) => {
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
          action: 'eventCardRumor',
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

  // private addPlayerButton({ player }: { player: PPPlayer }) {
  //   this.game.addPrimaryActionButton({
  //     id: `select_${player.getPlayerId()}`,
  //     text: player.getName(),
  //     callback: () => this.updateInterfaceConfirmPlayer({ player }),
  //     extraClasses: `pp_player_button pp_player_color_${player.getColor()}`,
  //   });
  // }
}
