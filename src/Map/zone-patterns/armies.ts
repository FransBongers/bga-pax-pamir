
  // ....###....########..##.....##.####.########..######.
  // ...##.##...##.....##.###...###..##..##.......##....##
  // ..##...##..##.....##.####.####..##..##.......##......
  // .##.....##.########..##.###.##..##..######....######.
  // .#########.##...##...##.....##..##..##.............##
  // .##.....##.##....##..##.....##..##..##.......##....##
  // .##.....##.##.....##.##.....##.####.########..######.

  const defaultPattern = ({ index: i, itemCount: numberOfItems }: ZonePatternInput): ZonePatternOutput => {
    const multiplier = Math.floor(i / 5);
    const mod = i % 5;
    return { x: mod * 22, y: multiplier * 15, w: 40, h: 27 };
  }

  const armiesHeratPattern = ({ index: i, itemCount: numberOfItems }: ZonePatternInput): ZonePatternOutput => {
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
      const mod = (i - 8) % 8;
      return { x: 3 + mod * 22, y: 46 + multiplier * 16, w: 25, h: 40 };
    }
  }

  const armiesKabulPattern = ({ index: i, itemCount: numberOfItems }: ZonePatternInput): ZonePatternOutput => {
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

  const armiesKandaharPattern = ({ index: i, itemCount: numberOfItems }: ZonePatternInput): ZonePatternOutput => {
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

  const armiesPersiaPattern = ({ index: i, itemCount: numberOfItems }: ZonePatternInput): ZonePatternOutput => {
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

  const armiesPunjabPattern = ({ index: i, itemCount: numberOfItems }: ZonePatternInput): ZonePatternOutput => {
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

  const armiesTranscaspiaPattern = ({ index: i, itemCount: numberOfItems }: ZonePatternInput): ZonePatternOutput => {
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