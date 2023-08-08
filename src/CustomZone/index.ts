class PaxPamirZone {
  private animationManager: AnimationManager;
  private itemGap: number;
  private itemHeight: number;
  private itemWidth: number;
  private containerId: string;
  private containerElement: HTMLElement;
  private items: PaxPamirZoneItem[];
  private pattern: PaxPamirZoneConfig['pattern'];
  private autoHeight: boolean;
  private autoWidth: boolean;
  private customPattern: (props: PPZoneItemToCoordsProps) => OriginalZoneItemToCoordsResult;

  constructor(config: PaxPamirZoneConfig) {
    const { animationManager, itemGap, itemHeight, itemWidth, containerId } = config;
    this.animationManager = animationManager;
    this.itemGap = itemGap || 0;
    this.itemHeight = itemHeight;
    this.itemWidth = itemWidth;
    this.containerId = containerId;
    this.containerElement = document.getElementById(containerId);
    this.items = [];
    this.setPattern(config.pattern || 'grid');
    this.autoWidth = false;
    this.autoHeight = true;
    this.customPattern = config.customPattern;

    if (!this.containerElement) {
      console.error('containerElement null');
      return;
    }

    if (getComputedStyle(this.containerElement).position !== 'absolute') {
      this.containerElement.style.position = 'relative';
      // dojo.style(this.containerId, 'position', 'relative');
      // this.containerElement.style.position = 'relative';
    }
  }

  public getContainerId(): string {
    return this.containerId;
  }

  /**
   *
   * @param input id or string of arrays of the elements to remove
   * @param destroy destroy element after removing. Defaults to false
   * @returns
   */
  public async remove({ input, destroy = false }: { input: string | string[]; destroy?: boolean }) {
    const itemsToRemove = Array.isArray(input) ? input : [input];

    itemsToRemove.forEach((id) => {
      const index = this.items.findIndex((item) => item.id === id);
      if (index < 0) {
        return;
      }
      this.items.splice(index, 1);
      if (destroy) {
        const element = $(id);
        element && element.remove();
      }
    });

    return this.updateDisplay();
  }

  public async removeAll({destroy}: {destroy: boolean} = {destroy: false}) {
    if (destroy) {
      this.items.forEach((item) => {
        const {id} = item;
        const node = $(id);
        node.remove();
      })
    }
    this.items = [];
    return this.updateDisplay();
  }

  /**
   * Use to move existing elements to the zone
   * @param input single item or array of items
   * @returns
   */
  public async moveToZone({
    elements,
    classesToAdd,
    classesToRemove,
    duration,
    zIndex,
    elementsToRemove,
  }: {
    elements: PaxPamirZoneItem | PaxPamirZoneItem[];
    classesToAdd?: string[];
    classesToRemove?: string[];
    duration?: number;
    zIndex?: number;
    elementsToRemove?: { elements: string | string[]; destroy?: boolean };
  }) {
    const animations: BgaAnimation<BgaAnimationSettings>[] = [];
    const items = Array.isArray(elements) ? elements : [elements];

    if (elementsToRemove) {
      const itemsToRemove = Array.isArray(elementsToRemove.elements) ? elementsToRemove.elements : [elementsToRemove.elements];

      itemsToRemove.forEach((id) => {
        const index = this.items.findIndex((item) => item.id === id);
        if (index < 0) {
          return;
        }
        this.items.splice(index, 1);
        if (elementsToRemove.destroy) {
          const element = $(id);
          element && element.remove();
        }
      });
    }

    /**
     * add all items
     * appendChilds
     * Set to correct x / y
     * getUpdate animations without newly added items.
     */
    items.forEach(({ id, weight }) => {
      this.items.push({
        id,
        weight,
      });
    });

    this.sortItems();

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      const { id } = item;
      if (!element) {
        console.error('newElement null');
        return;
      }
      const fromRect = element.getBoundingClientRect();
      const attachTo = document.getElementById(this.containerId);
      attachTo.appendChild(element);

      animations.push(
        new BgaSlideAnimation<BgaAnimationWithOriginSettings>({
          element: element,
          transitionTimingFunction: 'linear', // 'ease-in-out',
          fromRect,
          zIndex,
          duration,
          animationStart: (animation: BgaSlideAnimation<BgaAnimationWithOriginSettings>) => {
            element.classList.remove(...(classesToRemove || []));
            element.classList.add(...(classesToAdd || []));
            this.setItemCoords({ node: animation.settings.element });
          },
        })
      );
    });

    return this.animationManager.playParallel(this.getUpdateAnimations(items.map(({ id }) => id)).concat(animations));
  }

  public setItemCoords({ node }: { node: HTMLElement }) {
    const index = this.items.findIndex((item) => item.id === node.id) as number;
    const coords = this.itemToCoords({ index });
    const { y: top, x: left } = coords;
    node.style.position = 'absolute';
    node.style.top = `${top}px`;
    node.style.left = `${left}px`;
  }

  public async placeInZone(input: PaxPamirZonePlaceItem | PaxPamirZonePlaceItem[]): Promise<void> {
    const inputItems = Array.isArray(input) ? input : [input];

    inputItems.forEach(({ id, weight }) => {
      this.items.push({ id, weight });
    });

    this.sortItems();

    const animations: BgaAnimation<BgaAnimationSettings>[] = [];
    inputItems.forEach(({ element, id, from, zIndex, duration }) => {
      const node = dojo.place(element, this.containerId);
      // const index = this.items.findIndex((item) => item.id === id) as number;

      // const { top, left } = this.itemToCoords({ index });
      node.style.position = 'absolute';
      node.style.zIndex = `${zIndex || 0}`;
      this.setItemCoords({ node });
      // node.style.top = top;
      // node.style.left = left;
      if (from) {
        const fromRect = $(from)?.getBoundingClientRect();
        animations.push(
          new BgaSlideAnimation<BgaAnimationWithOriginSettings>({
            element: node,
            transitionTimingFunction: 'linear', //'ease-in-out', // 'ease-out', 'linear'
            fromRect,
            duration,
          })
        );
      }
    });
    await this.animationManager.playParallel([...this.getUpdateAnimations(inputItems.map(({ id }) => id)), ...animations]);

    // if (!from) {
    //   node.style.opacity = '0';
    //   await this.animationManager.playParallel(this.getUpdateAnimations());
    //   node.style.opacity = '1';
    // } else {

    // }
  }

  /**
   * Sync function to place elements during setup
   */
  public setupItems(input: PaxPamirZoneSetupItem | PaxPamirZoneSetupItem[]): void {
    const inputItems = Array.isArray(input) ? input : [input];

    inputItems.forEach(({ id, weight }) => {
      this.items.push({ id, weight });
    });

    this.sortItems();

    inputItems.forEach(({ element, zIndex }) => {
      const node = dojo.place(element, this.containerId);
      node.style.position = 'absolute';
      node.style.zIndex = `${zIndex || 0}`;


    });

    // Using below function sets coords and container width/height. 
    // Keep it sync by not playing the animations
    this.getUpdateAnimations();
  }

  public async updateDisplay() {
    return await this.animationManager.playParallel(this.getUpdateAnimations());
  }

  public getUpdateAnimations(skip?: string[]): BgaSlideAnimation<BgaAnimationWithOriginSettings>[] {
    const animations: BgaSlideAnimation<BgaAnimationWithOriginSettings>[] = [];
    let containerHeight = 0;
    let containerWidth = 0;

    this.items.forEach((item, index) => {
      const element = $(item.id);
      const fromRect = element.getBoundingClientRect();

      if (element) {
        // const { top, left, containerHeight: containerHeightCalc } = this.itemToCoords({ index });
        const { x: left, y: top, w: width, h: height } = this.itemToCoords({ index });

        if (!(skip || []).includes(item.id)) {
          element.style.top = `${top}px`;
          element.style.left = `${left}px`;

          animations.push(new BgaSlideAnimation({ element, fromRect }));
        }
        containerWidth = Math.max(containerWidth, left + width);
        containerHeight = Math.max(containerHeight, top + height);
      }
    });
    if (this.autoHeight) {
      this.containerElement.style.height = `${containerHeight}px`;
    }
    if (this.autoWidth) {
      this.containerElement.style.width = `${containerWidth}px`;
    }
    // containerHeight = Math.max(containerHeight, containerHeightCalc || 0);
    // containerWidth = Math.max(containerHeight, )
    // if (this.pattern === 'grid') {
    //   this.containerElement.style.height = `${containerHeight}px`;
    // }

    // return this.animationManager.playParallel(animations);
    return animations;
  }

  private itemToCoords({ index }: { index: number }): OriginalZoneItemToCoordsResult {
    const boundingClientRect = this.containerElement.getBoundingClientRect();
    const containerWidth = boundingClientRect.width;
    const containerHeight = boundingClientRect.height;
    const itemCount = this.getItemCount();
    const props: PPZoneItemToCoordsProps = {
      index,
      containerHeight,
      containerWidth,
      itemCount,
    };

    switch (this.pattern) {
      case 'grid':
        return this.itemToCoordsGrid(props);
      case 'ellipticalFit':
        return this.itemToCoordsEllipticalFit(props);
      case 'verticalFit':
        return this.itemToCoordsVerticalFit(props);
      case 'horizontalFit':
        return this.itemToCoordsHorizontalFit(props);
      case 'custom':
        const custom = this.customPattern ? this.customPattern(props) : { x: 0, y: 0, w: 0, h: 0 };
        return custom;
    }
  }

  private itemToCoordsGrid({ index: e, containerWidth: t }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    var i = Math.max(1, Math.floor(t / (this.itemWidth + this.itemGap))),
      n = Math.floor(e / i),
      o = {};
    o['y'] = n * (this.itemHeight + this.itemGap);
    o['x'] = (e - n * i) * (this.itemWidth + this.itemGap);
    o['w'] = this.itemWidth;
    o['h'] = this.itemHeight;
    return o as OriginalZoneItemToCoordsResult;
  }

  // private itemToCoordsGrid({ index }: PPZoneItemToCoordsProps): PPZoneItemToCoordsResult {
  //   const numberOfItemsPerRow = 1 + Math.floor((this.containerElement.clientWidth - this.itemWidth) / (this.itemWidth + this.itemGap));
  //   const row = Math.floor(index / numberOfItemsPerRow);
  //   const column = index % numberOfItemsPerRow;

  //   const top = `${row * (this.itemHeight + this.itemGap)}px`;
  //   const left = `${column * (this.itemWidth + this.itemGap)}px`;
  //   const containerHeight = Math.max(this.itemHeight + row * (this.itemHeight + this.itemGap));
  //   return { top, left, containerHeight };
  // }

  // TODO: create readable version
  private itemToCoordsEllipticalFit({
    index: e,
    containerWidth: t,
    containerHeight: i,
    itemCount: n,
  }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    var o = t / 2,
      a = i / 2,
      s = 3.1415927, // pi
      r = {
        w: this.itemWidth,
        h: this.itemHeight,
      };
    r['w'] = this.itemWidth;
    r['h'] = this.itemHeight;
    var l = n - (e + 1);
    if (l <= 4) {
      var c = r.w,
        d = (r.h * a) / o,
        h = s + l * ((2 * s) / 5);
      r['x'] = o + c * Math.cos(h) - r.w / 2;
      r['y'] = a + d * Math.sin(h) - r.h / 2;
    } else if (l > 4) {
      (c = 2 * r.w), (d = (2 * r.h * a) / o), (h = s - s / 2 + (l - 4) * ((2 * s) / Math.max(10, n - 5)));
      r['x'] = o + c * Math.cos(h) - r.w / 2;
      r['y'] = a + d * Math.sin(h) - r.h / 2;
    }
    return r as OriginalZoneItemToCoordsResult;
  }

  itemToCoordsHorizontalFit({
    index: e,
    containerWidth: t,
    containerHeight: i,
    itemCount: n,
  }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    var o = {};
    o['w'] = this.itemWidth;
    o['h'] = this.itemHeight;
    var a = n * this.itemWidth;
    if (a <= t)
      var s = this.itemWidth,
        r = (t - a) / 2;
    else (s = (t - this.itemWidth) / (n - 1)), (r = 0);
    o['x'] = Math.round(e * s + r);
    o['y'] = 0;
    return o as OriginalZoneItemToCoordsResult;
  }

  itemToCoordsVerticalFit({
    index: e,
    // containerWidth: t,
    containerHeight: i,
    itemCount: n,
  }: PPZoneItemToCoordsProps): OriginalZoneItemToCoordsResult {
    var o = {};
    o['w'] = this.itemWidth;
    o['h'] = this.itemHeight;
    var a = n * this.itemHeight;
    if (a <= i)
      var s = this.itemHeight,
        r = (i - a) / 2;
    else (s = (i - this.itemHeight) / (n - 1)), (r = 0);
    o['y'] = Math.round(e * s + r);
    o['x'] = 0;
    return o as OriginalZoneItemToCoordsResult;
  }

  public setPattern(pattern: PaxPamirZone['pattern']) {
    switch (pattern) {
      case 'grid':
        // case "diagonal":
        this.autoHeight = true;
        this.pattern = pattern;
        break;
      case 'verticalFit':
      case 'horizontalFit':
      case 'ellipticalFit':
        this.autoHeight = false;
        this.pattern = pattern;
        break;
      case 'custom':
        this.pattern = pattern;
        break;
      default:
        console.error('zone::setPattern: unknow pattern: ' + pattern);
    }
  }

  private sortItems() {
    return this.items.sort((a, b) => {
      const aWeight = a.weight || 0;
      const bWeight = b.weight || 0;
      return aWeight > bWeight ? 1 : aWeight < bWeight ? -1 : 0;
    });
  }

  /**
   * Use to move items to specific location and then remove
   */
  public async removeTo(input: PaxPamirZoneRemoveTo | PaxPamirZoneRemoveTo[]) {
    const inputItems = Array.isArray(input) ? input : [input];

    const animations = [];
    inputItems.forEach(({ id, destroy = true, to }) => {
      const index = this.items.findIndex((item) => item.id === id);
      if (index < 0) {
        return;
      }
      this.items.splice(index, 1);
      const element = $(id);
      const toElement = $(to);
      // Get the top, left coordinates of two elements
      const fromRect = element.getBoundingClientRect();
      const toRect = toElement.getBoundingClientRect();
      // Calculate the top and left positions
      const top = toRect.top - fromRect.top;
      const left = toRect.left - fromRect.left;

      element.style.top = `${this.pxNumber(element.style.top) + top}px`;
      element.style.left = `${this.pxNumber(element.style.left) + left}px`;

      animations.push(
        new BgaSlideAnimation<BgaAnimationWithOriginSettings>({
          element,
          fromRect,
          animationEnd: (animation: IBgaAnimation<BgaAnimationSettings>) => {
            if (destroy) {
              element.remove();
            }
          },
        })
      );
    });
    this.sortItems();
    await this.animationManager.playParallel([...this.getUpdateAnimations(), ...animations]);
  }

  public getItems(): string[] {
    return this.items.map((item) => item.id);
  }

  public getItemCount(): number {
    return this.items.length;
  }

  private pxNumber(px?: string): number {
    if ((px || '').endsWith('px')) {
      return Number(px.slice(0, -2));
    } else {
      return 0;
    }
  }
}
