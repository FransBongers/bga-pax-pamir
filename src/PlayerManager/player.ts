//  .########..##..........###....##....##.########.########.
//  .##.....##.##.........##.##....##..##..##.......##.....##
//  .##.....##.##........##...##....####...##.......##.....##
//  .########..##.......##.....##....##....######...########.
//  .##........##.......#########....##....##.......##...##..
//  .##........##.......##.....##....##....##.......##....##.
//  .##........########.##.....##....##....########.##.....##

class PPPlayer {
  private court: Zone;
  private events: Zone;
  private cylinders: Zone;
  private hand: Zone;
  private game: PaxPamirGame;
  private gifts: Record<string, Zone> = {};
  private playerColor: string;
  private playerId: number;
  private playerName: string;
  private prizes: Zone;
  private counters: {
    cards: Counter;
    cardsTableau: Counter;
    cylinders: Counter;
    economic: Counter;
    influence: Counter;
    intelligence: Counter;
    military: Counter;
    political: Counter;
    rupees: Counter;
    rupeesTableau: Counter;
  } = {
    cards: new ebg.counter(),
    cardsTableau: new ebg.counter(),
    cylinders: new ebg.counter(),
    economic: new ebg.counter(),
    influence: new ebg.counter(),
    intelligence: new ebg.counter(),
    military: new ebg.counter(),
    political: new ebg.counter(),
    rupees: new ebg.counter(),
    rupeesTableau: new ebg.counter(),
  };
  private player: PaxPamirPlayer;
  private rulerTokens: Zone;
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
    const playerGamedatas = gamedatas.players[this.playerId];

    this.setupCourt({ playerGamedatas });
    this.setupEvents({ playerGamedatas });
    this.setupPrizes({ playerGamedatas });
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
    this.setupEvents({ playerGamedatas });
    this.setupPrizes({ playerGamedatas });
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

  setupEvents({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
    this.events = new ebg.zone();
    this.events.create(this.game, `player_tableau_events_${this.playerId}`, CARD_WIDTH, CARD_HEIGHT);
    this.court.item_margin = 16;
    this.events.instantaneous = true;
    if (playerGamedatas.events.length > 0) {
      const node = dojo.byId(`pp_player_events_container_${this.playerId}`);
      node.style.marginTop = '-57px';
    }
    playerGamedatas.events.forEach((card: EventCard & Token) => {
      const cardId = card.id;
      dojo.place(tplCard({ cardId }), `player_tableau_events_${this.playerId}`);
      this.events.placeInZone(cardId, card.state);
      this.game.tooltipManager.addTooltipToCard({ cardId });
    });
    this.events.instantaneous = false;
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
    this.counters.cardsTableau.create(`card_count_tableau_${this.playerId}_counter`);
    this.counters.cylinders.create(`cylinder_count_${this.playerId}_counter`);
    this.counters.economic.create(`economic_${this.playerId}_counter`);
    this.counters.influence.create(`influence_${this.playerId}_counter`);
    this.counters.intelligence.create(`intelligence_${this.playerId}_counter`);
    this.counters.military.create(`military_${this.playerId}_counter`);
    this.counters.political.create(`political_${this.playerId}_counter`);
    this.counters.rupees.create(`rupee_count_${this.playerId}_counter`);
    this.counters.rupeesTableau.create(`rupee_count_tableau_${this.playerId}_counter`);

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
    this.counters.rupeesTableau.setValue(playerGamedatas.rupees);
    this.counters.cards.setValue(counts.cards);
    this.counters.cardsTableau.setValue(counts.cards);

    this.counters.economic.setValue(counts.suits.economic);
    this.counters.military.setValue(counts.suits.military);
    this.counters.political.setValue(counts.suits.political);
    this.counters.intelligence.setValue(counts.suits.intelligence);
  }

  setupPrizes({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
    this.prizes = new ebg.zone();
    this.prizes.create(this.game, `pp_prizes_${this.playerId}`, CARD_WIDTH, CARD_HEIGHT);
    this.prizes.setPattern('verticalfit');
    // const node = dojo.byId(`pp_prizes_${this.playerId}`);
    const numberOfPrizes = playerGamedatas.prizes.length;
    // if (numberOfPrizes > 0) {
    //   // dojo.style(node, 'margin-bottom', `${(CARD_HEIGHT - 15 * numberOfPrizes) * -1}px`);
    //   // dojo.style(node, 'margin-bottom', `${ (CARD_HEIGHT - (numberOfPrizes - 1) * 25) * -1 }px`);
    //   dojo.style(node, 'margin-bottom', `-194px`);
    //   dojo.style(node, 'height', `${CARD_HEIGHT + (numberOfPrizes - 1) * 25}px`);
    // }
    this.updatePrizesStyle({ numberOfPrizes });

    this.prizes.instantaneous = true;
    playerGamedatas.prizes.forEach((card: CourtCard & Token) => {
      const cardId = card.id;

      dojo.place(tplCard({ cardId, extraClasses: `pp_prize` }), `pp_prizes_${this.playerId}`);
      this.prizes.placeInZone(cardId, card.state);
    });
    this.prizes.instantaneous = false;
  }

  updatePrizesStyle({ numberOfPrizes }: { numberOfPrizes: number }) {
    if (numberOfPrizes > 0) {
      const node = dojo.byId(`pp_prizes_${this.playerId}`);
      // dojo.style(node, 'margin-bottom', `${(CARD_HEIGHT - 15 * numberOfPrizes) * -1}px`);
      // dojo.style(node, 'margin-bottom', `${ (CARD_HEIGHT - (numberOfPrizes - 1) * 25) * -1 }px`);
      dojo.style(node, 'margin-bottom', `-194px`);
      dojo.style(node, 'height', `${CARD_HEIGHT + (numberOfPrizes - 1) * 25}px`);
    }
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
    dojo.empty(this.events.container_div);
    this.events = undefined;
  }

  // ..######...########.########.########.########.########...######.
  // .##....##..##..........##.......##....##.......##.....##.##....##
  // .##........##..........##.......##....##.......##.....##.##......
  // .##...####.######......##.......##....######...########...######.
  // .##....##..##..........##.......##....##.......##...##.........##
  // .##....##..##..........##.......##....##.......##....##..##....##
  // ..######...########....##.......##....########.##.....##..######.

  // ..######..########.########.########.########.########...######.
  // .##....##.##..........##.......##....##.......##.....##.##....##
  // .##.......##..........##.......##....##.......##.....##.##......
  // ..######..######......##.......##....######...########...######.
  // .......##.##..........##.......##....##.......##...##.........##
  // .##....##.##..........##.......##....##.......##....##..##....##
  // ..######..########....##.......##....########.##.....##..######.

  getColor(): string {
    return this.playerColor;
  }

  getCourtCards(): CourtCard[] {
    const cardsInZone = this.court.getAllItems();
    return cardsInZone.map((cardId: string) => this.game.getCardInfo({ cardId })) as CourtCard[];
  }

  getCourtZone(): Zone {
    return this.court;
  }

  getEventsZone(): Zone {
    return this.events;
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

  getInfluence(): number {
    return this.counters.influence.getValue();
  }

  getName(): string {
    return this.playerName;
  }

  getPlayerId(): number {
    return this.playerId;
  }

  getPrizeZone(): Zone {
    return this.prizes;
  }

  getRupees(): number {
    return this.counters.rupees.getValue();
  }

  getRulerTokensZone(): Zone {
    return this.rulerTokens;
  }

  getPlayerColor(): string {
    return this.playerColor;
  }

  getLoyalty(): string {
    return this.loyalty;
  }

  getTaxShelter(): number {
    return this.court
      .getAllItems()
      .map((cardId) => this.game.getCardInfo({ cardId }))
      .filter((card: CourtCard) => card.suit === ECONOMIC)
      .reduce((total: number, current: CourtCard) => {
        return total + current.rank;
      }, 0);
  }

  setCounter({
    counter,
    value,
  }: {
    counter: 'cards' | 'cylinders' | 'economic' | 'influence' | 'intelligence' | 'military' | 'political' | 'rupees';
    value: number;
  }): void {
    switch (counter) {
      case 'cards':
        this.counters.cards.setValue(value);
        this.counters.cardsTableau.setValue(value);
        break;
      case 'rupees':
        this.counters.rupees.setValue(value);
        this.counters.rupeesTableau.setValue(value);
        break;
      default:
        this.counters[counter].setValue(value);
    }
  }

  incCounter({
    counter,
    value,
  }: {
    counter: 'cards' | 'cylinders' | 'economic' | 'influence' | 'intelligence' | 'military' | 'political' | 'rupees';
    value: number;
  }): void {
    switch (counter) {
      case 'cards':
        this.counters.cards.incValue(value);
        this.counters.cardsTableau.incValue(value);
        break;
      case 'rupees':
        this.counters.rupees.incValue(value);
        this.counters.rupeesTableau.incValue(value);
        break;
      default:
        this.counters[counter].incValue(value);
    }
  }

  toValueCounter({
    counter,
    value,
  }: {
    counter: 'cards' | 'cylinders' | 'economic' | 'influence' | 'intelligence' | 'military' | 'political' | 'rupees';
    value: number;
  }): void {
    switch (counter) {
      case 'cards':
        this.counters.cards.toValue(value);
        this.counters.cardsTableau.toValue(value);
        break;
      case 'rupees':
        this.counters.rupees.toValue(value);
        this.counters.rupeesTableau.toValue(value);
        break;
      default:
        this.counters[counter].toValue(value);
    }
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  addSideSelectToCourt() {
    this.court.instantaneous = true;
    dojo.place(tplCardSelect({ side: 'left' }), `pp_court_player_${this.playerId}`);
    this.court.placeInZone('pp_card_select_left', -1000);
    dojo.place(tplCardSelect({ side: 'right' }), `pp_court_player_${this.playerId}`);
    this.court.placeInZone('pp_card_select_right', 1000);
  }

  checkEventContainerHeight() {
    const node = dojo.byId(`pp_player_events_container_${this.playerId}`);
    if (this.events.getItemNumber() === 0) {
      node.style.marginTop = '-209px';
    } else {
      node.style.marginTop = '-57px';
    }
  }

  removeSideSelectFromCourt() {
    this.court.removeFromZone('pp_card_select_left', true);
    this.court.removeFromZone('pp_card_select_right', true);
    this.court.instantaneous = false;
  }

  ownsEventCard({ cardId }: { cardId: string }): boolean {
    return this.events.getAllItems().includes(cardId);
  }

  hasSpecialAbility({ specialAbility }: { specialAbility: string }): boolean {
    return this.court
      .getAllItems()
      .map((cardId: string) => this.game.getCardInfo({ cardId }))
      .some((card: CourtCard) => card.specialAbility === specialAbility);
  }

  getCourtCardsWithSpecialAbility({ specialAbility }: { specialAbility: string }): CourtCard[] {
    return this.court
      .getAllItems()
      .map((cardId: string) => this.game.getCardInfo({ cardId }) as CourtCard)
      .filter((card: CourtCard) => card.specialAbility === specialAbility);
  }

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  discardCourtCard({ cardId }: { cardId: string }) {
    // // Move all spies back to cylinder pools if there are any
    // this.game.returnSpiesFromCard({ cardId });
    const node = dojo.byId(cardId);
    node.classList.remove('pp_card_in_court');
    node.classList.remove(`pp_player_${this.playerId}`);
    // Move card to discard pile
    this.court.removeFromZone(cardId, false);
    discardCardAnimation({ cardId, game: this.game });
  }

  discardHandCard({ cardId }: { cardId: string }) {
    if (this.playerId === this.game.getPlayerId()) {
      this.hand.removeFromZone(cardId, false);
    } else {
      dojo.place(tplCard({ cardId }), `cards_${this.playerId}`);
    }
    discardCardAnimation({ cardId, game: this.game });
  }

  discardPrize({ cardId }: { cardId: string }) {
    const node = dojo.byId(cardId);
    node.classList.remove('pp_prize');
    // Move card to discard pile
    this.prizes.removeFromZone(cardId, false);
    discardCardAnimation({ cardId, game: this.game });
  }

  payToPlayer({ playerId, rupees }: { playerId: number; rupees: number }) {
    dojo.place(tplRupee({ rupeeId: 'tempRupee' }), `rupees_${this.playerId}`);
    attachToNewParentNoDestroy('tempRupee', `rupees_${playerId}`);
    // this.game.framework().placeOnObject('tempRupee',`rupees_${this.playerId}`);
    const animation = this.game.framework().slideToObject('tempRupee', `rupees_${playerId}`);
    dojo.connect(animation, 'onEnd', () => {
      this.incCounter({ counter: 'rupees', value: -rupees });
    });
    dojo.connect(animation, 'onEnd', () => {
      dojo.destroy('tempRupee');
      this.game.playerManager.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: rupees });
    });
    animation.play();
  }

  playCard({ card }: { card: Token }) {
    const { region } = this.game.gamedatas.staticData.cards[card.id] as CourtCard;
    if (this.playerId === this.game.getPlayerId()) {
      this.setupCourtCard({ cardId: card.id });
      this.game.move({
        id: card.id,
        to: this.court,
        from: this.getHandZone(),
        addClass: ['pp_card_in_court', `pp_player_${this.playerId}`, `pp_${region}`],
        removeClass: ['pp_card_in_hand'],
        weight: card.state,
      });
      this.removeSideSelectFromCourt();
    } else {
      dojo.place(
        tplCard({ cardId: card.id, extraClasses: `pp_card_in_court pp_player_${this.playerId} pp_${region}` }),
        `cards_${this.playerId}`
      );
      this.setupCourtCard({ cardId: card.id });
      dojo.addClass(card.id, 'pp_moving');
      const div = this.court.container_div;
      attachToNewParentNoDestroy(card.id, div);
      const animation = this.game.framework().slideToObject(card.id, div);
      dojo.connect(animation, 'onEnd', () => {
        dojo.removeClass(card.id, 'pp_moving');
      });
      animation.play();
      this.court.placeInZone(card.id, card.state);
    }
    this.game.tooltipManager.addTooltipToCard({ cardId: card.id });
  }

  addCardToHand({ cardId, from }: { cardId: string; from?: Zone }) {
    if (this.playerId === this.game.getPlayerId() && from) {
      this.game.move({ id: cardId, to: this.hand, from, addClass: ['pp_card_in_hand'], removeClass: ['pp_market_card'] });
    } else if (this.playerId === this.game.getPlayerId()) {
      // No from we need to create card
      dojo.place(tplCard({ cardId, extraClasses: 'pp_card_in_hand' }), 'pp_player_hand_cards');
      this.hand.placeInZone(cardId);
    } else {
      dojo.addClass(cardId, 'pp_moving');
      from.removeFromZone(cardId, true, `player_board_${this.playerId}`);
    }
    this.game.tooltipManager.addTooltipToCard({ cardId });
  }

  addEvent({ cardId, from }: { cardId: string; from: Zone }) {
    if (this.events.getItemNumber() === 0) {
      const node = dojo.byId(`pp_player_events_container_${this.playerId}`);
      node.style.marginTop = '-57px';
    }
    this.game.move({
      id: cardId,
      from,
      to: this.getEventsZone(),
      removeClass: [PP_MARKET_CARD],
    });
    this.game.tooltipManager.addTooltipToCard({ cardId });
  }

  removeTaxCounter() {
    const taxCounter = dojo.byId(`rupees_tableau_${this.playerId}_tax_counter`);
    if (taxCounter) {
      dojo.destroy(taxCounter.id);
    }
  }

  takePrize({ cardId, cardOwnerId }: { cardId: string; cardOwnerId: number }): void {
    debug('item number', this.prizes.getItemNumber());
    this.updatePrizesStyle({ numberOfPrizes: this.prizes.getItemNumber() + 1 });
    this.game.move({
      id: cardId,
      from: this.game.playerManager.getPlayer({ playerId: cardOwnerId }).getCourtZone(),
      to: this.getPrizeZone(),
      addClass: ['pp_prize'],
      removeClass: ['pp_card_in_court', `pp_player_${cardOwnerId}`],
      // weight,
    });
    this.incCounter({ counter: 'influence', value: 1 });
  }

  // TODO (remove cards of other loyalties, remove gifts, remove prizes)
  updatePlayerLoyalty({ coalition }) {
    this.loyalty = coalition;
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
