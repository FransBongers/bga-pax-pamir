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
  private hand: Zone;
  private game: PaxPamirGame;
  private gifts: Record<string, Zone> = {};
  private playerColor: string;
  private playerId: number;
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
  private rulerTokens: Zone;

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

  updatePlayer({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    const playerGamedatas = gamedatas.players[this.playerId];

    this.setupCourt({ playerGamedatas });
    this.setupCylinders({ playerGamedatas });
    this.setupGifts({ playerGamedatas });
    this.setupRulerTokens({ gamedatas });
    this.updatePlayerPanel({ playerGamedatas });
  }

  // Setup functions
  setupPlayer({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    const playerGamedatas = gamedatas.players[this.playerId];

    this.setupHand({ playerGamedatas });
    this.setupCourt({ playerGamedatas });
    this.setupCylinders({ playerGamedatas });
    this.setupGifts({ playerGamedatas });
    this.setupRulerTokens({ gamedatas });
    this.setupPlayerPanel({ playerGamedatas });
  }

  setupCourt({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
    this.court = new ebg.zone();
    this.court.create(this.game, `pp_court_player_${this.playerId}`, CARD_WIDTH, CARD_HEIGHT);
    this.court.item_margin = 16;
    this.court.instantaneous = true;

    this.court.instantaneous = true;
    playerGamedatas.court.cards.forEach((card: Token) => {
      const cardId = card.id;
      const { actions, region } = this.game.gamedatas.staticData.cards[cardId] as CourtCard;
      dojo.place(
        tplCard({ cardId, extraClasses: `pp_card_in_court pp_player_${this.playerId} pp_${region}` }),
        `pp_court_player_${this.playerId}`
      );

      this.setupCourtCard({ cardId });
      this.court.placeInZone(cardId, card.state);
      this.game.tooltipManager.addTooltipToCard({ cardId: card.id });
      // Add spies
      (playerGamedatas.court.spies[cardId] || []).forEach((cylinder: Token) => {
        const playerId = cylinder.id.split('_')[1];
        placeToken({
          game: this.game,
          location: this.game.spies[cardId],
          id: cylinder.id,
          jstpl: 'jstpl_cylinder',
          jstplProps: {
            id: cylinder.id,
            color: this.game.gamedatas.players[playerId].color,
          },
        });
      });
    });
    this.court.instantaneous = false;
  }

  setupCylinders({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
    this.cylinders = new ebg.zone();
    setupTokenZone({
      game: this.game,
      zone: this.cylinders,
      nodeId: `pp_cylinders_player_${this.playerId}`,
      tokenWidth: CYLINDER_WIDTH,
      tokenHeight: CYLINDER_HEIGHT,
      itemMargin: 8,
    });

    this.cylinders.instantaneous = true;
    // Add cylinders to zone
    playerGamedatas.cylinders.forEach((cylinder: Token) => {
      placeToken({
        game: this.game,
        location: this.cylinders,
        id: cylinder.id,
        jstpl: 'jstpl_cylinder',
        jstplProps: {
          id: cylinder.id,
          color: playerGamedatas.color,
        },
        weight: cylinder.state,
      });
    });
    this.cylinders.instantaneous = false;
  }

  setupGifts({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
    // Set up gift zones
    ['2', '4', '6'].forEach((value) => {
      this.gifts[value] = new ebg.zone();
      setupTokenZone({
        game: this.game,
        zone: this.gifts[value],
        nodeId: `pp_gift_${value}_zone_${this.playerId}`,
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
    const playerGifts = playerGamedatas.gifts;
    Object.keys(playerGifts).forEach((giftValue) => {
      Object.keys(playerGifts[giftValue]).forEach((cylinderId) => {
        placeToken({
          game: this.game,
          location: this.gifts[giftValue],
          id: cylinderId,
          jstpl: 'jstpl_cylinder',
          jstplProps: {
            id: cylinderId,
            color: this.playerColor,
          },
        });
      });
    });
  }

  setupHand({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
    if (!(this.playerId === this.game.getPlayerId())) {
      return;
    }
    if (this.hand) {
      this.hand.removeAll();
    } else {
      this.hand = new ebg.zone();
      this.hand.create(this.game, 'pp_player_hand_cards', CARD_WIDTH, CARD_HEIGHT);
      this.hand.item_margin = 16;
    }

    this.hand.instantaneous = true;

    playerGamedatas.hand.forEach((card) => {
      dojo.place(tplCard({ cardId: card.id, extraClasses: 'pp_card_in_hand' }), 'pp_player_hand_cards');
      this.hand.placeInZone(card.id);
      this.game.tooltipManager.addTooltipToCard({ cardId: card.id });
    });
    this.hand.instantaneous = false;
  }

  setupPlayerPanel({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
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

    this.updatePlayerPanel({ playerGamedatas });
  }

  updatePlayerPanel({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
    const counts = playerGamedatas.counts;

    // Set all values in player panels
    if (this.player.loyalty && this.player.loyalty !== 'null') {
      this.counters.influence.setValue(playerGamedatas.counts.influence);
    } else {
      this.counters.influence.disable();
    }
    this.counters.cylinders.setValue(counts.cylinders);
    this.counters.rupees.setValue(playerGamedatas.rupees);
    this.counters.cards.setValue(counts.cards);

    this.counters.economic.setValue(counts.suits.economic);
    this.counters.military.setValue(counts.suits.military);
    this.counters.political.setValue(counts.suits.political);
    this.counters.intelligence.setValue(counts.suits.intelligence);
  }

  setupRulerTokens({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    if (!this.rulerTokens) {
      this.rulerTokens = new ebg.zone();
      // Create rulerTokens zone
      setupTokenZone({
        game: this.game,
        zone: this.rulerTokens,
        nodeId: `pp_ruler_tokens_player_${this.playerId}`,
        tokenWidth: RULER_TOKEN_WIDTH,
        tokenHeight: RULER_TOKEN_HEIGHT,
        itemMargin: 10,
      });
    }

    this.rulerTokens.instantaneous = true;
    Object.keys(gamedatas.map.rulers).forEach((region: string) => {
      if (gamedatas.map.rulers[region] === Number(this.playerId)) {
        console.log('place ruler token player');
        placeToken({
          game: this.game,
          location: this.rulerTokens,
          id: `pp_ruler_token_${region}`,
          jstpl: 'jstpl_ruler_token',
          jstplProps: {
            id: `pp_ruler_token_${region}`,
            region,
          },
        });
      }
    });
    this.rulerTokens.instantaneous = false;
  }

  setupCourtCard({ cardId }: { cardId: string }) {
    const { actions, region } = this.game.gamedatas.staticData.cards[cardId] as CourtCard;
    this.game.createSpyZone({ cardId });
    Object.keys(actions).forEach((action, index) => {
      const actionId = action + '_' + cardId;
      dojo.place(
        `<div id="${actionId}" class="pp_card_action" style="left: ${actions[action].left}px; top: ${actions[action].top}px"></div>`,
        cardId
      );
    });
  }

  clearInterface() {
    dojo.empty(this.court.container_div);
    this.court = undefined;
    dojo.empty(this.cylinders.container_div);
    this.cylinders = undefined;
    dojo.empty(this.rulerTokens.container_div);
    this.rulerTokens = undefined;
    ['2', '4', '6'].forEach((value) => {
      dojo.empty(this.gifts[value].container_div);
      this.gifts[value] = undefined;
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

  getGiftZone({ value }: { value: number }) {
    return this.gifts[value];
  }

  getColor(): string {
    return this.playerColor;
  }

  getName(): string {
    return this.playerName;
  }

  getRulerTokensZone(): Zone {
    return this.rulerTokens;
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

  incCounter({
    counter,
    value,
  }: {
    counter: 'cards' | 'cylinders' | 'economic' | 'influence' | 'intelligence' | 'military' | 'political' | 'rupees';
    value: number;
  }): void {
    this.counters[counter].incValue(value);
  }

  addSideSelectToCourt() {
    this.court.instantaneous = true;
    dojo.place(tplCardSelect({ side: 'left' }), `pp_court_player_${this.playerId}`);
    this.court.placeInZone('pp_card_select_left', -1000);
    dojo.place(tplCardSelect({ side: 'right' }), `pp_court_player_${this.playerId}`);
    this.court.placeInZone('pp_card_select_right', 1000);
  }

  removeSideSelectFromCourt() {
    this.court.removeFromZone('pp_card_select_left', true);
    this.court.removeFromZone('pp_card_select_right', true);
    this.court.instantaneous = false;
  }

  moveToHand({ cardId, from }: { cardId: string; from: Zone }) {
    this.game.move({ id: cardId, to: this.hand, from, addClass: ['pp_card_in_hand'], removeClass: ['pp_market_card'] });
    this.game.tooltipManager.addTooltipToCard({ cardId });
  }

  moveToCourt({ card, from }: { card: Token; from: Zone | null }) {
    const { region } = this.game.gamedatas.staticData.cards[card.id] as CourtCard;

    if (!from) {
      dojo.place(
        tplCard({ cardId: card.id, extraClasses: `pp_card_in_court pp_player_${this.playerId} pp_${region}` }),
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
        addClass: ['pp_card_in_court', `pp_player_${this.playerId}`, `pp_${region}`],
        removeClass: ['pp_card_in_hand'],
        weight: card.state,
      });
    }
    this.removeSideSelectFromCourt();
    this.game.tooltipManager.addTooltipToCard({ cardId: card.id });
  }

  // TODO (remove cards of other loyalties, remove gifts, remove prizes)
  updatePlayerLoyalty({ coalition }) {
    dojo
      .query(`#loyalty_icon_${this.playerId}`)
      .removeClass('pp_afghan')
      .removeClass('pp_british')
      .removeClass('pp_russian')
      .addClass(`pp_${coalition}`);

    dojo
      .query(`#pp_loyalty_dial_${this.playerId}`)
      .removeClass('pp_afghan')
      .removeClass('pp_british')
      .removeClass('pp_russian')
      .addClass(`pp_${coalition}`);
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
  private game: PaxPamirGame;
  private players: Record<number, PPPlayer>;

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

  getPlayer({ playerId }: { playerId: number }): PPPlayer {
    return this.players[playerId];
  }

  updatePlayers({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    for (const playerId in gamedatas.players) {
      this.players[playerId].updatePlayer({ gamedatas });
    }
  }

  clearInterface() {
    Object.keys(this.players).forEach((playerId) => {
      this.players[playerId].clearInterface();
    });
  }
}
