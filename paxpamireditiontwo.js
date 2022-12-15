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
    "ebg/zone",
    g_gamethemeurl + "modules/js/NotificationManager.js",
    g_gamethemeurl + "modules/js/PlayerManager.js",
    g_gamethemeurl + "modules/js/Utils.js",
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
            this.cylinderWidth = 30;
            this.cylinderHeight = 30;
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
            // roads per border
            this.roads = {};
            // tribes per region
            this.tribes = {};
            // rulers in region
            this.rulers = {};
            // court per player
            this.court = {};
            // cylinders per player
            this.cylinders = {};
            // gifts per player / value
            this.gifts = {};
            // events per player
            this.playerEvents = {};
            // active events
            this.activeEvents = new ebg.stock();
            // blocks per coalition (supply)
            this.coalitionBlocks = {};
            // spies per cards
            this.spies = {};
            // zones for favored suit marker per suit
            this.favoredSuit = {};
            // vp track zones
            this.vpTrack = {};


            this.playerCounts = {}; // rename to playerTotals?
            // Will store all data for active player and gets refreshed with entering player actions state
            this.activePlayer = {};
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
            console.log('gamedatas', gamedatas);
            this.playerManager = new PlayerManager(this);

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

                this.gifts[playerId] = {};
                // Set up gift zones
                ['2', '4', '6'].forEach((value) => {
                    this.gifts[playerId][value] = new ebg.zone();
                    this.setupTokenZone({
                        zone: this.gifts[playerId][value],
                        nodeId: `pp_gift_${value}_zone_${playerId}`,
                        tokenWidth: 40,
                        tokenHeight: 40,
                        // itemMargin: 10,
                        pattern: 'custom',
                        customPattern: () => {
                            return {x: 5, y:5, w: 30, h: 30}
                        }
                    });
                });

                // Add gifts to zones
                const playerGifts = gamedatas.gifts[playerId]
                Object.keys(playerGifts).forEach((giftValue) => {
                    Object.keys(playerGifts[giftValue]).forEach((cylinderId) => {
                        this.placeToken({
                            location: this.gifts[playerId][giftValue],
                            id: cylinderId,
                            jstpl: 'jstpl_cylinder',
                            jstplProps: {
                                id: cylinderId,
                                color: gamedatas.players[playerId].color,
                            },
                            weight: this.defaultWeightZone,
                        });
                    });
                })
                

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
            });

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

            // Place armies and tribes
            this.regions.forEach((region) => {
                // armies
                Object.keys(this.gamedatas.armies[region]).forEach((id) => {
                    this.placeToken({
                        location: this.armies[region],
                        id,
                        jstpl: 'jstpl_army',
                        jstplProps: {
                            id,
                            coalition: id.split('_')[1],
                        },
                        weight: this.defaultWeightZone,
                    });
                });

                // tribes
                Object.keys(this.gamedatas.tribes[region]).forEach((id) => {
                    this.placeToken({
                        location: this.tribes[region],
                        id,
                        jstpl: 'jstpl_cylinder',
                        jstplProps: {
                            id,
                            color: gamedatas.players[id.split('_')[1]].color,
                        },
                    });
                });
            });

            // Create zones for roads
            this.borders.forEach((border) => {
                this.roads[border] = new ebg.zone();
                this.createBorderZone({border, zone: this.roads[border]});

                Object.keys(this.gamedatas.roads[border]).forEach((id) => {
                    this.placeToken({
                        location: this.roads[border],
                        id,
                        jstpl: 'jstpl_road',
                        jstplProps: {
                            id,
                            coalition: id.split('_')[1],
                        },
                        weight: this.defaultWeightZone,
                    });
                });
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

            // Place spies on cards
            Object.keys(gamedatas.spies || {}).forEach((cardId) => {
                Object.keys(gamedatas.spies[cardId]).forEach((cylinderId) => {
                    const playerId = cylinderId.split('_')[1];
                    this.placeToken({
                        location: this.spies[cardId],
                        id: cylinderId,
                        jstpl: 'jstpl_cylinder',
                        jstplProps: {
                            id: cylinderId,
                            color: gamedatas.players[playerId].color,
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

            if( this.notification_manager != undefined ) {
                this.notification_manager.destroy();
            }
            this.notificationManager = new NotificationManager( this );
            // Setup game notifications to handle (see "setupNotifications" method below)
            this.notificationManager.setupNotifications();
            
            // // Setup game notifications to handle (see "setupNotifications" method below)
            // this.setupNotifications();

            console.log( "Ending game setup" );
        },
       

        ///////////////////////////////////////////////////
        //// Game & client states
        
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function( stateName, args )
        {
            console.log( 'Entering state: '+stateName, args );

            // UI changes for active player
            if(this.isCurrentPlayerActive()) {
                switch( stateName )
                {
                    case 'client_cardActionBattle':
                        this.updateSelectableActions();
                        break;
                    case 'cardActionGift':
                        this.activePlayer.rupees = args.args.rupees;
                        console.log('activePlayer', this.activePlayer);
                        this.selectedAction = 'cardActionGift';
                        this.updateSelectableActions();
                        break;
                    case 'playerActions':
                        
                        const {court, favored_suit, remaining_actions,  rupees, unavailable_cards} = args.args;
                        this.activePlayer = {
                            court,
                            favoredSuit: favored_suit,
                            remainingActions: remaining_actions,
                            rupees: rupees,
                            unavailableCards: unavailable_cards,
                        };
                        // this.unavailableCards = args.args.unavailable_cards;
                        // this.remainingActions = args.args.remaining_actions;
                        // this.favoredSuit = args.args.favored_suit;
                        break;
                    case 'placeSpy':
                        this.selectedAction = 'placeSpy';
                        this.updateSelectableCards(args.args);
                        break;
                    default:
                        break;
                }
            }

            // UI changes for all players
            switch( stateName )
            {
           
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
                            // If player has court cards with free actions
                            if (args.court.some(({key, used}) => used == '0' && this.gamedatas.cards[key].suit == args.favored_suit)) {
                                this.addActionButton( 'card_action_btn', _('Card Action'), 'onCardAction' );
                            }
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
                    case 'client_confirmPlaceSpy':
                        this.addActionButton( 'confirm_btn', _('Confirm'), 'onConfirm', null, false, 'blue' );
                        this.addActionButton( 'cancel_btn', _('Cancel'), 'onCancel', null, false, 'red' );
                        break;
                    case 'client_confirmSelectGift':
                        this.addActionButton( 'confirm_btn', _('Confirm'), 'onConfirm', null, false, 'red' );
                        this.addActionButton( 'cancel_btn', _('Cancel'), 'onCancel', null, false, 'gray' );
                        break;
                    case 'placeRoad':
                        args.region.borders.forEach((border) => {
                            this.addActionButton( `${border}_btn`, _(this.gamedatas.borders[border].name), 'onBorder', null, false, 'blue' );
                        })
                        break;
                    case 'client_endTurn':
                        this.addActionButton( 'confirm_btn', _('Confirm'), 'onConfirm', null, false, 'red' );
                        this.addActionButton( 'cancel_btn', _('Cancel'), 'onCancel', null, false, 'gray' );
                        break;
                    case 'cardActionGift':
                        this.addActionButton( 'cancel_btn', _('Cancel'), 'onCancel', null, false, 'gray' );
                        break;
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

        clearLastAction: function( )
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
            dojo.query( '.pp_selectable' ).removeClass( 'pp_selectable' );
            // dojo.query( '.selectedPawn' ).removeClass( 'selectedPawn' );
            // dojo.query( '.fadeTile' ).removeClass( 'fadeTile' );

            dojo.forEach(this.handles, dojo.disconnect);
            this.handles = [];
            this.regions.forEach((region) => {
                const element = document.getElementById(`pp_region_${region}`);
                element.classList.remove('pp_selectable');
            });
            document.getElementById('pp_map_areas').classList.remove('pp_selectable');
        },

        createBorderZone: function({border, zone}) 
        {
            zone.create(this, `pp_${border}_border`, this.roadWidth, this.roadHeight);
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

            zone.setPattern( borderPattern[border] );

            if (border === 'herat_transcaspia') {
                zone.itemIdToCoords = function( i, control_width, no_idea_what_this_is, numberOfItems ) {
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

        discardCard: function({id, from, order = null}) {
            // Move all spies back to cylinder pools
            if (this.spies?.[id]) {
                // ['cylinder_2371052_3']
                const items = this.spies[id].getAllItems();
                items.forEach((cylinderId) => {
                    const playerId = cylinderId.split('_')[1];
                    this.moveToken({id: cylinderId, to: this.cylinders[playerId], from: this.spies[id]});
                })
            }

            from.removeFromStockById(id, 'pp_discard_pile');

        },

        // returns zone object for given backend location in token database
        getZoneForLocation: function({location}) {
            const splitLocation = location.split('_');
            switch (splitLocation[0]) {
                case 'armies':
                    // armies_kabul
                    return this.armies[splitLocation[1]];
                case 'blocks':
                    // blocks_russian
                    return this.coalitionBlocks[splitLocation[1]];
                case 'cylinders':
                    // cylinders_playerId
                    return this.cylinders[splitLocation[1]];
                case 'gift':
                    // gift_2_playerId
                    return this.gifts[splitLocation[2]][splitLocation[1]]
                case 'favored':
                    // favored_suit_economic
                    return this.favoredSuit[splitLocation[2]];
                case 'roads':
                    // roads_herat_kabul
                    return this.roads[`${splitLocation[1]}_${splitLocation[2]}`];
                case 'spies':
                    // spies_card_38
                    const cardId = `${splitLocation[1]}_${splitLocation[2]}`
                    return this.spies[cardId];
                case 'tribes':
                    // tribes_kabul
                    return this.tribes[splitLocation[1]];
                default:
                    console.log('no zone determined');
                    break;
            }
        },

        moveCard: function({id, from, to, order = null}) {

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

        moveToken: function({id, to, from, weight = this.defaultWeightZone, addClass = undefined, removeClass = undefined}) {
      
            if (addClass) {
                dojo.addClass(id, addClass);
            };
            if (removeClass) {
                dojo.removeClass(id, removeClass);
            }
            
            to.placeInZone( id, weight );
            from.removeFromZone(id, false)
        },

        placeCard: function({location, id, order = null}) {
            if (order != null) {
                location.changeItemsWeight({
                    [id]: order,
                });
            }

            location.addToStockWithId(id, id, 'pp_market_deck');

            // this.setupCardSpyZone({location, cardId: id});

            // this.addTooltip( location.getItemDivId(id), id, '' );

        },

        // TODO(Frans): detereming jstpl based on id?
        placeToken: function({location, id, jstpl, jstplProps, weight = 0, classes = [], from = null}) {
            // console.log('from', from)
            dojo.place( this.format_block( jstpl, jstplProps ) , from || 'pp_tokens' );
            classes.forEach((className) => {
                dojo.addClass( id, className ); 
            })
            location.placeInZone( id, weight );
        },



        // Function to setup stock components for cards
        setupCardsStock: function( {stock, nodeId, className} ) {
            const useLargeCards = false;
            stock.create( this, $(nodeId), this.cardWidth, this.cardHeight );
            // const backgroundSize = useLargeCards ? '17550px 209px' : '17700px';
            const backgroundSize = useLargeCards ? '11700% 100%' : '11800% 100%';
            stock.image_items_per_row = useLargeCards ? 117 : 118;
            stock.item_margin = 10;
            // TODO: below is option to customize the created div (and add zones to card for example)
            stock.jstpl_stock_item= "<div id=\"${id}\" class=\"stockitem pp_card " + className + "\" \
                style=\"top:${top}px;left:${left}px;width:${width}px;height:${height}px;z-index:${position};background-size:" + backgroundSize + ";\
                background-image:url('${image}');\"></div>";
            
            Object.keys(this.gamedatas.cards).forEach((cardId) => {
                const cardFileLocation = useLargeCards ? g_gamethemeurl + 'img/temp/cards/cards_tileset_original_495_692.jpg' : g_gamethemeurl + 'img/temp/cards_medium/cards_tileset_medium_215_300.jpg';
                stock.addItemType( cardId, 0, cardFileLocation, useLargeCards ? cardId.split('_')[1] -1 : cardId.split('_')[1] );
            });
            stock.extraClasses = `pp_card ${className}`;
            stock.setSelectionMode(0);
            stock.onItemCreate = dojo.hitch( this, 'setupNewCard' ); 
        },

        // Function that gets called every time a card is added to a stock component
        setupNewCard: function( cardDiv, cardId, divId ) {
            // if card is played to a court
            if (divId.startsWith('pp_court_player')) {
                const {actions, region} = this.gamedatas.cards[cardId];
                // add region class for selectable functions
                // const region = this.gamedatas.cards[cardId].region;
                dojo.addClass(cardDiv, `pp_card_in_court_${region}`);
                
                const spyZoneId = 'spies_' + cardId;
                dojo.place(`<div id="${spyZoneId}" class="pp_spy_zone"></div>`, divId);
                this.setupCardSpyZone({nodeId: spyZoneId, cardId });
                // TODO (add spy zone here)
                // TODO (add card actions)
                Object.keys(actions).forEach((action, index) => {
                    const actionId = action + '_' + cardId;
                    dojo.place(`<div id="${actionId}" class="pp_card_action pp_card_action_${action}" style="left: ${actions[action].left}px; top: ${actions[action].top}px"></div>`, divId);
                })
            }
        },

        // Function to set up zones for tokens (armies, tribes, cylinders etc.)
        setupTokenZone: function({zone, nodeId, tokenWidth, tokenHeight, itemMargin = null, instantaneous = false, pattern = null, customPattern = null}) {
            zone.create(this, nodeId, tokenWidth, tokenHeight);
            if (itemMargin) {
                zone.item_margin = itemMargin;
            };
            zone.instantaneous = instantaneous;
            if (pattern) {
                zone.setPattern(pattern);
            }
            if (pattern == 'custom' && customPattern) {
                zone.itemIdToCoords = customPattern;
            }
        },

        // Every time a card is moved or placed in court this function will be called to set up zone.
        setupCardSpyZone: function({nodeId, cardId}) {
            // Note (Frans): we probably need to remove spies before moving / placing card
            if (this.spies[cardId]) {
                this.spies[cardId].removeAll();
            }

            // ** setup for zone
            this.spies[cardId] = new ebg.zone();
            this.spies[cardId].create( this, nodeId, this.cylinderWidth, this.cylinderHeight );
            this.spies[cardId].item_margin = 4;
        },

        // Updates weight of item in the stock component for ordering purposes
        updateCard : function({location, id, order}) {
            location.changeItemsWeight({[id]: order});
        },

        updatePlayerLoyalty: function({playerId, coalition})
        {
            dojo.query( `#loyalty_icon_${playerId}` )
                .removeClass( 'pp_loyalty_afghan' )
                .removeClass('pp_loyalty_british')
                .removeClass('pp_loyalty_russian')
                .addClass(`pp_loyalty_${coalition}`);

            dojo.query( `#pp_loyalty_dial_${playerId}` )
                .removeClass( 'pp_loyalty_afghan' )
                .removeClass('pp_loyalty_british')
                .removeClass('pp_loyalty_russian')
                .addClass(`pp_loyalty_${coalition}`);
        },

        updateSelectableActions: function() {
            console.log('updateSelectableActions', this.selectedAction);
            this.clearLastAction();
            const playerId = this.player_id;
            switch (this.selectedAction) {
                case 'cardActionBattle':
                    console.log('battle');
                    console.log('dojo', dojo);
                    const container = document.getElementById(`pp_map_areas`);
                    container.classList.add('pp_selectable');
                    this.regions.forEach((region) => {
                        console.log('region', region);
                        const element = document.getElementById(`pp_region_${region}`);
                        // console.log(node);
                        element.classList.add('pp_selectable');
                        this.handles.push(dojo.connect(element,'onclick', this, 'onSelectRegion'));
                        // dojo.query(`#pp_region_${region}`).forEach((node) => {
                        // dojo.query(`.pp_region`).forEach((node) => {
                        // dojo.query('#pp_map_areas').forEach((node) => {
                        //     dojo.addClass(node, 'pp_selectable');
                        //     this.handles.push(dojo.connect(node,'onclick', this, 'onSelectRegion'));
                        // })
                    })
                    break;
                case 'cardAction':
                    // Note Frans: perhaps there is a better way to get the court cards for the player
                    // based on backend data
                    dojo.query(`.pp_card_in_court_${playerId}`).forEach((node) => {
                        const splitNodeId = node.id.split('_');
                        const cardId = `${splitNodeId[5]}_${splitNodeId[6]}`
                        const used = this.activePlayer.court.find((card) => card.key == cardId)?.used == 1;
                        if (!used && (this.activePlayer.remainingActions > 0 || this.activePlayer.favoredSuit == this.gamedatas.cards[cardId].suit))
                        dojo.map(node.children, (child) => {
                            if (dojo.hasClass(child, 'pp_card_action')) {
                                dojo.addClass(child, 'pp_selectable');
                                this.handles.push(dojo.connect(child,'onclick', this, 'onCardActionClick'));
                            }
                        })
                    }) 
                    break;
                case 'cardActionGift':
                    ['2', '4', '6'].forEach((giftValue) => {
                        const hasGift = this.gifts[playerId][giftValue].getAllItems().length > 0;
                        if (!hasGift && giftValue <= this.activePlayer.rupees) {
                            dojo.query(`#pp_gift_${giftValue}_${playerId}`).forEach((node) => {
                                dojo.addClass(node, 'pp_selectable');
                                this.handles.push(dojo.connect(node,'onclick', this, 'onSelectGift'));
                            })
                        };
                    });
                    break;
                default:
                    break;
            }
        },

        updateSelectableCards: function(args = null) {
            console.log('updateSelectableCards', this.selectedAction);
            this.clearLastAction();

            switch (this.selectedAction) {
                case 'purchase':
                    dojo.query('.pp_market_card').forEach(
                        (node) => {
                            const cost = node.id.split('_')[3]; // cost is equal to the column number
                            const cardId = node.id.split('_')[6];
                            if ((cost <= this.activePlayer.rupees) && (! this.activePlayer.unavailableCards.includes('card_'+cardId) )) {
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
                            dojo.addClass(node, 'pp_selectable_card');
                            this.handles.push(dojo.connect(node,'onclick', this, 'onCard'));
                        }, this);
                    break;
                case 'placeSpy':
                    dojo.query(`.pp_card_in_court_${args?.region ? args.region : ''}`).forEach(
                        function (node, index) {
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
                this.selectedAction = 'play';
                this.updateSelectableCards();
                this.setClientState("client_selectPlay", { descriptionmyturn : _( "${you} must select a card to play") });
            }
        }, 

        onSelectGift: function( evt ) 
        {
            const divId = evt.currentTarget.id;
            dojo.stopEvent( evt );
            if (! this.checkAction('selectGift'))
            return;

            if( this.isCurrentPlayerActive() )
            {       
                const value = divId.split('_')[2];
                this.selectedAction = 'confirmSelectGift';
                this.clearLastAction();
                this.selectedGift = value;
                dojo.query(`#pp_gift_${value}_${this.player_id}`).addClass('pp_selected');
                this.setClientState("client_confirmSelectGift", { descriptionmyturn : _( `Purchase gift for ${value} rupees?`) });
            }
        },

        onSelectRegion: function( evt ) {
            const divId = evt.currentTarget.id;
            dojo.stopEvent( evt );
            console.log('onSelectRegion', divId, evt);
        },

        onCardAction: function()
        {
            if (! this.checkAction('card_action'))
            return;

            if( this.isCurrentPlayerActive() )
            {       
                this.selectedAction = 'cardAction';
                this.updateSelectableActions();
                this.setClientState("client_selectCardAction", { descriptionmyturn : _( "${you} must select a card action") });
            }
        }, 

        onPass: function()
        {
            if (! this.checkAction('pass'))
            return;
            if( this.isCurrentPlayerActive() )
            {       
                this.selectedAction = 'pass';
                if (this.activePlayer.remainingActions == 0) {
                    this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/passAction.html", {
                        lock: true
                    }, this, function( result ) {} );
                } else {
                    this.setClientState("client_endTurn", { descriptionmyturn : _( "Confirm to your end turn ") });
                }
            }
        },

        onBorder: function( arg )
        {
            const splitId = arg.target.id.split('_');
            const border = `${splitId[0]}_${splitId[1]}`
            this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/placeRoad.html", { 
                lock: true,
                border: border,
            }, this, function( result ) {} );
        }, 

        onCard: function( evt )
        {
            const cardDivId = evt.currentTarget.id;

            dojo.stopEvent( evt );

            const cardId = 'card_' + cardDivId.split('_')[6];
            this.selectedCard = cardId;
            let node;
            if( this.isCurrentPlayerActive() )
            {   
                switch (this.selectedAction) {
                    case 'purchase':    
                        this.clearLastAction();
                        node = $( cardDivId );
                        dojo.addClass(node, 'pp_selected');
                        const cost = cardDivId.split('_')[3];
                        this.setClientState("client_confirmPurchase", { descriptionmyturn : "Purchase this card for "+cost+" rupees?"});
                        break;

                    case 'play':    
                        this.clearLastAction();
                        node = $( cardDivId );
                        dojo.addClass(node, 'pp_selected');
                        this.setClientState("client_confirmPlay", { descriptionmyturn : "Select which side of court to play card:"});
                        break;
                    
                    case 'discard_hand':
                    case 'discard_court':
                        node = $( cardDivId );
                        dojo.toggleClass(node, 'pp_selected');
                        dojo.toggleClass(node, 'pp_discard');
                        if (dojo.query('.pp_selected').length == this.numberOfDiscards) {
                            dojo.removeClass('confirm_btn', 'pp_disabled');
                        } else {
                            dojo.addClass('confirm_btn', 'pp_disabled');
                        }
                        break;
                    case 'placeSpy':
                        this.clearLastAction();
                        node = $( cardDivId );
                        dojo.addClass(node, 'pp_selected');
                        const cardName = this.gamedatas.cards[cardId].name;
                        this.setClientState("client_confirmPlaceSpy", { descriptionmyturn : `Place a spy on ${cardName}`});
                        break;
                    default:
                        break;
                }
            }
        },

        onCardActionClick: function( evt ) {
            const divId = evt.currentTarget.id;
            dojo.stopEvent( evt );
            this.clearLastAction();
            const splitId = divId.split('_');
            const card_action = splitId[0];
            const card_id = `${splitId[1]}_${splitId[2]}`;
            switch (card_action) {
                case 'gift':
                    this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/cardAction.html", { 
                        lock: true,
                        card_id,
                        card_action,
                    }, this, function( result ) {} ); 
                    break;
                case 'battle':
                    this.selectedAction = 'cardActionBattle';
                    // this.updateSelectableActions();
                    this.setClientState("client_cardActionBattle", { descriptionmyturn : _( "${you} must select a card or region") });
                    break;
                case 'default':
                    console.log('default gift');
                    break;
            }
 
        },

        onCancel: function()
        {
            this.clearLastAction();
            this.selectedAction = '';
            this.restoreServerGameState();
        }, 

        onConfirm: function()
        {
            switch (this.selectedAction) {
                case 'purchase':
                    var cardId = this.selectedCard;
                    this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/purchaseCard.html", { 
                        lock: true,
                        card_id: cardId,
                    }, this, function( result ) {} );  
                    break;
                    
                case 'pass':
                    this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/passAction.html", { 
                        lock: true,
                    }, this, function( result ) {} ); 
                    break;
                case 'confirmSelectGift':
                    this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/selectGift.html", { 
                        lock: true,
                        selected_gift: this.selectedGift,
                    }, this, function( result ) {} );
                    break;
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
                case 'placeSpy':
                    this.clearLastAction();
                    const card_id = this.selectedCard;
                    this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/placeSpy.html", { 
                        lock: true,
                        card_id: card_id,
                    }, this, function( result ) {} );  
                    break;
                default:
                    break;
            }

        }, 

        onLeft: function()
        {

            switch (this.selectedAction) {
                case 'play':    
                    this.clearLastAction();
                    // var node = $( card_id );
                    // dojo.addClass(node, 'selected');
                    var card_id = this.selectedCard;
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

            switch (this.selectedAction) {
                case 'play':    
                    this.clearLastAction();
                    // var node = $( card_id );
                    // dojo.addClass(node, 'selected');
                    var card_id = this.selectedCard;
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

        onAfghan: function()
        {
            this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/chooseLoyalty.html", { 
                lock: true,
                coalition: 'afghan',
            }, this, function( result ) {} );  

        },

        onRussian: function()
        {
            this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/chooseLoyalty.html", { 
                lock: true,
                coalition: 'russian',
            }, this, function( result ) {} );  

        },

        onBritish: function()
        {
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
   });             
});
