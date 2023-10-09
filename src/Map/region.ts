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
  private armyZone: PaxPamirZone;
  private tribeZone: PaxPamirZone;
  private rulerZone: PaxPamirZone;
  // clienttranslated name of region
  private name: string;
  // array with ids of all connected borders
  public borders: string[];

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
    this.armyZone = new PaxPamirZone({
      animationManager: this.game.animationManager,
      containerId: `pp_${this.region}_armies`,
      itemWidth: ARMY_WIDTH,
      itemHeight: ARMY_HEIGHT,
      pattern: 'custom',
      customPattern: this.getPatternForArmyZone(),
    });
    regionGamedatas.armies.forEach(({ id }) => {
      this.armyZone.setupItems({
        id,
        element: tplArmy({
          id,
          coalition: id.split('_')[1],
        }),
      });
    });
  }

  setupRulerZone({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.rulerZone = new PaxPamirZone({
      animationManager: this.game.animationManager,
      containerId: `pp_position_ruler_token_${this.region}`,
      itemWidth: RULER_TOKEN_WIDTH,
      itemHeight: RULER_TOKEN_HEIGHT,
    });
    this.ruler = gamedatas.map.rulers[this.region];
    if (this.ruler === null) {
      this.rulerZone.setupItems({
        id: `pp_ruler_token_${this.region}`,
        element: tplRulerToken({ id: `pp_ruler_token_${this.region}`, region: this.region }),
      });
    }
  }

  setupTribeZone({ regionGamedatas }: { regionGamedatas: RegionGamedatas }) {
    this.tribeZone = new PaxPamirZone({
      animationManager: this.game.animationManager,
      containerId: `pp_${this.region}_tribes`,
      itemWidth: TRIBE_WIDTH,
      itemHeight: TRIBE_HEIGHT,
      // itemGap: 12,
      pattern: 'custom',
      customPattern: this.getPatternForTribeZone(),
    });
    regionGamedatas.tribes.forEach(({ id }) => {
      this.tribeZone.setupItems({
        id,
        element: tplCylinder({
          id,
          color: this.game.gamedatas.paxPamirPlayers[id.split('_')[1]].color,
        }),
      });
    });
  }

  clearInterface() {
    dojo.empty(this.armyZone.getContainerId());
    this.armyZone = undefined;
    dojo.empty(this.rulerZone.getContainerId());
    this.rulerZone = undefined;
    dojo.empty(this.tribeZone.getContainerId());
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

  getArmyZone(): PaxPamirZone {
    return this.armyZone;
  }

  getRuler(): number | null {
    return this.ruler;
  }

  getRulerTribes(): string[] {
    if (this.ruler) {
      return this.getTribeZone()
        .getItems()
        .filter((id: string) => {
          return Number(id.split('_')[1]) === this.ruler;
        });
    }
    return [];
  }

  setRuler({ playerId }: { playerId: number | null }) {
    this.ruler = playerId;
  }

  getRulerZone(): PaxPamirZone {
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

  private getPatternForArmyZone() {
    switch (this.region) {
      case HERAT:
        return this.armiesHeratPattern;
      case KABUL:
        return this.armiesKabulPattern;
      case KANDAHAR:
        return this.armiesKandaharPattern;
      case PERSIA:
        return this.armiesPersiaPattern;
      case PUNJAB:
        return this.armiesPunjabPattern;
      case TRANSCASPIA:
        return this.armiesTranscaspiaPattern;
    }
  }

  private getPatternForTribeZone() {
    switch (this.region) {
      case HERAT:
        return this.tribesHeratPattern;
      case KABUL:
        return this.tribesKabulPattern;
      case KANDAHAR:
        return this.tribesKandaharPattern;
      case PERSIA:
        return this.tribesPersiaPattern;
      case PUNJAB:
        return this.tribesPunjabPattern;
      case TRANSCASPIA:
        return this.tribesTranscaspiaPattern;
    }
  }

  public async removeAllArmies(
    armies: {
      [coalition: string]: {
        tokenId: string;
        weight?: number;
      }[];
    } = {}
  ) {
    await Promise.all([
      ...Object.entries(armies).map(async ([key, value]) => {
        await this.game.objectManager.supply.getCoalitionBlocksZone({ coalition: key }).moveToZone({
          elements: value.map(({ tokenId, weight }) => ({ id: tokenId, weight })),
          classesToAdd: [PP_COALITION_BLOCK],
          classesToRemove: [PP_ARMY],
        });
      }),
      this.getArmyZone().removeAll(),
    ]);
  }

  public async removeAllTribes(
    tribes: {
      [playerId: string]: {
        tokenId: string;
        weight?: number;
      }[];
    } = {}
  ) {
    await Promise.all([
      ...Object.entries(tribes).map(async ([key, value]) => {
        const player = this.game.playerManager.getPlayer({ playerId: Number(key) });
        await player.getCylinderZone().moveToZone({
          elements: value.map(({ tokenId, weight }) => ({ id: tokenId, weight })),
        });
        player.incCounter({ counter: 'cylinders', value: -value.length });
      }),
      this.getTribeZone().removeAll(),
    ]);
  }

  public addTempArmy({ coalition, index }: { coalition: string; index: number }) {
    const id = `temp_army_${index}`;
    this.armyZone.placeInZone({
      id,
      element: tplArmy({ id, coalition, classesToAdd: [PP_TEMPORARY] }),
    });
  }

  getCoalitionArmies({ coalitionId }: { coalitionId: string }): string[] {
    return this.armyZone.getItems().filter((blockId: string) => blockId.split('_')[1] === coalitionId);
  }

  private getEnemyArmies({ coalitionId }: { coalitionId: string }): string[] {
    return this.armyZone.getItems().filter((blockId: string) => blockId.split('_')[1] !== coalitionId);
  }

  /**
   * Returns enemy pieces.
   * Enemy pieces are
   * - armies and roads of other coalition
   * - tribes of player loyal to other coalition
   */
  getEnemyPieces(args: { coalitionId: string }): string[] {
    return [...this.getEnemyArmies(args), ...this.getEnemyRoads(args), ...this.getEnemyTribes(args)];
  }

  private getEnemyRoads({ coalitionId }: { coalitionId: string }): string[] {
    let roads = [];
    this.borders.forEach((border: string) => {
      const enemyRoads = this.game.map.getBorder({ border }).getEnemyRoads({ coalitionId });
      roads = roads.concat(enemyRoads);
    });
    return roads;
  }

  private getEnemyTribes({ coalitionId }: { coalitionId: string }): string[] {
    return this.tribeZone.getItems().filter((cylinderId: string) => {
      const playerId = Number(cylinderId.split('_')[1]);
      return coalitionId !== this.game.playerManager.getPlayer({ playerId }).getLoyalty();
    });
  }

  public getPlayerTribes({ playerId }: { playerId: number }) {
    return this.tribeZone.getItems().filter((cylinderId: string) => {
      const cylinderPlayerId = Number(cylinderId.split('_')[1]);
      return cylinderPlayerId === playerId;
    });
  }

  public removeTempArmy({ index }: { index: number }) {
    this.armyZone.remove({ input: `temp_army_${index}`, destroy: true });
  }

  public setSelectable({ callback }: { callback: (props: { regionId: string }) => void }) {
    const element = document.getElementById(`pp_region_${this.region}`);
    if (element) {
      element.classList.add('pp_selectable');
      this.game._connections.push(dojo.connect(element, 'onclick', this, () => callback({ regionId: this.region })));
    }
  }

  public clearSelectable() {
    const element = document.getElementById(`pp_region_${this.region}`);
    if (element) {
      element.classList.remove(PP_SELECTABLE, PP_SELECTED);
    }
    const armySelect = document.getElementById(`pp_${this.region}_armies_select`);
    if (armySelect) {
      armySelect.classList.remove(PP_SELECTABLE, PP_SELECTED);
    }
  }

  // .########..#######..##....##.########
  // ......##..##.....##.###...##.##......
  // .....##...##.....##.####..##.##......
  // ....##....##.....##.##.##.##.######..
  // ...##.....##.....##.##..####.##......
  // ..##......##.....##.##...###.##......
  // .########..#######..##....##.########

  // .########.....###....########.########.########.########..##....##..######.
  // .##.....##...##.##......##.......##....##.......##.....##.###...##.##....##
  // .##.....##..##...##.....##.......##....##.......##.....##.####..##.##......
  // .########..##.....##....##.......##....######...########..##.##.##..######.
  // .##........#########....##.......##....##.......##...##...##..####.......##
  // .##........##.....##....##.......##....##.......##....##..##...###.##....##
  // .##........##.....##....##.......##....########.##.....##.##....##..######.

  // .########.########..####.########..########..######.
  // ....##....##.....##..##..##.....##.##.......##....##
  // ....##....##.....##..##..##.....##.##.......##......
  // ....##....########...##..########..######....######.
  // ....##....##...##....##..##.....##.##.............##
  // ....##....##....##...##..##.....##.##.......##....##
  // ....##....##.....##.####.########..########..######.

  private tribesHeratPattern({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    const multiplier = Math.floor(i / 6);
    console.log('multiplier', multiplier);
    const mod = i % 6;
    switch (mod) {
      case 0:
        return { x: 39 + multiplier * 12, y: 10 + multiplier * 18, w: 30, h: 30 };
      case 1:
        return { x: 53 + multiplier * 12, y: -21 + multiplier * 18, w: 30, h: 30 };
      case 2:
        return { x: 85 + multiplier * 12, y: -31 + multiplier * 18, w: 30, h: 30 };
      case 3:
        return { x: 117 + multiplier * 12, y: -18 + multiplier * 18, w: 30, h: 30 };
      case 4:
        return { x: 129 + multiplier * 12, y: 13 + multiplier * 18, w: 30, h: 30 };
      case 5:
        return { x: 115 + multiplier * 12, y: 44 + multiplier * 18, w: 30, h: 30 };
    }
  }

  private tribesKabulPattern({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    const multiplier = Math.floor(i / 6);
    console.log('multiplier', multiplier);
    const mod = i % 6;
    switch (mod) {
      case 0:
        return { x: 39 + multiplier * 12, y: 26 + multiplier * 18, w: 30, h: 30 };
      case 1:
        return { x: 53 + multiplier * 12, y: -5 + multiplier * 18, w: 30, h: 30 };
      case 2:
        return { x: 85 + multiplier * 12, y: -15 + multiplier * 18, w: 30, h: 30 };
      case 3:
        return { x: 117 + multiplier * 12, y: -3 + multiplier * 18, w: 30, h: 30 };
      case 4:
        return { x: 129 + multiplier * 12, y: 28 + multiplier * 18, w: 30, h: 30 };
      case 5:
        return { x: 115 + multiplier * 12, y: 59 + multiplier * 18, w: 30, h: 30 };
    }
  }

  private tribesKandaharPattern({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    const multiplier = Math.floor(i / 6);
    console.log('multiplier', multiplier);
    const mod = i % 6;
    switch (mod) {
      case 0:
        return { x: 33 + multiplier * 12, y: 20 + multiplier * 18, w: 30, h: 30 };
      case 1:
        return { x: 47 + multiplier * 12, y: -11 + multiplier * 18, w: 30, h: 30 };
      case 2:
        return { x: 79 + multiplier * 12, y: -21 + multiplier * 18, w: 30, h: 30 };
      case 3:
        return { x: 111 + multiplier * 12, y: -8 + multiplier * 18, w: 30, h: 30 };
      case 4:
        return { x: 123 + multiplier * 12, y: 23 + multiplier * 18, w: 30, h: 30 };
      case 5:
        return { x: 109 + multiplier * 12, y: 54 + multiplier * 18, w: 30, h: 30 };
    }
  }

  private tribesPersiaPattern({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    const multiplier = Math.floor(i / 6);
    console.log('multiplier', multiplier);
    const mod = i % 6;
    switch (mod) {
      case 0:
        return { x: 27 + multiplier * 12, y: 10 + multiplier * 18, w: 30, h: 30 };
      case 1:
        return { x: 41 + multiplier * 12, y: -21 + multiplier * 18, w: 30, h: 30 };
      case 2:
        return { x: 73 + multiplier * 12, y: -31 + multiplier * 18, w: 30, h: 30 };
      case 3:
        return { x: 105 + multiplier * 12, y: -18 + multiplier * 18, w: 30, h: 30 };
      case 4:
        return { x: 117 + multiplier * 12, y: 13 + multiplier * 18, w: 30, h: 30 };
      case 5:
        return { x: 103 + multiplier * 12, y: 44 + multiplier * 18, w: 30, h: 30 };
    }
  }

  private tribesPunjabPattern({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    const multiplier = Math.floor(i / 6);
    console.log('multiplier', multiplier);
    const mod = i % 6;
    switch (mod) {
      case 0:
        return { x: -5 + multiplier * 12, y: 20 + multiplier * 18, w: 30, h: 30 };
      case 1:
        return { x: 9 + multiplier * 12, y: -11 + multiplier * 18, w: 30, h: 30 };
      case 2:
        return { x: 41 + multiplier * 12, y: -21 + multiplier * 18, w: 30, h: 30 };
      case 3:
        return { x: 73 + multiplier * 12, y: -8 + multiplier * 18, w: 30, h: 30 };
      case 4:
        return { x: 84 + multiplier * 12, y: 23 + multiplier * 18, w: 30, h: 30 };
      case 5:
        return { x: 71 + multiplier * 12, y: 54 + multiplier * 18, w: 30, h: 30 };
    }
  }

  private tribesTranscaspiaPattern({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    const multiplier = Math.floor(i / 6);
    console.log('multiplier', multiplier);
    const mod = i % 6;
    switch (mod) {
      case 0:
        return { x: 72 + multiplier * 12, y: 0 + multiplier * 18, w: 30, h: 30 };
      case 1:
        return { x: 86 + multiplier * 12, y: -31 + multiplier * 18, w: 30, h: 30 };
      case 2:
        return { x: 118 + multiplier * 12, y: -41 + multiplier * 18, w: 30, h: 30 };
      case 3:
        return { x: 150 + multiplier * 12, y: -28 + multiplier * 18, w: 30, h: 30 };
      case 4:
        return { x: 162 + multiplier * 12, y: 3 + multiplier * 18, w: 30, h: 30 };
      case 5:
        return { x: 148 + multiplier * 12, y: 34 + multiplier * 18, w: 30, h: 30 };
    }
  }

  // ....###....########..##.....##.####.########..######.
  // ...##.##...##.....##.###...###..##..##.......##....##
  // ..##...##..##.....##.####.####..##..##.......##......
  // .##.....##.########..##.###.##..##..######....######.
  // .#########.##...##...##.....##..##..##.............##
  // .##.....##.##....##..##.....##..##..##.......##....##
  // .##.....##.##.....##.##.....##.####.########..######.

  private defaultPattern({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    const multiplier = Math.floor(i / 5);
    console.log('multiplier', multiplier);
    const mod = i % 5;
    return { x: mod * 22, y: multiplier * 15, w: 40, h: 27 };
  }

  private armiesHeratPattern({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    if (numberOfItems <= 11) {
      switch (i) {
        case 0:
          return { x: 1, y: -43, w: 25, h: 40 };
        case 1:
          return { x: 22, y: -5, w: 25, h: 40 };
        case 2:
          return { x: 6, y: 46, w: 25, h: 40 };
        case 3:
          return { x: 40, y: 48, w: 25, h: 40 };
        case 4:
          return { x: 68, y: 56, w: 25, h: 40 };
        case 5:
          return { x: 163, y: -47, w: 25, h: 40 };
        case 6:
          return { x: 98, y: 46, w: 25, h: 40 };
        case 7:
          return { x: 151, y: 5, w: 25, h: 40 };
        case 8:
          return { x: 177, y: 14, w: 25, h: 40 };
        case 9:
          return { x: 125, y: 46, w: 25, h: 40 };
        case 10:
          return { x: 152, y: 55, w: 25, h: 40 };
      }
    } else if (i <= 7) {
      switch (i) {
        case 0:
          return { x: 0, y: -20, w: 25, h: 40 };
        case 1:
          return { x: 22, y: -20, w: 25, h: 40 };
        case 2:
          return { x: 1, y: 5, w: 25, h: 40 };
        case 3:
          return { x: 23, y: 5, w: 25, h: 40 };
        case 4:
          return { x: 151, y: -16, w: 25, h: 40 };
        case 5:
          return { x: 173, y: -16, w: 25, h: 40 };
        case 6:
          return { x: 151, y: 6, w: 25, h: 40 };
        case 7:
          return { x: 173, y: 6, w: 25, h: 40 };
      }
    } else {
      const multiplier = Math.floor((i - 8) / 8);
      console.log('multiplier', multiplier);
      const mod = (i - 8) % 8;
      return { x: 3 + mod * 22, y: 46 + multiplier * 16, w: 25, h: 40 };
    }
  }

  private armiesKabulPattern({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    if (i <= 23) {
      switch (i) {
        case 0:
          return { x: 1, y: -43, w: 25, h: 40 };
        case 1:
          return { x: 22, y: -5, w: 25, h: 40 };
        case 2:
          return { x: 6, y: 46, w: 25, h: 40 };
        case 3:
          return { x: 40, y: 48, w: 25, h: 40 };
        case 4:
          return { x: 68, y: 56, w: 25, h: 40 };
        case 5:
          return { x: 163, y: -47, w: 25, h: 40 };
        case 6:
          return { x: 98, y: 46, w: 25, h: 40 };
        case 7:
          return { x: 151, y: 5, w: 25, h: 40 };
        case 8:
          return { x: 177, y: 14, w: 25, h: 40 };
        case 9:
          return { x: 125, y: 46, w: 25, h: 40 };
        case 10:
          return { x: 152, y: 55, w: 25, h: 40 };
        case 11:
          return { x: 12, y: -89, w: 25, h: 40 };
        case 12:
          return { x: -22, y: -74, w: 25, h: 40 };
        case 13:
          return { x: -50, y: -79, w: 25, h: 40 };
        case 14:
          return { x: -47, y: -35, w: 25, h: 40 };
        case 15:
          return { x: -12, y: 2, w: 25, h: 40 };
        case 16:
          return { x: -42, y: 11, w: 25, h: 40 };
        case 17:
          return { x: 178, y: -89, w: 25, h: 40 };
        case 18:
          return { x: 207, y: -84, w: 25, h: 40 };
        case 19:
          return { x: 194, y: -35, w: 25, h: 40 };
        case 20:
          return { x: 226, y: -43, w: 25, h: 40 };
        case 21:
          return { x: 242, y: -86, w: 25, h: 40 };
        case 22:
          return { x: 207, y: 10, w: 25, h: 40 };
        case 23:
          return { x: 184, y: 56, w: 25, h: 40 };
      }
    } else {
      const multiplier = Math.floor((i - 24) / 8);
      const mod = (i - 24) % 8;
      return { x: 3 + mod * 22, y: 46 + multiplier * 16, w: 25, h: 40 };
    }
  }

  private armiesKandaharPattern({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    if (numberOfItems <= 6) {
      switch (i) {
        case 0:
          return { x: 1, y: -43, w: 25, h: 40 };
        case 1:
          return { x: 22, y: -5, w: 25, h: 40 };
        case 2:
          return { x: -8, y: 5, w: 25, h: 40 };
        case 3:
          return { x: 144, y: -7, w: 25, h: 40 };
        case 4:
          return { x: 160, y: 29, w: 25, h: 40 };
        case 5:
          return { x: 12, y: -86, w: 25, h: 40 };
      }
    } else {
      const multiplier = Math.floor(i / 8);
      const mod = i % 8;
      return { x: -11 + mod * 22, y: 26 + multiplier * 16, w: 25, h: 40 };
    }
  }

  private armiesPersiaPattern({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    if (numberOfItems <= 8) {
      switch (i) {
        case 0:
          return { x: 1, y: -43, w: 25, h: 40 };
        case 1:
          return { x: 24, y: -19, w: 25, h: 40 };
        case 2:
          return { x: -8, y: 5, w: 25, h: 40 };
        case 3:
          return { x: 139, y: -12, w: 25, h: 40 };
        case 4:
          return { x: 125, y: 29, w: 25, h: 40 };
        case 5:
          return { x: 12, y: -86, w: 25, h: 40 };
        case 6:
          return { x: 147, y: 29, w: 25, h: 40 };
        case 7:
          return { x: 13, y: 31, w: 25, h: 40 };
      }
    } else {
      const multiplier = Math.floor(i / 8);
      const mod = i % 8;
      return { x: -9 + mod * 22, y: 18 + multiplier * 16, w: 25, h: 40 };
    }
  }

  private armiesPunjabPattern({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    if (i <= 15) {
      switch (i) {
        case 0:
          return { x: 30, y: -122, w: 25, h: 40 };
        case 1:
          return { x: 57, y: -122, w: 25, h: 40 };
        case 2:
          return { x: -22, y: 2, w: 25, h: 40 };
        case 3:
          return { x: 1, y: 53, w: 25, h: 40 };
        case 4:
          return { x: 65, y: -164, w: 25, h: 40 };
        case 5:
          return { x: 75, y: -208, w: 25, h: 40 };
        case 6:
          return { x: 85, y: -117, w: 25, h: 40 };
        case 7:
          return { x: 28, y: 54, w: 25, h: 40 };
        case 8:
          return { x: 55, y: 56, w: 25, h: 40 };
        case 9:
          return { x: 85, y: 52, w: 25, h: 40 };
        case 10:
          return { x: 13, y: 97, w: 25, h: 40 };
        case 11:
          return { x: 41, y: 99, w: 25, h: 40 };
        case 12:
          return { x: 70, y: 96, w: 25, h: 40 };
        case 13:
          return { x: 25, y: 141, w: 25, h: 40 };
        case 14:
          return { x: 53, y: 142, w: 25, h: 40 };
        case 15:
          return { x: 81, y: 140, w: 25, h: 40 };
      }
    } else {
      const multiplier = Math.floor((i - 16) / 5);
      const mod = (i - 16) % 5;
      return { x: -9 + mod * 22, y: 18 + multiplier * 16, w: 25, h: 40 };
    }
  }

  private armiesTranscaspiaPattern({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    if (i <= 13) {
      switch (i) {
        case 0:
          return { x: -3, y: -126, w: 25, h: 40 };
        case 1:
          return { x: 25, y: -122, w: 25, h: 40 };
        case 2:
          return { x: -6, y: -76, w: 25, h: 40 };
        case 3:
          return { x: 22, y: -75, w: 25, h: 40 };
        case 4:
          return { x: 199, y: -127, w: 25, h: 40 };
        case 5:
          return { x: 229, y: -126, w: 25, h: 40 };
        case 6:
          return { x: 260, y: -128, w: 25, h: 40 };
        case 7:
          return { x: 198, y: -81, w: 25, h: 40 };
        case 8:
          return { x: 226, y: -81, w: 25, h: 40 };
        case 9:
          return { x: 252, y: -79, w: 25, h: 40 };
        case 10:
          return { x: -5, y: -33, w: 25, h: 40 };
        case 11:
          return { x: 23, y: -32, w: 25, h: 40 };
        case 12:
          return { x: 209, y: -36, w: 25, h: 40 };
        case 13:
          return { x: 237, y: -36, w: 25, h: 40 };
      }
    } else {
      const multiplier = Math.floor((i - 14) / 9);
      const mod = (i - 14) % 9;
      return { x: -5 + mod * 22, y: 13 + multiplier * 16, w: 25, h: 40 };
    }
  }
}
