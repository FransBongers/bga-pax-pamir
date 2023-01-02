declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;
declare const playSound;

class PaxPamir implements PaxPamirGame {
  public gamedatas: PaxPamirGamedatas;
  private interactionManager: InteractionManager;
  private mapManager: MapManager;
  private marketManager: MarketManager;
  public objectManager: ObjectManager;
  public playerManager: PlayerManager;
  // global variables
  private defaultWeightZone: number = 0;
  private playerHand = new ebg.stock();
  private playerEvents = {}; // events per player
  private activeEvents: Stock = new ebg.stock(); // active events
  private spies = {}; // spies per cards
  private playerCounts = {}; // rename to playerTotals?

  constructor() {
    console.log("paxpamireditiontwo constructor");
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
    console.log("gamedatas", gamedatas);
    this.gamedatas = gamedatas;
    console.log("this.gamedatas", this.gamedatas);

    // Events
    setupCardsStock({
      game: this,
      stock: this.activeEvents,
      nodeId: "pp_active_events",
      // className: `pp_card_in_court_${playerId}`
    });

    // TODO: use Object.values in similar cases?
    Object.keys(gamedatas.active_events).forEach((key) => {
      placeCard({
        location: this.activeEvents,
        id: gamedatas.active_events[key].key,
      });
    });

    this.objectManager = new ObjectManager(this);
    this.playerManager = new PlayerManager(this);
    this.mapManager = new MapManager(this);
    this.marketManager = new MarketManager(this);
    this.interactionManager = new InteractionManager(this);
    this.setupNotifications();
  }
  public onEnteringState(stateName: string, args: any) {}
  public onLeavingState(stateName: string) {}
  public onUpdateActionButtons(stateName: string, args: any) {}
  public setupNotifications() {}

  // TODO (Frans): cast as number?
  public getPlayerId(): string {
    return (this as any).player_id;
  }

  //....###..........##....###....##.....##
  //...##.##.........##...##.##....##...##.
  //..##...##........##..##...##....##.##..
  //.##.....##.......##.##.....##....###...
  //.#########.##....##.#########...##.##..
  //.##.....##.##....##.##.....##..##...##.
  //.##.....##..######..##.....##.##.....##

  actionError(actionName: string) {
    (this as unknown as FrameworkFunctions).showMessage(
      `cannot take ${actionName} action`,
      "error"
    );
  }

  public cardAction({ cardId, cardAction }): void {
    // TODO: do we need to add checkAction?
    (this as unknown as FrameworkFunctions).ajaxcall(
      "/paxpamireditiontwo/paxpamireditiontwo/cardAction.html",
      {
        lock: true,
        card_id: cardId,
        card_action: cardAction,
      },
      this,
      function (result) {}
    );
  }

  public chooseLoyalty({ coalition }: {coalition: COALITION}) {
    (this as unknown as FrameworkFunctions).ajaxcall(
      "/paxpamireditiontwo/paxpamireditiontwo/chooseLoyalty.html",
      {
        lock: true,
        coalition,
      },
      this,
      function (result) {}
    );
  }

  public discardCards({ cards, fromHand }) {
    // TODO: do we need to add checkAction?
    (this as unknown as FrameworkFunctions).ajaxcall(
      "/paxpamireditiontwo/paxpamireditiontwo/discardCards.html",
      {
        lock: true,
        cards,
        from_hand: fromHand,
      },
      this,
      function (result) {}
    );
  }

  public pass() {
    if (!(this as unknown as FrameworkFunctions).checkAction("pass")) {
      this.actionError("pass");
      return;
    }
    (this as unknown as FrameworkFunctions).ajaxcall(
      "/paxpamireditiontwo/paxpamireditiontwo/passAction.html",
      {
        lock: true,
      },
      this,
      function (result) {}
    );
  }

  placeRoad({ border }) {
    if (!(this as unknown as FrameworkFunctions).checkAction("placeRoad")) {
      this.actionError("placeRoad");
      return;
    }
    (this as unknown as FrameworkFunctions).ajaxcall(
      "/paxpamireditiontwo/paxpamireditiontwo/placeRoad.html",
      {
        lock: true,
        border,
      },
      this,
      function (result) {}
    );
  }

  placeSpy({ cardId }) {
    (this as unknown as FrameworkFunctions).ajaxcall(
      "/paxpamireditiontwo/paxpamireditiontwo/placeSpy.html",
      {
        lock: true,
        card_id: cardId,
      },
      this,
      function (result) {}
    );
  }

  playCard({ cardId, leftSide }) {
    (this as unknown as FrameworkFunctions).ajaxcall(
      "/paxpamireditiontwo/paxpamireditiontwo/playCard.html",
      {
        lock: true,
        card_id: cardId,
        left_side: leftSide,
      },
      this,
      function (result) {}
    );
  }

  purchaseCard({ cardId }) {
    // TODO: do we need to add checkAction?
    (this as unknown as FrameworkFunctions).ajaxcall(
      "/paxpamireditiontwo/paxpamireditiontwo/purchaseCard.html",
      {
        lock: true,
        card_id: cardId,
      },
      this,
      function (result) {}
    );
  }

  selectGift({ selectedGift }) {
    (this as unknown as FrameworkFunctions).ajaxcall(
      "/paxpamireditiontwo/paxpamireditiontwo/selectGift.html",
      {
        lock: true,
        selected_gift: selectedGift,
      },
      this,
      function (result) {}
    );
  }

  ///////////////////////////////////////////////////
  //// Player's action

  /*
        
            Here, you are defining methods to handle player's action (ex: results of mouse click on 
            game objects).
            
            Most of the time, these methods:
            _ check the action is possible at this game state.
            _ make a call to the game server
        
        */

  /* Example:
        
        onMyMethodToCall1: function( evt )
        {
            console.log( 'onMyMethodToCall1' );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );

            // Check that this action is possible (see "possibleactions" in states.inc.php)
            if( ! this.checkAction( 'myAction' ) )
            {   return; }

            this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/myAction.html", { 
                                                                    lock: true, 
                                                                    myArgument1: arg1, 
                                                                    myArgument2: arg2,
                                                                    ...
                                                                 }, 
                         this, function( result ) {
                            
                            // What to do after the server call if it succeeded
                            // (most of the time: nothing)
                            
                         }, function( is_error) {

                            // What to do after the server call in anyway (success or failure)
                            // (most of the time: nothing)

                         } );        
        },        
        
        */
}
