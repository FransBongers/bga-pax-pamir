class PaxPamirZone {
  private animationManager: AnimationManager;
  private itemGap: number;
  private itemHeight: number;
  private itemWidth: number;
  private containerDiv: string;
  private containerElement: HTMLElement;
  private items: PaxPamirZoneItem[];

  constructor(config: PaxPamirZoneConfig) {
    const { animationManager, itemGap, itemHeight, itemWidth, containerDiv } = config;
    this.animationManager = animationManager;
    this.itemGap = itemGap || 0;
    this.itemHeight = itemHeight;
    this.itemWidth = itemWidth;
    this.containerDiv = containerDiv;
    this.containerElement = document.getElementById(containerDiv);
    this.items = [];
    if (!this.containerElement) {
      console.error('containerElement null');
      return;
    }
    if (this.containerElement.style.position !== 'absolute') {
      this.containerElement.style.position = 'relative';
    }
  }

  /**
   * Use to move existing elements to the zone
   * @param input single item or array of items
   * @returns
   */
  public async moveToZone(input: PaxPamirZoneItem | PaxPamirZoneItem[]) {
    const animations: BgaAnimation<BgaAnimationSettings>[] = [];
    const items = Array.isArray(input) ? input : [input];
    items.forEach((item) => {
      const newElement = document.getElementById(item.id);
      const { id, weight } = item;
      if (!newElement) {
        console.error('newElement null');
        return;
      }
      this.items.push({
        id,
        weight,
      });
      const fromRect = newElement.getBoundingClientRect();
      const attachTo = document.getElementById(this.containerDiv);
      attachTo.appendChild(newElement);
      animations.push(new BgaSlideAnimation({ element: newElement, transitionTimingFunction: 'ease-out', fromRect }));
    });

    this.sortItems();

    return this.animationManager.playParallel(this.getUpdateAnimations().concat(animations));
  }

  public async placeInZone({ element, id, weight, from }: { element: string; id: string; weight?: number; from?: string }): Promise<void> {
    this.items.push({ id, weight });
    this.sortItems();

    const node = dojo.place(element, this.containerDiv);
    const index = this.items.findIndex((item) => item.id === id) as number;
    const { top, left } = this.itemToCoords({ index });
    node.style.position = 'absolute';
    node.style.top = top;
    node.style.left = left;
    if (!from) {
      node.style.opacity = '0';
      await this.animationManager.playParallel(this.getUpdateAnimations());
      node.style.opacity = '1';
    } else {

      const fromRect = $(from)?.getBoundingClientRect();
      await this.animationManager.playParallel([
        ...this.getUpdateAnimations(),
        new BgaSlideAnimation({ element: node, transitionTimingFunction: 'ease-out', fromRect }),
      ]);
    }
  }

  public async updateDisplay() {
    return await this.animationManager.playParallel(this.getUpdateAnimations());
  }

  public getUpdateAnimations(): BgaSlideAnimation<BgaAnimationWithOriginSettings>[] {
    const animations: BgaSlideAnimation<BgaAnimationWithOriginSettings>[] = [];
    let containerHeight = 0;

    this.items.forEach((item, index) => {

      const element = $(item.id);
      const fromRect = element.getBoundingClientRect();

      if (element) {
        const { top, left, containerHeight: containerHeightCalc } = this.itemToCoords({ item, index });
        
        element.style.top = top;
        element.style.left = left;

        animations.push(new BgaSlideAnimation({ element, fromRect }));
        containerHeight = Math.max(containerHeight, containerHeightCalc);
      }
    });
    this.containerElement.style.height = `${containerHeight}px`;
    // return this.animationManager.playParallel(animations);
    return animations;
  }

  private itemToCoords({ index }: { item?: PaxPamirZoneItem; index: number }): { top: string; left: string; containerHeight: number } {

    const numberOfItemsPerRow = 1 + Math.floor((this.containerElement.clientWidth - this.itemWidth) / (this.itemWidth + this.itemGap));
    const row = Math.floor(index / numberOfItemsPerRow);
    const column = index % numberOfItemsPerRow;

    const top = `${row * (this.itemHeight + this.itemGap)}px`;
    const left = `${column * (this.itemWidth + this.itemGap)}px`;
    const containerHeight = Math.max(this.itemHeight + row * (this.itemHeight + this.itemGap));
    return { top, left, containerHeight };
  }

  private sortItems() {
    return this.items.sort((a, b) => {
      const aWeight = a.weight || 0;
      const bWeight = b.weight || 0;
      return aWeight > bWeight ? 1 : aWeight < bWeight ? -1 : 0;
    });
  }

  public async remove({id, destroy = false}: {id: string; destroy?: boolean}) {
    const index = this.items.findIndex((item) => item.id === id);

    if (index < 0) {
      return;
    }

    this.items.splice(index,1);
    if (destroy) {
      const element = $(id);
      element && element.remove();
    }
    this.updateDisplay();
  }
}
