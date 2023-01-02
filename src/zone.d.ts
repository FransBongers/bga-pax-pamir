interface Zone {
  create: (
    game: Game,
    $div: string,
    cardwidth: number,
    cardheight: number
  ) => void;
  instantaneous: boolean;
  item_margin: number;
  itemIdToCoords: (
    itemId: number,
    control_width: unknown,
    no_idea_what_this_is: unknown,
    numberOfItems: number
  ) => { x: number; y: number; w: number; h: number };
  setPattern: (pattern: string) => void;
}
