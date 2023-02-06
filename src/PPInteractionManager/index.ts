//  .####.##....##.########.########.########.....###.....######..########.####..#######..##....##
//  ..##..###...##....##....##.......##.....##...##.##...##....##....##.....##..##.....##.###...##
//  ..##..####..##....##....##.......##.....##..##...##..##..........##.....##..##.....##.####..##
//  ..##..##.##.##....##....######...########..##.....##.##..........##.....##..##.....##.##.##.##
//  ..##..##..####....##....##.......##...##...#########.##..........##.....##..##.....##.##..####
//  ..##..##...###....##....##.......##....##..##.....##.##....##....##.....##..##.....##.##...###
//  .####.##....##....##....########.##.....##.##.....##..######.....##....####..#######..##....##

//  .##.....##....###....##....##....###.....######...########.########.
//  .###...###...##.##...###...##...##.##...##....##..##.......##.....##
//  .####.####..##...##..####..##..##...##..##........##.......##.....##
//  .##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
//  .##.....##.#########.##..####.#########.##....##..##.......##...##..
//  .##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
//  .##.....##.##.....##.##....##.##.....##..######...########.##.....##


class PPInteractionManager {
  private game: PaxPamirGame;
  private _connections: unknown[];

  // TODO (Frans): check what needs to be converted to number
  private activePlayer: {
    court?: Token[];
    favoredSuit?: string;
    hand?: Record<string, Token>;
    remainingActions?: number;
    rupees?: string;
    unavailableCards?: string[];
  };
  // TODO(Frans): we should probably remove below props here since it's used in specific funtion
  private numberOfDiscards: number;

  constructor(game: PaxPamirGame) {
    console.log('Interaction Manager');
    this.game = game;
    this._connections = [];
    // Will store all data for active player and gets refreshed with entering player actions state
    this.activePlayer = {};
  }

  clearPossible() {
    this.game.framework().removeActionButtons();
    dojo.empty('customActions');

    dojo.forEach(this._connections, dojo.disconnect);
    this._connections = [];

    dojo.query('.pp_selectable').removeClass('pp_selectable');
    dojo.query('.pp_selected').removeClass('pp_selected');
  }

  resetActionArgs() {
    console.log('resetActionArgs');

    // Remove all selectable / selected classes
    dojo.query('.pp_selectable').removeClass('pp_selectable');
    dojo.query('.pp_selected').removeClass('pp_selected');
    // getElementById used because dojo does not seem to handle svgs well.
    REGIONS.forEach((region) => {
      const element = document.getElementById(`pp_region_${region}`);
      element.classList.remove('pp_selectable');
    });
    document.getElementById('pp_map_areas').classList.remove('pp_selectable');

    // reset connections
    dojo.forEach(this._connections, dojo.disconnect);
    this._connections = [];
  }

  // .##.....##.########..########.....###....########.########
  // .##.....##.##.....##.##.....##...##.##......##....##......
  // .##.....##.##.....##.##.....##..##...##.....##....##......
  // .##.....##.########..##.....##.##.....##....##....######..
  // .##.....##.##........##.....##.#########....##....##......
  // .##.....##.##........##.....##.##.....##....##....##......
  // ..#######..##........########..##.....##....##....########

  //  .####.##....##.########.########.########..########....###.....######..########
  //  ..##..###...##....##....##.......##.....##.##.........##.##...##....##.##......
  //  ..##..####..##....##....##.......##.....##.##........##...##..##.......##......
  //  ..##..##.##.##....##....######...########..######...##.....##.##.......######..
  //  ..##..##..####....##....##.......##...##...##.......#########.##.......##......
  //  ..##..##...###....##....##.......##....##..##.......##.....##.##....##.##......
  //  .####.##....##....##....########.##.....##.##.......##.....##..######..########

  updateInterface({ nextStep, args }: { nextStep: string; args?: UpdateInterfaceArgs }) {
    console.log(`updateInterface ${nextStep}`);
    this.clearPossible();

    switch (nextStep) {
      case CARD_ACTION_BATTLE:
        this.updatePageTitle({
          text: _('${you} must select a card or region'),
          args: {},
        });
        this.setRegionsSelectable();
        break;
      case CARD_ACTION_BETRAY:
        console.log('betray clicked');
        break;
      case CARD_ACTION_BUILD:
        console.log('build clicked');
        break;
      case CARD_ACTION_GIFT:
        this.updatePageTitle({
          text: _('${you} must select a gift to purchase'),
          args: {
            you: '${you}',
          },
        });
        this.setGiftsSelectable({ cardId: args.cardAction.cardId });
        this.addDangerActionButton({ id: 'cancel_btn', text: _('Cancel'), callback: () => this.onCancel() });
        break;
      case CARD_ACTION_MOVE:
        console.log('move clicked');
        break;
      case CARD_ACTION_TAX:
        console.log('tax clicked');
        break;
      case CHOOSE_LOYALTY:
        this.addPrimaryActionButton({
          id: 'afghan_button',
          text: _('Afghan'),
          callback: () => this.game.takeAction({ action: 'chooseLoyalty', data: { coalition: AFGHAN } }),
        });
        this.addPrimaryActionButton({
          id: 'british_button',
          text: _('British'),
          callback: () => this.game.takeAction({ action: 'chooseLoyalty', data: { coalition: BRITISH } }),
        });
        this.addPrimaryActionButton({
          id: 'russian_button',
          text: _('Russian'),
          callback: () => this.game.takeAction({ action: 'chooseLoyalty', data: { coalition: RUSSIAN } }),
        });
        break;
      case DISCARD_COURT:
        this.updatePageTitle({
          text:
            this.numberOfDiscards !== 1
              ? _('${you} must discard ${numberOfDiscards} cards')
              : _('${you} must discard ${numberOfDiscards} card'),
          args: {
            numberOfDiscards: this.numberOfDiscards,
            you: '${you}',
          },
        });
        this.addPrimaryActionButton({
          id: 'confirm_btn',
          text: _('Confirm'),
          callback: () => this.handleDiscardConfirm({ fromHand: false }),
        });
        dojo.addClass('confirm_btn', 'pp_disabled');
        this.setCourtCardsSelectableForDiscard();
        break;
      case DISCARD_HAND:
        this.updatePageTitle({
          text:
            this.numberOfDiscards !== 1
              ? _('${you} must discard ${numberOfDiscards} cards')
              : _('${you} must discard ${numberOfDiscards} card'),
          args: {
            numberOfDiscards: this.numberOfDiscards,
            you: '${you}',
          },
        });
        this.addPrimaryActionButton({
          id: 'confirm_btn',
          text: _('Confirm'),
          callback: () => this.handleDiscardConfirm({ fromHand: true }),
        });
        dojo.addClass('confirm_btn', 'pp_disabled');
        this.setHandCardsSelectable({
          callback: ({ cardId }: { cardId: string }) => this.handleDiscardSelect({ cardId }),
        });
        break;
      case PLAYER_ACTIONS:
        this.updateMainTitleTextActions();
        if (this.activePlayerHasActions()) {
          this.addSecondaryActionButton({ id: 'pass_btn', text: _('End Turn'), callback: () => this.onPass() });
          this.setMarketCardsSelectable();
          this.setHandCardsSelectable({
            callback: ({ cardId }: { cardId: string }) =>
              this.updateInterface({ nextStep: CONFIRM_PLAY, args: { confirmPlay: { cardId } } }),
          });
          this.setCardActionsSelectable();
        } else {
          if (this.activePlayerHasFreeCardActions()) {
            this.setCardActionsSelectable();
          }
          this.addPrimaryActionButton({ id: 'pass_btn', text: _('End Turn'), callback: () => this.onPass() });
        }
        break;
      case CONFIRM_PLACE_SPY:
        dojo.query(`.pp_${args.confirmPlaceSpy.cardId}`).addClass('pp_selected');
        this.updatePageTitle({
          text: _('Place a spy on ${cardName}'),
          args: {
            cardName: this.getCardInfo({ cardId: args.confirmPlaceSpy.cardId as string }).name,
          },
        });
        this.addPrimaryActionButton({
          id: 'confirm_btn',
          text: _('Confirm'),
          callback: () => this.game.takeAction({ action: 'placeSpy', data: { cardId: args.confirmPlaceSpy.cardId } }),
        });
        this.addDangerActionButton({ id: 'cancel_btn', text: _('Cancel'), callback: () => this.onCancel() });
      case PLACE_ROAD:
        (args?.placeRoad?.borders || []).forEach((border) => {
          this.addPrimaryActionButton({
            id: `${border}_btn`,
            text: _(this.game.gamedatas.borders[border].name),
            callback: () => this.game.takeAction({ action: 'placeRoad', data: { border } }),
          });
        });
        break;
      case PLACE_SPY:
        this.setPlaceSpyCardsSelectable({ region: args.placeSpy.region });
        break;
      case CONFIRM_PLAY:
        dojo.query(`.pp_${args.confirmPlay.cardId}`).addClass('pp_selected');
        this.updatePageTitle({
          text: _("Select which side of court to play '${name}':"),
          args: {
            name: this.getCardInfo({ cardId: args.confirmPlay.cardId }).name,
          },
        });
        this.game.framework().updatePageTitle();
        this.addPrimaryActionButton({
          id: 'left_side_btn',
          text: _('<< LEFT'),
          callback: () => this.game.takeAction({ action: 'playCard', data: { cardId: args.confirmPlay.cardId, leftSide: true } }),
        });
        this.addPrimaryActionButton({
          id: 'right_side_btn',
          text: _('RIGHT >>'),
          callback: () => this.game.takeAction({ action: 'playCard', data: { cardId: args.confirmPlay.cardId, leftSide: false } }),
        });
        this.addDangerActionButton({ id: 'cancel_btn', text: _('Cancel'), callback: () => this.onCancel() });
        break;
      case CONFIRM_PURCHASE:
        const { cardId, cost } = args.confirmPurchase;
        const name = this.getCardInfo({ cardId }).name;
        dojo.query(`.pp_${cardId}`).addClass('pp_selected');
        this.updatePageTitle({
          text: _("Purchase '${name}' for ${cost} ${rupees}?"),
          args: {
            name,
            cost,
            rupees: Number(cost) === 1 ? 'rupee' : 'rupees',
          },
        });
        this.addPrimaryActionButton({
          id: 'confirm_btn',
          text: _('Confirm'),
          callback: () => this.game.takeAction({ action: 'purchaseCard', data: { cardId: args.confirmPurchase.cardId } }),
        });
        this.addDangerActionButton({ id: 'cancel_btn', text: _('Cancel'), callback: () => this.onCancel() });
        break;
      case CONFIRM_SELECT_GIFT:
        dojo.query(`#pp_gift_${args.confirmSelectGift.value}_${this.game.getPlayerId()}`).addClass('pp_selected');
        this.updatePageTitle({ text: _('Purchase gift for ${value} rupees?'), args: { value: args.confirmSelectGift.value as string } });
        this.addDangerActionButton({
          id: 'confirm_btn',
          text: _('Confirm'),
          callback: () =>
            this.game.takeAction({
              action: 'selectGift',
              data: { selectedGift: args.confirmSelectGift.value, cardId: args.confirmSelectGift.cardId },
            }),
        });
        this.addSecondaryActionButton({ id: 'cancel_btn', text: _('Cancel'), callback: () => this.onCancel() });
        break;
      case PASS:
        this.updatePageTitle({ text: _('Confirm to your end turn'), args: {} });
        this.addDangerActionButton({
          id: 'confirm_btn',
          text: _('Confirm'),
          callback: () => this.game.takeAction({ action: 'pass' }),
        });
        this.addSecondaryActionButton({ id: 'cancel_btn', text: _('Cancel'), callback: () => this.onCancel() });
        break;
      default:
        console.log(`No changes for step ${nextStep}`);
        break;
    }
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  activePlayerHasActions(): boolean {
    return this.activePlayer.remainingActions > 0 || false;
  }

  activePlayerHasCardActions(): boolean {
    return this.activePlayer.court.some(({ id, used }) => {
      const cardInfo = this.game.gamedatas.cards[id] as CourtCard;
      return used === 0 && Object.keys(cardInfo.actions).length > 0;
    });
  }

  activePlayerHasFreeCardActions(): boolean {
    return this.activePlayer.court.some(({ id, used }) => {
      const cardInfo = this.game.gamedatas.cards[id] as CourtCard;
      return used === 0 && cardInfo.suit == this.activePlayer.favoredSuit && Object.keys(cardInfo).length > 0;
    });
  }

  activePlayerHasHandCards(): boolean {
    return Object.keys(this.activePlayer.hand).length > 0;
  }

  activePlayerHasCourtCards(): boolean {
    return this.activePlayer.court.length > 0;
  }

  /*
   * Add a blue/grey button if it doesn't already exists
   */
  addPrimaryActionButton({ id, text, callback }: { id: string; text: string; callback: Function | string }) {
    if (!$(id)) this.game.framework().addActionButton(id, text, callback, 'customActions', false, 'blue');
  }

  addSecondaryActionButton({ id, text, callback }: { id: string; text: string; callback: Function | string }) {
    if (!$(id)) this.game.framework().addActionButton(id, text, callback, 'customActions', false, 'gray');
  }

  addDangerActionButton({ id, text, callback }: { id: string; text: string; callback: Function | string }) {
    if (!$(id)) this.game.framework().addActionButton(id, text, callback, 'customActions', false, 'red');
  }

  getCardInfo({ cardId }: { cardId: string }): Card {
    return this.game.gamedatas.cards[cardId];
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
   * 5. Player can perform free actions (no actions but cards with favored suit in court)
   *    You may perform free card actions
   * 6. Player does not have free actions
   */
  updateMainTitleTextActions() {
    const remainingActions = this.activePlayer.remainingActions;
    const hasCardActions = this.activePlayerHasCardActions();
    const hasHandCards = this.activePlayerHasHandCards();
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

  handleDiscardSelect({ cardId }: { cardId: string }) {
    console.log('handleSelect', this.numberOfDiscards);
    dojo.query(`.pp_${cardId}`).toggleClass('pp_selected').toggleClass('pp_discard').toggleClass('pp_selectable');
    if (dojo.query('.pp_selected').length === this.numberOfDiscards) {
      console.log('inside if');
      dojo.removeClass('confirm_btn', 'pp_disabled');
    } else {
      dojo.addClass('confirm_btn', 'pp_disabled');
    }
  }

  handleDiscardConfirm({ fromHand }: { fromHand: boolean }) {
    let cards = '';
    dojo.query('.pp_selected').forEach((node: HTMLElement, index) => {
      cards += ' ' + node.id;
    }, this);
    this.game.takeAction({
      action: 'discardCards',
      data: {
        cards,
        fromHand,
      },
    });
  }

  setCardActionsSelectable() {
    const playerId = this.game.getPlayerId();
    dojo.query(`.pp_card_in_court_${playerId}`).forEach((node: HTMLElement) => {
      const cardId = node.id;
      const used = this.activePlayer.court?.find((card) => card.id === cardId)?.used === 1;
      if (
        !used &&
        (this.activePlayer.remainingActions > 0 || (this.game.gamedatas.cards[cardId] as CourtCard).suit === this.activePlayer.favoredSuit)
      )
        dojo.map(node.children, (child: HTMLElement) => {
          if (dojo.hasClass(child, 'pp_card_action')) {
            console.log('splitId', child.id.split('_')[0]);
            console.log('cardId', cardId);
            const nextStep = `cardAction${capitalizeFirstLetter(child.id.split('_')[0])}`;
            dojo.addClass(child, 'pp_selectable');
            this._connections.push(
              dojo.connect(child, 'onclick', this, () => this.updateInterface({ nextStep, args: { cardAction: { cardId } } }))
            );
          }
        });
    });
  }

  setRegionsSelectable() {
    const container = document.getElementById(`pp_map_areas`);
    container.classList.add('pp_selectable');
    REGIONS.forEach((region) => {
      console.log('region', region);
      const element = document.getElementById(`pp_region_${region}`);
      // console.log(node);
      element.classList.add('pp_selectable');
      this._connections.push(dojo.connect(element, 'onclick', this, () => console.log('Region', region)));
    });
  }

  setGiftsSelectable({ cardId }: { cardId: string }) {
    const playerId = this.game.getPlayerId();
    ['2', '4', '6'].forEach((giftValue) => {
      const hasGift =
        this.game.playerManager
          .getPlayer({ playerId })
          .getGiftZone({
            value: giftValue,
          })
          .getAllItems().length > 0;
      if (!hasGift && giftValue <= this.activePlayer.rupees) {
        dojo.query(`#pp_gift_${giftValue}_${playerId}`).forEach((node: HTMLElement) => {
          dojo.addClass(node, 'pp_selectable');
          this._connections.push(
            dojo.connect(node, 'onclick', this, () =>
              this.updateInterface({
                nextStep: CONFIRM_SELECT_GIFT,
                args: {
                  confirmSelectGift: {
                    value: giftValue,
                    cardId,
                  },
                },
              })
            )
          );
        });
      }
    });
  }

  setMarketCardsSelectable() {
    dojo.query('.pp_market_card').forEach((node: HTMLElement) => {
      const cost = node.parentElement.id.split('_')[3]; // cost is equal to the column number
      const cardId = node.id;
      if (cost <= this.activePlayer.rupees && !this.activePlayer.unavailableCards.includes(cardId)) {
        dojo.addClass(node, 'pp_selectable');
        this._connections.push(
          dojo.connect(node, 'onclick', this, () =>
            this.updateInterface({ nextStep: CONFIRM_PURCHASE, args: { confirmPurchase: { cardId, cost } } })
          )
        );
      }
    }, this);
  }

  setHandCardsSelectable({ callback }: { callback: (props: { cardId: string }) => void }) {
    dojo.query('.pp_card_in_hand').forEach((node: HTMLElement, index: number) => {
      const cardId = node.id;
      dojo.addClass(node, 'pp_selectable');
      this._connections.push(dojo.connect(node, 'onclick', this, () => callback({ cardId })));
    }, this);
  }

  setCourtCardsSelectableForDiscard() {
    const playerId = this.game.getPlayerId();
    dojo.query(`.pp_card_in_court_${playerId}`).forEach((node: HTMLElement, index: number) => {
      const cardId = 'card_' + node.id.split('_')[6];
      console.log('court card cardId', cardId);
      dojo.addClass(node, 'pp_selectable');
      this._connections.push(dojo.connect(node, 'onclick', this, () => this.handleDiscardSelect({ cardId })));
    }, this);
  }

  setPlaceSpyCardsSelectable({ region }: { region: string }) {
    dojo.query(`.pp_card_in_court_${region}`).forEach((node: HTMLElement, index: number) => {
      const cardId = node.id;
      console.log('set selectable', cardId);
      dojo.addClass(node, 'pp_selectable');
      this._connections.push(
        dojo.connect(node, 'onclick', this, () =>
          this.updateInterface({ nextStep: CONFIRM_PLACE_SPY, args: { confirmPlaceSpy: { cardId } } })
        )
      );
    }, this);
  }

  updatePageTitle({ text, args }: { text: string; args: Record<string, string | number> }) {
    this.game.gamedatas.gamestate.descriptionmyturn = dojo.string.substitute(_(text), args);
    this.game.framework().updatePageTitle();
  }

  //  .########.##....##.########.########.########..####.##....##..######..
  //  .##.......###...##....##....##.......##.....##..##..###...##.##....##.
  //  .##.......####..##....##....##.......##.....##..##..####..##.##.......
  //  .######...##.##.##....##....######...########...##..##.##.##.##...####
  //  .##.......##..####....##....##.......##...##....##..##..####.##....##.
  //  .##.......##...###....##....##.......##....##...##..##...###.##....##.
  //  .########.##....##....##....########.##.....##.####.##....##..######..

  //  ..######..########....###....########.########
  //  .##....##....##......##.##......##....##......
  //  .##..........##.....##...##.....##....##......
  //  ..######.....##....##.....##....##....######..
  //  .......##....##....#########....##....##......
  //  .##....##....##....##.....##....##....##......
  //  ..######.....##....##.....##....##....########

  onEnteringState(stateName: string, args: any) {
    // UI changes for active player
    if ((this.game as unknown as Framework).isCurrentPlayerActive()) {
      switch (stateName) {
        case 'setup':
          this.updateInterface({ nextStep: CHOOSE_LOYALTY });
          break;
        case 'cardActionGift':
          this.activePlayer.rupees = args.args.rupees;
          this.updateInterface({ nextStep: CARD_ACTION_GIFT });
          break;
        case 'discardCourt':
          this.numberOfDiscards = (args.args as EnteringDiscardCourtArgs).numberOfDiscards;
          console.log('numberOfDiscards', this.numberOfDiscards);
          this.updateInterface({ nextStep: DISCARD_COURT, args: { discardCourt: args.args as EnteringDiscardCourtArgs } });
          break;
        case 'discardHand':
          this.numberOfDiscards = (args.args as EnteringDiscardHandArgs).numberOfDiscards;
          console.log('numberOfDiscards', this.numberOfDiscards);
          this.updateInterface({ nextStep: DISCARD_HAND, args: { discardHand: args.args as EnteringDiscardHandArgs } });
          break;
        case 'playerActions':
          const { court, favoredSuit, hand, remainingActions, rupees, unavailableCards } = args.args;
          this.activePlayer = {
            court,
            favoredSuit,
            hand,
            remainingActions: Number(remainingActions),
            rupees: rupees,
            unavailableCards: unavailableCards,
          };
          this.updateInterface({ nextStep: PLAYER_ACTIONS });
          break;
        case 'placeRoad':
          this.updateInterface({ nextStep: PLACE_ROAD, args: { placeRoad: { borders: args.args.region.borders } } });
          break;
        case 'placeSpy':
          this.updateInterface({nextStep: PLACE_SPY, args: {placeSpy: {region: args.args.region}}})
          break;
        default:
          break;
      }
    }

    // UI changes for all players
    switch (stateName) {
      case 'dummmy':
        break;
      default:
        console.log('onEnteringState default');
        break;
    }
  }

  //  .##.......########....###....##.....##.####.##....##..######..
  //  .##.......##.........##.##...##.....##..##..###...##.##....##.
  //  .##.......##........##...##..##.....##..##..####..##.##.......
  //  .##.......######...##.....##.##.....##..##..##.##.##.##...####
  //  .##.......##.......#########..##...##...##..##..####.##....##.
  //  .##.......##.......##.....##...##.##....##..##...###.##....##.
  //  .########.########.##.....##....###....####.##....##..######..

  //  ..######..########....###....########.########
  //  .##....##....##......##.##......##....##......
  //  .##..........##.....##...##.....##....##......
  //  ..######.....##....##.....##....##....######..
  //  .......##....##....#########....##....##......
  //  .##....##....##....##.....##....##....##......
  //  ..######.....##....##.....##....##....########

  onLeavingState(stateName) {
    console.log(`onLeavingState ${stateName}`);
    this.clearPossible();
    switch (stateName) {
      /* Example:
      
      case 'myGameState':
      
          // Hide the HTML block we are displaying only during this game state
          dojo.style( 'my_html_block_id', 'display', 'none' );
          
          break;
     */

      case 'dummmy':
        break;
    }
  }

  // .##.....##.########..########.....###....########.########
  // .##.....##.##.....##.##.....##...##.##......##....##......
  // .##.....##.##.....##.##.....##..##...##.....##....##......
  // .##.....##.########..##.....##.##.....##....##....######..
  // .##.....##.##........##.....##.#########....##....##......
  // .##.....##.##........##.....##.##.....##....##....##......
  // ..#######..##........########..##.....##....##....########

  //  .########..##.....##.########.########..#######..##....##..######.
  //  .##.....##.##.....##....##.......##....##.....##.###...##.##....##
  //  .##.....##.##.....##....##.......##....##.....##.####..##.##......
  //  .########..##.....##....##.......##....##.....##.##.##.##..######.
  //  .##.....##.##.....##....##.......##....##.....##.##..####.......##
  //  .##.....##.##.....##....##.......##....##.....##.##...###.##....##
  //  .########...#######.....##.......##.....#######..##....##..######.

  onUpdateActionButtons(stateName: string, args: unknown) {}

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
    if (Number(this.activePlayer.remainingActions) > 0) {
      this.updateInterface({ nextStep: 'pass' });
      return;
    }
    this.game.takeAction({ action: 'pass' });
  }

  onCancel() {
    this.resetActionArgs();
    this.game.framework().restoreServerGameState();
  }
}
