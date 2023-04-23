/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * PaxPamirEditionTwo implementation : © Frans Bongers <fjmbongers@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * paxpamireditiontwo.js
 *
 * PaxPamirEditionTwo user interface script
 *
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;
declare const playSound;

class PaxPamir implements PaxPamirGame {
  public gamedatas: PaxPamirGamedatas;
  public map: PPMap;
  public market: Market;
  private notificationManager: NotificationManager;
  public objectManager: ObjectManager;
  public playerManager: PlayerManager;
  // global variables
  private defaultWeightZone: number = 0;
  private playerEvents = {}; // events per player
  public activeEvents: Zone = new ebg.zone(); // active events
  public spies: Record<string, Zone> = {}; // spies per cards
  public playerCounts = {}; // rename to playerTotals?
  public tooltipManager: PPTooltipManager;
  private _notif_uid_to_log_id = {};
  private _last_notif = null;
  public _connections: unknown[];
  public localState: LocalState;

  activeStates: {
    [CLIENT_CARD_ACTION_BATTLE]: ClientCardActionBattleState;
    [CLIENT_CARD_ACTION_BETRAY]: ClientCardActionBetrayState;
    [CLIENT_CARD_ACTION_BUILD]: ClientCardActionBuildState;
    [CLIENT_CARD_ACTION_GIFT]: ClientCardActionGiftState;
    [CLIENT_CARD_ACTION_MOVE]: ClientCardActionMoveState;
    [CLIENT_CARD_ACTION_TAX]: ClientCardActionTaxState;
    [CLIENT_PLAY_CARD]: ClientPlayCardState;
    [CLIENT_PURCHASE_CARD]: ClientPurchaseCardState;
    discardCourt: DiscardCourtState;
    discardHand: DiscardHandState;
    negotiateBribe: NegotiateBribeState;
    placeRoad: PlaceRoadState;
    placeSpy: PlaceSpyState;
    playerActions: PlayerActionsState;
    setup: SetupState;
  };

  constructor() {
    console.log('paxpamireditiontwo constructor');
  }

  /*
    setup:
    
    This method must set up the game user interface according to current game situation specified
    in parameters.
    
    The method is called each time the game interface is displayed to a player, ie:
    _ when the game starts
    _ when a player refreshes the game page (F5)
    
    "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
  */
  public setup(gamedatas: PaxPamirGamedatas) {
    // Create a new div for buttons to avoid BGA auto clearing it
    dojo.place("<div id='customActions' style='display:inline-block'></div>", $('generalactions'), 'after');
    // const playAreaWidth = document.getElementById('pp_play_area').offsetWidth;
    // console.log('playAreaWidth',playAreaWidth);
    this.gamedatas = gamedatas;
    debug('gamedatas', gamedatas);

    this._connections = [];
    // Will store all data for active player and gets refreshed with entering player actions state
    this.localState = gamedatas.localState;
    this.activeStates = {
      [CLIENT_CARD_ACTION_BATTLE]: new ClientCardActionBattleState(this),
      [CLIENT_CARD_ACTION_BETRAY]: new ClientCardActionBetrayState(this),
      [CLIENT_CARD_ACTION_BUILD]: new ClientCardActionBuildState(this),
      [CLIENT_CARD_ACTION_GIFT]: new ClientCardActionGiftState(this),
      [CLIENT_CARD_ACTION_MOVE]: new ClientCardActionMoveState(this),
      [CLIENT_CARD_ACTION_TAX]: new ClientCardActionTaxState(this),
      [CLIENT_PLAY_CARD]: new ClientPlayCardState(this),
      [CLIENT_PURCHASE_CARD]: new ClientPurchaseCardState(this),
      discardCourt: new DiscardCourtState(this),
      discardHand: new DiscardHandState(this),
      negotiateBribe: new NegotiateBribeState(this),
      placeRoad: new PlaceRoadState(this),
      placeSpy: new PlaceSpyState(this),
      playerActions: new PlayerActionsState(this),
      setup: new SetupState(this),
    };

    // Events
    this.activeEvents.create(this, 'pp_active_events', CARD_WIDTH, CARD_HEIGHT);
    this.activeEvents.instantaneous = true;
    this.activeEvents.item_margin = 16;
    // Add current event cards
    gamedatas.activeEvents.forEach((card) => {
      dojo.place(tplCard({ cardId: card.id }), 'pp_active_events');
      this.activeEvents.placeInZone(card.id);
    });
    this.activeEvents.instantaneous = false;

    this.tooltipManager = new PPTooltipManager(this);
    this.objectManager = new ObjectManager(this);
    this.playerManager = new PlayerManager(this);
    this.map = new PPMap(this);
    this.market = new Market(this);

    if (this.notificationManager != undefined) {
      this.notificationManager.destroy();
    }
    this.notificationManager = new NotificationManager(this);
    // // Setup game notifications to handle (see "setupNotifications" method below)
    this.notificationManager.setupNotifications();

    dojo.connect(this.framework().notifqueue, 'addToLog', () => {
      this.checkLogCancel(this._last_notif == null ? null : this._last_notif.msg.uid);
      this.addLogClass();
    });
    // this.setupNotifications();
    debug('Ending game setup');
  }

  //  .####.##....##.########.########.########.....###.....######..########.####..#######..##....##
  //  ..##..###...##....##....##.......##.....##...##.##...##....##....##.....##..##.....##.###...##
  //  ..##..####..##....##....##.......##.....##..##...##..##..........##.....##..##.....##.####..##
  //  ..##..##.##.##....##....######...########..##.....##.##..........##.....##..##.....##.##.##.##
  //  ..##..##..####....##....##.......##...##...#########.##..........##.....##..##.....##.##..####
  //  ..##..##...###....##....##.......##....##..##.....##.##....##....##.....##..##.....##.##...###
  //  .####.##....##....##....########.##.....##.##.....##..######.....##....####..#######..##....##

  ///////////////////////////////////////////////////
  //// Game & client states

  // onEnteringState: this method is called each time we are entering into a new game state.
  //                  You can use this method to perform some user interface changes at this moment.
  public onEnteringState(stateName: string, args: any) {
    console.log('Entering state: ' + stateName, args);
    // UI changes for active player
    if (this.framework().isCurrentPlayerActive() && this.activeStates[stateName]) {
      console.log('inside if');
      this.activeStates[stateName].onEnteringState(args.args);
    }
  }

  // onLeavingState: this method is called each time we are leaving a game state.
  //                 You can use this method to perform some user interface changes at this moment.
  //
  public onLeavingState(stateName: string) {
    console.log('Leaving state: ' + stateName);
    this.clearPossible();
  }

  // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
  //                        action status bar (ie: the HTML links in the status bar).
  //
  public onUpdateActionButtons(stateName: string, args: any) {
    // console.log('onUpdateActionButtons: ' + stateName);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  ///////////////////////////////////////////////////
  //// Utility methods - add in alphabetical order

  /*
   * Add a blue/grey button if it doesn't already exists
   */
  addActionButtonClient({
    id,
    text,
    callback,
    extraClasses,
    color = 'none',
  }: {
    id: string;
    text: string;
    callback: Function | string;
    extraClasses?: string;
    color?: 'blue' | 'gray' | 'red' | 'none';
  }) {
    if ($(id)) {
      return;
    }
    this.framework().addActionButton(id, text, callback, 'customActions', false, color);
    if (extraClasses) {
      dojo.addClass(id, extraClasses);
    }
  }

  addCancelButton() {
    this.addDangerActionButton({
      id: 'cancel_btn',
      text: _('Cancel'),
      callback: () => this.onCancel(),
    });
  }

  addPrimaryActionButton({
    id,
    text,
    callback,
    extraClasses,
  }: {
    id: string;
    text: string;
    callback: Function | string;
    extraClasses?: string;
  }) {
    if ($(id)) {
      return;
    }
    this.framework().addActionButton(id, text, callback, 'customActions', false, 'blue');
    if (extraClasses) {
      dojo.addClass(id, extraClasses);
    }
  }

  addSecondaryActionButton({
    id,
    text,
    callback,
    extraClasses,
  }: {
    id: string;
    text: string;
    callback: Function | string;
    extraClasses?: string;
  }) {
    if ($(id)) {
      return;
    }
    this.framework().addActionButton(id, text, callback, 'customActions', false, 'gray');
    if (extraClasses) {
      dojo.addClass(id, extraClasses);
    }
  }

  addDangerActionButton({
    id,
    text,
    callback,
    extraClasses,
  }: {
    id: string;
    text: string;
    callback: Function | string;
    extraClasses?: string;
  }) {
    if ($(id)) {
      return;
    }
    this.framework().addActionButton(id, text, callback, 'customActions', false, 'red');
    if (extraClasses) {
      dojo.addClass(id, extraClasses);
    }
  }

  public clearInterface() {
    console.log('clear interface');
    Object.keys(this.spies).forEach((key) => {
      dojo.empty(this.spies[key].container_div);
      this.spies[key] = undefined;
    });

    this.market.clearInterface();
    this.playerManager.clearInterface();
    this.map.clearInterface();
    this.objectManager.clearInterface();
  }

  clearPossible() {
    this.framework().removeActionButtons();
    dojo.empty('customActions');

    dojo.forEach(this._connections, dojo.disconnect);
    this._connections = [];

    dojo.query('.pp_selectable').removeClass('pp_selectable');
    dojo.query('.pp_selected').removeClass('pp_selected');

    REGIONS.forEach((region) => {
      const element = document.getElementById(`pp_region_${region}`);
      if (element) {
        element.classList.remove('pp_selectable');
      }
    });
    const mapArea = document.getElementById('pp_map_areas');
    if (mapArea) {
      mapArea.classList.remove('pp_selectable');
    }
  }

  public getCardInfo({ cardId }: { cardId: string }): Card {
    return this.gamedatas.staticData.cards[cardId];
  }

  public getPlayerId(): number {
    return Number(this.framework().player_id);
  }

  /**
   * Typescript wrapper for framework functions
   */
  public framework(): Framework {
    return this as unknown as Framework;
  }

  onCancel() {
    this.clearPossible();
    this.framework().restoreServerGameState();
  }

  updateLocalState(updates: Partial<LocalState>) {
    this.localState = { ...this.localState, ...updates };
  }

  setHandCardsSelectable({ callback }: { callback: (props: { cardId: string }) => void }) {
    dojo.query('.pp_card_in_hand').forEach((node: HTMLElement, index: number) => {
      const cardId = node.id;
      dojo.addClass(node, 'pp_selectable');
      this._connections.push(dojo.connect(node, 'onclick', this, () => callback({ cardId })));
    });
  }

  clientUpdatePageTitle({ text, args }: { text: string; args: Record<string, string | number> }) {
    this.gamedatas.gamestate.descriptionmyturn = dojo.string.substitute(_(text), args);
    this.framework().updatePageTitle();
  }

  // .########.########.....###....##.....##.########.##......##..#######..########..##....##
  // .##.......##.....##...##.##...###...###.##.......##..##..##.##.....##.##.....##.##...##.
  // .##.......##.....##..##...##..####.####.##.......##..##..##.##.....##.##.....##.##..##..
  // .######...########..##.....##.##.###.##.######...##..##..##.##.....##.########..#####...
  // .##.......##...##...#########.##.....##.##.......##..##..##.##.....##.##...##...##..##..
  // .##.......##....##..##.....##.##.....##.##.......##..##..##.##.....##.##....##..##...##.
  // .##.......##.....##.##.....##.##.....##.########..###..###...#######..##.....##.##....##

  // ..#######..##.....##.########.########..########..####.########..########..######.
  // .##.....##.##.....##.##.......##.....##.##.....##..##..##.....##.##.......##....##
  // .##.....##.##.....##.##.......##.....##.##.....##..##..##.....##.##.......##......
  // .##.....##.##.....##.######...########..########...##..##.....##.######....######.
  // .##.....##..##...##..##.......##...##...##...##....##..##.....##.##.............##
  // .##.....##...##.##...##.......##....##..##....##...##..##.....##.##.......##....##
  // ..#######.....###....########.##.....##.##.....##.####.########..########..######.

  /* @Override */
  format_string_recursive(log, args) {
    try {
      if (log && args && !args.processed) {
        args.processed = true;

        // replace all keys that start with 'logToken'
        Object.entries(args).forEach(([key, value]) => {
          if(key.startsWith('logToken')) {
            args[key] = getLogTokenDiv({logToken: value as string, game: this});
          }
        })

        // TODO: check below code. Looks like improved way for text shadows (source ticket to ride) 
        // ['you', 'actplayer', 'player_name'].forEach((field) => {
        //   if (typeof args[field] === 'string' && args[field].indexOf('#ffed00;') !== -1 && args[field].indexOf('text-shadow') === -1) {
        //     args[field] = args[field].replace('#ffed00;', '#ffed00; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black;');
        //   }
        // });
      }
    } catch (e) {
      console.error(log, args, 'Exception thrown', e.stack);
    }
    return (this as any).inherited(arguments);
  }

  /*
   * [Undocumented] Called by BGA framework on any notification message
   * Handle cancelling log messages for restart turn
   */
  onPlaceLogOnChannel(msg: Notif<unknown>) {
    // console.log('msg', msg);
    const currentLogId = this.framework().notifqueue.next_log_id;
    const res = this.framework().inherited(arguments);
    this._notif_uid_to_log_id[msg.uid] = currentLogId;
    this._last_notif = {
      logId: currentLogId,
      msg,
    };
    // console.log('_notif_uid_to_log_id', this._notif_uid_to_log_id);
    return res;
  }

  /*
   * cancelLogs:
   *   strikes all log messages related to the given array of notif ids
   */
  checkLogCancel(notifId) {
    if (this.gamedatas.canceledNotifIds != null && this.gamedatas.canceledNotifIds.includes(notifId)) {
      this.cancelLogs([notifId]);
    }
  }

  public cancelLogs(notifIds: string[]) {
    console.log('notifIds', notifIds);
    notifIds.forEach((uid) => {
      if (this._notif_uid_to_log_id.hasOwnProperty(uid)) {
        let logId = this._notif_uid_to_log_id[uid];
        if ($('log_' + logId)) dojo.addClass('log_' + logId, 'cancel');
      }
    });
  }

  addLogClass() {
    if (this._last_notif == null) return;

    let notif = this._last_notif;
    if ($('log_' + notif.logId)) {
      let type = notif.msg.type;
      if (type == 'history_history') type = notif.msg.args.originalType;

      dojo.addClass('log_' + notif.logId, 'notif_' + type);
    }
  }

  /*
   * [Undocumented] Override BGA framework functions to call onLoadingComplete when loading is done
   */
  setLoader(value, max) {
    this.framework().inherited(arguments);
    if (!this.framework().isLoadingComplete && value >= 100) {
      this.framework().isLoadingComplete = true;
      this.onLoadingComplete();
    }
  }

  onLoadingComplete() {
    // debug('Loading complete');
    this.cancelLogs(this.gamedatas.canceledNotifIds);
  }

  // .########..#######......######..##.....##.########..######..##....##
  // ....##....##.....##....##....##.##.....##.##.......##....##.##...##.
  // ....##....##.....##....##.......##.....##.##.......##.......##..##..
  // ....##....##.....##....##.......#########.######...##.......#####...
  // ....##....##.....##....##.......##.....##.##.......##.......##..##..
  // ....##....##.....##....##....##.##.....##.##.......##....##.##...##.
  // ....##.....#######......######..##.....##.########..######..##....##

  // public returnSpiesFromCard({ cardId }: { cardId: string }) {
  //   if (this.spies?.[cardId]) {
  //     // ['cylinder_2371052_3']
  //     const items = this.spies[cardId].getAllItems();
  //     items.forEach((cylinderId) => {
  //       const playerId = Number(cylinderId.split('_')[1]);
  //       this.move({
  //         id: cylinderId,
  //         to: this.playerManager.getPlayer({ playerId }).getCylinderZone(),
  //         from: this.spies[cardId],
  //       });
  //     });
  //   }
  // }

  // public discardCard({ id, from, order = null }: { id: string; from: Zone; order?: number }) {
  //   // Move all spies back to cylinder pools
  //   this.returnSpiesFromCard({ cardId: id });

  //   from.removeFromZone(id, false);
  //   attachToNewParentNoDestroy(id, 'pp_discard_pile');
  //   this.framework().slideToObject(id, 'pp_discard_pile').play();
  // }

  // returns zone object for given backend location in token database
  getZoneForLocation({ location }: { location: string }): Zone {
    const splitLocation = location.split('_');
    switch (splitLocation[0]) {
      case 'armies':
        // armies_kabul
        return this.map.getRegion({ region: splitLocation[1] }).getArmyZone();
      case 'blocks':
        // blocks_russian
        return this.objectManager.supply.getCoalitionBlocksZone({
          coalition: splitLocation[1],
        });
      case 'cylinders':
        // cylinders_playerId
        return this.playerManager.getPlayer({ playerId: Number(splitLocation[1]) }).getCylinderZone();
      case 'gift':
        // gift_2_playerId
        return this.playerManager.getPlayer({ playerId: Number(splitLocation[2]) }).getGiftZone({ value: Number(splitLocation[1]) });
      case 'favored':
        // favored_suit_economic
        return this.objectManager.favoredSuit.getFavoredSuitZone({
          suit: splitLocation[2],
        });
      case 'roads':
        // roads_herat_kabul
        const border = `${splitLocation[1]}_${splitLocation[2]}`;
        return this.map.getBorder({ border }).getRoadZone();
      case 'spies':
        // spies_card_38
        const cardId = `${splitLocation[1]}_${splitLocation[2]}`;
        return this.spies[cardId];
      case 'tribes':
        // tribes_kabul
        return this.map.getRegion({ region: splitLocation[1] }).getTribeZone();
      default:
        console.log('no zone determined');
        break;
    }
  }

  public move({
    id,
    to,
    from,
    weight = this.defaultWeightZone,
    addClass = [],
    removeClass = [],
  }: {
    id: string;
    to: Zone;
    from: Zone;
    weight?: number;
    addClass?: string[];
    removeClass?: string[];
  }) {
    addClass.forEach((newClass) => {
      dojo.addClass(id, newClass);
    });

    removeClass.forEach((oldClass) => {
      dojo.removeClass(id, oldClass);
    });

    dojo.addClass(id, 'pp_moving');
    to.placeInZone(id, weight);
    from.removeFromZone(id, false);

    // TODO: check if there is a better way than using setTimeout
    setTimeout(() => {
      dojo.removeClass(id, 'pp_moving');
    }, 2000);
  }

  createSpyZone({ cardId }: { cardId: string }) {
    const spyZoneId = 'spies_' + cardId;
    dojo.place(`<div id="${spyZoneId}" class="pp_spy_zone"></div>`, cardId);
    this.setupCardSpyZone({ nodeId: spyZoneId, cardId });
  }

  // // Function that gets called every time a card is added to a stock component
  // setupNewCard(cardDiv, cardId, divId) {
  //   dojo.addClass(cardDiv, `pp_${cardId}`);
  //   // if card is played to a court
  //   if (divId.startsWith('pp_court_player')) {
  //     const { actions, region } = this.gamedatas.cards[cardId] as CourtCard;
  //     // add region class for selectable functions
  //     // const region = this.gamedatas.cards[cardId].region;
  //     dojo.addClass(cardDiv, `pp_card_in_court_${region}`);

  //     const spyZoneId = 'spies_' + cardId;
  //     dojo.place(`<div id="${spyZoneId}" class="pp_spy_zone"></div>`, divId);
  //     this.setupCardSpyZone({ nodeId: spyZoneId, cardId });
  //     // TODO (add spy zone here)
  //     // TODO (add card actions)
  //     Object.keys(actions).forEach((action, index) => {
  //       const actionId = action + '_' + cardId;
  //       dojo.place(
  //         `<div id="${actionId}" class="pp_card_action pp_card_action_${action}" style="left: ${actions[action].left}px; top: ${actions[action].top}px"></div>`,
  //         divId
  //       );
  //     });
  //   }
  // }

  // Every time a card is moved or placed in court this function will be called to set up zone.
  setupCardSpyZone({ nodeId, cardId }) {
    // Note (Frans): we probably need to remove spies before moving / placing card
    if (!this.spies[cardId]) {
      // ** setup for zone
      this.spies[cardId] = new ebg.zone();
      this.spies[cardId].create(this, nodeId, CYLINDER_WIDTH, CYLINDER_HEIGHT);
      this.spies[cardId].item_margin = 4;
    }
  }

  // Updates weight of item in the stock component for ordering purposes
  updateCard({ location, id, order }) {
    location.changeItemsWeight({ [id]: order });
  }

  // public setupNotifications() {}

  //....###..........##....###....##.....##
  //...##.##.........##...##.##....##...##.
  //..##...##........##..##...##....##.##..
  //.##.....##.......##.##.....##....###...
  //.#########.##....##.#########...##.##..
  //.##.....##.##....##.##.....##..##...##.
  //.##.....##..######..##.....##.##.....##

  actionError(actionName: string) {
    this.framework().showMessage(`cannot take ${actionName} action`, 'error');
  }

  /*
   * Make an AJAX call with automatic lock
   */
  takeAction({ action, data = {} }: { action: string; data?: Record<string, unknown> }) {
    console.log(`takeAction ${action}`, data);
    if (!this.framework().checkAction(action)) {
      this.actionError(action);
      return;
    }
    data.lock = true;
    const gameName = this.framework().game_name;
    this.framework().ajaxcall(`/${gameName}/${gameName}/${action}.html`, data, this, () => {});
  }
}
