// .##.....##....###....########.
// .###...###...##.##...##.....##
// .####.####..##...##..##.....##
// .##.###.##.##.....##.########.
// .##.....##.#########.##.......
// .##.....##.##.....##.##.......
// .##.....##.##.....##.##.......

class Map {
  constructor(game) {
    this.game = game;
  }
}

// .########..########..######...####..#######..##....##
// .##.....##.##.......##....##...##..##.....##.###...##
// .##.....##.##.......##.........##..##.....##.####..##
// .########..######...##...####..##..##.....##.##.##.##
// .##...##...##.......##....##...##..##.....##.##..####
// .##....##..##.......##....##...##..##.....##.##...###
// .##.....##.########..######...####..#######..##....##

class Region {
  constructor(game) {
    this.game = game;
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
  constructor(objectManager) {
    console.log("VpTrack");
    this.objectManager = objectManager;
    this.game = objectManager.game;

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
  constructor(game) {
    console.log("ObjectManager");
    this.game = game;

    this.vpTrack = new VpTrack(this);
  }
}
