// .########...#######..########..########..########.########.
// .##.....##.##.....##.##.....##.##.....##.##.......##.....##
// .##.....##.##.....##.##.....##.##.....##.##.......##.....##
// .########..##.....##.########..##.....##.######...########.
// .##.....##.##.....##.##...##...##.....##.##.......##...##..
// .##.....##.##.....##.##....##..##.....##.##.......##....##.
// .########...#######..##.....##.########..########.##.....##

class Border {
  private game: PaxPamirGame;
  private border: string;
  private roadZone: Zone;

  constructor({ game, border }: { game: PaxPamirGame; border: string }) {
    this.game = game;
    this.border = border;
    this.roadZone = new ebg.zone();
    const borderGamedatas = game.gamedatas.map.borders[border];

    this.createBorderZone({ border, zone: this.roadZone });
    borderGamedatas.roads.forEach(({ id }) => {
      placeToken({
        game,
        location: this.roadZone,
        id,
        jstpl: 'jstpl_road',
        jstplProps: {
          id,
          coalition: id.split('_')[1],
        },
      });
    });
  }

  clearZones() {
    clearZone({ zone: this.roadZone });
  }

  createBorderZone({ border, zone }: { border: string; zone: Zone }) {
    zone.create(this.game, `pp_${border}_border`, ROAD_WIDTH, ROAD_HEIGHT);
    // this[`${border}_border`].item_margin = -10;
    // this['transcaspia_armies'].setPattern( 'horizontalfit' );

    // TODO (Frans): at some point we need to update this so it looks nice,
    // probably do a lot more custom
    const borderPattern = {
      herat_kabul: 'horizontalfit',
      herat_kandahar: 'verticalfit',
      herat_persia: 'verticalfit',
      herat_transcaspia: 'custom',
      kabul_transcaspia: 'verticalfit',
      kabul_kandahar: 'horizontalfit',
      kabul_punjab: 'verticalfit',
      kandahar_punjab: 'verticalfit',
      persia_transcaspia: 'horizontalfit',
    };

    zone.setPattern(borderPattern[border]);

    if (border === 'herat_transcaspia') {
      zone.itemIdToCoords = function (i, control_width, no_idea_what_this_is, numberOfItems) {
        if (i % 8 == 0 && numberOfItems === 1) {
          return { x: 50, y: 25, w: 40, h: 27 };
        } else if (i % 8 == 0) {
          return { x: 90, y: -5, w: 40, h: 27 };
        } else if (i % 8 == 1) {
          return { x: 85, y: 5, w: 40, h: 27 };
        } else if (i % 8 == 2) {
          return { x: 70, y: 17, w: 40, h: 27 };
        } else if (i % 8 == 3) {
          return { x: 55, y: 29, w: 40, h: 27 };
        } else if (i % 8 == 4) {
          return { x: 40, y: 41, w: 40, h: 27 };
        } else if (i % 8 == 5) {
          return { x: 35, y: 43, w: 40, h: 27 };
        } else if (i % 8 == 6) {
          return { x: 47, y: 13, w: 40, h: 27 };
        } else if (i % 8 == 7) {
          return { x: 10, y: 63, w: 40, h: 27 };
        }
      };
    }
  }

  getRoadZone() {
    return this.roadZone;
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
  private game: PaxPamirGame;
  private region: string;
  private ruler: number | null;
  private armyZone: Zone;
  private tribeZone: Zone;
  private rulerZone: Zone;

  constructor({ game, region }: { game: PaxPamirGame; region: string }) {
    // console.log('constructor Region ', region);
    this.game = game;
    this.region = region;

    this.setupRegion({ gamedatas: game.gamedatas });
  }

  setupRegion({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    const regionGamedatas: RegionGamedatas = gamedatas.map.regions[this.region];
    this.setupArmyZone({ regionGamedatas });
    this.setupTribeZone({ regionGamedatas });
    this.setupRulerZone({ gamedatas });
  }

  setupArmyZone({ regionGamedatas }: { regionGamedatas: RegionGamedatas }) {
    if (!this.armyZone) {
      this.armyZone = new ebg.zone();
    }
    // Setup army zone
    setupTokenZone({
      game: this.game,
      zone: this.armyZone,
      nodeId: `pp_${this.region}_armies`,
      tokenWidth: ARMY_WIDTH,
      tokenHeight: ARMY_HEIGHT,
      itemMargin: -5,
    });

    this.armyZone.instantaneous = true;
    // place armies
    regionGamedatas.armies.forEach(({ id }) => {
      placeToken({
        game: this.game,
        location: this.armyZone,
        id,
        jstpl: 'jstpl_army',
        jstplProps: {
          id,
          coalition: id.split('_')[1],
        },
      });
    });
    this.armyZone.instantaneous = false;
  }

  setupRulerZone({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    if (!this.rulerZone) {
      this.rulerZone = new ebg.zone();
    }

    // Ruler
    setupTokenZone({
      game: this.game,
      zone: this.rulerZone,
      nodeId: `pp_position_ruler_token_${this.region}`,
      tokenWidth: RULER_TOKEN_WIDTH,
      tokenHeight: RULER_TOKEN_HEIGHT,
    });
    this.rulerZone.instantaneous = true;
    this.ruler = gamedatas.map.rulers[this.region];
    if (this.ruler === null) {
      placeToken({
        game: this.game,
        location: this.rulerZone,
        id: `pp_ruler_token_${this.region}`,
        jstpl: 'jstpl_ruler_token',
        jstplProps: {
          id: `pp_ruler_token_${this.region}`,
          region: this.region,
        },
      });
    }
    this.rulerZone.instantaneous = false;
  }

  setupTribeZone({ regionGamedatas }: { regionGamedatas: RegionGamedatas }) {
    if (!this.tribeZone) {
      this.tribeZone = new ebg.zone();
    }

    // tribe zone
    setupTokenZone({
      game: this.game,
      zone: this.tribeZone,
      nodeId: `pp_${this.region}_tribes`,
      tokenWidth: TRIBE_WIDTH,
      tokenHeight: TRIBE_HEIGHT,
    });

    this.tribeZone.instantaneous = true;
    // tribes
    regionGamedatas.tribes.forEach(({ id }) => {
      placeToken({
        game: this.game,
        location: this.tribeZone,
        id,
        jstpl: 'jstpl_cylinder',
        jstplProps: {
          id,
          color: this.game.gamedatas.players[id.split('_')[1]].color,
        },
      });
    });
    this.tribeZone.instantaneous = false;
  }

  clearZones() {
    clearZone({ zone: this.armyZone });
    clearZone({ zone: this.rulerZone });
    clearZone({ zone: this.tribeZone });
  }

  getArmyZone() {
    return this.armyZone;
  }

  getRuler(): number | null {
    return this.ruler;
  }

  setRuler({ playerId }: { playerId: number | null }) {
    this.ruler = playerId;
  }

  getRulerZone(): Zone {
    return this.rulerZone;
  }

  getTribeZone() {
    return this.tribeZone;
  }
}

// .##.....##....###....########.....##.....##....###....##....##....###.....######...########.########.
// .###...###...##.##...##.....##....###...###...##.##...###...##...##.##...##....##..##.......##.....##
// .####.####..##...##..##.....##....####.####..##...##..####..##..##...##..##........##.......##.....##
// .##.###.##.##.....##.########.....##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
// .##.....##.#########.##...........##.....##.#########.##..####.#########.##....##..##.......##...##..
// .##.....##.##.....##.##...........##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
// .##.....##.##.....##.##...........##.....##.##.....##.##....##.##.....##..######...########.##.....##

class PPMap {
  private game: PaxPamirGame;
  private borders: Record<string, Border>;
  private regions: Record<string, Region>;

  constructor(game: PaxPamirGame) {
    this.game = game;
    this.borders = {};
    this.regions = {};
    REGIONS.forEach((region) => {
      this.regions[region] = new Region({ region, game });
    });

    BORDERS.forEach((border) => {
      this.borders[border] = new Border({ border, game });
    });
  }

  clearZones() {
    Object.values(this.borders).forEach((border) => {
      border.clearZones();
    });
    Object.values(this.regions).forEach((region) => {
      console.log('region', region.getTribeZone().items);
      region.clearZones();
    });
  }

  updateMap({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    Object.values(this.regions).forEach((region) => {
      region.setupRegion({ gamedatas });
    });
  }

  getBorder({ border }: { border: string }): Border {
    return this.borders[border];
  }

  getRegion({ region }: { region: string }): Region {
    return this.regions[region];
  }
}
