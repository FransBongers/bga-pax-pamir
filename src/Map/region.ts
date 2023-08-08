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
      itemGap: -5,
    });
    regionGamedatas.armies.forEach(({ id }) => {
      this.armyZone.placeInZone({
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
      this.rulerZone.placeInZone({
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
      itemGap: 12,
    });
    regionGamedatas.tribes.forEach(({ id }) => {
      this.tribeZone.placeInZone({
        id,
        element: tplCylinder({
          id,
          color: this.game.gamedatas.players[id.split('_')[1]].color,
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
          classesToRemove: [PP_ARMY]
        });
      }),
      this.getArmyZone().removeAll(),
    ]);
  }

  public async removeAllTribes(tribes: {
    [playerId: string]: {
      tokenId: string;
      weight?: number;
    }[];
  } = {}) {
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
  }
}
