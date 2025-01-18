interface ZonePatternInput {
  index: number;
  itemCount: number;
}

interface ZonePatternOutput {
  x: number; // left ?
  y: number; // top ?
  w: number; // width?
  h: number; // height?
}

const updateZoneDislay = (
  pattern: (input: ZonePatternInput) => ZonePatternOutput,
  element: HTMLElement,
  blocks: (Cylinder | CoalitionBlock)[],
  lastCard: CoalitionBlock | Cylinder,
  stock: TokenManualPositionStock<CoalitionBlock | Cylinder>
) => {
  const itemCount = blocks.length;
  blocks.forEach((block, index) => {
    const { x: left, y: top } = pattern({ index, itemCount });
    const div = stock.getCardElement(block);
    div.style.top = `calc(var(--tokenScale) * ${top}px)`;
    div.style.left = `calc(var(--tokenScale) * ${left}px)`;
  });
}