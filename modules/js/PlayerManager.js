//  .########..##..........###....##....##.########.########.
//  .##.....##.##.........##.##....##..##..##.......##.....##
//  .##.....##.##........##...##....####...##.......##.....##
//  .########..##.......##.....##....##....######...########.
//  .##........##.......#########....##....##.......##...##..
//  .##........##.......##.....##....##....##.......##....##.
//  .##........########.##.....##....##....########.##.....##

class Player {
  constructor({ player, playerManager }) {
    console.log("Player", player);
    this.playerManager = playerManager;
    this.game = playerManager.game;
    const playerId = player.id;
    this.playerId = playerId;
    this.playerName = player.name;
    this.playerColor = player.color;

    const gamedatas = this.playerManager.game.gamedatas;

    // Create player court stock
    this.court = new ebg.stock();
    setupCardsStock({
      game: this.game,
      stock: this.court,
      nodeId: `pp_court_player_${playerId}`,
      className: `pp_card_in_court_${playerId}`,
    });

    // Add court cards played by player to court
    gamedatas.court[playerId].forEach((card) => {
      placeCard({
        location: this.court,
        id: card.key,
        order: card.state,
      });
    });

    // Create cylinder zone
    this.cylinders = new ebg.zone();
    setupTokenZone({
      game: this.game,
      zone: this.cylinders,
      nodeId: `pp_cylinders_player_${playerId}`,
      tokenWidth: CYLINDER_WIDTH,
      tokenHeight: CYLINDER_HEIGHT,
      itemMargin: 10,
    });

    // Add cylinders to zone
    Object.keys(gamedatas.cylinders[playerId]).forEach((cylinderId) => {
      placeToken({
        game: this.game,
        location: this.cylinders,
        id: cylinderId,
        jstpl: "jstpl_cylinder",
        jstplProps: {
          id: cylinderId,
          color: gamedatas.players[playerId].color,
        },
      });
    });

    // Add cylinder to VP track
    // Note (Frans): should probably move this to objectManager
    // console.log("before error", this.playerManager.game);
    placeToken({
      game: this.game,
      location: this.game.objectManager.vpTrack.vpTrackZones[player.score],
      id: `vp_cylinder_${playerId}`,
      jstpl: "jstpl_cylinder",
      jstplProps: {
        id: `vp_cylinder_${playerId}`,
        color: gamedatas.players[playerId].color,
      },
    });

    this.gifts = {};
    // Set up gift zones
    ["2", "4", "6"].forEach((value) => {
      this.gifts[value] = new ebg.zone();
      setupTokenZone({
        game: this.game,
        zone: this.gifts[value],
        nodeId: `pp_gift_${value}_zone_${playerId}`,
        tokenWidth: 40,
        tokenHeight: 40,
        // itemMargin: 10,
        pattern: "custom",
        customPattern: () => {
          return { x: 5, y: 5, w: 30, h: 30 };
        },
      });
    });

    // Add gifts to zones
    const playerGifts = gamedatas.gifts[playerId];
    Object.keys(playerGifts).forEach((giftValue) => {
      Object.keys(playerGifts[giftValue]).forEach((cylinderId) => {
        placeToken({
          game: this.game,
          location: this.gifts[giftValue],
          id: cylinderId,
          jstpl: "jstpl_cylinder",
          jstplProps: {
            id: cylinderId,
            color: gamedatas.players[playerId].color,
          },
        });
      });
    });

    // Set up players board
    const player_board_div = $("player_board_" + playerId);
    dojo.place(
      this.game.format_block("jstpl_player_board", player),
      player_board_div
    );
    if (player.loyalty !== "null") {
      updatePlayerLoyalty({ playerId, coalition: player.loyalty });
    }

    // Set all values in player panels
    $("influence_" + playerId).innerHTML = gamedatas.counts[playerId].influence;
    $("cylinder_count_" + playerId).innerHTML =
      gamedatas.counts[playerId].cylinders;
    $("rupee_count_" + playerId).innerHTML = gamedatas.players[playerId].rupees;
    $("card_count_" + playerId).innerHTML = gamedatas.counts[playerId].cards;

    $("economic_" + playerId).innerHTML =
      gamedatas.counts[playerId].suits.economic;
    $("military_" + playerId).innerHTML =
      gamedatas.counts[playerId].suits.military;
    $("political_" + playerId).innerHTML =
      gamedatas.counts[playerId].suits.political;
    $("intelligence_" + playerId).innerHTML =
      gamedatas.counts[playerId].suits.intelligence;
  }
}

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
  constructor(game) {
    this.game = game;
    this.players = {};

    for (const playerId in game.gamedatas.players) {
      const player = game.gamedatas.players[playerId];
      console.log("playerManager", playerId, player);
      this.players[playerId] = new Player({ player, playerManager: this });
    }
    console.log("players", this.players);
  }
}
