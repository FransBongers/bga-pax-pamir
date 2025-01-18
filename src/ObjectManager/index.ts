// .########..####..######...######.....###....########..########.
// .##.....##..##..##....##.##....##...##.##...##.....##.##.....##
// .##.....##..##..##.......##........##...##..##.....##.##.....##
// .##.....##..##...######..##.......##.....##.########..##.....##
// .##.....##..##........##.##.......#########.##...##...##.....##
// .##.....##..##..##....##.##....##.##.....##.##....##..##.....##
// .########..####..######...######..##.....##.##.....##.########.

class DiscardPile {
  private game: PaxPamirGame;
  private visibleCardId?: string = undefined;
  private containterId: string;
  private stock: VoidStock<Card>;

  constructor({ game, containerId }: { game: PaxPamirGame; containerId: string }) {
    this.game = game;
    this.containterId = containerId;

    this.setup({ gamedatas: game.gamedatas });
  }

  setup({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    const discardPileTitle = $('pp_discard_pile_title');
    if (!discardPileTitle) {
      const discardPile: HTMLElement = $('pp_discard_pile');
      discardPile.insertAdjacentHTML('afterbegin', `<span id="pp_discard_pile_title">${_('Discard')}</span>`);
    }

    this.stock = new VoidStock<Card>(this.game.cardManager, document.getElementById(this.containterId));

    if (gamedatas.discardPile.topCard) {
      this.setVisibleCard({ cardId: gamedatas.discardPile.topCard.id });
    }
  }

  clearInterface() {
    if (this.visibleCardId) {
      const node: HTMLElement = $(this.containterId);
      node.classList.remove(`pp_${this.visibleCardId}`);
      node.style.opacity = `0`;
      this.visibleCardId = undefined;
    }
  }

  public setVisibleCard({ cardId }: { cardId: string }) {
    const node: HTMLElement = $(this.containterId);
    if (this.visibleCardId) {
      node.classList.replace(`pp_${this.visibleCardId}`, `pp_${cardId}`);
    } else {
      node.classList.add(`pp_${cardId}`);
      node.style.opacity = `1`;
    }
    this.visibleCardId = cardId;
  }

  public async discardCardFromLocation({ cardId, from }: { cardId: string; from: string }) {
    await this.stock.addCard(
      {
        id: cardId,
      } as Card,
      { fromElement: document.getElementById(from) }
    );
    this.setVisibleCard({ cardId });
    this.game.objectManager.incCardCounter({ cardId, location: 'discardPile' });
  }

  public async discardCardFromZone(cardId: string) {
    await this.stock.addCard({
      id: cardId,
    } as Card);
    this.setVisibleCard({ cardId });
    this.game.objectManager.incCardCounter({ cardId, location: 'discardPile' });
  }
}

class TempDiscardPile {
  private game: PaxPamirGame;
  private zone: LineStock<Card>;

  constructor({ game }: { game: PaxPamirGame }) {
    this.game = game;

    this.setup({ gamedatas: game.gamedatas });
  }

  setup({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.zone = new LineStock<Card>(this.game.cardManager, document.getElementById('pp_temp_discarded_card'), { center: false });
    if (gamedatas.tempDiscardPile) {
      this.zone.addCard({
        ...gamedatas.tempDiscardPile,
        ...this.game.getCardInfo(gamedatas.tempDiscardPile.id),
      });
    }
  }

  clearInterface() {
    this.zone.removeAll();
    this.zone = undefined;
  }

  getZone(): LineStock<Card> {
    return this.zone;
  }
}

// .########....###....##.....##..#######..########..########.########.
// .##.........##.##...##.....##.##.....##.##.....##.##.......##.....##
// .##........##...##..##.....##.##.....##.##.....##.##.......##.....##
// .######...##.....##.##.....##.##.....##.########..######...##.....##
// .##.......#########..##...##..##.....##.##...##...##.......##.....##
// .##.......##.....##...##.##...##.....##.##....##..##.......##.....##
// .##.......##.....##....###.....#######..##.....##.########.########.

// ..######..##.....##.####.########
// .##....##.##.....##..##.....##...
// .##.......##.....##..##.....##...
// ..######..##.....##..##.....##...
// .......##.##.....##..##.....##...
// .##....##.##.....##..##.....##...
// ..######...#######..####....##...

class FavoredSuit {
  private game: PaxPamirGame;
  private favoredSuitZones: Record<string, LineStock<Token>>;
  private favoredSuit: string;

  constructor({ game }: { game: PaxPamirGame }) {
    this.game = game;

    this.setup({ gamedatas: game.gamedatas });
  }

  setup({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.favoredSuitZones = {};

    // Setup zones for favored suit marker
    Object.keys(this.game.gamedatas.staticData.suits).forEach((suit) => {
      this.favoredSuitZones[suit] = new LineStock<Token>(
        this.game.favoredSuitMarkerManager,
        document.getElementById(`pp_favored_suit_${suit}`)
      );
    });

    this.favoredSuit = gamedatas.favoredSuit;
    this.favoredSuitZones[this.favoredSuit].addCard({
      id: 'favored_suit_marker',
      location: '',
      state: 0,
      used: 0,
    });
    this.game.market.setMilitarySuitIndicatorVisible({ visible: this.favoredSuit === MILITARY });
  }

  clearInterface() {
    Object.keys(this.favoredSuitZones).forEach((key) => {
      this.favoredSuitZones[key].removeAll();
      this.favoredSuitZones[key] = undefined;
    });
  }

  getFavoredSuitZone({ suit }) {
    return this.favoredSuitZones[suit];
  }

  get(): string {
    return this.favoredSuit;
  }

  async changeTo({ suit }: { suit: string }): Promise<void> {
    const currentSuit = this.favoredSuit;
    this.favoredSuit = suit;
    if (currentSuit === MILITARY) {
      this.game.market.setMilitarySuitIndicatorVisible({ visible: false });
    }
    await this.favoredSuitZones[suit].addCard({
      id: 'favored_suit_marker',
      location: '',
      state: 0,
      used: 0,
    });
    if (this.favoredSuit === MILITARY) {
      this.game.market.setMilitarySuitIndicatorVisible({ visible: true });
    }
  }
}

// ..######..##.....##.########..########..##.......##....##
// .##....##.##.....##.##.....##.##.....##.##........##..##.
// .##.......##.....##.##.....##.##.....##.##.........####..
// ..######..##.....##.########..########..##..........##...
// .......##.##.....##.##........##........##..........##...
// .##....##.##.....##.##........##........##..........##...
// ..######...#######..##........##........########....##...

class Supply {
  private game: PaxPamirGame;
  private coalitionBlocks: Record<string, LineStock<CoalitionBlock>>;

  constructor({ game }: { game: PaxPamirGame }) {
    this.game = game;

    this.setup({ gamedatas: game.gamedatas });
  }

  setup({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.coalitionBlocks = {};
    COALITIONS.forEach((coalition) => {
      this.coalitionBlocks[coalition] = new LineStock<CoalitionBlock>(
        this.game.coalitionBlockManager,
        document.getElementById(`pp_${coalition}_coalition_blocks`),
        { center: false }
      );

      this.coalitionBlocks[coalition].addCards(
        gamedatas.coalitionBlocks[coalition].map((token) => ({
          ...token,
          type: 'supply',
          coalition,
        }))
      );
    });
    this.checkDominantCoalition();
  }

  clearInterface() {
    Object.keys(this.coalitionBlocks).forEach((key) => {
      this.coalitionBlocks[key].removeAll();
      this.coalitionBlocks[key] = undefined;
    });
  }

  getCoalitionBlocksZone({ coalition }: { coalition: string }): LineStock<CoalitionBlock> {
    return this.coalitionBlocks[coalition];
  }

  public checkDominantCoalition() {
    debug('checkDominantCoalition');
    const coalitions = [
      {
        coalition: AFGHAN,
        supplyCount: this.coalitionBlocks[AFGHAN].getCards().length,
      },
      {
        coalition: BRITISH,
        supplyCount: this.coalitionBlocks[BRITISH].getCards().length,
      },
      {
        coalition: RUSSIAN,
        supplyCount: this.coalitionBlocks[RUSSIAN].getCards().length,
      },
    ];
    const isConflictFatigueActive = this.game.playerManager
      .getPlayers()
      .some((player) => player.ownsEventCard({ cardId: ECE_CONFLICT_FATIGUE_CARD_ID }));
    const requiredDifferenceToBeDominant = isConflictFatigueActive ? 2 : 4;
    coalitions.sort((a, b) => a.supplyCount - b.supplyCount);

    const node: HTMLElement = $('pp_dominant_coalition_banner');
    if (coalitions[1].supplyCount - coalitions[0].supplyCount >= requiredDifferenceToBeDominant) {
      const dominantCoalition = coalitions[0].coalition;
      // Update UI dominant coalition
      const log = _('Dominant coalition: ${tkn_coalitionBlack}');
      node.innerHTML = this.game.format_string_recursive(log, {
        tkn_coalitionBlack: dominantCoalition,
      });
      node.classList.remove(PP_AFGHAN, PP_BRITISH, PP_RUSSIAN);
      node.classList.add(`pp_${dominantCoalition}`);
    } else {
      node.innerHTML = _('No dominant coalition');
      node.classList.remove(PP_AFGHAN, PP_BRITISH, PP_RUSSIAN);
      // Update UI no dominant coalition
    }
  }
}

// .##.....##.########.....########.########.....###.....######..##....##
// .##.....##.##.....##.......##....##.....##...##.##...##....##.##...##.
// .##.....##.##.....##.......##....##.....##..##...##..##.......##..##..
// .##.....##.########........##....########..##.....##.##.......#####...
// ..##...##..##..............##....##...##...#########.##.......##..##..
// ...##.##...##..............##....##....##..##.....##.##....##.##...##.
// ....###....##..............##....##.....##.##.....##..######..##....##

class VpTrack {
  private game: PaxPamirGame;
  private vpTrackZones: Record<string, TokenManualPositionStock<Cylinder>>;

  constructor({ game }: { game: PaxPamirGame }) {
    this.game = game;
    this.setupVpTrack({ gamedatas: game.gamedatas });
  }

  clearInterface() {
    for (let i = 0; i <= 23; i++) {
      this.vpTrackZones[i].removeAll();
      this.vpTrackZones[i] = undefined;
    }
  }

  setupVpTrack({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.vpTrackZones = {};
    // Create VP track
    for (let i = 0; i <= 23; i++) {
      this.vpTrackZones[i] = new TokenManualPositionStock(
        this.game.cylinderManager,
        document.getElementById(`pp_vp_track_${i}`),
        {},
        (element: HTMLElement, cards: Cylinder[], lastCard: Cylinder, stock: TokenManualPositionStock<Cylinder>) =>
          updateZoneDislay(this.customPatternVpTrack, element, cards, lastCard, stock)
      );
    }

    // Add cylinders
    for (const playerId in gamedatas.paxPamirPlayers) {
      const player = gamedatas.paxPamirPlayers[playerId];
      const zone = this.getZone(player.score);
      zone.addCard({
        id: `vp_cylinder_${playerId}`,
        color: player.color,
        state: 0,
        used: 0,
        location: `vp_track_${player.score}`,
      });
    }
  }

  getZone(score: string): TokenManualPositionStock<Cylinder> {
    return this.vpTrackZones[score];
  }

  private customPatternVpTrack({ index: i, itemCount: numberOfItems }: ZonePatternInput): ZonePatternOutput {
    switch (i) {
      case 0:
        return { x: 9, y: -16, w: 40, h: 27 };
      case 1:
        return { x: -16, y: 4, w: 40, h: 27 };
      case 2:
        return { x: 36, y: 0, w: 40, h: 27 };
      case 3:
        return { x: 0, y: 34, w: 40, h: 27 };
      case 4:
        return { x: 30, y: 30, w: 40, h: 27 };
    }
  }
}

//  ..#######..########........##.########..######..########
//  .##.....##.##.....##.......##.##.......##....##....##...
//  .##.....##.##.....##.......##.##.......##..........##...
//  .##.....##.########........##.######...##..........##...
//  .##.....##.##.....##.##....##.##.......##..........##...
//  .##.....##.##.....##.##....##.##.......##....##....##...
//  ..#######..########...######..########..######.....##...

//  .##.....##....###....##....##....###.....######...########.########.
//  .###...###...##.##...###...##...##.##...##....##..##.......##.....##
//  .####.####..##...##..####..##..##...##..##........##.......##.....##
//  .##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
//  .##.....##.#########.##..####.#########.##....##..##.......##...##..
//  .##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
//  .##.....##.##.....##.##....##.##.....##..######...########.##.....##

class ObjectManager {
  private game: PaxPamirGame;
  public discardPile: DiscardPile;
  public tempDiscardPile: TempDiscardPile;
  public favoredSuit: FavoredSuit;
  public supply: Supply;
  public vpTrack: VpTrack;
  // counters
  public counters: {
    deck: {
      cards: Counter;
      dominanceCheckCards: Counter;
    };
    discardPile: {
      cards: Counter;
      dominanceCheckCards: Counter;
    };
  } = {
    deck: {
      cards: new ebg.counter(),
      dominanceCheckCards: new ebg.counter(),
    },
    discardPile: {
      cards: new ebg.counter(),
      dominanceCheckCards: new ebg.counter(),
    },
  };

  constructor(game: PaxPamirGame) {
    this.game = game;

    this.discardPile = new DiscardPile({ game, containerId: 'pp_pile_discarded_card' });
    this.tempDiscardPile = new TempDiscardPile({ game });
    this.favoredSuit = new FavoredSuit({ game });
    this.supply = new Supply({ game });
    this.vpTrack = new VpTrack({ game });
    this.setupCardCounters({ gamedatas: game.gamedatas });
  }

  updateInterface({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.discardPile.setup({ gamedatas });
    this.favoredSuit.setup({ gamedatas });
    this.supply.setup({ gamedatas });
    this.tempDiscardPile.setup({ gamedatas });
    this.vpTrack.setupVpTrack({ gamedatas });
    this.updateCardCounters({ gamedatas });
  }

  clearInterface() {
    this.discardPile.clearInterface();
    this.favoredSuit.clearInterface();
    this.supply.clearInterface();
    this.tempDiscardPile.clearInterface();
    this.vpTrack.clearInterface();
  }

  setupCardCounters({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.counters.deck.cards.create('pp_deck_counter');
    this.counters.deck.dominanceCheckCards.create('pp_deck_counter_dominance_check');
    this.counters.discardPile.cards.create('pp_discard_pile_counter');
    this.counters.discardPile.dominanceCheckCards.create('pp_discard_pile_counter_dominance_check');
    this.updateCardCounters({ gamedatas });
  }

  updateCardCounters({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.counters.deck.cards.setValue(gamedatas.deck.cardCount);
    this.counters.deck.dominanceCheckCards.setValue(gamedatas.deck.dominanceCheckCount);
    this.counters.discardPile.cards.setValue(gamedatas.discardPile.cardCount);
    this.counters.discardPile.dominanceCheckCards.setValue(gamedatas.discardPile.dominanceCheckCount);
  }

  incCardCounter({ cardId, location }: { cardId: string; location: 'deck' | 'discardPile' }) {
    const cardInfo = this.game.getCardInfo(cardId);
    const isDominanceCheck = cardInfo.type === EVENT_CARD && cardInfo.discarded.effect === ECE_DOMINANCE_CHECK;
    const increase = location === 'deck' ? -1 : 1;
    this.game.objectManager.counters[location].cards.incValue(increase);
    if (isDominanceCheck) {
      this.game.objectManager.counters[location].dominanceCheckCards.incValue(increase);
    }
  }
}
