//  .########..##..........###....##....##.########.########.
//  .##.....##.##.........##.##....##..##..##.......##.....##
//  .##.....##.##........##...##....####...##.......##.....##
//  .########..##.......##.....##....##....######...########.
//  .##........##.......#########....##....##.......##...##..
//  .##........##.......##.....##....##....##.......##....##.
//  .##........########.##.....##....##....########.##.....##

//  .##.....##....###....##....##....###.....######...########.########.
//  .###...###...##.##...###...##...##.##...##....##..##.......##.....##
//  .####.####..##...##..####..##..##...##..##........##.......##.....##
//  .##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
//  .##.....##.#########.##..####.#########.##....##..##.......##...##..
//  .##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
//  .##.....##.##.....##.##....##.##.....##..######...########.##.....##

class PlayerManager {
  private game: PaxPamirGame;
  private players: Record<number, PPPlayer>;

  constructor(game: PaxPamirGame) {
    console.log('Constructor PlayerManager');
    this.game = game;
    this.players = {};

    for (const playerId in game.gamedatas.paxPamirPlayers) {
      const player = game.gamedatas.paxPamirPlayers[playerId];
      if (Number(playerId) !== 1) {
        this.players[playerId] = new PPPlayer({ player, game: this.game });
      } else {
        this.players[playerId] = new PPWakhanPlayer({ player, game: this.game });
      }
    }

    // console.log("players", this.players);
  }

  getPlayer({ playerId }: { playerId: number }): PPPlayer | PPWakhanPlayer {
    return this.players[playerId];
  }

  getPlayers(): (PPPlayer | PPWakhanPlayer)[] {
    return Object.values(this.players);
  }

  getPlayerIds(): number[] {
    return Object.keys(this.players).map(Number);
  }

  updatePlayers({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    for (const playerId in gamedatas.paxPamirPlayers) {
      this.players[playerId].updatePlayer({ gamedatas });
    }
  }

  setupAdjacentPlayerColors() {
    Object.values(this.players).forEach((player) => {
      player.setupAdjacentPlayerColors();
    })
  }

  /**
   * @returns returns array of playerIds in player order
   */
  private getPlayerOrder = (): number[] => {
    return this.game.playerOrder;
  };

  /**
   * @returns next player for the player with given playerId
   */
  getNextPlayerId({ playerId }: { playerId: number }): number {
    const playerOrder = this.getPlayerOrder();
    const playerIndex = playerOrder.indexOf(playerId);

    if (playerIndex === playerOrder.length - 1) {
      // Last element so return player on index 0
      return playerOrder[0];
    } else {
      // Return next item in array
      return playerOrder[playerIndex + 1];
    }
  }

  /**
   * @returns previous player for the player with given playerId
   */
  getPreviousPlayerId({ playerId }: { playerId: number }): number {
    const playerOrder = this.getPlayerOrder();
    const playerIndex = playerOrder.indexOf(playerId);

    if (playerIndex === 0) {
      // First element so return player on last index
      return playerOrder[playerOrder.length - 1];
    } else {
      // Return previous item in array
      return playerOrder[playerIndex - 1];
    }
  }

  getNextPlayer({ playerId }: { playerId: number }): PPPlayer {
    return this.players[this.getNextPlayerId({ playerId })];
  }

  getPreviousPlayer({ playerId }: { playerId: number }): PPPlayer {
    return this.players[this.getPreviousPlayerId({ playerId })];
  }

  clearInterface() {
    Object.keys(this.players).forEach((playerId) => {
      this.players[playerId].clearInterface();
    });
  }
}
