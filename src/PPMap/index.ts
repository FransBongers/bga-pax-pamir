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

    this.createBorderZone({ border, zone: this.roadZone });
    Object.keys(game.gamedatas.roads[border]).forEach((id) => {
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
  private ruler: number;
  private armyZone: Zone;
  private tribeZone: Zone;
  private rulerZone: Zone;

  constructor({ game, region }: { game: PaxPamirGame; region: string }) {
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
        jstpl: 'jstpl_army',
        jstplProps: {
          id,
          coalition: id.split('_')[1],
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
        jstpl: 'jstpl_cylinder',
        jstplProps: {
          id,
          color: game.gamedatas.players[id.split('_')[1]].color,
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
    if (this.ruler === 0) {
      placeToken({
        game,
        location: this.rulerZone,
        id: `pp_ruler_token_${region}`,
        jstpl: 'jstpl_ruler_token',
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
    console.log('Constructor Map');
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

  getBorder({ border }: { border: string }): Border {
    return this.borders[border];
  }

  getRegion({ region }: { region: string }): Region {
    return this.regions[region];
  }
}
