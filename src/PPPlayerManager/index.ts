//  .########..##..........###....##....##.########.########.
//  .##.....##.##.........##.##....##..##..##.......##.....##
//  .##.....##.##........##...##....####...##.......##.....##
//  .########..##.......##.....##....##....######...########.
//  .##........##.......#########....##....##.......##...##..
//  .##........##.......##.....##....##....##.......##....##.
//  .##........########.##.....##....##....########.##.....##

class PPPlayer {
  private court: Stock;
  private cylinders: Zone;
  private game: PaxPamirGame;
  private gifts: Record<string, Zone>;
  private playerColor: string;
  private playerId: string;
  private playerName: string;

  constructor({ game, player }: { game: PaxPamirGame; player: PaxPamirPlayer }) {
    // console.log("Player", player);
    this.game = game;
    const playerId = player.id;
    this.playerId = playerId;
    this.playerName = player.name;
    this.playerColor = player.color;

    const gamedatas = game.gamedatas;

    // Create player court stock
    this.court = new ebg.stock();
    setupCardsStock({
      game: this.game,
      stock: this.court,
      nodeId: `pp_court_player_${playerId}`,
      className: `pp_card_in_court_${playerId}`,
    });

    // Add court cards played by player to court
    gamedatas.court[playerId].forEach((card: Token) => {
      placeCard({
        location: this.court,
        id: card.id,
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
    gamedatas.cylinders[playerId].forEach((cylinder: Token) => {
      placeToken({
        game: this.game,
        location: this.cylinders,
        id: cylinder.id,
        jstpl: 'jstpl_cylinder',
        jstplProps: {
          id: cylinder.id,
          color: gamedatas.players[playerId].color,
        },
      });
    });

    // Add cylinder to VP track
    // Note (Frans): should probably move this to objectManager
    placeToken({
      game: this.game,
      location: this.game.objectManager.vpTrack.getZone(player.score),
      id: `vp_cylinder_${playerId}`,
      jstpl: 'jstpl_cylinder',
      jstplProps: {
        id: `vp_cylinder_${playerId}`,
        color: gamedatas.players[playerId].color,
      },
    });

    this.gifts = {};
    // Set up gift zones
    ['2', '4', '6'].forEach((value) => {
      this.gifts[value] = new ebg.zone();
      setupTokenZone({
        game: this.game,
        zone: this.gifts[value],
        nodeId: `pp_gift_${value}_zone_${playerId}`,
        tokenWidth: 40,
        tokenHeight: 40,
        // itemMargin: 10,
        pattern: 'custom',
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
          jstpl: 'jstpl_cylinder',
          jstplProps: {
            id: cylinderId,
            color: gamedatas.players[playerId].color,
          },
        });
      });
    });

    // Set up players board
    const player_board_div = $('player_board_' + playerId);
    dojo.place(
      (this.game as unknown as Framework).format_block('jstpl_player_board', { ...player, p_color: player.color }),
      player_board_div
    );

    if (player.loyalty !== 'null') {
      this.updatePlayerLoyalty({ coalition: player.loyalty });
    }
    // TODO (Frans): check use of counter component for all counts
    $('cylinders_' + playerId).classList.add(`pp_player_color_${player.color}`);
    // Set all values in player panels
    $('influence_' + playerId).innerHTML = gamedatas.counts[playerId].influence;
    $('cylinder_count_' + playerId).innerHTML = gamedatas.counts[playerId].cylinders;
    $('rupee_count_' + playerId).innerHTML = gamedatas.players[playerId].rupees;
    $('card_count_' + playerId).innerHTML = gamedatas.counts[playerId].cards;

    $('economic_' + playerId).innerHTML = gamedatas.counts[playerId].suits.economic;
    $('military_' + playerId).innerHTML = gamedatas.counts[playerId].suits.military;
    $('political_' + playerId).innerHTML = gamedatas.counts[playerId].suits.political;
    $('intelligence_' + playerId).innerHTML = gamedatas.counts[playerId].suits.intelligence;
  }

  getCourtZone(): Stock {
    return this.court;
  }

  getCylinderZone(): Zone {
    return this.cylinders;
  }

  getGiftZone({ value }: { value: string }) {
    return this.gifts[value];
  }

  getPlayerColor(): string {
    return this.playerColor;
  }

  // TODO (remove cards of other loyalties, remove gifts, remove prizes)
  updatePlayerLoyalty({ coalition }) {
    dojo
      .query(`#loyalty_icon_${this.playerId}`)
      .removeClass('pp_loyalty_afghan')
      .removeClass('pp_loyalty_british')
      .removeClass('pp_loyalty_russian')
      .addClass(`pp_loyalty_${coalition}`);
  
    dojo
      .query(`#pp_loyalty_dial_${this.playerId}`)
      .removeClass('pp_loyalty_afghan')
      .removeClass('pp_loyalty_british')
      .removeClass('pp_loyalty_russian')
      .addClass(`pp_loyalty_${coalition}`);
  };
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

class PPPlayerManager {
  private game: PaxPamirGame;
  private players: Record<string, PPPlayer>;

  constructor(game: PaxPamirGame) {
    console.log('Constructor PlayerManager');
    this.game = game;
    this.players = {};

    for (const playerId in game.gamedatas.players) {
      const player = game.gamedatas.players[playerId];
      // console.log("playerManager", playerId, player);
      this.players[playerId] = new PPPlayer({ player, game: this.game });
    }
    // console.log("players", this.players);
  }

  getPlayer({ playerId }: {playerId: string;}): PPPlayer {
    return this.players[playerId];
  }
}
