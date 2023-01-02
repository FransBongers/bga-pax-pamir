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

  constructor({ game }: {game: PaxPamirGame}) {
    console.log("Constructor Favored Suit");
    this.game = game;
    this.favoredSuitZones = {};

    // Setup zones for favored suit marker
    game.gamedatas.suits.forEach((suit) => {
      this.favoredSuitZones[suit.suit] = new ebg.zone();
      setupTokenZone({
        game,
        zone: this.favoredSuitZones[suit.suit],
        nodeId: `pp_favored_suit_${suit.suit}`,
        tokenWidth: FAVORED_SUIT_MARKER_WIDTH,
        tokenHeight: FAVORED_SUIT_MARKER_HEIGHT,
      });
    });

    const suitId = game.gamedatas.favored_suit.suit;
    placeToken({
      game,
      location: this.favoredSuitZones[suitId],
      //location: this.favoredSuit['intelligence'], // for testing change of favored suit
      id: `favored_suit_marker`,
      jstpl: "jstpl_favored_suit_marker",
      jstplProps: {
        id: `favored_suit_marker`,
      },
    });
  }

  getFavoredSuitZone({suit}) {
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
  private coalitionBlocks: Record<string, any>;

  constructor({ game }: {game: PaxPamirGame}) {
    console.log("Constructor Supply");
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
      Object.keys(game.gamedatas.coalition_blocks[coalition]).forEach(
        (blockId) => {
          placeToken({
            game,
            location: this.coalitionBlocks[coalition],
            id: blockId,
            jstpl: "jstpl_coalition_block",
            jstplProps: {
              id: blockId,
              coalition,
            },
          });
        }
      );
    });
  }

  getCoalitionBlocksZone({ coalition }) {
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

  constructor({game}: {game: PaxPamirGame}) {
    console.log("VpTrack");
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
      this.vpTrackZones[i].setPattern("ellipticalfit");
    }
  }

  getZone(score: string): Zone {
    return this.vpTrackZones[score]
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
  public favoredSuit: FavoredSuit;
  public supply: Supply;
  public vpTrack: VpTrack

  constructor(game: PaxPamirGame) {
    console.log("ObjectManager");
    this.game = game;

    this.favoredSuit = new FavoredSuit({ game });
    this.supply = new Supply({ game });
    this.vpTrack = new VpTrack({ game });
  }
}
