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
  // clienttranslated name of region
  private name: string;
  // array with ids of all connected borders
  private borders: string[];

  constructor({ game, region }: { game: PaxPamirGame; region: string }) {
    // console.log('constructor Region ', region);
    this.game = game;
    this.region = region;

    this.setupRegion({ gamedatas: game.gamedatas });
  }

  // ..######..########.########.##.....##.########.
  // .##....##.##..........##....##.....##.##.....##
  // .##.......##..........##....##.....##.##.....##
  // ..######..######......##....##.....##.########.
  // .......##.##..........##....##.....##.##.......
  // .##....##.##..........##....##.....##.##.......
  // ..######..########....##.....#######..##.......

  setupRegion({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    const regionGamedatas: RegionGamedatas = gamedatas.map.regions[this.region];
    this.name = regionGamedatas.name;
    this.borders = regionGamedatas.borders;
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
      itemMargin: 12,
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

  clearInterface() {
    dojo.empty(this.armyZone.container_div);
    this.armyZone = undefined;
    dojo.empty(this.rulerZone.container_div);
    this.rulerZone = undefined;
    dojo.empty(this.tribeZone.container_div);
    this.tribeZone = undefined;
  }

  // ..######...########.########.########.########.########.
  // .##....##..##..........##.......##....##.......##.....##
  // .##........##..........##.......##....##.......##.....##
  // .##...####.######......##.......##....######...########.
  // .##....##..##..........##.......##....##.......##...##..
  // .##....##..##..........##.......##....##.......##....##.
  // ..######...########....##.......##....########.##.....##

  // ..######..########.########.########.########.########.
  // .##....##.##..........##.......##....##.......##.....##
  // .##.......##..........##.......##....##.......##.....##
  // ..######..######......##.......##....######...########.
  // .......##.##..........##.......##....##.......##...##..
  // .##....##.##..........##.......##....##.......##....##.
  // ..######..########....##.......##....########.##.....##

  getArmyZone() {
    return this.armyZone;
  }

  getRuler(): number | null {
    return this.ruler;
  }

  getRulerTribes(): string[] {
    if (this.ruler) {
      return this.getTribeZone()
        .getAllItems()
        .filter((id: string) => {
          return Number(id.split('_')[1]) === this.ruler;
        });
    }
    return [];
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

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  private getEnemyArmies({coalitionId}: {coalitionId: string;}): string[] {
    return this.armyZone.getAllItems().filter((blockId: string) => blockId.split('_')[1] !== coalitionId);
  };

  private getEnemyRoads({coalitionId}: {coalitionId: string;}): string[] {
    let roads = [];
    this.borders.forEach((border: string) => {
      const enemyRoads = this.game.map.getBorder({border}).getEnemyRoads({coalitionId});
      roads = roads.concat(enemyRoads);
    })
    return roads;
  }

  private getEnemyTribes({coalitionId}: {coalitionId: string;}): string[] {
    return this.tribeZone.getAllItems().filter((cylinderId: string) => {
      const playerId = Number(cylinderId.split('_')[1]);
      return coalitionId !== this.game.playerManager.getPlayer({playerId}).getLoyalty();
    })
  }

  /**
   * Returns enemy pieces.
   * Enemy pieces are
   * - armies and roads of other coalition
   * - tribes of player loyal to other coalition
   */
  getEnemyPieces(args: {coalitionId: string;}): string[] {
    return [...this.getEnemyArmies(args), ...this.getEnemyRoads(args),...this.getEnemyTribes(args)];
  }

  getCoalitionArmies({coalitionId}: {coalitionId: string;}): string[] {
    return this.armyZone.getAllItems().filter((blockId: string) => blockId.split('_')[1] === coalitionId);
  }
}
