// .########...#######..########..########..########.########.
// .##.....##.##.....##.##.....##.##.....##.##.......##.....##
// .##.....##.##.....##.##.....##.##.....##.##.......##.....##
// .########..##.....##.########..##.....##.######...########.
// .##.....##.##.....##.##...##...##.....##.##.......##...##..
// .##.....##.##.....##.##....##..##.....##.##.......##....##.
// .########...#######..##.....##.########..########.##.....##

class Border {
  constructor(game) {
    console.log("Constructor Border");
    this.game = game;
  }
}

// .##.....##....###....########.....##.....##....###....##....##....###.....######...########.########.
// .###...###...##.##...##.....##....###...###...##.##...###...##...##.##...##....##..##.......##.....##
// .####.####..##...##..##.....##....####.####..##...##..####..##..##...##..##........##.......##.....##
// .##.###.##.##.....##.########.....##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
// .##.....##.#########.##...........##.....##.#########.##..####.#########.##....##..##.......##...##..
// .##.....##.##.....##.##...........##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
// .##.....##.##.....##.##...........##.....##.##.....##.##....##.##.....##..######...########.##.....##

class MapManager {
  constructor(game) {
    console.log("Constructor Map");
    this.game = game;
    this.regions = {};
    REGIONS.forEach((region) => {
      this.regions[region] = new Region({ region, game });
    });
  }

  getRegion({ region }) {
    return this.regions[region];
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
  constructor({ game, region }) {
    // console.log('constructor Region ', region);
    this.game = game;
    this.region = region;
    this.armyZone = new ebg.zone();
    this.tribeZone = new ebg.zone();
    this.rulerZone = new ebg.zone();

    // Setup army zone
    setupTokenZone({
      game,
      zone: this.armyZone,
      nodeId: `pp_${region}_armies`,
      tokenWidth: ARMY_WIDTH,
      tokenHeight: ARMY_HEIGHT,
      itemMargin: -5,
    });
    // place armies
    Object.keys(game.gamedatas.armies[region]).forEach((id) => {
      placeToken({
        game,
        location: this.armyZone,
        id,
        jstpl: "jstpl_army",
        jstplProps: {
          id,
          coalition: id.split("_")[1],
        },
      });
    });

    // tribe zone
    setupTokenZone({
      game,
      zone: this.tribeZone,
      nodeId: `pp_${region}_tribes`,
      tokenWidth: TRIBE_WIDTH,
      tokenHeight: TRIBE_HEIGHT,
    });

    // tribes
    Object.keys(game.gamedatas.tribes[region]).forEach((id) => {
      placeToken({
        game,
        location: this.tribeZone,
        id,
        jstpl: "jstpl_cylinder",
        jstplProps: {
          id,
          color: game.gamedatas.players[id.split("_")[1]].color,
        },
      });
    });

    // Ruler
    setupTokenZone({
      game,
      zone: this.rulerZone,
      nodeId: `pp_position_ruler_token_${region}`,
      tokenWidth: RULER_TOKEN_WIDTH,
      tokenHeight: RULER_TOKEN_HEIGHT,
    });

    this.ruler = game.gamedatas.rulers[region];
    if (this.ruler == 0) {
      placeToken({
        game,
        location: this.rulerZone,
        id: `pp_ruler_token_${region}`,
        jstpl: "jstpl_ruler_token",
        jstplProps: {
          id: `pp_ruler_token_${region}`,
          region,
        },
      });
    }
  }

  getArmyZone() {
    return this.armyZone;
  }

  getRulerZone() {
    this.rulerZone;
  }

  getTribeZone() {
    return this.tribeZone;
  }
}
