// .########.########..####.########..########..######.
  // ....##....##.....##..##..##.....##.##.......##....##
  // ....##....##.....##..##..##.....##.##.......##......
  // ....##....########...##..########..######....######.
  // ....##....##...##....##..##.....##.##.............##
  // ....##....##....##...##..##.....##.##.......##....##
  // ....##....##.....##.####.########..########..######.

  const tribesHeratPattern = ({ index: i, itemCount: numberOfItems }: ZonePatternInput): ZonePatternOutput => {
    const multiplier = Math.floor(i / 6);

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

  const tribesKabulPattern = ({ index: i, itemCount: numberOfItems }: ZonePatternInput): ZonePatternOutput => {
    const multiplier = Math.floor(i / 6);

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

  const tribesKandaharPattern = ({ index: i, itemCount: numberOfItems }: ZonePatternInput): ZonePatternOutput => {
    const multiplier = Math.floor(i / 6);

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

  const tribesPersiaPattern = ({ index: i, itemCount: numberOfItems }: ZonePatternInput): ZonePatternOutput => {
    const multiplier = Math.floor(i / 6);

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

  const tribesPunjabPattern = ({ index: i, itemCount: numberOfItems }: ZonePatternInput): ZonePatternOutput => {
    const multiplier = Math.floor(i / 6);

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

  const tribesTranscaspiaPattern = ({ index: i, itemCount: numberOfItems }: ZonePatternInput): ZonePatternOutput => {
    const multiplier = Math.floor(i / 6);

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