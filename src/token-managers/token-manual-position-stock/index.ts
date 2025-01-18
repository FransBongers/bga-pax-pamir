/**
 * A stock with manually placed cards
 */
class TokenManualPositionStock<T> extends CardStock<T> {
  /**
   * @param manager the card manager
   * @param element the stock element (should be an empty HTML Element)
   */
  constructor(
    protected manager: CardManager<T>,
    protected element: HTMLElement,
    settings: CardStockSettings,
    protected updateDisplay: (
      element: HTMLElement,
      cards: T[],
      lastCard: T,
      stock: TokenManualPositionStock<T>,
      lastCardOnly?: boolean
    ) => any
  ) {
    super(manager, element, settings);
    element.classList.add('manual-position-stock');
  }

  protected moveFromOtherStock(
    card: T,
    cardElement: HTMLElement,
    animation: CardAnimation<T>,
    settings?: AddCardSettings
  ): Promise<boolean> {
    let promise: Promise<boolean>;

    const element = animation.fromStock.contains(card)
      ? this.manager.getCardElement(card)
      : // @ts-ignore
        animation.fromStock.element;
    const fromRect = element?.getBoundingClientRect();
    // Added hack
    this.updateDisplay(this.element, [...this.getCards(), card], card, this);
    this.addCardElementToParent(cardElement, settings);

    this.removeSelectionClassesFromElement(cardElement);

    promise = fromRect
      ? this.animationFromElement(cardElement, fromRect, {
          originalSide: animation.originalSide,
          rotationDelta: animation.rotationDelta,
          animation: animation.animation,
        })
      : Promise.resolve(false);
    // in the case the card was move inside the same stock we don't remove it
    if (animation.fromStock && animation.fromStock != this) {
      animation.fromStock.removeCard(card);
    }

    if (!promise) {
      console.warn(`CardStock.moveFromOtherStock didn't return a Promise`);
      promise = Promise.resolve(false);
    }

    return promise;
  }

  /**
   * Add a card to the stock.
   *
   * @param card the card to add
   * @param animation a `CardAnimation` object
   * @param settings a `AddCardSettings` object
   * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
   */
  public async addCard(
    card: T,
    animation?: CardAnimation<T>,
    settings?: AddCardSettings
  ): Promise<boolean> {
    const result = await super.addCard(card, animation, settings);
    this.updateDisplay(this.element, this.getCards(), card, this);
    return result;
  }

  public cardRemoved(card: T, settings?: RemoveCardSettings) {
    super.cardRemoved(card, settings);
    this.updateDisplay(this.element, this.getCards(), card, this);
  }
}
