//  .########..##..........###....##....##.########.########.
//  .##.....##.##.........##.##....##..##..##.......##.....##
//  .##.....##.##........##...##....####...##.......##.....##
//  .########..##.......##.....##....##....######...########.
//  .##........##.......#########....##....##.......##...##..
//  .##........##.......##.....##....##....##.......##....##.
//  .##........########.##.....##....##....########.##.....##

class PPPlayer {
  protected court: LineStock<Card>;
  private events: LineStock<Card>;
  private cylinders: LineStock<Cylinder>;
  private handCards: string[];
  private hand: LineStock<Card>;
  private handVoid: VoidStock<Card>;
  protected game: PaxPamirGame;
  private gifts: Record<string, LineStock<Cylinder>> = {};
  private modal: Modal;
  protected playerColor: string;
  private playerHexColor: string;
  protected playerId: number;
  private playerName: string;
  private prizes: LineStock<Card>;
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
  private rulerTokens: LineStock<RulerToken>;
  private loyalty: Coalition; // TODO: check start of game value?

  constructor({ game, player }: { game: PaxPamirGame; player: PaxPamirPlayer }) {
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

  setupAdjacentPlayerColors() {
    const previousPlayerColor = this.game.playerManager.getPreviousPlayer({ playerId: this.playerId })?.getColor();
    const nodePrevious: HTMLElement = $(`pp_player_to_left_of_${this.playerId}`);
    if (nodePrevious && previousPlayerColor) {
      nodePrevious.childNodes.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.dataset.color = previousPlayerColor;
        }
      });
    }

    const nextPlayerColor = this.game.playerManager.getNextPlayer({ playerId: this.playerId })?.getColor();
    const nodeNext: HTMLElement = $(`pp_player_to_right_of_${this.playerId}`);
    if (nodeNext && nextPlayerColor) {
      nodeNext.childNodes.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.dataset.color = nextPlayerColor;
        }
      });
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
    this.court = new LineStock<Card>(this.game.cardManager, document.getElementById(`pp_court_player_${this.playerId}`), {
      gap: '8px',
      sort: sortFunction('state'),
    });

    await this.court.addCards(
      playerGamedatas.court.cards.map((data) => ({
        ...data,
        ...this.game.getCardInfo(data.id),
      }))
    );

    playerGamedatas.court.cards.map(async (card: Token) => {
      const cardId = card.id;

      this.game.spies[cardId].addCards(
        (playerGamedatas.court.spies[cardId] || []).map((token) => ({
          ...token,
          color: this.game.gamedatas.paxPamirPlayers[token.id.split('_')[1]].color,
        }))
      );
    });
  }

  setupEvents({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
    this.events = new LineStock<Card>(this.game.cardManager, document.getElementById(`player_tableau_events_${this.playerId}`), {
      center: false,
      gap: '8px',
    });

    const node = dojo.byId(`pp_player_events_container_${this.playerId}`);
    if (playerGamedatas.events.length > 0) {
      node.style.marginTop = 'calc(var(--cardScale) * -57px)';
    } else {
      node.style.marginTop = 'calc(var(--cardScale) * -209px)';
    }
    this.events.addCards(
      playerGamedatas.events.map((token) => ({
        ...token,
        ...this.game.getCardInfo(token.id),
      }))
    );
  }

  setupCylinders({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
    this.cylinders = new LineStock<Cylinder>(this.game.cylinderManager, document.getElementById(`pp_cylinders_player_${this.playerId}`), {
      center: false,
      gap: '0px',
      sort: sortFunction('state'),
    });
    this.cylinders.addCards(
      playerGamedatas.cylinders.map((cylinder) => ({
        ...cylinder,
        color: playerGamedatas.color,
      }))
    );
  }

  setupGifts({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
    // Set up gift zones
    ['2', '4', '6'].forEach((value) => {
      this.gifts[value] = new LineStock<Cylinder>(
        this.game.cylinderManager,
        document.getElementById(`pp_gift_${value}_zone_${this.playerId}`)
      );
    });

    // Add gifts to zones
    const playerGifts = playerGamedatas.gifts;
    Object.keys(playerGifts).forEach((giftValue) => {
      Object.keys(playerGifts[giftValue]).forEach((cylinderId) => {
        this.gifts[giftValue].addCard(
          this.game.getCylinder({
            id: cylinderId,
            state: 0,
            used: 0,
            location: `gifts_${this.playerId}`,
          })
        );
      });
    });
  }

  clearHand() {
    this.handCards = [];
    if (this.playerId === this.game.getPlayerId()) {
      this.hand.removeAll();
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
    this.hand = new LineStock<Card>(this.game.cardManager, document.getElementById('pp_player_hand_cards'), {
      center: false,
    });

    this.hand.addCards(hand.map((token) => ({ ...token, ...this.game.getCardInfo(token.id) })));
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
    this.prizes = new LineStock<Card>(this.game.cardManager, document.getElementById(`pp_prizes_${this.playerId}`), {
      direction: 'column',
      center: false,
      wrap: 'nowrap'
    });

    const numberOfPrizes = playerGamedatas.prizes.length;
    this.updatePrizesStyle({ numberOfPrizes });

    this.prizes.addCards(
      playerGamedatas.prizes.map((token) => ({
        ...token,
        ...this.game.getCardInfo(token.id),
      }))
    );
  }

  updatePrizesStyle({ numberOfPrizes }: { numberOfPrizes: number }) {
    const node = document.getElementById(`pp_prizes_${this.playerId}`);
    let height = 0;
    let marginBottom = 0;
    if (numberOfPrizes > 0) {
      marginBottom = this.playerId === WAKHAN_PLAYER_ID ? -184 : -194;
      height = CARD_HEIGHT + (numberOfPrizes - 1) * 25;
    }
    node.style.marginBottom = `calc(var(--cardScale)* ${marginBottom}px)`;
    node.style.height = `calc(var(--cardScale) * ${height}px)`;
  }

  setupRulerTokens({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.rulerTokens = new LineStock<RulerToken>(
      this.game.rulerTokenManager,
      document.getElementById(`pp_ruler_tokens_player_${this.playerId}`),
      {
        center: false,
      }
    );

    Object.keys(gamedatas.map.rulers).forEach((region: string) => {
      if (gamedatas.map.rulers[region] === Number(this.playerId)) {
        this.rulerTokens.addCard({
          id: `pp_ruler_token_${region}`,
          region,
          state: 0,
          used: 0,
          location: `rulerTokens_${this.playerId}`,
        });
      }
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
    this.court.removeAll();
    // dojo.empty(this.court.getContainerId());
    this.court = undefined;
    this.cylinders.removeAll();
    this.cylinders = undefined;
    this.rulerTokens.removeAll();
    this.rulerTokens = undefined;
    ['2', '4', '6'].forEach((value) => {
      this.gifts[value].removeAll();
      this.gifts[value] = undefined;
    });
    this.events.removeAll();
    this.events = undefined;
    this.prizes.removeAll();
    this.prizes = undefined;
    if (this.game.gameOptions.openHands && this.playerId === this.game.getPlayerId()) {
      this.hand.removeAll();
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
    const cardsInZone = this.court.getCards();
    return cardsInZone.map(({ id }: Card) => this.game.getCardInfo(id)) as CourtCard[];
  }

  getCourtZone(): LineStock<Card> {
    return this.court;
  }

  getEventsZone(): LineStock<Card> {
    return this.events;
  }

  getHandZone(): LineStock<Card> {
    return this.hand;
  }

  getHexColor(): string {
    return this.playerHexColor;
  }

  getCylinderZone(): LineStock<Cylinder> {
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

  getPrizeZone(): LineStock<Card> {
    return this.prizes;
  }

  getRupees(): number {
    return this.counters.rupees.getValue();
  }

  getRulerTokensZone(): LineStock<RulerToken> {
    return this.rulerTokens;
  }

  getPlayerColor(): string {
    return this.playerColor;
  }

  getLowestAvailableGift(): number | null {
    if (this.gifts['2'].getCards().length === 0) {
      return 2;
    }
    if (this.gifts['4'].getCards().length === 0) {
      return 4;
    }
    if (this.gifts['6'].getCards().length === 0) {
      return 6;
    }
    return 0;
  }

  getLoyalty(): Coalition {
    return this.loyalty;
  }

  getTaxShelter(): number {
    return this.court
      .getCards()
      .map(({ id }) => this.game.getCardInfo(id))
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

  private createSelect(side: 'left' | 'right'): SelectCard {
    return {
      id: `pp_card_select_${side}`,
      state: side === 'left' ? -1000 : 1000,
      type: 'select',
    };
  }

  addSideSelectToCourt() {
    this.court.addCards([this.createSelect('left'), this.createSelect('right')]);
    // this.court.placeInZone(
    //   [
    //     { element: tplCardSelect({ side: 'left' }), id: 'pp_card_select_left', weight: -1000 },
    //     { element: tplCardSelect({ side: 'right' }), id: 'pp_card_select_right', weight: 1000 },
    //   ],
    //   1
    // );
  }

  checkEventContainerHeight() {
    const node = dojo.byId(`pp_player_events_container_${this.playerId}`);
    if (this.events.getCards().length === 0) {
      node.style.marginTop = 'calc(var(--cardScale) * -209px)';
    } else {
      node.style.marginTop = 'calc(var(--cardScale) * -57px)';
    }
  }

  async removeSideSelectFromCourt(): Promise<boolean> {
    await Promise.all([this.court.removeCard(this.createSelect('left')), this.court.removeCard(this.createSelect('right'))]);
    return true;
  }

  ownsEventCard({ cardId }: { cardId: string }): boolean {
    return this.events.getCards().some((card) => card.id === cardId);
  }

  getCourtCardsWithSpecialAbility({ specialAbility }: { specialAbility: string }): CourtCard[] {
    return (
      this.court
        .getCards()
        // .map((cardId: string) => this.game.getCardInfo(cardId) as CourtCard)
        .filter((card: Card) => card.type === 'courtCard' && card.specialAbility === specialAbility) as CourtCard[]
    );
  }

  hasSpecialAbility({ specialAbility }: { specialAbility: string }): boolean {
    return this.court.getCards().some((card: CourtCard) => card.specialAbility === specialAbility);
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
    const cardInfo = this.game.getCardInfo(cardId) as CourtCard;
    this.incCounter({ counter: cardInfo.suit, value: cardInfo.rank * -1 });
    this.incCounter({ counter: 'courtCount', value: -1 });
    if (cardInfo.loyalty && !this.ownsEventCard({ cardId: ECE_RUMOR_CARD_ID })) {
      this.incCounter({ counter: 'influence', value: -1 });
    }

    if (to === DISCARD) {
      await this.game.objectManager.discardPile.discardCardFromZone(cardId);
    } else {
      await this.game.objectManager.tempDiscardPile
        .getZone()
        .addCard(this.game.getCard({ id: cardId, state: 0, used: 0, location: 'tempDiscardPile' }));
    }
  }

  async discardEventCard({ cardId, to = DISCARD }: { cardId: string; to?: 'discardPile' | 'tempDiscardPile' }) {
    const originalZIndex = this.elevateTableau();
    // Move card to discard pile
    if (to === TEMP_DISCARD) {
      await this.game.objectManager.tempDiscardPile
        .getZone()
        .addCard(this.game.getCard({ id: cardId, state: 0, used: 0, location: 'tempDiscardPile' }));
    } else {
      await this.game.objectManager.discardPile.discardCardFromZone(cardId);
    }
    this.removeTableauElevation(originalZIndex);
    this.checkEventContainerHeight();
  }

  async discardHandCard({ cardId, to = DISCARD }: { cardId: string; to?: 'discardPile' | 'tempDiscardPile' }): Promise<void> {
    this.incCounter({ counter: 'cards', value: -1 });
    if (this.playerId === this.game.getPlayerId() && to === DISCARD) {
      await this.game.objectManager.discardPile.discardCardFromZone(cardId);
    } else if (this.playerId === this.game.getPlayerId() && to === TEMP_DISCARD) {
      this.game.objectManager.tempDiscardPile.getZone().addCard({
        ...this.game.getCardInfo(cardId),
        state: 0,
        used: 0,
        location: 'temp_discard',
      });
    } else if (to === DISCARD) {
      await this.game.objectManager.discardPile.discardCardFromLocation({ cardId, from: `cards_${this.playerId}` });
    } else if (to === TEMP_DISCARD) {
      await this.game.objectManager.tempDiscardPile.getZone().addCard({
        ...this.game.getCardInfo(cardId),
        state: 0,
        used: 0,
        location: 'temp_discard',
      });
    }
    this.updateHandCards({ cardId, action: 'REMOVE' });
  }

  async discardPrize({ cardId }: { cardId: string }) {
    return await this.game.objectManager.discardPile.discardCardFromZone(cardId);
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

  async playCard(card: Token): Promise<void> {
    const cardInfo = this.game.getCard(card) as CourtCard;
    const { suit, rank } = cardInfo;
    this.incCounter({ counter: 'cards', value: -1 });
    if (this.playerId === this.game.getPlayerId()) {
      await this.removeSideSelectFromCourt();
      await this.court.addCard(cardInfo);
    } else {
      await this.court.addCard(cardInfo, { fromElement: document.getElementById(`cards_${this.playerId}`) });
    }

    this.incCounter({ counter: suit, value: rank });
    this.incCounter({ counter: 'courtCount', value: 1 });
    if (cardInfo.loyalty && !this.ownsEventCard({ cardId: ECE_RUMOR_CARD_ID })) {
      // TODO: check for loyalty change and then set Counter to 2?
      this.incCounter({ counter: 'influence', value: 1 });
    }
    this.updateHandCards({ cardId: card.id, action: 'REMOVE' });
  }

  async addCardToHand(cardToken: Token): Promise<void> {
    const card = this.game.getCard(cardToken);
    if (this.playerId === this.game.getPlayerId()) {
      await this.hand.addCard(card);
    } else {
      const element = this.game.cardManager.getCardElement(card);
      await moveToAnimation({
        game: this.game,
        element,
        toId: `cards_${this.playerId}`,
        remove: true,
      });
      this.game.cardManager.removeCard(card);
    }
    this.incCounter({ counter: 'cards', value: 1 });
    this.updateHandCards({ cardId: card.id, action: 'ADD' });
  }

  async addCardToEvents({ cardId }: { cardId: string }): Promise<void> {
    const originalZIndex = this.elevateTableau();
    if (this.events.getCards().length === 0) {
      const node = dojo.byId(`pp_player_events_container_${this.playerId}`);
      node.style.marginTop = 'calc(var(--cardScale) * -57px)';
    }

    await this.events.addCard({
      ...this.game.getCardInfo(cardId),
      state: 0,
      used: 0,
      location: `events_${this.playerId}`,
    });
    this.removeTableauElevation(originalZIndex);
  }

  removeTaxCounter() {
    const taxCounter = dojo.byId(`rupees_tableau_${this.playerId}_tax_counter`);
    if (taxCounter) {
      dojo.destroy(taxCounter.id);
    }
  }

  async takePrize({ cardId }: { cardId: string }): Promise<void> {
    this.updatePrizesStyle({ numberOfPrizes: this.prizes.getCards().length + 1 });
    const node = $(cardId);
    node.style.zIndex = 0;
    await this.prizes.addCard(
      this.game.getCard({
        id: cardId,
        state: 0,
        used: 0,
        location: `prizes_${this.playerId}`,
      })
    );
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
