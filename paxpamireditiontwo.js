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
var placeCard = function (_a) {
    var _b;
    var location = _a.location, id = _a.id, _c = _a.order, order = _c === void 0 ? null : _c;
    if (order != null) {
        location.changeItemsWeight((_b = {},
            _b[id] = order,
            _b));
    }
    location.addToStockWithId(id, id, 'pp_market_deck');
    // this.setupCardSpyZone({location, cardId: id});
    // this.addTooltip( location.getItemDivId(id), id, '' );
};
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
// Function to setup stock components for cards
var setupCardsStock = function (_a) {
    var game = _a.game, stock = _a.stock, nodeId = _a.nodeId, className = _a.className;
    var useLargeCards = false;
    stock.create(game, $(nodeId), CARD_WIDTH, CARD_HEIGHT);
    // const backgroundSize = useLargeCards ? '17550px 209px' : '17700px';
    var backgroundSize = useLargeCards ? '11700% 100%' : '11800% 100%';
    stock.image_items_per_row = useLargeCards ? 117 : 118;
    stock.item_margin = 10;
    // TODO: below is option to customize the created div (and add zones to card for example)
    stock.jstpl_stock_item =
        '<div id="${id}" class="stockitem pp_card ' +
            className +
            '" \
              style="top:${top}px;left:${left}px;width:${width}px;height:${height}px;z-index:${position};background-size:' +
            backgroundSize +
            ";\
              background-image:url('${image}');\"></div>";
    Object.keys(game.gamedatas.cards).forEach(function (cardId) {
        var cardFileLocation = useLargeCards
            ? g_gamethemeurl + 'img/temp/cards/cards_tileset_original_495_692.jpg'
            : g_gamethemeurl + 'img/temp/cards_medium/cards_tileset_medium_215_300.jpg';
        stock.addItemType(cardId, 0, cardFileLocation, useLargeCards ? Number(cardId.split('_')[1]) - 1 : Number(cardId.split('_')[1]));
    });
    stock.extraClasses = "pp_card ".concat(className);
    stock.setSelectionMode(0);
    stock.onItemCreate = dojo.hitch(game, 'setupNewCard');
};
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
var updatePlayerLoyalty = function (_a) {
    var playerId = _a.playerId, coalition = _a.coalition;
    dojo
        .query("#loyalty_icon_".concat(playerId))
        .removeClass('pp_loyalty_afghan')
        .removeClass('pp_loyalty_british')
        .removeClass('pp_loyalty_russian')
        .addClass("pp_loyalty_".concat(coalition));
    dojo
        .query("#pp_loyalty_dial_".concat(playerId))
        .removeClass('pp_loyalty_afghan')
        .removeClass('pp_loyalty_british')
        .removeClass('pp_loyalty_russian')
        .addClass("pp_loyalty_".concat(coalition));
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
        game.gamedatas.suits.forEach(function (suit) {
            _this.favoredSuitZones[suit.suit] = new ebg.zone();
            setupTokenZone({
                game: game,
                zone: _this.favoredSuitZones[suit.suit],
                nodeId: "pp_favored_suit_".concat(suit.suit),
                tokenWidth: FAVORED_SUIT_MARKER_WIDTH,
                tokenHeight: FAVORED_SUIT_MARKER_HEIGHT,
            });
        });
        var suitId = game.gamedatas.favored_suit.suit;
        placeToken({
            game: game,
            location: this.favoredSuitZones[suitId],
            //location: this.favoredSuit['intelligence'], // for testing change of favored suit
            id: "favored_suit_marker",
            jstpl: 'jstpl_favored_suit_marker',
            jstplProps: {
                id: "favored_suit_marker",
            },
        });
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
            Object.keys(game.gamedatas.coalition_blocks[coalition]).forEach(function (blockId) {
                placeToken({
                    game: game,
                    location: _this.coalitionBlocks[coalition],
                    id: blockId,
                    jstpl: 'jstpl_coalition_block',
                    jstplProps: {
                        id: blockId,
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
var ObjectManager = /** @class */ (function () {
    function ObjectManager(game) {
        console.log('ObjectManager');
        this.game = game;
        this.favoredSuit = new FavoredSuit({ game: game });
        this.supply = new Supply({ game: game });
        this.vpTrack = new VpTrack({ game: game });
    }
    return ObjectManager;
}());
//  .########..##..........###....##....##.########.########.
//  .##.....##.##.........##.##....##..##..##.......##.....##
//  .##.....##.##........##...##....####...##.......##.....##
//  .########..##.......##.....##....##....######...########.
//  .##........##.......#########....##....##.......##...##..
//  .##........##.......##.....##....##....##.......##....##.
//  .##........########.##.....##....##....########.##.....##
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
var Player = /** @class */ (function () {
    function Player(_a) {
        var game = _a.game, player = _a.player;
        var _this = this;
        // console.log("Player", player);
        this.game = game;
        var playerId = player.id;
        this.playerId = playerId;
        this.playerName = player.name;
        this.playerColor = player.color;
        var gamedatas = game.gamedatas;
        // Create player court stock
        this.court = new ebg.stock();
        setupCardsStock({
            game: this.game,
            stock: this.court,
            nodeId: "pp_court_player_".concat(playerId),
            className: "pp_card_in_court_".concat(playerId),
        });
        // Add court cards played by player to court
        gamedatas.court[playerId].forEach(function (card) {
            placeCard({
                location: _this.court,
                id: card.key,
                order: card.state,
            });
        });
        // Create cylinder zone
        this.cylinders = new ebg.zone();
        setupTokenZone({
            game: this.game,
            zone: this.cylinders,
            nodeId: "pp_cylinders_player_".concat(playerId),
            tokenWidth: CYLINDER_WIDTH,
            tokenHeight: CYLINDER_HEIGHT,
            itemMargin: 10,
        });
        // Add cylinders to zone
        Object.keys(gamedatas.cylinders[playerId]).forEach(function (cylinderId) {
            placeToken({
                game: _this.game,
                location: _this.cylinders,
                id: cylinderId,
                jstpl: 'jstpl_cylinder',
                jstplProps: {
                    id: cylinderId,
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
        // Set up players board
        var player_board_div = $('player_board_' + playerId);
        dojo.place(this.game.format_block('jstpl_player_board', __assign(__assign({}, player), { p_color: player.color })), player_board_div);
        if (player.loyalty !== 'null') {
            updatePlayerLoyalty({ playerId: playerId, coalition: player.loyalty });
        }
        // TODO (Frans): check use of counter component for all counts
        $('cylinders_' + playerId).classList.add("pp_player_color_".concat(player.color));
        // Set all values in player panels
        $('influence_' + playerId).innerHTML = gamedatas.counts[playerId].influence;
        $('cylinder_count_' + playerId).innerHTML = gamedatas.counts[playerId].cylinders;
        $('rupee_count_' + playerId).innerHTML = gamedatas.players[playerId].rupees;
        $('card_count_' + playerId).innerHTML = gamedatas.counts[playerId].cards;
        $('economic_' + playerId).innerHTML = gamedatas.counts[playerId].suits.economic;
        $('military_' + playerId).innerHTML = gamedatas.counts[playerId].suits.military;
        $('political_' + playerId).innerHTML = gamedatas.counts[playerId].suits.political;
        $('intelligence_' + playerId).innerHTML = gamedatas.counts[playerId].suits.intelligence;
    }
    Player.prototype.getCourtZone = function () {
        return this.court;
    };
    Player.prototype.getCylinderZone = function () {
        return this.cylinders;
    };
    Player.prototype.getGiftZone = function (_a) {
        var value = _a.value;
        return this.gifts[value];
    };
    Player.prototype.getPlayerColor = function () {
        return this.playerColor;
    };
    return Player;
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
var PlayerManager = /** @class */ (function () {
    function PlayerManager(game) {
        console.log('Constructor PlayerManager');
        this.game = game;
        this.players = {};
        for (var playerId in game.gamedatas.players) {
            var player = game.gamedatas.players[playerId];
            // console.log("playerManager", playerId, player);
            this.players[playerId] = new Player({ player: player, game: this.game });
        }
        // console.log("players", this.players);
    }
    PlayerManager.prototype.getPlayer = function (_a) {
        var playerId = _a.playerId;
        return this.players[playerId];
    };
    return PlayerManager;
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
        this.ruler = game.gamedatas.rulers[region];
        if (this.ruler === '0') {
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
    }
    Region.prototype.getArmyZone = function () {
        return this.armyZone;
    };
    Region.prototype.getRulerZone = function () {
        this.rulerZone;
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
var MapManager = /** @class */ (function () {
    function MapManager(game) {
        var _this = this;
        console.log('Constructor Map');
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
    MapManager.prototype.getBorder = function (_a) {
        var border = _a.border;
        return this.borders[border];
    };
    MapManager.prototype.getRegion = function (_a) {
        var region = _a.region;
        return this.regions[region];
    };
    return MapManager;
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
var MarketManager = /** @class */ (function () {
    function MarketManager(game) {
        var _this = this;
        console.log('MarketManager');
        this.game = game;
        this.marketCards = [];
        this.marketRupees = [];
        // Set up market
        for (var row = 0; row <= 1; row++) {
            this.marketCards[row] = [];
            this.marketRupees[row] = [];
            for (var column = 0; column <= 5; column++) {
                // Set up stock component for each card in the market
                var containerId = "pp_market_".concat(row, "_").concat(column);
                this.marketCards[row][column] = new ebg.stock();
                setupCardsStock({
                    game: game,
                    stock: this.marketCards[row][column],
                    nodeId: containerId,
                    className: 'pp_market_card',
                });
                // Set up zone for all rupees in the market
                var rupeeContainerId = "pp_market_".concat(row, "_").concat(column, "_rupees");
                this.marketRupees[row][column] = new ebg.zone();
                setupTokenZone({
                    game: game,
                    zone: this.marketRupees[row][column],
                    nodeId: rupeeContainerId,
                    tokenWidth: RUPEE_WIDTH,
                    tokenHeight: RUPEE_HEIGHT,
                    itemMargin: -30,
                });
                // add cards
                var cardInMarket = game.gamedatas.market[row][column];
                if (cardInMarket) {
                    placeCard({
                        location: this.marketCards[row][column],
                        id: cardInMarket.key,
                    });
                }
            }
        }
        // Put all rupees in market locations
        Object.keys(game.gamedatas.rupees).forEach(function (rupeeId) {
            var rupee = game.gamedatas.rupees[rupeeId];
            if (rupee.location.startsWith('market')) {
                var row = rupee.location.split('_')[1];
                var column = rupee.location.split('_')[2];
                placeToken({
                    game: game,
                    location: _this.marketRupees[row][column],
                    id: rupeeId,
                    jstpl: 'jstpl_rupee',
                    jstplProps: {
                        id: rupeeId,
                    },
                });
            }
        });
    }
    MarketManager.prototype.getMarketCardsStock = function (_a) {
        var row = _a.row, column = _a.column;
        return this.marketCards[row][column];
    };
    MarketManager.prototype.getMarketRupeesZone = function (_a) {
        var row = _a.row, column = _a.column;
        return this.marketRupees[row][column];
    };
    return MarketManager;
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
var InteractionManager = /** @class */ (function () {
    function InteractionManager(game) {
        console.log('Interaction Manager');
        this.game = game;
        this.handles = [];
        this.selectedAction = undefined;
        // Will store all data for active player and gets refreshed with entering player actions state
        this.activePlayer = {};
    }
    InteractionManager.prototype.resetActionArgs = function () {
        console.log('resetActionArgs');
        // Remove all selectable / selected classes
        dojo.query('.pp_selectable_card').removeClass('pp_selectable_card');
        dojo.query('.pp_selected').removeClass('pp_selected');
        dojo.query('.pp_selectable').removeClass('pp_selectable');
        // getElementById used because dojo does not seem to handle svgs well.
        REGIONS.forEach(function (region) {
            var element = document.getElementById("pp_region_".concat(region));
            element.classList.remove('pp_selectable');
        });
        document.getElementById('pp_map_areas').classList.remove('pp_selectable');
        // reset handles
        dojo.forEach(this.handles, dojo.disconnect);
        this.handles = [];
    };
    //  .##.....##.########.####.##.......####.########.##....##
    //  .##.....##....##.....##..##........##.....##.....##..##.
    //  .##.....##....##.....##..##........##.....##......####..
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  ..#######.....##....####.########.####....##.......##...
    InteractionManager.prototype.updateSelectableActions = function () {
        var _this = this;
        console.log('updateSelectableActions', this.selectedAction);
        this.resetActionArgs();
        var playerId = this.game.getPlayerId();
        switch (this.selectedAction) {
            case 'cardActionBattle':
                console.log('battle');
                console.log('dojo', dojo);
                var container = document.getElementById("pp_map_areas");
                container.classList.add('pp_selectable');
                REGIONS.forEach(function (region) {
                    console.log('region', region);
                    var element = document.getElementById("pp_region_".concat(region));
                    // console.log(node);
                    element.classList.add('pp_selectable');
                    _this.handles.push(dojo.connect(element, 'onclick', _this, 'onSelectRegion'));
                    // dojo.query(`#pp_region_${region}`).forEach((node) => {
                    // dojo.query(`.pp_region`).forEach((node) => {
                    // dojo.query('#pp_map_areas').forEach((node) => {
                    //     dojo.addClass(node, 'pp_selectable');
                    //     this.handles.push(dojo.connect(node,'onclick', this, 'onSelectRegion'));
                    // })
                });
                break;
            case 'cardAction':
                // Note Frans: perhaps there is a better way to get the court cards for the player
                // based on backend data
                dojo.query(".pp_card_in_court_".concat(playerId)).forEach(function (node) {
                    var _a, _b;
                    var splitNodeId = node.id.split('_');
                    var cardId = "".concat(splitNodeId[5], "_").concat(splitNodeId[6]);
                    var used = ((_b = (_a = _this.activePlayer.court) === null || _a === void 0 ? void 0 : _a.find(function (card) { return card.key === cardId; })) === null || _b === void 0 ? void 0 : _b.used) === '1';
                    if (!used &&
                        (_this.activePlayer.remainingActions > 0 ||
                            _this.game.gamedatas.cards[cardId].suit === _this.activePlayer.favoredSuit))
                        dojo.map(node.children, function (child) {
                            if (dojo.hasClass(child, 'pp_card_action')) {
                                dojo.addClass(child, 'pp_selectable');
                                _this.handles.push(dojo.connect(child, 'onclick', _this, 'onCardActionClick'));
                            }
                        });
                });
                break;
            case 'cardActionGift':
                ['2', '4', '6'].forEach(function (giftValue) {
                    var hasGift = _this.game.playerManager
                        .getPlayer({ playerId: playerId })
                        .getGiftZone({
                        value: giftValue,
                    })
                        .getAllItems().length > 0;
                    if (!hasGift && giftValue <= _this.activePlayer.rupees) {
                        dojo.query("#pp_gift_".concat(giftValue, "_").concat(playerId)).forEach(function (node) {
                            dojo.addClass(node, 'pp_selectable');
                            _this.handles.push(dojo.connect(node, 'onclick', _this, 'onSelectGift'));
                        });
                    }
                });
                break;
            default:
                break;
        }
    };
    InteractionManager.prototype.updateSelectableCards = function (args) {
        var _this = this;
        if (args === void 0) { args = null; }
        console.log('updateSelectableCards', this.selectedAction);
        this.resetActionArgs();
        switch (this.selectedAction) {
            case 'purchase':
                dojo.query('.pp_market_card').forEach(function (node) {
                    var cost = node.id.split('_')[3]; // cost is equal to the column number
                    var cardId = node.id.split('_')[6];
                    if (cost <= _this.activePlayer.rupees && !_this.activePlayer.unavailableCards.includes('card_' + cardId)) {
                        dojo.addClass(node, 'pp_selectable_card');
                        _this.handles.push(dojo.connect(node, 'onclick', _this, 'onCard'));
                    }
                }, this);
                break;
            case 'play':
            case 'discard_hand':
                dojo.query('.pp_card_in_hand').forEach(function (node, index) {
                    dojo.addClass(node, 'pp_selectable_card');
                    this.handles.push(dojo.connect(node, 'onclick', this, 'onCard'));
                }, this);
                break;
            case 'discard_court':
                dojo.query(".pp_card_in_court_".concat(this.game.getPlayerId())).forEach(function (node, index) {
                    dojo.addClass(node, 'pp_selectable_card');
                    this.handles.push(dojo.connect(node, 'onclick', this, 'onCard'));
                }, this);
                break;
            case 'placeSpy':
                dojo.query(".pp_card_in_court_".concat((args === null || args === void 0 ? void 0 : args.region) ? args.region : '')).forEach(function (node, index) {
                    dojo.addClass(node, 'pp_selectable_card');
                    this.handles.push(dojo.connect(node, 'onclick', this, 'onCard'));
                }, this);
                break;
            // case 'card_action':
            //     break;
            default:
                break;
        }
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
    InteractionManager.prototype.onEnteringState = function (stateName, args) {
        // UI changes for active player
        if (this.game.isCurrentPlayerActive()) {
            switch (stateName) {
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
                    var _a = args.args, court = _a.court, favored_suit = _a.favored_suit, remaining_actions = _a.remaining_actions, rupees = _a.rupees, unavailable_cards = _a.unavailable_cards;
                    this.activePlayer = {
                        court: court,
                        favoredSuit: favored_suit,
                        remainingActions: Number(remaining_actions),
                        rupees: rupees,
                        unavailableCards: unavailable_cards,
                    };
                    // this.unavailableCards = args.args.unavailable_cards;
                    // this.remainingActions = args.args.remaining_actions;
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
    InteractionManager.prototype.onLeavingState = function (stateName) {
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
    InteractionManager.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        if (!this.game.isCurrentPlayerActive()) {
            return;
        }
        switch (stateName) {
            case 'setup':
                this.game.addActionButton('afghan_button', _('Afghan'), 'onActionButtonClick', null, false, 'blue');
                this.game.addActionButton('british_button', _('British'), 'onActionButtonClick', null, false, 'blue');
                this.game.addActionButton('russian_button', _('Russian'), 'onActionButtonClick', null, false, 'blue');
                break;
            case 'playerActions':
                var main = $('pagemaintitletext');
                if (args.remaining_actions > 0) {
                    main.innerHTML +=
                        _(' may take ') +
                            '<span id="remaining_actions_value" style="font-weight:bold;color:#ED0023;">' +
                            args.remaining_actions +
                            '</span>' +
                            _(' action(s): ');
                    this.game.addActionButton('purchase_btn', _('Purchase'), 'onPurchase');
                    this.game.addActionButton('play_btn', _('Play'), 'onPlay');
                    this.game.addActionButton('card_action_btn', _('Card Action'), 'onCardAction');
                    this.game.addActionButton('pass_btn', _('End Turn'), 'onPass', null, false, 'gray');
                }
                else {
                    main.innerHTML +=
                        _(' have ') +
                            '<span id="remaining_actions_value" style="font-weight:bold;color:#ED0023;">' +
                            args.remaining_actions +
                            '</span>' +
                            _(' remaining actions: ');
                    // If player has court cards with free actions
                    if (args.court.some(function (_a) {
                        var key = _a.key, used = _a.used;
                        return used == '0' && _this.game.gamedatas.cards[key].suit == args.favored_suit;
                    })) {
                        this.game.addActionButton('card_action_btn', _('Card Action'), 'onCardAction');
                    }
                    this.game.addActionButton('pass_btn', _('End Turn'), 'onPass', null, false, 'blue');
                }
                break;
            // case 'negotiateBribe':
            //     for ( var i = 0; i <= args.briber_max; i++ ) {
            //         this.game.addActionButton( i+'_btn', $i, 'onBribe', null, false, 'blue' );
            //     }
            //     break;
            case 'discardCourt':
                this.numberOfDiscards = Object.keys(args.court).length - args.suits.political - 3;
                if (this.numberOfDiscards > 1)
                    var cardmsg = _(' court cards ');
                else
                    cardmsg = _(' court card');
                $('pagemaintitletext').innerHTML +=
                    '<span id="remaining_actions_value" style="font-weight:bold;color:#ED0023;">' + this.numberOfDiscards + '</span>' + cardmsg;
                this.selectedAction = 'discard_court';
                this.updateSelectableCards();
                this.game.framework().addActionButton('confirm_btn', _('Confirm'), 'onConfirm', null, false, 'blue');
                dojo.addClass('confirm_btn', 'pp_disabled');
                break;
            case 'discardHand':
                this.numberOfDiscards = Object.keys(args.hand).length - args.suits.intelligence - 2;
                if (this.numberOfDiscards > 1)
                    var cardmsg = _(' hand cards ');
                else
                    cardmsg = _(' hand card');
                $('pagemaintitletext').innerHTML +=
                    '<span id="remaining_actions_value" style="font-weight:bold;color:#ED0023;">' + this.numberOfDiscards + '</span>' + cardmsg;
                this.selectedAction = 'discard_hand';
                this.updateSelectableCards();
                this.game.addActionButton('confirm_btn', _('Confirm'), 'onConfirm', null, false, 'blue');
                dojo.addClass('confirm_btn', 'pp_disabled');
                break;
            case 'client_confirmPurchase':
                this.game.addActionButton('confirm_btn', _('Confirm'), 'onConfirm', null, false, 'blue');
                this.game.addActionButton('cancel_btn', _('Cancel'), 'onCancel', null, false, 'red');
                break;
            case 'client_confirmPlay':
                this.game.addActionButton('left_side_btn', _('<< LEFT'), 'onLeft', null, false, 'blue');
                this.game.addActionButton('right_side_btn', _('RIGHT >>'), 'onRight', null, false, 'blue');
                this.game.addActionButton('cancel_btn', _('Cancel'), 'onCancel', null, false, 'red');
                break;
            case 'client_confirmPlaceSpy':
                this.game.addActionButton('confirm_btn', _('Confirm'), 'onConfirm', null, false, 'blue');
                this.game.addActionButton('cancel_btn', _('Cancel'), 'onCancel', null, false, 'red');
                break;
            case 'client_confirmSelectGift':
                this.game.addActionButton('confirm_btn', _('Confirm'), 'onConfirm', null, false, 'red');
                this.game.addActionButton('cancel_btn', _('Cancel'), 'onCancel', null, false, 'gray');
                break;
            case 'placeRoad':
                args.region.borders.forEach(function (border) {
                    _this.game.addActionButton("".concat(border, "_btn"), _(_this.game.gamedatas.borders[border].name), 'onBorder', null, false, 'blue');
                });
                break;
            case 'client_endTurn':
                this.game.addActionButton('confirm_btn', _('Confirm'), 'onConfirm', null, false, 'red');
                this.game.addActionButton('cancel_btn', _('Cancel'), 'onCancel', null, false, 'gray');
                break;
            case 'cardActionGift':
                this.game.addActionButton('cancel_btn', _('Cancel'), 'onCancel', null, false, 'gray');
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
                console.log('default');
                break;
        }
    };
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
    InteractionManager.prototype.onActionButtonClick = function (evt) {
        dojo.stopEvent(evt);
        var buttonId = evt.target.id;
        console.log('onActionButtonClick', buttonId);
        var gamestateName = this.game.gamedatas.gamestate.name;
        console.log('gamestateName', gamestateName);
        switch (gamestateName) {
            case 'setup':
                switch (buttonId) {
                    case 'afghan_button':
                        this.game.chooseLoyalty({ coalition: AFGHAN });
                        break;
                    case 'british_button':
                        this.game.chooseLoyalty({ coalition: BRITISH });
                        break;
                    case 'russian_button':
                        this.game.chooseLoyalty({ coalition: RUSSIAN });
                        break;
                }
                break;
            default:
                console.log('no handler for button click');
                break;
        }
    };
    InteractionManager.prototype.onPurchase = function (evt) {
        dojo.stopEvent(evt);
        if (!this.game.checkAction('purchase'))
            return;
        if (this.game.isCurrentPlayerActive()) {
            this.selectedAction = 'purchase';
            this.updateSelectableCards();
            this.game.setClientState('client_selectPurchase', {
                descriptionmyturn: _('${you} must select a card to purchase'),
            });
        }
    };
    InteractionManager.prototype.onPlay = function (evt) {
        dojo.stopEvent(evt);
        if (!this.game.checkAction('play'))
            return;
        if (this.game.isCurrentPlayerActive()) {
            this.selectedAction = 'play';
            this.updateSelectableCards();
            this.game.setClientState('client_selectPlay', {
                descriptionmyturn: _('${you} must select a card to play'),
            });
        }
    };
    InteractionManager.prototype.onSelectGift = function (evt) {
        var divId = evt.currentTarget.id;
        dojo.stopEvent(evt);
        if (!this.game.checkAction('selectGift'))
            return;
        if (this.game.isCurrentPlayerActive()) {
            var value = divId.split('_')[2];
            this.selectedAction = 'confirmSelectGift';
            this.resetActionArgs();
            this.selectedGift = value;
            dojo.query("#pp_gift_".concat(value, "_").concat(this.game.getPlayerId())).addClass('pp_selected');
            this.game.setClientState('client_confirmSelectGift', {
                descriptionmyturn: _("Purchase gift for ".concat(value, " rupees?")),
            });
        }
    };
    InteractionManager.prototype.onSelectRegion = function (evt) {
        var divId = evt.currentTarget.id;
        dojo.stopEvent(evt);
        console.log('onSelectRegion', divId, evt);
    };
    InteractionManager.prototype.onCardAction = function (evt) {
        if (!this.game.checkAction('card_action'))
            return;
        if (this.game.isCurrentPlayerActive()) {
            this.selectedAction = 'cardAction';
            this.updateSelectableActions();
            this.game.setClientState('client_selectCardAction', {
                descriptionmyturn: _('${you} must select a card action'),
            });
        }
    };
    InteractionManager.prototype.onPass = function (evt) {
        dojo.stopEvent(evt);
        if (!this.game.checkAction('pass'))
            return;
        if (this.game.isCurrentPlayerActive()) {
            this.selectedAction = 'pass';
            if (this.activePlayer.remainingActions == 0) {
                this.game.pass();
            }
            else {
                this.game.setClientState('client_endTurn', {
                    descriptionmyturn: _('Confirm to your end turn '),
                });
            }
        }
    };
    InteractionManager.prototype.onBorder = function (evt) {
        dojo.stopEvent(evt);
        if (!this.game.checkAction('placeRoad'))
            return;
        var splitId = evt.target.id.split('_');
        var border = "".concat(splitId[0], "_").concat(splitId[1]);
        this.game.placeRoad({ border: border });
    };
    InteractionManager.prototype.onCard = function (evt) {
        var cardDivId = evt.currentTarget.id;
        dojo.stopEvent(evt);
        var cardId = 'card_' + cardDivId.split('_')[6];
        this.selectedCard = cardId;
        var node;
        if (this.game.isCurrentPlayerActive()) {
            switch (this.selectedAction) {
                case 'purchase':
                    this.resetActionArgs();
                    node = $(cardDivId);
                    dojo.addClass(node, 'pp_selected');
                    var cost = cardDivId.split('_')[3];
                    this.game.setClientState('client_confirmPurchase', {
                        descriptionmyturn: 'Purchase this card for ' + cost + ' rupees?',
                    });
                    break;
                case 'play':
                    this.resetActionArgs();
                    node = $(cardDivId);
                    dojo.addClass(node, 'pp_selected');
                    this.game.setClientState('client_confirmPlay', {
                        descriptionmyturn: 'Select which side of court to play card:',
                    });
                    break;
                case 'discard_hand':
                case 'discard_court':
                    node = $(cardDivId);
                    dojo.toggleClass(node, 'pp_selected');
                    dojo.toggleClass(node, 'pp_discard');
                    if (dojo.query('.pp_selected').length == this.numberOfDiscards) {
                        dojo.removeClass('confirm_btn', 'pp_disabled');
                    }
                    else {
                        dojo.addClass('confirm_btn', 'pp_disabled');
                    }
                    break;
                case 'placeSpy':
                    this.resetActionArgs();
                    node = $(cardDivId);
                    dojo.addClass(node, 'pp_selected');
                    var cardName = this.game.gamedatas.cards[cardId].name;
                    this.game.setClientState('client_confirmPlaceSpy', {
                        descriptionmyturn: "Place a spy on ".concat(cardName),
                    });
                    break;
                default:
                    break;
            }
        }
    };
    InteractionManager.prototype.onCardActionClick = function (evt) {
        var divId = evt.currentTarget.id;
        dojo.stopEvent(evt);
        this.resetActionArgs();
        var splitId = divId.split('_');
        var cardAction = splitId[0];
        var cardId = "".concat(splitId[1], "_").concat(splitId[2]);
        switch (cardAction) {
            case 'gift':
                this.game.cardAction({ cardAction: cardAction, cardId: cardId });
                break;
            case 'battle':
                this.selectedAction = 'cardActionBattle';
                // this.updateSelectableActions();
                this.game.setClientState('client_cardActionBattle', {
                    descriptionmyturn: _('${you} must select a card or region'),
                });
                break;
            case 'default':
                console.log('default gift');
                break;
        }
    };
    InteractionManager.prototype.onCancel = function (evt) {
        dojo.stopEvent(evt);
        this.resetActionArgs();
        this.selectedAction = '';
        this.game.restoreServerGameState();
    };
    InteractionManager.prototype.onConfirm = function (evt) {
        dojo.stopEvent(evt);
        switch (this.selectedAction) {
            case 'purchase':
                var cardId = this.selectedCard;
                this.game.purchaseCard({ cardId: cardId });
                break;
            case 'pass':
                this.game.pass();
                break;
            case 'confirmSelectGift':
                this.game.selectGift({ selectedGift: this.selectedGift });
                break;
            case 'discard_hand':
            case 'discard_court':
                var cards_1 = '';
                dojo.query('.pp_selected').forEach(function (item, index) {
                    cards_1 += ' card_' + item.id.split('_')[6];
                }, this);
                this.game.discardCards({
                    cards: cards_1,
                    fromHand: this.selectedAction == 'discard_hand',
                });
                break;
            case 'placeSpy':
                this.resetActionArgs();
                this.game.placeSpy({ cardId: this.selectedCard });
                break;
            default:
                break;
        }
    };
    InteractionManager.prototype.onLeft = function (evt) {
        dojo.stopEvent(evt);
        switch (this.selectedAction) {
            case 'play':
                this.resetActionArgs();
                // var node = $( card_id );
                // dojo.addClass(node, 'selected');
                this.game.playCard({ cardId: this.selectedCard, leftSide: true });
                break;
            default:
                break;
        }
    };
    InteractionManager.prototype.onRight = function (evt) {
        dojo.stopEvent(evt);
        switch (this.selectedAction) {
            case 'play':
                this.resetActionArgs();
                // var node = $( card_id );
                // dojo.addClass(node, 'selected');
                this.game.playCard({ cardId: this.selectedCard, leftSide: false });
                break;
            default:
                break;
        }
    };
    return InteractionManager;
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
var NotificationManager = /** @class */ (function () {
    function NotificationManager(game) {
        this.game = game;
        this.subscriptions = [];
    }
    NotificationManager.prototype.destroy = function () {
        dojo.forEach(this.subscriptions, dojo.unsubscribe);
    };
    NotificationManager.prototype.setupNotifications = function () {
        var _this = this;
        console.log('notifications subscriptions setup');
        var notifs = [
            ['cardAction', 1],
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
        // this.subscriptions.push(
        //   dojo.subscribe("cardAction", this, "notif_cardAction")
        // );
        // this.subscriptions.push(
        //   dojo.subscribe("chooseLoyalty", this, "notif_chooseLoyalty")
        // );
        // this.subscriptions.push(
        //   dojo.subscribe("dominanceCheck", this, "notif_dominanceCheck")
        // );
        // this.subscriptions.push(
        //   dojo.subscribe("purchaseCard", this, "notif_purchaseCard")
        // );
        // (this.game as unknown as Framework).notifqueue.setSynchronous("purchaseCard", 2000);
        // this.subscriptions.push(dojo.subscribe("playCard", this, "notif_playCard"));
        // this.game.notifqueue.setSynchronous("playCard", 2000);
        // this.subscriptions.push(
        //   dojo.subscribe("discardCard", this, "notif_discardCard")
        // );
        // this.game.notifqueue.setSynchronous("discardCard", 500);
        // this.subscriptions.push(
        //   dojo.subscribe("refreshMarket", this, "notif_refreshMarket")
        // );
        // this.game.notifqueue.setSynchronous("refreshMarket", 250);
        // this.subscriptions.push(
        //   dojo.subscribe("selectGift", this, "notif_selectGift")
        // );
        // this.subscriptions.push(
        //   dojo.subscribe("moveToken", this, "notif_moveToken")
        // );
        // this.game.notifqueue.setSynchronous("moveToken", 250);
        this.subscriptions.push(dojo.subscribe('updatePlayerCounts', this, 'notif_updatePlayerCounts'));
        this.subscriptions.push(dojo.subscribe('log', this, 'notif_log'));
        // TODO: here, associate your game notifications with local methods
        // Example 1: standard notification handling
        // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
        // Example 2: standard notification handling + tell the user interface to wait
        //            during 3 seconds after calling the method in order to let the players
        //            see what is happening in the game.
        // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
        // this.game.notifqueue.setSynchronous( 'cardPlayed', 3000 );
        //
    };
    NotificationManager.prototype.notif_cardAction = function (notif) {
        console.log('notif_cardAction', notif);
    };
    NotificationManager.prototype.notif_chooseLoyalty = function (notif) {
        console.log('notif_chooseLoyalty');
        console.log(notif);
        var coalition = notif.args.coalition;
        var playerId = notif.args.player_id;
        updatePlayerLoyalty({ playerId: playerId, coalition: coalition });
    };
    NotificationManager.prototype.notif_discardCard = function (notif) {
        console.log('notif_discardCard', notif);
        this.game.interactionManager.resetActionArgs();
        var playerId = notif.args.player_id;
        var from = notif.args.from;
        if (from == 'hand') {
            // TODO (Frans): check how this works for other players than the one whos card gets discarded
            this.game.discardCard({ id: notif.args.card_id, from: this.game.playerHand });
        }
        else if (from == 'market_0_0' || from == 'market_1_0') {
            var splitFrom = from.split('_');
            this.game.discardCard({
                id: notif.args.card_id,
                from: this.game.marketManager.getMarketCardsStock({ row: splitFrom[1], column: splitFrom[2] }),
            });
        }
        else {
            this.game.discardCard({ id: notif.args.card_id, from: this.game.playerManager.getPlayer({ playerId: playerId }).getCourtZone() });
            notif.args.court_cards.forEach(function (card, index) {
                this.game.updateCard({
                    location: this.game.playerManager.players[playerId].court,
                    id: card.key,
                    order: card.state,
                });
            }, this);
        }
    };
    NotificationManager.prototype.notif_dominanceCheck = function (notif) {
        var _this = this;
        console.log('notif_dominanceCheck', notif);
        var _a = notif.args, scores = _a.scores, moves = _a.moves;
        Object.keys(scores).forEach(function (playerId) {
            _this.game.framework().scoreCtrl[playerId].toValue(scores[playerId].new_score);
            _this.game.moveToken({
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
            _this.game.moveToken({
                id: token_id,
                to: _this.game.objectManager.supply.getCoalitionBlocksZone({ coalition: coalition }),
                from: isArmy
                    ? _this.game.mapManager.getRegion({ region: splitFrom[1] }).getArmyZone()
                    : _this.game.mapManager.getBorder({ border: "".concat(splitFrom[1], "_").concat(splitFrom[2]) }).getRoadZone(),
                addClass: 'pp_coalition_block',
                removeClass: isArmy ? 'pp_army' : 'pp_road',
            });
        });
    };
    NotificationManager.prototype.notif_playCard = function (notif) {
        console.log('notif_playCard', notif);
        this.game.interactionManager.resetActionArgs();
        var playerId = notif.args.player_id;
        notif.args.court_cards.forEach(function (card, index) {
            this.game.updateCard({
                location: this.game.playerManager.players[playerId].court,
                id: card.key,
                order: card.state,
            });
        }, this);
        if (playerId == this.game.getPlayerId()) {
            this.game.moveCard({
                id: notif.args.card.key,
                from: this.game.playerHand,
                to: this.game.playerManager.getPlayer({ playerId: playerId }).getCourtZone(),
            });
        }
        else {
            // TODO (Frans): check why moveCard results in a UI error => probably because other players don't have a playerHand?
            // this.game.moveCard({id: notif.args.card.key, from: null, to: this.game.playerManager.players[playerId].court});
            placeCard({
                location: this.game.playerManager.getPlayer({ playerId: playerId }).getCourtZone(),
                id: notif.args.card.key,
            });
        }
        this.game.playerManager.getPlayer({ playerId: playerId }).getCourtZone().updateDisplay();
    };
    NotificationManager.prototype.notif_purchaseCard = function (notif) {
        var _this = this;
        console.log('notif_purchaseCard', notif);
        this.game.interactionManager.resetActionArgs();
        var row = notif.args.market_location.split('_')[1];
        var col = notif.args.market_location.split('_')[2];
        // Remove all rupees that were on the purchased card
        this.game.marketManager
            .getMarketRupeesZone({ row: row, column: col })
            .getAllItems()
            .forEach(function (rupeeId) {
            _this.game.marketManager.getMarketRupeesZone({ row: row, column: col }).removeFromZone(rupeeId, true, "rupees_".concat(notif.args.player_id));
        });
        // Move card from markt
        var cardId = notif.args.card.key;
        if (notif.args.new_location == 'active_events') {
            this.game.moveCard({
                id: cardId,
                from: this.game.marketManager.getMarketCardsStock({ row: row, column: col }),
                to: this.game.activeEvents,
            });
        }
        else if (notif.args.new_location == 'discard') {
            this.game.marketManager.getMarketCardsStock({ row: row, column: col }).removeFromStockById(cardId, 'pp_discard_pile');
        }
        else if (notif.args.player_id == this.game.getPlayerId()) {
            this.game.moveCard({
                id: cardId,
                from: this.game.marketManager.getMarketCardsStock({ row: row, column: col }),
                to: this.game.playerHand,
            });
        }
        else {
            this.game.moveCard({ id: cardId, from: this.game.marketManager.getMarketCardsStock({ row: row, column: col }), to: null });
            this.game.spies[cardId] = undefined;
        }
        // Place paid rupees on market cards
        notif.args.updated_cards.forEach(function (item, index) {
            var marketRow = Number(item.location.split('_')[1]);
            var marketColumn = Number(item.location.split('_')[2]);
            placeToken({
                game: _this.game,
                location: _this.game.marketManager.getMarketRupeesZone({ row: marketRow, column: marketColumn }),
                id: item.rupee_id,
                jstpl: 'jstpl_rupee',
                jstplProps: {
                    id: item.rupee_id,
                },
            });
        }, this);
    };
    NotificationManager.prototype.notif_refreshMarket = function (notif) {
        console.log('notif_refreshMarket', notif);
        this.game.interactionManager.resetActionArgs();
        notif.args.card_moves.forEach(function (move, index) {
            var _this = this;
            var fromRow = move.from.split('_')[1];
            var fromCol = move.from.split('_')[2];
            var toRow = move.to.split('_')[1];
            var toCol = move.to.split('_')[2];
            this.game.moveCard({
                id: move.card_id,
                from: this.game.marketManager.marketCards[fromRow][fromCol],
                to: this.game.marketManager.marketCards[toRow][toCol],
            });
            // TODO (Frans): check why in case of moving multiple rupees at the same time
            // they overlap
            this.game.marketManager.marketRupees[fromRow][fromCol].getAllItems().forEach(function (rupeeId) {
                _this.game.moveToken({
                    id: rupeeId,
                    to: _this.game.marketManager.marketRupees[toRow][toCol],
                    from: _this.game.marketManager.marketRupees[fromRow][toRow],
                    weight: _this.game.defaultWeightZone,
                });
            });
        }, this);
        notif.args.new_cards.forEach(function (move, index) {
            placeCard({
                location: this.game.marketManager.marketCards[move.to.split('_')[1]][move.to.split('_')[2]],
                id: move.card_id,
            });
        }, this);
    };
    NotificationManager.prototype.notif_selectGift = function (notif) {
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
                location: _this.game.marketManager.getMarketRupeesZone({ row: marketRow, column: marketColumn }),
                id: item.rupee_id,
                jstpl: 'jstpl_rupee',
                jstplProps: {
                    id: item.rupee_id,
                },
                from: "rupees_".concat(player_id),
            });
        }, this);
        $('rupee_count_' + player_id).innerHTML = updated_counts.rupees;
        $('influence_' + player_id).innerHTML = updated_counts.influence;
    };
    NotificationManager.prototype.notif_updatePlayerCounts = function (notif) {
        console.log('notif_updatePlayerCounts', notif);
        this.game.playerCounts = notif.args.counts;
        var counts = notif.args.counts;
        Object.keys(counts).forEach(function (playerId) {
            $('influence_' + playerId).innerHTML = counts[playerId].influence;
            $('cylinder_count_' + playerId).innerHTML = counts[playerId].cylinders;
            $('rupee_count_' + playerId).innerHTML = counts[playerId].rupees;
            $('card_count_' + playerId).innerHTML = counts[playerId].cards;
            $('economic_' + playerId).innerHTML = counts[playerId].suits.economic;
            $('military_' + playerId).innerHTML = counts[playerId].suits.military;
            $('political_' + playerId).innerHTML = counts[playerId].suits.political;
            $('intelligence_' + playerId).innerHTML = counts[playerId].suits.intelligence;
        });
    };
    NotificationManager.prototype.notif_moveToken = function (notif) {
        var _this = this;
        console.log('notif_moveToken', notif);
        notif.args.moves.forEach(function (move) {
            var token_id = move.token_id, from = move.from, to = move.to, updates = move.updates;
            var fromZone = _this.game.getZoneForLocation({ location: from });
            var toZone = _this.game.getZoneForLocation({ location: to });
            // TODO: perhaps create separate function for this
            var addClass = to.startsWith('armies') ? 'pp_army' : to.startsWith('roads') ? 'pp_road' : undefined;
            var removeClass = from.startsWith('blocks') ? 'pp_coalition_block' : undefined;
            _this.game.moveToken({
                id: token_id,
                from: fromZone,
                to: toZone,
                addClass: addClass,
                removeClass: removeClass,
            });
        });
    };
    NotificationManager.prototype.notif_log = function (notif) {
        // this is for debugging php side
        console.log('notif_log', notif);
        console.log(notif.log);
        console.log(notif.args);
    };
    return NotificationManager;
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
        this.playerHand = new ebg.stock();
        this.playerEvents = {}; // events per player
        this.activeEvents = new ebg.stock(); // active events
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
        console.log('typescript version');
        console.log('gamedatas', gamedatas);
        this.gamedatas = gamedatas;
        console.log('this.gamedatas', this.gamedatas);
        // Events
        setupCardsStock({
            game: this,
            stock: this.activeEvents,
            nodeId: 'pp_active_events',
            // className: `pp_card_in_court_${playerId}`
        });
        // TODO: use Object.values in similar cases?
        Object.keys(gamedatas.active_events).forEach(function (key) {
            placeCard({
                location: _this.activeEvents,
                id: gamedatas.active_events[key].key,
            });
        });
        this.objectManager = new ObjectManager(this);
        this.playerManager = new PlayerManager(this);
        this.mapManager = new MapManager(this);
        this.marketManager = new MarketManager(this);
        this.interactionManager = new InteractionManager(this);
        this.playerCounts = gamedatas.counts;
        // Setup player hand
        setupCardsStock({
            game: this,
            stock: this.playerHand,
            nodeId: 'pp_player_hand_cards',
            className: 'pp_card_in_hand',
        });
        Object.keys(this.gamedatas.hand).forEach(function (cardId) {
            placeCard({ location: _this.playerHand, id: cardId });
        });
        // Place spies on cards
        Object.keys(gamedatas.spies || {}).forEach(function (cardId) {
            Object.keys(gamedatas.spies[cardId]).forEach(function (cylinderId) {
                var playerId = cylinderId.split('_')[1];
                placeToken({
                    game: _this,
                    location: _this.spies[cardId],
                    id: cylinderId,
                    jstpl: 'jstpl_cylinder',
                    jstplProps: {
                        id: cylinderId,
                        color: gamedatas.players[playerId].color,
                    },
                    weight: _this.defaultWeightZone,
                });
            });
        });
        if (this.notificationManager != undefined) {
            this.notificationManager.destroy();
        }
        this.notificationManager = new NotificationManager(this);
        // Setup game notifications to handle (see "setupNotifications" method below)
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
        console.log('Entering state: ' + stateName, args);
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
        this.interactionManager.onUpdateActionButtons(stateName, args);
    };
    PaxPamir.prototype.onActionButtonClick = function (evt) {
        this.interactionManager.onActionButtonClick(evt);
    };
    // TODO (Frans): replace below with single actionButton
    PaxPamir.prototype.onPurchase = function (evt) {
        this.interactionManager.onPurchase(evt);
    };
    PaxPamir.prototype.onPlay = function (evt) {
        this.interactionManager.onPlay(evt);
    };
    PaxPamir.prototype.onSelectGift = function (evt) {
        this.interactionManager.onSelectGift(evt);
    };
    PaxPamir.prototype.onSelectRegion = function (evt) {
        this.interactionManager.onSelectRegion(evt);
    };
    PaxPamir.prototype.onCardAction = function (evt) {
        this.interactionManager.onCardAction(evt);
    };
    PaxPamir.prototype.onPass = function (evt) {
        this.interactionManager.onPass(evt);
    };
    PaxPamir.prototype.onBorder = function (evt) {
        this.interactionManager.onBorder(evt);
    };
    PaxPamir.prototype.onCard = function (evt) {
        this.interactionManager.onCard(evt);
    };
    PaxPamir.prototype.onCardActionClick = function (evt) {
        this.interactionManager.onCardActionClick(evt);
    };
    PaxPamir.prototype.onCancel = function (evt) {
        this.interactionManager.onCancel(evt);
    };
    PaxPamir.prototype.onConfirm = function (evt) {
        this.interactionManager.onConfirm(evt);
    };
    PaxPamir.prototype.onLeft = function (evt) {
        this.interactionManager.onLeft(evt);
    };
    PaxPamir.prototype.onRight = function (evt) {
        this.interactionManager.onRight(evt);
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
                _this.moveToken({
                    id: cylinderId,
                    to: _this.playerManager.getPlayer({ playerId: playerId }).getCylinderZone(),
                    from: _this.spies[id],
                });
            });
        }
        from.removeFromStockById(id, 'pp_discard_pile');
    };
    PaxPamir.prototype.framework = function () {
        return this;
    };
    // TODO (Frans): cast as number?
    PaxPamir.prototype.getPlayerId = function () {
        return this.player_id;
    };
    // returns zone object for given backend location in token database
    PaxPamir.prototype.getZoneForLocation = function (_a) {
        var location = _a.location;
        var splitLocation = location.split('_');
        switch (splitLocation[0]) {
            case 'armies':
                // armies_kabul
                return this.mapManager.getRegion({ region: splitLocation[1] }).getArmyZone();
            case 'blocks':
                // blocks_russian
                return this.objectManager.supply.getCoalitionBlocksZone({
                    coalition: splitLocation[1],
                });
            case 'cylinders':
                // cylinders_playerId
                return this.playerManager.getPlayer({ playerId: splitLocation[1] }).getCylinderZone();
            case 'gift':
                // gift_2_playerId
                return this.playerManager.getPlayer({ playerId: splitLocation[2] }).getGiftZone({ value: splitLocation[1] });
            case 'favored':
                // favored_suit_economic
                return this.objectManager.favoredSuit.getFavoredSuitZone({
                    suit: splitLocation[2],
                });
            case 'roads':
                // roads_herat_kabul
                var border = "".concat(splitLocation[1], "_").concat(splitLocation[2]);
                return this.mapManager.getBorder({ border: border }).getRoadZone();
            case 'spies':
                // spies_card_38
                var cardId = "".concat(splitLocation[1], "_").concat(splitLocation[2]);
                return this.spies[cardId];
            case 'tribes':
                // tribes_kabul
                return this.mapManager.getRegion({ region: splitLocation[1] }).getTribeZone();
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
    PaxPamir.prototype.moveToken = function (_a) {
        var id = _a.id, to = _a.to, from = _a.from, _b = _a.weight, weight = _b === void 0 ? this.defaultWeightZone : _b, _c = _a.addClass, addClass = _c === void 0 ? undefined : _c, _d = _a.removeClass, removeClass = _d === void 0 ? undefined : _d;
        if (addClass) {
            dojo.addClass(id, addClass);
        }
        if (removeClass) {
            dojo.removeClass(id, removeClass);
        }
        to.placeInZone(id, weight);
        from.removeFromZone(id, false);
    };
    // Function that gets called every time a card is added to a stock component
    PaxPamir.prototype.setupNewCard = function (cardDiv, cardId, divId) {
        // if card is played to a court
        if (divId.startsWith('pp_court_player')) {
            var _a = this.gamedatas.cards[cardId], actions_1 = _a.actions, region = _a.region;
            // add region class for selectable functions
            // const region = this.gamedatas.cards[cardId].region;
            dojo.addClass(cardDiv, "pp_card_in_court_".concat(region));
            var spyZoneId = 'spies_' + cardId;
            dojo.place("<div id=\"".concat(spyZoneId, "\" class=\"pp_spy_zone\"></div>"), divId);
            this.setupCardSpyZone({ nodeId: spyZoneId, cardId: cardId });
            // TODO (add spy zone here)
            // TODO (add card actions)
            Object.keys(actions_1).forEach(function (action, index) {
                var actionId = action + '_' + cardId;
                dojo.place("<div id=\"".concat(actionId, "\" class=\"pp_card_action pp_card_action_").concat(action, "\" style=\"left: ").concat(actions_1[action].left, "px; top: ").concat(actions_1[action].top, "px\"></div>"), divId);
            });
        }
    };
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
        this.showMessage("cannot take ".concat(actionName, " action"), 'error');
    };
    PaxPamir.prototype.cardAction = function (_a) {
        var cardId = _a.cardId, cardAction = _a.cardAction;
        // TODO: do we need to add checkAction?
        this.ajaxcall('/paxpamireditiontwo/paxpamireditiontwo/cardAction.html', {
            lock: true,
            card_id: cardId,
            card_action: cardAction,
        }, this, function (result) { });
    };
    PaxPamir.prototype.chooseLoyalty = function (_a) {
        var coalition = _a.coalition;
        this.ajaxcall('/paxpamireditiontwo/paxpamireditiontwo/chooseLoyalty.html', {
            lock: true,
            coalition: coalition,
        }, this, function (result) { });
    };
    PaxPamir.prototype.discardCards = function (_a) {
        var cards = _a.cards, fromHand = _a.fromHand;
        // TODO: do we need to add checkAction?
        this.ajaxcall('/paxpamireditiontwo/paxpamireditiontwo/discardCards.html', {
            lock: true,
            cards: cards,
            from_hand: fromHand,
        }, this, function (result) { });
    };
    PaxPamir.prototype.pass = function () {
        if (!this.checkAction('pass')) {
            this.actionError('pass');
            return;
        }
        this.ajaxcall('/paxpamireditiontwo/paxpamireditiontwo/passAction.html', {
            lock: true,
        }, this, function (result) { });
    };
    PaxPamir.prototype.placeRoad = function (_a) {
        var border = _a.border;
        if (!this.checkAction('placeRoad')) {
            this.actionError('placeRoad');
            return;
        }
        this.ajaxcall('/paxpamireditiontwo/paxpamireditiontwo/placeRoad.html', {
            lock: true,
            border: border,
        }, this, function (result) { });
    };
    PaxPamir.prototype.placeSpy = function (_a) {
        var cardId = _a.cardId;
        this.ajaxcall('/paxpamireditiontwo/paxpamireditiontwo/placeSpy.html', {
            lock: true,
            card_id: cardId,
        }, this, function (result) { });
    };
    PaxPamir.prototype.playCard = function (_a) {
        var cardId = _a.cardId, leftSide = _a.leftSide;
        this.ajaxcall('/paxpamireditiontwo/paxpamireditiontwo/playCard.html', {
            lock: true,
            card_id: cardId,
            left_side: leftSide,
        }, this, function (result) { });
    };
    PaxPamir.prototype.purchaseCard = function (_a) {
        var cardId = _a.cardId;
        // TODO: do we need to add checkAction?
        this.ajaxcall('/paxpamireditiontwo/paxpamireditiontwo/purchaseCard.html', {
            lock: true,
            card_id: cardId,
        }, this, function (result) { });
    };
    PaxPamir.prototype.selectGift = function (_a) {
        var selectedGift = _a.selectedGift;
        this.ajaxcall('/paxpamireditiontwo/paxpamireditiontwo/selectGift.html', {
            lock: true,
            selected_gift: selectedGift,
        }, this, function (result) { });
    };
    return PaxPamir;
}());
define(['dojo', 'dojo/_base/declare', 'ebg/core/gamegui', 'ebg/counter', 'ebg/stock', 'ebg/zone'], function (dojo, declare) {
    return declare('bgagame.paxpamireditiontwo', ebg.core.gamegui, new PaxPamir());
});
