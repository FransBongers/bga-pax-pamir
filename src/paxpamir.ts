/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Paxpamir implementation : © Frans Bongers <fjmbongers@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * paxpamir.js
 *
 * PaxPamir user interface script
 *
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

declare const define; // TODO: check if we comment here or in bga-animations module?
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _: (stringToTranslate: string) => string;
declare const g_gamethemeurl;
declare const playSound;
declare var noUiSlider;

class PaxPamir implements PaxPamirGame {
  public gamedatas: PaxPamirGamedatas;
  public animationManager: AnimationManager;
  public gameOptions: PaxPamirGamedatas['gameOptions'];
  public map: PPMap;
  public market: Market;
  public notificationManager: NotificationManager;
  public objectManager: ObjectManager;
  public playerManager: PlayerManager;
  public infoPanel: InfoPanel;
  public settings: Settings;
  public cardManager: PPCardManager;
  public coalitionBlockManager: CoalitionBlockManager;
  public cylinderManager: CylinderManager;
  public favoredSuitMarkerManager: FavoredSuitMarkerManager;
  public rulerTokenManager: RulerTokenManager;
  public rupeeManager: RupeeManager;
  // global variables
  private defaultWeightZone: number = 0;
  public activeEvents: PPActiveEvents; // active events
  public spies: Record<string, LineStock<Cylinder>> = {}; // spies per cards
  public playerCounts = {}; // rename to playerTotals? => can we remove?
  public playerOrder: number[];
  public tooltipManager: PPTooltipManager;
  private _notif_uid_to_log_id = {};
  private _last_notif = null;
  public _connections: unknown[];
  public localState: LocalState;
  private alwaysFixTopActions: boolean;
  private alwaysFixTopActionsMaximum: number;

  public activeStates: {
    [CLIENT_CARD_ACTION_BATTLE]: ClientCardActionBattleState;
    [CLIENT_CARD_ACTION_BETRAY]: ClientCardActionBetrayState;
    [CLIENT_CARD_ACTION_BUILD]: ClientCardActionBuildState;
    [CLIENT_CARD_ACTION_GIFT]: ClientCardActionGiftState;
    [CLIENT_CARD_ACTION_MOVE]: ClientCardActionMoveState;
    [CLIENT_CARD_ACTION_TAX]: ClientCardActionTaxState;
    [CLIENT_INITIAL_BRIBE_CHECK]: ClientInitialBribeCheckState;
    [CLIENT_PLAY_CARD]: ClientPlayCardState;
    [CLIENT_PURCHASE_CARD]: ClientPurchaseCardState;
    // [CLIENT_RESOLVE_EVENT_CONFIDENCE_FAILURE]: ResolveEventConfidenceFailureState;
    confirmPartialTurn: ConfirmPartialTurnState;
    eventCardRebuke: ResolveEventRebukeState;
    acceptPrize: AcceptPrizeState;
    discard: DiscardState;
    endGameCheck: EndGameCheckState;
    negotiateBribe: NegotiateBribeState;
    placeRoad: PlaceRoadState;
    placeSpy: PlaceSpyState;
    playerActions: PlayerActionsState;
    eventCardPashtunwaliValues: ResolveEventPashtunwaliValuesState;
    eventCardOtherPersuasiveMethods: ResolveEventOtherPersuasiveMethodsState;
    eventCardRumor: ResolveEventRumor;
    // resolveEvent: ResolveEventState;
    setup: SetupState;
    selectPiece: SelectPieceState;
    specialAbilityInfrastructure: ClientCardActionBuildState;
    specialAbilitySafeHouse: SASafeHouseState;
    startOfTurnAbilities: StartOfTurnAbilitiesState;
    wakhanPause: WakhanPauseState;
  };

  constructor() {
    console.log('paxpamir constructor');
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
    this.setAlwaysFixTopActions();
    // const playAreaWidth = document.getElementById('pp_play_area').offsetWidth;
    // console.log('playAreaWidth',playAreaWidth);
    this.gamedatas = gamedatas;
    this.gameOptions = gamedatas.gameOptions;
    debug('gamedatas', gamedatas);
    this.setupPlayerOrder({ paxPamirPlayerOrder: gamedatas.paxPamirPlayerOrder });
    if (this.gameOptions.wakhanEnabled) {
      dojo.place(tplWakhanPlayerPanel({ name: _('Wakhan') }), 'player_boards', 0);
    }

    // dojo.style("pagemaintitle_wrap", "display", "block");
    // dojo.style("gameaction_status_wrap", "display", "block");

    this.playerOrder.forEach((playerId) => {
      const player = gamedatas.paxPamirPlayers[playerId];
      if (playerId === 1) {
        dojo.place(tplWakhanTableau({ playerId, playerName: player.name, playerColor: player.color }), 'pp_player_tableaus');
      } else {
        dojo.place(tplPlayerTableau({ playerId, playerName: player.name, playerColor: player.color }), 'pp_player_tableaus');
      }
    });

    this._connections = [];
    // Will store all data for active player and gets refreshed with entering player actions state
    this.localState = gamedatas.localState;
    this.activeStates = {
      [CLIENT_CARD_ACTION_BATTLE]: new ClientCardActionBattleState(this),
      [CLIENT_CARD_ACTION_BETRAY]: new ClientCardActionBetrayState(this),
      [CLIENT_CARD_ACTION_BUILD]: new ClientCardActionBuildState(this, false),
      [CLIENT_CARD_ACTION_GIFT]: new ClientCardActionGiftState(this),
      [CLIENT_CARD_ACTION_MOVE]: new ClientCardActionMoveState(this),
      [CLIENT_CARD_ACTION_TAX]: new ClientCardActionTaxState(this),
      [CLIENT_INITIAL_BRIBE_CHECK]: new ClientInitialBribeCheckState(this),
      [CLIENT_PLAY_CARD]: new ClientPlayCardState(this),
      [CLIENT_PURCHASE_CARD]: new ClientPurchaseCardState(this),
      acceptPrize: new AcceptPrizeState(this),
      confirmPartialTurn: new ConfirmPartialTurnState(this),
      discard: new DiscardState(this),
      endGameCheck: new EndGameCheckState(this),
      eventCardPashtunwaliValues: new ResolveEventPashtunwaliValuesState(this),
      eventCardOtherPersuasiveMethods: new ResolveEventOtherPersuasiveMethodsState(this),
      eventCardRumor: new ResolveEventRumor(this),
      eventCardRebuke: new ResolveEventRebukeState(this),
      negotiateBribe: new NegotiateBribeState(this),
      placeRoad: new PlaceRoadState(this),
      placeSpy: new PlaceSpyState(this),
      playerActions: new PlayerActionsState(this),
      setup: new SetupState(this),
      selectPiece: new SelectPieceState(this),
      specialAbilityInfrastructure: new ClientCardActionBuildState(this, true),
      specialAbilitySafeHouse: new SASafeHouseState(this),
      startOfTurnAbilities: new StartOfTurnAbilitiesState(this),
      wakhanPause: new WakhanPauseState(this),
    };

    this.infoPanel = new InfoPanel(this);
    this.settings = new Settings(this);
    // this.animationManager = new AnimationManager(this, { duration: 500 });
    this.animationManager = new AnimationManager(this, {
      duration:
        this.settings.get({ id: PREF_SHOW_ANIMATIONS }) === PREF_DISABLED
          ? 0
          : 2100 - (this.settings.get({ id: PREF_ANIMATION_SPEED }) as number),
    });

    this.tooltipManager = new PPTooltipManager(this);
    this.cylinderManager = new CylinderManager(this);
    this.favoredSuitMarkerManager = new FavoredSuitMarkerManager(this);
    this.cardManager = new PPCardManager(this);
    this.coalitionBlockManager = new CoalitionBlockManager(this);
    this.rulerTokenManager = new RulerTokenManager(this);
    this.rupeeManager = new RupeeManager(this);

    this.activeEvents = new PPActiveEvents(this);
    this.playerManager = new PlayerManager(this);

    this.playerManager.setupAdjacentPlayerColors();

    this.map = new PPMap(this);
    this.market = new Market(this);
    this.objectManager = new ObjectManager(this);
    if (this.notificationManager != undefined) {
      this.notificationManager.destroy();
    }
    this.notificationManager = new NotificationManager(this);
    // // Setup game notifications to handle (see "setupNotifications" method below)
    this.notificationManager.setupNotifications();

    // TO CHECK: add tooltips to log here?
    dojo.connect(this.framework().notifqueue, 'addToLog', () => {
      this.checkLogCancel(this._last_notif == null ? null : this._last_notif.msg.uid);
      this.addLogClass();
      this.tooltipManager.checkLogTooltip(this._last_notif);
    });
    // this.setupNotifications();
    this.tooltipManager.setupTooltips();
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
    // const ALWAYS_ENTER = [
    //   'resolveEvent',
    //   CLIENT_RESOLVE_EVENT_CONFIDENCE_FAILURE,
    //   CLIENT_RESOLVE_EVENT_OTHER_PERSUASIVE_METHODS,
    //   CLIENT_RESOLVE_EVENT_PASHTUNWALI_VALUES,
    //   CLIENT_RESOLVE_EVENT_REBUKE,
    //   CLIENT_RESOLVE_EVENT_RUMOR,
    // ];
    console.log('Entering state: ' + stateName, args);
    // UI changes for active player
    if (this.framework().isCurrentPlayerActive() && this.activeStates[stateName]) {
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

  addUndoButton({ undoPossible }: { undoPossible: boolean }) {
    if (undoPossible) {
      this.addDangerActionButton({
        id: 'undo_btn',
        text: _('Undo'),
        callback: () => this.takeAction({ action: 'restart' }),
      });
    }
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

  addPlayerButton({ player, callback }: { player: PPPlayer; callback: Function | string }) {
    this.addPrimaryActionButton({
      id: `select_${player.getPlayerId()}`,
      text: player.getName(),
      callback,
      extraClasses: `pp_player_button pp_player_color_${player.getColor()}`,
    });
  }

  public clearInterface() {
    Object.keys(this.spies).forEach((key) => {
      if (this.spies[key]) {
        this.spies[key].removeAll();
      }
      this.spies[key] = undefined;
    });

    this.activeEvents.clearInterface();
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

    this.map.clearSelectable();
  }

  public getCard(token: Token): Card {
    return {
      ...token,
      ...this.getCardInfo(token.id),
    };
  }

  public getCylinder(token: Token): Cylinder {
    return {
      ...token,
      color: this.gamedatas.paxPamirPlayers[token.id.split('_')[1]].color,
    };
  }

  public getCardInfo(cardId: string): CardStaticData {
    return this.gamedatas.staticData.cards[cardId];
  }

  public getWakhanCardInfo({ wakhanCardId }: { wakhanCardId: string }): WakhanCard {
    return this.gamedatas.staticData.wakhanCards[wakhanCardId];
  }

  public getPlayerId(): number {
    return Number(this.framework().player_id);
  }

  public getCurrentPlayer(): PPPlayer {
    return this.playerManager.getPlayer({ playerId: this.getPlayerId() });
  }

  public getMinimumActionCost({ action }: { action: string }): number | null {
    if ([BATTLE, MOVE, TAX, PLAY_CARD].includes(action)) {
      return 0;
    } else if ([BETRAY, BUILD].includes(action)) {
      return 2;
    } else {
      // only option remaining is purchase gift, determines on lowest empty spot
      return this.getCurrentPlayer().getLowestAvailableGift();
    }
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

  setCourtCardsSelectable({
    callback,
    loyalty,
    region,
    suit,
  }: {
    callback: (props: { cardId: string }) => void;
    loyalty?: string;
    region?: string;
    suit?: string;
  }) {
    debug('setCourtCardsSelectable', loyalty, region, suit);
    const playerId = this.getPlayerId();
    dojo.query(`.pp_court.pp_court_player_${playerId} .pp_card`).forEach((node: HTMLElement, index: number) => {
      const cardId = 'card_' + node.id.split('_')[1];
      const card = this.getCardInfo(cardId) as CourtCard;

      const loyaltyFilter = !loyalty || card.loyalty === loyalty;
      const regionFilter = !region || card.region === region;
      const suitFilter = !suit || card.suit === suit;

      if (loyaltyFilter && regionFilter && suitFilter) {
        dojo.addClass(node, 'pp_selectable');
        this._connections.push(dojo.connect(node, 'onclick', this, () => callback({ cardId })));
      }
    });
  }

  setHandCardsSelectable({ callback }: { callback: (props: { cardId: string }) => void }) {
    debug('setHandCardsSelectable');
    document.querySelectorAll('.pp_player_hand_cards .pp_card').forEach((node: HTMLElement, index: number) => {
      const cardId = node.id;
      debug('cardId', cardId);
      dojo.addClass(node, 'pp_selectable');
      this._connections.push(dojo.connect(node, 'onclick', this, () => callback({ cardId })));
    });
  }

  // Sets player order with current player at index 0 if player is in the game
  setupPlayerOrder({ paxPamirPlayerOrder }: { paxPamirPlayerOrder: number[] }) {
    const currentPlayerId = this.getPlayerId();
    const isInGame = paxPamirPlayerOrder.includes(currentPlayerId);
    if (isInGame) {
      while (paxPamirPlayerOrder[0] !== currentPlayerId) {
        const firstItem = paxPamirPlayerOrder.shift();
        paxPamirPlayerOrder.push(firstItem);
      }
    }
    this.playerOrder = paxPamirPlayerOrder;
  }

  // TODO: check if we can make below functions a single function and just update both since framework
  // will only show one?
  clientUpdatePageTitle({ text, args }: { text: string; args: Record<string, string | number> }) {
    // this.gamedatas.gamestate.descriptionmyturn = dojo.string.substitute(_(text), args);
    this.gamedatas.gamestate.descriptionmyturn = this.format_string_recursive(_(text), args);
    this.framework().updatePageTitle();
  }

  clientUpdatePageTitleOtherPlayers({ text, args }: { text: string; args: Record<string, string | number> }) {
    this.gamedatas.gamestate.description = dojo.string.substitute(_(text), args);
    this.framework().updatePageTitle();
  }

  public updateLayout() {
    if (!this.settings) {
      return;
    }

    $('play_area_container').setAttribute('data-two-columns', this.settings.get({ id: 'twoColumnsLayout' }));

    const ROOT = document.documentElement;
    let WIDTH = $('play_area_container').getBoundingClientRect()['width'] - 8; // minus padding
    const LEFT_COLUMN = 1000;
    const RIGHT_COLUMN = 1000;

    if (this.settings.get({ id: 'twoColumnsLayout' }) === PREF_ENABLED) {
      WIDTH = WIDTH - 8; // minus grid gap
      const size = Number(this.settings.get({ id: 'columnSizes' }));
      const proportions = [size, 100 - size];
      const LEFT_SIZE = (proportions[0] * WIDTH) / 100;
      const leftColumnScale = LEFT_SIZE / LEFT_COLUMN;
      ROOT.style.setProperty('--leftColumnScale', `${leftColumnScale}`);
      ROOT.style.setProperty('--mapSizeMultiplier', '1');
      const RIGHT_SIZE = (proportions[1] * WIDTH) / 100;
      const rightColumnScale = RIGHT_SIZE / RIGHT_COLUMN;
      ROOT.style.setProperty('--rightColumnScale', `${rightColumnScale}`);

      $('play_area_container').style.gridTemplateColumns = `${LEFT_SIZE}px ${RIGHT_SIZE}px`;
    } else {
      const LEFT_SIZE = WIDTH;
      const leftColumnScale = LEFT_SIZE / LEFT_COLUMN;
      ROOT.style.setProperty('--leftColumnScale', `${leftColumnScale}`);
      ROOT.style.setProperty('--mapSizeMultiplier', `${Number(this.settings.get({ id: PREF_SINGLE_COLUMN_MAP_SIZE })) / 100}`);
      const RIGHT_SIZE = WIDTH;
      const rightColumnScale = RIGHT_SIZE / RIGHT_COLUMN;
      ROOT.style.setProperty('--rightColumnScale', `${rightColumnScale}`);
    }
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
  format_string_recursive(log: string, args: Record<string, unknown>): string {
    try {
      if (log && args && !args.processed) {
        args.processed = true;

        // replace all keys that start with 'logToken'
        Object.entries(args).forEach(([key, value]) => {
          if (key.startsWith('logToken')) {
            args[key] = getLogTokenDiv({ logToken: value as string, game: this });
          } else if (key.startsWith('tkn_')) {
            args[key] = getTokenDiv({ key, value: value as string, game: this });
          }
        });

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

  /*
   * Remove non standard zoom property
   */
  onScreenWidthChange() {
    this.updateLayout();
  }

  public cancelLogs(notifIds: string[]) {
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

  updatePlayerOrdering() {
    // (this as any).inherited(arguments);
    this.playerOrder.forEach((playerId: number, index: number) => {
      dojo.place('overall_player_board_' + playerId, 'player_boards', index);
    });
    const container = document.getElementById('player_boards');
    const infoPanel = document.getElementById('info_panel');
    if (!container) {
      return;
    }
    container.insertAdjacentElement('afterbegin', infoPanel);
    // if (this.gameOptions.wakhanEnabled) {
    //   const wakhanPosition = this.playerOrder.findIndex((id) => id === 1) + 2;
    //   dojo.place(tplWakhanPlayerPanel({name: _('Wakhan')}), 'player_boards', wakhanPosition);
    // }
  }

  setAlwaysFixTopActions(alwaysFixed = true, maximum = 30) {
    this.alwaysFixTopActions = alwaysFixed;
    this.alwaysFixTopActionsMaximum = maximum;
    this.adaptStatusBar();
  }

  adaptStatusBar() {
    (this as any).inherited(arguments);

    if (this.alwaysFixTopActions) {
      const afterTitleElem = document.getElementById('after-page-title');
      const titleElem = document.getElementById('page-title');
      let zoom = (getComputedStyle(titleElem) as any).zoom;
      if (!zoom) {
        zoom = 1;
      }

      const titleRect = afterTitleElem.getBoundingClientRect();
      if (
        titleRect.top < 0 &&
        titleElem.offsetHeight <
          (window.innerHeight * this.alwaysFixTopActionsMaximum) / 100
      ) {
        const afterTitleRect = afterTitleElem.getBoundingClientRect();
        titleElem.classList.add('fixed-page-title');
        titleElem.style.width = (afterTitleRect.width - 10) / zoom + 'px';
        afterTitleElem.style.height = titleRect.height + 'px';
      } else {
        titleElem.classList.remove('fixed-page-title');
        titleElem.style.width = 'auto';
        afterTitleElem.style.height = '0px';
      }
    }
  }

  // .########..#######......######..##.....##.########..######..##....##
  // ....##....##.....##....##....##.##.....##.##.......##....##.##...##.
  // ....##....##.....##....##.......##.....##.##.......##.......##..##..
  // ....##....##.....##....##.......#########.######...##.......#####...
  // ....##....##.....##....##.......##.....##.##.......##.......##..##..
  // ....##....##.....##....##....##.##.....##.##.......##....##.##...##.
  // ....##.....#######......######..##.....##.########..######..##....##

  // returns zone object for given backend location in token database
  getZoneForLocation({ location }: { location: string }): CardStock<any> {
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
      case 'events':
        return this.playerManager.getPlayer({ playerId: Number(splitLocation[1]) }).getEventsZone();
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
        debug('no zone determined');
        break;
    }
  }

  // public move({
  //   id,
  //   to,
  //   from,
  //   weight = this.defaultWeightZone,
  //   addClass = [],
  //   removeClass = [],
  // }: {
  //   id: string;
  //   to: Zone;
  //   from: Zone;
  //   weight?: number;
  //   addClass?: string[];
  //   removeClass?: string[];
  // }) {
  //   addClass.forEach((newClass) => {
  //     dojo.addClass(id, newClass);
  //   });

  //   removeClass.forEach((oldClass) => {
  //     dojo.removeClass(id, oldClass);
  //   });

  //   dojo.addClass(id, 'pp_moving');
  //   to.placeInZone(id, weight);
  //   from.removeFromZone(id, false);

  //   // TODO: check if there is a better way than using setTimeout
  //   setTimeout(() => {
  //     dojo.removeClass(id, 'pp_moving');
  //   }, 2000);
  // }

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
    if (!this.framework().checkAction(action)) {
      this.actionError(action);
      return;
    }
    data.lock = true;
    const gameName = this.framework().game_name;
    this.framework().ajaxcall(`/${gameName}/${gameName}/${action}.html`, data, this, () => {});
  }
}
