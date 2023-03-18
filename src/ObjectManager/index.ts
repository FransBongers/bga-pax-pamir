// .########..####..######...######.....###....########..########.
// .##.....##..##..##....##.##....##...##.##...##.....##.##.....##
// .##.....##..##..##.......##........##...##..##.....##.##.....##
// .##.....##..##...######..##.......##.....##.########..##.....##
// .##.....##..##........##.##.......#########.##...##...##.....##
// .##.....##..##..##....##.##....##.##.....##.##....##..##.....##
// .########..####..######...######..##.....##.##.....##.########.

class DiscardPile {
  private game: PaxPamirGame;

  constructor({ game }: { game: PaxPamirGame }) {
    console.log('Constructor DiscardPile');
    this.game = game;

    this.setup({ gamedatas: game.gamedatas });
  }

  setup({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    if(gamedatas.discardPile) {
      dojo.place(tplCard({ cardId: gamedatas.discardPile.id }), 'pp_discard_pile');
    }
  }

  clearInterface() {
    dojo.empty('pp_discard_pile');
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
  private favoredSuitZones: Record<string, any>;

  constructor({ game }: { game: PaxPamirGame }) {
    console.log('Constructor Favored Suit');
    this.game = game;

    this.setup({ gamedatas: game.gamedatas });
  }

  setup({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.favoredSuitZones = {};

    // Setup zones for favored suit marker
    Object.keys(this.game.gamedatas.staticData.suits).forEach((suit) => {
      this.favoredSuitZones[suit] = new ebg.zone();
      setupTokenZone({
        game: this.game,
        zone: this.favoredSuitZones[suit],
        nodeId: `pp_favored_suit_${suit}`,
        tokenWidth: FAVORED_SUIT_MARKER_WIDTH,
        tokenHeight: FAVORED_SUIT_MARKER_HEIGHT,
      });
    });

    const suit = gamedatas.favoredSuit;
    this.favoredSuitZones[suit].instantaneous = true;
    placeToken({
      game: this.game,
      location: this.favoredSuitZones[suit],
      //location: this.favoredSuit['intelligence'], // for testing change of favored suit
      id: `favored_suit_marker`,
      jstpl: 'jstpl_favored_suit_marker',
      jstplProps: {
        id: `favored_suit_marker`,
      },
    });
    this.favoredSuitZones[suit].instantaneous = false;
  }

  clearInterface() {
    Object.keys(this.favoredSuitZones).forEach((key) => {
      dojo.empty(this.favoredSuitZones[key].container_div);
      this.favoredSuitZones[key] = undefined;
    });
  }

  getFavoredSuitZone({ suit }) {
    return this.favoredSuitZones[suit];
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
  private coalitionBlocks: Record<string, Zone>;

  constructor({ game }: { game: PaxPamirGame }) {
    console.log('Constructor Supply');
    this.game = game;

    this.setup({ gamedatas: game.gamedatas });
  }

  setup({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    // blocks per coalition (supply)
    this.coalitionBlocks = {};
    // Setup supply of coalition blocks
    COALITIONS.forEach((coalition) => {
      this.coalitionBlocks[coalition] = new ebg.zone();
      setupTokenZone({
        game: this.game,
        zone: this.coalitionBlocks[coalition],
        nodeId: `pp_${coalition}_coalition_blocks`,
        tokenWidth: COALITION_BLOCK_WIDTH,
        tokenHeight: COALITION_BLOCK_HEIGHT,
        itemMargin: 15,
        instantaneous: true,
      });
      gamedatas.coalitionBlocks[coalition].forEach((block) => {
        placeToken({
          game: this.game,
          location: this.coalitionBlocks[coalition],
          id: block.id,
          jstpl: 'jstpl_coalition_block',
          jstplProps: {
            id: block.id,
            coalition,
          },
          weight: block.state,
        });
      });
    });
  }

  clearInterface() {
    Object.keys(this.coalitionBlocks).forEach((key) => {
      dojo.empty(this.coalitionBlocks[key].container_div);
      this.coalitionBlocks[key] = undefined;
    });
  }

  getCoalitionBlocksZone({ coalition }: { coalition: string }) {
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
  private vpTrackZones: Record<string, Zone>;

  constructor({ game }: { game: PaxPamirGame }) {
    console.log('VpTrack');
    this.game = game;
    this.setupVpTrack({ gamedatas: game.gamedatas });
  }

  clearInterface() {
    for (let i = 0; i <= 23; i++) {
      dojo.empty(this.vpTrackZones[i].container_div);
      this.vpTrackZones[i] = undefined;
    }
  }

  setupVpTrack({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.vpTrackZones = {};
    // Create VP track
    for (let i = 0; i <= 23; i++) {
      if (this.vpTrackZones[i]) {
        this.vpTrackZones[i].removeAll();
      } else {
        this.vpTrackZones[i] = new ebg.zone();
        setupTokenZone({
          game: this.game,
          zone: this.vpTrackZones[i],
          nodeId: `pp_vp_track_${i}`,
          tokenWidth: CYLINDER_WIDTH,
          tokenHeight: CYLINDER_HEIGHT,
        });
        this.vpTrackZones[i].setPattern('ellipticalfit');
      }
    }

    // Add cylinders
    for (const playerId in gamedatas.players) {
      const player = gamedatas.players[playerId];
      const zone = this.getZone(player.score);
      zone.instantaneous = true;
      placeToken({
        game: this.game,
        location: zone,
        id: `vp_cylinder_${playerId}`,
        jstpl: 'jstpl_cylinder',
        jstplProps: {
          id: `vp_cylinder_${playerId}`,
          color: player.color,
        },
      });
      zone.instantaneous = false;
    }
  }

  getZone(score: string): Zone {
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
  public favoredSuit: FavoredSuit;
  public supply: Supply;
  public vpTrack: VpTrack;

  constructor(game: PaxPamirGame) {
    console.log('ObjectManager');
    this.game = game;

    this.discardPile = new DiscardPile({ game });
    this.favoredSuit = new FavoredSuit({ game });
    this.supply = new Supply({ game });
    this.vpTrack = new VpTrack({ game });
  }

  updateInterface({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.discardPile.setup({ gamedatas });
    this.favoredSuit.setup({ gamedatas });
    this.supply.setup({ gamedatas });
    this.vpTrack.setupVpTrack({ gamedatas });
  }

  clearInterface() {
    this.discardPile.clearInterface();
    this.favoredSuit.clearInterface();
    this.supply.clearInterface();
    this.vpTrack.clearInterface();
  }
}
