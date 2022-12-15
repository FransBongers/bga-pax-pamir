class Player {

  constructor ({player, playerManager}) {
    console.log('Player', player);
    this.playerManager = playerManager;
    this.playerId = player.id;
    this.playerName = player.name;
    this.playerColor = player.color;
  }
}

class PlayerManager {

  constructor(game) {
    this.game = game;
    this.players = {};

    for (const playerId in game.gamedatas.players) {
      const player = game.gamedatas.players[playerId];
      console.log('playerManager', playerId, player);
      this.players[playerId] = new Player({player, playerManager: this});
    }
    console.log('players', this.players);
  }
}