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

    SUITS.forEach((suit) => {
      this.game.tooltipManager.addSuitTooltip({ suit, nodeId: `pp_${suit}_icon_${this.playerId}` });
    });

    this.counters.cylinders.create(`cylinder_count_${this.playerId}_counter`);
    this.counters.economic.create(`economic_${this.playerId}_counter`);
    this.counters.intelligence.create(`intelligence_${this.playerId}_counter`);
    this.counters.military.create(`military_${this.playerId}_counter`);
    this.counters.political.create(`political_${this.playerId}_counter`);
    this.counters.rupees.create(`rupee_count_${this.playerId}_counter`);
    this.counters.rupeesTableau.create(`rupee_count_tableau_${this.playerId}_counter`);

    this.wakhanInfluence.afghan.create(`influence_${this.playerId}_afghan_counter`);
    this.wakhanInfluence['british'].create(`influence_${this.playerId}_british_counter`);
    this.wakhanInfluence.russian.create(`influence_${this.playerId}_russian_counter`);
    this.wakhanScore.create(`player_score_${this.playerId}`);

    this.counters.courtCount.create(`pp_court_count_${this.playerId}`);
    this.counters.courtLimit.create(`pp_court_limit_${this.playerId}`);
    this.game.tooltipManager.addSuitTooltip({suit: 'political', nodeId: `pp_player_court_size_${this.playerId}`});


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

    this.counters.courtLimit.setValue(3 + counts.suits.political);
    this.counters.courtCount.setValue(playerGamedatas.court.cards.length);

    if (this.game.gamedatas.wakhanPragmaticLoyalty) {
      this.updateLoyaltyIcon({ pragmaticLoyalty: this.game.gamedatas.wakhanPragmaticLoyalty });
    }
  }

  updateLoyaltyIcon({ pragmaticLoyalty }: { pragmaticLoyalty: string }) {
    COALITIONS.forEach((coalition) => {
      const node = dojo.byId(`loyalty_icon_1_${coalition}`);
      if (!node) {
        return;
      }
      if (pragmaticLoyalty === coalition) {
        node.classList.remove('pp_loyalty_icon_black');
        node.classList.add('pp_loyalty_icon');
      } else {
        node.classList.remove('pp_loyalty_icon');
        node.classList.add('pp_loyalty_icon_black');
      }
    });
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
      const wakhanInfluence: WakhanInfluence = {
        type: 'wakhanInfluence',
        influence: {
          [AFGHAN]: 0,
          [BRITISH]: 0,
          [RUSSIAN]: 0,
        },
      };
      wakhanInfluence.influence[cardInfo.loyalty] = -1;
      this.incWakhanInfluence({wakhanInfluence});
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
    this.incCounter({ counter: 'courtCount', value: 1 });
    if (cardInfo.loyalty && !this.ownsEventCard({ cardId: ECE_RUMOR_CARD_ID })) {
      // TODO: check for loyalty change and then set Counter to 2?
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
    this.incCounter({ counter: 'courtCount', value: 1 });
    if (cardInfo.loyalty && !this.ownsEventCard({ cardId: ECE_RUMOR_CARD_ID })) {
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

  incWakhanInfluence({ wakhanInfluence }: { wakhanInfluence: WakhanInfluence }): void {
    const { influence } = wakhanInfluence;
    this.wakhanInfluence.afghan.incValue(influence.afghan);
    this.wakhanInfluence.british.incValue(influence.british);
    this.wakhanInfluence.russian.incValue(influence.russian);
  }

  toValueWakhanInfluence({ wakhanInfluence }: { wakhanInfluence: WakhanInfluence }): void {
    console.log('toValueWakhanInfluence');
    const { influence } = wakhanInfluence;
    this.wakhanInfluence.afghan.setValue(influence.afghan);
    this.wakhanInfluence.british.setValue(influence.british);
    this.wakhanInfluence.russian.setValue(influence.russian);
  }
}
