interface Zone {
  create: (
    game: Game,
    $div: string,
    cardwidth: number,
    cardheight: number
  ) => void;
  getAllItems: () => string[];
  getItemNumber: () => number;
  instantaneous: boolean;
  item_margin: number;
  itemIdToCoords: (
    itemId: number,
    control_width: unknown,
    no_idea_what_this_is: unknown,
    numberOfItems: number
  ) => { x: number; y: number; w: number; h: number };
  placeInZone: (objectId: string, weight?: number) => void;
  removeAll: () => void;
  removeFromZone: (objectId: string, destroy?: boolean, to?: string) => void;
  setPattern: (pattern: string) => void;
}
