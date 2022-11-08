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
            
            // size of tokens
            this.cardWidth = 150;
            this.cardHeight = 209;
            this.armyHeight = 40;
            this.armyWidth = 25;
            this.coalitionBlockHeight = 40;
            this.coalitionBlockWidth = 25;
            this.roadHeight = 27;
            this.roadWidth = 40;
            this.tribeWidth = 25;
            this.tribeHeight = 25;

            // coalitions
            this.afghan = 'afghan';
            this.british = 'british';
            this.russian = 'russian';

            this.coalitions = [
                this.afghan,
                this.british,
                this.russian,
            ]

            // regions
            this.herat = 'herat';
            this.kabul = 'kabul';
            this.kandahar = 'kandahar';
            this.persia = 'persia';
            this.punjab = 'punjab';
            this.transcaspia = 'transcaspia';

            this.regions = [
                this.herat,
                this.kabul,
                this.kandahar,
                this.persia,
                this.punjab,
                this.transcaspia,
            ]

            // borders (for all borders regions are in alphabetical order)

            this.herat_kabul = 'herat_kabul',
            this.herat_kandahar = 'herat_kandahar',
            this.herat_persia = 'herat_persia',
            this.herat_transcaspia = 'herat_transcaspia',
            this.kabul_transcaspia = 'kabul_transcaspia',
            this.kabul_kandahar = 'kabul_kandahar',
            this.kabul_punjab = 'kabul_punjab',
            this.kandahar_punjab = 'kandahar_punjab',
            this.persia_transcaspia = 'persia_transcaspia',

            this.borders = [
                this.herat_kabul,
                this.herat_kandahar,
                this.herat_persia,
                this.herat_transcaspia,
                this.kabul_transcaspia,
                this.kabul_kandahar,
                this.kabul_punjab,
                this.kandahar_punjab,
                this.persia_transcaspia,
            ]
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
            
            // Create court zones
            Object.keys(players).forEach((key, index) => {
                this.createPlayerCourtZone({playerId: players[key].id});
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

            // this.addCardToCourt({playerId: '2371052', cardNumber: 40} )
            // this.addCardToCourt({playerId: '2371052', cardNumber: 41} )
            // this.addCardToCourt({playerId: '2371052', cardNumber: 42} )

            // TODO: Set up your game interface here, according to "gamedatas"

            // Place cards in market
            for (let row = 0; row <= 1; row++) {
                for (let column = 0; column <= 5; column++) {
                    const cardInMarket = gamedatas.market[row][column];
                    if (cardInMarket) {
                        const {location, key} = cardInMarket;
                        this.addCardToMarket({location, card: key});
                    }
                }
            } 

            // Create army zone for each region
            this.regions.forEach((region) => {
                this.createArmyZone({region});
            })

            
            this.addArmyToRegion({id: 1, coalition: this.british, region: this.transcaspia})
            this.addArmyToRegion({id: 2, coalition: this.afghan, region: this.transcaspia})
            this.addArmyToRegion({id: 3, coalition: this.russian, region: this.transcaspia})
            this.addArmyToRegion({id: 5, coalition: this.russian, region: this.transcaspia})
            this.addArmyToRegion({id: 6, coalition: this.russian, region: this.transcaspia})
            this.addArmyToRegion({id: 7, coalition: this.russian, region: this.transcaspia})
            this.addArmyToRegion({id: 8, coalition: this.russian, region: this.kabul})
            this.addArmyToRegion({id: 9, coalition: this.russian, region: this.herat})
            this.addArmyToRegion({id: 10, coalition: this.russian, region: this.kandahar})
            this.addArmyToRegion({id: 11, coalition: this.russian, region: this.persia})
            this.addArmyToRegion({id: 12, coalition: this.russian, region: this.punjab})
            this.addArmyToRegion({id: 13, coalition: this.afghan, region: this.kabul});
            this.addArmyToRegion({id: 14, coalition: this.british, region: this.kabul});

            // Create army zone for each region
            this.regions.forEach((region, index) => {
                this.createTribeZone({region});
                this.addTribeToRegion({id: index, player: 'red', region})
            })

            

            // Create border zones
            this.borders.forEach((border) => {
                this.createBorderZone({border});
            })
            
            this.addRoadToBorder({id: 1, coalition: this.russian, border: this.herat_transcaspia});
            this.addRoadToBorder({id: 2, coalition: this.russian, border: this.herat_transcaspia});
            this.addRoadToBorder({id: 3, coalition: this.british, border: this.herat_kabul});
            this.addRoadToBorder({id: 4, coalition: this.afghan, border: this.herat_kandahar});
            this.addRoadToBorder({id: 5, coalition: this.british, border: this.herat_persia});
            this.addRoadToBorder({id: 6, coalition: this.afghan, border: this.herat_transcaspia});
            this.addRoadToBorder({id: 7, coalition: this.british, border: this.kabul_transcaspia});
            this.addRoadToBorder({id: 8, coalition: this.british, border: this.kabul_kandahar});
            this.addRoadToBorder({id: 9, coalition: this.afghan, border: this.kabul_punjab});
            this.addRoadToBorder({id: 10, coalition: this.afghan, border: this.kandahar_punjab});
            this.addRoadToBorder({id: 11, coalition: this.russian, border: this.persia_transcaspia});

            this.coalitions.forEach((coalition) => {
                this.createCoalitionBlockZone({coalition})
            })

            for (let id = 0; id <= 35; id++) {
                const coalitionId = id % 3;
                const coalitionMap = {
                    0: this.afghan,
                    1: this.british,
                    2: this.russian,
                }
                this.addCoalitionBlockToZone({id, coalition: coalitionMap[coalitionId]});
            }  

            

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
            this[`rupee_zone_${row}_${column}`].image_items_per_row = 1;
            this[`rupee_zone_${row}_${column}`].addItemType( 6, 1, g_gamethemeurl+'img/temp/rupee.png', 0 );
            this[`rupee_zone_${row}_${column}`].setSelectionMode(1);
            this[`rupee_zone_${row}_${column}`].setOverlap(30, 0);
            this[`rupee_zone_${row}_${column}`].extraClasses='pp_rupee';
        },

        createArmyZone: function({region}) 
        {
            this[`${region}_armies`] = new ebg.zone();
            this[`${region}_armies`].create(this, `pp_${region}_armies`, this.armyWidth, this.armyHeight);
            this[`${region}_armies`].item_margin = -5;
            // this['transcaspia_armies'].setPattern( 'horizontalfit' );
        },

        createBorderZone: function({border}) 
        {
            this[`${border}_border`] = new ebg.zone();
            this[`${border}_border`].create(this, `pp_${border}_border`, this.roadWidth, this.roadHeight);
            // this[`${border}_border`].item_margin = -10;
            // this['transcaspia_armies'].setPattern( 'horizontalfit' );

            // TODO (Frans): at some point we need to update this so it looks nice,
            // probably do a lot more custom
            const borderPattern = {
                herat_kabul: 'horizontalfit',
                herat_kandahar: 'verticalfit',
                herat_persia: 'verticalfit',
                herat_transcaspia: 'custom',
                kabul_transcaspia: 'verticalfit',
                kabul_kandahar: 'horizontalfit',
                kabul_punjab: 'verticalfit',
                kandahar_punjab: 'verticalfit',
                persia_transcaspia: 'horizontalfit',
            }

            this[`${border}_border`].setPattern( borderPattern[border] );

            if (border === 'herat_transcaspia') {
                this[`${border}_border`].itemIdToCoords = function( i, control_width, no_idea_what_this_is, numberOfItems ) {
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
            }
        },

        createCoalitionBlockZone: function({coalition}) 
        {
            this[`${coalition}_coalition_blocks`] = new ebg.zone();
            this[`${coalition}_coalition_blocks`].create(this, `pp_${coalition}_coalition_blocks`, this.coalitionBlockWidth, this.coalitionBlockHeight);
            this[`${coalition}_coalition_blocks`].item_margin = 15;
            this[`${coalition}_coalition_blocks`].instantaneous = true;
            // this['transcaspia_armies'].setPattern( 'horizontalfit' );
        },


        createTribeZone: function({region}) 
        {
            this[`${region}_tribes`] = new ebg.zone();
            this[`${region}_tribes`].create(this, `pp_${region}_tribes`, this.tribeWidth, this.tribeHeight);
            // this[`${region}_tribes`].item_margin = -5;
            // this['transcaspia_armies'].setPattern( 'horizontalfit' );
        },

        createPlayerCourtZone: function({playerId}){
            this[`court_player_${playerId}`] = new ebg.zone();
            this[`court_player_${playerId}`].create( this, `pp_court_player_${playerId}`,this.cardWidth, this.cardHeight );
            this[`court_player_${playerId}`].setPattern( 'horizontalfit' );
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

        addCardToCourt: function( {playerId, cardNumber} )
        {
            dojo.place( this.format_block( 'jstpl_card', {
                card: 'card_' + cardNumber,
            } ) , 'cards' );
            dojo.addClass( `pp_card_${cardNumber}`, 'pp_card_in_court' );
            this[`court_player_${playerId}`].placeInZone( `pp_card_${cardNumber}`, 1 );
        },

        addArmyToRegion: function( {id, coalition, region} )
        {
            dojo.place( this.format_block( 'jstpl_army', {
                coalition,
                id,
            } ) , 'cards' ); // Todo: create in which location?
            // dojo.addClass( `pp_card_${cardNumber}`, 'pp_card_in_court' );
            const weight = {
                afghan: 1,
                british: 2,
                russian: 3,
            }
            this[`${region}_armies`].placeInZone( `pp_army_${id}`, weight[coalition] );
        },

        addCoalitionBlockToZone: function( {id, coalition} )
        {
            dojo.place( this.format_block( 'jstpl_coalition_block', {
                coalition,
                id,
            } ) , 'cards' ); // Todo: create in which location?

            this[`${coalition}_coalition_blocks`].placeInZone( `pp_coalition_block_${id}`, 1 );
        },

        addRoadToBorder: function( {id, coalition, border} )
        {
            dojo.place( this.format_block( 'jstpl_road', {
                coalition,
                id,
            } ) , 'cards' ); // Todo: create in which location?
            // dojo.addClass( `pp_card_${cardNumber}`, 'pp_card_in_court' );
            this[`${border}_border`].placeInZone( `pp_road_${id}`, 1 );
        },

        addTribeToRegion: function( {id, player, region} )
        {
            dojo.place( this.format_block( 'jstpl_tribe', {
                player,
                id,
            } ) , 'cards' ); // Todo: create in which location?
            // dojo.addClass( `pp_card_${cardNumber}`, 'pp_card_in_court' );

            this[`${region}_tribes`].placeInZone( `pp_tribe_${id}`, 1 );
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
