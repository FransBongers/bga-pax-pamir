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
  private roadZone: PaxPamirZone;

  constructor({ game, border }: { game: PaxPamirGame; border: string }) {
    this.game = game;
    this.border = border;

    this.setupBorder({ gamedatas: game.gamedatas });
  }

  setupBorder({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    const borderGamedatas = gamedatas.map.borders[this.border];
    this.createBorderZone();
    borderGamedatas.roads.forEach(({ id }) => {
      this.roadZone.placeInZone({
        id,
        element: tplRoad({ id, coalition: id.split('_')[1] }),
      });
    });
  }

  clearInterface() {
    dojo.empty(this.roadZone.getContainerId());
    this.roadZone = undefined;
  }

  // TODO: implement custom pattern and update.
  createBorderZone() {
    const border = this.border;
    const borderPattern: Record<string, PaxPamirZone['pattern']> = {
      herat_kabul: 'horizontalFit',
      herat_kandahar: 'verticalFit',
      herat_persia: 'verticalFit',
      herat_transcaspia: 'custom',
      kabul_transcaspia: 'verticalFit',
      kabul_kandahar: 'horizontalFit',
      kabul_punjab: 'verticalFit',
      kandahar_punjab: 'verticalFit',
      persia_transcaspia: 'horizontalFit',
    };

    this.roadZone = new PaxPamirZone({
      animationManager: this.game.animationManager,
      containerId: `pp_${this.border}_border`,
      itemHeight: ROAD_HEIGHT,
      itemWidth: ROAD_WIDTH,
      pattern: borderPattern[border],
      customPattern:
        // border === 'herat_transcaspia' ? (props: PPZoneItemToCoordsProps) => this.customPatternHeratTranscaspia(props) : undefined,
        border === 'herat_transcaspia' ? this.customPatternHeratTranscaspia : undefined,
    });
  }

  customPatternHeratTranscaspia({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
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
  }

  getRoadZone(): PaxPamirZone {
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

  getCoalitionRoads({ coalitionId }: { coalitionId: string }): string[] {
    return this.roadZone.getItems().filter((blockId: string) => blockId.split('_')[1] === coalitionId);
  }

  getEnemyRoads({ coalitionId }: { coalitionId: string }): string[] {
    return this.roadZone.getItems().filter((blockId: string) => blockId.split('_')[1] !== coalitionId);
  }

  public addTempRoad({ coalition, index }: { coalition: string; index: number }) {
    const id = `temp_road_${index}`;
    this.roadZone.placeInZone({
      id,
      element: tplRoad({ id, coalition, classesToAdd: [PP_TEMPORARY] }),
    });
  }

  public removeTempRoad({ index }: { index: number }) {
    this.roadZone.remove({ input: `temp_road_${index}`, destroy: true });
  }
}
