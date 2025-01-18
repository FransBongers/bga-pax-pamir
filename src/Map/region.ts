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
  private armyZone: TokenManualPositionStock<CoalitionBlock>;
  private tribeZone: TokenManualPositionStock<Cylinder>;
  private rulerZone: LineStock<RulerToken>;
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
    this.armyZone = new TokenManualPositionStock<CoalitionBlock>(
      this.game.coalitionBlockManager,
      document.getElementById(`pp_${this.region}_armies`),
      {},
      (element: HTMLElement, cards: CoalitionBlock[], lastCard: CoalitionBlock, stock: TokenManualPositionStock<CoalitionBlock>) =>
        updateZoneDislay(this.getPatternForArmyZone(), element, cards, lastCard, stock)
    );

    this.armyZone.addCards(
      regionGamedatas.armies.map((token) => ({
        ...token,
        coalition: token.id.split('_')[1] as Coalition,
        type: 'army',
      }))
    );
  }

  createRuleToken(): RulerToken {
    return {
      id: `pp_ruler_token_${this.region}`,
      region: this.region,
      state: 0,
      used: 0,
      location: this.region,
    };
  }

  setupRulerZone({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    this.rulerZone = new LineStock<RulerToken>(
      this.game.rulerTokenManager,
      document.getElementById(`pp_position_ruler_token_${this.region}`),
      {
        center: false,
      }
    );

    this.ruler = gamedatas.map.rulers[this.region];
    if (this.ruler === null) {
      this.rulerZone.addCard(this.createRuleToken());
    }
  }

  setupTribeZone({ regionGamedatas }: { regionGamedatas: RegionGamedatas }) {
    this.tribeZone = new TokenManualPositionStock<Cylinder>(
      this.game.cylinderManager,
      document.getElementById(`pp_${this.region}_tribes`),
      {},
      (element: HTMLElement, cards: Cylinder[], lastCard: Cylinder, stock: TokenManualPositionStock<Cylinder>) =>
        updateZoneDislay(this.getPatternForTribeZone(), element, cards, lastCard, stock)
    );

    this.tribeZone.addCards(
      regionGamedatas.tribes.map((token) => ({
        ...token,
        color: this.game.gamedatas.paxPamirPlayers[token.id.split('_')[1]].color,
      }))
    );
  }

  clearInterface() {
    this.armyZone.removeAll();
    this.armyZone = undefined;
    this.rulerZone.removeAll();
    this.rulerZone = undefined;
    this.tribeZone.removeAll();
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

  getArmyZone(): TokenManualPositionStock<CoalitionBlock> {
    return this.armyZone;
  }

  getRuler(): number | null {
    return this.ruler;
  }

  getRulerTribes(): string[] {
    if (this.ruler) {
      return this.getTribeZone()
        .getCards()
        .filter(({ id }: Cylinder) => {
          return Number(id.split('_')[1]) === this.ruler;
        })
        .map(({ id }) => id);
    }
    return [];
  }

  setRuler({ playerId }: { playerId: number | null }) {
    this.ruler = playerId;
  }

  getRulerZone(): LineStock<RulerToken> {
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
        return armiesHeratPattern;
      case KABUL:
        return armiesKabulPattern;
      case KANDAHAR:
        return armiesKandaharPattern;
      case PERSIA:
        return armiesPersiaPattern;
      case PUNJAB:
        return armiesPunjabPattern;
      case TRANSCASPIA:
        return armiesTranscaspiaPattern;
    }
  }

  private getPatternForTribeZone() {
    switch (this.region) {
      case HERAT:
        return tribesHeratPattern;
      case KABUL:
        return tribesKabulPattern;
      case KANDAHAR:
        return tribesKandaharPattern;
      case PERSIA:
        return tribesPersiaPattern;
      case PUNJAB:
        return tribesPunjabPattern;
      case TRANSCASPIA:
        return tribesTranscaspiaPattern;
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
      ...Object.entries(armies).map(async ([key, value]) =>
        this.game.objectManager.supply.getCoalitionBlocksZone({ coalition: key }).addCards(
          value.map((block) => ({
            id: block.tokenId,
            state: block.weight,
            used: 0,
            location: `supply_${key}`,
            coalition: key as Coalition,
            type: 'supply',
          }))
        )
      ),
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
        await player.getCylinderZone().addCards(
          value.map(({ tokenId, weight }) =>
            this.game.getCylinder({
              id: tokenId,
              state: weight,
              used: 0,
              location: `cylinders_${player.getPlayerId()}`,
            })
          )
        );
        player.incCounter({ counter: 'cylinders', value: -value.length });
      }),
      this.getTribeZone().removeAll(),
    ]);
  }

  private createTempArmy(coalition: Coalition, index: number): CoalitionBlock {
    const id = `temp_army_${index}`;
    return {
      id,
      state: 1000,
      location: this.region,
      coalition,
      type: 'army',
      used: 0,
    };
  }

  public addTempArmy({ coalition, index }: { coalition: Coalition; index: number }) {
    this.armyZone.addCard(this.createTempArmy(coalition, index));
  }

  getCoalitionArmies({ coalitionId }: { coalitionId: string }): string[] {
    return this.armyZone
      .getCards()
      .filter((block: CoalitionBlock) => block.id.split('_')[1] === coalitionId)
      .map((block) => block.id);
  }

  private getEnemyArmies({ coalitionId }: { coalitionId: string }): string[] {
    return this.armyZone
      .getCards()
      .filter((block: CoalitionBlock) => block.id.split('_')[1] !== coalitionId)
      .map((block) => block.id);
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
    return this.tribeZone
      .getCards()
      .filter((cylinder: Cylinder) => {
        const playerId = Number(cylinder.id.split('_')[1]);
        return coalitionId !== this.game.playerManager.getPlayer({ playerId }).getLoyalty();
      })
      .map(extractId);
  }

  public getPlayerTribes({ playerId }: { playerId: number }): string[] {
    return this.tribeZone
      .getCards()
      .filter((cylinder: Cylinder) => {
        const cylinderPlayerId = Number(cylinder.id.split('_')[1]);
        return cylinderPlayerId === playerId;
      })
      .map(extractId);
  }

  public removeTempArmy({ index }: { index: number }) {
    this.armyZone.removeCard(this.createTempArmy('afghan', index));
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
}
