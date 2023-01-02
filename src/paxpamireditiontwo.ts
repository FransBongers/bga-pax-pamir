declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;
declare const playSound;

class PaxPamir implements PaxPamirGame {
  public gamedatas: PaxPamirGamedatas;
  public objectManager: ObjectManager;
  private playerManager: PlayerManager;
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

    this.objectManager = new ObjectManager({ game: this });
    this.playerManager = new PlayerManager({ game: this });
    this.setupNotifications();
  }
  public onEnteringState(stateName: string, args: any) {}
  public onLeavingState(stateName: string) {}
  public onUpdateActionButtons(stateName: string, args: any) {}
  public setupNotifications() {}

  /**
   * Wrappers for framework functions that are available but not definef for TS
   */

  public formatBlockWrapper(jstpId: string, args: Record<string, unknown>): string {
    return (this as any).format_block(jstpId, args);
  }
}
