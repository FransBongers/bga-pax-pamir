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
      this.roadZone.setupItems({
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

    this.roadZone = new PaxPamirZone({
      animationManager: this.game.animationManager,
      containerId: `pp_${this.border}_border`,
      itemHeight: ROAD_HEIGHT,
      itemWidth: ROAD_WIDTH,
      pattern: 'custom',
      customPattern: this.getCustomPattern({ border }),
    });
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

  private getCustomPattern({ border }: { border: string }) {
    switch (border) {
      case HERAT_KABUL:
        return this.customPatternHeratKabul;
      case HERAT_KANDAHAR:
        return this.customPatternHeratKandahar;
      case HERAT_PERSIA:
        return this.customPatternHeratPersia;
      case HERAT_TRANSCASPIA:
        return this.customPatternHeratTranscaspia;
      case KABUL_KANDAHAR:
        return this.customPatternKabulKandahar;
      case KABUL_PUNJAB:
        return this.customPatternKabulPunjab;
      case KABUL_TRANSCASPIA:
        return this.customPatternKabulTranscaspia;
      case KANDAHAR_PUNJAB:
        return this.customPatternKandaharPunjab;
      case PERSIA_TRANSCASPIA:
        return this.customPatternPersiaTranscaspia;
      default:
        return undefined;
    }
  }

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

  private customPatternHeratKabul({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    if (numberOfItems <= 2) {
      switch (i) {
        case 0:
          return { x: 24, y: 13, w: 40, h: 27 };
        case 1:
          return { x: 62, y: 40, w: 40, h: 27 };
      }
    } else if (numberOfItems <= 4) {
      switch (i) {
        case 0:
          return { x: 0, y: -3, w: 40, h: 27 };
        case 1:
          return { x: 29, y: 17, w: 40, h: 27 };
        case 2:
          return { x: 58, y: 37, w: 40, h: 27 };
        case 3:
          return { x: 82, y: 55, w: 40, h: 27 };
      }
    } else {
      const mod = i % 7;
      switch (mod) {
        case 0:
          return { x: 0, y: -3, w: 40, h: 27 };
        case 1:
          return { x: 16, y: 6, w: 40, h: 27 };
        case 2:
          return { x: 30, y: 16, w: 40, h: 27 };
        case 3:
          return { x: 45, y: 25, w: 40, h: 27 };
        case 4:
          return { x: 58, y: 35, w: 40, h: 27 };
        case 5:
          return { x: 69, y: 43, w: 40, h: 27 };
        case 6:
          return { x: 84, y: 51, w: 40, h: 27 };
      }
    }
  }

  private customPatternHeratKandahar({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    if (numberOfItems <= 3) {
      switch (i) {
        case 0:
          return { x: 7, y: 27, w: 40, h: 27 };
        case 1:
          return { x: 5, y: 54, w: 40, h: 27 };
        case 2:
          return { x: 2, y: 81, w: 40, h: 27 };
      }
    } else if (numberOfItems <= 5) {
      switch (i) {
        case 0:
          return { x: 7, y: -7, w: 40, h: 27 };
        case 1:
          return { x: 6, y: 21, w: 40, h: 27 };
        case 2:
          return { x: 4, y: 51, w: 40, h: 27 };
        case 3:
          return { x: 2, y: 81, w: 40, h: 27 };
        case 4:
          return { x: -3, y: 112, w: 40, h: 27 };
      }
    } else {
      const mod = i % 12;
      switch (mod) {
        case 0:
          return { x: 7, y: -17, w: 40, h: 27 };
        case 1:
          return { x: 7, y: -5, w: 40, h: 27 };
        case 2:
          return { x: 8, y: 7, w: 40, h: 27 };
        case 3:
          return { x: 8, y: 19, w: 40, h: 27 };
        case 4:
          return { x: 8, y: 30, w: 40, h: 27 };
        case 5:
          return { x: 6, y: 41, w: 40, h: 27 };
        case 6:
          return { x: 5, y: 53, w: 40, h: 27 };
        case 7:
          return { x: 5, y: 64, w: 40, h: 27 };
        case 8:
          return { x: 3, y: 75, w: 40, h: 27 };
        case 9:
          return { x: 2, y: 88, w: 40, h: 27 };
        case 10:
          return { x: 0, y: 100, w: 40, h: 27 };
        case 11:
          return { x: -3, y: 112, w: 40, h: 27 };
      }
    }
  }

  private customPatternHeratPersia({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    if (numberOfItems <= 3) {
      switch (i) {
        case 0:
          return { x: -2, y: 32, w: 40, h: 27 };
        case 1:
          return { x: -1, y: 60, w: 40, h: 27 };
        case 2:
          return { x: 3, y: 87, w: 40, h: 27 };
      }
    } else if (numberOfItems <= 5) {
      switch (i) {
        case 0:
          return { x: -2, y: 0, w: 40, h: 27 };
        case 1:
          return { x: -2, y: 27, w: 40, h: 27 };
        case 2:
          return { x: -1, y: 57, w: 40, h: 27 };
        case 3:
          return { x: 2, y: 87, w: 40, h: 27 };
        case 4:
          return { x: 4, y: 117, w: 40, h: 27 };
      }
    } else {
      const mod = i % 11;
      switch (mod) {
        case 0:
          return { x: -2, y: -2, w: 40, h: 27 };
        case 1:
          return { x: -2, y: 9, w: 40, h: 27 };
        case 2:
          return { x: -2, y: 21, w: 40, h: 27 };
        case 3:
          return { x: -2, y: 32, w: 40, h: 27 };
        case 4:
          return { x: -1, y: 44, w: 40, h: 27 };
        case 5:
          return { x: 0, y: 57, w: 40, h: 27 };
        case 6:
          return { x: 1, y: 70, w: 40, h: 27 };
        case 7:
          return { x: 3, y: 82, w: 40, h: 27 };
        case 8:
          return { x: 4, y: 95, w: 40, h: 27 };
        case 9:
          return { x: 4, y: 108, w: 40, h: 27 };
        case 10:
          return { x: 4, y: 121, w: 40, h: 27 };
      }
    }
  }

  private customPatternHeratTranscaspia({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    if (numberOfItems <= 2) {
      switch (i) {
        case 0:
          return { x: 65, y: 12, w: 40, h: 27 };
        case 1:
          return { x: 27, y: 39, w: 40, h: 27 };
      }
    } else if (numberOfItems <= 4) {
      switch (i) {
        case 0:
          return { x: 85, y: 2, w: 40, h: 27 };
        case 1:
          return { x: 58, y: 19, w: 40, h: 27 };
        case 2:
          return { x: 32, y: 37, w: 40, h: 27 };
        case 3:
          return { x: 10, y: 56, w: 40, h: 27 };
      }
    } else {
      const mod = i % 8;
      switch (mod) {
        case 0:
          return { x: 90, y: -5, w: 40, h: 27 };
        case 1:
          return { x: 81, y: 5, w: 40, h: 27 };
        case 2:
          return { x: 65, y: 15, w: 40, h: 27 };
        case 3:
          return { x: 49, y: 26, w: 40, h: 27 };
        case 4:
          return { x: 38, y: 36, w: 40, h: 27 };
        case 5:
          return { x: 28, y: 45, w: 40, h: 27 };
        case 6:
          return { x: 16, y: 57, w: 40, h: 27 };
        case 7:
          return { x: 8, y: 67, w: 40, h: 27 };
      }
    }
  }

  private customPatternKabulKandahar({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    if (numberOfItems <= 2) {
      switch (i) {
        case 0:
          return { x: 40, y: 10, w: 40, h: 27 };
        case 1:
          return { x: 86, y: 19, w: 40, h: 27 };
      }
    } else if (numberOfItems <= 4) {
      switch (i) {
        case 0:
          return { x: -4, y: 0, w: 40, h: 27 };
        case 1:
          return { x: 36, y: 8, w: 40, h: 27 };
        case 2:
          return { x: 77, y: 15, w: 40, h: 27 };
        case 3:
          return { x: 120, y: 11, w: 40, h: 27 };
      }
    } else {
      const mod = i % 8;
      switch (mod) {
        case 0:
          return { x: -8, y: -2, w: 40, h: 27 };
        case 1:
          return { x: 12, y: 4, w: 40, h: 27 };
        case 2:
          return { x: 32, y: 9, w: 40, h: 27 };
        case 3:
          return { x: 48, y: 14, w: 40, h: 27 };
        case 4:
          return { x: 69, y: 17, w: 40, h: 27 };
        case 5:
          return { x: 84, y: 19, w: 40, h: 27 };
        case 6:
          return { x: 104, y: 17, w: 40, h: 27 };
        case 7:
          return { x: 124, y: 13, w: 40, h: 27 };
      }
    }
  }

  private customPatternKabulTranscaspia({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    if (numberOfItems <= 2) {
      switch (i) {
        case 0:
          return { x: 11, y: 32, w: 40, h: 27 };
        case 1:
          return { x: 6, y: 64, w: 40, h: 27 };
      }
    } else if (numberOfItems <= 4) {
      switch (i) {
        case 0:
          return { x: 11, y: 10, w: 40, h: 27 };
        case 1:
          return { x: 10, y: 40, w: 40, h: 27 };
        case 2:
          return { x: 5, y: 70, w: 40, h: 27 };
        case 3:
          return { x: -3, y: 100, w: 40, h: 27 };
      }
    } else {
      const mod = i % 9;
      switch (mod) {
        case 0:
          return { x: 12, y: -2, w: 40, h: 27 };
        case 1:
          return { x: 13, y: 12, w: 40, h: 27 };
        case 2:
          return { x: 12, y: 25, w: 40, h: 27 };
        case 3:
          return { x: 11, y: 37, w: 40, h: 27 };
        case 4:
          return { x: 10, y: 49, w: 40, h: 27 };
        case 5:
          return { x: 9, y: 61, w: 40, h: 27 };
        case 6:
          return { x: 6, y: 74, w: 40, h: 27 };
        case 7:
          return { x: 2, y: 86, w: 40, h: 27 };
        case 8:
          return { x: -3, y: 100, w: 40, h: 27 };
      }
    }
  }

  private customPatternKabulPunjab({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    if (numberOfItems <= 3) {
      switch (i) {
        case 0:
          return { x: 23, y: 61, w: 40, h: 27 };
        case 1:
          return { x: 7, y: 93, w: 40, h: 27 };
        case 2:
          return { x: -4, y: 123, w: 40, h: 27 };
      }
    } else if (numberOfItems <= 7) {
      switch (i) {
        case 0:
          return { x: 56, y: 0, w: 40, h: 27 };
        case 1:
          return { x: 43, y: 33, w: 40, h: 27 };
        case 2:
          return { x: 22, y: 63, w: 40, h: 27 };
        case 3:
          return { x: 7, y: 90, w: 40, h: 27 };
        case 4:
          return { x: -2, y: 116, w: 40, h: 27 };
        case 5:
          return { x: -13, y: 145, w: 40, h: 27 };
        case 6:
          return { x: -32, y: 175, w: 40, h: 27 };
      }
    } else {
      const mod = i % 12;
      switch (mod) {
        case 0:
          return { x: 59, y: -7, w: 40, h: 27 };
        case 1:
          return { x: 54, y: 8, w: 40, h: 27 };
        case 2:
          return { x: 48, y: 23, w: 40, h: 27 };
        case 3:
          return { x: 38, y: 39, w: 40, h: 27 };
        case 4:
          return { x: 28, y: 55, w: 40, h: 27 };
        case 5:
          return { x: 17, y: 72, w: 40, h: 27 };
        case 6:
          return { x: 10, y: 90, w: 40, h: 27 };
        case 7:
          return { x: 2, y: 108, w: 40, h: 27 };
        case 8:
          return { x: -4, y: 125, w: 40, h: 27 };
        case 9:
          return { x: -12, y: 141, w: 40, h: 27 };
        case 10:
          return { x: -22, y: 163, w: 40, h: 27 };
        case 11:
          return { x: -35, y: 178, w: 40, h: 27 };
      }
    }
  }

  private customPatternKandaharPunjab({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    if (numberOfItems <= 3) {
      switch (i) {
        case 0:
          return { x: -2, y: 16, w: 40, h: 27 };
        case 1:
          return { x: 8, y: 45, w: 40, h: 27 };
        case 2:
          return { x: 17, y: 75, w: 40, h: 27 };
      }
    } else if (numberOfItems <= 6) {
      switch (i) {
        case 0:
          return { x: -26, y: -36, w: 40, h: 27 };
        case 1:
          return { x: -12, y: -9, w: 40, h: 27 };
        case 2:
          return { x: -3, y: 15, w: 40, h: 27 };
        case 3:
          return { x: 5, y: 40, w: 40, h: 27 };
        case 4:
          return { x: 15, y: 70, w: 40, h: 27 };
        case 5:
          return { x: 22, y: 97, w: 40, h: 27 };
      }
    } else {
      const mod = i % 12;
      switch (mod) {
        case 0:
          return { x: -25, y: -40, w: 40, h: 27 };
        case 1:
          return { x: -20, y: -29, w: 40, h: 27 };
        case 2:
          return { x: -14, y: -17, w: 40, h: 27 };
        case 3:
          return { x: -8, y: -5, w: 40, h: 27 };
        case 4:
          return { x: -4, y: 6, w: 40, h: 27 };
        case 5:
          return { x: 0, y: 19, w: 40, h: 27 };
        case 6:
          return { x: 2, y: 30, w: 40, h: 27 };
        case 7:
          return { x: 10, y: 42, w: 40, h: 27 };
        case 8:
          return { x: 12, y: 55, w: 40, h: 27 };
        case 9:
          return { x: 16, y: 70, w: 40, h: 27 };
        case 10:
          return { x: 21, y: 85, w: 40, h: 27 };
        case 11:
          return { x: 24, y: 100, w: 40, h: 27 };
      }
    }
  }

  private customPatternPersiaTranscaspia({ index: i, itemCount: numberOfItems }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    if (numberOfItems <= 2) {
      switch (i) {
        case 0:
          return { x: 41, y: -2, w: 40, h: 27 };
        case 1:
          return { x: 88, y: 5, w: 40, h: 27 };
      }
    } else if (numberOfItems <= 4) {
      switch (i) {
        case 0:
          return { x: -2, y: -2, w: 40, h: 27 };
        case 1:
          return { x: 38, y: -2, w: 40, h: 27 };
        case 2:
          return { x: 78, y: 1, w: 40, h: 27 };
        case 3:
          return { x: 115, y: 9, w: 40, h: 27 };
      }
    } else {
      const mod = i % 9;
      switch (mod) {
        case 0:
          return { x: -8, y: -2, w: 40, h: 27 };
        case 1:
          return { x: 9, y: -1, w: 40, h: 27 };
        case 2:
          return { x: 26, y: 0, w: 40, h: 27 };
        case 3:
          return { x: 45, y: 0, w: 40, h: 27 };
        case 4:
          return { x: 67, y: 2, w: 40, h: 27 };
        case 5:
          return { x: 89, y: 4, w: 40, h: 27 };
        case 6:
          return { x: 109, y: 8, w: 40, h: 27 };
        case 7:
          return { x: 126, y: 13, w: 40, h: 27 };
        case 8:
          return { x: 141, y: 20, w: 40, h: 27 };
      }
    }
  }
}
