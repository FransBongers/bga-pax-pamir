//  .########..##..........###....##....##.########.########.
//  .##.....##.##.........##.##....##..##..##.......##.....##
//  .##.....##.##........##...##....####...##.......##.....##
//  .########..##.......##.....##....##....######...########.
//  .##........##.......#########....##....##.......##...##..
//  .##........##.......##.....##....##....##.......##....##.
//  .##........########.##.....##....##....########.##.....##

class PPPlayer {
  private court: Zone;
  private cylinders: Zone;
  private hand: Zone = new ebg.zone();
  private game: PaxPamirGame;
  private gifts: Record<string, Zone>;
  private playerColor: string;
  private playerId: string;
  private playerName: string;
  private counters: {
    cards: Counter;
    cylinders: Counter;
    economic: Counter;
    influence: Counter;
    intelligence: Counter;
    military: Counter;
    political: Counter;
    rupees: Counter;
  } = {
    cards: new ebg.counter(),
    cylinders: new ebg.counter(),
    economic: new ebg.counter(),
    influence: new ebg.counter(),
    intelligence: new ebg.counter(),
    military: new ebg.counter(),
    political: new ebg.counter(),
    rupees: new ebg.counter(),
  };
  private player: PaxPamirPlayer;

  constructor({ game, player }: { game: PaxPamirGame; player: PaxPamirPlayer }) {
    // console.log("Player", player);
    this.game = game;
    const playerId = player.id;
    this.playerId = playerId;
    this.player = player;
    this.playerName = player.name;
    this.playerColor = player.color;

    const gamedatas = game.gamedatas;

    this.setupHand({ gamedatas });
    this.setupCourt({ gamedatas });

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

    this.setupPlayerPanels({ gamedatas });
  }

  // Setup functions
  setupHand({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    if (!(this.playerId === this.game.getPlayerId())) {
      return;
    }

    this.hand.create(this.game, 'pp_player_hand_cards', CARD_WIDTH, CARD_HEIGHT);
    this.hand.instantaneous = true;
    this.hand.item_margin = 16;

    gamedatas.hand.forEach((card) => {
      dojo.place(tplCard({ cardId: card.id, extraClasses: 'pp_card_in_hand' }), 'pp_player_hand_cards');
      this.hand.placeInZone(card.id);
    });
    this.hand.instantaneous = false;
  }

  setupCourt({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.court = new ebg.zone();
    this.court.create(this.game, `pp_court_player_${this.playerId}`, CARD_WIDTH, CARD_HEIGHT);
    this.court.item_margin = 16;

    gamedatas.court[this.playerId].forEach((card: Token) => {
      const cardId = card.id;
      const { actions, region } = this.game.gamedatas.cards[cardId] as CourtCard;
      dojo.place(
        tplCard({ cardId, extraClasses: `pp_card_in_court_${this.playerId} pp_card_in_court_${region}` }),
        `pp_court_player_${this.playerId}`
      );

      this.setupCourtCard({ cardId });

      this.court.placeInZone(cardId, card.state);
    });
    console.log('court', this.court);
  }

  setupPlayerPanels({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    // Set up panels
    const player_board_div = $('player_board_' + this.playerId);
    dojo.place(
      (this.game as unknown as Framework).format_block('jstpl_player_board', { ...this.player, p_color: this.playerColor }),
      player_board_div
    );
    $(`cylinders_${this.playerId}`).classList.add(`pp_player_color_${this.playerColor}`);

    // TODO: check how player loyalty is returned with new setup. Seems to be empty string?
    if (this.player.loyalty && this.player.loyalty !== 'null') {
      this.updatePlayerLoyalty({ coalition: this.player.loyalty });
    }

    this.counters.cards.create(`card_count_${this.playerId}_counter`);
    this.counters.cylinders.create(`cylinder_count_${this.playerId}_counter`);
    this.counters.economic.create(`economic_${this.playerId}_counter`);
    this.counters.influence.create(`influence_${this.playerId}_counter`);
    this.counters.intelligence.create(`intelligence_${this.playerId}_counter`);
    this.counters.military.create(`military_${this.playerId}_counter`);
    this.counters.political.create(`political_${this.playerId}_counter`);
    this.counters.rupees.create(`rupee_count_${this.playerId}_counter`);

    // Set all values in player panels
    if (this.player.loyalty && this.player.loyalty !== 'null') {
      this.counters.influence.setValue(gamedatas.counts[this.playerId].influence);
    } else {
      this.counters.influence.disable();
    }
    this.counters.cylinders.setValue(gamedatas.counts[this.playerId].cylinders);
    this.counters.rupees.setValue(gamedatas.players[this.playerId].rupees);
    this.counters.cards.setValue(gamedatas.counts[this.playerId].cards);

    this.counters.economic.setValue(gamedatas.counts[this.playerId].suits.economic);
    this.counters.military.setValue(gamedatas.counts[this.playerId].suits.military);
    this.counters.political.setValue(gamedatas.counts[this.playerId].suits.political);
    this.counters.intelligence.setValue(gamedatas.counts[this.playerId].suits.intelligence);
  }

  setupCourtCard({ cardId }: { cardId: string }) {
    const { actions, region } = this.game.gamedatas.cards[cardId] as CourtCard;
    this.game.createSpyZone({ cardId });
    Object.keys(actions).forEach((action, index) => {
      const actionId = action + '_' + cardId;
      dojo.place(
        `<div id="${actionId}" class="pp_card_action pp_card_action_${action}" style="left: ${actions[action].left}px; top: ${actions[action].top}px"></div>`,
        cardId
      );
    });
  }

  // Getters & setters

  getCourtZone(): Zone {
    return this.court;
  }

  getHandZone(): Zone {
    return this.hand;
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

  setCounter({
    counter,
    value,
  }: {
    counter: 'cards' | 'cylinders' | 'economic' | 'influence' | 'intelligence' | 'military' | 'political' | 'rupees';
    value: number;
  }): void {
    this.counters[counter].setValue(value);
  }

  moveToHand({ cardId, from }: { cardId: string; from: Zone }) {
    this.game.move({ id: cardId, to: this.hand, from, addClass: ['pp_card_in_hand'], removeClass: ['pp_market_card'] });
  }

  moveToCourt({ card, from }: { card: Token; from: Zone | null }) {
    const { region } = this.game.gamedatas.cards[card.id] as CourtCard;
    if (!from) {
      dojo.place(
        tplCard({ cardId: card.id, extraClasses: `pp_card_in_court_${this.playerId} pp_card_in_court_${region}` }),
        `pp_court_player_${this.playerId}`
      );
      this.setupCourtCard({ cardId: card.id });
      this.court.placeInZone(card.id, card.state);
    } else {
      this.setupCourtCard({ cardId: card.id });
      this.game.move({
        id: card.id,
        to: this.court,
        from,
        addClass: [`pp_card_in_court_${this.playerId}, pp_card_in_court_${region}`],
        removeClass: ['pp_card_in_hand'],
        weight: card.state,
      });
    }
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

  getPlayer({ playerId }: { playerId: string }): PPPlayer {
    return this.players[playerId];
  }
}
