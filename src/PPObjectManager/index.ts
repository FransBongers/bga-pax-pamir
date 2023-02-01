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
    this.favoredSuitZones = {};

    // Setup zones for favored suit marker
    Object.keys(game.gamedatas.suits).forEach((suit) => {
      this.favoredSuitZones[suit] = new ebg.zone();
      setupTokenZone({
        game,
        zone: this.favoredSuitZones[suit],
        nodeId: `pp_favored_suit_${suit}`,
        tokenWidth: FAVORED_SUIT_MARKER_WIDTH,
        tokenHeight: FAVORED_SUIT_MARKER_HEIGHT,
      });
    });

    const suit = game.gamedatas.favoredSuit;
    placeToken({
      game,
      location: this.favoredSuitZones[suit],
      //location: this.favoredSuit['intelligence'], // for testing change of favored suit
      id: `favored_suit_marker`,
      jstpl: 'jstpl_favored_suit_marker',
      jstplProps: {
        id: `favored_suit_marker`,
      },
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
    // blocks per coalition (supply)
    this.coalitionBlocks = {};
    // Setup supply of coalition blocks
    COALITIONS.forEach((coalition) => {
      this.coalitionBlocks[coalition] = new ebg.zone();
      setupTokenZone({
        game,
        zone: this.coalitionBlocks[coalition],
        nodeId: `pp_${coalition}_coalition_blocks`,
        tokenWidth: COALITION_BLOCK_WIDTH,
        tokenHeight: COALITION_BLOCK_HEIGHT,
        itemMargin: 15,
        instantaneous: true,
      });
      game.gamedatas.coalitionBlocks[coalition].forEach((block) => {
        placeToken({
          game,
          location: this.coalitionBlocks[coalition],
          id: block.id,
          jstpl: 'jstpl_coalition_block',
          jstplProps: {
            id: block.id,
            coalition,
          },
        });
      });
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

    this.vpTrackZones = {};
    // Create VP track
    for (let i = 0; i <= 23; i++) {
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

class PPObjectManager {
  private game: PaxPamirGame;
  public favoredSuit: FavoredSuit;
  public supply: Supply;
  public vpTrack: VpTrack;

  constructor(game: PaxPamirGame) {
    console.log('ObjectManager');
    this.game = game;

    this.favoredSuit = new FavoredSuit({ game });
    this.supply = new Supply({ game });
    this.vpTrack = new VpTrack({ game });
  }
}