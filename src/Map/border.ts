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

    this.setupBorder({ gamedatas: game.gamedatas });
  }

  setupBorder({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    const borderGamedatas = gamedatas.map.borders[this.border];
    this.roadZone = new ebg.zone();
    this.createBorderZone({ border: this.border, zone: this.roadZone });
    borderGamedatas.roads.forEach(({ id }) => {
      placeToken({
        game: this.game,
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

  clearInterface() {
    dojo.empty(this.roadZone.container_div);
    this.roadZone = undefined;
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

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  getCoalitionRoads({coalitionId}: {coalitionId: string;}): string[] {
    return this.roadZone.getAllItems().filter((blockId: string) => blockId.split('_')[1] === coalitionId);
  }

  getEnemyRoads({ coalitionId }: { coalitionId: string }): string[] {
    return this.roadZone.getAllItems().filter((blockId: string) => blockId.split('_')[1] !== coalitionId);
  }

  public addTempRoad({coalition, index}:{coalition: string; index: number;}) {
    this.roadZone.instantaneous = true;
    const id = `temp_road_${index}`
    placeToken({
      game: this.game,
      location: this.roadZone,
      id,
      jstpl: 'jstpl_road',
      jstplProps: {
        id,
        coalition,
      },
      classes: ['pp_temporary']
    });
    this.roadZone.instantaneous = false;
  }

  public removeTempRoad({index}: {index:number}) {
    this.roadZone.removeFromZone(`temp_road_${index}`,true);
  }
}
