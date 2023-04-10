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

  clearInterface() {
    Object.values(this.borders).forEach((border) => {
      border.clearInterface();
    });
    Object.values(this.regions).forEach((region) => {
      region.clearInterface();
    });
  }

  updateMap({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    Object.values(this.borders).forEach((border) => {
      border.setupBorder({gamedatas});
    });
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
