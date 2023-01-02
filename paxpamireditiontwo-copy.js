/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * PaxPamirEditionTwo implementation : © <Your name here> <Your email address here>
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

define([
  "dojo",
  "dojo/_base/declare",
  "ebg/core/gamegui",
  "ebg/counter",
  "ebg/stock",
  "ebg/zone",
  g_gamethemeurl + "modules/js/Constants.js",
  g_gamethemeurl + "modules/js/InteractionManager.js",
  g_gamethemeurl + "modules/js/MapManager.js",
  g_gamethemeurl + "modules/js/MarketManager.js",
  g_gamethemeurl + "modules/js/NotificationManager.js",
  g_gamethemeurl + "modules/js/ObjectManager.js",
  g_gamethemeurl + "modules/js/PlayerManager.js",
  g_gamethemeurl + "modules/js/Utils.js",
], function (dojo, declare) {
  return declare("bgagame.paxpamireditiontwo", ebg.core.gamegui, {
    constructor: function () {
      console.log("paxpamireditiontwo constructor");

      // Init global variables

      this.defaultWeightZone = 0;
      // NOTE (Frans): probably good idea to get all game specific data from below from the backend

      // global variables to keep stock components
      this.playerHand = new ebg.stock();
      // events per player
      this.playerEvents = {};
      // active events
      this.activeEvents = new ebg.stock();

      // spies per cards
      this.spies = {};

      this.playerCounts = {}; // rename to playerTotals?
    },

    /*
            setup:
            
            This method must set up the game user interface according to current game situation specified
            in parameters.
            
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
            
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */

    setup: function (gamedatas) {
      console.log("gamedatas", gamedatas);

      // Events
      setupCardsStock({
        game: this,
        stock: this.activeEvents,
        nodeId: "pp_active_events",
        // className: `pp_card_in_court_${playerId}`
      });

      Object.keys(gamedatas.active_events).forEach((key) => {
        placeCard({
          location: this.activeEvents,
          id: gamedatas.active_events[key].key,
        });
      });

      this.objectManager = new ObjectManager({ game: this });
      this.playerManager = new PlayerManager({ game: this });
      this.mapManager = new MapManager({ game: this });
      this.marketManager = new MarketManager({ game: this });
      this.interactionManager = new InteractionManager(this);
      this.playerCounts = gamedatas.counts;

      // Setup player hand
      setupCardsStock({
        game: this,
        stock: this.playerHand,
        nodeId: "pp_player_hand_cards",
        className: "pp_card_in_hand",
      });
      Object.keys(this.gamedatas.hand).forEach((cardId) => {
        placeCard({ location: this.playerHand, id: cardId });
      });

      // Place spies on cards
      Object.keys(gamedatas.spies || {}).forEach((cardId) => {
        Object.keys(gamedatas.spies[cardId]).forEach((cylinderId) => {
          const playerId = cylinderId.split("_")[1];
          placeToken({
            game: this,
            location: this.spies[cardId],
            id: cylinderId,
            jstpl: "jstpl_cylinder",
            jstplProps: {
              id: cylinderId,
              color: gamedatas.players[playerId].color,
            },
            weight: this.defaultWeightZone,
          });
        });
      });

      if (this.notification_manager != undefined) {
        this.notification_manager.destroy();
      }
      this.notificationManager = new NotificationManager(this);
      // Setup game notifications to handle (see "setupNotifications" method below)
      this.notificationManager.setupNotifications();

      // // Setup game notifications to handle (see "setupNotifications" method below)
      // this.setupNotifications();

      console.log("Ending game setup");
    },

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
    //
    onEnteringState: function (stateName, args) {
      console.log("Entering state: " + stateName, args);
      this.interactionManager.onEnteringState(stateName, args);
    },

    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    onLeavingState: function (stateName) {
      console.log("Leaving state: " + stateName);
      this.interactionManager.onLeavingState(stateName);
    },

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    onUpdateActionButtons: function (stateName, args) {
      console.log("onUpdateActionButtons: " + stateName);
      this.interactionManager.onUpdateActionButtons(stateName, args);
    },

    onActionButtonClick: function(evt) {
        this.interactionManager.onActionButtonClick(evt);
    },
    // TODO (Frans): replace below with single actionButton
    onPurchase: function( evt ) {
        this.interactionManager.onPurchase( evt );
    },

    onPlay: function( evt ) {
        this.interactionManager.onPlay( evt );
    },

    onSelectGift: function( evt ) {
        this.interactionManager.onSelectGift( evt );
    },

    onSelectRegion: function( evt ) {
        this.interactionManager.onSelectRegion( evt );
    },

    onCardAction: function( evt ) {
        this.interactionManager.onCardAction( evt );
    },

    onPass: function( evt ) {
        this.interactionManager.onPass( evt );
    },

    onBorder: function( evt ) {
        this.interactionManager.onBorder( evt );
    },

    onCard: function( evt ) {
        this.interactionManager.onCard( evt );
    },

    onCardActionClick: function( evt ) {
        this.interactionManager.onCardActionClick( evt );
    },

    onCancel: function( evt ) {
        this.interactionManager.onCancel( evt );
    },

    onConfirm: function( evt ) {
        this.interactionManager.onConfirm( evt );
    },


    onLeft: function( evt ) {
        this.interactionManager.onLeft( evt );
    },


    onRight: function( evt ) {
        this.interactionManager.onRight( evt );
    },


    //  .##.....##.########.####.##.......####.########.##....##
    //  .##.....##....##.....##..##........##.....##.....##..##.
    //  .##.....##....##.....##..##........##.....##......####..
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  ..#######.....##....####.########.####....##.......##...

    ///////////////////////////////////////////////////
    //// Utility methods - add in alphabetical order

    discardCard: function ({ id, from, order = null }) {
      // Move all spies back to cylinder pools
      if (this.spies?.[id]) {
        // ['cylinder_2371052_3']
        const items = this.spies[id].getAllItems();
        items.forEach((cylinderId) => {
          const playerId = cylinderId.split("_")[1];
          this.moveToken({
            id: cylinderId,
            to: this.playerManager.players[playerId].cylinders,
            from: this.spies[id],
          });
        });
      }

      from.removeFromStockById(id, "pp_discard_pile");
    },

    // returns zone object for given backend location in token database
    getZoneForLocation: function ({ location }) {
      const splitLocation = location.split("_");
      switch (splitLocation[0]) {
        case "armies":
          // armies_kabul
          return this.mapManager
            .getRegion({ region: splitLocation[1] })
            .getArmyZone();
        case "blocks":
          // blocks_russian
          return this.objectManager.supply.getCoalitionBlocksZone({
            coalition: splitLocation[1],
          });
        case "cylinders":
          // cylinders_playerId
          return this.playerManager.players[splitLocation[1]].cylinders;
        case "gift":
          // gift_2_playerId
          return this.playerManager.players[splitLocation[2]].gifts[
            splitLocation[1]
          ];
        case "favored":
          // favored_suit_economic
          return this.objectManager.favoredSuit.getFavoredSuitZone({
            suit: splitLocation[2],
          });
        case "roads":
          // roads_herat_kabul
          const border = `${splitLocation[1]}_${splitLocation[2]}`;
          return this.mapManager.getBorder({ border }).getRoadZone();
        case "spies":
          // spies_card_38
          const cardId = `${splitLocation[1]}_${splitLocation[2]}`;
          return this.spies[cardId];
        case "tribes":
          // tribes_kabul
          return this.mapManager
            .getRegion({ region: splitLocation[1] })
            .getTribeZone();
        default:
          console.log("no zone determined");
          break;
      }
    },

    moveCard: function ({ id, from, to, order = null }) {
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
    },

    moveToken: function ({
      id,
      to,
      from,
      weight = this.defaultWeightZone,
      addClass = undefined,
      removeClass = undefined,
    }) {
      if (addClass) {
        dojo.addClass(id, addClass);
      }
      if (removeClass) {
        dojo.removeClass(id, removeClass);
      }

      to.placeInZone(id, weight);
      from.removeFromZone(id, false);
    },

    // Function that gets called every time a card is added to a stock component
    setupNewCard: function (cardDiv, cardId, divId) {
      // if card is played to a court
      if (divId.startsWith("pp_court_player")) {
        const { actions, region } = this.gamedatas.cards[cardId];
        // add region class for selectable functions
        // const region = this.gamedatas.cards[cardId].region;
        dojo.addClass(cardDiv, `pp_card_in_court_${region}`);

        const spyZoneId = "spies_" + cardId;
        dojo.place(`<div id="${spyZoneId}" class="pp_spy_zone"></div>`, divId);
        this.setupCardSpyZone({ nodeId: spyZoneId, cardId });
        // TODO (add spy zone here)
        // TODO (add card actions)
        Object.keys(actions).forEach((action, index) => {
          const actionId = action + "_" + cardId;
          dojo.place(
            `<div id="${actionId}" class="pp_card_action pp_card_action_${action}" style="left: ${actions[action].left}px; top: ${actions[action].top}px"></div>`,
            divId
          );
        });
      }
    },

    // Every time a card is moved or placed in court this function will be called to set up zone.
    setupCardSpyZone: function ({ nodeId, cardId }) {
      // Note (Frans): we probably need to remove spies before moving / placing card
      if (this.spies[cardId]) {
        this.spies[cardId].removeAll();
      }

      // ** setup for zone
      this.spies[cardId] = new ebg.zone();
      this.spies[cardId].create(this, nodeId, CYLINDER_WIDTH, CYLINDER_HEIGHT);
      this.spies[cardId].item_margin = 4;
    },

    // Updates weight of item in the stock component for ordering purposes
    updateCard: function ({ location, id, order }) {
      location.changeItemsWeight({ [id]: order });
    },

    //....###..........##....###....##.....##
    //...##.##.........##...##.##....##...##.
    //..##...##........##..##...##....##.##..
    //.##.....##.......##.##.....##....###...
    //.#########.##....##.#########...##.##..
    //.##.....##.##....##.##.....##..##...##.
    //.##.....##..######..##.....##.##.....##

    actionError: function (actionName) {
      this.showMessage(`cannot take ${actionName} action`, "error");
    },

    cardAction: function ({ cardId, cardAction }) {
      // TODO: do we need to add checkAction?
      this.ajaxcall(
        "/paxpamireditiontwo/paxpamireditiontwo/cardAction.html",
        {
          lock: true,
          card_id: cardId,
          card_action: cardAction,
        },
        this,
        function (result) {}
      );
    },

    chooseLoyalty: function ({ coalition }) {
      this.ajaxcall(
        "/paxpamireditiontwo/paxpamireditiontwo/chooseLoyalty.html",
        {
          lock: true,
          coalition,
        },
        this,
        function (result) {}
      );
    },

    discardCards: function ({ cards, fromHand }) {
      // TODO: do we need to add checkAction?
      this.ajaxcall(
        "/paxpamireditiontwo/paxpamireditiontwo/discardCards.html",
        {
          lock: true,
          cards,
          from_hand: fromHand,
        },
        this,
        function (result) {}
      );
    },

    pass: function () {
      if (!this.checkAction("pass")) {
        this.actionError("pass");
        return;
      }
      this.ajaxcall(
        "/paxpamireditiontwo/paxpamireditiontwo/passAction.html",
        {
          lock: true,
        },
        this,
        function (result) {}
      );
    },

    placeRoad: function ({ border }) {
      if (!this.checkAction("placeRoad")) {
        this.actionError("placeRoad");
        return;
      }
      this.ajaxcall(
        "/paxpamireditiontwo/paxpamireditiontwo/placeRoad.html",
        {
          lock: true,
          border,
        },
        this,
        function (result) {}
      );
    },

    placeSpy: function ({ cardId }) {
      this.ajaxcall(
        "/paxpamireditiontwo/paxpamireditiontwo/placeSpy.html",
        {
          lock: true,
          card_id: cardId,
        },
        this,
        function (result) {}
      );
    },

    playCard: function ({ cardId, leftSide }) {
      this.ajaxcall(
        "/paxpamireditiontwo/paxpamireditiontwo/playCard.html",
        {
          lock: true,
          card_id: cardId,
          left_side: leftSide,
        },
        this,
        function (result) {}
      );
    },

    purchaseCard: function ({ cardId }) {
      // TODO: do we need to add checkAction?
      this.ajaxcall(
        "/paxpamireditiontwo/paxpamireditiontwo/purchaseCard.html",
        {
          lock: true,
          card_id: cardId,
        },
        this,
        function (result) {}
      );
    },

    selectGift: function ({ selectedGift }) {
      this.ajaxcall(
        "/paxpamireditiontwo/paxpamireditiontwo/selectGift.html",
        {
          lock: true,
          selected_gift: selectedGift,
        },
        this,
        function (result) {}
      );
    },

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
  });
});
