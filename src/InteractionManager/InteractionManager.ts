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

class InteractionManager {
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
  private selectedGift: string;
  private selectedCard: string;

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

  updateInterface({ nextStep }: { nextStep: string }) {
    console.log(`updateInterface ${nextStep}`);
    this.clearPossible();

    switch (nextStep) {
      case 'chooseLoyalty':
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
      case 'playerActions':
        this.updateMainTitleTextActions();
        if (this.activePlayerHasActions()) {
          this.addPrimaryActionButton({
            id: 'purchase_btn',
            text: _('Purchase'),
            callback: () => this.updateInterface({ nextStep: 'selectCardToPurchase' }),
          });
          if (this.activePlayerHasHandCards()) {
            this.addPrimaryActionButton({
              id: 'play_btn',
              text: _('Play'),
              callback: () => this.updateInterface({ nextStep: 'selectCardToPlay' }),
            });
          }
          if (this.activePlayerHasCourtCards()) {
            this.addPrimaryActionButton({
              id: 'card_action_btn',
              text: _('Card Action'),
              callback: () => this.updateInterface({ nextStep: 'selectCardAction' }),
            });
          }
          this.addSecondaryActionButton({ id: 'pass_btn', text: _('End Turn'), callback: () => this.onPass() });
          this.setMarketCardsSelectable();
          this.setHandCardsSelectable({ action: 'play' });
          this.setCardActionsSelectable();
        } else {
          if (this.activePlayerHasFreeActions()) {
            this.addPrimaryActionButton({
              id: 'card_action_btn',
              text: _('Card Action'),
              callback: () => this.updateInterface({ nextStep: 'selectCardAction' }),
            });
            this.setCardActionsSelectable();
          }
          this.addPrimaryActionButton({ id: 'pass_btn', text: _('End Turn'), callback: () => this.onPass() });
        }
        break;
      case 'client_confirmPlaceSpy':
        this.addPrimaryActionButton({ id: 'confirm_btn', text: _('Confirm'), callback: () => this.onConfirm({ action: 'placeSpy' }) });
        this.addDangerActionButton({ id: 'cancel_btn', text: _('Cancel'), callback: () => this.onCancel() });
        break;
      case 'client_confirmPlay':
        this.addPrimaryActionButton({
          id: 'left_side_btn',
          text: _('<< LEFT'),
          callback: () => this.game.takeAction({ action: 'playCard', data: { cardId: this.selectedCard, leftSide: true } }),
        });
        this.addPrimaryActionButton({
          id: 'right_side_btn',
          text: _('RIGHT >>'),
          callback: () => this.game.takeAction({ action: 'playCard', data: { cardId: this.selectedCard, leftSide: false } }),
        });
        this.addDangerActionButton({ id: 'cancel_btn', text: _('Cancel'), callback: () => this.onCancel() });
        break;
      case 'client_confirmPurchase':
        this.addPrimaryActionButton({
          id: 'confirm_btn',
          text: _('Confirm'),
          callback: () => this.onConfirm({ action: 'purchase' }),
        });
        this.addDangerActionButton({ id: 'cancel_btn', text: _('Cancel'), callback: () => this.onCancel() });
        break;
      case 'client_confirmSelectGift':
        this.addDangerActionButton({
          id: 'confirm_btn',
          text: _('Confirm'),
          callback: () => this.onConfirm({ action: 'confirmSelectGift' }),
        });
        this.addSecondaryActionButton({ id: 'cancel_btn', text: _('Cancel'), callback: () => this.onCancel() });
        break;
      case 'client_endTurn':
        this.addDangerActionButton({
          id: 'confirm_btn',
          text: _('Confirm'),
          callback: () => this.onConfirm({ action: 'pass' }),
        });
        this.addSecondaryActionButton({ id: 'cancel_btn', text: _('Cancel'), callback: () => this.onCancel() });
        break;
      case 'selectCardAction':
        this.updateSelectableActions({ action: 'cardAction' });
        this.setPageTitle('selectcardaction');
        break;
      case 'selectCardToPlay':
        this.setHandCardsSelectable({ action: 'play' });
        this.setPageTitle('playcard');
        break;
      case 'selectCardToPurchase':
        this.setMarketCardsSelectable();
        this.setPageTitle('selectpurchase');
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

  activePlayerHasFreeActions(): boolean {
    return this.activePlayer.court.some(
      ({ key, used }) => used == '0' && (this.game.gamedatas.cards[key] as CourtCard).suit == this.activePlayer.favoredSuit
    );
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

  updateMainTitleTextActions() {
    const main = $('pagemaintitletext');

    main.innerHTML +=
      _(' may take ') +
      '<span id="remaining_actions_value" style="font-weight:bold;color:#ED0023;">' +
      this.activePlayer.remainingActions +
      '</span>' +
      _(' action(s): ');
  }

  setCardActionsSelectable() {
    const playerId = this.game.getPlayerId();
    dojo.query(`.pp_card_in_court_${playerId}`).forEach((node) => {
      const splitNodeId = node.id.split('_');
      const cardId = `${splitNodeId[5]}_${splitNodeId[6]}`;
      const used = this.activePlayer.court?.find((card) => card.key === cardId)?.used === '1';
      if (
        !used &&
        (this.activePlayer.remainingActions > 0 || (this.game.gamedatas.cards[cardId] as CourtCard).suit === this.activePlayer.favoredSuit)
      )
        dojo.map(node.children, (child) => {
          if (dojo.hasClass(child, 'pp_card_action')) {
            dojo.addClass(child, 'pp_selectable');
            this._connections.push(dojo.connect(child, 'onclick', this, 'onCardActionClick'));
          }
        });
    });
  }

  updateSelectableActions({ action }: { action: string }) {
    console.log('updateSelectableActions', action);
    this.resetActionArgs();
    const playerId = this.game.getPlayerId();
    switch (action) {
      case 'cardActionBattle':
        console.log('battle');
        console.log('dojo', dojo);
        const container = document.getElementById(`pp_map_areas`);
        container.classList.add('pp_selectable');
        REGIONS.forEach((region) => {
          console.log('region', region);
          const element = document.getElementById(`pp_region_${region}`);
          // console.log(node);
          element.classList.add('pp_selectable');
          this._connections.push(dojo.connect(element, 'onclick', this, 'onSelectRegion'));
          // dojo.query(`#pp_region_${region}`).forEach((node) => {
          // dojo.query(`.pp_region`).forEach((node) => {
          // dojo.query('#pp_map_areas').forEach((node) => {
          //     dojo.addClass(node, 'pp_selectable');
          //     this.handles.push(dojo.connect(node,'onclick', this, 'onSelectRegion'));
          // })
        });
        break;
      case 'cardAction':
        // Note Frans: perhaps there is a better way to get the court cards for the player
        // based on backend data
        dojo.query(`.pp_card_in_court_${playerId}`).forEach((node) => {
          const splitNodeId = node.id.split('_');
          const cardId = `${splitNodeId[5]}_${splitNodeId[6]}`;
          const used = this.activePlayer.court?.find((card) => card.key === cardId)?.used === '1';
          if (
            !used &&
            (this.activePlayer.remainingActions > 0 ||
              (this.game.gamedatas.cards[cardId] as CourtCard).suit === this.activePlayer.favoredSuit)
          )
            dojo.map(node.children, (child) => {
              if (dojo.hasClass(child, 'pp_card_action')) {
                dojo.addClass(child, 'pp_selectable');
                this._connections.push(dojo.connect(child, 'onclick', this, 'onCardActionClick'));
              }
            });
        });
        break;
      case 'cardActionGift':
        ['2', '4', '6'].forEach((giftValue) => {
          const hasGift =
            this.game.playerManager
              .getPlayer({ playerId })
              .getGiftZone({
                value: giftValue,
              })
              .getAllItems().length > 0;
          if (!hasGift && giftValue <= this.activePlayer.rupees) {
            dojo.query(`#pp_gift_${giftValue}_${playerId}`).forEach((node) => {
              dojo.addClass(node, 'pp_selectable');
              this._connections.push(dojo.connect(node, 'onclick', this, 'onSelectGift'));
            });
          }
        });
        break;
      default:
        break;
    }
  }

  setMarketCardsSelectable() {
    dojo.query('.pp_market_card').forEach((node) => {
      const cost = node.id.split('_')[3]; // cost is equal to the column number
      const cardId = node.id.split('_')[6];
      console.log('cardId', cardId, 'node', node);
      if (cost <= this.activePlayer.rupees && !this.activePlayer.unavailableCards.includes('card_' + cardId)) {
        dojo.addClass(node, 'pp_selectable');
        this._connections.push(dojo.connect(node, 'onclick', this, (evt) => this.onCard({ action: 'purchase', evt })));
      }
    }, this);
  }

  setHandCardsSelectable({ action }: { action: string }) {
    dojo.query('.pp_card_in_hand').forEach(function (node, index) {
      dojo.addClass(node, 'pp_selectable');
      this._connections.push(dojo.connect(node, 'onclick', this, (evt) => this.onCard({ action, evt })));
    }, this);
  }

  setCourtCardsSelectable({ playerId, action }: { playerId: string; action: string }) {
    // dojo.query(`.pp_card_in_court_${this.game.getPlayerId()}`).forEach(function (node, index) {
    dojo.query(`.pp_card_in_court_${playerId}`).forEach(function (node, index) {
      dojo.addClass(node, 'pp_selectable');
      this._connections.push(dojo.connect(node, 'onclick', this, (evt) => this.onCard({ action, evt })));
    }, this);
  }

  setPlaceSpyCardsSelectable({ region }: { region: string }) {
    // dojo.query(`.pp_card_in_court_${args?.region ? args.region : ''}`).forEach(function (node, index) {
    dojo.query(`.pp_card_in_court_${region}`).forEach(function (node, index) {
      dojo.addClass(node, 'pp_selectable');
      this._connections.push(dojo.connect(node, 'onclick', this, (evt) => this.onCard({ action: 'placeSpy', evt })));
    }, this);
  }

  setPageTitle(suffix: string | null = null) {
    if (suffix == null) {
      suffix = 'generic';
    }

    if (!this.game.gamedatas.gamestate['descriptionmyturn' + suffix]) return;

    this.game.gamedatas.gamestate.descriptionmyturn = this.game.gamedatas.gamestate['descriptionmyturn' + suffix];
    if (this.game.gamedatas.gamestate['description' + suffix])
      this.game.gamedatas.gamestate.description = this.game.gamedatas.gamestate['description' + suffix];
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

  onEnteringState(stateName, args) {
    // UI changes for active player
    if ((this.game as unknown as Framework).isCurrentPlayerActive()) {
      switch (stateName) {
        case 'setup':
          this.updateInterface({ nextStep: 'chooseLoyalty' });
          break;
        case 'client_cardActionBattle':
          this.updateSelectableActions({ action: 'cardActionBattle' });
          break;
        case 'cardActionGift':
          this.activePlayer.rupees = args.args.rupees;
          console.log('activePlayer', this.activePlayer);
          this.updateSelectableActions({ action: 'cardActionGift' });
          break;
        case 'playerActions':
          const { court, favored_suit, hand, remaining_actions, rupees, unavailable_cards } = args.args;
          this.activePlayer = {
            court,
            favoredSuit: favored_suit,
            hand,
            remainingActions: Number(remaining_actions),
            rupees: rupees,
            unavailableCards: unavailable_cards,
          };
          this.updateInterface({ nextStep: 'playerActions' });
          // this.unavailableCards = args.args.unavailable_cards;
          // this.remainingActions = args.args.remaining_actions;
          break;
        case 'placeSpy':
          this.setPlaceSpyCardsSelectable({ region: args.args.region });
          // this.updateSelectableCards({ action: 'placeSpy', args: args.args });
          break;
        case 'client_cardActionBattle':
          this.updateInterface({ nextStep: 'client_cardActionBattle' });
          break;
        case 'client_confirmPlaceSpy':
          this.updateInterface({ nextStep: 'client_confirmPlaceSpy' });
          break;
        case 'client_confirmPlay':
          this.updateInterface({ nextStep: 'client_confirmPlay' });
          break;
        case 'client_confirmPurchase':
          this.updateInterface({ nextStep: 'client_confirmPurchase' });
          break;
        case 'client_confirmSelectGift':
          this.updateInterface({ nextStep: 'client_confirmSelectGift' });
          break;
        case 'client_endTurn':
          this.updateInterface({ nextStep: 'client_endTurn' });
          break;
        // case 'client_selectPlay':

        //   break;
        // case 'client_selectPurchase':
        //   this.updateInterface({ nextStep: 'client_selectPurchase' });
        //   break;

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

  onUpdateActionButtons(stateName, args) {
    if (!(this.game as unknown as Framework).isCurrentPlayerActive()) {
      return;
    }

    switch (stateName) {
      // case 'negotiateBribe':
      //     for ( var i = 0; i <= args.briber_max; i++ ) {
      //         this.game.addActionButton( i+'_btn', $i, 'onBribe', null, false, 'blue' );
      //     }
      //     break;

      case 'discardCourt':
        this.numberOfDiscards = Object.keys(args.court).length - args.suits.political - 3;
        if (this.numberOfDiscards > 1) var cardmsg = _(' court cards ');
        else cardmsg = _(' court card');
        $('pagemaintitletext').innerHTML +=
          '<span id="remaining_actions_value" style="font-weight:bold;color:#ED0023;">' + this.numberOfDiscards + '</span>' + cardmsg;
        this.setCourtCardsSelectable({ action: 'discard_court', playerId: this.game.getPlayerId() });
        this.game.framework().addActionButton('confirm_btn', _('Confirm'), 'onConfirm', null, false, 'blue');
        dojo.addClass('confirm_btn', 'pp_disabled');
        break;

      case 'discardHand':
        this.numberOfDiscards = Object.keys(args.hand).length - args.suits.intelligence - 2;
        if (this.numberOfDiscards > 1) var cardmsg = _(' hand cards ');
        else cardmsg = _(' hand card');
        $('pagemaintitletext').innerHTML +=
          '<span id="remaining_actions_value" style="font-weight:bold;color:#ED0023;">' + this.numberOfDiscards + '</span>' + cardmsg;
        this.setHandCardsSelectable({ action: 'discard_hand' });
        (this.game as unknown as Framework).addActionButton('confirm_btn', _('Confirm'), 'onConfirm', null, false, 'blue');
        dojo.addClass('confirm_btn', 'pp_disabled');
        break;

      case 'placeRoad':
        args.region.borders.forEach((border) => {
          (this.game as unknown as Framework).addActionButton(
            `${border}_btn`,
            _(this.game.gamedatas.borders[border].name),
            'onBorder',
            null,
            false,
            'blue'
          );
        });
        break;

      case 'cardActionGift':
        (this.game as unknown as Framework).addActionButton('cancel_btn', _('Cancel'), () => this.onCancel(), null, false, 'gray');
        break;
      // case 'client_selectPlay':
      //     this.addActionButton( 'cancel_btn', _('Cancel'), 'onCancel', null, false, 'red' );
      //     break;

      // case 'client_confirmDiscard':
      //     this.addActionButton( 'confirm_btn', _('Confirm'), 'onConfirm', null, false, 'blue' );
      //     this.addActionButton( 'cancel_btn', _('Cancel'), 'onCancel', null, false, 'red' );
      //     break;

      default:
        console.log('default');
        break;
    }
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

  onSelectGift(evt) {
    const divId = evt.currentTarget.id;
    dojo.stopEvent(evt);
    if (!(this.game as unknown as Framework).checkAction('selectGift')) return;

    if ((this.game as unknown as Framework).isCurrentPlayerActive()) {
      const value: string = divId.split('_')[2];
      this.resetActionArgs();
      this.selectedGift = value;
      dojo.query(`#pp_gift_${value}_${this.game.getPlayerId()}`).addClass('pp_selected');
      this.game.framework().setClientState('client_confirmSelectGift', {
        descriptionmyturn: _(`Purchase gift for ${value} rupees?`),
      });
    }
  }

  onSelectRegion(evt) {
    const divId = evt.currentTarget.id;
    dojo.stopEvent(evt);
    console.log('onSelectRegion', divId, evt);
  }

  onPass() {
    if (!(this.game as unknown as Framework).checkAction('pass')) return;
    if ((this.game as unknown as Framework).isCurrentPlayerActive()) {
      if (this.activePlayer.remainingActions == 0) {
        this.game.takeAction({ action: 'pass' });
      } else {
        (this.game as unknown as Framework).setClientState('client_endTurn', {
          descriptionmyturn: _('Confirm to your end turn '),
        });
      }
    }
  }

  onBorder(evt) {
    dojo.stopEvent(evt);
    if (!(this.game as unknown as Framework).checkAction('placeRoad')) return;
    const splitId = evt.target.id.split('_');
    const border = `${splitId[0]}_${splitId[1]}`;
    this.game.takeAction({ action: 'placeRoad', data: { border } });
  }

  onCard({ action, evt }: { action: string; evt: any }) {
    const cardDivId = evt.currentTarget.id;
    console.log('action', action, 'evt', evt);
    dojo.stopEvent(evt);

    const cardId = 'card_' + cardDivId.split('_')[6];
    this.selectedCard = cardId;
    let node;
    if ((this.game as unknown as Framework).isCurrentPlayerActive()) {
      switch (action) {
        case 'purchase':
          this.resetActionArgs();
          node = $(cardDivId);
          dojo.addClass(node, 'pp_selected');
          const cost = cardDivId.split('_')[3];
          (this.game as unknown as Framework).setClientState('client_confirmPurchase', {
            descriptionmyturn: 'Purchase this card for ' + cost + ' rupees?',
          });
          break;

        case 'play':
          this.resetActionArgs();
          node = $(cardDivId);
          dojo.addClass(node, 'pp_selected');
          (this.game as unknown as Framework).setClientState('client_confirmPlay', {
            descriptionmyturn: 'Select which side of court to play card:',
          });
          break;

        case 'discard_hand':
        case 'discard_court':
          node = $(cardDivId);
          dojo.toggleClass(node, 'pp_selected');
          dojo.toggleClass(node, 'pp_discard');
          if (dojo.query('.pp_selected').length == this.numberOfDiscards) {
            dojo.removeClass('confirm_btn', 'pp_disabled');
          } else {
            dojo.addClass('confirm_btn', 'pp_disabled');
          }
          break;
        case 'placeSpy':
          this.resetActionArgs();
          node = $(cardDivId);
          dojo.addClass(node, 'pp_selected');
          const cardName = this.game.gamedatas.cards[cardId].name;
          (this.game as unknown as Framework).setClientState('client_confirmPlaceSpy', {
            descriptionmyturn: `Place a spy on ${cardName}`,
          });
          break;
        default:
          break;
      }
    }
  }

  onCardActionClick(evt) {
    const divId = evt.currentTarget.id;
    dojo.stopEvent(evt);
    this.resetActionArgs();
    const splitId = divId.split('_');
    const cardAction: string = splitId[0];
    const cardId: string = `${splitId[1]}_${splitId[2]}`;
    switch (cardAction) {
      case 'gift':
        this.game.takeAction({ action: 'cardAction', data: { cardAction, cardId } });
        break;
      case 'battle':
        // this.updateSelectableActions();
        (this.game as unknown as Framework).setClientState('client_cardActionBattle', {
          descriptionmyturn: _('${you} must select a card or region'),
        });
        break;
      case 'default':
        console.log('default gift');
        break;
    }
  }

  onCancel() {
    this.resetActionArgs();
    this.game.framework().restoreServerGameState();
  }

  onConfirm({ action }: { action: string }) {
    switch (action) {
      case 'purchase':
        var cardId = this.selectedCard;
        this.game.takeAction({ action: 'purchaseCard', data: { cardId } });
        break;

      case 'pass':
        this.game.takeAction({ action: 'pass' });
        break;
      case 'confirmSelectGift':
        this.game.takeAction({ action: 'selectGift', data: { selectedGift: this.selectedGift } });
        break;
      case 'discard_hand':
      case 'discard_court':
        let cards = '';
        dojo.query('.pp_selected').forEach(function (item, index) {
          cards += ' card_' + item.id.split('_')[6];
        }, this);
        this.game.takeAction({
          action: 'discardCards',
          data: {
            cards,
            fromHand: action == 'discard_hand',
          },
        });
        break;
      case 'placeSpy':
        this.resetActionArgs();
        this.game.takeAction({ action: 'placeSpy', data: { cardId: this.selectedCard } });
        break;
      default:
        break;
    }
  }
}
