class PlayerActionsState implements State {
  private game: PaxPamirGame;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState(args: LocalState) {
    this.game.updateLocalState(args);
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
          this.game.framework().setClientState<ClientPlayCardStateArgs>('clientPlayCard', { args: { cardId } });
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
    this.game.addDangerActionButton({
      id: 'undo_btn',
      text: _('Undo'),
      callback: () => this.game.takeAction({ action: 'restart' }),
    });
  }

  private updateInterfaceCardActionBattleStart({ cardId }: { cardId: string }) {
    this.game.clearPossible();
    this.game.clientUpdatePageTitle({
      text: _('${you} must select a card or region'),
      args: {},
    });
    this.setRegionsSelectable();
  }

  private updateInterfaceCardActionBetrayStart({ cardId }: { cardId: string }) {
    this.game.clearPossible();
    console.log('betray clicked');
  }

  private updateInterfaceCardActionBuildStart({ cardId }: { cardId: string }) {
    this.game.clearPossible();
    console.log('build clicked');
  }

  private updateInterfaceCardActionGiftStart({ cardId }: { cardId: string }) {
    this.game.clearPossible();
    this.game.clientUpdatePageTitle({
      text: _('${you} must select a gift to purchase'),
      args: {
        you: '${you}',
      },
    });
    this.setGiftsSelectable({ cardId });
    this.game.addCancelButton();
  }

  private updateInterfaceCardActionMoveStart({ cardId }: { cardId: string }) {
    this.game.clearPossible();
    console.log('move clicked');
  }

  private updateInterfaceCardActionTaxStart({ cardId }: { cardId: string }) {
    this.game.clearPossible();
    console.log('tax clicked');
  }

  private updateInterfaceConfirmSelectGift({ value, cardId }: { value: number; cardId: string }) {
    this.game.clearPossible();
    dojo.query(`#pp_gift_${value}_${this.game.getPlayerId()}`).addClass('pp_selected');
    this.game.clientUpdatePageTitle({ text: _('Purchase gift for ${value} rupees?'), args: { value: '' + value } });
    this.game.addDangerActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () =>
        this.game.takeAction({
          action: 'selectGift',
          data: { selectedGift: value, cardId },
        }),
    });
    this.game.addDangerActionButton({
      id: 'cancel_btn',
      text: _('Cancel'),
      callback: () => {
        this.game.onCancel();
      },
    });
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
   * 5. Player can perform free actions (no actions but cards with favored suit in court)
   *    You may perform free card actions
   * 6. Player does not have free actions
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
      titleText = _('${you} may perform a free card action');
    } else if (remainingActions === 0 && !hasFreeCardActions) {
      titleText = _('${you} have no remaining actions');
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

  private activePlayerHasCardActions(): boolean {
    return this.game.localState.activePlayer.court.cards.some(({ id, used }) => {
      const cardInfo = this.game.gamedatas.staticData.cards[id] as CourtCard;
      return used === 0 && Object.keys(cardInfo.actions).length > 0;
    });
  }

  private activePlayerHasFreeCardActions(): boolean {
    return this.game.localState.activePlayer.court.cards.some(({ id, used }) => {
      const cardInfo = this.game.gamedatas.staticData.cards[id] as CourtCard;
      return (
        used === 0 && cardInfo.suit == this.game.objectManager.favoredSuit.get() && Object.keys(cardInfo).length > 0
      );
    });
  }

  private currentPlayerHasHandCards(): boolean {
    const currentPlayerId = this.game.getPlayerId();
    return this.game.playerManager.getPlayer({ playerId: currentPlayerId }).getHandZone().getItemNumber() > 0;
  }

  private activePlayerHasCourtCards(): boolean {
    return this.game.localState.activePlayer.court.cards.length > 0;
  }

  private setCardActionsSelectable() {
    const playerId = this.game.getPlayerId();
    dojo.query(`.pp_card_in_court.pp_player_${playerId}`).forEach((node: HTMLElement) => {
      const cardId = node.id;
      const used = this.game.localState.activePlayer.court.cards?.find((card) => card.id === cardId)?.used === 1;
      if (
        !used &&
        (this.game.localState.remainingActions > 0 ||
          (this.game.gamedatas.staticData.cards[cardId] as CourtCard).suit === this.game.objectManager.favoredSuit.get())
      )
        dojo.map(node.children, (child: HTMLElement) => {
          if (dojo.hasClass(child, 'pp_card_action')) {
            const cardAction = child.id.split('_')[0];
            // const nextStep = `cardAction${capitalizeFirstLetter(child.id.split('_')[0])}`;
            dojo.addClass(child, 'pp_selectable');
            this.game._connections.push(
              dojo.connect(child, 'onclick', this, () => {
                switch (cardAction) {
                  case 'battle':
                    this.updateInterfaceCardActionBattleStart({ cardId });
                    break;
                  case 'betray':
                    this.updateInterfaceCardActionBetrayStart({ cardId });
                    break;
                  case 'build':
                    this.updateInterfaceCardActionBuildStart({ cardId });
                    break;
                  case 'gift':
                    this.updateInterfaceCardActionGiftStart({ cardId });
                    break;
                  case 'move':
                    this.updateInterfaceCardActionMoveStart({ cardId });
                    break;
                  case 'tax':
                    this.updateInterfaceCardActionTaxStart({ cardId });
                    break;
                }
                // this.updateInterface({ nextStep, args: { cardAction: { cardId } } });
              })
            );
          }
        });
    });
  }

  setGiftsSelectable({ cardId }: { cardId: string }) {
    const playerId = this.game.getPlayerId();
    [2, 4, 6].forEach((giftValue) => {
      const hasGift =
        this.game.playerManager
          .getPlayer({ playerId })
          .getGiftZone({
            value: giftValue,
          })
          .getAllItems().length > 0;
      if (!hasGift && giftValue <= this.game.localState.activePlayer.rupees) {
        dojo.query(`#pp_gift_${giftValue}_${playerId}`).forEach((node: HTMLElement) => {
          dojo.addClass(node, 'pp_selectable');
          this.game._connections.push(
            dojo.connect(node, 'onclick', this, () => this.updateInterfaceConfirmSelectGift({ value: giftValue, cardId }))
          );
        });
      }
    });
  }

  setMarketCardsSelectable() {
    const baseCardCost = this.game.objectManager.favoredSuit.get() === MILITARY ? 2 : 1;
    dojo.query('.pp_market_card').forEach((node: HTMLElement) => {
      const cost = Number(node.parentElement.id.split('_')[3]) * baseCardCost; // cost is equal to the column number
      const cardId = node.id;
      if (
        cost <= this.game.localState.activePlayer.rupees &&
        !this.game.localState.usedCards.includes(cardId)
      ) {
        dojo.addClass(node, 'pp_selectable');
        this.game._connections.push(
          // dojo.connect(node, 'onclick', this, () => this.updateInterfacePurchaseCardConfirm({ cardId, cost }))
          dojo.connect(node, 'onclick', this, () =>
            this.game.framework().setClientState<ClientPurchaseCardStateArgs>('clientPurchaseCard', { args: { cardId, cost } })
          )
        );
      }
    });
  }

  setRegionsSelectable() {
    const container = document.getElementById(`pp_map_areas`);
    container.classList.add('pp_selectable');
    REGIONS.forEach((region) => {
      const element = document.getElementById(`pp_region_${region}`);
      element.classList.add('pp_selectable');
      this.game._connections.push(dojo.connect(element, 'onclick', this, () => console.log('Region', region)));
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
