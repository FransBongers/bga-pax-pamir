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

            // Init global variables
            
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
            this.rupeeWidth = 50;
            this.rupeeHeight = 50;
            this.cylinderWidth = 25;
            this.cylinderHeight = 25;
            this.favoredSuitMarkerWidth = 22;
            this.favoredSuitMarkerHeight = 50;
            this.rulerTokenWidth = 50;
            this.rulerTokenHeight = 50;

            this.defaultWeightZone = 0;
            // NOTE (Frans): probably good idea to get all game specific data from below from the backend
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
            this.marketCards = [];
            this.marketRupees = [];
            // armies per region
            this.armies = {};
            // tribes per region
            this.tribes = {};
            // rulers in region
            this.rulers = {};
            // court per player
            this.court = {};
            // cylinders per player
            this.cylinders = {};
            // events per player
            this.playerEvents = {};
            // active events
            this.activeEvents = new ebg.stock();
            // blocks per coalition (supply)
            this.coalitionBlocks = {};
            // spies on cards
            this.spiesOnCards = {};
            // zones for favored suit marker per suit
            this.favoredSuit = {};
            // vp track zones
            this.vpTrack = {};


            this.playerCounts = {}; // rename to playerTotals?
            this.unavailableCards = [];
            this.handles = []; // contains all onClick handlers

            
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

            // Events
            this.setupCardsStock({
                stock: this.activeEvents,
                nodeId: 'pp_active_events',
                // className: `pp_card_in_court_${playerId}`
            });

            Object.keys(gamedatas.active_events).forEach((key) => {
                this.placeCard({location: this.activeEvents, id: gamedatas.active_events[key].key});
            })

            // Create VP track
            for ( let i = 0; i <= 23; i++ ) {
                this.vpTrack[i] = new ebg.zone();
                this.setupTokenZone({
                    zone: this.vpTrack[i],
                    nodeId: `pp_vp_track_${i}`,
                    tokenWidth: this.cylinderWidth,
                    tokenHeight: this.cylinderHeight,
                });
                this.vpTrack[i].setPattern('ellipticalfit');
            }

            // Setup of all player specific components 
            for( const playerId in gamedatas.players )
            {
                const player = gamedatas.players[playerId];

                // Create player court stock
                this.court[playerId] = new ebg.stock();
                this.setupCardsStock({stock: this.court[playerId], nodeId: `pp_court_player_${playerId}`, className: `pp_card_in_court_${playerId}`});

                // Add court cards played by player to court
                gamedatas.court[playerId].forEach((card) => {
                    this.placeCard({location: this.court[playerId], id: card.key, order: card.state});
                })

                // Create cylinder zone
                this.cylinders[playerId] = new ebg.zone();
                this.setupTokenZone({
                    zone: this.cylinders[playerId],
                    nodeId: `pp_cylinders_player_${playerId}`,
                    tokenWidth: this.cylinderWidth,
                    tokenHeight: this.cylinderHeight,
                    itemMargin: 10,
                });

                // Add cylinders to zone
                Object.keys(gamedatas.cylinders[playerId]).forEach((cylinderId) => {
                    this.placeToken({
                        location: this.cylinders[playerId],
                        id: cylinderId,
                        jstpl: 'jstpl_cylinder',
                        jstplProps: {
                            id: cylinderId,
                            color: gamedatas.players[playerId].color,
                        },
                        weight: this.defaultWeightZone,
                    });
                });

                // Add cylinder to VP track
                this.placeToken({
                    location: this.vpTrack[player.score],
                    id: `vp_cylinder_${playerId}`,
                    jstpl: 'jstpl_cylinder',
                    jstplProps: {
                        id: `vp_cylinder_${playerId}`,
                        color: gamedatas.players[playerId].color,
                    },
                    weight: this.defaultWeightZone,
                });

                // Set up players board
                const player_board_div = $('player_board_'+playerId);
                dojo.place( this.format_block('jstpl_player_board', player ), player_board_div );
                if (player.loyalty !== 'null') {
                    this.updatePlayerLoyalty({playerId, coalition: player.loyalty})
                }

                // Set all values in player panels
                $('influence_'+ playerId).innerHTML = gamedatas.counts[playerId].influence;
                $('cylinder_count_' + playerId).innerHTML = gamedatas.counts[playerId].cylinders;
                $('rupee_count_' + playerId).innerHTML = gamedatas.players[playerId].rupees;
                $('card_count_' + playerId).innerHTML = gamedatas.counts[playerId].cards;

                $('economic_'+ playerId).innerHTML = gamedatas.counts[playerId].suits.economic;
                $('military_'+ playerId).innerHTML = gamedatas.counts[playerId].suits.military;
                $('political_'+ playerId).innerHTML = gamedatas.counts[playerId].suits.political;
                $('intelligence_'+ playerId).innerHTML = gamedatas.counts[playerId].suits.intelligence;
            }

            this.playerCounts = gamedatas.counts;


            // Set up market
            for (let row = 0; row <= 1; row++) {
                this.marketCards[row] = [];
                this.marketRupees[row] = [];
                for (let column = 0; column <= 5; column++) {

                    // Set up stock component for each card in the market
                    const containerId = `pp_market_${row}_${column}`;
                    this.marketCards[row][column] = new ebg.stock();
                    this.setupCardsStock({stock: this.marketCards[row][column], nodeId: containerId, className: 'pp_market_card'});
                    
                    // Set up zone for all rupees in the market
                    const rupeeContainerId = `pp_market_${row}_${column}_rupees`;
                    this.marketRupees[row][column] = new ebg.zone();
                    this.setupTokenZone({
                        zone: this.marketRupees[row][column],
                        nodeId: rupeeContainerId,
                        tokenWidth: this.rupeeWidth,
                        tokenHeight: this.rupeeHeight,
                        itemMargin: -30,
                    });
                    // console.log('rupee zone', this.marketRupees[row][column])
                    

                    // add cards
                    const cardInMarket = gamedatas.market[row][column];
                    if (cardInMarket) {
                        this.placeCard({location: this.marketCards[row][column], id: cardInMarket.key});
                    }
                }
            }

            // Put all rupees in market locations
            Object.keys(this.gamedatas.rupees).forEach((rupeeId) => {
                const rupee = this.gamedatas.rupees[rupeeId];
                if (rupee.location.startsWith('market')) {
                    const row = rupee.location.split('_')[1];
                    const column = rupee.location.split('_')[2];
                    this.placeToken({
                        location: this.marketRupees[row][column],
                        id: rupeeId,
                        jstpl: 'jstpl_rupee',
                        jstplProps: {
                            id: rupeeId,
                        },
                        weight: this.defaultWeightZone,
                    });
                }
            })

            // Setup player hand
            this.setupCardsStock({stock: this.playerHand, nodeId: 'pp_player_hand_cards', className: 'pp_card_in_hand'});
            Object.keys(this.gamedatas.hand).forEach((cardId) => {
                this.placeCard({location: this.playerHand, id: cardId});
            })

            // Create zones for each region
            this.regions.forEach((region, index) => {
                // armies
                this.armies[region] = new ebg.zone();
                this.setupTokenZone({
                    zone: this.armies[region],
                    nodeId: `pp_${region}_armies`,
                    tokenWidth: this.armyWidth,
                    tokenHeight: this.armyHeight,
                    itemMargin: -5,
                });

                // tribes
                this.tribes[region] = new ebg.zone();
                this.setupTokenZone({
                    zone: this.tribes[region],
                    nodeId: `pp_${region}_tribes`,
                    tokenWidth: this.tribeWidth,
                    tokenHeight: this.tribeHeight,
                });

                // Setup ruler tokens
                this.rulers[region] = new ebg.zone();
                this.setupTokenZone({
                    zone: this.rulers[region],
                    nodeId: `pp_position_ruler_token_${region}`,
                    tokenWidth: this.rulerTokenWidth,
                    tokenHeight: this.rulerTokenHeight,
                });
            });

            // Place ruler tokens
            this.regions.forEach((region) => {
                const ruler = this.gamedatas.rulers[region];
                if (ruler == 0) {
                    this.placeToken({
                        location: this.rulers[region],
                        id: `pp_ruler_token_${region}`,
                        jstpl: 'jstpl_ruler_token',
                        jstplProps: {
                            id: `pp_ruler_token_${region}`,
                            region
                        },
                        weight: this.defaultWeightZone,
                    });
                }
            });

            // Create border zones
            this.borders.forEach((border) => {
                this.createBorderZone({border});
            });
            
            // Setup supply of coalition blocks
            this.coalitions.forEach((coalition) => {
                this.coalitionBlocks[coalition] = new ebg.zone();
                this.setupTokenZone({
                    zone: this.coalitionBlocks[coalition],
                    nodeId: `pp_${coalition}_coalition_blocks`,
                    tokenWidth: this.coalitionBlockWidth,
                    tokenHeight: this.coalitionBlockHeight,
                    itemMargin: 15,
                    instantaneous: true,
                });
                Object.keys(this.gamedatas.coalition_blocks[coalition]).forEach((blockId) => {
                    this.placeToken({
                        location: this.coalitionBlocks[coalition],
                        id: blockId,
                        jstpl: 'jstpl_coalition_block',
                        jstplProps: {
                            id: blockId,
                            coalition
                        },
                        weight: this.defaultWeightZone,
                    });
                })

            });

            // Setup zones for favored suit marker
            this.gamedatas.suits.forEach((suit, index) => {
                this.favoredSuit[suit.suit] = new ebg.zone();
                this.setupTokenZone({
                    zone: this.favoredSuit[suit.suit],
                    nodeId: `pp_favored_suit_${suit.suit}`,
                    tokenWidth: this.favoredSuitMarkerWidth,
                    tokenHeight: this.favoredSuitMarkerHeight,
                });
            })

            const suitId = this.gamedatas.favored_suit.suit;
            this.placeToken({
                location: this.favoredSuit[suitId],
                //location: this.favoredSuit['intelligence'], // for testing change of favored suit
                id: `favored_suit_marker`,
                jstpl: 'jstpl_favored_suit_marker',
                jstplProps: {
                    id: `favored_suit_marker`,
                },
                weight: this.defaultWeightZone,
            });
            
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
                case 'playerActions':
                    this.unavailableCards = args.args.unavailable_cards;
                    break;
            
            /* Example:
            
            case 'myGameState':
            
                // Show some HTML block at this game state
                dojo.style( 'my_html_block_id', 'display', 'block' );
                
                break;
           */
           
           
                case 'dummmy':
                    break;
                default:
                    console.log('onEnteringState default')
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
        //// Utility methods - add in alphabetical order

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

        discardCard: function({id, from, order = null}) {

            console.log( 'discardCard' );

            // if (this.card_tokens[id] !== null) 
            //     this.card_tokens[id].removeAll();

            from.removeFromStockById(id, 'pp_discard_pile');

        },

        placeCard: function({location, id, order = null}) {
            // console.log('placeCard', location, id, order);

            if (order != null) {
                location.changeItemsWeight({
                    [id]: order,
                });
            }

            location.addToStockWithId(id, id, 'pp_market_deck');

            this.setupCardSpyZone({location, cardId: id});

            // this.addTooltip( location.getItemDivId(id), id, '' );

        },

        // TODO(Frans): detereming jstpl based on id?
        placeToken: function({location, id, jstpl, jstplProps, weight = 0, classes = []}) {
            dojo.place( this.format_block( jstpl, jstplProps ) , 'pp_tokens' );
            classes.forEach((className) => {
                dojo.addClass( id, className ); 
            })
            location.placeInZone( id, weight );
        },

        // Updates weight of item in the stock component for ordering purposes
        updateCard : function({location, id, order}) {
            location.changeItemsWeight({[id]: order});
        },

        // Function to setup stock components for cards
        setupCardsStock: function( {stock, nodeId, className} ) {
            const useLargeCards = false;
            stock.create( this, $(nodeId), this.cardWidth, this.cardHeight );
            const backgroundSize = useLargeCards ? '17550px 209px' : '17700px';
            stock.image_items_per_row = useLargeCards ? 117 : 118;
            stock.item_margin = 10;
            // TODO: below is option to customize the created div (and add zones to card for example)
            stock.jstpl_stock_item= "<div id=\"${id}\" class=\"stockitem pp_card " + className + "\" \
                style=\"top:${top}px;left:${left}px;width:${width}px;height:${height}px;z-index:${position};background-size:" + backgroundSize + ";\
                background-image:url('${image}');\"><div id=\"${id}_spies\" class=\"pp_spy_zone\"></div></div>";
            
            Object.keys(this.gamedatas.cards).forEach((cardId) => {
                const cardFileLocation = useLargeCards ? g_gamethemeurl + 'img/temp/cards/cards_tileset_original_495_692.jpg' : g_gamethemeurl + 'img/temp/cards_medium/cards_tileset_medium_215_300.jpg';
                stock.addItemType( cardId, 0, cardFileLocation, useLargeCards ? cardId.split('_')[1] -1 : cardId.split('_')[1] );
            });
            stock.extraClasses = `pp_card ${className}`;
        },

        // Function to set up zones for tokens (armies, tribes, cylinders etc.)
        setupTokenZone: function({zone, nodeId, tokenWidth, tokenHeight, itemMargin = null, instantaneous = false}) {
            zone.create(this, nodeId, tokenWidth, tokenHeight);
            if (itemMargin) {
                zone.item_margin = itemMargin;
            };
            zone.instantaneous = instantaneous;
        },

        // Every time a card is move or placed this function will be called to set up zone.
        setupCardSpyZone: function({location, cardId}) {
            // console.log( 'setupCardSpyZone' );

            // Note (Frans): we probably need to remove spies before moving / placing card
            if (this.spiesOnCards[cardId]) {
                this.spiesOnCards[cardId].removeAll();
            }

            var nodeId = location.control_name + '_item_'+ cardId + '_spies';

            // ** setup for zone
            this.spiesOnCards[cardId] = new ebg.zone();
            this.spiesOnCards[cardId].create( this, nodeId, this.cylinderWidth, this.cylinderHeight );
            this.spiesOnCards[cardId].item_margin = 4;
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

        // addRupeeToMarket: function({row, column, number})
        // {
        //     // console.log('player', this.gamedatas.players[ player ]);
        //     dojo.place( this.format_block( 'jstpl_rupee', {
        //         number
        //     } ) , 'rupee' );
            
        //     this.placeOnObject( 'pp_rupee_' + number, `market_${row}_${column}_rupee_zone` );
        //     // this.slideToObject( 'pp_rupee_' + number, 'square_'+x+'_'+y ).play();
        //     // this.placeOnObject( 'pp_card_'+cardNumber, 'overall_player_board_'+player );
        //     // this.slideToObject( 'pp_card_'+cardNumber, 'square_'+x+'_'+y ).play();
        // },

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

        moveCard: function({id, from, to, order = null}) {
            console.log( 'moveCard' );

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
                this.setupCardSpyZone({location: to, cardId: id});                

                // this.addTooltip( to_location.getItemDivId(id), id, '' );
            }

            if (from !== null) {
                from.removeFromStockById(id); 
            }

        },

        moveToken: function({id, to, from, weight = this.defaultWeightZone, addClass = undefined, removeClass = undefined}) {
            console.log('move token');
      
            if (addClass) {
                // node = $( cardId );
                // console.log('node', node);
                dojo.addClass(id, addClass);
            };
            if (removeClass) {
                dojo.removeClass(id, removeClass);
            }
            
            to.placeInZone( id, weight );
            from.removeFromZone(id, false)
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

            if (this.numberOfClicks && this.numberOfClicks == 1) {
                // this.moveToken({id: 'block_afghan_8', from: this.coalitionBlocks['afghan'], to: this.armies[this.kabul], weight: this.defaultWeightZone, addClass: 'pp_army', removeClass: 'pp_coalition_block'})
                // this.moveToken({id: 'block_russian_7', from: this.coalitionBlocks['russian'], to: this[`herat_transcaspia_border`], weight: this.defaultWeightZone, addClass: 'pp_road', removeClass: 'pp_coalition_block'})
                
                // // this.moveToken({id: 'pp_tribe_1', from: this.tribes[this.kabul], to: this.tribes[this.kandahar], weight: this.defaultWeightZone})
    
                // this.moveToken({id: 'cylinder_2371053_9', from: this.cylinders['2371053'], to: this.tribes[this.herat], weight: this.defaultWeightZone});
                // this.moveToken({id: 'favored_suit_marker', from: this.favoredSuit['military'], to: this.favoredSuit['intelligence'], weight: this.defaultWeightZone});
                this.numberOfClicks += 1;
            }

            if (!this.numberOfClicks ) {
            // Temp abuse of button to test movement
            // this.moveToken({id: 'block_afghan_9', from: this.coalitionBlocks['afghan'], to: this.armies[this.kabul], weight: this.defaultWeightZone, addClass: 'pp_army', removeClass: 'pp_coalition_block'})
            // this.moveToken({id: 'block_russian_8', from: this.coalitionBlocks['russian'], to: this[`herat_transcaspia_border`], weight: this.defaultWeightZone, addClass: 'pp_road', removeClass: 'pp_coalition_block'})
            
            // // this.moveToken({id: 'pp_tribe_1', from: this.tribes[this.kabul], to: this.tribes[this.kandahar], weight: this.defaultWeightZone})

            // this.moveToken({id: 'cylinder_2371053_10', from: this.cylinders['2371053'], to: this.tribes[this.kabul], weight: this.defaultWeightZone});
            // this.moveToken({id: 'favored_suit_marker', from: this.favoredSuit['political'], to: this.favoredSuit['military'], weight: this.defaultWeightZone});
            
            // console.log('market_1_5', this.marketCards);
            // console.log('activeEvents', this.activeEvents);
            // this.moveCard({id: 'card_116', from: this.marketCards[1][1], to: this.activeEvents});
            // this.moveCard({id: 'card_111', from: this.marketCards[1][3], to: this.activeEvents});
            // Adjust based on the card in court
            // this.moveToken({id: 'cylinder_2371053_8', from: this.cylinders['2371053'], to: this.spiesOnCards['card_17'], weight: this.defaultWeightZone});
            // this.moveToken({id: 'cylinder_2371053_7', from: this.cylinders['2371053'], to: this.spiesOnCards['card_17'], weight: this.defaultWeightZone});
            // this.moveToken({id: 'cylinder_2371052_8', from: this.cylinders['2371052'], to: this.spiesOnCards['card_17'], weight: this.defaultWeightZone});
            // this.moveToken({id: 'cylinder_2371052_7', from: this.cylinders['2371052'], to: this.spiesOnCards['card_17'], weight: this.defaultWeightZone});
            // this.moveToken({id: 'cylinder_2371052_6', from: this.cylinders['2371052'], to: this.spiesOnCards['card_17'], weight: this.defaultWeightZone});
            // this.moveToken({id: 'cylinder_2371052_5', from: this.cylinders['2371052'], to: this.spiesOnCards['card_17'], weight: this.defaultWeightZone});
            
            this.numberOfClicks = 1;
            }


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

            dojo.subscribe( 'moveArmyFromPool', this, "notif_moveArmyFromPool");

            dojo.subscribe( 'moveCynlinderToTribe', this, "notif_moveCynlinderToTribe");

            dojo.subscribe( 'updateSuit', this, "notif_updateSuit");
            
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

            if (playerId == this.player_id) {
                this.moveCard({id: notif.args.card.key, from: this.playerHand, to: this.court[playerId]});
            } else {
                // TODO (Frans): check why moveCard results in a UI error => probably because other players don't have a playerHand?
                // this.moveCard({id: notif.args.card.key, from: null, to: this.court[playerId]});
                this.placeCard({location: this.court[playerId], id: notif.args.card.key});
            }

            this.court[playerId].updateDisplay();

        },

        notif_purchaseCard: function( notif )
        {
            console.log( 'notif_purchaseCard', notif );

            this.clearLastAction();
            const row = notif.args.market_location.split('_')[1];
            const col = notif.args.market_location.split('_')[2];

            // Remove all rupees that were on the purchased card
            this.marketRupees[row][col].getAllItems().forEach((rupeeId) => {
                this.marketRupees[row][col].removeFromZone( rupeeId, true, `rupees_${notif.args.player_id}` );
            });

            // Move card from markt
            const cardId = notif.args.card.key;
            if (notif.args.new_location == 'active_events') {
                this.moveCard({id: cardId, from: this.marketCards[row][col], to: this.activeEvents});
            } else if (notif.args.player_id == this.player_id) {
                this.moveCard({id: cardId, from: this.marketCards[row][col], to: this.playerHand});
            } else {
                this.moveCard({id: cardId, from: this.marketCards[row][col], to: null});
                this.spiesOnCards[cardId] = undefined;
            }

            // Place paid rupees on market cards
            notif.args.updated_cards.forEach ((item, index) => {
                const marketRow = item.location.split('_')[1];
                const marketColumn = item.location.split('_')[2];
                this.placeToken({
                    location: this.marketRupees[marketRow][marketColumn],
                    id: item.rupee_id,
                    jstpl: 'jstpl_rupee',
                    jstplProps: {
                        id: item.rupee_id,
                    },
                    weight: this.defaultWeightZone,
                });
            }, this);

        },

        notif_refreshMarket: function( notif )
        {
            console.log( 'notif_refreshMarket', notif );

            this.clearLastAction();

            notif.args.card_moves.forEach (
                function (move, index) {
                    const fromRow = move.from.split('_')[1];
                    const fromCol = move.from.split('_')[2];
                    const toRow = move.to.split('_')[1];
                    const toCol = move.to.split('_')[2];
                    this.moveCard({
                        id: move.card_id, 
                        from: this.marketCards[fromRow][fromCol], 
                        to: this.marketCards[toRow][toCol]
                    });
                    // TODO (Frans): check why in case of moving multiple rupees at the same time
                    // they overlap
                    this.marketRupees[fromRow][fromCol].getAllItems().forEach((rupeeId) => {
                        this.moveToken({
                            id: rupeeId,
                            to: this.marketRupees[toRow][toCol],
                            from: this.marketRupees[fromRow][toRow],
                            weight: this.defaultWeightZone,
                        });
                    });
                }, this);

            notif.args.new_cards.forEach (
                function (move, index) {
                    this.placeCard({
                        location: this.marketCards[move.to.split('_')[1]][move.to.split('_')[2]], 
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
                $('cylinder_count_' + playerId).innerHTML = counts[playerId].cylinders;
                $('rupee_count_' + playerId).innerHTML = counts[playerId].rupees;
                $('card_count_' + playerId).innerHTML = counts[playerId].cards;

                $('economic_'+ playerId).innerHTML = counts[playerId].suits.economic;
                $('military_'+ playerId).innerHTML = counts[playerId].suits.military;
                $('political_'+ playerId).innerHTML = counts[playerId].suits.political;
                $('intelligence_'+ playerId).innerHTML = counts[playerId].suits.intelligence;
            }) 
        },

        notif_moveArmyFromPool: function( notif )
        {
            console.log('notif_moveArmyFromPool', notif);

            let coalition = notif.args.coalition;
            let token_number = notif.args.token_number;
            let region = notif.args.region;

            let token_id = 'block_' + coalition + '_' + token_number;

            this.moveToken({id: token_id, from: this.coalitionBlocks[coalition], to: this.armies[this[region]], weight: this.defaultWeightZone});
        },

        notif_moveCynlinderToTribe: function( notif )
        {
            console.log('notif_moveCynlinderToTribe', notif);

            let player_id = notif.args.player_id;
            let token_number = notif.args.token_number;
            let region = notif.args.region;

            let token_id = 'cylinder_' + player_id + '_' + token_number;

            this.moveToken({id: token_id, from: this.cylinders[player_id], to: this.tribes[this[region]], weight: this.defaultWeightZone});
        },

        notif_updateSuit: function( notif )
        {
            console.log('notif_updateSuit', notif);

            let previousSuit = notif.args.previous_suit;
            let newSuit = notif.args.new_suit;
            
            this.moveToken({id: 'favored_suit_marker', from: this.favoredSuit[previousSuit], to: this.favoredSuit[newSuit], weight: this.defaultWeightZone});
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
