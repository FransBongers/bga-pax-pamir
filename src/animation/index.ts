/**
 * This method will attach mobile to a new_parent without destroying, unlike original attachToNewParent which destroys mobile and
 * all its connectors (onClick, etc)
 */
const attachToNewParentNoDestroy = (mobileEltId: string, newParentId: string, pos?: DojoPosition, placePosition?: CssPosition) => {
  const mobile = $(mobileEltId);
  const new_parent = $(newParentId);

  var src = dojo.position(mobile);
  if (placePosition) mobile.style.position = placePosition;
  dojo.place(mobile, new_parent, pos);
  mobile.offsetTop; //force re-flow
  var tgt = dojo.position(mobile);
  var box = dojo.marginBox(mobile);
  var cbox = dojo.contentBox(mobile);
  var left = box.l + src.x - tgt.x;
  var top = box.t + src.y - tgt.y;

  mobile.style.position = 'absolute';
  mobile.style.left = left + 'px';
  mobile.style.top = top + 'px';
  box.l += box.w - cbox.w;
  box.t += box.h - cbox.h;
  mobile.offsetTop; //force re-flow
  return box;
};

const isFastMode = () => {
  // return this.instantaneousMode;
  return false;
}

const slide = ({game, mobileElt, targetElt, options = {}}: {game: PaxPamirGame; mobileElt: string, targetElt: string, options?: SlideConfig}) => {
  console.log('using slide');
  let config: SlideConfig = {
    duration: 800,
    delay: 0,
    destroy: false,
    attach: true,
    changeParent: true, // Change parent during sliding to avoid zIndex issue
    pos: null,
    className: 'moving',
    from: null,
    clearPos: true,
    beforeBrother: null,
    to: null,
    phantom: true,
    ...options,
  };

  config.phantomStart = config.phantomStart || config.phantom;
  config.phantomEnd = config.phantomEnd || config.phantom;

  // Mobile elt
  mobileElt = $(mobileElt);
  let mobile = mobileElt;
  // Target elt
  targetElt = $(targetElt);
  let targetId = targetElt;
  const newParent = config.attach ? targetId : $(mobile).parentNode;

  // Handle fast mode
  if (isFastMode() && (config.destroy || config.clearPos)) {
    if (config.destroy) dojo.destroy(mobile);
    else dojo.place(mobile, targetElt);

    return new Promise((resolve, reject) => {
      // @ts-ignore
      resolve();
    });
  }

  // Handle phantom at start
  if (config.phantomStart && config.from == null) {
    mobile = dojo.clone(mobileElt);
    // @ts-ignore
    dojo.attr(mobile, 'id', mobileElt.id + '_animated');
    dojo.place(mobile, 'game_play_area');
    // @ts-ignore
    game.framework().placeOnObject(mobile, mobileElt);
    dojo.addClass(mobileElt, 'phantom');
    config.from = mobileElt;
  }

  // Handle phantom at end
  // @ts-ignore
  if (config.phantomEnd) {
    // @ts-ignore
    targetId = dojo.clone(mobileElt);
    // @ts-ignore
    dojo.attr(targetId, 'id', mobileElt.id + '_afterSlide');
    dojo.addClass(targetId, 'phantom');
    if (config.beforeBrother != null) {
      dojo.place(targetId, config.beforeBrother, 'before');
    } else {
      dojo.place(targetId, targetElt);
    }
  }

  dojo.style(mobile, 'zIndex', 5000);
  dojo.addClass(mobile, config.className);
  if (config.changeParent) changeParent(mobile, 'game_play_area');
  if (config.from != null) game.framework().placeOnObject(mobile, config.from);
  return new Promise((resolve, reject) => {
    const animation =
      config.pos == null
        ? game.framework().slideToObject(mobile, config.to || targetId, config.duration, config.delay)
        : game.framework().slideToObjectPos(mobile, config.to || targetId, config.pos.x, config.pos.y, config.duration, config.delay);

    dojo.connect(animation, 'onEnd', () => {
      dojo.style(mobile, 'zIndex', null);
      dojo.removeClass(mobile, config.className);
      // @ts-ignore
      if (config.phantomStart) {
        dojo.place(mobileElt, mobile, 'replace');
        dojo.removeClass(mobileElt, 'phantom');
        mobile = mobileElt;
      }
      if (config.changeParent) {
        // @ts-ignore
        if (config.phantomEnd) dojo.place(mobile, targetId, 'replace');
        else changeParent(mobile, newParent);
      }
      if (config.destroy) dojo.destroy(mobile);
      if (config.clearPos && !config.destroy) dojo.style(mobile, { top: null, left: null, position: null });
      // @ts-ignore
      resolve();
    });
    animation.play();
  });
}

const changeParent = (mobile, new_parent, relation?: any) => {
  if (mobile === null) {
    console.error('attachToNewParent: mobile obj is null');
    return;
  }
  if (new_parent === null) {
    console.error('attachToNewParent: new_parent is null');
    return;
  }
  if (typeof mobile == 'string') {
    mobile = $(mobile);
  }
  if (typeof new_parent == 'string') {
    new_parent = $(new_parent);
  }
  if (typeof relation == 'undefined') {
    relation = 'last';
  }
  var src = dojo.position(mobile);
  dojo.style(mobile, 'position', 'absolute');
  dojo.place(mobile, new_parent, relation);
  var tgt = dojo.position(mobile);
  var box = dojo.marginBox(mobile);
  var cbox = dojo.contentBox(mobile);
  var left = box.l + src.x - tgt.x;
  var top = box.t + src.y - tgt.y;
  positionObjectDirectly(mobile, left, top);
  // @ts-ignore
  box.l += box.w - cbox.w;
  // @ts-ignore
  box.t += box.h - cbox.h;
  return box;
}

const positionObjectDirectly = (mobileObj, x, y) => {
  // do not remove this "dead" code some-how it makes difference
  dojo.style(mobileObj, 'left'); // bug? re-compute style
  // console.log("place " + x + "," + y);
  dojo.style(mobileObj, {
    left: x + 'px',
    top: y + 'px',
  });
  dojo.style(mobileObj, 'left'); // bug? re-compute style
}