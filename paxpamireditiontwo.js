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

            // global variables to keep stock components
            this.playerHand = new ebg.stock();
            this.market = [];
            this.court = {};

            this.playerCounts = {}; // rename to playerTotals?
            this.unavailableCards = [];

            // TODO check what there are used for
            this.card_tokens = [];
            this.handles = [];
            
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
            const colors = Object.keys(players).map((key) => players[key].color);
            // console.log('players', players)

            // Setting up player boards
            for( const playerId in gamedatas.players )
            {
                const player = gamedatas.players[playerId];
                this.court[playerId] = new ebg.stock();
                this.setupCardsStock({stock: this.court[playerId], nodeId: `pp_court_player_${playerId}`, className: `pp_card_in_court_${playerId}`});

                gamedatas.court[playerId].forEach((card) => {
                    this.placeCard({location: this.court[playerId], id: card.key, order: card.state});
                })

                // Set up players board
                const player_board_div = $('player_board_'+playerId);
                dojo.place( this.format_block('jstpl_player_board', player ), player_board_div );
                if (player.loyalty !== 'null') {
                    this.updatePlayerLoyalty({playerId, coalition: player.loyalty})
                }

                // apparently this is shorthand notions for accessing divs based on id
                $('influence_'+ playerId).innerHTML = gamedatas.counts[playerId].influence;
                $('token_count_' + playerId).innerHTML = gamedatas.counts[playerId].tokens; // TODO: rename to cylinders / tribes
                $('rupee_count_' + playerId).innerHTML = gamedatas.players[playerId].rupees;
                $('card_count_' + playerId).innerHTML = gamedatas.counts[playerId].cards;

                $('economic_'+ playerId).innerHTML = gamedatas.counts[playerId].suits.economic;
                $('military_'+ playerId).innerHTML = gamedatas.counts[playerId].suits.military;
                $('political_'+ playerId).innerHTML = gamedatas.counts[playerId].suits.political;
                $('intelligence_'+ playerId).innerHTML = gamedatas.counts[playerId].suits.intelligence;

                
            }

            this.playerCounts = gamedatas.counts;


            
            // // Create court zones
            // Object.keys(players).forEach((key, index) => {
            //     this.createPlayerCourtZone({playerId: players[key].id});
            // })

            // Place cards in market
            for (let row = 0; row <= 1; row++) {
                this.market[row] = [];
                for (let column = 0; column <= 5; column++) {

                    // Set up stock component for each square in the market
                    const containerId = `pp_market_${row}_${column}`;
                    this.market[row][column] = new ebg.stock();
                    this.setupCardsStock({stock: this.market[row][column], nodeId: containerId, className: 'pp_market_card'});
                    
                    // add cards
                    const cardInMarket = gamedatas.market[row][column];
                    if (cardInMarket) {
                        // this.addCardToMarket({location, card: key});
                        this.placeCard({location: this.market[row][column], id: cardInMarket.key});
                    }
                }
            } 

            this.setupCardsStock({stock: this.playerHand, nodeId: 'pp_player_hand_cards', className: 'pp_card_in_hand'});

            Object.keys(this.gamedatas.hand).forEach((cardId) => {
                console.log('cardId', cardId, typeof cardId)
                this.placeCard({location: this.playerHand, id: cardId});
            })

            // this.market[0][1].addToStockWithId( , 1 );
            // Market stocks;
            for (let column = 0; column <= 5; column++) {
                for (let row = 0; row <= 1; row++) {
                    this.createMarketSquareRupeeZone({row, column})
                }   
            }

            // this.rupee_zone_1_1.addToStockWithId( 6, 16 );
            // this.rupee_zone_0_5.addToStockWithId( 6, 6 );
            // this.rupee_zone_0_3.addToStockWithId( 6, 1 );
            // this.rupee_zone_0_3.addToStockWithId( 6, 2 );
            // this.rupee_zone_0_3.addToStockWithId( 6, 3 );
            // this.rupee_zone_0_3.addToStockWithId( 6, 4 );
            // this.rupee_zone_0_3.addToStockWithId( 6, 5 );
            // this.rupee_zone_0_3.addToStockWithId( 6, 7 );
            // this.rupee_zone_0_3.addToStockWithId( 6, 8 );
            // this.rupee_zone_0_3.addToStockWithId( 6, 9 );

            // this.addCardToCourt({playerId: '2371052', cardNumber: 40} )
            // this.addCardToCourt({playerId: '2371052', cardNumber: 41} )
            // this.addCardToCourt({playerId: '2371052', cardNumber: 42} )

            // TODO: Set up your game interface here, according to "gamedatas"



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
                const color = colors[index % numberOfPlayers]
                this.addTribeToRegion({id: index, playerColor: color, region})
            })

            // this.addTribeToRegion({id: 1, playerColor: colors[0], region: this.kabul});

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
                    case 'setup':
                        this.addActionButton( 'afghan_button', _('Afghan'), 'onAfghan', null, false, 'blue' );
                        this.addActionButton( 'russian_button', _('Russian'), 'onRussian', null, false, 'blue' );
                        this.addActionButton( 'british_button', _('British'), 'onBritish', null, false, 'blue' );
                        break;

                    case 'playerActions':
                        var main = $('pagemaintitletext');
                        if (args.remaining_actions > 0) {
                            main.innerHTML += _(' may take ') + '<span id="remaining_actions_value" style="font-weight:bold;color:#ED0023;">' 
                                + args.remaining_actions + '</span>' + _(' action(s): ');
                            this.addActionButton( 'purchase_btn', _('Purchase'), 'onPurchase' );
                            this.addActionButton( 'play_btn', _('Play'), 'onPlay' );
                            this.addActionButton( 'card_action_btn', _('Card Action'), 'onCardAction' );
                            this.addActionButton( 'pass_btn', _('End Turn'), 'onPass', null, false, 'gray' ); 
                        } else {
                            main.innerHTML += _(' have ') + '<span id="remaining_actions_value" style="font-weight:bold;color:#ED0023;">' 
                            + args.remaining_actions + '</span>' + _(' remaining actions: ');

                            this.addActionButton( 'pass_btn', _('End Turn'), 'onPass', null, false, 'blue' );
                        }
                        break;

                    // case 'negotiateBribe':
                    //     for ( var i = 0; i <= args.briber_max; i++ ) {
                    //         this.addActionButton( i+'_btn', $i, 'onBribe', null, false, 'blue' );
                    //     }
                    //     break;

                    case 'discardCourt':
                        this.numberOfDiscards = Object.keys(args.court).length - args.suits.political - 3;
                        if (this.numberOfDiscards > 1) var cardmsg = _(' court cards '); else cardmsg = _(' court card');
                        $('pagemaintitletext').innerHTML += '<span id="remaining_actions_value" style="font-weight:bold;color:#ED0023;">' 
                                + this.numberOfDiscards + '</span>' + cardmsg;
                        this.selectedAction = 'discard_court';
                        this.updateSelectableCards();
                        this.addActionButton( 'confirm_btn', _('Confirm'), 'onConfirm', null, false, 'blue' );
                        dojo.addClass('confirm_btn', 'pp_disabled');
                        break;

                    case 'discardHand':
                        this.numberOfDiscards = Object.keys(args.hand).length - args.suits.intelligence - 2;
                        if (this.numberOfDiscards > 1) var cardmsg = _(' hand cards '); else cardmsg = _(' hand card');
                        $('pagemaintitletext').innerHTML += '<span id="remaining_actions_value" style="font-weight:bold;color:#ED0023;">' 
                        + this.numberOfDiscards + '</span>' + cardmsg;
                        this.selectedAction = 'discard_hand';
                        this.updateSelectableCards();
                        this.addActionButton( 'confirm_btn', _('Confirm'), 'onConfirm', null, false, 'blue' );
                        dojo.addClass('confirm_btn', 'pp_disabled');
                        break;

                    case 'client_confirmPurchase':
                        this.addActionButton( 'confirm_btn', _('Confirm'), 'onConfirm', null, false, 'blue' );
                        this.addActionButton( 'cancel_btn', _('Cancel'), 'onCancel', null, false, 'red' );
                        break;

                    case 'client_confirmPlay':
                        this.addActionButton( 'left_side_btn', _('<< LEFT'), 'onLeft', null, false, 'blue' );
                        this.addActionButton( 'right_side_btn', _('RIGHT >>'), 'onRight', null, false, 'blue' );
                        this.addActionButton( 'cancel_btn', _('Cancel'), 'onCancel', null, false, 'red' );
                        break;

                    // case 'client_endTurn':
                    //     this.addActionButton( 'confirm_btn', _('Confirm'), 'onConfirm', null, false, 'red' );
                    //     this.addActionButton( 'cancel_btn', _('Cancel'), 'onCancel', null, false, 'gray' );
                    //     break;

                    // case 'client_selectPurchase':
                    // case 'client_selectPlay':
                    //     this.addActionButton( 'cancel_btn', _('Cancel'), 'onCancel', null, false, 'red' );
                    //     break;

                    // case 'client_confirmDiscard':
                    //     this.addActionButton( 'confirm_btn', _('Confirm'), 'onConfirm', null, false, 'blue' );
                    //     this.addActionButton( 'cancel_btn', _('Cancel'), 'onCancel', null, false, 'red' );
                    //     break;

                    default:
                        console.log('default')
                        break;
                }
            }
        },     
     

        ///////////////////////////////////////////////////
        //// Utility methods

        addCardToken : function(location, card_id, token_id) {
            console.log( 'addCardToken', location, card_id, token_id );
            // var node_id = location.control_name + '_item_'+ card_id + '_tokens';

            // var card_tokens_list = this.card_tokens[card_id].getAllItems();

            // if (!card_tokens_list.includes(token_id)) {
            //     dojo.place(this.format_block('jstpl_coin', {
            //         id : token_id,
            //     }), node_id);
            //     this.card_tokens[card_id].placeInZone(token_id);
            //     this.addTooltip( token_id, token_id, '' );
            // }

        },

        clearLastAction : function( )
        {
            console.log( 'clearLastAction, handles = ' + this.handles.length );

            // TODO (Frans): add what is needed
            // Remove current possible moves
            // dojo.query( '.possibleMove' ).removeClass( 'possibleMove' );
            // dojo.query( '.otherPlayer' ).removeClass( 'otherPlayer' );
            dojo.query( '.pp_selectable_card' ).removeClass( 'pp_selectable_card' );
            // dojo.query( '.possiblePlayer' ).removeClass( 'possiblePlayer' );
            // dojo.query( '.possiblePawn' ).removeClass( 'possiblePawn' );
            dojo.query( '.pp_selected' ).removeClass( 'pp_selected' );
            // dojo.query( '.selectedPawn' ).removeClass( 'selectedPawn' );
            // dojo.query( '.fadeTile' ).removeClass( 'fadeTile' );

            dojo.forEach(this.handles, dojo.disconnect);
            this.handles = [];

        },

        discardCard : function({id, from, order = null}) {

            console.log( 'discardCard' );

            // if (this.card_tokens[id] !== null) 
            //     this.card_tokens[id].removeAll();

            from.removeFromStockById(id, 'pp_discard_pile');

        },

        placeCard : function({location, id, order = null}) {
            console.log('placeCard');

            if (order != null) {
                location.changeItemsWeight({
                    [id]: order,
                });
            }

            location.addToStockWithId(id, id, 'pp_market_deck');

            // this.placeCardTokens(location, id);
                        
            // this.addTooltip( location.getItemDivId(id), id, '' );

        },

        // Updates weight of item in the stock component for ordering purposes
        updateCard : function({location, id, order}) {
            location.changeItemsWeight({[id]: order});
        },

        // Function to implement functionality for card stock components
        setupCardsStock: function( {stock, nodeId, className} ) {
            const useLargeCards = false;
            stock.create( this, $(nodeId), this.cardWidth, this.cardHeight );
            stock.backgroundSize = useLargeCards ? '17550px 209px' : '17700px';
            stock.image_items_per_row = useLargeCards ? 117 : 118;
            stock.item_margin = 10;
            // TODO: below is option to customize the created div (and add zones to card for example)
            // stock.jstpl_stock_item= "<div id=\"${id}\" class=\"stockitem pp_card " + className + "\" \
            //     style=\"top:${top}px;left:${left}px;width:${width}px;height:${height}px;z-index:${position};\
            //     background-image:url('${image}');\"><div id=\"${id}_tokens\" class=\"card_token_area\"></div></div>";
            
            this.gamedatas.cards.forEach((card) => {
                const cardFileLocation = useLargeCards ? g_gamethemeurl + 'img/temp/cards/cards_tileset_original_495_692.jpg' : g_gamethemeurl + 'img/temp/cards_medium/cards_tileset_medium_215_300.jpg';
                stock.addItemType( card, 0, cardFileLocation, useLargeCards ? card.split('_')[1] -1 : card.split('_')[1] );
            });
            stock.extraClasses = `pp_card ${className}`;
        },
        

        createMarketSquareRupeeZone: function({row, column})
        {
            this[`rupee_zone_${row}_${column}`] = new ebg.stock();
            this[`rupee_zone_${row}_${column}`].create( this, $(`pp_market_${row}_${column}_rupees`), 50, 50 );
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
            dojo.addClass( `pp_${card}`, 'pp_market_card' );
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

        addTribeToRegion: function( {id, playerColor, region} )
        {
            dojo.place( this.format_block( 'jstpl_tribe', {
                color: playerColor,
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

        updatePlayerLoyalty: function({playerId, coalition})
        {
            dojo.query( `#loyalty_icon_${playerId}` )
                .removeClass( 'pp_loyalty_afghan' )
                .removeClass('pp_loyalty_british')
                .removeClass('pp_loyalty_russian')
                .addClass(`pp_loyalty_${coalition}`);
        },

        updateSelectableCards: function() {
            console.log('updateSelectableCards', this.selectedAction);
            this.clearLastAction();

            switch (this.selectedAction) {
                case 'purchase':
                    dojo.query('.pp_market_card').forEach(
                        (node) => {
                            const cost = node.id.split('_')[3]; // cost is equal to the column number
                            const cardId = node.id.split('_')[6];
                            if ((cost <= this.playerCounts[this.player_id].rupees) && (! this.unavailableCards.includes('card_'+cardId) )) {
                                dojo.addClass(node, 'pp_selectable_card');
                                this.handles.push(dojo.connect(node,'onclick', this, 'onCard'));
                            }
                        }, this);
                    break;
                case 'play':
                case 'discard_hand':
                    dojo.query('.pp_card_in_hand').forEach(
                        function (node, index) {
                            dojo.addClass(node, 'pp_selectable_card');
                            this.handles.push(dojo.connect(node,'onclick', this, 'onCard'));
                        }, this);
                    break;
                case 'discard_court':
                    dojo.query(`.pp_card_in_court_${this.player_id}`).forEach(
                        function (node, index) {
                            console.log('node in for each', node)
                            dojo.addClass(node, 'pp_selectable_card');
                            this.handles.push(dojo.connect(node,'onclick', this, 'onCard'));
                        }, this);
                    break;
                // case 'card_action':
                //     break;
                default:
                    break;
            }

        },

        moveCard : function({id, from, to, order = null}) {
            console.log( 'moveCard' );
            // console.log( 'moveCard', id, 'from', from, 'to', to, 'order', order );
            // var card_tokens_list = this.card_tokens[id].getAllItems();

            let fromDiv = null;
            if (from !== null) {
                fromDiv = from.getItemDivId(id);
            }
            if (to !== null) {
                if (order != null) {
                    to.changeItemsWeight({ id: order });
                }
                // const nodeId = to.control_name + '_item_'+ id + '_tokens';
                to.addToStockWithId(id, id, fromDiv);

                // this.card_tokens[id] = new ebg.zone();
                // this.card_tokens[id].create( this, node_id, this.tokenwidth, this.tokenheight );
                // this.card_tokens[id].setPattern('ellipticalfit');
                // this.card_tokens[id].item_margin = 2;

                // card_tokens_list.forEach (
                //     function (token_id, index) { 
                //         dojo.place(this.format_block('jstpl_coin', {
                //             id : token_id,
                //         }), node_id);
                //         this.card_tokens[id].placeInZone(token_id);
                //         this.addTooltip( token_id, token_id, '' );
                // }, this);
                // this.addTooltip( to_location.getItemDivId(id), id, '' );
            }

            if (from !== null) {
                from.removeFromStockById(id); 
            }

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

        onPurchase: function()
        {
            // Test with moving cards
            // this.playerHand.addToStockWithId('card_12', 'card_12', 'pp_market_0_1_item_card_12');
            // this.market[0][1].removeFromStockById('card_12')
            // this.playerHand.addToStockWithId('card_73', 'card_73', 'pp_market_0_0_item_card_73');
            // this.market[0][0].removeFromStockById('card_73');

            if (! this.checkAction('purchase'))
            return;

            if( this.isCurrentPlayerActive() )
            {       
                console.log( 'onPurchase' );
                this.selectedAction = 'purchase';
                this.updateSelectableCards();
                this.setClientState("client_selectPurchase", { descriptionmyturn : _( "${you} must select a card to purchase") });
            }
        }, 
        
        onPlay: function()
        {
            if (! this.checkAction('play'))
            return;

            if( this.isCurrentPlayerActive() )
            {       
                console.log( 'onPlay' );
                this.selectedAction = 'play';
                this.updateSelectableCards();
                this.setClientState("client_selectPlay", { descriptionmyturn : _( "${you} must select a card to play") });
            }
        }, 

        onCardAction: function()
        {
            if (! this.checkAction('card_action'))
            return;

            if( this.isCurrentPlayerActive() )
            {       
                console.log( 'onCardAction' );
                this.selectedAction = 'card_action';
                // this.ajaxcall( "/forbiddenisland/forbiddenisland/captureTreasure.html", {
                    // lock: true,
                // }, this, function( result ) {} );
            }
        }, 

        onPass: function()
        {
            if (! this.checkAction('pass'))
            return;

            if( this.isCurrentPlayerActive() )
            {       
                console.log( 'onPass' );
                this.selectedAction = 'pass';
                if (this.remaining_actions == 0) {
                    this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/passAction.html", {
                        lock: true
                    }, this, function( result ) {} );
                } else {
                    this.setClientState("client_endTurn", { descriptionmyturn : _( "Confirm to your end turn ") });
                }
            }
        }, 

        onCard: function( evt )
        {
            const cardId = evt.currentTarget.id;

            dojo.stopEvent( evt );
            console.log( 'onCard ' + cardId );

            this.selectedCard = cardId;
            let node;
            if( this.isCurrentPlayerActive() )
            {   
                switch (this.selectedAction) {
                    case 'purchase':    
                        this.clearLastAction();
                        node = $( cardId );
                        console.log('node', node);
                        dojo.addClass(node, 'pp_selected');
                        const cost = cardId.split('_')[3];
                        console.log('cost', cost)
                        this.setClientState("client_confirmPurchase", { descriptionmyturn : "Purchase this card for "+cost+" rupees?"});
                        break;

                    case 'play':    
                        this.clearLastAction();
                        node = $( cardId );
                        dojo.addClass(node, 'pp_selected');
                        const card_id = 'card_' + this.selectedCard.split('_')[6];
                        this.setClientState("client_confirmPlay", { descriptionmyturn : "Select which side of court to play card:"});
                        break;
                    
                    case 'discard_hand':
                    case 'discard_court':
                        node = $( cardId );
                        dojo.toggleClass(node, 'pp_selected');
                        dojo.toggleClass(node, 'pp_discard');
                        if (dojo.query('.pp_selected').length == this.numberOfDiscards) {
                            dojo.removeClass('confirm_btn', 'pp_disabled');
                        } else {
                            dojo.addClass('confirm_btn', 'pp_disabled');
                        }
                        break;

                    default:
                        break;
                }
            }
        }, 

        onCancel: function()
        {
            console.log( 'onCancel' );
            this.clearLastAction();
            this.selectedAction = '';
            this.restoreServerGameState();
        }, 

        onConfirm: function()
        {
            console.log( 'onConfirm' );

            switch (this.selectedAction) {
                case 'purchase':
                    var cardId = 'card_' + this.selectedCard.split('_')[6];
                    console.log('cardIdConfirm', cardId)
                    this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/purchaseCard.html", { 
                        lock: true,
                        card_id: cardId,
                    }, this, function( result ) {} );  
                    break;
                    
                // case 'pass':
                //     this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/passAction.html", { 
                //         lock: true,
                //     }, this, function( result ) {} ); 
                //     break;

                case 'discard_hand':
                case 'discard_court':
                    let cards = '';
                    dojo.query('.pp_selected').forEach(
                        function (item, index) {
                            cards += ' card_' + item.id.split('_')[6];
                        }, this);
                    this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/discardCards.html", { 
                        lock: true,
                        cards: cards,
                        from_hand: (this.selectedAction == 'discard_hand')
                    }, this, function( result ) {} ); 
                    break;

                default:
                    break;
            }

        }, 

        onLeft: function()
        {
            console.log( 'onLeft' );

            switch (this.selectedAction) {
                case 'play':    
                    this.clearLastAction();
                    // var node = $( card_id );
                    // dojo.addClass(node, 'selected');
                    var card_id = 'card_' + this.selectedCard.split('_')[6];
                    console.log('cardId', card_id);
                    this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/playCard.html", { 
                        lock: true,
                        card_id: card_id,
                        left_side: true,
                    }, this, function( result ) {} );  
                    break;

                default:
                    break;
            }

        }, 

        onRight: function()
        {
            console.log( 'onRight' );

            switch (this.selectedAction) {
                case 'play':    
                    this.clearLastAction();
                    // var node = $( card_id );
                    // dojo.addClass(node, 'selected');
                    var card_id = 'card_' + this.selectedCard.split('_')[6];
                    console.log('cardId', card_id);
                    this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/playCard.html", { 
                        lock: true,
                        card_id: card_id,
                        left_side: false,
                    }, this, function( result ) {} );  
                    break;

                default:
                    break;
            }

        },

        // onBribe: function()
        // {
        //     var btn_id = evt.currentTarget.id;
        //     console.log( 'onBribe' );

        //     var bribe_amount = btn_id.split('_')[1];

        //     this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/setBribe.html", { 
        //         lock: true,
        //         bribe_amount: bribe_amount,
        //         player_id: this.player_id,
        //     }, this, function( result ) {} );  

        // },

        onAfghan: function()
        {
            console.log( 'onAfghan' );

            this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/chooseLoyalty.html", { 
                lock: true,
                coalition: 'afghan',
            }, this, function( result ) {} );  

        },

        onRussian: function()
        {
            console.log( 'onRussian' );

            this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/chooseLoyalty.html", { 
                lock: true,
                coalition: 'russian',
            }, this, function( result ) {} );  

        },

        onBritish: function()
        {
            console.log( 'onBritish' );

            this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/chooseLoyalty.html", { 
                lock: true,
                coalition: 'british',
            }, this, function( result ) {} );  

        },
        
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

            dojo.subscribe( 'chooseLoyalty', this, "notif_chooseLoyalty" );

            dojo.subscribe( 'purchaseCard', this, "notif_purchaseCard" );
            this.notifqueue.setSynchronous( 'purchaseCard', 2000 );

            dojo.subscribe( 'playCard', this, "notif_playCard" );
            this.notifqueue.setSynchronous( 'playCard', 2000 );

            dojo.subscribe( 'discardCard', this, "notif_discardCard" );
            this.notifqueue.setSynchronous( 'discardCard', 500 );

            dojo.subscribe( 'refreshMarket', this, "notif_refreshMarket" );
            this.notifqueue.setSynchronous( 'refreshMarket', 500 );
            
            dojo.subscribe( 'updatePlayerCounts', this, "notif_updatePlayerCounts");
            dojo.subscribe( 'log', this, "notif_log");
            
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

        notif_chooseLoyalty: function( notif ) {
            console.log( 'notif_chooseLoyalty' );
            console.log( notif );

            const coalition = notif.args.coalition;
            const playerId = notif.args.player_id;

            this.updatePlayerLoyalty({playerId, coalition})

            // TODO (Frans): edit if we want to show the loyalty wheel somewhere
            // var x = this.gamedatas.loyalty[loyalty].icon * 44;
            // dojo.place(this.format_block('jstpl_loyalty_icon', {
            //     id: player_id,
            //     x: x
            // }), 'loyalty_icon_' + player_id, 'replace');
            // dojo.query('#loyalty_wheel_' + player_id + ' .wheel').removeClass();
            // dojo.addClass('loyalty_wheel_' + player_id, 'wheel ' + loyalty);

        },


        notif_discardCard: function( notif )
        {
            console.log( 'notif_discardCard', notif );

            this.clearLastAction();
            const playerId = notif.args.player_id;

            if (notif.args.from == 'hand') {
                // TODO (Frans): check how this works for other players than the one whos card gets discarded
                this.discardCard({id: notif.args.card_id, from: this.playerHand});

            } else {

                this.discardCard({id: notif.args.card_id, from: this.court[playerId]});

                notif.args.court_cards.forEach (
                    function (card, index) {
                        this.updateCard({
                            location: this.court[playerId], 
                            id: card.key,
                            order: card.state });
                    }, this);
    
                // TODO (Frans): check removing tokens from cards
                // if (this.card_tokens[notif.args.card_id] !== null) 
                //     this.card_tokens[notif.args.card_id].removeAll();

            }

            // notif.args.court_cards.forEach (
            //     function (card, index) {
            //         this.updateCard(
            //             this.court[player_id], 
            //             card.key,
            //             card.state );
            //     }, this);

            // this.card_tokens[notif.args.card.key].removeAll();

            // this.court[player_id].updateDisplay();

        },


        notif_playCard: function( notif )
        {
            console.log( 'notif_playCard', notif );

            this.clearLastAction();
            var playerId = notif.args.player_id;

            notif.args.court_cards.forEach (
                function (card, index) {
                    this.updateCard({
                        location: this.court[playerId], 
                        id: card.key,
                        order: card.state });
                }, this);

            // // this.card_tokens[notif.args.card.key].removeAll();
            // if (this.card_tokens[notif.args.card.key] !== null) 
            //     this.card_tokens[notif.args.card.key].removeAll();

            if (playerId == this.player_id) {
                this.moveCard({id: notif.args.card.key, from: this.playerHand, to: this.court[playerId]});
            } else {
                // TODO (Frans): check why moveCard results in a UI error
                // this.moveCard({id: notif.args.card.key, from: null, to: this.court[playerId]});
                this.placeCard({location: this.court[playerId], id: notif.args.card.key});
            }

            this.court[playerId].updateDisplay();

        },

        notif_purchaseCard: function( notif )
        {
            console.log( 'notif_purchaseCard' );
            console.log( notif );

            this.clearLastAction();
            const row = notif.args.market_location.split('_')[1];
            const col = notif.args.market_location.split('_')[2];

            // TODO (Frans): implement card tokens
            // this.card_tokens[notif.args.card.key].removeAll();

            if (notif.args.player_id == this.player_id) {
                this.moveCard({id: notif.args.card.key, from: this.market[row][col], to: this.playerHand});
            } else {
                this.moveCard({id: notif.args.card.key, from: this.market[row][col], to: null});
            }

            // Add coings to market
            // notif.args.updated_cards.forEach (
            //     function (item, index) { this.addCardToken( 
            //         this.market[item.location.split('_')[1]][item.location.split('_')[2]],
            //         item.card_id, 
            //         item.coin_id 
            //     ); 
            // }, this);

        },

        notif_refreshMarket: function( notif )
        {
            console.log( 'notif_refreshMarket', notif );

            this.clearLastAction();

            notif.args.card_moves.forEach (
                function (move, index) {
                    this.moveCard({
                        id: move.card_id, 
                        from: this.market[move.from.split('_')[1]][move.from.split('_')[2]], 
                        to: this.market[move.to.split('_')[1]][move.to.split('_')[2]]
                });
                }, this);

            notif.args.new_cards.forEach (
                function (move, index) {
                    this.placeCard({
                        location: this.market[move.to.split('_')[1]][move.to.split('_')[2]], 
                        id: move.card_id });
                }, this);

        },

        notif_updatePlayerCounts: function( notif )
        {
            console.log('notif_updatePlayerCounts', notif)
            this.playerCounts = notif.args.counts;
            const counts = notif.args.counts;

            Object.keys(counts).forEach((playerId) => {
                $('influence_'+ playerId).innerHTML = counts[playerId].influence;
                $('token_count_' + playerId).innerHTML = counts[playerId].tokens;
                $('rupee_count_' + playerId).innerHTML = counts[playerId].rupees;
                $('card_count_' + playerId).innerHTML = counts[playerId].cards;

                $('economic_'+ playerId).innerHTML = counts[playerId].suits.economic;
                $('military_'+ playerId).innerHTML = counts[playerId].suits.military;
                $('political_'+ playerId).innerHTML = counts[playerId].suits.political;
                $('intelligence_'+ playerId).innerHTML = counts[playerId].suits.intelligence;
            }) 
        },

        notif_log : function(notif) {
            // this is for debugging php side
            console.log('notif_log', notif)
            console.log(notif.log);
            console.log(notif.args);
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
