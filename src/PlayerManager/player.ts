//  .########..##..........###....##....##.########.########.
//  .##.....##.##.........##.##....##..##..##.......##.....##
//  .##.....##.##........##...##....####...##.......##.....##
//  .########..##.......##.....##....##....######...########.
//  .##........##.......#########....##....##.......##...##..
//  .##........##.......##.....##....##....##.......##....##.
//  .##........########.##.....##....##....########.##.....##

class PPPlayer {
  protected court: PaxPamirZone;
  private events: PaxPamirZone;
  private cylinders: PaxPamirZone;
  private handCards: string[];
  private hand: PaxPamirZone;
  protected game: PaxPamirGame;
  private gifts: Record<string, PaxPamirZone> = {};
  private modal: Modal;
  protected playerColor: string;
  private playerHexColor: string;
  protected playerId: number;
  private playerName: string;
  private prizes: PaxPamirZone;
  protected counters: {
    cards: Counter;
    cardsTableau: Counter;
    courtCount: Counter;
    courtLimit: Counter;
    cylinders: Counter;
    economic: Counter;
    handCount: Counter;
    handLimit: Counter;
    influence: Counter;
    intelligence: Counter;
    military: Counter;
    political: Counter;
    rupees: Counter;
    rupeesTableau: Counter;
  } = {
    cards: new ebg.counter(),
    cardsTableau: new ebg.counter(),
    courtCount: new ebg.counter(),
    courtLimit: new ebg.counter(),
    cylinders: new ebg.counter(),
    economic: new ebg.counter(),
    handCount: new ebg.counter(),
    handLimit: new ebg.counter(),
    influence: new ebg.counter(),
    intelligence: new ebg.counter(),
    military: new ebg.counter(),
    political: new ebg.counter(),
    rupees: new ebg.counter(),
    rupeesTableau: new ebg.counter(),
  };

  // private player: PaxPamirPlayer;
  private rulerTokens: PaxPamirZone;
  private loyalty: string;

  constructor({ game, player }: { game: PaxPamirGame; player: PaxPamirPlayer }) {
    // console.log("Player", player);
    this.game = game;
    const playerId = player.id;
    this.playerId = Number(playerId);
    // this.player = player;
    this.playerName = player.name;
    this.playerColor = player.color;
    this.playerHexColor = player.hexColor;
    const gamedatas = game.gamedatas;

    if (this.playerId === this.game.getPlayerId()) {
      dojo.place(tplPlayerHand({ playerId: this.playerId, playerName: this.playerName }), 'pp_player_tableaus', 1);
    }

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
    const playerGamedatas = gamedatas.paxPamirPlayers[this.playerId];

    this.setupCourt({ playerGamedatas });
    this.setupEvents({ playerGamedatas });

    this.setupPrizes({ playerGamedatas });

    this.setupCylinders({ playerGamedatas });
    this.setupGifts({ playerGamedatas });
    this.setupRulerTokens({ gamedatas });
    this.updatePlayerPanel({ playerGamedatas });

    if (playerGamedatas.loyalty && playerGamedatas.loyalty !== 'null') {
      this.updatePlayerLoyalty({ coalition: playerGamedatas.loyalty });
    }
    if (this.game.gameOptions.openHands && this.playerId !== WAKHAN_PLAYER_ID) {
      this.setupHand({ hand: playerGamedatas.hand });
      if (this.modal.isDisplayed()) {
        this.updateModalContent();
      }
    }
  }

  // Setup functions
  setupPlayer({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    const playerGamedatas = gamedatas.paxPamirPlayers[this.playerId];

    this.setupCourt({ playerGamedatas });
    this.setupEvents({ playerGamedatas });

    if (this.playerId !== WAKHAN_PLAYER_ID) {
      this.setupHand({ hand: playerGamedatas.hand });
    }
    this.setupPrizes({ playerGamedatas });
    this.setupCylinders({ playerGamedatas });
    this.setupGifts({ playerGamedatas });
    this.setupRulerTokens({ gamedatas });
    this.setupPlayerPanel({ playerGamedatas });
    if (this.game.gameOptions.openHands && this.playerId !== WAKHAN_PLAYER_ID) {
      this.setupPlayerHandModal();
    }
    if (this.playerId === WAKHAN_PLAYER_ID && gamedatas.wakhanCards) {
      this.setupWakhanDeck({ wakhanCards: gamedatas.wakhanCards });
    }
  }

  getHandCards(): string[] {
    return this.handCards;
  }

  updateModalContent() {
    debug('update modal content');
    this.modal.updateContent(
      tplPlayerHandModal({
        cards: this.handCards,
      })
    );
    this.handCards.forEach((cardId) => {
      this.game.tooltipManager.addTooltipToCard({ cardId, cardIdSuffix: '_modal' });
    });
  }

  updateModalContentAndOpen() {
    this.updateModalContent();
    this.modal.show();
  }

  setupPlayerHandModal() {
    if (this.isWakhan()) {
      return;
    }
    this.modal = new Modal(`player_hand_${this.playerId}`, {
      class: 'pp_player_hand_popin',
      closeIcon: 'fa-times',
      openAnimation: true,
      openAnimationTarget: `cards_${this.playerId}`,
      titleTpl: '<h2 id="popin_${id}_title" class="${class}_title pp_player_background_color_' + this.playerColor + '">${title}</h2>',
      title: dojo.string.substitute(_("${playerName}'s hand"), {
        playerName: this.playerName,
      }),
      contents: tplPlayerHandModal({
        cards: this.handCards,
      }),
      closeAction: 'hide',
      verticalAlign: 'flex-start',
      breakpoint: 1020,
    });

    dojo.connect($(`cards_tableau_${this.playerId}`), 'onclick', () => this.updateModalContentAndOpen());
    dojo.connect($(`cards_${this.playerId}`), 'onclick', () => this.updateModalContentAndOpen());
  }

  async setupCourt({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
    this.court = new PaxPamirZone({
      animationManager: this.game.animationManager,
      containerId: `pp_court_player_${this.playerId}`,
      itemHeight: CARD_HEIGHT,
      itemWidth: CARD_WIDTH,
      itemGap: 16,
    });

    this.court.setupItems(
      playerGamedatas.court.cards.map((card) => {
        const cardId = card.id;
        const { region } = this.game.gamedatas.staticData.cards[cardId] as CourtCard;
        return {
          id: card.id,
          weight: card.state,
          element: tplCard({ cardId, extraClasses: `pp_card_in_court pp_player_${this.playerId} pp_${region}` }),
          zIndex: 1,
        };
      })
    );

    playerGamedatas.court.cards.map(async (card: Token) => {
      const cardId = card.id;
      this.setupCourtCard({ cardId });
      this.game.tooltipManager.addTooltipToCard({ cardId: card.id });
      this.game.spies[cardId].setupItems(
        (playerGamedatas.court.spies[cardId] || []).map((cylinder: Token) => {
          const playerId = cylinder.id.split('_')[1];
          return {
            id: cylinder.id,
            element: tplCylinder({ id: cylinder.id, color: this.game.gamedatas.paxPamirPlayers[playerId].color }),
          };
        })
      );
    });
  }

  setupEvents({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
    this.events = new PaxPamirZone({
      animationManager: this.game.animationManager,
      containerId: `player_tableau_events_${this.playerId}`,
      itemHeight: CARD_HEIGHT,
      itemWidth: CARD_WIDTH,
      itemGap: 16,
    });

    const node = dojo.byId(`pp_player_events_container_${this.playerId}`);
    if (playerGamedatas.events.length > 0) {
      node.style.marginTop = '-57px';
    } else {
      node.style.marginTop = '-209px';
    }
    playerGamedatas.events.forEach((card: EventCard & Token) => {
      const cardId = card.id;
      this.events.setupItems({
        id: cardId,
        element: tplCard({ cardId }),
      });

      this.game.tooltipManager.addTooltipToCard({ cardId });
    });
  }

  setupCylinders({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
    this.cylinders = new PaxPamirZone({
      animationManager: this.game.animationManager,
      containerId: `pp_cylinders_player_${this.playerId}`,
      itemWidth: CYLINDER_WIDTH,
      itemHeight: CYLINDER_HEIGHT,
      itemGap: 8,
    });
    this.cylinders.setupItems(
      playerGamedatas.cylinders.map((cylinder) => ({
        id: cylinder.id,
        element: tplCylinder({ id: cylinder.id, color: playerGamedatas.color }),
        weight: cylinder.state,
      }))
    );
  }

  setupGifts({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
    // Set up gift zones
    ['2', '4', '6'].forEach((value) => {
      const customPattern = () => {
        return { x: 5, y: 5, w: 30, h: 30 };
      };
      this.gifts[value] = new PaxPamirZone({
        animationManager: this.game.animationManager,
        containerId: `pp_gift_${value}_zone_${this.playerId}`,
        itemHeight: 40,
        itemWidth: 40,
        customPattern,
        pattern: 'custom',
      });
    });

    // Add gifts to zones
    const playerGifts = playerGamedatas.gifts;
    Object.keys(playerGifts).forEach((giftValue) => {
      Object.keys(playerGifts[giftValue]).forEach((cylinderId) => {
        this.gifts[giftValue].setupItems({
          id: cylinderId,
          element: tplCylinder({ id: cylinderId, color: this.playerColor }),
        });
      });
    });
  }

  clearHand() {
    this.handCards = [];
    if (this.playerId === this.game.getPlayerId()) {
      dojo.empty(this.hand.getContainerId());
      this.hand = undefined;
    }
  }

  setupHand({ hand }: { hand: PaxPamirPlayer['hand'] }) {
    if (this.game.gameOptions.openHands) {
      this.handCards = hand.map((token) => token.id);
    }

    if (!(this.playerId === this.game.getPlayerId())) {
      return;
    }
    this.hand = new PaxPamirZone({
      animationManager: this.game.animationManager,
      itemHeight: CARD_HEIGHT,
      itemWidth: CARD_WIDTH,
      containerId: 'pp_player_hand_cards',
      itemGap: 16,
    });

    this.hand.setupItems(
      hand.map((card) => ({
        element: tplCard({ cardId: card.id, extraClasses: 'pp_card_in_hand' }),
        id: card.id,
      }))
    );

    hand.forEach((card) => {
      this.game.tooltipManager.addTooltipToCard({ cardId: card.id });
    });
  }

  setupPlayerPanel({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
    // Set up panels
    const player_board_div = $('player_board_' + this.playerId);
    dojo.place(tplPlayerBoard({ playerId: this.playerId }), player_board_div);
    $(`cylinders_${this.playerId}`).classList.add(`pp_player_color_${this.playerColor}`);

    if (playerGamedatas.loyalty && playerGamedatas.loyalty !== 'null') {
      this.updatePlayerLoyalty({ coalition: playerGamedatas.loyalty });
    }

    SUITS.forEach((suit) => {
      this.game.tooltipManager.addSuitTooltip({ suit, nodeId: `pp_${suit}_icon_${this.playerId}` });
    });

    this.counters.cards.create(`card_count_${this.playerId}_counter`);
    this.counters.cardsTableau.create(`card_count_tableau_${this.playerId}_counter`);
    this.counters.courtCount.create(`pp_court_count_${this.playerId}`);
    this.counters.courtLimit.create(`pp_court_limit_${this.playerId}`);
    this.game.tooltipManager.addSuitTooltip({ suit: 'political', nodeId: `pp_player_court_size_${this.playerId}` });

    this.counters.cylinders.create(`cylinder_count_${this.playerId}_counter`);
    this.counters.economic.create(`economic_${this.playerId}_counter`);
    this.counters.influence.create(`influence_${this.playerId}_counter`);
    this.counters.intelligence.create(`intelligence_${this.playerId}_counter`);
    this.counters.military.create(`military_${this.playerId}_counter`);
    this.counters.political.create(`political_${this.playerId}_counter`);
    this.counters.rupees.create(`rupee_count_${this.playerId}_counter`);
    this.counters.rupeesTableau.create(`rupee_count_tableau_${this.playerId}_counter`);
    if (this.playerId === this.game.getPlayerId()) {
      this.counters.handCount.create(`pp_hand_count_${this.playerId}`);
      this.counters.handLimit.create(`pp_hand_limit_${this.playerId}`);
      this.game.tooltipManager.addSuitTooltip({ suit: 'intelligence', nodeId: `pp_player_hand_size_${this.playerId}` });
    }
    this.game.tooltipManager.addPlayerIconToolTips({ playerId: this.playerId, playerColor: this.playerColor });
    this.updatePlayerPanel({ playerGamedatas });
  }

  updatePlayerPanel({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
    const counts = playerGamedatas.counts;

    if (this.game.framework().scoreCtrl?.[this.playerId]) {
      this.game.framework().scoreCtrl[this.playerId].setValue(Number(playerGamedatas.score));
    }

    // Set all values in player panels
    if (playerGamedatas.loyalty && playerGamedatas.loyalty !== 'null' && playerGamedatas.counts.influence.type === PLAYER_INFLUENCE) {
      this.counters.influence.setValue(playerGamedatas.counts.influence.value);
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

    this.counters.courtLimit.setValue(3 + counts.suits.political);
    this.counters.courtCount.setValue(playerGamedatas.court.cards.length);
    if (this.playerId === this.game.getPlayerId()) {
      this.counters.handLimit.setValue(2 + counts.suits.intelligence);
      this.counters.handCount.setValue(counts.cards);
    }
  }

  setupPrizes({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
    this.prizes = new PaxPamirZone({
      animationManager: this.game.animationManager,
      containerId: `pp_prizes_${this.playerId}`,
      itemHeight: CARD_HEIGHT,
      itemWidth: CARD_WIDTH,
      pattern: 'verticalFit',
    });

    const numberOfPrizes = playerGamedatas.prizes.length;
    this.updatePrizesStyle({ numberOfPrizes });
    this.prizes.placeInZone(
      playerGamedatas.prizes.map((card: CourtCard & Token) => ({
        id: card.id,
        element: tplCard({ cardId: card.id, extraClasses: `pp_prize` }),
      }))
    );
  }

  updatePrizesStyle({ numberOfPrizes }: { numberOfPrizes: number }) {
    if (numberOfPrizes > 0) {
      const node = dojo.byId(`pp_prizes_${this.playerId}`);
      // dojo.style(node, 'margin-bottom', `${(CARD_HEIGHT - 15 * numberOfPrizes) * -1}px`);
      // dojo.style(node, 'margin-bottom', `${ (CARD_HEIGHT - (numberOfPrizes - 1) * 25) * -1 }px`);
      dojo.style(node, 'margin-bottom', this.playerId === WAKHAN_PLAYER_ID ? '-184px' : `-194px`);
      dojo.style(node, 'height', `${CARD_HEIGHT + (numberOfPrizes - 1) * 25}px`);
    }
  }

  setupRulerTokens({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.rulerTokens = new PaxPamirZone({
      animationManager: this.game.animationManager,
      containerId: `pp_ruler_tokens_player_${this.playerId}`,
      itemHeight: RULER_TOKEN_HEIGHT,
      itemWidth: RULER_TOKEN_WIDTH,
      itemGap: 10,
    });

    Object.keys(gamedatas.map.rulers).forEach((region: string) => {
      if (gamedatas.map.rulers[region] === Number(this.playerId)) {
        this.rulerTokens.setupItems({
          id: `pp_ruler_token_${region}`,
          element: tplRulerToken({ id: `pp_ruler_token_${region}`, region }),
        });
      }
    });
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

  setupWakhanDeck({ wakhanCards }: { wakhanCards: PaxPamirGamedatas['wakhanCards'] }) {
    const deckNode = dojo.byId('pp_wakhan_deck');

    deckNode.classList.value = '';
    deckNode.classList.add('pp_wakhan_card');
    if (wakhanCards.deck.topCard !== null) {
      const wakhanCardId = wakhanCards.deck.topCard.id;
      deckNode.classList.add(`pp_${wakhanCardId}_back`);
      // this.game.tooltipManager.addWakhanCardTooltip({ wakhanCardId, location: 'deck' });
    } else {
      deckNode.style.opacity = '0';
    }

    const discardNode = dojo.byId('pp_wakhan_discard');
    if (wakhanCards.discardPile.topCard) {
      discardNode.classList.value = '';
      discardNode.classList.add('pp_wakhan_card', `pp_${wakhanCards.discardPile.topCard.id}_front`);
    } else {
      discardNode.style.opacity = '0';
    }
    if (wakhanCards.deck.topCard && wakhanCards.discardPile.topCard) {
      this.game.tooltipManager.addWakhanCardTooltip({
        wakhanDeckCardId: wakhanCards.deck.topCard.id,
        wakhanDiscardCardId: wakhanCards.discardPile.topCard.id,
      });
    }
  }

  clearInterface() {
    dojo.empty(this.court.getContainerId());
    this.court = undefined;
    dojo.empty(this.cylinders.getContainerId());
    this.cylinders = undefined;
    dojo.empty(this.rulerTokens.getContainerId());
    this.rulerTokens = undefined;
    ['2', '4', '6'].forEach((value) => {
      dojo.empty(this.gifts[value].getContainerId());
      this.gifts[value] = undefined;
    });
    dojo.empty(this.events.getContainerId());
    this.events = undefined;
    dojo.empty(this.prizes.getContainerId());
    this.prizes = undefined;
    if (this.game.gameOptions.openHands && this.playerId === this.game.getPlayerId()) {
      dojo.empty(this.hand.getContainerId());
      this.hand = undefined;
    }
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
    const cardsInZone = this.court.getItems();
    return cardsInZone.map((cardId: string) => this.game.getCardInfo({ cardId })) as CourtCard[];
  }

  getCourtZone(): PaxPamirZone {
    return this.court;
  }

  getEventsZone(): PaxPamirZone {
    return this.events;
  }

  getHandZone(): PaxPamirZone {
    return this.hand;
  }

  getHexColor(): string {
    return this.playerHexColor;
  }

  getCylinderZone(): PaxPamirZone {
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

  getPrizeZone(): PaxPamirZone {
    return this.prizes;
  }

  getRupees(): number {
    return this.counters.rupees.getValue();
  }

  getRulerTokensZone(): PaxPamirZone {
    return this.rulerTokens;
  }

  getPlayerColor(): string {
    return this.playerColor;
  }

  getLowestAvailableGift(): number | null {
    if (this.gifts['2'].getItemCount() === 0) {
      return 2;
    }
    if (this.gifts['4'].getItemCount() === 0) {
      return 4;
    }
    if (this.gifts['6'].getItemCount() === 0) {
      return 6;
    }
    return 0;
  }

  getLoyalty(): string {
    return this.loyalty;
  }

  getTaxShelter(): number {
    return this.court
      .getItems()
      .map((cardId) => this.game.getCardInfo({ cardId }))
      .filter((card: CourtCard) => card.suit === ECONOMIC)
      .reduce((total: number, current: CourtCard) => {
        return total + current.rank;
      }, 0);
  }

  setCounter({ counter, value }: PlayerCounterInput): void {
    switch (counter) {
      case 'cards':
        this.counters.cards.setValue(value);
        this.counters.cardsTableau.setValue(value);
        if (this.playerId === this.game.getPlayerId()) {
          this.counters.handCount.setValue(value);
        }
        break;
      case 'intelligence':
        if (this.playerId === this.game.getPlayerId()) {
          this.counters.handLimit.setValue(value);
        }
        break;
      case 'rupees':
        this.counters.rupees.setValue(value);
        this.counters.rupeesTableau.setValue(value);
        break;
      case 'political':
        this.counters.political.setValue(value);
        this.counters.courtLimit.setValue(value);
        break;
      default:
        this.counters[counter].setValue(value);
    }
  }

  incCounter({ counter, value }: PlayerCounterInput): void {
    switch (counter) {
      case 'cards':
        this.counters.cards.incValue(value);
        this.counters.cardsTableau.incValue(value);
        if (this.playerId === this.game.getPlayerId()) {
          this.counters.handCount.incValue(value);
        }
        break;
      case 'intelligence':
        if (this.playerId === this.game.getPlayerId()) {
          this.counters.handLimit.incValue(value);
        }
        break;
      case 'rupees':
        this.counters.rupees.incValue(value);
        this.counters.rupeesTableau.incValue(value);
        break;
      case 'political':
        this.counters.political.incValue(value);
        this.counters.courtLimit.incValue(value);
        break;
      default:
        this.counters[counter].incValue(value);
    }
  }

  toValueCounter({ counter, value }: PlayerCounterInput): void {
    switch (counter) {
      case 'cards':
        this.counters.cards.toValue(value);
        this.counters.cardsTableau.toValue(value);
        if (this.playerId === this.game.getPlayerId()) {
          this.counters.handCount.toValue(value);
        }
        break;
      case 'intelligence':
        if (this.playerId === this.game.getPlayerId()) {
          this.counters.handLimit.toValue(value);
        }
        break;
      case 'rupees':
        this.counters.rupees.toValue(value);
        this.counters.rupeesTableau.toValue(value);
        break;
      case 'political':
        this.counters.political.toValue(value);
        this.counters.courtLimit.toValue(value);
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

  elevateTableau(): string {
    const tableau = dojo.byId(`pp_player_tableau_container_${this.playerId}`);
    const originalZIndex = tableau.style.zIndex;
    tableau.style.zIndex = '11';
    return originalZIndex;
  }

  removeTableauElevation(originalZIndex: string) {
    const tableau = dojo.byId(`pp_player_tableau_container_${this.playerId}`);
    tableau.style.zIndex = originalZIndex;
  }

  addSideSelectToCourt() {
    this.court.placeInZone(
      [
        { element: tplCardSelect({ side: 'left' }), id: 'pp_card_select_left', weight: -1000 },
        { element: tplCardSelect({ side: 'right' }), id: 'pp_card_select_right', weight: 1000 },
      ],
      1
    );
  }

  checkEventContainerHeight() {
    const node = dojo.byId(`pp_player_events_container_${this.playerId}`);
    if (this.events.getItemCount() === 0) {
      node.style.marginTop = '-209px';
    } else {
      node.style.marginTop = '-57px';
    }
  }

  async removeSideSelectFromCourt(): Promise<void> {
    Promise.all([
      this.court.remove({ input: 'pp_card_select_left', destroy: true }),
      this.court.remove({ input: 'pp_card_select_right', destroy: true }),
    ]);
  }

  ownsEventCard({ cardId }: { cardId: string }): boolean {
    return this.events.getItems().includes(cardId);
  }

  getCourtCardsWithSpecialAbility({ specialAbility }: { specialAbility: string }): CourtCard[] {
    return this.court
      .getItems()
      .map((cardId: string) => this.game.getCardInfo({ cardId }) as CourtCard)
      .filter((card: CourtCard) => card.specialAbility === specialAbility);
  }

  hasSpecialAbility({ specialAbility }: { specialAbility: string }): boolean {
    return this.court
      .getItems()
      .map((cardId: string) => this.game.getCardInfo({ cardId }))
      .some((card: CourtCard) => card.specialAbility === specialAbility);
  }

  public isWakhan(): boolean {
    return this.playerId === WAKHAN_PLAYER_ID;
  }

  resetHandCards() {
    if (!this.game.gameOptions.openHands) {
      return;
    }
    this.handCards = [];
  }

  updateHandCards({ action, cardId }: { action: 'ADD' | 'REMOVE'; cardId: string }) {
    if (!this.game.gameOptions.openHands) {
      return;
    }
    if (action === 'ADD') {
      this.handCards.push(cardId);
    } else if (action === 'REMOVE') {
      const index = this.handCards.findIndex((item) => item === cardId);
      if (index < 0) {
        return;
      }
      this.handCards.splice(index, 1);
    }
    if (this.modal.isDisplayed()) {
      this.updateModalContent();
    }
  }

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  async discardCourtCard({ cardId, to = DISCARD }: { cardId: string; to?: 'discardPile' | 'tempDiscardPile' }) {
    const cardInfo = this.game.getCardInfo({ cardId }) as CourtCard;
    this.incCounter({ counter: cardInfo.suit, value: cardInfo.rank * -1 });
    this.incCounter({ counter: 'courtCount', value: -1 });
    if (cardInfo.loyalty && !this.ownsEventCard({ cardId: ECE_RUMOR_CARD_ID })) {
      this.incCounter({ counter: 'influence', value: -1 });
    }

    const node = dojo.byId(cardId);
    node.classList.remove('pp_card_in_court', `pp_player_${this.playerId}`);
    if (to === DISCARD) {
      await this.game.objectManager.discardPile.discardCardFromZone({
        cardId,
        zone: this.court,
      });
    } else {
      await Promise.all([
        this.game.objectManager.tempDiscardPile.getZone().moveToZone({
          elements: { id: cardId },
        }),
        this.court.remove({ input: cardId }),
      ]);
    }
  }

  async discardEventCard({ cardId, to = DISCARD }: { cardId: string; to?: 'discardPile' | 'tempDiscardPile' }) {
    const originalZIndex = this.elevateTableau();
    // Move card to discard pile
    if (to === TEMP_DISCARD) {
      await Promise.all([
        this.game.objectManager.tempDiscardPile.getZone().moveToZone({
          elements: { id: cardId },
        }),
        this.events.remove({ input: cardId }),
      ]);
    } else {
      await this.game.objectManager.discardPile.discardCardFromZone({
        cardId,
        zone: this.events,
      });
    }
    this.removeTableauElevation(originalZIndex);
    this.checkEventContainerHeight();
  }

  async discardHandCard({ cardId, to = DISCARD }: { cardId: string; to?: 'discardPile' | 'tempDiscardPile' }): Promise<void> {
    this.incCounter({ counter: 'cards', value: -1 });
    console.log('discardHand', to, discardMap[to]);
    if (this.playerId === this.game.getPlayerId() && to === DISCARD) {
      await this.game.objectManager.discardPile.discardCardFromZone({
        cardId,
        zone: this.hand,
      });
    } else if (this.playerId === this.game.getPlayerId() && to === TEMP_DISCARD) {
      await Promise.all([
        this.game.objectManager.tempDiscardPile.getZone().moveToZone({
          elements: {
            id: cardId,
          },
          classesToRemove: [PP_CARD_IN_HAND],
        }),
      ]);
    } else if (to === DISCARD) {
      await this.game.objectManager.discardPile.discardCardFromLocation({ cardId, from: `cards_${this.playerId}` });
    } else if (to === TEMP_DISCARD) {
      await this.game.objectManager.tempDiscardPile.getZone().placeInZone({
        id: cardId,
        element: tplCard({ cardId }),
        from: `cards_${this.playerId}`,
      });
    }
    this.updateHandCards({ cardId, action: 'REMOVE' });
  }

  async discardPrize({ cardId }: { cardId: string }) {
    return await this.game.objectManager.discardPile.discardCardFromZone({ cardId, zone: this.prizes });
  }

  async payToPlayer({ playerId, rupees }: { playerId: number; rupees: number }): Promise<void> {
    const element = dojo.place(tplRupee({ rupeeId: 'tempRupee' }), `rupees_${playerId}`);
    const fromRect = $(`rupees_${this.playerId}`)?.getBoundingClientRect();
    this.incCounter({ counter: 'rupees', value: -rupees });
    await this.game.animationManager.play(
      new BgaSlideAnimation<BgaAnimationWithOriginSettings>({
        element,
        transitionTimingFunction: 'linear',
        fromRect,
      })
    );
    element.remove();
    this.game.playerManager.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: rupees });
  }

  async playCard({ card }: { card: Token }): Promise<void> {
    const cardInfo = this.game.getCardInfo({ cardId: card.id }) as CourtCard;
    const { region, suit, rank } = cardInfo;
    this.incCounter({ counter: 'cards', value: -1 });
    if (this.playerId === this.game.getPlayerId()) {
      this.setupCourtCard({ cardId: card.id });
      await Promise.all([
        // this.removeSideSelectFromCourt(),
        this.court.moveToZone({
          elements: { id: card.id, weight: card.state },
          classesToAdd: ['pp_card_in_court', `pp_player_${this.playerId}`, `pp_${region}`],
          classesToRemove: ['pp_card_in_hand'],
          elementsToRemove: { elements: ['pp_card_select_left', 'pp_card_select_right'], destroy: true },
        }),
        this.hand.remove({ input: card.id }),
      ]);
    } else {
      await this.court.placeInZone({
        id: card.id,
        element: tplCard({ cardId: card.id, extraClasses: `pp_card_in_court pp_player_${this.playerId} pp_${region}` }),
        weight: card.state,
        from: `cards_${this.playerId}`,
      });
      this.setupCourtCard({ cardId: card.id });
      this.game.tooltipManager.addTooltipToCard({ cardId: card.id });
    }
    this.incCounter({ counter: suit, value: rank });
    this.incCounter({ counter: 'courtCount', value: 1 });
    if (cardInfo.loyalty && !this.ownsEventCard({ cardId: ECE_RUMOR_CARD_ID })) {
      // TODO: check for loyalty change and then set Counter to 2?
      this.incCounter({ counter: 'influence', value: 1 });
    }
    this.updateHandCards({ cardId: card.id, action: 'REMOVE' });
  }

  async addCardToHand({ cardId, from }: { cardId: string; from?: PaxPamirZone }): Promise<void> {
    if (this.playerId === this.game.getPlayerId() && from) {
      await Promise.all([
        this.hand.moveToZone({ elements: { id: cardId }, classesToAdd: ['pp_card_in_hand'], classesToRemove: [PP_MARKET_CARD] }),
        from.remove({ input: cardId }),
      ]);
    } else if (this.playerId === this.game.getPlayerId()) {
      // No from we need to create card
      await this.hand.placeInZone({ id: cardId, element: tplCard({ cardId, extraClasses: 'pp_card_in_hand' }) });
    } else {
      // Other player so move to player panel and destroy
      await from.removeTo({ id: cardId, to: `cards_${this.playerId}` });
    }
    this.incCounter({ counter: 'cards', value: 1 });
    this.updateHandCards({ cardId, action: 'ADD' });
  }

  async addCardToEvents({ cardId, from }: { cardId: string; from: PaxPamirZone }): Promise<void> {
    const originalZIndex = this.elevateTableau();
    if (this.events.getItemCount() === 0) {
      const node = dojo.byId(`pp_player_events_container_${this.playerId}`);
      node.style.marginTop = '-57px';
    }

    await Promise.all([
      this.events.moveToZone({
        elements: { id: cardId },
        classesToRemove: [PP_MARKET_CARD],
      }),
      from.remove({ input: cardId }),
    ]);
    this.removeTableauElevation(originalZIndex);
  }

  removeTaxCounter() {
    const taxCounter = dojo.byId(`rupees_tableau_${this.playerId}_tax_counter`);
    if (taxCounter) {
      dojo.destroy(taxCounter.id);
    }
  }

  async takePrize({ cardId }: { cardId: string }): Promise<void> {
    this.updatePrizesStyle({ numberOfPrizes: this.prizes.getItemCount() + 1 });
    const node = $(cardId);
    node.style.zIndex = 0;
    await Promise.all([
      this.prizes.moveToZone({
        elements: { id: cardId },
        classesToAdd: [PP_PRIZE],
        zIndex: 0,
      }),
      this.game.objectManager.tempDiscardPile.getZone().remove({ input: cardId }),
    ]);
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

    this.game.tooltipManager.removeInfluenceCountTooltip({ playerId: this.playerId });
    this.game.tooltipManager.addInfluenceCountTooltip({ playerId: this.playerId, coalition });
  }
}
