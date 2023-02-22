// Interface steps
var CARD_ACTION_BATTLE = 'cardActionBattle';
var CARD_ACTION_BETRAY = 'cardActionBetray';
var CARD_ACTION_BUILD = 'cardActionBuild';
var CARD_ACTION_GIFT = 'cardActionGift';
var CARD_ACTION_MOVE = 'cardActionMove';
var CARD_ACTION_TAX = 'cardActionTax';
var CHOOSE_LOYALTY = 'chooseLoyalty';
var CONFIRM_PLACE_SPY = 'confirmPlaceSpy';
var PLAY_CARD_BRIBE = 'playCardBribe';
var PLAY_CARD_SELECT_SIDE = 'playCardSelectSide';
var PLAY_CARD_CONFIRM = 'playCardConfirm';
var CONFIRM_PURCHASE = 'confirmPurchase';
var CONFIRM_SELECT_GIFT = 'confirmSelectGift';
var DISCARD_COURT = 'discardCourt';
var DISCARD_HAND = 'discardHand';
var PLACE_ROAD = 'placeRoad';
var PLACE_SPY = 'placeSpy';
var PASS = 'pass';
var PLAYER_ACTIONS = 'playerActions';
// size of tokens
var CARD_WIDTH = 150;
var CARD_HEIGHT = 209;
var ARMY_HEIGHT = 40;
var ARMY_WIDTH = 25;
var COALITION_BLOCK_HEIGHT = 40;
var COALITION_BLOCK_WIDTH = 25;
var ROAD_HEIGHT = 27;
var ROAD_WIDTH = 40;
var TRIBE_WIDTH = 25;
var TRIBE_HEIGHT = 25;
var RUPEE_WIDTH = 50;
var RUPEE_HEIGHT = 50;
var CYLINDER_WIDTH = 30;
var CYLINDER_HEIGHT = 30;
var FAVORED_SUIT_MARKER_WIDTH = 22;
var FAVORED_SUIT_MARKER_HEIGHT = 50;
var RULER_TOKEN_WIDTH = 50;
var RULER_TOKEN_HEIGHT = 50;
// names etc.
// suits
var ECONOMIC = 'economic';
var MILITARY = 'military';
var POLITICAL = 'political';
var INTELLIGENCE = 'intelligence';
// coalitions
var AFGHAN = 'afghan';
var BRITISH = 'british';
var RUSSIAN = 'russian';
var COALITIONS = [AFGHAN, BRITISH, RUSSIAN];
// regions
var HERAT = 'herat';
var KABUL = 'kabul';
var KANDAHAR = 'kandahar';
var PERSIA = 'persia';
var PUNJAB = 'punjab';
var TRANSCASPIA = 'transcaspia';
var REGIONS = [HERAT, KABUL, KANDAHAR, PERSIA, PUNJAB, TRANSCASPIA];
// borders (for all borders regions are in alphabetical order)
var HERAT_KABUL = 'herat_kabul';
var HERAT_KANDAHAR = 'herat_kandahar';
var HERAT_PERSIA = 'herat_persia';
var HERAT_TRANSCASPIA = 'herat_transcaspia';
var KABUL_KANDAHAR = 'kabul_kandahar';
var KABUL_PUNJAB = 'kabul_punjab';
var KABUL_TRANSCASPIA = 'kabul_transcaspia';
var KANDAHAR_PUNJAB = 'kandahar_punjab';
var PERSIA_TRANSCASPIA = 'persia_transcaspia';
var BORDERS = [
    HERAT_KABUL,
    HERAT_KANDAHAR,
    HERAT_PERSIA,
    HERAT_TRANSCASPIA,
    KABUL_KANDAHAR,
    KABUL_PUNJAB,
    KABUL_TRANSCASPIA,
    KANDAHAR_PUNJAB,
    PERSIA_TRANSCASPIA,
];
var tplCard = function (_a) {
    var cardId = _a.cardId, extraClasses = _a.extraClasses;
    return "<div id=\"".concat(cardId, "\" class=\"pp_card pp_card_in_zone pp_").concat(cardId).concat(extraClasses ? ' ' + extraClasses : '', "\"></div>");
};
var tplCardSelect = function (_a) {
    var side = _a.side;
    return "<div id=\"pp_card_select_".concat(side, "\" class=\"pp_card_select_side\"></div>");
};
var tplRupee = function (_a) {
    var rupeeId = _a.rupeeId;
    return "<div class=\"pp_rupee\" id=\"".concat(rupeeId, "\">\n            <div class=\"pp_rupee_inner\"></div>\n          </div>");
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var capitalizeFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
var getKeywords = function (_a) {
    var _b = _a.playerColor, playerColor = _b === void 0 ? '#000' : _b;
    return {
        you: '${you}',
        playerName: "<span style=\"font-weight:bold;color:#".concat(playerColor, ";\">${playerName}</span>"),
        herat: '<div class="pp_keyword_token pp_herat_icon"></div>',
        kabul: '<div class="pp_keyword_token pp_kabul_icon"></div>',
        kandahar: '<div class="pp_keyword_token pp_kandahar_icon"></div>',
        persia: '<div class="pp_keyword_token pp_persia_icon"></div>',
        punjab: '<div class="pp_keyword_token pp_punjab_icon"></div>',
        transcaspia: '<div class="pp_keyword_token pp_transcaspia_icon"></div>',
    };
};
var substituteKeywords = function (_a) {
    var string = _a.string, args = _a.args, playerColor = _a.playerColor;
    console.log('color', playerColor);
    return dojo.string.substitute(_(string), __assign(__assign({}, getKeywords({ playerColor: playerColor })), (args || {})));
};
// const placeCard = ({ location, id, order = null }) => {
//   if (order != null) {
//     location.changeItemsWeight({
//       [id]: order,
//     });
//   }
//   location.addToStockWithId(id, id, 'pp_market_deck');
//   // this.setupCardSpyZone({location, cardId: id});
//   // this.addTooltip( location.getItemDivId(id), id, '' );
// };
// TODO(Frans): detereming jstpl based on id?
var placeToken = function (_a) {
    var game = _a.game, location = _a.location, id = _a.id, jstpl = _a.jstpl, jstplProps = _a.jstplProps, _b = _a.weight, weight = _b === void 0 ? 0 : _b, _c = _a.classes, classes = _c === void 0 ? [] : _c, _d = _a.from, from = _d === void 0 ? null : _d;
    // console.log('from', from)
    dojo.place(game.framework().format_block(jstpl, jstplProps), from || 'pp_supply');
    classes.forEach(function (className) {
        dojo.addClass(id, className);
    });
    location.placeInZone(id, weight);
};
// // Function to setup stock components for cards
// const setupCardsStock = ({ game, stock, nodeId, className }: { game: Game; stock: Stock; nodeId: string; className?: string }) => {
//   const useLargeCards = false;
//   stock.create(game, $(nodeId), CARD_WIDTH, CARD_HEIGHT);
//   // const backgroundSize = useLargeCards ? '17550px 209px' : '17700px';
//   const backgroundSize = useLargeCards ? '11700% 100%' : '11800% 100%';
//   stock.image_items_per_row = useLargeCards ? 117 : 118;
//   stock.item_margin = 10;
//   // TODO: below is option to customize the created div (and add zones to card for example)
//   stock.jstpl_stock_item =
//     '<div id="${id}" class="stockitem pp_card ' +
//     className +
//     '" \
//               style="top:${top}px;left:${left}px;width:${width}px;height:${height}px;z-index:${position};background-size:' +
//     backgroundSize +
//     ";\
//               background-image:url('${image}');\"></div>";
//   Object.keys(game.gamedatas.cards).forEach((cardId) => {
//     const cardFileLocation = useLargeCards
//       ? g_gamethemeurl + 'img/temp/cards/cards_tileset_original_495_692.jpg'
//       : g_gamethemeurl + 'img/temp/cards_medium/cards_tileset_medium_215_300.jpg';
//     stock.addItemType(cardId, 0, cardFileLocation, useLargeCards ? Number(cardId.split('_')[1]) - 1 : Number(cardId.split('_')[1]));
//   });
//   stock.extraClasses = `pp_card ${className}`;
//   stock.setSelectionMode(0);
//   stock.onItemCreate = dojo.hitch(game, 'setupNewCard');
// };
// Function to set up zones for tokens (armies, tribes, cylinders etc.)
var setupTokenZone = function (_a) {
    var game = _a.game, zone = _a.zone, nodeId = _a.nodeId, tokenWidth = _a.tokenWidth, tokenHeight = _a.tokenHeight, _b = _a.itemMargin, itemMargin = _b === void 0 ? null : _b, _c = _a.instantaneous, instantaneous = _c === void 0 ? false : _c, _d = _a.pattern, pattern = _d === void 0 ? null : _d, _e = _a.customPattern, customPattern = _e === void 0 ? null : _e;
    zone.create(game, nodeId, tokenWidth, tokenHeight);
    if (itemMargin) {
        zone.item_margin = itemMargin;
    }
    zone.instantaneous = instantaneous;
    if (pattern) {
        zone.setPattern(pattern);
    }
    if (pattern == 'custom' && customPattern) {
        zone.itemIdToCoords = customPattern;
    }
};
// .########....###....##.....##..#######..########..########.########.
// .##.........##.##...##.....##.##.....##.##.....##.##.......##.....##
// .##........##...##..##.....##.##.....##.##.....##.##.......##.....##
// .######...##.....##.##.....##.##.....##.########..######...##.....##
// .##.......#########..##...##..##.....##.##...##...##.......##.....##
// .##.......##.....##...##.##...##.....##.##....##..##.......##.....##
// .##.......##.....##....###.....#######..##.....##.########.########.
// ..######..##.....##.####.########
// .##....##.##.....##..##.....##...
// .##.......##.....##..##.....##...
// ..######..##.....##..##.....##...
// .......##.##.....##..##.....##...
// .##....##.##.....##..##.....##...
// ..######...#######..####....##...
var FavoredSuit = /** @class */ (function () {
    function FavoredSuit(_a) {
        var game = _a.game;
        var _this = this;
        console.log('Constructor Favored Suit');
        this.game = game;
        this.favoredSuitZones = {};
        // Setup zones for favored suit marker
        Object.keys(game.gamedatas.suits).forEach(function (suit) {
            _this.favoredSuitZones[suit] = new ebg.zone();
            setupTokenZone({
                game: game,
                zone: _this.favoredSuitZones[suit],
                nodeId: "pp_favored_suit_".concat(suit),
                tokenWidth: FAVORED_SUIT_MARKER_WIDTH,
                tokenHeight: FAVORED_SUIT_MARKER_HEIGHT,
            });
        });
        var suit = game.gamedatas.favoredSuit;
        this.favoredSuitZones[suit].instantaneous = true;
        placeToken({
            game: game,
            location: this.favoredSuitZones[suit],
            //location: this.favoredSuit['intelligence'], // for testing change of favored suit
            id: "favored_suit_marker",
            jstpl: 'jstpl_favored_suit_marker',
            jstplProps: {
                id: "favored_suit_marker",
            },
        });
        this.favoredSuitZones[suit].instantaneous = false;
    }
    FavoredSuit.prototype.getFavoredSuitZone = function (_a) {
        var suit = _a.suit;
        return this.favoredSuitZones[suit];
    };
    return FavoredSuit;
}());
// ..######..##.....##.########..########..##.......##....##
// .##....##.##.....##.##.....##.##.....##.##........##..##.
// .##.......##.....##.##.....##.##.....##.##.........####..
// ..######..##.....##.########..########..##..........##...
// .......##.##.....##.##........##........##..........##...
// .##....##.##.....##.##........##........##..........##...
// ..######...#######..##........##........########....##...
var Supply = /** @class */ (function () {
    function Supply(_a) {
        var game = _a.game;
        var _this = this;
        console.log('Constructor Supply');
        this.game = game;
        // blocks per coalition (supply)
        this.coalitionBlocks = {};
        // Setup supply of coalition blocks
        COALITIONS.forEach(function (coalition) {
            _this.coalitionBlocks[coalition] = new ebg.zone();
            setupTokenZone({
                game: game,
                zone: _this.coalitionBlocks[coalition],
                nodeId: "pp_".concat(coalition, "_coalition_blocks"),
                tokenWidth: COALITION_BLOCK_WIDTH,
                tokenHeight: COALITION_BLOCK_HEIGHT,
                itemMargin: 15,
                instantaneous: true,
            });
            game.gamedatas.coalitionBlocks[coalition].forEach(function (block) {
                placeToken({
                    game: game,
                    location: _this.coalitionBlocks[coalition],
                    id: block.id,
                    jstpl: 'jstpl_coalition_block',
                    jstplProps: {
                        id: block.id,
                        coalition: coalition,
                    },
                });
            });
        });
    }
    Supply.prototype.getCoalitionBlocksZone = function (_a) {
        var coalition = _a.coalition;
        return this.coalitionBlocks[coalition];
    };
    return Supply;
}());
// .##.....##.########.....########.########.....###.....######..##....##
// .##.....##.##.....##.......##....##.....##...##.##...##....##.##...##.
// .##.....##.##.....##.......##....##.....##..##...##..##.......##..##..
// .##.....##.########........##....########..##.....##.##.......#####...
// ..##...##..##..............##....##...##...#########.##.......##..##..
// ...##.##...##..............##....##....##..##.....##.##....##.##...##.
// ....###....##..............##....##.....##.##.....##..######..##....##
var VpTrack = /** @class */ (function () {
    function VpTrack(_a) {
        var game = _a.game;
        console.log('VpTrack');
        this.game = game;
        this.vpTrackZones = {};
        // Create VP track
        for (var i = 0; i <= 23; i++) {
            this.vpTrackZones[i] = new ebg.zone();
            setupTokenZone({
                game: this.game,
                zone: this.vpTrackZones[i],
                nodeId: "pp_vp_track_".concat(i),
                tokenWidth: CYLINDER_WIDTH,
                tokenHeight: CYLINDER_HEIGHT,
            });
            this.vpTrackZones[i].setPattern('ellipticalfit');
        }
    }
    VpTrack.prototype.getZone = function (score) {
        return this.vpTrackZones[score];
    };
    return VpTrack;
}());
//  ..#######..########........##.########..######..########
//  .##.....##.##.....##.......##.##.......##....##....##...
//  .##.....##.##.....##.......##.##.......##..........##...
//  .##.....##.########........##.######...##..........##...
//  .##.....##.##.....##.##....##.##.......##..........##...
//  .##.....##.##.....##.##....##.##.......##....##....##...
//  ..#######..########...######..########..######.....##...
//  .##.....##....###....##....##....###.....######...########.########.
//  .###...###...##.##...###...##...##.##...##....##..##.......##.....##
//  .####.####..##...##..####..##..##...##..##........##.......##.....##
//  .##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
//  .##.....##.#########.##..####.#########.##....##..##.......##...##..
//  .##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
//  .##.....##.##.....##.##....##.##.....##..######...########.##.....##
var PPObjectManager = /** @class */ (function () {
    function PPObjectManager(game) {
        console.log('ObjectManager');
        this.game = game;
        this.favoredSuit = new FavoredSuit({ game: game });
        this.supply = new Supply({ game: game });
        this.vpTrack = new VpTrack({ game: game });
    }
    return PPObjectManager;
}());
//  .########..##..........###....##....##.########.########.
//  .##.....##.##.........##.##....##..##..##.......##.....##
//  .##.....##.##........##...##....####...##.......##.....##
//  .########..##.......##.....##....##....######...########.
//  .##........##.......#########....##....##.......##...##..
//  .##........##.......##.....##....##....##.......##....##.
//  .##........########.##.....##....##....########.##.....##
var PPPlayer = /** @class */ (function () {
    function PPPlayer(_a) {
        var game = _a.game, player = _a.player;
        var _this = this;
        this.hand = new ebg.zone();
        this.counters = {
            cards: new ebg.counter(),
            cylinders: new ebg.counter(),
            economic: new ebg.counter(),
            influence: new ebg.counter(),
            intelligence: new ebg.counter(),
            military: new ebg.counter(),
            political: new ebg.counter(),
            rupees: new ebg.counter(),
        };
        this.rulerTokens = new ebg.zone();
        // console.log("Player", player);
        this.game = game;
        var playerId = player.id;
        this.playerId = Number(playerId);
        this.player = player;
        this.playerName = player.name;
        this.playerColor = player.color;
        var gamedatas = game.gamedatas;
        this.setupHand({ gamedatas: gamedatas });
        this.setupCourt({ gamedatas: gamedatas });
        // Create cylinder zone
        this.cylinders = new ebg.zone();
        setupTokenZone({
            game: this.game,
            zone: this.cylinders,
            nodeId: "pp_cylinders_player_".concat(playerId),
            tokenWidth: CYLINDER_WIDTH,
            tokenHeight: CYLINDER_HEIGHT,
            itemMargin: 8,
        });
        // Create rulerTokens zone
        setupTokenZone({
            game: this.game,
            zone: this.rulerTokens,
            nodeId: "pp_ruler_tokens_player_".concat(playerId),
            tokenWidth: RULER_TOKEN_WIDTH,
            tokenHeight: RULER_TOKEN_HEIGHT,
            itemMargin: 10,
        });
        Object.keys(gamedatas.rulers).forEach(function (region) {
            if (gamedatas.rulers[region] === Number(_this.playerId)) {
                console.log('place ruler token player');
                placeToken({
                    game: game,
                    location: _this.rulerTokens,
                    id: "pp_ruler_token_".concat(region),
                    jstpl: 'jstpl_ruler_token',
                    jstplProps: {
                        id: "pp_ruler_token_".concat(region),
                        region: region,
                    },
                });
            }
        });
        // Add cylinders to zone
        gamedatas.cylinders[playerId].forEach(function (cylinder) {
            placeToken({
                game: _this.game,
                location: _this.cylinders,
                id: cylinder.id,
                jstpl: 'jstpl_cylinder',
                jstplProps: {
                    id: cylinder.id,
                    color: gamedatas.players[playerId].color,
                },
            });
        });
        // Add cylinder to VP track
        // Note (Frans): should probably move this to objectManager
        placeToken({
            game: this.game,
            location: this.game.objectManager.vpTrack.getZone(player.score),
            id: "vp_cylinder_".concat(playerId),
            jstpl: 'jstpl_cylinder',
            jstplProps: {
                id: "vp_cylinder_".concat(playerId),
                color: gamedatas.players[playerId].color,
            },
        });
        this.gifts = {};
        // Set up gift zones
        ['2', '4', '6'].forEach(function (value) {
            _this.gifts[value] = new ebg.zone();
            setupTokenZone({
                game: _this.game,
                zone: _this.gifts[value],
                nodeId: "pp_gift_".concat(value, "_zone_").concat(playerId),
                tokenWidth: 40,
                tokenHeight: 40,
                // itemMargin: 10,
                pattern: 'custom',
                customPattern: function () {
                    return { x: 5, y: 5, w: 30, h: 30 };
                },
            });
        });
        // Add gifts to zones
        var playerGifts = gamedatas.gifts[playerId];
        Object.keys(playerGifts).forEach(function (giftValue) {
            Object.keys(playerGifts[giftValue]).forEach(function (cylinderId) {
                placeToken({
                    game: _this.game,
                    location: _this.gifts[giftValue],
                    id: cylinderId,
                    jstpl: 'jstpl_cylinder',
                    jstplProps: {
                        id: cylinderId,
                        color: gamedatas.players[playerId].color,
                    },
                });
            });
        });
        this.setupPlayerPanels({ gamedatas: gamedatas });
    }
    // Setup functions
    PPPlayer.prototype.setupHand = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        if (!(this.playerId === this.game.getPlayerId())) {
            return;
        }
        this.hand.create(this.game, 'pp_player_hand_cards', CARD_WIDTH, CARD_HEIGHT);
        this.hand.instantaneous = true;
        this.hand.item_margin = 16;
        gamedatas.hand.forEach(function (card) {
            dojo.place(tplCard({ cardId: card.id, extraClasses: 'pp_card_in_hand' }), 'pp_player_hand_cards');
            _this.hand.placeInZone(card.id);
        });
        this.hand.instantaneous = false;
    };
    PPPlayer.prototype.setupCourt = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        this.court = new ebg.zone();
        this.court.create(this.game, "pp_court_player_".concat(this.playerId), CARD_WIDTH, CARD_HEIGHT);
        this.court.item_margin = 16;
        gamedatas.court[this.playerId].forEach(function (card) {
            var cardId = card.id;
            var _a = _this.game.gamedatas.cards[cardId], actions = _a.actions, region = _a.region;
            dojo.place(tplCard({ cardId: cardId, extraClasses: "pp_card_in_court_".concat(_this.playerId, " pp_card_in_court_").concat(region) }), "pp_court_player_".concat(_this.playerId));
            _this.setupCourtCard({ cardId: cardId });
            _this.court.placeInZone(cardId, card.state);
        });
    };
    PPPlayer.prototype.setupPlayerPanels = function (_a) {
        var gamedatas = _a.gamedatas;
        // Set up panels
        var player_board_div = $('player_board_' + this.playerId);
        dojo.place(this.game.format_block('jstpl_player_board', __assign(__assign({}, this.player), { p_color: this.playerColor })), player_board_div);
        $("cylinders_".concat(this.playerId)).classList.add("pp_player_color_".concat(this.playerColor));
        // TODO: check how player loyalty is returned with new setup. Seems to be empty string?
        if (this.player.loyalty && this.player.loyalty !== 'null') {
            this.updatePlayerLoyalty({ coalition: this.player.loyalty });
        }
        this.counters.cards.create("card_count_".concat(this.playerId, "_counter"));
        this.counters.cylinders.create("cylinder_count_".concat(this.playerId, "_counter"));
        this.counters.economic.create("economic_".concat(this.playerId, "_counter"));
        this.counters.influence.create("influence_".concat(this.playerId, "_counter"));
        this.counters.intelligence.create("intelligence_".concat(this.playerId, "_counter"));
        this.counters.military.create("military_".concat(this.playerId, "_counter"));
        this.counters.political.create("political_".concat(this.playerId, "_counter"));
        this.counters.rupees.create("rupee_count_".concat(this.playerId, "_counter"));
        // Set all values in player panels
        if (this.player.loyalty && this.player.loyalty !== 'null') {
            this.counters.influence.setValue(gamedatas.counts[this.playerId].influence);
        }
        else {
            this.counters.influence.disable();
        }
        this.counters.cylinders.setValue(gamedatas.counts[this.playerId].cylinders);
        this.counters.rupees.setValue(gamedatas.counts[this.playerId].rupees);
        this.counters.cards.setValue(gamedatas.counts[this.playerId].cards);
        this.counters.economic.setValue(gamedatas.counts[this.playerId].suits.economic);
        this.counters.military.setValue(gamedatas.counts[this.playerId].suits.military);
        this.counters.political.setValue(gamedatas.counts[this.playerId].suits.political);
        this.counters.intelligence.setValue(gamedatas.counts[this.playerId].suits.intelligence);
    };
    PPPlayer.prototype.setupCourtCard = function (_a) {
        var cardId = _a.cardId;
        var _b = this.game.gamedatas.cards[cardId], actions = _b.actions, region = _b.region;
        this.game.createSpyZone({ cardId: cardId });
        Object.keys(actions).forEach(function (action, index) {
            var actionId = action + '_' + cardId;
            dojo.place("<div id=\"".concat(actionId, "\" class=\"pp_card_action pp_card_action_").concat(action, "\" style=\"left: ").concat(actions[action].left, "px; top: ").concat(actions[action].top, "px\"></div>"), cardId);
        });
    };
    // Getters & setters
    PPPlayer.prototype.getCourtZone = function () {
        return this.court;
    };
    PPPlayer.prototype.getHandZone = function () {
        return this.hand;
    };
    PPPlayer.prototype.getCylinderZone = function () {
        return this.cylinders;
    };
    PPPlayer.prototype.getGiftZone = function (_a) {
        var value = _a.value;
        return this.gifts[value];
    };
    PPPlayer.prototype.getColor = function () {
        return this.playerColor;
    };
    PPPlayer.prototype.getName = function () {
        return this.playerName;
    };
    PPPlayer.prototype.getRulerTokensZone = function () {
        return this.rulerTokens;
    };
    PPPlayer.prototype.getPlayerColor = function () {
        return this.playerColor;
    };
    PPPlayer.prototype.setCounter = function (_a) {
        var counter = _a.counter, value = _a.value;
        this.counters[counter].setValue(value);
    };
    PPPlayer.prototype.addSideSelectToCourt = function () {
        this.court.instantaneous = true;
        dojo.place(tplCardSelect({ side: 'left' }), "pp_court_player_".concat(this.playerId));
        this.court.placeInZone('pp_card_select_left', -1000);
        dojo.place(tplCardSelect({ side: 'right' }), "pp_court_player_".concat(this.playerId));
        this.court.placeInZone('pp_card_select_right', 1000);
    };
    PPPlayer.prototype.removeSideSelectFromCourt = function () {
        this.court.removeFromZone('pp_card_select_left', true);
        this.court.removeFromZone('pp_card_select_right', true);
        this.court.instantaneous = false;
    };
    PPPlayer.prototype.moveToHand = function (_a) {
        var cardId = _a.cardId, from = _a.from;
        this.game.move({ id: cardId, to: this.hand, from: from, addClass: ['pp_card_in_hand'], removeClass: ['pp_market_card'] });
    };
    PPPlayer.prototype.moveToCourt = function (_a) {
        var card = _a.card, from = _a.from;
        var region = this.game.gamedatas.cards[card.id].region;
        if (!from) {
            dojo.place(tplCard({ cardId: card.id, extraClasses: "pp_card_in_court_".concat(this.playerId, " pp_card_in_court_").concat(region) }), "pp_court_player_".concat(this.playerId));
            this.setupCourtCard({ cardId: card.id });
            this.court.placeInZone(card.id, card.state);
        }
        else {
            this.setupCourtCard({ cardId: card.id });
            this.game.move({
                id: card.id,
                to: this.court,
                from: from,
                addClass: ["pp_card_in_court_".concat(this.playerId, ", pp_card_in_court_").concat(region)],
                removeClass: ['pp_card_in_hand'],
                weight: card.state,
            });
        }
        this.removeSideSelectFromCourt();
    };
    // TODO (remove cards of other loyalties, remove gifts, remove prizes)
    PPPlayer.prototype.updatePlayerLoyalty = function (_a) {
        var coalition = _a.coalition;
        dojo
            .query("#loyalty_icon_".concat(this.playerId))
            .removeClass('pp_loyalty_afghan')
            .removeClass('pp_loyalty_british')
            .removeClass('pp_loyalty_russian')
            .addClass("pp_loyalty_".concat(coalition));
        dojo
            .query("#pp_loyalty_dial_".concat(this.playerId))
            .removeClass('pp_loyalty_afghan')
            .removeClass('pp_loyalty_british')
            .removeClass('pp_loyalty_russian')
            .addClass("pp_loyalty_".concat(coalition));
    };
    return PPPlayer;
}());
//  .########..##..........###....##....##.########.########.
//  .##.....##.##.........##.##....##..##..##.......##.....##
//  .##.....##.##........##...##....####...##.......##.....##
//  .########..##.......##.....##....##....######...########.
//  .##........##.......#########....##....##.......##...##..
//  .##........##.......##.....##....##....##.......##....##.
//  .##........########.##.....##....##....########.##.....##
//  .##.....##....###....##....##....###.....######...########.########.
//  .###...###...##.##...###...##...##.##...##....##..##.......##.....##
//  .####.####..##...##..####..##..##...##..##........##.......##.....##
//  .##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
//  .##.....##.#########.##..####.#########.##....##..##.......##...##..
//  .##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
//  .##.....##.##.....##.##....##.##.....##..######...########.##.....##
var PPPlayerManager = /** @class */ (function () {
    function PPPlayerManager(game) {
        console.log('Constructor PlayerManager');
        this.game = game;
        this.players = {};
        for (var playerId in game.gamedatas.players) {
            var player = game.gamedatas.players[playerId];
            // console.log("playerManager", playerId, player);
            this.players[playerId] = new PPPlayer({ player: player, game: this.game });
        }
        // console.log("players", this.players);
    }
    PPPlayerManager.prototype.getPlayer = function (_a) {
        var playerId = _a.playerId;
        return this.players[playerId];
    };
    return PPPlayerManager;
}());
// .########...#######..########..########..########.########.
// .##.....##.##.....##.##.....##.##.....##.##.......##.....##
// .##.....##.##.....##.##.....##.##.....##.##.......##.....##
// .########..##.....##.########..##.....##.######...########.
// .##.....##.##.....##.##...##...##.....##.##.......##...##..
// .##.....##.##.....##.##....##..##.....##.##.......##....##.
// .########...#######..##.....##.########..########.##.....##
var Border = /** @class */ (function () {
    function Border(_a) {
        var game = _a.game, border = _a.border;
        var _this = this;
        this.game = game;
        this.border = border;
        this.roadZone = new ebg.zone();
        this.createBorderZone({ border: border, zone: this.roadZone });
        Object.keys(game.gamedatas.roads[border]).forEach(function (id) {
            placeToken({
                game: game,
                location: _this.roadZone,
                id: id,
                jstpl: 'jstpl_road',
                jstplProps: {
                    id: id,
                    coalition: id.split('_')[1],
                },
            });
        });
    }
    Border.prototype.createBorderZone = function (_a) {
        var border = _a.border, zone = _a.zone;
        zone.create(this.game, "pp_".concat(border, "_border"), ROAD_WIDTH, ROAD_HEIGHT);
        // this[`${border}_border`].item_margin = -10;
        // this['transcaspia_armies'].setPattern( 'horizontalfit' );
        // TODO (Frans): at some point we need to update this so it looks nice,
        // probably do a lot more custom
        var borderPattern = {
            herat_kabul: 'horizontalfit',
            herat_kandahar: 'verticalfit',
            herat_persia: 'verticalfit',
            herat_transcaspia: 'custom',
            kabul_transcaspia: 'verticalfit',
            kabul_kandahar: 'horizontalfit',
            kabul_punjab: 'verticalfit',
            kandahar_punjab: 'verticalfit',
            persia_transcaspia: 'horizontalfit',
        };
        zone.setPattern(borderPattern[border]);
        if (border === 'herat_transcaspia') {
            zone.itemIdToCoords = function (i, control_width, no_idea_what_this_is, numberOfItems) {
                if (i % 8 == 0 && numberOfItems === 1) {
                    return { x: 50, y: 25, w: 40, h: 27 };
                }
                else if (i % 8 == 0) {
                    return { x: 90, y: -5, w: 40, h: 27 };
                }
                else if (i % 8 == 1) {
                    return { x: 85, y: 5, w: 40, h: 27 };
                }
                else if (i % 8 == 2) {
                    return { x: 70, y: 17, w: 40, h: 27 };
                }
                else if (i % 8 == 3) {
                    return { x: 55, y: 29, w: 40, h: 27 };
                }
                else if (i % 8 == 4) {
                    return { x: 40, y: 41, w: 40, h: 27 };
                }
                else if (i % 8 == 5) {
                    return { x: 35, y: 43, w: 40, h: 27 };
                }
                else if (i % 8 == 6) {
                    return { x: 47, y: 13, w: 40, h: 27 };
                }
                else if (i % 8 == 7) {
                    return { x: 10, y: 63, w: 40, h: 27 };
                }
            };
        }
    };
    Border.prototype.getRoadZone = function () {
        return this.roadZone;
    };
    return Border;
}());
// .########..########..######...####..#######..##....##
// .##.....##.##.......##....##...##..##.....##.###...##
// .##.....##.##.......##.........##..##.....##.####..##
// .########..######...##...####..##..##.....##.##.##.##
// .##...##...##.......##....##...##..##.....##.##..####
// .##....##..##.......##....##...##..##.....##.##...###
// .##.....##.########..######...####..#######..##....##
var Region = /** @class */ (function () {
    function Region(_a) {
        var game = _a.game, region = _a.region;
        var _this = this;
        // console.log('constructor Region ', region);
        this.game = game;
        this.region = region;
        this.armyZone = new ebg.zone();
        this.tribeZone = new ebg.zone();
        this.rulerZone = new ebg.zone();
        // Setup army zone
        setupTokenZone({
            game: game,
            zone: this.armyZone,
            nodeId: "pp_".concat(region, "_armies"),
            tokenWidth: ARMY_WIDTH,
            tokenHeight: ARMY_HEIGHT,
            itemMargin: -5,
        });
        // place armies
        Object.keys(game.gamedatas.armies[region]).forEach(function (id) {
            placeToken({
                game: game,
                location: _this.armyZone,
                id: id,
                jstpl: 'jstpl_army',
                jstplProps: {
                    id: id,
                    coalition: id.split('_')[1],
                },
            });
        });
        // tribe zone
        setupTokenZone({
            game: game,
            zone: this.tribeZone,
            nodeId: "pp_".concat(region, "_tribes"),
            tokenWidth: TRIBE_WIDTH,
            tokenHeight: TRIBE_HEIGHT,
        });
        // tribes
        Object.keys(game.gamedatas.tribes[region]).forEach(function (id) {
            placeToken({
                game: game,
                location: _this.tribeZone,
                id: id,
                jstpl: 'jstpl_cylinder',
                jstplProps: {
                    id: id,
                    color: game.gamedatas.players[id.split('_')[1]].color,
                },
            });
        });
        // Ruler
        setupTokenZone({
            game: game,
            zone: this.rulerZone,
            nodeId: "pp_position_ruler_token_".concat(region),
            tokenWidth: RULER_TOKEN_WIDTH,
            tokenHeight: RULER_TOKEN_HEIGHT,
        });
        this.rulerZone.instantaneous = true;
        this.ruler = game.gamedatas.rulers[region];
        if (this.ruler === null) {
            placeToken({
                game: game,
                location: this.rulerZone,
                id: "pp_ruler_token_".concat(region),
                jstpl: 'jstpl_ruler_token',
                jstplProps: {
                    id: "pp_ruler_token_".concat(region),
                    region: region,
                },
            });
        }
        this.rulerZone.instantaneous = false;
    }
    Region.prototype.getArmyZone = function () {
        return this.armyZone;
    };
    Region.prototype.getRuler = function () {
        return this.ruler;
    };
    Region.prototype.setRuler = function (_a) {
        var playerId = _a.playerId;
        this.ruler = playerId;
    };
    Region.prototype.getRulerZone = function () {
        return this.rulerZone;
    };
    Region.prototype.getTribeZone = function () {
        return this.tribeZone;
    };
    return Region;
}());
// .##.....##....###....########.....##.....##....###....##....##....###.....######...########.########.
// .###...###...##.##...##.....##....###...###...##.##...###...##...##.##...##....##..##.......##.....##
// .####.####..##...##..##.....##....####.####..##...##..####..##..##...##..##........##.......##.....##
// .##.###.##.##.....##.########.....##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
// .##.....##.#########.##...........##.....##.#########.##..####.#########.##....##..##.......##...##..
// .##.....##.##.....##.##...........##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
// .##.....##.##.....##.##...........##.....##.##.....##.##....##.##.....##..######...########.##.....##
var PPMap = /** @class */ (function () {
    function PPMap(game) {
        var _this = this;
        this.game = game;
        this.borders = {};
        this.regions = {};
        REGIONS.forEach(function (region) {
            _this.regions[region] = new Region({ region: region, game: game });
        });
        BORDERS.forEach(function (border) {
            _this.borders[border] = new Border({ border: border, game: game });
        });
    }
    PPMap.prototype.getBorder = function (_a) {
        var border = _a.border;
        return this.borders[border];
    };
    PPMap.prototype.getRegion = function (_a) {
        var region = _a.region;
        return this.regions[region];
    };
    return PPMap;
}());
//  .##.....##....###....########..##....##.########.########
//  .###...###...##.##...##.....##.##...##..##..........##...
//  .####.####..##...##..##.....##.##..##...##..........##...
//  .##.###.##.##.....##.########..#####....######......##...
//  .##.....##.#########.##...##...##..##...##..........##...
//  .##.....##.##.....##.##....##..##...##..##..........##...
//  .##.....##.##.....##.##.....##.##....##.########....##...
//  .##.....##....###....##....##....###.....######...########.########.
//  .###...###...##.##...###...##...##.##...##....##..##.......##.....##
//  .####.####..##...##..####..##..##...##..##........##.......##.....##
//  .##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
//  .##.....##.#########.##..####.#########.##....##..##.......##...##..
//  .##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
//  .##.....##.##.....##.##....##.##.....##..######...########.##.....##
var PPMarket = /** @class */ (function () {
    function PPMarket(game) {
        this.game = game;
        this.marketCards = [];
        this.marketRupees = [];
        var gamedatas = game.gamedatas;
        // Set up market
        for (var row = 0; row <= 1; row++) {
            this.marketCards[row] = [];
            this.marketRupees[row] = [];
            for (var column = 0; column <= 5; column++) {
                this.setupMarketCardZone({ row: row, column: column, gamedatas: gamedatas });
                this.setupMarketRupeeZone({ row: row, column: column, gamedatas: gamedatas });
            }
        }
    }
    PPMarket.prototype.setupMarketCardZone = function (_a) {
        var row = _a.row, column = _a.column, gamedatas = _a.gamedatas;
        var containerId = "pp_market_".concat(row, "_").concat(column);
        this.marketCards[row][column] = new ebg.zone();
        this.marketCards[row][column].create(this.game, containerId, CARD_WIDTH, CARD_HEIGHT);
        this.marketCards[row][column].instantaneous = true;
        // add cards
        var cardInMarket = gamedatas.market[row][column];
        if (cardInMarket) {
            dojo.place(tplCard({ cardId: cardInMarket.id, extraClasses: 'pp_market_card' }), this.marketCards[row][column].container_div);
            this.marketCards[row][column].placeInZone(cardInMarket.id);
        }
        this.marketCards[row][column].instantaneous = false;
    };
    PPMarket.prototype.setupMarketRupeeZone = function (_a) {
        var _this = this;
        var row = _a.row, column = _a.column, gamedatas = _a.gamedatas;
        // Set up zone for all rupees in the market
        var rupeeContainerId = "pp_market_".concat(row, "_").concat(column, "_rupees");
        this.marketRupees[row][column] = new ebg.zone();
        setupTokenZone({
            game: this.game,
            zone: this.marketRupees[row][column],
            nodeId: rupeeContainerId,
            tokenWidth: RUPEE_WIDTH,
            tokenHeight: RUPEE_HEIGHT,
            itemMargin: -30,
        });
        this.marketRupees[row][column].instantaneous = true;
        gamedatas.rupees
            .filter(function (rupee) { return rupee.location === "market_".concat(row, "_").concat(column, "_rupees"); })
            .forEach(function (rupee) {
            _this.placeRupeeOnCard({ row: row, column: column, rupeeId: rupee.id, fromDiv: _this.marketRupees[row][column].container_div });
        });
        this.marketRupees[row][column].instantaneous = false;
    };
    PPMarket.prototype.getMarketCardZone = function (_a) {
        var row = _a.row, column = _a.column;
        return this.marketCards[row][column];
    };
    PPMarket.prototype.getMarketRupeesZone = function (_a) {
        var row = _a.row, column = _a.column;
        return this.marketRupees[row][column];
    };
    PPMarket.prototype.removeRupeesFromCard = function (_a) {
        var _this = this;
        var row = _a.row, column = _a.column, to = _a.to;
        this.marketRupees[row][column].getAllItems().forEach(function (rupeeId) {
            _this.marketRupees[row][column].removeFromZone(rupeeId, true, to);
        });
    };
    PPMarket.prototype.placeRupeeOnCard = function (_a) {
        var row = _a.row, column = _a.column, rupeeId = _a.rupeeId, fromDiv = _a.fromDiv;
        // TODO (chech why this does not slide from player player panel in case fromDiv is panelId)
        dojo.place(tplRupee({ rupeeId: rupeeId }), fromDiv);
        this.marketRupees[row][column].placeInZone(rupeeId);
    };
    return PPMarket;
}());
//  .####.##....##.########.########.########.....###.....######..########.####..#######..##....##
//  ..##..###...##....##....##.......##.....##...##.##...##....##....##.....##..##.....##.###...##
//  ..##..####..##....##....##.......##.....##..##...##..##..........##.....##..##.....##.####..##
//  ..##..##.##.##....##....######...########..##.....##.##..........##.....##..##.....##.##.##.##
//  ..##..##..####....##....##.......##...##...#########.##..........##.....##..##.....##.##..####
//  ..##..##...###....##....##.......##....##..##.....##.##....##....##.....##..##.....##.##...###
//  .####.##....##....##....########.##.....##.##.....##..######.....##....####..#######..##....##
//  .##.....##....###....##....##....###.....######...########.########.
//  .###...###...##.##...###...##...##.##...##....##..##.......##.....##
//  .####.####..##...##..####..##..##...##..##........##.......##.....##
//  .##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
//  .##.....##.#########.##..####.#########.##....##..##.......##...##..
//  .##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
//  .##.....##.##.....##.##....##.##.....##..######...########.##.....##
var PPInteractionManager = /** @class */ (function () {
    function PPInteractionManager(game) {
        this.game = game;
        this._connections = [];
        // Will store all data for active player and gets refreshed with entering player actions state
        this.activePlayer = {};
    }
    PPInteractionManager.prototype.clearPossible = function () {
        this.game.framework().removeActionButtons();
        dojo.empty('customActions');
        dojo.forEach(this._connections, dojo.disconnect);
        this._connections = [];
        dojo.query('.pp_selectable').removeClass('pp_selectable');
        dojo.query('.pp_selected').removeClass('pp_selected');
    };
    PPInteractionManager.prototype.resetActionArgs = function () {
        // Remove all selectable / selected classes
        dojo.query('.pp_selectable').removeClass('pp_selectable');
        dojo.query('.pp_selected').removeClass('pp_selected');
        // getElementById used because dojo does not seem to handle svgs well.
        REGIONS.forEach(function (region) {
            var element = document.getElementById("pp_region_".concat(region));
            element.classList.remove('pp_selectable');
        });
        document.getElementById('pp_map_areas').classList.remove('pp_selectable');
        // reset connections
        dojo.forEach(this._connections, dojo.disconnect);
        this._connections = [];
    };
    // .##.....##.########..########.....###....########.########
    // .##.....##.##.....##.##.....##...##.##......##....##......
    // .##.....##.##.....##.##.....##..##...##.....##....##......
    // .##.....##.########..##.....##.##.....##....##....######..
    // .##.....##.##........##.....##.#########....##....##......
    // .##.....##.##........##.....##.##.....##....##....##......
    // ..#######..##........########..##.....##....##....########
    //  .####.##....##.########.########.########..########....###.....######..########
    //  ..##..###...##....##....##.......##.....##.##.........##.##...##....##.##......
    //  ..##..####..##....##....##.......##.....##.##........##...##..##.......##......
    //  ..##..##.##.##....##....######...########..######...##.....##.##.......######..
    //  ..##..##..####....##....##.......##...##...##.......#########.##.......##......
    //  ..##..##...###....##....##.......##....##..##.......##.....##.##....##.##......
    //  .####.##....##....##....########.##.....##.##.......##.....##..######..########
    PPInteractionManager.prototype.updateInterface = function (_a) {
        var _this = this;
        var _b;
        var nextStep = _a.nextStep, args = _a.args;
        console.log("updateInterface ".concat(nextStep));
        this.clearPossible();
        switch (nextStep) {
            case CARD_ACTION_BATTLE:
                this.updatePageTitle({
                    text: _('${you} must select a card or region'),
                    args: {},
                });
                this.setRegionsSelectable();
                break;
            case CARD_ACTION_BETRAY:
                console.log('betray clicked');
                break;
            case CARD_ACTION_BUILD:
                console.log('build clicked');
                break;
            case CARD_ACTION_GIFT:
                this.updatePageTitle({
                    text: _('${you} must select a gift to purchase'),
                    args: {
                        you: '${you}',
                    },
                });
                this.setGiftsSelectable({ cardId: args.cardAction.cardId });
                this.addDangerActionButton({ id: 'cancel_btn', text: _('Cancel'), callback: function () { return _this.onCancel(); } });
                break;
            case CARD_ACTION_MOVE:
                console.log('move clicked');
                break;
            case CARD_ACTION_TAX:
                console.log('tax clicked');
                break;
            case CHOOSE_LOYALTY:
                this.addPrimaryActionButton({
                    id: 'afghan_button',
                    text: _('Afghan'),
                    callback: function () { return _this.game.takeAction({ action: 'chooseLoyalty', data: { coalition: AFGHAN } }); },
                    extraClasses: 'loyalty_button',
                });
                this.addPrimaryActionButton({
                    id: 'british_button',
                    text: _('British'),
                    callback: function () { return _this.game.takeAction({ action: 'chooseLoyalty', data: { coalition: BRITISH } }); },
                    extraClasses: 'loyalty_button',
                });
                this.addPrimaryActionButton({
                    id: 'russian_button',
                    text: _('Russian'),
                    callback: function () { return _this.game.takeAction({ action: 'chooseLoyalty', data: { coalition: RUSSIAN } }); },
                    extraClasses: 'loyalty_button',
                });
                break;
            case DISCARD_COURT:
                this.updatePageTitle({
                    text: this.numberOfDiscards !== 1
                        ? _('${you} must discard ${numberOfDiscards} cards')
                        : _('${you} must discard ${numberOfDiscards} card'),
                    args: {
                        numberOfDiscards: this.numberOfDiscards,
                        you: '${you}',
                    },
                });
                this.addPrimaryActionButton({
                    id: 'confirm_btn',
                    text: _('Confirm'),
                    callback: function () { return _this.handleDiscardConfirm({ fromHand: false }); },
                });
                dojo.addClass('confirm_btn', 'pp_disabled');
                this.setCourtCardsSelectableForDiscard();
                break;
            case DISCARD_HAND:
                this.updatePageTitle({
                    text: this.numberOfDiscards !== 1
                        ? _('${you} must discard ${numberOfDiscards} cards')
                        : _('${you} must discard ${numberOfDiscards} card'),
                    args: {
                        numberOfDiscards: this.numberOfDiscards,
                        you: '${you}',
                    },
                });
                this.addPrimaryActionButton({
                    id: 'confirm_btn',
                    text: _('Confirm'),
                    callback: function () { return _this.handleDiscardConfirm({ fromHand: true }); },
                });
                dojo.addClass('confirm_btn', 'pp_disabled');
                this.setHandCardsSelectable({
                    callback: function (_a) {
                        var cardId = _a.cardId;
                        return _this.handleDiscardSelect({ cardId: cardId });
                    },
                });
                break;
            case PLAYER_ACTIONS:
                this.updateMainTitleTextActions();
                if (this.activePlayerHasActions()) {
                    this.addSecondaryActionButton({ id: 'pass_btn', text: _('End Turn'), callback: function () { return _this.onPass(); } });
                    this.setMarketCardsSelectable();
                    this.setHandCardsSelectable({
                        callback: function (_a) {
                            var cardId = _a.cardId;
                            _this.playCardNextStep({ cardId: cardId });
                            // const numberOfCardsInCourt = this.game.playerManager
                            //   .getPlayer({ playerId: this.game.getPlayerId() })
                            //   .getCourtZone()
                            //   .getAllItems().length;
                            // if (numberOfCardsInCourt === 0) {
                            //   this.updateInterface({ nextStep: PLAY_CARD_CONFIRM, args: { playCardConfirm: { cardId, firstCard: true, side: 'left' } } });
                            // } else {
                            //   this.updateInterface({ nextStep: PLAY_CARD_SELECT_SIDE, args: { playCardSelectSide: { cardId } } });
                            // }
                        },
                    });
                    this.setCardActionsSelectable();
                }
                else {
                    if (this.activePlayerHasFreeCardActions()) {
                        this.setCardActionsSelectable();
                    }
                    this.addPrimaryActionButton({ id: 'pass_btn', text: _('End Turn'), callback: function () { return _this.onPass(); } });
                }
                break;
            case CONFIRM_PLACE_SPY:
                dojo.query(".pp_".concat(args.confirmPlaceSpy.cardId)).addClass('pp_selected');
                this.updatePageTitle({
                    text: _('Place a spy on ${cardName}'),
                    args: {
                        cardName: this.getCardInfo({ cardId: args.confirmPlaceSpy.cardId }).name,
                    },
                });
                this.addPrimaryActionButton({
                    id: 'confirm_btn',
                    text: _('Confirm'),
                    callback: function () { return _this.game.takeAction({ action: 'placeSpy', data: { cardId: args.confirmPlaceSpy.cardId } }); },
                });
                this.addDangerActionButton({ id: 'cancel_btn', text: _('Cancel'), callback: function () { return _this.onCancel(); } });
            case PLACE_ROAD:
                (((_b = args === null || args === void 0 ? void 0 : args.placeRoad) === null || _b === void 0 ? void 0 : _b.borders) || []).forEach(function (border) {
                    _this.addPrimaryActionButton({
                        id: "".concat(border, "_btn"),
                        text: _(_this.game.gamedatas.borders[border].name),
                        callback: function () { return _this.game.takeAction({ action: 'placeRoad', data: { border: border } }); },
                    });
                });
                break;
            case PLACE_SPY:
                this.setPlaceSpyCardsSelectable({ region: args.placeSpy.region });
                break;
            case PLAY_CARD_BRIBE:
                dojo.query(".pp_".concat(args.playCardBribe.cardId)).addClass('pp_selected');
                this.updatePageTitle({
                    text: substituteKeywords({
                        string: " ${you} need to pay a bribe to ${playerName}, ruler of ${region} ${".concat(args.playCardBribe.region, "}, or ask to waive."),
                        args: {
                            region: capitalizeFirstLetter(args.playCardBribe.region),
                        },
                        playerColor: args.playCardBribe.ruler.getColor(),
                    }),
                    args: {
                        playerName: args.playCardBribe.ruler.getName(),
                        you: '${you}',
                    },
                });
                break;
            case PLAY_CARD_SELECT_SIDE:
                dojo.query(".pp_".concat(args.playCardSelectSide.cardId)).addClass('pp_selected');
                this.updatePageTitle({
                    text: _("Select which side of court to play '${name}'"),
                    args: {
                        name: this.getCardInfo({ cardId: args.playCardSelectSide.cardId }).name,
                    },
                });
                this.setSideSelectable({ cardId: args.playCardSelectSide.cardId });
                this.addDangerActionButton({ id: 'cancel_btn', text: _('Cancel'), callback: function () { return _this.onCancel(); } });
                break;
            case PLAY_CARD_CONFIRM:
                dojo.query("#pp_card_select_".concat(args.playCardConfirm.side)).addClass('pp_selected');
                dojo.query(".pp_".concat(args.playCardConfirm.cardId)).addClass('pp_selected');
                if (args.playCardConfirm.firstCard) {
                    this.updatePageTitle({
                        text: _("Play '${name}' to court?"),
                        args: {
                            name: this.getCardInfo({ cardId: args.playCardConfirm.cardId }).name,
                        },
                    });
                }
                else {
                    this.updatePageTitle({
                        text: _("Play '${name}' to ${side} side of court?"),
                        args: {
                            name: this.getCardInfo({ cardId: args.playCardConfirm.cardId }).name,
                            side: args.playCardConfirm.side,
                        },
                    });
                }
                this.addPrimaryActionButton({
                    id: 'confirm_btn',
                    text: _('Confirm'),
                    callback: function () {
                        return _this.game.takeAction({
                            action: 'playCard',
                            data: { cardId: args.playCardConfirm.cardId, leftSide: args.playCardConfirm.side === 'left' },
                        });
                    },
                });
                this.addDangerActionButton({
                    id: 'cancel_btn',
                    text: _('Cancel'),
                    callback: function () {
                        _this.removeSideSelectable();
                        _this.onCancel();
                    },
                });
                break;
            case CONFIRM_PURCHASE:
                var _c = args.confirmPurchase, cardId = _c.cardId, cost = _c.cost;
                var name_1 = this.getCardInfo({ cardId: cardId }).name;
                dojo.query(".pp_".concat(cardId)).addClass('pp_selected');
                this.updatePageTitle({
                    text: _("Purchase '${name}' for ${cost} ${rupees}?"),
                    args: {
                        name: name_1,
                        cost: cost,
                        rupees: Number(cost) === 1 ? 'rupee' : 'rupees',
                    },
                });
                this.addPrimaryActionButton({
                    id: 'confirm_btn',
                    text: _('Confirm'),
                    callback: function () { return _this.game.takeAction({ action: 'purchaseCard', data: { cardId: args.confirmPurchase.cardId } }); },
                });
                this.addDangerActionButton({ id: 'cancel_btn', text: _('Cancel'), callback: function () { return _this.onCancel(); } });
                break;
            case CONFIRM_SELECT_GIFT:
                dojo.query("#pp_gift_".concat(args.confirmSelectGift.value, "_").concat(this.game.getPlayerId())).addClass('pp_selected');
                this.updatePageTitle({ text: _('Purchase gift for ${value} rupees?'), args: { value: '' + args.confirmSelectGift.value } });
                this.addDangerActionButton({
                    id: 'confirm_btn',
                    text: _('Confirm'),
                    callback: function () {
                        return _this.game.takeAction({
                            action: 'selectGift',
                            data: { selectedGift: args.confirmSelectGift.value, cardId: args.confirmSelectGift.cardId },
                        });
                    },
                });
                this.addDangerActionButton({
                    id: 'cancel_btn',
                    text: _('Cancel'),
                    callback: function () {
                        _this.removeSideSelectable();
                        _this.onCancel();
                    },
                });
                break;
            case PASS:
                this.updatePageTitle({ text: _('Confirm to your end turn'), args: {} });
                this.addDangerActionButton({
                    id: 'confirm_btn',
                    text: _('Confirm'),
                    callback: function () { return _this.game.takeAction({ action: 'pass' }); },
                });
                this.addSecondaryActionButton({ id: 'cancel_btn', text: _('Cancel'), callback: function () { return _this.onCancel(); } });
                break;
            default:
                console.log("No changes for step ".concat(nextStep));
                break;
        }
    };
    //  .##.....##.########.####.##.......####.########.##....##
    //  .##.....##....##.....##..##........##.....##.....##..##.
    //  .##.....##....##.....##..##........##.....##......####..
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  ..#######.....##....####.########.####....##.......##...
    PPInteractionManager.prototype.activePlayerHasActions = function () {
        return this.activePlayer.remainingActions > 0 || false;
    };
    PPInteractionManager.prototype.activePlayerHasCardActions = function () {
        var _this = this;
        return this.activePlayer.court.some(function (_a) {
            var id = _a.id, used = _a.used;
            var cardInfo = _this.game.gamedatas.cards[id];
            return used === 0 && Object.keys(cardInfo.actions).length > 0;
        });
    };
    PPInteractionManager.prototype.activePlayerHasFreeCardActions = function () {
        var _this = this;
        return this.activePlayer.court.some(function (_a) {
            var id = _a.id, used = _a.used;
            var cardInfo = _this.game.gamedatas.cards[id];
            return used === 0 && cardInfo.suit == _this.activePlayer.favoredSuit && Object.keys(cardInfo).length > 0;
        });
    };
    PPInteractionManager.prototype.activePlayerHasHandCards = function () {
        return Object.keys(this.activePlayer.hand).length > 0;
    };
    PPInteractionManager.prototype.activePlayerHasCourtCards = function () {
        return this.activePlayer.court.length > 0;
    };
    /*
     * Add a blue/grey button if it doesn't already exists
     */
    PPInteractionManager.prototype.addActionButton = function (_a) {
        var id = _a.id, text = _a.text, callback = _a.callback, extraClasses = _a.extraClasses, _b = _a.color, color = _b === void 0 ? 'none' : _b;
        if ($(id)) {
            return;
        }
        this.game.framework().addActionButton(id, text, callback, 'customActions', false, color);
        if (extraClasses) {
            dojo.addClass(id, extraClasses);
        }
    };
    PPInteractionManager.prototype.addPrimaryActionButton = function (_a) {
        var id = _a.id, text = _a.text, callback = _a.callback, extraClasses = _a.extraClasses;
        if ($(id)) {
            return;
        }
        this.game.framework().addActionButton(id, text, callback, 'customActions', false, 'blue');
        if (extraClasses) {
            dojo.addClass(id, extraClasses);
        }
    };
    PPInteractionManager.prototype.addSecondaryActionButton = function (_a) {
        var id = _a.id, text = _a.text, callback = _a.callback, extraClasses = _a.extraClasses;
        if ($(id)) {
            return;
        }
        this.game.framework().addActionButton(id, text, callback, 'customActions', false, 'gray');
        if (extraClasses) {
            dojo.addClass(id, extraClasses);
        }
    };
    PPInteractionManager.prototype.addDangerActionButton = function (_a) {
        var id = _a.id, text = _a.text, callback = _a.callback, extraClasses = _a.extraClasses;
        if ($(id)) {
            return;
        }
        this.game.framework().addActionButton(id, text, callback, 'customActions', false, 'red');
        if (extraClasses) {
            dojo.addClass(id, extraClasses);
        }
    };
    PPInteractionManager.prototype.getCardInfo = function (_a) {
        var cardId = _a.cardId;
        return this.game.gamedatas.cards[cardId];
    };
    /**
     * Player had actions remaining
     * 1. Player can only purchase cards (no cards in hand or in court);
     *    You may purchase a card (x actions remaining)
     * 2. Player can purchase and play cards (cards in hand, no card in court)
     *    You may purchase a card or play a card (x actions remaining)
     * 3. Player can purchase and perform card actions (no cards in hand, card in court)
     *    You may purchase a card or perform a card action
     * 4. Player can purchase, play and perform card actions (no cards in hand, card in court)
     *    You may purchase a card, play a card or perform card actions (x actions remaining)
     * Player has no actions remaining
     * 5. Player can perform free actions (no actions but cards with favored suit in court)
     *    You may perform free card actions
     * 6. Player does not have free actions
     */
    PPInteractionManager.prototype.updateMainTitleTextActions = function () {
        var remainingActions = this.activePlayer.remainingActions;
        var hasCardActions = this.activePlayerHasCardActions();
        var hasHandCards = this.activePlayerHasHandCards();
        var hasFreeCardActions = this.activePlayerHasFreeCardActions();
        var titleText = '';
        // cibst case = 0;
        if (remainingActions > 0 && !hasHandCards && !hasCardActions) {
            titleText = _('${you} may purchase a card');
        }
        else if (remainingActions > 0 && hasHandCards && !hasCardActions) {
            titleText = _('${you} may purchase a card or play a card');
        }
        else if (remainingActions > 0 && !hasHandCards && hasCardActions) {
            titleText = _('${you} may purchase a card or perform a card action');
        }
        else if (remainingActions > 0 && hasHandCards && hasCardActions) {
            titleText = _('${you} may purchase a card, play a card or perform a card action');
        }
        else if (remainingActions === 0 && hasFreeCardActions) {
            titleText = _('${you} may perform a free card action');
        }
        else if (remainingActions === 0 && !hasFreeCardActions) {
            titleText = _('${you} have no remaining actions');
        }
        if (remainingActions === 1) {
            titleText += _(' (1 action remaining)');
        }
        else if (remainingActions === 2) {
            titleText += _(' (2 actions remaining)');
        }
        this.game.gamedatas.gamestate.descriptionmyturn = titleText;
        this.game.framework().updatePageTitle();
    };
    PPInteractionManager.prototype.handleDiscardSelect = function (_a) {
        var cardId = _a.cardId;
        dojo.query(".pp_".concat(cardId)).toggleClass('pp_selected').toggleClass('pp_discard').toggleClass('pp_selectable');
        if (dojo.query('.pp_selected').length === this.numberOfDiscards) {
            dojo.removeClass('confirm_btn', 'pp_disabled');
        }
        else {
            dojo.addClass('confirm_btn', 'pp_disabled');
        }
    };
    PPInteractionManager.prototype.handleDiscardConfirm = function (_a) {
        var fromHand = _a.fromHand;
        var cards = '';
        dojo.query('.pp_selected').forEach(function (node, index) {
            cards += ' ' + node.id;
        }, this);
        this.game.takeAction({
            action: 'discardCards',
            data: {
                cards: cards,
                fromHand: fromHand,
            },
        });
    };
    PPInteractionManager.prototype.playCardNextStep = function (_a) {
        var cardId = _a.cardId;
        // Check if other player rules the region
        var cardInfo = this.getCardInfo({ cardId: cardId });
        var region = cardInfo.region;
        var rulerId = this.game.map.getRegion({ region: region }).getRuler();
        var playerId = this.game.getPlayerId();
        console.log('ruler', rulerId);
        if (rulerId !== null && rulerId !== playerId) {
            console.log('another player rules the region');
            this.updateInterface({
                nextStep: PLAY_CARD_BRIBE,
                args: { playCardBribe: { cardId: cardId, region: region, ruler: this.game.playerManager.getPlayer({ playerId: rulerId }) } },
            });
            return;
        }
        var numberOfCardsInCourt = this.game.playerManager
            .getPlayer({ playerId: this.game.getPlayerId() })
            .getCourtZone()
            .getAllItems().length;
        if (numberOfCardsInCourt === 0) {
            this.updateInterface({ nextStep: PLAY_CARD_CONFIRM, args: { playCardConfirm: { cardId: cardId, firstCard: true, side: 'left' } } });
        }
        else {
            this.updateInterface({ nextStep: PLAY_CARD_SELECT_SIDE, args: { playCardSelectSide: { cardId: cardId } } });
        }
    };
    PPInteractionManager.prototype.setCardActionsSelectable = function () {
        var _this = this;
        var playerId = this.game.getPlayerId();
        dojo.query(".pp_card_in_court_".concat(playerId)).forEach(function (node) {
            var _a, _b;
            var cardId = node.id;
            var used = ((_b = (_a = _this.activePlayer.court) === null || _a === void 0 ? void 0 : _a.find(function (card) { return card.id === cardId; })) === null || _b === void 0 ? void 0 : _b.used) === 1;
            if (!used &&
                (_this.activePlayer.remainingActions > 0 || _this.game.gamedatas.cards[cardId].suit === _this.activePlayer.favoredSuit))
                dojo.map(node.children, function (child) {
                    if (dojo.hasClass(child, 'pp_card_action')) {
                        var nextStep_1 = "cardAction".concat(capitalizeFirstLetter(child.id.split('_')[0]));
                        dojo.addClass(child, 'pp_selectable');
                        _this._connections.push(dojo.connect(child, 'onclick', _this, function () { return _this.updateInterface({ nextStep: nextStep_1, args: { cardAction: { cardId: cardId } } }); }));
                    }
                });
        });
    };
    PPInteractionManager.prototype.setRegionsSelectable = function () {
        var _this = this;
        var container = document.getElementById("pp_map_areas");
        container.classList.add('pp_selectable');
        REGIONS.forEach(function (region) {
            var element = document.getElementById("pp_region_".concat(region));
            element.classList.add('pp_selectable');
            _this._connections.push(dojo.connect(element, 'onclick', _this, function () { return console.log('Region', region); }));
        });
    };
    PPInteractionManager.prototype.setGiftsSelectable = function (_a) {
        var _this = this;
        var cardId = _a.cardId;
        var playerId = this.game.getPlayerId();
        [2, 4, 6].forEach(function (giftValue) {
            var hasGift = _this.game.playerManager
                .getPlayer({ playerId: playerId })
                .getGiftZone({
                value: giftValue,
            })
                .getAllItems().length > 0;
            if (!hasGift && giftValue <= _this.activePlayer.rupees) {
                dojo.query("#pp_gift_".concat(giftValue, "_").concat(playerId)).forEach(function (node) {
                    dojo.addClass(node, 'pp_selectable');
                    _this._connections.push(dojo.connect(node, 'onclick', _this, function () {
                        return _this.updateInterface({
                            nextStep: CONFIRM_SELECT_GIFT,
                            args: {
                                confirmSelectGift: {
                                    value: giftValue,
                                    cardId: cardId,
                                },
                            },
                        });
                    }));
                });
            }
        });
    };
    PPInteractionManager.prototype.setSideSelectable = function (_a) {
        var _this = this;
        var cardId = _a.cardId;
        this.game.playerManager.getPlayer({ playerId: this.game.getPlayerId() }).addSideSelectToCourt();
        dojo.query('#pp_card_select_left').forEach(function (node) {
            dojo.connect(node, 'onclick', _this, function () {
                _this.updateInterface({ nextStep: PLAY_CARD_CONFIRM, args: { playCardConfirm: { cardId: cardId, firstCard: false, side: 'left' } } });
            });
        });
        dojo.query('#pp_card_select_right').forEach(function (node) {
            dojo.connect(node, 'onclick', _this, function () {
                _this.updateInterface({ nextStep: PLAY_CARD_CONFIRM, args: { playCardConfirm: { cardId: cardId, firstCard: false, side: 'right' } } });
            });
        });
    };
    PPInteractionManager.prototype.removeSideSelectable = function () {
        this.game.playerManager.getPlayer({ playerId: this.game.getPlayerId() }).removeSideSelectFromCourt();
    };
    PPInteractionManager.prototype.setMarketCardsSelectable = function () {
        var _this = this;
        var baseCardCost = this.activePlayer.favoredSuit === MILITARY ? 2 : 1;
        dojo.query('.pp_market_card').forEach(function (node) {
            var cost = Number(node.parentElement.id.split('_')[3]) * baseCardCost; // cost is equal to the column number
            var cardId = node.id;
            if (cost <= _this.activePlayer.rupees && !_this.activePlayer.unavailableCards.includes(cardId)) {
                dojo.addClass(node, 'pp_selectable');
                _this._connections.push(dojo.connect(node, 'onclick', _this, function () {
                    return _this.updateInterface({ nextStep: CONFIRM_PURCHASE, args: { confirmPurchase: { cardId: cardId, cost: cost } } });
                }));
            }
        }, this);
    };
    PPInteractionManager.prototype.setHandCardsSelectable = function (_a) {
        var _this = this;
        var callback = _a.callback;
        dojo.query('.pp_card_in_hand').forEach(function (node, index) {
            var cardId = node.id;
            dojo.addClass(node, 'pp_selectable');
            _this._connections.push(dojo.connect(node, 'onclick', _this, function () { return callback({ cardId: cardId }); }));
        }, this);
    };
    PPInteractionManager.prototype.setCourtCardsSelectableForDiscard = function () {
        var _this = this;
        var playerId = this.game.getPlayerId();
        dojo.query(".pp_card_in_court_".concat(playerId)).forEach(function (node, index) {
            var cardId = 'card_' + node.id.split('_')[6];
            dojo.addClass(node, 'pp_selectable');
            _this._connections.push(dojo.connect(node, 'onclick', _this, function () { return _this.handleDiscardSelect({ cardId: cardId }); }));
        }, this);
    };
    PPInteractionManager.prototype.setPlaceSpyCardsSelectable = function (_a) {
        var _this = this;
        var region = _a.region;
        dojo.query(".pp_card_in_court_".concat(region)).forEach(function (node, index) {
            var cardId = node.id;
            dojo.addClass(node, 'pp_selectable');
            _this._connections.push(dojo.connect(node, 'onclick', _this, function () {
                return _this.updateInterface({ nextStep: CONFIRM_PLACE_SPY, args: { confirmPlaceSpy: { cardId: cardId } } });
            }));
        }, this);
    };
    PPInteractionManager.prototype.updatePageTitle = function (_a) {
        var text = _a.text, args = _a.args;
        this.game.gamedatas.gamestate.descriptionmyturn = dojo.string.substitute(_(text), args);
        this.game.framework().updatePageTitle();
    };
    //  .########.##....##.########.########.########..####.##....##..######..
    //  .##.......###...##....##....##.......##.....##..##..###...##.##....##.
    //  .##.......####..##....##....##.......##.....##..##..####..##.##.......
    //  .######...##.##.##....##....######...########...##..##.##.##.##...####
    //  .##.......##..####....##....##.......##...##....##..##..####.##....##.
    //  .##.......##...###....##....##.......##....##...##..##...###.##....##.
    //  .########.##....##....##....########.##.....##.####.##....##..######..
    //  ..######..########....###....########.########
    //  .##....##....##......##.##......##....##......
    //  .##..........##.....##...##.....##....##......
    //  ..######.....##....##.....##....##....######..
    //  .......##....##....#########....##....##......
    //  .##....##....##....##.....##....##....##......
    //  ..######.....##....##.....##....##....########
    PPInteractionManager.prototype.onEnteringState = function (stateName, args) {
        // UI changes for active player
        if (this.game.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'setup':
                    this.updateInterface({ nextStep: CHOOSE_LOYALTY });
                    break;
                case 'cardActionGift':
                    this.activePlayer.rupees = args.args.rupees;
                    this.updateInterface({ nextStep: CARD_ACTION_GIFT });
                    break;
                case 'discardCourt':
                    this.numberOfDiscards = args.args.numberOfDiscards;
                    this.updateInterface({ nextStep: DISCARD_COURT, args: { discardCourt: args.args } });
                    break;
                case 'discardHand':
                    this.numberOfDiscards = args.args.numberOfDiscards;
                    this.updateInterface({ nextStep: DISCARD_HAND, args: { discardHand: args.args } });
                    break;
                case 'playerActions':
                    var _a = args.args, court = _a.court, favoredSuit = _a.favoredSuit, hand = _a.hand, remainingActions = _a.remainingActions, rupees = _a.rupees, unavailableCards = _a.unavailableCards;
                    this.activePlayer = {
                        court: court,
                        favoredSuit: favoredSuit,
                        hand: hand,
                        remainingActions: Number(remainingActions),
                        rupees: Number(rupees),
                        unavailableCards: unavailableCards,
                    };
                    this.updateInterface({ nextStep: PLAYER_ACTIONS });
                    break;
                case 'placeRoad':
                    this.updateInterface({ nextStep: PLACE_ROAD, args: { placeRoad: { borders: args.args.region.borders } } });
                    break;
                case 'placeSpy':
                    this.updateInterface({ nextStep: PLACE_SPY, args: { placeSpy: { region: args.args.region } } });
                    break;
                default:
                    break;
            }
        }
        // UI changes for all players
        switch (stateName) {
            case 'dummmy':
                break;
            default:
                console.log('onEnteringState default');
                break;
        }
    };
    //  .##.......########....###....##.....##.####.##....##..######..
    //  .##.......##.........##.##...##.....##..##..###...##.##....##.
    //  .##.......##........##...##..##.....##..##..####..##.##.......
    //  .##.......######...##.....##.##.....##..##..##.##.##.##...####
    //  .##.......##.......#########..##...##...##..##..####.##....##.
    //  .##.......##.......##.....##...##.##....##..##...###.##....##.
    //  .########.########.##.....##....###....####.##....##..######..
    //  ..######..########....###....########.########
    //  .##....##....##......##.##......##....##......
    //  .##..........##.....##...##.....##....##......
    //  ..######.....##....##.....##....##....######..
    //  .......##....##....#########....##....##......
    //  .##....##....##....##.....##....##....##......
    //  ..######.....##....##.....##....##....########
    PPInteractionManager.prototype.onLeavingState = function (stateName) {
        console.log("onLeavingState ".concat(stateName));
        this.clearPossible();
        switch (stateName) {
            /* Example:
            
            case 'myGameState':
            
                // Hide the HTML block we are displaying only during this game state
                dojo.style( 'my_html_block_id', 'display', 'none' );
                
                break;
           */
            case 'dummmy':
                break;
        }
    };
    // .##.....##.########..########.....###....########.########
    // .##.....##.##.....##.##.....##...##.##......##....##......
    // .##.....##.##.....##.##.....##..##...##.....##....##......
    // .##.....##.########..##.....##.##.....##....##....######..
    // .##.....##.##........##.....##.#########....##....##......
    // .##.....##.##........##.....##.##.....##....##....##......
    // ..#######..##........########..##.....##....##....########
    //  .########..##.....##.########.########..#######..##....##..######.
    //  .##.....##.##.....##....##.......##....##.....##.###...##.##....##
    //  .##.....##.##.....##....##.......##....##.....##.####..##.##......
    //  .########..##.....##....##.......##....##.....##.##.##.##..######.
    //  .##.....##.##.....##....##.......##....##.....##.##..####.......##
    //  .##.....##.##.....##....##.......##....##.....##.##...###.##....##
    //  .########...#######.....##.......##.....#######..##....##..######.
    PPInteractionManager.prototype.onUpdateActionButtons = function (stateName, args) { };
    //  ..######..##.......####..######..##....##
    //  .##....##.##........##..##....##.##...##.
    //  .##.......##........##..##.......##..##..
    //  .##.......##........##..##.......#####...
    //  .##.......##........##..##.......##..##..
    //  .##....##.##........##..##....##.##...##.
    //  ..######..########.####..######..##....##
    // .##.....##....###....##....##.########..##.......########..######.
    // .##.....##...##.##...###...##.##.....##.##.......##.......##....##
    // .##.....##..##...##..####..##.##.....##.##.......##.......##......
    // .#########.##.....##.##.##.##.##.....##.##.......######....######.
    // .##.....##.#########.##..####.##.....##.##.......##.............##
    // .##.....##.##.....##.##...###.##.....##.##.......##.......##....##
    // .##.....##.##.....##.##....##.########..########.########..######.
    PPInteractionManager.prototype.onPass = function () {
        if (!this.game.framework().checkAction('pass') || !this.game.framework().isCurrentPlayerActive())
            return;
        if (Number(this.activePlayer.remainingActions) > 0) {
            this.updateInterface({ nextStep: 'pass' });
            return;
        }
        this.game.takeAction({ action: 'pass' });
    };
    PPInteractionManager.prototype.onCancel = function () {
        this.resetActionArgs();
        this.game.framework().restoreServerGameState();
    };
    return PPInteractionManager;
}());
//  .##....##..#######..########.####.########
//  .###...##.##.....##....##.....##..##......
//  .####..##.##.....##....##.....##..##......
//  .##.##.##.##.....##....##.....##..######..
//  .##..####.##.....##....##.....##..##......
//  .##...###.##.....##....##.....##..##......
//  .##....##..#######.....##....####.##......
//  .##.....##....###....##....##....###.....######...########.########.
//  .###...###...##.##...###...##...##.##...##....##..##.......##.....##
//  .####.####..##...##..####..##..##...##..##........##.......##.....##
//  .##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
//  .##.....##.#########.##..####.#########.##....##..##.......##...##..
//  .##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
//  .##.....##.##.....##.##....##.##.....##..######...########.##.....##
var PPNotificationManager = /** @class */ (function () {
    function PPNotificationManager(game) {
        this.game = game;
        this.subscriptions = [];
    }
    PPNotificationManager.prototype.destroy = function () {
        dojo.forEach(this.subscriptions, dojo.unsubscribe);
    };
    PPNotificationManager.prototype.getPlayer = function (_a) {
        var playerId = _a.playerId;
        return this.game.playerManager.getPlayer({ playerId: playerId });
    };
    PPNotificationManager.prototype.setupNotifications = function () {
        var _this = this;
        console.log('notifications subscriptions setup');
        var notifs = [
            ['cardAction', 1],
            ['changeRuler', 1],
            ['chooseLoyalty', 1],
            ['dominanceCheck', 1],
            ['purchaseCard', 2000],
            ['playCard', 2000],
            ['discardCard', 500],
            ['refreshMarket', 250],
            ['selectGift', 1],
            ['moveToken', 250],
            ['updatePlayerCounts', 1],
            ['log', 1],
        ];
        notifs.forEach(function (notif) {
            _this.subscriptions.push(dojo.subscribe(notif[0], _this, "notif_".concat(notif[0])));
            _this.game.framework().notifqueue.setSynchronous(notif[0], notif[1]);
        });
        // this.subscriptions.push(dojo.subscribe('updatePlayerCounts', this, 'notif_updatePlayerCounts'));
        // this.subscriptions.push(dojo.subscribe('log', this, 'notif_log'));
    };
    PPNotificationManager.prototype.notif_cardAction = function (notif) {
        console.log('notif_cardAction', notif);
    };
    PPNotificationManager.prototype.notif_changeRuler = function (notif) {
        var args = notif.args;
        console.log('notif_changeRuler', args);
        var oldRuler = args.oldRuler, newRuler = args.newRuler, region = args.region;
        var lowerCaseRegion = region.toLowerCase();
        var from = oldRuler === null
            ? this.game.map.getRegion({ region: lowerCaseRegion }).getRulerZone()
            : this.game.playerManager.getPlayer({ playerId: oldRuler }).getRulerTokensZone();
        var to = newRuler === null
            ? this.game.map.getRegion({ region: lowerCaseRegion }).getRulerZone()
            : this.game.playerManager.getPlayer({ playerId: newRuler }).getRulerTokensZone();
        this.game.map.getRegion({ region: lowerCaseRegion }).setRuler({ playerId: newRuler });
        this.game.move({
            id: "pp_ruler_token_".concat(lowerCaseRegion),
            from: from,
            to: to,
        });
    };
    PPNotificationManager.prototype.notif_chooseLoyalty = function (notif) {
        var args = notif.args;
        console.log('notif_chooseLoyalty', args);
        var playerId = Number(args.player_id);
        this.getPlayer({ playerId: playerId }).updatePlayerLoyalty({ coalition: args.coalition });
        // TODO (make this notif more generic for loyalty changes?)
        this.getPlayer({ playerId: playerId }).setCounter({ counter: 'influence', value: 1 });
    };
    PPNotificationManager.prototype.notif_discardCard = function (notif) {
        console.log('notif_discardCard', notif);
        this.game.interactionManager.resetActionArgs();
        var playerId = Number(notif.args.playerId);
        var from = notif.args.from;
        if (from == 'hand') {
            // TODO (Frans): check how this works for other players than the one whos card gets discarded
            this.game.discardCard({ id: notif.args.cardId, from: this.getPlayer({ playerId: playerId }).getHandZone() });
        }
        else if (from == 'market_0_0' || from == 'market_1_0') {
            var splitFrom = from.split('_');
            this.game.discardCard({
                id: notif.args.cardId,
                from: this.game.market.getMarketCardZone({ row: Number(splitFrom[1]), column: Number(splitFrom[2]) }),
            });
        }
        else {
            this.game.discardCard({ id: notif.args.cardId, from: this.getPlayer({ playerId: playerId }).getCourtZone() });
            // TODO: check if it is needed to update weight of cards in zone?
        }
    };
    PPNotificationManager.prototype.notif_dominanceCheck = function (notif) {
        var _this = this;
        console.log('notif_dominanceCheck', notif);
        var _a = notif.args, scores = _a.scores, moves = _a.moves;
        Object.keys(scores).forEach(function (playerId) {
            _this.game.framework().scoreCtrl[playerId].toValue(scores[playerId].new_score);
            _this.game.move({
                id: "vp_cylinder_".concat(playerId),
                from: _this.game.objectManager.vpTrack.getZone(scores[playerId].current_score),
                to: _this.game.objectManager.vpTrack.getZone(scores[playerId].new_score),
            });
        });
        (moves || []).forEach(function (move) {
            var token_id = move.token_id, from = move.from, to = move.to;
            var coalition = to.split('_')[1];
            var splitFrom = from.split('_');
            var isArmy = splitFrom[0] == 'armies';
            _this.game.move({
                id: token_id,
                to: _this.game.objectManager.supply.getCoalitionBlocksZone({ coalition: coalition }),
                from: isArmy
                    ? _this.game.map.getRegion({ region: splitFrom[1] }).getArmyZone()
                    : _this.game.map.getBorder({ border: "".concat(splitFrom[1], "_").concat(splitFrom[2]) }).getRoadZone(),
                addClass: ['pp_coalition_block'],
                removeClass: isArmy ? ['pp_army'] : ['pp_road'],
            });
        });
    };
    PPNotificationManager.prototype.notif_playCard = function (notif) {
        console.log('notif_playCard', notif);
        this.game.interactionManager.resetActionArgs();
        var playerId = Number(notif.args.playerId);
        var player = this.getPlayer({ playerId: playerId });
        notif.args.courtCards.forEach(function (card, index) {
            var item = player.getCourtZone().items.find(function (item) { return item.id === card.id; });
            if (item) {
                item.weight = card.state;
            }
        });
        player.moveToCourt({
            card: notif.args.card,
            from: Number(playerId) === this.game.getPlayerId() ? player.getHandZone() : null,
        });
        this.getPlayer({ playerId: playerId }).getCourtZone().updateDisplay();
    };
    PPNotificationManager.prototype.notif_purchaseCard = function (notif) {
        var _this = this;
        console.log('notif_purchaseCard', notif);
        var _a = notif.args, marketLocation = _a.marketLocation, newLocation = _a.newLocation, updatedCards = _a.updatedCards;
        var playerId = Number(notif.args.playerId);
        this.game.interactionManager.resetActionArgs();
        var row = Number(marketLocation.split('_')[1]);
        var col = Number(marketLocation.split('_')[2]);
        // Remove all rupees that were on the purchased card
        this.game.market.removeRupeesFromCard({ row: row, column: col, to: "rupees_".concat(playerId) });
        // Move card from markt
        var cardId = notif.args.card.id;
        if (newLocation == 'active_events') {
            this.game.move({
                id: cardId,
                from: this.game.market.getMarketCardZone({ row: row, column: col }),
                to: this.game.activeEvents,
            });
        }
        else if (newLocation == 'discard') {
            this.game.market.getMarketCardZone({ row: row, column: col }).removeFromZone(cardId, true, 'pp_discard_pile');
        }
        else if (playerId === this.game.getPlayerId()) {
            this.getPlayer({ playerId: playerId }).moveToHand({ cardId: cardId, from: this.game.market.getMarketCardZone({ row: row, column: col }) });
        }
        else {
            this.game.market.getMarketCardZone({ row: row, column: col }).removeFromZone(cardId, true, "cards_".concat(playerId));
        }
        // Place paid rupees on market cards
        updatedCards.forEach(function (item, index) {
            var row = item.row, column = item.column, rupeeId = item.rupeeId;
            _this.game.market.placeRupeeOnCard({ row: row, column: column, rupeeId: rupeeId, fromDiv: "rupees_".concat(playerId) });
        });
    };
    PPNotificationManager.prototype.notif_refreshMarket = function (notif) {
        var _this = this;
        console.log('notif_refreshMarket', notif);
        this.game.interactionManager.resetActionArgs();
        notif.args.cardMoves.forEach(function (move, index) {
            var fromRow = Number(move.from.split('_')[1]);
            var fromCol = Number(move.from.split('_')[2]);
            var toRow = Number(move.to.split('_')[1]);
            var toCol = Number(move.to.split('_')[2]);
            _this.game.move({
                id: move.cardId,
                from: _this.game.market.getMarketCardZone({ row: fromRow, column: fromCol }),
                to: _this.game.market.getMarketCardZone({ row: toRow, column: toCol }),
            });
            // TODO (Frans): check why in case of moving multiple rupees at the same time
            // they overlap
            _this.game.market
                .getMarketRupeesZone({ row: fromRow, column: fromCol })
                .getAllItems()
                .forEach(function (rupeeId) {
                _this.game.move({
                    id: rupeeId,
                    to: _this.game.market.getMarketRupeesZone({ row: toRow, column: toCol }),
                    from: _this.game.market.getMarketRupeesZone({ row: fromRow, column: toRow }),
                });
            });
        });
        notif.args.newCards.forEach(function (move, index) {
            dojo.place(tplCard({ cardId: move.cardId, extraClasses: 'pp_market_card' }), 'pp_market_deck');
            _this.game.market
                .getMarketCardZone({ row: Number(move.to.split('_')[1]), column: Number(move.to.split('_')[2]) })
                .placeInZone(move.cardId);
        });
    };
    PPNotificationManager.prototype.notif_selectGift = function (notif) {
        var _this = this;
        console.log('notif_selectGift', notif);
        this.game.interactionManager.resetActionArgs();
        var _a = notif.args, updated_cards = _a.updated_cards, player_id = _a.player_id, rupee_count = _a.rupee_count, updated_counts = _a.updated_counts;
        // Place paid rupees on market cards
        updated_cards.forEach(function (item, index) {
            var marketRow = item.location.split('_')[1];
            var marketColumn = item.location.split('_')[2];
            placeToken({
                game: _this.game,
                location: _this.game.market.getMarketRupeesZone({ row: marketRow, column: marketColumn }),
                id: item.rupee_id,
                jstpl: 'jstpl_rupee',
                jstplProps: {
                    id: item.rupee_id,
                },
                from: "rupees_".concat(player_id),
            });
        }, this);
        this.getPlayer({ playerId: notif.args.player_id }).setCounter({ counter: 'rupees', value: updated_counts.rupees });
        this.getPlayer({ playerId: notif.args.player_id }).setCounter({ counter: 'influence', value: updated_counts.influence });
    };
    PPNotificationManager.prototype.notif_updatePlayerCounts = function (notif) {
        var _this = this;
        console.log('notif_updatePlayerCounts', notif);
        this.game.playerCounts = notif.args.counts;
        var counts = notif.args.counts;
        Object.keys(counts).forEach(function (playerId) {
            var player = _this.getPlayer({ playerId: Number(playerId) });
            player.setCounter({ counter: 'influence', value: counts[playerId].influence });
            player.setCounter({ counter: 'cylinders', value: counts[playerId].cylinders });
            player.setCounter({ counter: 'rupees', value: counts[playerId].rupees });
            player.setCounter({ counter: 'cards', value: counts[playerId].cards });
            player.setCounter({ counter: 'economic', value: counts[playerId].suits.economic });
            player.setCounter({ counter: 'military', value: counts[playerId].suits.military });
            player.setCounter({ counter: 'political', value: counts[playerId].suits.political });
            player.setCounter({ counter: 'intelligence', value: counts[playerId].suits.intelligence });
        });
    };
    PPNotificationManager.prototype.notif_moveToken = function (notif) {
        var _this = this;
        console.log('notif_moveToken', notif);
        notif.args.moves.forEach(function (move) {
            var token_id = move.token_id, from = move.from, to = move.to, updates = move.updates;
            var fromZone = _this.game.getZoneForLocation({ location: from });
            var toZone = _this.game.getZoneForLocation({ location: to });
            // TODO: perhaps create separate function for this
            var addClass = to.startsWith('armies') ? ['pp_army'] : to.startsWith('roads') ? ['pp_road'] : undefined;
            var removeClass = from.startsWith('blocks') ? ['pp_coalition_block'] : undefined;
            _this.game.move({
                id: token_id,
                from: fromZone,
                to: toZone,
                addClass: addClass,
                removeClass: removeClass,
            });
        });
    };
    PPNotificationManager.prototype.notif_log = function (notif) {
        // this is for debugging php side
        console.log('notif_log', notif);
        console.log(notif.log);
        console.log(notif.args);
    };
    return PPNotificationManager;
}());
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
var PaxPamir = /** @class */ (function () {
    function PaxPamir() {
        // global variables
        this.defaultWeightZone = 0;
        this.playerEvents = {}; // events per player
        this.activeEvents = new ebg.zone(); // active events
        this.spies = {}; // spies per cards
        this.playerCounts = {}; // rename to playerTotals?
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
    PaxPamir.prototype.setup = function (gamedatas) {
        var _this = this;
        // Create a new div for buttons to avoid BGA auto clearing it
        dojo.place("<div id='customActions' style='display:inline-block'></div>", $('generalactions'), 'after');
        this.gamedatas = gamedatas;
        console.log('gamedatas', gamedatas);
        // Events
        this.activeEvents.create(this, 'pp_active_events', CARD_WIDTH, CARD_HEIGHT);
        this.activeEvents.instantaneous = true;
        this.activeEvents.item_margin = 16;
        // Add current event cards
        gamedatas.activeEvents.forEach(function (card) {
            dojo.place(tplCard({ cardId: card.id }), 'pp_active_events');
            _this.activeEvents.placeInZone(card.id);
        });
        this.activeEvents.instantaneous = false;
        this.objectManager = new PPObjectManager(this);
        this.playerManager = new PPPlayerManager(this);
        this.map = new PPMap(this);
        this.market = new PPMarket(this);
        this.interactionManager = new PPInteractionManager(this);
        this.playerCounts = gamedatas.counts;
        // TODO: refactor
        // Place spies on cards
        Object.keys(gamedatas.spies || {}).forEach(function (cardId) {
            (gamedatas.spies[cardId] || []).forEach(function (cylinder) {
                var playerId = cylinder.id.split('_')[1];
                placeToken({
                    game: _this,
                    location: _this.spies[cardId],
                    id: cylinder.id,
                    jstpl: 'jstpl_cylinder',
                    jstplProps: {
                        id: cylinder.id,
                        color: gamedatas.players[playerId].color,
                    },
                    weight: _this.defaultWeightZone,
                });
            });
        });
        if (this.notificationManager != undefined) {
            this.notificationManager.destroy();
        }
        this.notificationManager = new PPNotificationManager(this);
        // // Setup game notifications to handle (see "setupNotifications" method below)
        this.notificationManager.setupNotifications();
        // this.setupNotifications();
        console.log('Ending game setup');
    };
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
    PaxPamir.prototype.onEnteringState = function (stateName, args) {
        console.log('Entering state: ' + stateName, args.args);
        this.interactionManager.onEnteringState(stateName, args);
    };
    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    PaxPamir.prototype.onLeavingState = function (stateName) {
        console.log('Leaving state: ' + stateName);
        this.interactionManager.onLeavingState(stateName);
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    PaxPamir.prototype.onUpdateActionButtons = function (stateName, args) {
        console.log('onUpdateActionButtons: ' + stateName);
        // this.interactionManager.onUpdateActionButtons(stateName, args);
    };
    //  .##.....##.########.####.##.......####.########.##....##
    //  .##.....##....##.....##..##........##.....##.....##..##.
    //  .##.....##....##.....##..##........##.....##......####..
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  ..#######.....##....####.########.####....##.......##...
    ///////////////////////////////////////////////////
    //// Utility methods - add in alphabetical order
    PaxPamir.prototype.discardCard = function (_a) {
        var _this = this;
        var _b;
        var id = _a.id, from = _a.from, _c = _a.order, order = _c === void 0 ? null : _c;
        // Move all spies back to cylinder pools
        if ((_b = this.spies) === null || _b === void 0 ? void 0 : _b[id]) {
            // ['cylinder_2371052_3']
            var items = this.spies[id].getAllItems();
            items.forEach(function (cylinderId) {
                var playerId = cylinderId.split('_')[1];
                _this.move({
                    id: cylinderId,
                    to: _this.playerManager.getPlayer({ playerId: playerId }).getCylinderZone(),
                    from: _this.spies[id],
                });
            });
        }
        from.removeFromZone(id, true, 'pp_discard_pile');
    };
    PaxPamir.prototype.framework = function () {
        return this;
    };
    PaxPamir.prototype.getPlayerId = function () {
        return Number(this.framework().player_id);
    };
    // returns zone object for given backend location in token database
    PaxPamir.prototype.getZoneForLocation = function (_a) {
        var location = _a.location;
        var splitLocation = location.split('_');
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
                var border = "".concat(splitLocation[1], "_").concat(splitLocation[2]);
                return this.map.getBorder({ border: border }).getRoadZone();
            case 'spies':
                // spies_card_38
                var cardId = "".concat(splitLocation[1], "_").concat(splitLocation[2]);
                return this.spies[cardId];
            case 'tribes':
                // tribes_kabul
                return this.map.getRegion({ region: splitLocation[1] }).getTribeZone();
            default:
                console.log('no zone determined');
                break;
        }
    };
    PaxPamir.prototype.moveCard = function (_a) {
        var id = _a.id, from = _a.from, _b = _a.to, to = _b === void 0 ? null : _b, _c = _a.order, order = _c === void 0 ? null : _c;
        var fromDiv = null;
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
    };
    PaxPamir.prototype.move = function (_a) {
        var id = _a.id, to = _a.to, from = _a.from, _b = _a.weight, weight = _b === void 0 ? this.defaultWeightZone : _b, _c = _a.addClass, addClass = _c === void 0 ? [] : _c, _d = _a.removeClass, removeClass = _d === void 0 ? [] : _d;
        addClass.forEach(function (newClass) {
            dojo.addClass(id, newClass);
        });
        removeClass.forEach(function (oldClass) {
            dojo.removeClass(id, oldClass);
        });
        to.placeInZone(id, weight);
        from.removeFromZone(id, false);
    };
    PaxPamir.prototype.createSpyZone = function (_a) {
        var cardId = _a.cardId;
        var spyZoneId = 'spies_' + cardId;
        dojo.place("<div id=\"".concat(spyZoneId, "\" class=\"pp_spy_zone\"></div>"), cardId);
        this.setupCardSpyZone({ nodeId: spyZoneId, cardId: cardId });
    };
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
    PaxPamir.prototype.setupCardSpyZone = function (_a) {
        var nodeId = _a.nodeId, cardId = _a.cardId;
        // Note (Frans): we probably need to remove spies before moving / placing card
        if (this.spies[cardId]) {
            this.spies[cardId].removeAll();
        }
        // ** setup for zone
        this.spies[cardId] = new ebg.zone();
        this.spies[cardId].create(this, nodeId, CYLINDER_WIDTH, CYLINDER_HEIGHT);
        this.spies[cardId].item_margin = 4;
    };
    // Updates weight of item in the stock component for ordering purposes
    PaxPamir.prototype.updateCard = function (_a) {
        var _b;
        var location = _a.location, id = _a.id, order = _a.order;
        location.changeItemsWeight((_b = {}, _b[id] = order, _b));
    };
    // public setupNotifications() {}
    //....###..........##....###....##.....##
    //...##.##.........##...##.##....##...##.
    //..##...##........##..##...##....##.##..
    //.##.....##.......##.##.....##....###...
    //.#########.##....##.#########...##.##..
    //.##.....##.##....##.##.....##..##...##.
    //.##.....##..######..##.....##.##.....##
    PaxPamir.prototype.actionError = function (actionName) {
        this.framework().showMessage("cannot take ".concat(actionName, " action"), 'error');
    };
    /*
     * Make an AJAX call with automatic lock
     */
    PaxPamir.prototype.takeAction = function (_a) {
        var action = _a.action, _b = _a.data, data = _b === void 0 ? {} : _b;
        console.log("takeAction ".concat(action), data);
        if (!this.framework().checkAction(action)) {
            this.actionError(action);
            return;
        }
        data.lock = true;
        var gameName = this.framework().game_name;
        this.framework().ajaxcall("/".concat(gameName, "/").concat(gameName, "/").concat(action, ".html"), data, this, function () { });
    };
    return PaxPamir;
}());
define(['dojo', 'dojo/_base/declare', 'ebg/core/gamegui', 'ebg/counter', 'ebg/stock', 'ebg/zone'], function (dojo, declare) {
    return declare('bgagame.paxpamireditiontwo', ebg.core.gamegui, new PaxPamir());
});
