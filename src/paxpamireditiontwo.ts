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
  public interactionManager: InteractionManager;
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
    console.log('gamedatas', gamedatas);

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
    this.interactionManager = new InteractionManager(this);

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
    console.log('Ending game setup');
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
    console.log('Entering state: ' + stateName, args.args);
    this.interactionManager.onEnteringState(stateName, args);
  }

  // onLeavingState: this method is called each time we are leaving a game state.
  //                 You can use this method to perform some user interface changes at this moment.
  //
  public onLeavingState(stateName: string) {
    console.log('Leaving state: ' + stateName);
    this.interactionManager.onLeavingState(stateName);
  }

  // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
  //                        action status bar (ie: the HTML links in the status bar).
  //
  public onUpdateActionButtons(stateName: string, args: any) {
    console.log('onUpdateActionButtons: ' + stateName);
    // this.interactionManager.onUpdateActionButtons(stateName, args);
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

  /* @Override */
  format_string_recursive(log, args) {
    try {
      if (log && args && !args.processed) {
        args.processed = true;

        // list of special keys we want to replace with images
        const keys = logTokenKeys;

        // list of other known variables
        //  var keys = this.notification_manager.keys;

        for (var i in keys) {
          var key = keys[i];
          if (args[key] != undefined) {
            args[key] = getLogTokenDiv(key, args);
          }
        }
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

  public clearInterface() {
    console.log('clear interface');
    Object.values(this.spies).forEach((zone) => {
      dojo.empty(zone.container_div);
      zone = undefined;
    });

    this.market.clearInterface();
    this.playerManager.clearInterface();
    this.map.clearInterface();
    this.objectManager.clearInterface();
  }

  public getCardInfo({ cardId }: { cardId: string }): Card {
    return this.gamedatas.staticData.cards[cardId];
  }

  public discardCard({ id, from, order = null }: { id: string; from: Zone; order?: number }) {
    // Move all spies back to cylinder pools
    if (this.spies?.[id]) {
      // ['cylinder_2371052_3']
      const items = this.spies[id].getAllItems();
      items.forEach((cylinderId) => {
        const playerId = Number(cylinderId.split('_')[1]);
        this.move({
          id: cylinderId,
          to: this.playerManager.getPlayer({ playerId }).getCylinderZone(),
          from: this.spies[id],
        });
      });
    }
    // this.move({
    //   id,
    //   from,
    //   to: this.objectManager.discardPile.getZone(),
    //   weight: order
    // })

    from.removeFromZone(id, false);
    attachToNewParentNoDestroy(id, 'pp_discard_pile');
    this.framework().slideToObject(id, 'pp_discard_pile').play();
  }

  public framework(): Framework {
    return this as unknown as Framework;
  }

  public getPlayerId(): number {
    return Number(this.framework().player_id);
  }

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

  public moveCard({ id, from, to = null, order = null }: { id: string; from: Stock; to?: Stock | null; order?: number | null }) {
    let fromDiv = null;
    if (from !== null) {
      fromDiv = from.getItemDivId(id);
    }
    if (to !== null) {
      if (order != null) {
        to.changeItemsWeight({ id: order });
      }
      to.addToStockWithId(id, id, fromDiv);

      // We need to set up new zone because id of div will change due to stock component
      // this.setupCardSpyZone({location: to, cardId: id});

      // this.addTooltip( to_location.getItemDivId(id), id, '' );
    }

    if (from !== null) {
      from.removeFromStockById(id);
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

    to.placeInZone(id, weight);
    from.removeFromZone(id, false);
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
