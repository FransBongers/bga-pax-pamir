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
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock",
    "ebg/zone"
],
function (dojo, declare) {
    return declare("bgagame.paxpamireditiontwo", ebg.core.gamegui, {
        
        constructor: function(){
            console.log('paxpamireditiontwo constructor');
            // Here, you can init the global variables of your user interface
            // Example:
            // this.myGlobalValue = 0;
            this.cardWidth = 150;
            this.cardHeight = 209;
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
        
        setup: function( gamedatas )
        {
            console.log( "Starting game setup" );
            console.log('gamedatas', gamedatas);
            
            const players = gamedatas.players;
            const numberOfPlayers = gamedatas.playerorder.length;
            console.log('players', players)
            // Setting up player boards
            for( var player_id in gamedatas.players )
            {
                var player = gamedatas.players[player_id];
                // TODO: Setting up players boards if needed
                var player_board_div = $('player_board_'+player_id);
                dojo.place( this.format_block('jstpl_player_board', player ), player_board_div );
            }
            
            // Create player tableaus
            gamedatas.playerorder.forEach((playerId, index) => {
                // if (index === 1) {
                //     this.disablePlayerPanel( playerId )
                // }
                const playerNumber = index + 1;
                
                // set background color of tableay
                const tableau = document.querySelector(`#player_tableau_${playerNumber}`);
                console.log('typeof playerId', typeof playerId);
                const color = players[playerId].color
                tableau.style.backgroundColor = '#' + color;

                const titleDiv = document.getElementById(`pp_tableau_title_player_${playerNumber}`);

                titleDiv.innerHTML = `<span>${players[playerId].name}'s court</span>`;


                // create court zone
                this.createPlayerCourt({numberOfPlayers, playerNumber});
            })

            // Market stocks;
            for (let column = 0; column <= 5; column++) {
                for (let row = 0; row <= 1; row++) {
                    this.createMarketSquareRupeeZone({row, column})
                }   
            }

            this.rupee_zone_1_1.addToStockWithId( 6, 16 );
            this.rupee_zone_0_5.addToStockWithId( 6, 6 );
            this.rupee_zone_0_3.addToStockWithId( 6, 1 );
            this.rupee_zone_0_3.addToStockWithId( 6, 2 );
            this.rupee_zone_0_3.addToStockWithId( 6, 3 );
            this.rupee_zone_0_3.addToStockWithId( 6, 4 );
            this.rupee_zone_0_3.addToStockWithId( 6, 5 );
            this.rupee_zone_0_3.addToStockWithId( 6, 7 );
            this.rupee_zone_0_3.addToStockWithId( 6, 8 );
            this.rupee_zone_0_3.addToStockWithId( 6, 9 );

            // this.addCardToCourt({playerNumber: 1, cardNumber: 40} )
            // this.addCardToCourt({playerNumber: 1, cardNumber: 41} )
            // this.addCardToCourt({playerNumber: 1, cardNumber: 42} )

            // TODO: Set up your game interface here, according to "gamedatas"

            // Place cards in market
            for (let row = 0; row <= 1; row++) {
                for (let column = 0; column <= 5; column++) {
                    const cardInMarket = gamedatas.market[row][column];
                    console.log(`cardInMarket_${row}_${column}`, cardInMarket);
                    if (cardInMarket) {
                        const {location, key} = cardInMarket;
                        this.addCardToMarket({location, card: key});
                    }
                }
            } 

            this.createArmyZone();
            this.addArmyToLocation({id: 1, faction: 'british', location: 'transcaspia'})
            this.addArmyToLocation({id: 2, faction: 'afghan', location: 'transcaspia'})
            this.addArmyToLocation({id: 3, faction: 'russian', location: 'transcaspia'})
            this.addArmyToLocation({id: 5, faction: 'russian', location: 'transcaspia'})
            this.addArmyToLocation({id: 6, faction: 'russian', location: 'transcaspia'})
            this.addArmyToLocation({id: 7, faction: 'russian', location: 'transcaspia'})
            this.addArmyToLocation({id: 8, faction: 'russian', location: 'transcaspia'})
            this.addArmyToLocation({id: 9, faction: 'russian', location: 'transcaspia'})
            this.addArmyToLocation({id: 10, faction: 'russian', location: 'transcaspia'})
            this.addArmyToLocation({id: 11, faction: 'russian', location: 'transcaspia'})
            this.addArmyToLocation({id: 12, faction: 'russian', location: 'transcaspia'})
            // this.addArmyToLocation({id: 13, faction: 'russian', location: 'transcaspia'})
            // this.addArmyToLocation({id: 14, faction: 'russian', location: 'transcaspia'})
            // this.addArmyToLocation({id: 15, faction: 'russian', location: 'transcaspia'})
            // this.addArmyToLocation({id: 16, faction: 'russian', location: 'transcaspia'})

            this.createRoadZone();
            this.addRoadToLocation({id: 1, faction: 'russian', location: 'herat_transcaspia'});
            this.addRoadToLocation({id: 2, faction: 'russian', location: 'herat_transcaspia'});
            // this.addRoadToLocation({id: 3, faction: 'british', location: 'herat_transcaspia'});
            // this.addRoadToLocation({id: 4, faction: 'afghan', location: 'herat_transcaspia'});
            // this.addRoadToLocation({id: 5, faction: 'afghan', location: 'herat_transcaspia'});

            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();

            console.log( "Ending game setup" );
        },
       

        ///////////////////////////////////////////////////
        //// Game & client states
        
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function( stateName, args )
        {
            console.log( 'Entering state: '+stateName );
            
            switch( stateName )
            {
            
            /* Example:
            
            case 'myGameState':
            
                // Show some HTML block at this game state
                dojo.style( 'my_html_block_id', 'display', 'block' );
                
                break;
           */
           
           
            case 'dummmy':
                break;
            }
        },

        // onLeavingState: this method is called each time we are leaving a game state.
        //                 You can use this method to perform some user interface changes at this moment.
        //
        onLeavingState: function( stateName )
        {
            console.log( 'Leaving state: '+stateName );
            
            switch( stateName )
            {
            
            /* Example:
            
            case 'myGameState':
            
                // Hide the HTML block we are displaying only during this game state
                dojo.style( 'my_html_block_id', 'display', 'none' );
                
                break;
           */
           
           
            case 'dummmy':
                break;
            }               
        }, 

        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //        
        onUpdateActionButtons: function( stateName, args )
        {
            console.log( 'onUpdateActionButtons: '+stateName );
                      
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName )
                {
/*               
                 Example:
 
                 case 'myGameState':
                    
                    // Add 3 action buttons in the action status bar:
                    
                    this.addActionButton( 'button_1_id', _('Button 1 label'), 'onMyMethodToCall1' ); 
                    this.addActionButton( 'button_2_id', _('Button 2 label'), 'onMyMethodToCall2' ); 
                    this.addActionButton( 'button_3_id', _('Button 3 label'), 'onMyMethodToCall3' ); 
                    break;
*/
                }
            }
        },        

        ///////////////////////////////////////////////////
        //// Utility methods
        
        createMarketSquareRupeeZone: function({row, column})
        {
            this[`rupee_zone_${row}_${column}`] = new ebg.stock();
            this[`rupee_zone_${row}_${column}`].create( this, $(`market_${row}_${column}_rupee_zone`), 50, 50 );
            // this[`rupee_stock_${row}_${column}`].image_items_per_row = 6;
            // this[`rupee_stock_${row}_${column}`].addItemType( 6, 1, g_gamethemeurl+'img/temp/tokens.png', 5 );
            this[`rupee_zone_${row}_${column}`].image_items_per_row = 1;
            this[`rupee_zone_${row}_${column}`].addItemType( 6, 1, g_gamethemeurl+'img/temp/rupee.png', 0 );
            this[`rupee_zone_${row}_${column}`].setSelectionMode(1);
            // this[`rupee_stock_${row}_${column}`].autowidth = true;
            this[`rupee_zone_${row}_${column}`].setOverlap(30, 0);
            this[`rupee_zone_${row}_${column}`].extraClasses='pp_rupee';
        },

        createArmyZone: function() 
        {
            this['transcaspia_armies'] = new ebg.zone();
            this['transcaspia_armies'].create(this, 'transcaspia_armies', 25, 40);
            this['transcaspia_armies'].item_margin = -5;
            // this['transcaspia_armies'].setPattern( 'horizontalfit' );
        },

        createRoadZone: function() 
        {
            this['herat_transcaspia_roads'] = new ebg.zone();
            this['herat_transcaspia_roads'].create(this, 'herat_transcaspia_roads', 40, 27);
            // this['herat_transcaspia_roads'].item_margin = -10;
            // this['transcaspia_armies'].setPattern( 'horizontalfit' );
            this.herat_transcaspia_roads.setPattern( 'custom' );
            console.log('roads', this['herat_transcaspia_roads'])    
            this['herat_transcaspia_roads'].itemIdToCoords = function( i, control_width, no_idea_what_this_is, numberOfItems ) {
                console.log('numberOfItems', numberOfItems);
                if( i%8==0 && numberOfItems === 1 )
                {   return {  x:50,y:25, w:40, h:27 }; }
                else if( i%8==0)
                {   return {  x:90,y:-5, w:40, h:27 }; }
                else if( i%8==1 )
                {   return {  x:85,y:5, w:40, h:27 }; }
                else if( i%8==2 )
                {   return {  x:70 ,y:17, w:40, h:27 }; }
                else if( i%8==3 )
                {   return {  x:55,y:29, w:40, h:27 }; }
                else if( i%8==4 )
                {   return {  x:40,y:41, w:40, h:27 }; }
                else if( i%8==5 )
                {   return {  x:35,y:43, w:40, h:27 }; }
                else if( i%8==6 )
                {   return {  x:47,y:13, w:40, h:27 }; }
                else if( i%8==7 )
                {   return {  x:10,y:63, w:40, h:27 }; }
            };
        },

        createPlayerCourt: function({numberOfPlayers, playerNumber}){
            console.log('createPlayerCourt', numberOfPlayers, playerNumber)
            this[`court_player_${playerNumber}`] = new ebg.zone();
            this[`court_player_${playerNumber}`].create( this, `pp_court_player_${playerNumber}`,179, 250 );
            this[`court_player_${playerNumber}`].setPattern( 'horizontalfit' );
        },

        addCardToMarket: function( {location, card} )
        {
            // console.log('player', this.gamedatas.players[ player ]);
            dojo.place( this.format_block( 'jstpl_card', {
                card,
            } ) , 'cards' );
            
            this.placeOnObject( 'pp_'+card, location );
            // this.slideToObject( 'pp_card_'+cardNumber, 'square_'+x+'_'+y ).play();
            // this.placeOnObject( 'pp_card_'+cardNumber, 'overall_player_board_'+player );
            // this.slideToObject( 'pp_card_'+cardNumber, 'square_'+x+'_'+y ).play();
        },

        addCardToCourt: function( {playerNumber, cardNumber} )
        {
            dojo.place( this.format_block( 'jstpl_card', {
                card: 'card_' + cardNumber,
            } ) , 'cards' );
            dojo.addClass( `pp_card_${cardNumber}`, 'pp_card_in_court' );
            this[`court_player_${playerNumber}`].placeInZone( `pp_card_${cardNumber}`, 1 );
        },

        addArmyToLocation: function( {id, faction, location} )
        {
            dojo.place( this.format_block( 'jstpl_army', {
                faction,
                id,
            } ) , 'cards' ); // Todo: create in which location?
            // dojo.addClass( `pp_card_${cardNumber}`, 'pp_card_in_court' );
            this[`${location}_armies`].placeInZone( `pp_army_${id}`, 1 );
        },

        addRoadToLocation: function( {id, faction, location} )
        {
            dojo.place( this.format_block( 'jstpl_road', {
                faction,
                id,
            } ) , 'cards' ); // Todo: create in which location?
            // dojo.addClass( `pp_card_${cardNumber}`, 'pp_card_in_court' );
            this[`${location}_roads`].placeInZone( `pp_road_${id}`, 1 );
        },

        addRupeeToMarket: function({row, column, number})
        {
            // console.log('player', this.gamedatas.players[ player ]);
            dojo.place( this.format_block( 'jstpl_rupee', {
                number
            } ) , 'rupee' );
            
            this.placeOnObject( 'pp_rupee_' + number, `market_${row}_${column}_rupee_zone` );
            // this.slideToObject( 'pp_rupee_' + number, 'square_'+x+'_'+y ).play();
            // this.placeOnObject( 'pp_card_'+cardNumber, 'overall_player_board_'+player );
            // this.slideToObject( 'pp_card_'+cardNumber, 'square_'+x+'_'+y ).play();
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

        
        ///////////////////////////////////////////////////
        //// Reaction to cometD notifications

        /*
            setupNotifications:
            
            In this method, you associate each of your game notifications with your local method to handle it.
            
            Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                  your paxpamireditiontwo.game.php file.
        
        */
        setupNotifications: function()
        {
            console.log( 'notifications subscriptions setup' );
            
            // TODO: here, associate your game notifications with local methods
            
            // Example 1: standard notification handling
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            
            // Example 2: standard notification handling + tell the user interface to wait
            //            during 3 seconds after calling the method in order to let the players
            //            see what is happening in the game.
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            // this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
            // 
        },  
        
        // TODO: from this point and below, you can write your game notifications handling methods
        
        /*
        Example:
        
        notif_cardPlayed: function( notif )
        {
            console.log( 'notif_cardPlayed' );
            console.log( notif );
            
            // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
            
            // TODO: play the card in the user interface.
        },    
        
        */
   });             
});
