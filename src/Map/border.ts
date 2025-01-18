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
  private roadZone: TokenManualPositionStock<CoalitionBlock>;

  constructor({ game, border }: { game: PaxPamirGame; border: string }) {
    this.game = game;
    this.border = border;

    this.setupBorder({ gamedatas: game.gamedatas });
  }

  setupBorder({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    const borderGamedatas = gamedatas.map.borders[this.border];
    this.createBorderZone();
    this.roadZone.addCards(
      borderGamedatas.roads.map((token) => ({
        ...token,
        coalition: token.id.split('_')[1] as Coalition,
        type: 'road',
      }))
    );
  }

  clearInterface() {
    this.roadZone.removeAll();
    this.roadZone = undefined;
  }

  // TODO: implement custom pattern and update.
  createBorderZone() {
    const border = this.border;
    this.roadZone = new TokenManualPositionStock<CoalitionBlock>(
      this.game.coalitionBlockManager,
      document.getElementById(`pp_${this.border}_border`),
      {},
      (element: HTMLElement, cards: CoalitionBlock[], lastCard: CoalitionBlock, stock: TokenManualPositionStock<CoalitionBlock>) =>
        this.updateDislay(element, cards, lastCard, stock)
    );
  }

  getRoadZone(): TokenManualPositionStock<CoalitionBlock> {
    return this.roadZone;
  }

  public clearSelectable() {
    const borderSelect = document.getElementById(`pp_${this.border}_border_select`);
    if (borderSelect) {
      borderSelect.classList.remove(PP_SELECTABLE, PP_SELECTED);
    }
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  private getCustomPattern({ border }: { border: string }) {
    switch (border) {
      case HERAT_KABUL:
        return customPatternHeratKabul;
      case HERAT_KANDAHAR:
        return customPatternHeratKandahar;
      case HERAT_PERSIA:
        return customPatternHeratPersia;
      case HERAT_TRANSCASPIA:
        return customPatternHeratTranscaspia;
      case KABUL_KANDAHAR:
        return customPatternKabulKandahar;
      case KABUL_PUNJAB:
        return customPatternKabulPunjab;
      case KABUL_TRANSCASPIA:
        return customPatternKabulTranscaspia;
      case KANDAHAR_PUNJAB:
        return customPatternKandaharPunjab;
      case PERSIA_TRANSCASPIA:
        return customPatternPersiaTranscaspia;
      default:
        return undefined;
    }
  }

  getCoalitionRoads({ coalitionId }: { coalitionId: string }): string[] {
    return this.roadZone
      .getCards()
      .filter(({ id }: CoalitionBlock) => id.split('_')[1] === coalitionId)
      .map((block) => block.id);
  }

  getEnemyRoads({ coalitionId }: { coalitionId: string }): string[] {
    return this.roadZone
      .getCards()
      .filter(({ id }: CoalitionBlock) => id.split('_')[1] !== coalitionId)
      .map((block) => block.id);
  }

  private createTempRoad(coalition: Coalition, index: number): CoalitionBlock {
    const id = `temp_road_${index}`;
    return {
      id,
      state: 0,
      coalition,
      location: this.border,
      used: 0,
      type: 'road',
    };
  }

  public addTempRoad({ coalition, index }: { coalition: Coalition; index: number }) {
    this.roadZone.addCard(this.createTempRoad(coalition, index));
    // this.roadZone.placeInZone({
    //   id,
    //   element: tplRoad({ id, coalition, classesToAdd: [PP_TEMPORARY] }),
    // });
  }

  public removeTempRoad({ index }: { index: number }) {
    // TODO: check if this works. Coalition is not used to determine id
    this.roadZone.removeCard(this.createTempRoad('afghan', index));
    // this.roadZone.remove({ input: `temp_road_${index}`, destroy: true });
  }

  // .########...#######..########..########..########.########.
  // .##.....##.##.....##.##.....##.##.....##.##.......##.....##
  // .##.....##.##.....##.##.....##.##.....##.##.......##.....##
  // .########..##.....##.########..##.....##.######...########.
  // .##.....##.##.....##.##...##...##.....##.##.......##...##..
  // .##.....##.##.....##.##....##..##.....##.##.......##....##.
  // .########...#######..##.....##.########..########.##.....##

  // .########.....###....########.########.########.########..##....##..######.
  // .##.....##...##.##......##.......##....##.......##.....##.###...##.##....##
  // .##.....##..##...##.....##.......##....##.......##.....##.####..##.##......
  // .########..##.....##....##.......##....######...########..##.##.##..######.
  // .##........#########....##.......##....##.......##...##...##..####.......##
  // .##........##.....##....##.......##....##.......##....##..##...###.##....##
  // .##........##.....##....##.......##....########.##.....##.##....##..######.

  private updateDislay(
    element: HTMLElement,
    blocks: CoalitionBlock[],
    lastCard: CoalitionBlock,
    stock: TokenManualPositionStock<CoalitionBlock>
  ) {
    const pattern = this.getCustomPattern({ border: this.border });
    const itemCount = blocks.length;
    blocks.forEach((block, index) => {
      const { x: left, y: top } = pattern({ index, itemCount });
      const div = stock.getCardElement(block);
      div.style.top = `calc(var(--tokenScale) * ${top}px)`;
      div.style.left = `calc(var(--tokenScale) * ${left}px)`;
    });
  }
}
