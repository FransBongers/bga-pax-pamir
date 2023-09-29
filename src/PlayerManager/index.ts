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
      console.log('playerId type',typeof playerId);
      // console.log("playerManager", playerId, player);
      if (Number(playerId) !== 1) {
        this.players[playerId] = new PPPlayer({ player, game: this.game });
      } else {
        this.players[playerId] = new PPWakhanPlayer({ player, game: this.game });
      }
      
    }
    // console.log("players", this.players);
  }

  getPlayer({ playerId }: { playerId: number }): PPPlayer | PPWakhanPlayer{
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

  clearInterface() {
    Object.keys(this.players).forEach((playerId) => {
      this.players[playerId].clearInterface();
    });
  }
}
