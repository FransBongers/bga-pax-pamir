// TODO(Frans): detereming jstpl based on id?
placeToken = ({
  game,
  location,
  id,
  jstpl,
  jstplProps,
  weight = 0,
  classes = [],
  from = null,
}) => {
  // console.log('from', from)
  dojo.place(game.format_block(jstpl, jstplProps), from || "pp_tokens");
  classes.forEach((className) => {
    dojo.addClass(id, className);
  });
  location.placeInZone(id, weight);
};

// Function to set up zones for tokens (armies, tribes, cylinders etc.)
const setupTokenZone = ({
  game,
  zone,
  nodeId,
  tokenWidth,
  tokenHeight,
  itemMargin = null,
  instantaneous = false,
  pattern = null,
  customPattern = null,
}) => {
  zone.create(game, nodeId, tokenWidth, tokenHeight);
  if (itemMargin) {
    zone.item_margin = itemMargin;
  }
  zone.instantaneous = instantaneous;
  if (pattern) {
    zone.setPattern(pattern);
  }
  if (pattern == "custom" && customPattern) {
    zone.itemIdToCoords = customPattern;
  }
};
