class PPWakhanPlayer extends PPPlayer {
  public wakhanScore: Counter;
  private wakhanInfluence: {
    afghan: Counter;
    british: Counter;
    russian: Counter;
  };

  constructor({ game, player }: { game: PaxPamirGame; player: PaxPamirPlayer }) {
    super({ game, player });
  }

  // ..######..########.########.##.....##.########.
  // .##....##.##..........##....##.....##.##.....##
  // .##.......##..........##....##.....##.##.....##
  // ..######..######......##....##.....##.########.
  // .......##.##..........##....##.....##.##.......
  // .##....##.##..........##....##.....##.##.......
  // ..######..########....##.....#######..##.......

  setupPlayerPanel({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
    this.wakhanInfluence = {
      afghan: new ebg.counter(),
      british: new ebg.counter(),
      russian: new ebg.counter(),
    };
    this.wakhanScore = new ebg.counter();
    // Set up panels
    const player_board_div = $('player_board_' + this.playerId);
    dojo.place(tplPlayerBoardWakhan({ playerId: this.playerId }), player_board_div);

    $(`cylinders_${this.playerId}`).classList.add(`pp_player_color_${this.playerColor}`);

    this.counters.cylinders.create(`cylinder_count_${this.playerId}_counter`);
    this.counters.economic.create(`economic_${this.playerId}_counter`);
    this.counters.intelligence.create(`intelligence_${this.playerId}_counter`);
    this.counters.military.create(`military_${this.playerId}_counter`);
    this.counters.political.create(`political_${this.playerId}_counter`);
    this.counters.rupees.create(`rupee_count_${this.playerId}_counter`);
    this.counters.rupeesTableau.create(`rupee_count_tableau_${this.playerId}_counter`);
    console.log('wakhanInfluence', this.wakhanInfluence);
    this.wakhanInfluence.afghan.create(`influence_${this.playerId}_afghan_counter`);
    this.wakhanInfluence['british'].create(`influence_${this.playerId}_british_counter`);
    this.wakhanInfluence.russian.create(`influence_${this.playerId}_russian_counter`);
    this.wakhanScore.create(`player_score_${this.playerId}`);
    this.updatePlayerPanel({ playerGamedatas });
  }

  updatePlayerPanel({ playerGamedatas }: { playerGamedatas: PaxPamirPlayer }) {
    const counts = playerGamedatas.counts;

    this.wakhanScore.setValue(Number(playerGamedatas.score));

    if (playerGamedatas.counts.influence.type === 'wakhanInfluence') {
      this.wakhanInfluence.afghan.setValue(playerGamedatas.counts.influence.influence.afghan);
      this.wakhanInfluence.british.setValue(playerGamedatas.counts.influence.influence.british);
      this.wakhanInfluence.russian.setValue(playerGamedatas.counts.influence.influence.russian);
    }

    this.counters.cylinders.setValue(counts.cylinders);
    this.counters.rupees.setValue(playerGamedatas.rupees);
    this.counters.rupeesTableau.setValue(playerGamedatas.rupees);

    this.counters.economic.setValue(counts.suits.economic);
    this.counters.military.setValue(counts.suits.military);
    this.counters.political.setValue(counts.suits.political);
    this.counters.intelligence.setValue(counts.suits.intelligence);
  }

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  // Only used for OtherPersuasiveMethods event
  async discardHandCard({ cardId, to = DISCARD }: { cardId: string; to?: 'discardPile' | 'tempDiscardPile' }): Promise<void> {
    if (to === DISCARD) {
      await this.game.objectManager.discardPile.discardCardFromLocation({ cardId, from: `cylinders_${this.playerId}` });
    } else if (to === TEMP_DISCARD) {
      await this.game.objectManager.tempDiscardPile.getZone().placeInZone({
        id: cardId,
        element: tplCard({ cardId }),
        from: `cylinders_${this.playerId}`,
      });
    }
  }

  // Only used for OtherPersuasiveMethods event
  async playCard({ card }: { card: Token }): Promise<void> {
    const cardInfo = this.game.getCardInfo({ cardId: card.id }) as CourtCard;
    const { region, suit, rank } = cardInfo;

    await this.court.placeInZone({
      id: card.id,
      element: tplCard({ cardId: card.id, extraClasses: `pp_card_in_court pp_player_${this.playerId} pp_${region}` }),
      weight: card.state,
      from: `cylinders_${this.playerId}`, // Wakhan has no hand cards icon
    });
    this.setupCourtCard({ cardId: card.id });
    this.game.tooltipManager.addTooltipToCard({ cardId: card.id });

    this.incCounter({ counter: suit, value: rank });
    if (cardInfo.loyalty) {
      // TODO: check for loyalty change and then set Counter to 2?
      // TODO: check for event where patriots don't count?
      this.wakhanInfluence[cardInfo.loyalty].incValue(1);
    }
  }

  async radicalizeCardWakhan({ card, from }: { card: Token; from: PaxPamirZone }): Promise<void> {
    const cardInfo = this.game.getCardInfo({ cardId: card.id }) as CourtCard;
    const { region, suit, rank } = cardInfo;

    this.setupCourtCard({ cardId: card.id });
    await Promise.all([
      this.court.moveToZone({
        elements: { id: card.id, weight: card.state },
        classesToAdd: ['pp_card_in_court', `pp_player_${this.playerId}`, `pp_${region}`],
        classesToRemove: ['pp_market_card'],
        elementsToRemove: { elements: ['pp_card_select_left', 'pp_card_select_right'], destroy: true },
      }),
      from.remove({ input: card.id }),
    ]);

    this.incCounter({ counter: suit, value: rank });
    if (cardInfo.loyalty) {
      // TODO: check for event where patriots don't count?
      this.wakhanInfluence[cardInfo.loyalty].incValue(1);
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

  setCounter({ counter, value }: PlayerCounterInput): void {
    if (counter === 'influence' || counter === 'cards') {
      return;
    }
    super.setCounter({ counter, value });
  }

  incCounter({ counter, value }: PlayerCounterInput): void {
    if (counter === 'influence' || counter === 'cards') {
      return;
    }
    super.incCounter({ counter, value });
  }

  toValueCounter({ counter, value }: PlayerCounterInput): void {
    if (counter === 'influence' || counter === 'cards') {
      return;
    }
    super.toValueCounter({ counter, value });
  }
}
