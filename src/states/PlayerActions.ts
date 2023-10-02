class PlayerActionsState implements State {
  private game: PaxPamirGame;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState(args: LocalState) {
    this.game.updateLocalState(args);
    if (args.bribe !== null) {
      this.handleNegotiatedBribe(args.bribe);
      return;
    }
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {
    debug('Leaving PlayerActionsState');
  }

  //  .####.##....##.########.########.########..########....###.....######..########
  //  ..##..###...##....##....##.......##.....##.##.........##.##...##....##.##......
  //  ..##..####..##....##....##.......##.....##.##........##...##..##.......##......
  //  ..##..##.##.##....##....######...########..######...##.....##.##.......######..
  //  ..##..##..####....##....##.......##...##...##.......#########.##.......##......
  //  ..##..##...###....##....##.......##....##..##.......##.....##.##....##.##......
  //  .####.##....##....##....########.##.....##.##.......##.....##..######..########

  // ..######..########.########.########...######.
  // .##....##....##....##.......##.....##.##....##
  // .##..........##....##.......##.....##.##......
  // ..######.....##....######...########...######.
  // .......##....##....##.......##..............##
  // .##....##....##....##.......##........##....##
  // ..######.....##....########.##.........######.

  private updateInterfaceInitialStep() {
    this.game.clearPossible();
    this.updateMainTitleTextActions();
    if (this.activePlayerHasActions()) {
      this.game.addSecondaryActionButton({
        id: 'pass_btn',
        text: _('End Turn'),
        callback: () => this.onPass(),
      });
      this.setMarketCardsSelectable();
      this.game.setHandCardsSelectable({
        callback: ({ cardId }: { cardId: string }) => {
          debug('callback triggered', cardId);
          this.game.framework().setClientState<ClientInitialBribeCheckArgs>(CLIENT_INITIAL_BRIBE_CHECK, {
            args: {
              cardId,
              action: 'playCard',
              next: ({
                bribe,
              }: {
                bribe: {
                  amount: number;
                  negotiated?: boolean;
                } | null;
              }) => this.game.framework().setClientState<ClientPlayCardStateArgs>(CLIENT_PLAY_CARD, { args: { cardId, bribe } }),
            },
          });
        },
      });
      this.setCardActionsSelectable();
    } else {
      if (this.activePlayerHasFreeCardActions()) {
        this.setCardActionsSelectable();
      }
      this.game.addPrimaryActionButton({
        id: 'pass_btn',
        text: _('End Turn'),
        callback: () => this.onPass(),
      });
    }
    this.game.addUndoButton();
    // this.addDebugButton();
  }

  private updateInterfacePass() {
    this.game.clearPossible();
    this.game.clientUpdatePageTitle({ text: _('Confirm to your end turn'), args: {} });
    this.game.addDangerActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () => this.game.takeAction({ action: 'pass' }),
    });
    this.game.addSecondaryActionButton({ id: 'cancel_btn', text: _('Cancel'), callback: () => this.game.onCancel() });
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private isCardFavoredSuit({ cardId }: { cardId: string }): boolean {
    // debug('isCardFavoredSuit', cardId);
    const cardInfo = this.game.getCardInfo({ cardId }) as CourtCard;
    if (cardInfo.suit === this.game.objectManager.favoredSuit.get()) {
      return true;
    }
    if (cardInfo.specialAbility === SA_SAVVY_OPERATOR || cardInfo.specialAbility === SA_IRREGULARS) {
      return true;
    }

    const player = this.game.getCurrentPlayer();
    // card 105 - New Tactics
    if (cardInfo.suit === MILITARY && player.getEventsZone().getItems().includes('card_105')) {
      return true;
    }
    return false;
  }

  /**
   * Player had actions remaining
   * 1. Player can only purchase cards (no cards in hand or in court);
   *    You may purchase a card (x actions remaining)
   * 2. Player can purchase and play cards (cards in hand, no card in court)
   *    You may purchase a card or play a card (x actions remaining)
   * 3. Player can purchase and perform card actions (no cards in hand, card in court)
   *    You may purchase a card or perform a card action
   * 4. Player can purchase, play and perform card actions (no cards in hand, card in court)
   *    You may purchase a card, play a card or perform card actions (x actions remaining)
   * Player has no actions remaining
   * 5. Player can perform bonus actions (no actions but cards with favored suit in court)
   *    You may perform free card actions
   * 6. Player does not have bonus actions
   */
  private updateMainTitleTextActions() {
    const remainingActions = this.game.localState.remainingActions;
    const hasCardActions = this.activePlayerHasCardActions();
    const hasHandCards = this.currentPlayerHasHandCards();
    const hasFreeCardActions = this.activePlayerHasFreeCardActions();
    let titleText = '';
    // cibst case = 0;
    if (remainingActions > 0 && !hasHandCards && !hasCardActions) {
      titleText = _('${you} may purchase a card');
    } else if (remainingActions > 0 && hasHandCards && !hasCardActions) {
      titleText = _('${you} may purchase a card or play a card');
    } else if (remainingActions > 0 && !hasHandCards && hasCardActions) {
      titleText = _('${you} may purchase a card or perform a card action');
    } else if (remainingActions > 0 && hasHandCards && hasCardActions) {
      titleText = _('${you} may purchase a card, play a card or perform a card action');
    } else if (remainingActions === 0 && hasFreeCardActions) {
      titleText = _('${you} may perform a bonus action');
    } else if (remainingActions === 0 && !hasFreeCardActions) {
      titleText = _('${you} have no actions remaining');
    }

    if (remainingActions === 1) {
      titleText += _(' (1 action remaining)');
    } else if (remainingActions === 2) {
      titleText += _(' (2 actions remaining)');
    }

    this.game.gamedatas.gamestate.descriptionmyturn = titleText;
    this.game.framework().updatePageTitle();
  }

  private activePlayerHasActions(): boolean {
    return this.game.localState.remainingActions > 0 || false;
  }

  // TODO: check value of purchased gifts
  private activePlayerHasCardActions(): boolean {
    const rupees = this.game.playerManager.getPlayer({ playerId: this.game.getPlayerId() }).getRupees();
    return this.game.localState.activePlayer.court.cards.some(({ id, used }) => {
      const cardInfo = this.game.gamedatas.staticData.cards[id] as CourtCard;
      const cardHasActions = Object.keys(cardInfo.actions).length > 0;
      const hasEnoughRupees = rupees >= 2 || Object.values(cardInfo.actions).some(({ type }) => CARD_ACTIONS_WITHOUT_COST.includes(type));
      return used === 0 && cardHasActions && hasEnoughRupees;
    });
  }

  private activePlayerHasFreeCardActions(): boolean {
    return this.game.localState.activePlayer.court.cards.some(({ id, used }) => {
      const cardInfo = this.game.gamedatas.staticData.cards[id] as CourtCard;
      return used === 0 && this.isCardFavoredSuit({ cardId: id });
      // cardInfo.suit == this.game.objectManager.favoredSuit.get() &&
      Object.keys(cardInfo.actions).length > 0;
    });
  }

  private currentPlayerHasHandCards(): boolean {
    const currentPlayerId = this.game.getPlayerId();
    return this.game.playerManager.getPlayer({ playerId: currentPlayerId }).getHandZone().getItemCount() > 0;
  }

  private handleNegotiatedBribe({ action, cardId, briber }: NegotiatedBribe): void {
    const bribe = {
      amount: briber.currentAmount,
      negotiated: true,
    };
    if (action === 'playCard') {
      this.game.framework().setClientState<ClientPlayCardStateArgs>(CLIENT_PLAY_CARD, { args: { cardId, bribe } });
    } else if (Object.keys(cardActionClientStateMap).includes(action)) {
      this.game.framework().setClientState<ClientCardActionStateArgs>(cardActionClientStateMap[action], {
        args: {
          cardId,
          bribe,
        },
      });
    }
  }

  private setCardActionsSelectable() {
    const playerId = this.game.getPlayerId();
    dojo.query(`.pp_card_in_court.pp_player_${playerId}`).forEach((node: HTMLElement) => {
      const cardId = node.id;
      const used = this.game.localState.activePlayer.court.cards?.find((card) => card.id === cardId)?.used === 1;
      if (
        !used &&
        (this.game.localState.remainingActions > 0 || this.isCardFavoredSuit({ cardId }))
        // (this.game.gamedatas.staticData.cards[cardId] as CourtCard).suit === this.game.objectManager.favoredSuit.get())
      ) {
        const rupees = this.game.playerManager.getPlayer({ playerId }).getRupees();
        dojo.map(node.children, (child: HTMLElement) => {
          if (dojo.hasClass(child, 'pp_card_action')) {
            const cardAction = child.id.split('_')[0] as CardAction;

            const minActionCost = this.game.getMinimumActionCost({ action: cardAction });
            console.log('cardAction', cardAction, 'minActionCost', minActionCost);
            if (minActionCost === null || rupees < minActionCost) {
              return;
            }
            console.log('childId', child.id);
            // const nextStep = `cardAction${capitalizeFirstLetter(child.id.split('_')[0])}`;
            dojo.addClass(child, 'pp_selectable');
            this.game._connections.push(
              dojo.connect(child, 'onclick', this, (event: PointerEvent) => {
                event.preventDefault();
                event.stopPropagation();
                this.game.framework().setClientState<ClientInitialBribeCheckArgs>(CLIENT_INITIAL_BRIBE_CHECK, {
                  args: {
                    cardId,
                    action: cardAction,
                    next: ({ bribe }: { bribe: BribeArgs }) =>
                      this.game
                        .framework()
                        .setClientState<ClientCardActionStateArgs>(cardActionClientStateMap[cardAction], { args: { cardId, bribe } }),
                  },
                });
              })
            );
          }
        });
      }
    });
  }

  getCardCost({ cardId, column }: { cardId: string; column: number }): number {
    const baseCardCost = this.game.objectManager.favoredSuit.get() === MILITARY ? 2 : 1;
    const player = this.game.getCurrentPlayer();
    const cardInfo = this.game.getCardInfo({ cardId });
    if (cardInfo.type === 'courtCard' && cardInfo.region === HERAT && player.hasSpecialAbility({ specialAbility: SA_HERAT_INFLUENCE })) {
      return 0;
    }
    if (cardInfo.type === 'courtCard' && cardInfo.region === PERSIA && player.hasSpecialAbility({ specialAbility: SA_PERSIAN_INFLUENCE })) {
      return 0;
    }
    if (
      cardInfo.type === 'courtCard' &&
      cardInfo.loyalty === RUSSIAN &&
      player.hasSpecialAbility({ specialAbility: SA_RUSSIAN_INFLUENCE })
    ) {
      return 0;
    }
    return column * baseCardCost; // cost is equal to the column number
  }

  setMarketCardsSelectable() {
    dojo.query('.pp_market_card').forEach((node: HTMLElement) => {
      const cardId = node.id;
      const cardInfo = this.game.getCardInfo({ cardId });
      if (cardInfo.type === 'eventCard' && cardInfo.purchased.effect === ECE_PUBLIC_WITHDRAWAL) {
        return;
      }
      const cost = this.getCardCost({ cardId, column: Number(node.parentElement.id.split('_')[3]) });
      if (cost <= this.game.localState.activePlayer.rupees && !this.game.localState.usedCards.includes(cardId)) {
        dojo.addClass(node, 'pp_selectable');
        this.game._connections.push(
          // dojo.connect(node, 'onclick', this, () => this.updateInterfacePurchaseCardConfirm({ cardId, cost }))
          dojo.connect(node, 'onclick', this, () =>
            this.game.framework().setClientState<ClientPurchaseCardStateArgs>(CLIENT_PURCHASE_CARD, { args: { cardId, cost } })
          )
        );
      }
    });
  }

  public setCardActionSelected({ cardId, action }: { cardId: string; action: string }) {
    const node = dojo.byId(`${action}_${cardId}`);
    if (node) {
      dojo.addClass(node, PP_SELECTED);
    }
  }

  public addDebugButton() {
    this.game.addPrimaryActionButton({
      id: 'debug_button',
      text: _('Debug'),
      callback: async () => {
        const zone = this.game.map.getBorder({ border: 'herat_transcaspia' }).getRoadZone();
        console.log('zone', zone);
        await zone.moveToZone({ elements: { id: 'block_afghan_7' }, classesToAdd: [PP_ROAD], classesToRemove: [PP_COALITION_BLOCK] });
      },
    });
  }

  //  ..######..##.......####..######..##....##
  //  .##....##.##........##..##....##.##...##.
  //  .##.......##........##..##.......##..##..
  //  .##.......##........##..##.......#####...
  //  .##.......##........##..##.......##..##..
  //  .##....##.##........##..##....##.##...##.
  //  ..######..########.####..######..##....##

  // .##.....##....###....##....##.########..##.......########..######.
  // .##.....##...##.##...###...##.##.....##.##.......##.......##....##
  // .##.....##..##...##..####..##.##.....##.##.......##.......##......
  // .#########.##.....##.##.##.##.##.....##.##.......######....######.
  // .##.....##.#########.##..####.##.....##.##.......##.............##
  // .##.....##.##.....##.##...###.##.....##.##.......##.......##....##
  // .##.....##.##.....##.##....##.########..########.########..######.

  onPass() {
    if (!this.game.framework().checkAction('pass') || !this.game.framework().isCurrentPlayerActive()) return;
    if (Number(this.game.localState.remainingActions) > 0) {
      this.updateInterfacePass();
      return;
    }
    this.game.takeAction({ action: 'pass' });
  }
}
