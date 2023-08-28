//  .########..##..........###....##....##.########.########.
//  .##.....##.##.........##.##....##..##..##.......##.....##
//  .##.....##.##........##...##....####...##.......##.....##
//  .########..##.......##.....##....##....######...########.
//  .##........##.......#########....##....##.......##...##..
//  .##........##.......##.....##....##....##.......##....##.
//  .##........########.##.....##....##....########.##.....##

class PPWakhan {
  // private court: PaxPamirZone;
  // private events: PaxPamirZone;
  // private cylinders: PaxPamirZone;
  // private handCards: string[];
  // private hand: PaxPamirZone;
  private game: PaxPamirGame;
  // private gifts: Record<string, PaxPamirZone> = {};
  // private modal: Modal;
  private playerColor: string;
  private playerId: number;
  private playerName: string;
  // private prizes: PaxPamirZone;
  // private counters: {
  //   cards: Counter;
  //   cardsTableau: Counter;
  //   cylinders: Counter;
  //   economic: Counter;
  //   influence: Counter;
  //   intelligence: Counter;
  //   military: Counter;
  //   political: Counter;
  //   rupees: Counter;
  //   rupeesTableau: Counter;
  // } = {
  //   cards: new ebg.counter(),
  //   cardsTableau: new ebg.counter(),
  //   cylinders: new ebg.counter(),
  //   economic: new ebg.counter(),
  //   influence: new ebg.counter(),
  //   intelligence: new ebg.counter(),
  //   military: new ebg.counter(),
  //   political: new ebg.counter(),
  //   rupees: new ebg.counter(),
  //   rupeesTableau: new ebg.counter(),
  // };
  private player: PaxPamirPlayer;
  private rulerTokens: PaxPamirZone;
  private loyalty: string;

  constructor({ game, player }: { game: PaxPamirGame; player: PaxPamirPlayer }) {
    // console.log("Player", player);
    this.game = game;
    const playerId = player.id;
    this.playerId = Number(playerId);
    this.player = player;
    this.playerName = player.name;
    this.playerColor = player.color;

    const gamedatas = game.gamedatas;
    this.setupPlayer({ gamedatas });
  }

  // ..######..########.########.##.....##.########.
  // .##....##.##..........##....##.....##.##.....##
  // .##.......##..........##....##.....##.##.....##
  // ..######..######......##....##.....##.########.
  // .......##.##..........##....##.....##.##.......
  // .##....##.##..........##....##.....##.##.......
  // ..######..########....##.....#######..##.......

  updatePlayer({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    // const playerGamedatas = gamedatas.players[this.playerId];

    // this.setupCourt({ playerGamedatas });
    // this.setupEvents({ playerGamedatas });
    // this.setupPrizes({ playerGamedatas });
    // this.setupCylinders({ playerGamedatas });
    // this.setupGifts({ playerGamedatas });
    // this.setupRulerTokens({ gamedatas });
    // this.updatePlayerPanel({ playerGamedatas });

    // if (playerGamedatas.loyalty && playerGamedatas.loyalty !== 'null') {
    //   this.updatePlayerLoyalty({ coalition: playerGamedatas.loyalty });
    // }
  }

  // Setup functions
  setupPlayer({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    const playerGamedatas = gamedatas.players[this.playerId];

    // this.setupHand({ hand: playerGamedatas.hand });
    // this.setupCourt({ playerGamedatas });
    // this.setupEvents({ playerGamedatas });
    // this.setupPrizes({ playerGamedatas });
    // this.setupCylinders({ playerGamedatas });
    // this.setupGifts({ playerGamedatas });
    // this.setupRulerTokens({ gamedatas });
    // this.setupPlayerPanel({ playerGamedatas });
    // if (this.game.gameOptions.openHands) {
    //   this.setupPlayerHandModal();
    // }
  }

}
