class PlayerActionsState implements State {
  private game: PaxPamirGame;
  private availableCardActions: {
    cardId: string;
    action: string;
  }[];

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState(args: LocalState) {
    this.game.updateLocalState(args);
    if (args.bribe !== null) {
      this.handleNegotiatedBribe(args.bribe);
      return;
    }

    // TODO: find another solution for this?
    // Right now it's needed because initial setup is not yet done due to some async function
    // and availability of actions is determined based on incorrect data
    this.game
      .framework()
      .wait(1)
      .then(() => this.updateInterfaceInitialStep());
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
    this.setupCardActions();
    this.updateMainTitleTextActions();
    if (this.activePlayerHasActions()) {
      this.game.addSecondaryActionButton({
        id: 'pass_btn',
        text: _('End Turn'),
        callback: () => this.onPass(),
      });
      this.setMarketCardsSelectable();
      this.setHandCardsSelectable();
    } else {
      this.game.addPrimaryActionButton({
        id: 'pass_btn',
        text: _('End Turn'),
        callback: () => this.onPass(),
      });
    }
    this.setCardActionsSelectable();
    this.game.addUndoButton({ undoPossible: this.game.localState.undoPossible });
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
    const cardInfo = this.game.getCardInfo(cardId) as CourtCard;
    if (cardInfo.suit === this.game.objectManager.favoredSuit.get()) {
      return true;
    }
    if (cardInfo.specialAbility === SA_SAVVY_OPERATOR || cardInfo.specialAbility === SA_IRREGULARS) {
      return true;
    }

    const player = this.game.getCurrentPlayer();
    // card 105 - New Tactics
    if (
      cardInfo.suit === MILITARY &&
      player
        .getEventsZone()
        .getCards()
        .some((card) => card.id === 'card_105')
    ) {
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
    const hasCardActions = this.availableCardActions.length > 0;
    const hasHandCards = this.currentPlayerHasHandCards();

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
    } else if (remainingActions === 0 && hasCardActions) {
      titleText = _('${you} may perform a bonus action');
    } else if (remainingActions === 0 && !hasCardActions) {
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

  /**
   * Player can perform action if:
   * - Player has remaining actions or action is bonus action
   * - Player can pay minimum action cost
   * - Player meets other requirements
   */
  private playerCanPerformCardAction({ action, cardId, rupees }: { action: string; cardId: string; rupees: number }): boolean {
    switch (action) {
      case BATTLE:
        // There needs to be a card or region where player can battle
        return (
          this.game.activeStates.clientCardActionBattle.getRegionBattleSites().length > 0 ||
          this.game.activeStates.clientCardActionBattle.getCourtCardBattleSites().length > 0
        );
      case BETRAY:
        return this.game.activeStates.clientCardActionBetray.getCourtCardsToBetray().length > 0;
      case BUILD:
        return this.game.activeStates.clientCardActionBuild.getRegionsToBuild().length > 0;
      case GIFT:
        return this.game.getCurrentPlayer().getLowestAvailableGift() > 0;
      case MOVE:
        const hasArmiesToMove = this.game.activeStates.clientCardActionMove.getArmiesToMove().length > 0;
        const hasSpiesToMove = this.game.activeStates.clientCardActionMove.getSpiesToMove().length > 0;
        return hasArmiesToMove || hasSpiesToMove;
      case TAX:
        return (
          this.game.activeStates.clientCardActionTax.getMarketRupeesToTax().length > 0 ||
          this.game.activeStates.clientCardActionTax.getPlayersToTax().length > 0
        );
    }
    return false;
  }

  private setupCardActions(): void {
    this.availableCardActions = [];
    const player = this.game.getCurrentPlayer();
    const rupees = player.getRupees();
    const courtCards = player.getCourtCards();
    courtCards.forEach(({ actions, id }) => {
      const cardHasBeenUsed = this.game.localState.usedCards.includes(id);
      const noActionsLeft = this.game.localState.remainingActions === 0 && !this.isCardFavoredSuit({ cardId: id });
      Object.keys(actions).forEach((action) => {
        const nodeId = `${action}_${id}`;
        this.game.tooltipManager.removeTooltip(nodeId);
        if (cardHasBeenUsed) {
          this.game.tooltipManager.addTextToolTip({ nodeId, text: _('This card has been used') });
          return;
        }
        if (noActionsLeft) {
          this.game.tooltipManager.addTextToolTip({ nodeId, text: _('You do not have actions left to perform this') });
          return;
        }
        let minActionCost = this.game.getMinimumActionCost({ action });
        if (this.game.gameOptions.wakhanEnabled) {
          const bribe = this.game.activeStates.clientInitialBribeCheck.calulateBribe({ cardId: id, action });
          minActionCost =
            minActionCost +
            (bribe !== null && bribe.bribeeId === WAKHAN_PLAYER_ID && !player.ownsEventCard({ cardId: ECE_COURTLY_MANNERS_CARD_ID })
              ? bribe.amount
              : 0);
        }
        if (rupees < minActionCost) {
          this.game.tooltipManager.addTextToolTip({ nodeId, text: _('You do not have enough rupees to pay for this') });
          return;
        }
        const canPerformAction = this.playerCanPerformCardAction({ action, cardId: id, rupees });
        if (!canPerformAction) {
          this.game.tooltipManager.addTextToolTip({ nodeId, text: _('You do not meet the requirements to perform this action') });
          return;
        } else {
          this.availableCardActions.push({
            cardId: id,
            action,
          });
        }
      });
    });
  }

  private currentPlayerHasHandCards(): boolean {
    return this.game.getCurrentPlayer().getHandZone().getCards().length > 0;
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
    // const playerId = this.game.getPlayerId();
    this.availableCardActions.forEach(({ cardId, action }) => {
      const node = dojo.byId(`${action}_${cardId}`);
      if (node === null) {
        return;
      }
      // this.game.tooltipManager.addTextToolTip({nodeId: `${action}_${cardId}`,text: _('explanation text')});
      dojo.addClass(node, 'pp_selectable');
      this.game._connections.push(
        dojo.connect(node, 'onclick', this, (event: PointerEvent) => {
          event.preventDefault();
          event.stopPropagation();
          this.game.framework().setClientState<ClientInitialBribeCheckArgs>(CLIENT_INITIAL_BRIBE_CHECK, {
            args: {
              bribeLimitReached: this.game.localState.bribeLimitReached,
              cardId,
              action: action as PlayerAction,
              next: ({ bribe }: { bribe: BribeArgs }) =>
                this.game
                  .framework()
                  .setClientState<ClientCardActionStateArgs>(cardActionClientStateMap[action], { args: { cardId, bribe } }),
            },
          });
        })
      );
    });
  }

  getCardCost({ cardId, column }: { cardId: string; column: number }): number {
    const baseCardCost = this.game.objectManager.favoredSuit.get() === MILITARY ? 2 : 1;
    const player = this.game.getCurrentPlayer();
    const cardInfo = this.game.getCardInfo(cardId);
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

  private setHandCardsSelectable() {
    this.game.setHandCardsSelectable({
      callback: ({ cardId }: { cardId: string }) => {
        debug('callback triggered', cardId);
        this.game.framework().setClientState<ClientInitialBribeCheckArgs>(CLIENT_INITIAL_BRIBE_CHECK, {
          args: {
            bribeLimitReached: this.game.localState.bribeLimitReached,
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
  }

  setMarketCardsSelectable() {
    dojo.query('.pp_market .pp_card').forEach((node: HTMLElement) => {
      const cardId = node.id;
      const cardInfo = this.game.getCardInfo(cardId);
      if (cardInfo.type === 'eventCard' && cardInfo.purchased.effect === ECE_PUBLIC_WITHDRAWAL) {
        return;
      }
      const cost = this.getCardCost({ cardId, column: Number(node.parentElement.id.split('_')[3]) });
      if (cost <= this.game.getCurrentPlayer().getRupees() && !this.game.localState.usedCards.includes(cardId)) {
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
    console.log('addDebugButton');
    // const region = 'kandahar'
    // this.game.addPrimaryActionButton({
    //   id: 'debug_button',
    //   text: _('Place tribe'),
    //   callback: async () => {
    //     const cylinders = this.game.getCurrentPlayer().getCylinderZone().getItems();
    //     if (cylinders.length === 0) {
    //       return;
    //     }
    //     const from = `cylinders_${this.game.getPlayerId()}`;
    //     const to = `tribes_${region}`;
    //     await this.game.notificationManager.performTokenMove({
    //       move: {
    //         tokenId: cylinders[0],
    //         from,
    //         to,
    //       },
    //     });
    //   },
    // });

    // this.game.addPrimaryActionButton({
    //   id: 'debug_button2',
    //   text: _('Place Afghan army'),
    //   callback: async () => {
    //     const blocks = this.game.objectManager.supply.getCoalitionBlocksZone({coalition: AFGHAN}).getItems();
    //     if (blocks.length === 0) {
    //       return;
    //     }
    //     const from = `blocks_${AFGHAN}`;
    //     const to = `armies_${region}`;
    //     await this.game.notificationManager.performTokenMove({
    //       move: {
    //         tokenId: blocks[0],
    //         from,
    //         to,
    //       },
    //     });
    //   },
    // });

    // this.game.addPrimaryActionButton({
    //   id: 'debug_button3',
    //   text: _('Place British army'),
    //   callback: async () => {
    //     const blocks = this.game.objectManager.supply.getCoalitionBlocksZone({coalition: BRITISH}).getItems();
    //     if (blocks.length === 0) {
    //       return;
    //     }
    //     const from = `blocks_${BRITISH}`;
    //     const to = `armies_${region}`;
    //     await this.game.notificationManager.performTokenMove({
    //       move: {
    //         tokenId: blocks[0],
    //         from,
    //         to,
    //       },
    //     });
    //   },
    // });

    // this.game.addPrimaryActionButton({
    //   id: 'debug_button4',
    //   text: _('Place Russian army'),
    //   callback: async () => {
    //     const blocks = this.game.objectManager.supply.getCoalitionBlocksZone({coalition: RUSSIAN}).getItems();
    //     if (blocks.length === 0) {
    //       return;
    //     }
    //     const from = `blocks_${RUSSIAN}`;
    //     const to = `armies_${region}`;
    //     await this.game.notificationManager.performTokenMove({
    //       move: {
    //         tokenId: blocks[0],
    //         from,
    //         to,
    //       },
    //     });
    //   },
    // });

    // const container = document.getElementById(`pp_map_areas_borders_regions`);
    // container.style.zIndex = '50';
    // // REGIONS.forEach((region) => {
    // //   const element = document.getElementById(`pp_${region}_armies_select`);
    // //   if (element) {
    // //     element.classList.add('pp_selectable');
    // //     this.game._connections.push(dojo.connect(element, 'onclick', this, () => console.log('region',region)));
    // //   }
    // // });
    // BORDERS.forEach((border) => {
    //   const element = document.getElementById(`pp_${border}_border_select`);
    //   if (element) {
    //     element.classList.add('pp_selectable');
    //     this.game._connections.push(dojo.connect(element, 'onclick', this, async () => {
    //       const loyalty = this.game.getCurrentPlayer().getLoyalty();
    //       const from = `blocks_${loyalty}`;
    //       const zone = this.game.getZoneForLocation({location: from});
    //       const items = zone.getItems();
    //       if (items.length === 0) {
    //         return;
    //       }
    //       const tokenId = items[items.length - 1];
    //       await this.game.notificationManager.performTokenMove({move: {
    //         tokenId,
    //         from,
    //         to: `roads_${border}`
    //       }})
    //     }));
    //   }
    // })
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
