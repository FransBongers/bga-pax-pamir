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
  private type: 'discardPile' | 'tempDiscardPile';

  constructor({ game, containerId, type }: { game: PaxPamirGame; containerId: string; type: 'discardPile' | 'tempDiscardPile' }) {
    console.log('Constructor DiscardPile');
    this.game = game;
    this.type = type;
    this.containterId = containerId;

    this.setup({ gamedatas: game.gamedatas });
  }

  setup({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    if (gamedatas[this.type]) {
      this.setVisibleCard({ cardId: gamedatas[this.type].id });
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
    const fromRect = $(from)?.getBoundingClientRect();
    const element = dojo.place(tplCard({ cardId }), 'pp_pile_discarded_card');
    await this.game.animationManager.play(
      new BgaSlideAnimation<BgaAnimationWithOriginSettings>({
        element,
        transitionTimingFunction: 'linear',
        fromRect,
      })
    );
    this.setVisibleCard({ cardId });
    $(cardId).remove();
    // TODO: check how we can remove this. Right now without pause animation
    // the market starts refreshing which causes a 'shocky' animation
    // await this.game.animationManager.play(new BgaPauseAnimation<BgaAnimationSettings>({}));
  }

  public async discardCardFromZone({ cardId, zone }: { cardId: string; zone: PaxPamirZone }) {
    await zone.removeTo({
      id: cardId,
      to: this.containterId,
      destroy: false,
    });
    this.setVisibleCard({ cardId });
    $(cardId).remove();
  }
}

class TempDiscardPile {
  private game: PaxPamirGame;
  private zone: PaxPamirZone;

  constructor({ game }: { game: PaxPamirGame }) {
    this.game = game;

    this.setup({ gamedatas: game.gamedatas });
  }

  setup({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.zone = new PaxPamirZone({
      animationManager: this.game.animationManager,
      containerId: 'pp_temp_discarded_card',
      itemHeight: CARD_HEIGHT,
      itemWidth: CARD_WIDTH,
    });
    if (gamedatas.tempDiscardPile) {
      const cardId = gamedatas.tempDiscardPile.id;
      this.zone.setupItems({
        id: cardId,
        element: tplCard({ cardId }),
      });
    }
  }

  clearInterface() {
    dojo.empty(this.zone.getContainerId());
    this.zone = undefined;
  }

  getZone(): PaxPamirZone {
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
  private favoredSuitZones: Record<string, PaxPamirZone>;
  private favoredSuit: string;

  constructor({ game }: { game: PaxPamirGame }) {
    console.log('Constructor Favored Suit');
    this.game = game;

    this.setup({ gamedatas: game.gamedatas });
  }

  setup({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.favoredSuitZones = {};

    // Setup zones for favored suit marker
    Object.keys(this.game.gamedatas.staticData.suits).forEach((suit) => {
      this.favoredSuitZones[suit] = new PaxPamirZone({
        animationManager: this.game.animationManager,
        containerId: `pp_favored_suit_${suit}`,
        itemHeight: FAVORED_SUIT_MARKER_HEIGHT,
        itemWidth: FAVORED_SUIT_MARKER_WIDTH,
      });
    });

    this.favoredSuit = gamedatas.favoredSuit;
    this.favoredSuitZones[this.favoredSuit].placeInZone({
      element: tplFavoredSuit({ id: 'favored_suit_marker' }),
      id: 'favored_suit_marker',
    });
  }

  clearInterface() {
    Object.keys(this.favoredSuitZones).forEach((key) => {
      dojo.empty(this.favoredSuitZones[key].getContainerId());
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
    await Promise.all([
      this.favoredSuitZones[suit].moveToZone({
        elements: {
          id: 'favored_suit_marker',
        },
      }),
      this.favoredSuitZones[currentSuit].remove({ input: 'favored_suit_marker' }),
    ]);
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
  private coalitionBlocks: Record<string, PaxPamirZone>;

  constructor({ game }: { game: PaxPamirGame }) {
    console.log('Constructor Supply');
    this.game = game;

    this.setup({ gamedatas: game.gamedatas });
  }

  setup({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.coalitionBlocks = {};
    COALITIONS.forEach((coalition) => {
      this.coalitionBlocks[coalition] = new PaxPamirZone({
        animationManager: this.game.animationManager,
        containerId: `pp_${coalition}_coalition_blocks`,
        itemHeight: COALITION_BLOCK_HEIGHT,
        itemWidth: COALITION_BLOCK_WIDTH,
        itemGap: 15,
      });

      this.coalitionBlocks[coalition].placeInZone(
        gamedatas.coalitionBlocks[coalition].map((block) => ({
          id: block.id,
          element: tplCoalitionBlock({ id: block.id, coalition }),
          weight: block.state,
        }))
      );
    });
  }

  clearInterface() {
    Object.keys(this.coalitionBlocks).forEach((key) => {
      dojo.empty(this.coalitionBlocks[key].getContainerId());
      this.coalitionBlocks[key] = undefined;
    });
  }

  getCoalitionBlocksZone({ coalition }: { coalition: string }): PaxPamirZone {
    return this.coalitionBlocks[coalition];
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
  private vpTrackZones: Record<string, PaxPamirZone>;

  constructor({ game }: { game: PaxPamirGame }) {
    console.log('VpTrack');
    this.game = game;
    this.setupVpTrack({ gamedatas: game.gamedatas });
  }

  clearInterface() {
    for (let i = 0; i <= 23; i++) {
      dojo.empty(this.vpTrackZones[i].getContainerId());
      this.vpTrackZones[i] = undefined;
    }
  }

  setupVpTrack({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.vpTrackZones = {};
    // Create VP track
    for (let i = 0; i <= 23; i++) {
      this.vpTrackZones[i] = new PaxPamirZone({
        animationManager: this.game.animationManager,
        containerId: `pp_vp_track_${i}`,
        itemHeight: CYLINDER_HEIGHT,
        itemWidth: CYLINDER_WIDTH,
        pattern: 'ellipticalFit',
      });
    }

    // Add cylinders
    for (const playerId in gamedatas.players) {
      const player = gamedatas.players[playerId];
      const zone = this.getZone(player.score);
      zone.placeInZone({
        id: `vp_cylinder_${playerId}`,
        element: tplCylinder({ id: `vp_cylinder_${playerId}`, color: player.color }),
      });
    }
  }

  getZone(score: string): PaxPamirZone {
    return this.vpTrackZones[score];
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

  constructor(game: PaxPamirGame) {
    console.log('ObjectManager');
    this.game = game;

    this.discardPile = new DiscardPile({ game, containerId: 'pp_pile_discarded_card', type: 'discardPile' });
    this.tempDiscardPile = new TempDiscardPile({ game });
    this.favoredSuit = new FavoredSuit({ game });
    this.supply = new Supply({ game });
    this.vpTrack = new VpTrack({ game });
  }

  updateInterface({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.discardPile.setup({ gamedatas });
    this.favoredSuit.setup({ gamedatas });
    this.supply.setup({ gamedatas });
    this.tempDiscardPile.setup({ gamedatas });
    this.vpTrack.setupVpTrack({ gamedatas });
  }

  clearInterface() {
    this.discardPile.clearInterface();
    this.favoredSuit.clearInterface();
    this.supply.clearInterface();
    this.tempDiscardPile.clearInterface();
    this.vpTrack.clearInterface();
  }
}
