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
var discardCardAnimation = function (_a) {
    var cardId = _a.cardId, game = _a.game;
    attachToNewParentNoDestroy(cardId, 'pp_discard_pile');
    dojo.addClass(cardId, 'pp_moving');
    var animation = game.framework().slideToObject(cardId, 'pp_discard_pile');
    dojo.connect(animation, 'onEnd', function () {
        dojo.removeClass(cardId, 'pp_moving');
    });
    animation.play();
};
/**
 * This method will attach mobile to a new_parent without destroying, unlike original attachToNewParent which destroys mobile and
 * all its connectors (onClick, etc)
 */
var attachToNewParentNoDestroy = function (mobileEltId, newParentId, pos, placePosition) {
    var mobile = $(mobileEltId);
    var new_parent = $(newParentId);
    var src = dojo.position(mobile);
    if (placePosition)
        mobile.style.position = placePosition;
    dojo.place(mobile, new_parent, pos);
    mobile.offsetTop; //force re-flow
    var tgt = dojo.position(mobile);
    var box = dojo.marginBox(mobile);
    var cbox = dojo.contentBox(mobile);
    var left = box.l + src.x - tgt.x;
    var top = box.t + src.y - tgt.y;
    mobile.style.position = 'absolute';
    mobile.style.left = left + 'px';
    mobile.style.top = top + 'px';
    box.l += box.w - cbox.w;
    box.t += box.h - cbox.h;
    mobile.offsetTop; //force re-flow
    return box;
};
var isFastMode = function () {
    // return this.instantaneousMode;
    return false;
};
var slide = function (_a) {
    var game = _a.game, mobileElt = _a.mobileElt, targetElt = _a.targetElt, _b = _a.options, options = _b === void 0 ? {} : _b;
    console.log('using slide');
    var config = __assign({ duration: 800, delay: 0, destroy: false, attach: true, changeParent: true, pos: null, className: 'moving', from: null, clearPos: true, beforeBrother: null, to: null, phantom: true, zIndex: null }, options);
    config.phantomStart = config.phantomStart || config.phantom;
    config.phantomEnd = config.phantomEnd || config.phantom;
    // Mobile elt
    mobileElt = $(mobileElt);
    var mobile = mobileElt;
    // Target elt
    targetElt = $(targetElt);
    var targetId = targetElt;
    var newParent = config.attach ? targetId : $(mobile).parentNode;
    // Handle fast mode
    if (isFastMode() && (config.destroy || config.clearPos)) {
        if (config.destroy)
            dojo.destroy(mobile);
        else
            dojo.place(mobile, targetElt);
        return new Promise(function (resolve, reject) {
            // @ts-ignore
            resolve();
        });
    }
    // Handle phantom at start
    if (config.phantomStart && config.from == null) {
        mobile = dojo.clone(mobileElt);
        // @ts-ignore
        dojo.attr(mobile, 'id', mobileElt.id + '_animated');
        dojo.place(mobile, 'game_play_area');
        // @ts-ignore
        game.framework().placeOnObject(mobile, mobileElt);
        dojo.addClass(mobileElt, 'phantom');
        config.from = mobileElt;
    }
    // Handle phantom at end
    // @ts-ignore
    if (config.phantomEnd) {
        // @ts-ignore
        targetId = dojo.clone(mobileElt);
        // @ts-ignore
        dojo.attr(targetId, 'id', mobileElt.id + '_afterSlide');
        dojo.addClass(targetId, 'phantom');
        if (config.beforeBrother != null) {
            dojo.place(targetId, config.beforeBrother, 'before');
        }
        else {
            dojo.place(targetId, targetElt);
        }
    }
    dojo.style(mobile, 'zIndex', config.zIndex || 5000);
    dojo.addClass(mobile, config.className);
    if (config.changeParent)
        changeParent(mobile, 'game_play_area');
    if (config.from != null)
        game.framework().placeOnObject(mobile, config.from);
    return new Promise(function (resolve, reject) {
        var animation = config.pos == null
            ? game.framework().slideToObject(mobile, config.to || targetId, config.duration, config.delay)
            : game.framework().slideToObjectPos(mobile, config.to || targetId, config.pos.x, config.pos.y, config.duration, config.delay);
        dojo.connect(animation, 'onEnd', function () {
            dojo.style(mobile, 'zIndex', null);
            dojo.removeClass(mobile, config.className);
            // @ts-ignore
            if (config.phantomStart) {
                dojo.place(mobileElt, mobile, 'replace');
                dojo.removeClass(mobileElt, 'phantom');
                mobile = mobileElt;
            }
            if (config.changeParent) {
                // @ts-ignore
                if (config.phantomEnd)
                    dojo.place(mobile, targetId, 'replace');
                else
                    changeParent(mobile, newParent);
            }
            if (config.destroy)
                dojo.destroy(mobile);
            if (config.clearPos && !config.destroy)
                dojo.style(mobile, { top: null, left: null, position: null });
            // @ts-ignore
            resolve();
        });
        animation.play();
    });
};
var changeParent = function (mobile, new_parent, relation) {
    if (mobile === null) {
        console.error('attachToNewParent: mobile obj is null');
        return;
    }
    if (new_parent === null) {
        console.error('attachToNewParent: new_parent is null');
        return;
    }
    if (typeof mobile == 'string') {
        mobile = $(mobile);
    }
    if (typeof new_parent == 'string') {
        new_parent = $(new_parent);
    }
    if (typeof relation == 'undefined') {
        relation = 'last';
    }
    var src = dojo.position(mobile);
    dojo.style(mobile, 'position', 'absolute');
    dojo.place(mobile, new_parent, relation);
    var tgt = dojo.position(mobile);
    var box = dojo.marginBox(mobile);
    var cbox = dojo.contentBox(mobile);
    var left = box.l + src.x - tgt.x;
    var top = box.t + src.y - tgt.y;
    positionObjectDirectly(mobile, left, top);
    // @ts-ignore
    box.l += box.w - cbox.w;
    // @ts-ignore
    box.t += box.h - cbox.h;
    return box;
};
var positionObjectDirectly = function (mobileObj, x, y) {
    // do not remove this "dead" code some-how it makes difference
    dojo.style(mobileObj, 'left'); // bug? re-compute style
    // console.log("place " + x + "," + y);
    dojo.style(mobileObj, {
        left: x + 'px',
        top: y + 'px',
    });
    dojo.style(mobileObj, 'left'); // bug? re-compute style
};
var LOG_TOKEN_ARMY = 'logTokenArmy';
var LOG_TOKEN_CARD = 'logTokenCard';
var LOG_TOKEN_CARD_LARGE = 'logTokenCardLarge';
var LOG_TOKEN_COALITION = 'logTokenCoalition';
var LOG_TOKEN_FAVORED_SUIT = 'logTokenFavoredSuit';
var LOG_TOKEN_NEW_CARDS = 'logTokenNewCards';
var LOG_TOKEN_ROAD = 'logTokenRoad';
var LOG_TOKEN_SPY = 'logTokenSpy';
var LOG_TOKEN_CYLINDER = 'logTokenCylinder';
var logTokenKeys = [
    LOG_TOKEN_ARMY,
    LOG_TOKEN_CARD,
    LOG_TOKEN_CARD_LARGE,
    LOG_TOKEN_COALITION,
    LOG_TOKEN_FAVORED_SUIT,
    LOG_TOKEN_NEW_CARDS,
    LOG_TOKEN_ROAD,
    LOG_TOKEN_SPY,
    LOG_TOKEN_CYLINDER,
];
var getLogTokenDiv = function (key, args) {
    var data = args[key];
    // console.log('getLogTokenDiv', key, 'data', data);
    switch (key) {
        case LOG_TOKEN_ARMY:
            return tplLogTokenArmy({ coalition: data });
        case LOG_TOKEN_CARD:
            return tplLogTokenCard({ cardId: data });
        case LOG_TOKEN_CARD_LARGE:
            return tplLogTokenCard({ cardId: data, large: true });
        case LOG_TOKEN_FAVORED_SUIT:
            return tplLogTokenFavoredSuit({ suit: data });
        case LOG_TOKEN_CYLINDER:
            return tplLogTokenCylinder({ color: data });
        case LOG_TOKEN_COALITION:
            return tplLogTokenCoalition({ coalition: data });
        case LOG_TOKEN_NEW_CARDS:
            return tplLogTokenNewCards({ cards: data });
        case LOG_TOKEN_ROAD:
            return tplLogTokenRoad({ coalition: data });
        default:
            return args[key];
    }
};
var tplLogTokenArmy = function (_a) {
    var coalition = _a.coalition;
    return "<div class=\"pp_".concat(coalition, " pp_army pp_log_token\"></div>");
};
var tplLogTokenCard = function (_a) {
    var cardId = _a.cardId, large = _a.large;
    return "<div class=\"pp_card pp_log_token pp_".concat(cardId).concat(large ? ' pp_large' : '', "\"></div>");
};
var tplLogTokenCoalition = function (_a) {
    var coalition = _a.coalition;
    return "<div class=\"pp_log_token pp_loyalty_icon pp_".concat(coalition, "\"></div>");
};
var tplLogTokenCylinder = function (_a) {
    var color = _a.color;
    return "<div class=\"pp_cylinder pp_player_color_".concat(color, " pp_log_token\"></div>");
};
var tplLogTokenFavoredSuit = function (_a) {
    var suit = _a.suit;
    return "<div class=\"pp_log_token pp_impact_icon_suit ".concat(suit, "\"></div>");
};
var tplLogTokenNewCards = function (_a) {
    var cards = _a.cards;
    var newCards = '';
    cards.forEach(function (card) {
        newCards += "<div class=\"pp_card pp_log_token pp_".concat(card.cardId, " pp_large\" style=\"display: inline-block; margin-right: 4px;\"></div>");
    });
    return newCards;
};
var tplLogTokenRoad = function (_a) {
    var coalition = _a.coalition;
    return "<div class=\"pp_".concat(coalition, " pp_road pp_log_token\"></div>");
};
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
var NEGOTIATE_BRIBE = 'negotiateBribe';
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
// card types
var EVENT_CARD = 'eventCard';
var COURT_CARD = 'courtCard';
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
// impact icons
var IMPACT_ICON_ROAD = 'road';
var IMPACT_ICON_ARMY = 'army';
var IMPACT_ICON_LEVERAGE = 'leverage';
var IMPACT_ICON_SPY = 'spy';
var IMPACT_ICON_TRIBE = 'tribe';
var IMPACT_ICON_ECONOMIC_SUIT = 'economic';
var IMPACT_ICON_MILITARY_SUIT = 'military';
var IMPACT_ICON_POLITICAL_SUIT = 'political';
var IMPACT_ICON_INTELLIGENCE_SUIT = 'intelligence';
/**
 * Card actions types
 */
var TYPE_BATTLE = 'battle';
var TYPE_BETRAY = 'betray';
var TYPE_BUILD = 'build';
var TYPE_GIFT = 'gift';
var TYPE_MOVE = 'move';
var TYPE_TAX = 'tax';
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
// Rupee with counter in right bottom.
var tplRupeeCount = function (_a) {
    var id = _a.id;
    return "<div id=\"rupees_".concat(id, "\" class=\"pp_icon pp_player_board_rupee\"><div id=\"rupee_count_").concat(id, "\" class=\"pp_icon_count\"><span id=\"rupee_count_").concat(id, "_counter\"></span></div></div>");
};
// Card background with counter in right bottom
var tplHandCount = function (_a) {
    var id = _a.id;
    return "<div id=\"cards_".concat(id, "\" class=\"pp_icon pp_card_icon\"><div id=\"card_count_").concat(id, "\" class=\"pp_icon_count\"><span id=\"card_count_").concat(id, "_counter\"></span></div></div>");
};
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
var debug = isDebug ? console.info.bind(window.console) : function () { };
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
    dojo.place(game.framework().format_block(jstpl, jstplProps), from || location.container_div);
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
var tplCardTooltipContainer = function (_a) {
    var cardId = _a.cardId, content = _a.content;
    return "<div class=\"pp_card_tooltip\">\n  <div class=\"pp_card_tooltip_inner_container\">\n    ".concat(content, "\n  </div>\n  <div class=\"pp_card pp_card_in_tooltip pp_").concat(cardId, "\"></div>\n</div>");
};
var getImpactIconText = function (_a) {
    var impactIcon = _a.impactIcon;
    switch (impactIcon) {
        case IMPACT_ICON_ARMY:
            return _('Place one coalition block of your loyalty in this region. This piece is now an army.');
        case IMPACT_ICON_ROAD:
            return _('Place one coalition block of your loyalty on any border of this region. This piece is now a road.');
        case IMPACT_ICON_LEVERAGE:
            return _('Take two rupees from the bank. This card is leveraged.');
        case IMPACT_ICON_SPY:
            return _("Place one of your cylinders on a card in any player's court that matches the played card's region. This piece is now a spy.");
        case IMPACT_ICON_TRIBE:
            return _('Place one of your cylinders in this region. This piece is now a tribe.');
        case IMPACT_ICON_ECONOMIC_SUIT:
            return _('Move the favored suit marker to the suit indicated.');
        case IMPACT_ICON_MILITARY_SUIT:
            return _('Move the favored suit marker to the suit indicated.');
        case IMPACT_ICON_POLITICAL_SUIT:
            return _('Move the favored suit marker to the suit indicated.');
        case IMPACT_ICON_INTELLIGENCE_SUIT:
            return _('Move the favored suit marker to the suit indicated.');
        default:
            return '';
    }
};
var tplTooltipImpactIcon = function (_a) {
    var impactIcon = _a.impactIcon, loyalty = _a.loyalty;
    var icon = '';
    switch (impactIcon) {
        case IMPACT_ICON_ARMY:
            icon = "<div class=\"pp_army pp_".concat(loyalty || 'neutral', "\"></div>");
            break;
        case IMPACT_ICON_ROAD:
            icon = "<div class=\"pp_road pp_".concat(loyalty || 'neutral', "\"></div>");
            break;
        case IMPACT_ICON_TRIBE:
            icon = "<div class=\"pp_tooltip_impact_icon_tribe pp_impact_icon_".concat(impactIcon, "\"></div>");
            break;
        case IMPACT_ICON_LEVERAGE:
        case IMPACT_ICON_SPY:
            icon = "<div class=\"pp_tooltip_impact_icon pp_impact_icon_".concat(impactIcon, "\"></div>");
            break;
        case IMPACT_ICON_ECONOMIC_SUIT:
        case IMPACT_ICON_MILITARY_SUIT:
        case IMPACT_ICON_POLITICAL_SUIT:
        case IMPACT_ICON_INTELLIGENCE_SUIT:
            console.log('impactIcon', impactIcon);
            icon = "<div class=\"pp_tooltip_impact_icon pp_impact_icon_suit ".concat(impactIcon, "\"></div>");
            break;
        default:
            break;
    }
    return "<div class=\"pp_card_tooltip_section_container\">\n            <div class=\"pp_card_tooltip_section_inner_container\">\n              ".concat(icon, "\n            </div>\n            <span class=\"pp_impact_icon_text\">").concat(getImpactIconText({ impactIcon: impactIcon }), "</span>\n          </div>");
};
var getCardActionText = function (_a) {
    var type = _a.type;
    switch (type) {
        case TYPE_BATTLE:
            return _('At a single site (region or court card), remove any combination of enemy tribes, roads, spies or armies equal to rank. You cannot remove more units than you yourself have armies/spies in that battle.');
        case TYPE_BETRAY:
            return _('Pay 2. Discard a card where you have a spy. You may take its prize.');
        case TYPE_BUILD:
            return _('Pay 2/4/6 to place 1, 2 or 3 blocks in any region you rule (as an army) or on adjacent borders (as a road).');
        case TYPE_GIFT:
            return _('Pay 2/4/6 to purchase 1st, 2nd or 3rd gift.');
        case TYPE_MOVE:
            return _('For each rank, move one spy or army.');
        case TYPE_TAX:
            return _('Take rupees from market cards. If you rule a region, may take from players with at least one card associated with that region.');
        default:
            return '';
    }
};
var tplTooltipCardAction = function (_a) {
    var type = _a.type, rank = _a.rank;
    return "<div class=\"pp_card_tooltip_section_container\">\n    <div class=\"pp_card_tooltip_section_inner_container\">\n      <div class=\"pp_tooltip_card_action pp_card_action_".concat(type, " pp_rank_").concat(rank, "\"></div>\n    </div>\n    <span class=\"pp_impact_icon_text\">").concat(getCardActionText({ type: type }), "</span>\n  </div>");
};
var tplCourtCardTooltip = function (_a) {
    var cardId = _a.cardId, cardInfo = _a.cardInfo, specialAbilities = _a.specialAbilities;
    var impactIcons = '';
    if (cardInfo.impactIcons.length > 0) {
        impactIcons += "<span class=\"section_title\">".concat(_('Impact icons'), "</span>");
        new Set(cardInfo.impactIcons).forEach(function (icon) {
            impactIcons += tplTooltipImpactIcon({ impactIcon: icon, loyalty: cardInfo.loyalty });
        });
    }
    var cardActions = '';
    if (Object.values(cardInfo.actions).length > 0) {
        cardActions += "<span class=\"section_title\">".concat(_('Card actions'), "</span>");
        Object.values(cardInfo.actions).forEach(function (_a) {
            var type = _a.type;
            cardActions += tplTooltipCardAction({ type: type, rank: cardInfo.rank });
        });
    }
    var specialAbility = '';
    if (cardInfo.specialAbility) {
        specialAbility = "<span class=\"section_title\">".concat(_(specialAbilities[cardInfo.specialAbility].title), "</span>\n    <span class=\"special_ability_text\">").concat(_(specialAbilities[cardInfo.specialAbility].description), "</span>\n    ");
    }
    return tplCardTooltipContainer({ cardId: cardId, content: "\n  <span class=\"title\">".concat(cardInfo.name, "</span>\n  <span class=\"flavor_text\">").concat(cardInfo.flavorText, "</span>\n  ").concat(impactIcons, "\n  ").concat(cardActions, "\n  ").concat(specialAbility, "\n  ") });
};
var tplEventCardTooltip = function (_a) {
    var cardId = _a.cardId, cardInfo = _a.cardInfo;
    return tplCardTooltipContainer({ cardId: cardId, content: "\n    <span class=\"title\">".concat(_('If discarded'), "</span>\n    <span class=\"pp_tooltip_description_text\" style=\"font-weight: bold;\">").concat(cardInfo.discarded.title || '', "</span>\n    <span class=\"pp_tooltip_description_text\">").concat(cardInfo.discarded.description || '', "</span>\n    <span class=\"title\" style=\"margin-top: 32px;\">").concat(_('If purchased'), "</span>\n    <span class=\"pp_tooltip_description_text\" style=\"font-weight: bold;\">").concat(cardInfo.purchased.title || '', "</span>\n    <span class=\"pp_tooltip_description_text\">").concat(cardInfo.purchased.description || '', "</span>\n  ") });
};
//  .########..#######...#######..##.......########.####.########.      
//  ....##....##.....##.##.....##.##..........##.....##..##.....##      
//  ....##....##.....##.##.....##.##..........##.....##..##.....##      
//  ....##....##.....##.##.....##.##..........##.....##..########.      
//  ....##....##.....##.##.....##.##..........##.....##..##.......      
//  ....##....##.....##.##.....##.##..........##.....##..##.......      
//  ....##.....#######...#######..########....##....####.##.......      
//  .##.....##....###....##....##....###.....######...########.########.
//  .###...###...##.##...###...##...##.##...##....##..##.......##.....##
//  .####.####..##...##..####..##..##...##..##........##.......##.....##
//  .##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
//  .##.....##.#########.##..####.#########.##....##..##.......##...##..
//  .##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
//  .##.....##.##.....##.##....##.##.....##..######...########.##.....##
var PPTooltipManager = /** @class */ (function () {
    function PPTooltipManager(game) {
        this.game = game;
    }
    PPTooltipManager.prototype.addTooltipToCard = function (_a) {
        var cardId = _a.cardId;
        var cardInfo = this.game.getCardInfo({ cardId: cardId });
        if (cardInfo.type === COURT_CARD) {
            var html = tplCourtCardTooltip({ cardId: cardId, cardInfo: cardInfo, specialAbilities: this.game.gamedatas.staticData.specialAbilities, });
            this.game.framework().addTooltipHtml(cardId, html, 1000);
        }
        else {
            var html = tplEventCardTooltip({ cardId: cardId, cardInfo: cardInfo });
            this.game.framework().addTooltipHtml(cardId, html, 1000);
        }
    };
    return PPTooltipManager;
}());
// .########..####..######...######.....###....########..########.
// .##.....##..##..##....##.##....##...##.##...##.....##.##.....##
// .##.....##..##..##.......##........##...##..##.....##.##.....##
// .##.....##..##...######..##.......##.....##.########..##.....##
// .##.....##..##........##.##.......#########.##...##...##.....##
// .##.....##..##..##....##.##....##.##.....##.##....##..##.....##
// .########..####..######...######..##.....##.##.....##.########.
var DiscardPile = /** @class */ (function () {
    function DiscardPile(_a) {
        var game = _a.game;
        console.log('Constructor DiscardPile');
        this.game = game;
        this.setup({ gamedatas: game.gamedatas });
    }
    DiscardPile.prototype.setup = function (_a) {
        var gamedatas = _a.gamedatas;
        if (gamedatas.discardPile) {
            dojo.place(tplCard({ cardId: gamedatas.discardPile.id }), 'pp_discard_pile');
        }
    };
    DiscardPile.prototype.clearInterface = function () {
        dojo.empty('pp_discard_pile');
    };
    return DiscardPile;
}());
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
        console.log('Constructor Favored Suit');
        this.game = game;
        this.setup({ gamedatas: game.gamedatas });
    }
    FavoredSuit.prototype.setup = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        this.favoredSuitZones = {};
        // Setup zones for favored suit marker
        Object.keys(this.game.gamedatas.staticData.suits).forEach(function (suit) {
            _this.favoredSuitZones[suit] = new ebg.zone();
            setupTokenZone({
                game: _this.game,
                zone: _this.favoredSuitZones[suit],
                nodeId: "pp_favored_suit_".concat(suit),
                tokenWidth: FAVORED_SUIT_MARKER_WIDTH,
                tokenHeight: FAVORED_SUIT_MARKER_HEIGHT,
            });
        });
        this.favoredSuit = gamedatas.favoredSuit;
        this.favoredSuitZones[this.favoredSuit].instantaneous = true;
        placeToken({
            game: this.game,
            location: this.favoredSuitZones[this.favoredSuit],
            //location: this.favoredSuit['intelligence'], // for testing change of favored suit
            id: "favored_suit_marker",
            jstpl: 'jstpl_favored_suit_marker',
            jstplProps: {
                id: "favored_suit_marker",
            },
        });
        this.favoredSuitZones[this.favoredSuit].instantaneous = false;
    };
    FavoredSuit.prototype.clearInterface = function () {
        var _this = this;
        Object.keys(this.favoredSuitZones).forEach(function (key) {
            dojo.empty(_this.favoredSuitZones[key].container_div);
            _this.favoredSuitZones[key] = undefined;
        });
    };
    FavoredSuit.prototype.getFavoredSuitZone = function (_a) {
        var suit = _a.suit;
        return this.favoredSuitZones[suit];
    };
    FavoredSuit.prototype.get = function () {
        return this.favoredSuit;
    };
    FavoredSuit.prototype.change = function (_a) {
        var suit = _a.suit;
        this.favoredSuit = suit;
        // TODO animation    
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
        console.log('Constructor Supply');
        this.game = game;
        this.setup({ gamedatas: game.gamedatas });
    }
    Supply.prototype.setup = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        // blocks per coalition (supply)
        this.coalitionBlocks = {};
        // Setup supply of coalition blocks
        COALITIONS.forEach(function (coalition) {
            _this.coalitionBlocks[coalition] = new ebg.zone();
            setupTokenZone({
                game: _this.game,
                zone: _this.coalitionBlocks[coalition],
                nodeId: "pp_".concat(coalition, "_coalition_blocks"),
                tokenWidth: COALITION_BLOCK_WIDTH,
                tokenHeight: COALITION_BLOCK_HEIGHT,
                itemMargin: 15,
                instantaneous: true,
            });
            gamedatas.coalitionBlocks[coalition].forEach(function (block) {
                placeToken({
                    game: _this.game,
                    location: _this.coalitionBlocks[coalition],
                    id: block.id,
                    jstpl: 'jstpl_coalition_block',
                    jstplProps: {
                        id: block.id,
                        coalition: coalition,
                    },
                    weight: block.state,
                });
            });
        });
    };
    Supply.prototype.clearInterface = function () {
        var _this = this;
        Object.keys(this.coalitionBlocks).forEach(function (key) {
            dojo.empty(_this.coalitionBlocks[key].container_div);
            _this.coalitionBlocks[key] = undefined;
        });
    };
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
        this.setupVpTrack({ gamedatas: game.gamedatas });
    }
    VpTrack.prototype.clearInterface = function () {
        for (var i = 0; i <= 23; i++) {
            dojo.empty(this.vpTrackZones[i].container_div);
            this.vpTrackZones[i] = undefined;
        }
    };
    VpTrack.prototype.setupVpTrack = function (_a) {
        var gamedatas = _a.gamedatas;
        this.vpTrackZones = {};
        // Create VP track
        for (var i = 0; i <= 23; i++) {
            if (this.vpTrackZones[i]) {
                this.vpTrackZones[i].removeAll();
            }
            else {
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
        // Add cylinders
        for (var playerId in gamedatas.players) {
            var player = gamedatas.players[playerId];
            var zone = this.getZone(player.score);
            zone.instantaneous = true;
            placeToken({
                game: this.game,
                location: zone,
                id: "vp_cylinder_".concat(playerId),
                jstpl: 'jstpl_cylinder',
                jstplProps: {
                    id: "vp_cylinder_".concat(playerId),
                    color: player.color,
                },
            });
            zone.instantaneous = false;
        }
    };
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
        this.discardPile = new DiscardPile({ game: game });
        this.favoredSuit = new FavoredSuit({ game: game });
        this.supply = new Supply({ game: game });
        this.vpTrack = new VpTrack({ game: game });
    }
    ObjectManager.prototype.updateInterface = function (_a) {
        var gamedatas = _a.gamedatas;
        this.discardPile.setup({ gamedatas: gamedatas });
        this.favoredSuit.setup({ gamedatas: gamedatas });
        this.supply.setup({ gamedatas: gamedatas });
        this.vpTrack.setupVpTrack({ gamedatas: gamedatas });
    };
    ObjectManager.prototype.clearInterface = function () {
        this.discardPile.clearInterface();
        this.favoredSuit.clearInterface();
        this.supply.clearInterface();
        this.vpTrack.clearInterface();
    };
    return ObjectManager;
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
        this.gifts = {};
        this.counters = {
            cards: new ebg.counter(),
            cardsTableau: new ebg.counter(),
            cylinders: new ebg.counter(),
            economic: new ebg.counter(),
            influence: new ebg.counter(),
            intelligence: new ebg.counter(),
            military: new ebg.counter(),
            political: new ebg.counter(),
            rupees: new ebg.counter(),
            rupeesTableau: new ebg.counter(),
        };
        // console.log("Player", player);
        this.game = game;
        var playerId = player.id;
        this.playerId = Number(playerId);
        this.player = player;
        this.playerName = player.name;
        this.playerColor = player.color;
        var gamedatas = game.gamedatas;
        this.setupPlayer({ gamedatas: gamedatas });
    }
    // ..######..########.########.##.....##.########.
    // .##....##.##..........##....##.....##.##.....##
    // .##.......##..........##....##.....##.##.....##
    // ..######..######......##....##.....##.########.
    // .......##.##..........##....##.....##.##.......
    // .##....##.##..........##....##.....##.##.......
    // ..######..########....##.....#######..##.......
    PPPlayer.prototype.updatePlayer = function (_a) {
        var gamedatas = _a.gamedatas;
        var playerGamedatas = gamedatas.players[this.playerId];
        this.setupCourt({ playerGamedatas: playerGamedatas });
        this.setupCylinders({ playerGamedatas: playerGamedatas });
        this.setupGifts({ playerGamedatas: playerGamedatas });
        this.setupRulerTokens({ gamedatas: gamedatas });
        this.updatePlayerPanel({ playerGamedatas: playerGamedatas });
    };
    // Setup functions
    PPPlayer.prototype.setupPlayer = function (_a) {
        var gamedatas = _a.gamedatas;
        var playerGamedatas = gamedatas.players[this.playerId];
        this.setupHand({ playerGamedatas: playerGamedatas });
        this.setupCourt({ playerGamedatas: playerGamedatas });
        this.setupCylinders({ playerGamedatas: playerGamedatas });
        this.setupGifts({ playerGamedatas: playerGamedatas });
        this.setupRulerTokens({ gamedatas: gamedatas });
        this.setupPlayerPanel({ playerGamedatas: playerGamedatas });
    };
    PPPlayer.prototype.setupCourt = function (_a) {
        var _this = this;
        var playerGamedatas = _a.playerGamedatas;
        this.court = new ebg.zone();
        this.court.create(this.game, "pp_court_player_".concat(this.playerId), CARD_WIDTH, CARD_HEIGHT);
        this.court.item_margin = 16;
        this.court.instantaneous = true;
        this.court.instantaneous = true;
        playerGamedatas.court.cards.forEach(function (card) {
            var cardId = card.id;
            var _a = _this.game.gamedatas.staticData.cards[cardId], actions = _a.actions, region = _a.region;
            dojo.place(tplCard({ cardId: cardId, extraClasses: "pp_card_in_court pp_player_".concat(_this.playerId, " pp_").concat(region) }), "pp_court_player_".concat(_this.playerId));
            _this.setupCourtCard({ cardId: cardId });
            _this.court.placeInZone(cardId, card.state);
            _this.game.tooltipManager.addTooltipToCard({ cardId: card.id });
            // Add spies
            (playerGamedatas.court.spies[cardId] || []).forEach(function (cylinder) {
                var playerId = cylinder.id.split('_')[1];
                placeToken({
                    game: _this.game,
                    location: _this.game.spies[cardId],
                    id: cylinder.id,
                    jstpl: 'jstpl_cylinder',
                    jstplProps: {
                        id: cylinder.id,
                        color: _this.game.gamedatas.players[playerId].color,
                    },
                });
            });
        });
        this.court.instantaneous = false;
    };
    PPPlayer.prototype.setupCylinders = function (_a) {
        var _this = this;
        var playerGamedatas = _a.playerGamedatas;
        this.cylinders = new ebg.zone();
        setupTokenZone({
            game: this.game,
            zone: this.cylinders,
            nodeId: "pp_cylinders_player_".concat(this.playerId),
            tokenWidth: CYLINDER_WIDTH,
            tokenHeight: CYLINDER_HEIGHT,
            itemMargin: 8,
        });
        this.cylinders.instantaneous = true;
        // Add cylinders to zone
        playerGamedatas.cylinders.forEach(function (cylinder) {
            placeToken({
                game: _this.game,
                location: _this.cylinders,
                id: cylinder.id,
                jstpl: 'jstpl_cylinder',
                jstplProps: {
                    id: cylinder.id,
                    color: playerGamedatas.color,
                },
                weight: cylinder.state,
            });
        });
        this.cylinders.instantaneous = false;
    };
    PPPlayer.prototype.setupGifts = function (_a) {
        var _this = this;
        var playerGamedatas = _a.playerGamedatas;
        // Set up gift zones
        ['2', '4', '6'].forEach(function (value) {
            _this.gifts[value] = new ebg.zone();
            setupTokenZone({
                game: _this.game,
                zone: _this.gifts[value],
                nodeId: "pp_gift_".concat(value, "_zone_").concat(_this.playerId),
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
        var playerGifts = playerGamedatas.gifts;
        Object.keys(playerGifts).forEach(function (giftValue) {
            Object.keys(playerGifts[giftValue]).forEach(function (cylinderId) {
                placeToken({
                    game: _this.game,
                    location: _this.gifts[giftValue],
                    id: cylinderId,
                    jstpl: 'jstpl_cylinder',
                    jstplProps: {
                        id: cylinderId,
                        color: _this.playerColor,
                    },
                });
            });
        });
    };
    PPPlayer.prototype.setupHand = function (_a) {
        var _this = this;
        var playerGamedatas = _a.playerGamedatas;
        if (!(this.playerId === this.game.getPlayerId())) {
            return;
        }
        if (this.hand) {
            this.hand.removeAll();
        }
        else {
            this.hand = new ebg.zone();
            this.hand.create(this.game, 'pp_player_hand_cards', CARD_WIDTH, CARD_HEIGHT);
            this.hand.item_margin = 16;
        }
        this.hand.instantaneous = true;
        playerGamedatas.hand.forEach(function (card) {
            dojo.place(tplCard({ cardId: card.id, extraClasses: 'pp_card_in_hand' }), 'pp_player_hand_cards');
            _this.hand.placeInZone(card.id);
            _this.game.tooltipManager.addTooltipToCard({ cardId: card.id });
        });
        this.hand.instantaneous = false;
    };
    PPPlayer.prototype.setupPlayerPanel = function (_a) {
        var playerGamedatas = _a.playerGamedatas;
        // Set up panels
        var player_board_div = $('player_board_' + this.playerId);
        dojo.place(this.game.format_block('jstpl_player_board', __assign(__assign({}, this.player), { p_color: this.playerColor })), player_board_div);
        $("cylinders_".concat(this.playerId)).classList.add("pp_player_color_".concat(this.playerColor));
        // TODO: check how player loyalty is returned with new setup. Seems to be empty string?
        if (this.player.loyalty && this.player.loyalty !== 'null') {
            this.updatePlayerLoyalty({ coalition: this.player.loyalty });
        }
        this.counters.cards.create("card_count_".concat(this.playerId, "_counter"));
        this.counters.cardsTableau.create("card_count_tableau_".concat(this.playerId, "_counter"));
        this.counters.cylinders.create("cylinder_count_".concat(this.playerId, "_counter"));
        this.counters.economic.create("economic_".concat(this.playerId, "_counter"));
        this.counters.influence.create("influence_".concat(this.playerId, "_counter"));
        this.counters.intelligence.create("intelligence_".concat(this.playerId, "_counter"));
        this.counters.military.create("military_".concat(this.playerId, "_counter"));
        this.counters.political.create("political_".concat(this.playerId, "_counter"));
        this.counters.rupees.create("rupee_count_".concat(this.playerId, "_counter"));
        this.counters.rupeesTableau.create("rupee_count_tableau_".concat(this.playerId, "_counter"));
        this.updatePlayerPanel({ playerGamedatas: playerGamedatas });
    };
    PPPlayer.prototype.updatePlayerPanel = function (_a) {
        var playerGamedatas = _a.playerGamedatas;
        var counts = playerGamedatas.counts;
        // Set all values in player panels
        if (this.player.loyalty && this.player.loyalty !== 'null') {
            this.counters.influence.setValue(playerGamedatas.counts.influence);
        }
        else {
            this.counters.influence.disable();
        }
        this.counters.cylinders.setValue(counts.cylinders);
        this.counters.rupees.setValue(playerGamedatas.rupees);
        this.counters.rupeesTableau.setValue(playerGamedatas.rupees);
        this.counters.cards.setValue(counts.cards);
        this.counters.cardsTableau.setValue(counts.cards);
        this.counters.economic.setValue(counts.suits.economic);
        this.counters.military.setValue(counts.suits.military);
        this.counters.political.setValue(counts.suits.political);
        this.counters.intelligence.setValue(counts.suits.intelligence);
    };
    PPPlayer.prototype.setupRulerTokens = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        if (!this.rulerTokens) {
            this.rulerTokens = new ebg.zone();
            // Create rulerTokens zone
            setupTokenZone({
                game: this.game,
                zone: this.rulerTokens,
                nodeId: "pp_ruler_tokens_player_".concat(this.playerId),
                tokenWidth: RULER_TOKEN_WIDTH,
                tokenHeight: RULER_TOKEN_HEIGHT,
                itemMargin: 10,
            });
        }
        this.rulerTokens.instantaneous = true;
        Object.keys(gamedatas.map.rulers).forEach(function (region) {
            if (gamedatas.map.rulers[region] === Number(_this.playerId)) {
                console.log('place ruler token player');
                placeToken({
                    game: _this.game,
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
        this.rulerTokens.instantaneous = false;
    };
    PPPlayer.prototype.setupCourtCard = function (_a) {
        var cardId = _a.cardId;
        var _b = this.game.gamedatas.staticData.cards[cardId], actions = _b.actions, region = _b.region;
        this.game.createSpyZone({ cardId: cardId });
        Object.keys(actions).forEach(function (action, index) {
            var actionId = action + '_' + cardId;
            dojo.place("<div id=\"".concat(actionId, "\" class=\"pp_card_action\" style=\"left: ").concat(actions[action].left, "px; top: ").concat(actions[action].top, "px\"></div>"), cardId);
        });
    };
    PPPlayer.prototype.clearInterface = function () {
        var _this = this;
        dojo.empty(this.court.container_div);
        this.court = undefined;
        dojo.empty(this.cylinders.container_div);
        this.cylinders = undefined;
        dojo.empty(this.rulerTokens.container_div);
        this.rulerTokens = undefined;
        ['2', '4', '6'].forEach(function (value) {
            dojo.empty(_this.gifts[value].container_div);
            _this.gifts[value] = undefined;
        });
    };
    // ..######...########.########.########.########.########...######.
    // .##....##..##..........##.......##....##.......##.....##.##....##
    // .##........##..........##.......##....##.......##.....##.##......
    // .##...####.######......##.......##....######...########...######.
    // .##....##..##..........##.......##....##.......##...##.........##
    // .##....##..##..........##.......##....##.......##....##..##....##
    // ..######...########....##.......##....########.##.....##..######.
    // ..######..########.########.########.########.########...######.
    // .##....##.##..........##.......##....##.......##.....##.##....##
    // .##.......##..........##.......##....##.......##.....##.##......
    // ..######..######......##.......##....######...########...######.
    // .......##.##..........##.......##....##.......##...##.........##
    // .##....##.##..........##.......##....##.......##....##..##....##
    // ..######..########....##.......##....########.##.....##..######.
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
        switch (counter) {
            case 'cards':
                this.counters.cards.setValue(value);
                this.counters.cardsTableau.setValue(value);
                break;
            case 'rupees':
                this.counters.rupees.setValue(value);
                this.counters.rupeesTableau.setValue(value);
                break;
            default:
                this.counters[counter].setValue(value);
        }
    };
    PPPlayer.prototype.incCounter = function (_a) {
        var counter = _a.counter, value = _a.value;
        switch (counter) {
            case 'cards':
                this.counters.cards.incValue(value);
                this.counters.cardsTableau.incValue(value);
                break;
            case 'rupees':
                this.counters.rupees.incValue(value);
                this.counters.rupeesTableau.incValue(value);
                break;
            default:
                this.counters[counter].incValue(value);
        }
    };
    //  .##.....##.########.####.##.......####.########.##....##
    //  .##.....##....##.....##..##........##.....##.....##..##.
    //  .##.....##....##.....##..##........##.....##......####..
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  ..#######.....##....####.########.####....##.......##...
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
    // ....###.....######..########.####..#######..##....##..######.
    // ...##.##...##....##....##.....##..##.....##.###...##.##....##
    // ..##...##..##..........##.....##..##.....##.####..##.##......
    // .##.....##.##..........##.....##..##.....##.##.##.##..######.
    // .#########.##..........##.....##..##.....##.##..####.......##
    // .##.....##.##....##....##.....##..##.....##.##...###.##....##
    // .##.....##..######.....##....####..#######..##....##..######.
    PPPlayer.prototype.discardCourtCard = function (_a) {
        var cardId = _a.cardId;
        // Move all spies back to cylinder pools if there are any
        this.game.returnSpiesFromCard({ cardId: cardId });
        // Move card to discard pile
        this.court.removeFromZone(cardId, false);
        discardCardAnimation({ cardId: cardId, game: this.game });
        // TODO: check leverage and check overthrow rule
    };
    PPPlayer.prototype.discardHandCard = function (_a) {
        var cardId = _a.cardId;
        if (this.playerId === this.game.getPlayerId()) {
            this.hand.removeFromZone(cardId, false);
        }
        else {
            dojo.place(tplCard({ cardId: cardId }), "cards_".concat(this.playerId));
        }
        discardCardAnimation({ cardId: cardId, game: this.game });
    };
    PPPlayer.prototype.payBribe = function (_a) {
        var _this = this;
        var rulerId = _a.rulerId, rupees = _a.rupees;
        console.log('place', dojo.place(tplRupee({ rupeeId: 'tempRupee' }), "rupees_".concat(this.playerId)));
        attachToNewParentNoDestroy('tempRupee', "rupees_".concat(rulerId));
        // this.game.framework().placeOnObject('tempRupee',`rupees_${this.playerId}`);
        var animation = this.game.framework().slideToObject('tempRupee', "rupees_".concat(rulerId));
        dojo.connect(animation, 'onEnd', function () {
            _this.incCounter({ counter: 'rupees', value: -rupees });
        });
        dojo.connect(animation, 'onEnd', function () {
            dojo.destroy('tempRupee');
            _this.game.playerManager.getPlayer({ playerId: rulerId }).incCounter({ counter: 'rupees', value: rupees });
        });
        animation.play();
    };
    PPPlayer.prototype.playCard = function (_a) {
        var card = _a.card;
        var region = this.game.gamedatas.staticData.cards[card.id].region;
        if (this.playerId === this.game.getPlayerId()) {
            this.setupCourtCard({ cardId: card.id });
            this.game.move({
                id: card.id,
                to: this.court,
                from: this.getHandZone(),
                addClass: ['pp_card_in_court', "pp_player_".concat(this.playerId), "pp_".concat(region)],
                removeClass: ['pp_card_in_hand'],
                weight: card.state,
            });
            this.removeSideSelectFromCourt();
        }
        else {
            dojo.place(tplCard({ cardId: card.id, extraClasses: "pp_card_in_court pp_player_".concat(this.playerId, " pp_").concat(region) }), "cards_".concat(this.playerId));
            this.setupCourtCard({ cardId: card.id });
            dojo.addClass(card.id, 'pp_moving');
            var div = this.court.container_div;
            attachToNewParentNoDestroy(card.id, div);
            var animation = this.game.framework().slideToObject(card.id, div);
            dojo.connect(animation, 'onEnd', function () {
                dojo.removeClass(card.id, 'pp_moving');
            });
            animation.play();
            this.court.placeInZone(card.id, card.state);
        }
        this.game.tooltipManager.addTooltipToCard({ cardId: card.id });
    };
    PPPlayer.prototype.purchaseCard = function (_a) {
        var cardId = _a.cardId, from = _a.from;
        if (this.playerId === this.game.getPlayerId()) {
            this.game.move({ id: cardId, to: this.hand, from: from, addClass: ['pp_card_in_hand'], removeClass: ['pp_market_card'] });
            this.game.tooltipManager.addTooltipToCard({ cardId: cardId });
        }
        else {
            dojo.addClass(cardId, 'pp_moving');
            from.removeFromZone(cardId, true, "player_board_".concat(this.playerId));
        }
    };
    // TODO (remove cards of other loyalties, remove gifts, remove prizes)
    PPPlayer.prototype.updatePlayerLoyalty = function (_a) {
        var coalition = _a.coalition;
        dojo
            .query("#loyalty_icon_".concat(this.playerId))
            .removeClass('pp_afghan')
            .removeClass('pp_british')
            .removeClass('pp_russian')
            .addClass("pp_".concat(coalition));
        dojo
            .query("#pp_loyalty_dial_".concat(this.playerId))
            .removeClass('pp_afghan')
            .removeClass('pp_british')
            .removeClass('pp_russian')
            .addClass("pp_".concat(coalition));
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
var PlayerManager = /** @class */ (function () {
    function PlayerManager(game) {
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
    PlayerManager.prototype.getPlayer = function (_a) {
        var playerId = _a.playerId;
        return this.players[playerId];
    };
    PlayerManager.prototype.updatePlayers = function (_a) {
        var gamedatas = _a.gamedatas;
        for (var playerId in gamedatas.players) {
            this.players[playerId].updatePlayer({ gamedatas: gamedatas });
        }
    };
    PlayerManager.prototype.clearInterface = function () {
        var _this = this;
        Object.keys(this.players).forEach(function (playerId) {
            _this.players[playerId].clearInterface();
        });
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
        this.game = game;
        this.border = border;
        this.setupBorder({ gamedatas: game.gamedatas });
    }
    Border.prototype.setupBorder = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        var borderGamedatas = gamedatas.map.borders[this.border];
        this.roadZone = new ebg.zone();
        this.createBorderZone({ border: this.border, zone: this.roadZone });
        borderGamedatas.roads.forEach(function (_a) {
            var id = _a.id;
            placeToken({
                game: _this.game,
                location: _this.roadZone,
                id: id,
                jstpl: 'jstpl_road',
                jstplProps: {
                    id: id,
                    coalition: id.split('_')[1],
                },
            });
        });
    };
    Border.prototype.clearInterface = function () {
        dojo.empty(this.roadZone.container_div);
        this.roadZone = undefined;
    };
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
        // console.log('constructor Region ', region);
        this.game = game;
        this.region = region;
        this.setupRegion({ gamedatas: game.gamedatas });
    }
    Region.prototype.setupRegion = function (_a) {
        var gamedatas = _a.gamedatas;
        var regionGamedatas = gamedatas.map.regions[this.region];
        this.setupArmyZone({ regionGamedatas: regionGamedatas });
        this.setupTribeZone({ regionGamedatas: regionGamedatas });
        this.setupRulerZone({ gamedatas: gamedatas });
    };
    Region.prototype.setupArmyZone = function (_a) {
        var _this = this;
        var regionGamedatas = _a.regionGamedatas;
        if (!this.armyZone) {
            this.armyZone = new ebg.zone();
        }
        // Setup army zone
        setupTokenZone({
            game: this.game,
            zone: this.armyZone,
            nodeId: "pp_".concat(this.region, "_armies"),
            tokenWidth: ARMY_WIDTH,
            tokenHeight: ARMY_HEIGHT,
            itemMargin: -5,
        });
        this.armyZone.instantaneous = true;
        // place armies
        regionGamedatas.armies.forEach(function (_a) {
            var id = _a.id;
            placeToken({
                game: _this.game,
                location: _this.armyZone,
                id: id,
                jstpl: 'jstpl_army',
                jstplProps: {
                    id: id,
                    coalition: id.split('_')[1],
                },
            });
        });
        this.armyZone.instantaneous = false;
    };
    Region.prototype.setupRulerZone = function (_a) {
        var gamedatas = _a.gamedatas;
        if (!this.rulerZone) {
            this.rulerZone = new ebg.zone();
        }
        // Ruler
        setupTokenZone({
            game: this.game,
            zone: this.rulerZone,
            nodeId: "pp_position_ruler_token_".concat(this.region),
            tokenWidth: RULER_TOKEN_WIDTH,
            tokenHeight: RULER_TOKEN_HEIGHT,
        });
        this.rulerZone.instantaneous = true;
        this.ruler = gamedatas.map.rulers[this.region];
        if (this.ruler === null) {
            placeToken({
                game: this.game,
                location: this.rulerZone,
                id: "pp_ruler_token_".concat(this.region),
                jstpl: 'jstpl_ruler_token',
                jstplProps: {
                    id: "pp_ruler_token_".concat(this.region),
                    region: this.region,
                },
            });
        }
        this.rulerZone.instantaneous = false;
    };
    Region.prototype.setupTribeZone = function (_a) {
        var _this = this;
        var regionGamedatas = _a.regionGamedatas;
        if (!this.tribeZone) {
            this.tribeZone = new ebg.zone();
        }
        // tribe zone
        setupTokenZone({
            game: this.game,
            zone: this.tribeZone,
            nodeId: "pp_".concat(this.region, "_tribes"),
            tokenWidth: TRIBE_WIDTH,
            tokenHeight: TRIBE_HEIGHT,
            itemMargin: 6,
        });
        this.tribeZone.instantaneous = true;
        // tribes
        regionGamedatas.tribes.forEach(function (_a) {
            var id = _a.id;
            placeToken({
                game: _this.game,
                location: _this.tribeZone,
                id: id,
                jstpl: 'jstpl_cylinder',
                jstplProps: {
                    id: id,
                    color: _this.game.gamedatas.players[id.split('_')[1]].color,
                },
            });
        });
        this.tribeZone.instantaneous = false;
    };
    Region.prototype.clearInterface = function () {
        dojo.empty(this.armyZone.container_div);
        this.armyZone = undefined;
        dojo.empty(this.rulerZone.container_div);
        this.rulerZone = undefined;
        dojo.empty(this.tribeZone.container_div);
        this.tribeZone = undefined;
    };
    Region.prototype.getArmyZone = function () {
        return this.armyZone;
    };
    Region.prototype.getRuler = function () {
        return this.ruler;
    };
    Region.prototype.getRulerTribes = function () {
        var _this = this;
        if (this.ruler) {
            return this.getTribeZone().getAllItems().filter(function (id) {
                return Number(id.split('_')[1]) === _this.ruler;
            });
        }
        ;
        return [];
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
    PPMap.prototype.clearInterface = function () {
        Object.values(this.borders).forEach(function (border) {
            border.clearInterface();
        });
        Object.values(this.regions).forEach(function (region) {
            region.clearInterface();
        });
    };
    PPMap.prototype.updateMap = function (_a) {
        var gamedatas = _a.gamedatas;
        Object.values(this.borders).forEach(function (border) {
            border.setupBorder({ gamedatas: gamedatas });
        });
        Object.values(this.regions).forEach(function (region) {
            region.setupRegion({ gamedatas: gamedatas });
        });
    };
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
var Market = /** @class */ (function () {
    function Market(game) {
        this.game = game;
        this.marketCards = [];
        this.marketRupees = [];
        var gamedatas = game.gamedatas;
        this.setupMarket({ gamedatas: gamedatas });
    }
    Market.prototype.setupMarket = function (_a) {
        var gamedatas = _a.gamedatas;
        console.log('marketCards', this.marketCards);
        // Set up market
        for (var row = 0; row <= 1; row++) {
            if (!this.marketCards[row]) {
                this.marketCards[row] = [];
            }
            if (!this.marketRupees[row]) {
                this.marketRupees[row] = [];
            }
            for (var column = 0; column <= 5; column++) {
                this.setupMarketCardZone({ row: row, column: column, gamedatas: gamedatas });
                this.setupMarketRupeeZone({ row: row, column: column, gamedatas: gamedatas });
            }
        }
    };
    Market.prototype.setupMarketCardZone = function (_a) {
        var row = _a.row, column = _a.column, gamedatas = _a.gamedatas;
        var containerId = "pp_market_".concat(row, "_").concat(column);
        dojo.place("<div id=\"pp_market_".concat(row, "_").concat(column, "_rupees\" class=\"pp_market_rupees\"></div>"), containerId);
        if (this.marketCards[row][column]) {
            this.marketCards[row][column].removeAll();
            // return;
        }
        else {
            this.marketCards[row][column] = new ebg.zone();
            this.marketCards[row][column].create(this.game, containerId, CARD_WIDTH, CARD_HEIGHT);
        }
        this.marketCards[row][column].instantaneous = true;
        // add cards
        var cardInMarket = gamedatas.market.cards[row][column];
        if (cardInMarket) {
            var cardId = cardInMarket.id;
            dojo.place(tplCard({ cardId: cardId, extraClasses: 'pp_market_card' }), this.marketCards[row][column].container_div);
            this.marketCards[row][column].placeInZone(cardId);
            this.game.tooltipManager.addTooltipToCard({ cardId: cardId });
        }
        this.marketCards[row][column].instantaneous = false;
    };
    Market.prototype.setupMarketRupeeZone = function (_a) {
        var _this = this;
        var row = _a.row, column = _a.column, gamedatas = _a.gamedatas;
        // Set up zone for all rupees in the market
        var rupeeContainerId = "pp_market_".concat(row, "_").concat(column, "_rupees");
        if (this.marketRupees[row][column]) {
            this.marketRupees[row][column].removeAll();
        }
        else {
            this.marketRupees[row][column] = new ebg.zone();
            setupTokenZone({
                game: this.game,
                zone: this.marketRupees[row][column],
                nodeId: rupeeContainerId,
                tokenWidth: RUPEE_WIDTH,
                tokenHeight: RUPEE_HEIGHT,
                itemMargin: -30,
            });
        }
        this.marketRupees[row][column].instantaneous = true;
        gamedatas.market.rupees
            .filter(function (rupee) { return rupee.location === "market_".concat(row, "_").concat(column, "_rupees"); })
            .forEach(function (rupee) {
            dojo.place(tplRupee({ rupeeId: rupee.id }), _this.marketRupees[row][column].container_div);
            _this.marketRupees[row][column].placeInZone(rupee.id);
        });
        this.marketRupees[row][column].instantaneous = false;
    };
    Market.prototype.clearInterface = function () {
        for (var row = 0; row <= 1; row++) {
            for (var column = 0; column <= 5; column++) {
                dojo.empty(this.marketCards[row][column].container_div);
                this.marketCards[row][column] = undefined;
                this.marketRupees[row][column] = undefined;
            }
        }
        console.log('marketCards after clearInterface', this.marketCards);
    };
    Market.prototype.getMarketCardZone = function (_a) {
        var row = _a.row, column = _a.column;
        return this.marketCards[row][column];
    };
    Market.prototype.getMarketRupeesZone = function (_a) {
        var row = _a.row, column = _a.column;
        return this.marketRupees[row][column];
    };
    Market.prototype.removeRupeesFromCard = function (_a) {
        var _this = this;
        var row = _a.row, column = _a.column, to = _a.to;
        this.marketRupees[row][column].getAllItems().forEach(function (rupeeId) {
            _this.marketRupees[row][column].removeFromZone(rupeeId, true, to);
            var animation = _this.game.framework().slideToObject(rupeeId, to);
            dojo.connect(animation, 'onEnd', function () {
                dojo.destroy(rupeeId);
            });
            animation.play();
        });
    };
    Market.prototype.placeRupeeOnCard = function (_a) {
        var row = _a.row, column = _a.column, rupeeId = _a.rupeeId, fromDiv = _a.fromDiv;
        dojo.place(tplRupee({ rupeeId: rupeeId }), fromDiv);
        var div = this.marketRupees[row][column].container_div;
        attachToNewParentNoDestroy(rupeeId, div);
        this.game.framework().slideToObject(rupeeId, div).play();
        this.marketRupees[row][column].placeInZone(rupeeId);
    };
    Market.prototype.addCardFromDeck = function (_a) {
        var cardId = _a.cardId, to = _a.to;
        dojo.place(tplCard({ cardId: cardId, extraClasses: 'pp_market_card' }), 'pp_market_deck');
        var div = this.getMarketCardZone({ row: to.row, column: to.column }).container_div;
        attachToNewParentNoDestroy(cardId, div);
        this.game.framework().slideToObject(cardId, div).play();
        this.getMarketCardZone({ row: to.row, column: to.column }).placeInZone(cardId);
        this.game.tooltipManager.addTooltipToCard({ cardId: cardId });
    };
    /**
     * Move card and all rupees on it.
     */
    Market.prototype.moveCard = function (_a) {
        var _this = this;
        var cardId = _a.cardId, from = _a.from, to = _a.to;
        this.game.move({
            id: cardId,
            from: this.getMarketCardZone({ row: from.row, column: from.column }),
            to: this.getMarketCardZone({ row: to.row, column: to.column }),
        });
        // TODO (Frans): check why in case of moving multiple rupees at the same time
        // they overlap
        this.getMarketRupeesZone({ row: from.row, column: from.column })
            .getAllItems()
            .forEach(function (rupeeId) {
            _this.game.move({
                id: rupeeId,
                to: _this.getMarketRupeesZone({ row: to.row, column: to.column }),
                from: _this.getMarketRupeesZone({ row: from.row, column: from.row }),
            });
        });
        this.game.tooltipManager.addTooltipToCard({ cardId: cardId });
    };
    Market.prototype.discardCard = function (_a) {
        var cardId = _a.cardId, row = _a.row, column = _a.column;
        // Move card to discard pile
        this.getMarketCardZone({ row: row, column: column }).removeFromZone(cardId, false);
        discardCardAnimation({ cardId: cardId, game: this.game });
        // this.game.framework().slideToObject(cardId, 'pp_discard_pile').play();
    };
    return Market;
}());
var ClientPlayCardState = /** @class */ (function () {
    function ClientPlayCardState(game) {
        this.game = game;
    }
    ClientPlayCardState.prototype.onEnteringState = function (args) {
        this.checkBribe(args);
    };
    ClientPlayCardState.prototype.onLeavingState = function () { };
    //  .####.##....##.########.########.########..########....###.....######..########
    //  ..##..###...##....##....##.......##.....##.##.........##.##...##....##.##......
    //  ..##..####..##....##....##.......##.....##.##........##...##..##.......##......
    //  ..##..##.##.##....##....######...########..######...##.....##.##.......######..
    //  ..##..##..####....##....##.......##...##...##.......#########.##.......##......
    //  ..##..##...###....##....##.......##....##..##.......##.....##.##....##.##......
    //  .####.##....##....##....########.##.....##.##.......##.....##..######..########
    // ..######..########.########.########...######.
    // .##....##....##....##.......##.....##.##....##
    // .##..........##....##.......##.....##.##......
    // ..######.....##....######...########...######.
    // .......##....##....##.......##..............##
    // .##....##....##....##.......##........##....##
    // ..######.....##....########.##.........######.
    ClientPlayCardState.prototype.updateInterfacePlayCardBribe = function (_a) {
        var _this = this;
        var cardId = _a.cardId, ruler = _a.ruler, rupees = _a.rupees;
        this.game.clearPossible();
        var localState = this.game.localState;
        dojo.query(".pp_card_in_hand.pp_".concat(cardId)).addClass('pp_selected');
        this.game.clientUpdatePageTitle({
            text: substituteKeywords({
                string: " ${you} must pay a bribe of ${rupees} rupee(s) to ${playerName} or ask to waive",
                args: {
                    rupees: rupees,
                },
                playerColor: ruler.getColor(),
            }),
            args: {
                playerName: ruler.getName(),
                you: '${you}',
            },
        });
        if (rupees <= localState.activePlayer.rupees) {
            this.game.addPrimaryActionButton({
                id: "pay_bribe_btn",
                text: _('Pay bribe'),
                callback: function () { return _this.playCardNextStep({ cardId: cardId, bribe: rupees }); },
            });
        }
        var _loop_1 = function (i) {
            if (i > localState.activePlayer.rupees) {
                return { value: void 0 };
            }
            this_1.game.addPrimaryActionButton({
                id: "ask_partial_waive_".concat(i, "_btn"),
                text: dojo.string.substitute(_("Offer ".concat(i, " rupee(s)")), { i: i }),
                callback: function () { return _this.playCardNextStep({ cardId: cardId, bribe: i }); },
            });
        };
        var this_1 = this;
        for (var i = rupees - 1; i >= 1; i--) {
            var state_1 = _loop_1(i);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        this.game.addPrimaryActionButton({
            id: "ask_waive_btn",
            text: _('Ask to waive'),
            callback: function () { return _this.playCardNextStep({ cardId: cardId, bribe: 0 }); },
        });
        this.game.addCancelButton();
    };
    ClientPlayCardState.prototype.updateInterfacePlayCardConfirm = function (_a) {
        var _this = this;
        var cardId = _a.cardId, side = _a.side, firstCard = _a.firstCard, bribe = _a.bribe;
        this.game.clearPossible();
        dojo.query("#pp_card_select_".concat(side)).addClass('pp_selected');
        dojo.query(".pp_card_in_hand.pp_".concat(cardId)).addClass('pp_selected');
        if (firstCard) {
            this.game.clientUpdatePageTitle({
                text: _("Play '${name}' to court?"),
                args: {
                    name: this.game.getCardInfo({ cardId: cardId }).name,
                },
            });
        }
        else {
            this.game.clientUpdatePageTitle({
                text: _("Play '${name}' to ${side} side of court?"),
                args: {
                    name: this.game.getCardInfo({ cardId: cardId }).name,
                    side: side,
                },
            });
        }
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () {
                return _this.game.takeAction({
                    action: 'playCard',
                    data: {
                        cardId: cardId,
                        leftSide: side === 'left',
                        bribe: bribe,
                    },
                });
            },
        });
        this.game.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () {
                _this.removeSideSelectable();
                _this.game.onCancel();
            },
        });
    };
    ClientPlayCardState.prototype.updateInterfacePlayCardSelectSide = function (_a) {
        var _this = this;
        var cardId = _a.cardId, bribe = _a.bribe;
        this.game.clearPossible();
        dojo.query(".pp_card_in_hand.pp_".concat(cardId)).addClass('pp_selected');
        this.game.clientUpdatePageTitle({
            text: _("Select which side of court to play '${name}'"),
            args: {
                name: this.game.getCardInfo({ cardId: cardId }).name,
            },
        });
        this.setSideSelectable({ cardId: cardId, bribe: bribe });
        this.game.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () {
                _this.game.onCancel();
                _this.removeSideSelectable();
            },
        });
    };
    //  .##.....##.########.####.##.......####.########.##....##
    //  .##.....##....##.....##..##........##.....##.....##..##.
    //  .##.....##....##.....##..##........##.....##......####..
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  ..#######.....##....####.########.####....##.......##...
    ClientPlayCardState.prototype.checkBribe = function (_a) {
        var cardId = _a.cardId;
        // Check if other player rules the region
        var cardInfo = this.game.getCardInfo({ cardId: cardId });
        var region = cardInfo.region;
        var rulerId = this.game.map.getRegion({ region: region }).getRuler();
        var playerId = this.game.getPlayerId();
        if (rulerId !== null && rulerId !== playerId) {
            var rupees = this.game.map.getRegion({ region: region }).getRulerTribes().length;
            this.updateInterfacePlayCardBribe({ cardId: cardId, ruler: this.game.playerManager.getPlayer({ playerId: rulerId }), rupees: rupees });
        }
        else {
            this.playCardNextStep({ cardId: cardId, bribe: 0 });
        }
    };
    ClientPlayCardState.prototype.playCardNextStep = function (_a) {
        var cardId = _a.cardId, bribe = _a.bribe;
        var numberOfCardsInCourt = this.game.playerManager
            .getPlayer({ playerId: this.game.getPlayerId() })
            .getCourtZone()
            .getAllItems().length;
        if (numberOfCardsInCourt === 0) {
            this.updateInterfacePlayCardConfirm({ cardId: cardId, firstCard: true, side: 'left', bribe: bribe });
        }
        else {
            this.updateInterfacePlayCardSelectSide({ cardId: cardId, bribe: bribe });
        }
    };
    ClientPlayCardState.prototype.removeSideSelectable = function () {
        this.game.playerManager.getPlayer({ playerId: this.game.getPlayerId() }).removeSideSelectFromCourt();
    };
    ClientPlayCardState.prototype.setSideSelectable = function (_a) {
        var _this = this;
        var cardId = _a.cardId, bribe = _a.bribe;
        this.game.playerManager.getPlayer({ playerId: this.game.getPlayerId() }).addSideSelectToCourt();
        dojo.query('#pp_card_select_left').forEach(function (node) {
            dojo.connect(node, 'onclick', _this, function () {
                _this.updateInterfacePlayCardConfirm({ cardId: cardId, firstCard: false, side: 'left', bribe: bribe });
            });
        });
        dojo.query('#pp_card_select_right').forEach(function (node) {
            dojo.connect(node, 'onclick', _this, function () {
                _this.updateInterfacePlayCardConfirm({ cardId: cardId, firstCard: false, side: 'right', bribe: bribe });
            });
        });
    };
    return ClientPlayCardState;
}());
var ClientPurchaseCardState = /** @class */ (function () {
    function ClientPurchaseCardState(game) {
        this.game = game;
    }
    ClientPurchaseCardState.prototype.onEnteringState = function (args) {
        this.updateInterfaceInitialStep(args);
    };
    ClientPurchaseCardState.prototype.onLeavingState = function () { };
    //  .####.##....##.########.########.########..########....###.....######..########
    //  ..##..###...##....##....##.......##.....##.##.........##.##...##....##.##......
    //  ..##..####..##....##....##.......##.....##.##........##...##..##.......##......
    //  ..##..##.##.##....##....######...########..######...##.....##.##.......######..
    //  ..##..##..####....##....##.......##...##...##.......#########.##.......##......
    //  ..##..##...###....##....##.......##....##..##.......##.....##.##....##.##......
    //  .####.##....##....##....########.##.....##.##.......##.....##..######..########
    // ..######..########.########.########...######.
    // .##....##....##....##.......##.....##.##....##
    // .##..........##....##.......##.....##.##......
    // ..######.....##....######...########...######.
    // .......##....##....##.......##..............##
    // .##....##....##....##.......##........##....##
    // ..######.....##....########.##.........######.
    ClientPurchaseCardState.prototype.updateInterfaceInitialStep = function (_a) {
        var _this = this;
        var cardId = _a.cardId, cost = _a.cost;
        this.game.clearPossible();
        var cardInfo = this.game.getCardInfo({ cardId: cardId });
        var name = cardInfo.type === COURT_CARD ? cardInfo.name : cardInfo.purchased.title;
        dojo.query(".pp_".concat(cardId)).addClass('pp_selected');
        this.game.clientUpdatePageTitle({
            text: _("Purchase '${name}' for ${cost} rupee(s)?"),
            args: {
                name: name,
                cost: cost,
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.game.takeAction({ action: 'purchaseCard', data: { cardId: cardId } }); },
        });
        this.game.addCancelButton();
    };
    return ClientPurchaseCardState;
}());
var DiscardCourtState = /** @class */ (function () {
    function DiscardCourtState(game) {
        this.game = game;
    }
    DiscardCourtState.prototype.onEnteringState = function (_a) {
        var numberOfDiscards = _a.numberOfDiscards;
        this.numberOfDiscards = numberOfDiscards;
        this.updateInterfaceInitialStep();
        // this.updateInterface({ nextStep: DISCARD_COURT, args: { discardCourt: args.args as EnteringDiscardCourtArgs } });
    };
    DiscardCourtState.prototype.onLeavingState = function () { };
    //  .####.##....##.########.########.########..########....###.....######..########
    //  ..##..###...##....##....##.......##.....##.##.........##.##...##....##.##......
    //  ..##..####..##....##....##.......##.....##.##........##...##..##.......##......
    //  ..##..##.##.##....##....######...########..######...##.....##.##.......######..
    //  ..##..##..####....##....##.......##...##...##.......#########.##.......##......
    //  ..##..##...###....##....##.......##....##..##.......##.....##.##....##.##......
    //  .####.##....##....##....########.##.....##.##.......##.....##..######..########
    // ..######..########.########.########...######.
    // .##....##....##....##.......##.....##.##....##
    // .##..........##....##.......##.....##.##......
    // ..######.....##....######...########...######.
    // .......##....##....##.......##..............##
    // .##....##....##....##.......##........##....##
    // ..######.....##....########.##.........######.
    DiscardCourtState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: this.numberOfDiscards !== 1
                ? _('${you} must discard ${numberOfDiscards} cards')
                : _('${you} must discard ${numberOfDiscards} card'),
            args: {
                numberOfDiscards: this.numberOfDiscards,
                you: '${you}',
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.handleDiscardConfirm({ fromHand: false }); },
        });
        dojo.addClass('confirm_btn', 'pp_disabled');
        this.setCourtCardsSelectableForDiscard();
    };
    //  .##.....##.########.####.##.......####.########.##....##
    //  .##.....##....##.....##..##........##.....##.....##..##.
    //  .##.....##....##.....##..##........##.....##......####..
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  ..#######.....##....####.########.####....##.......##...
    DiscardCourtState.prototype.handleDiscardConfirm = function (_a) {
        var fromHand = _a.fromHand;
        var nodes = dojo.query('.pp_selected');
        if (nodes.length === this.numberOfDiscards) {
            var cards_1 = '';
            nodes.forEach(function (node, index) {
                cards_1 += ' ' + node.id;
            }, this);
            this.game.takeAction({
                action: 'discardCards',
                data: {
                    cards: cards_1,
                    fromHand: fromHand,
                },
            });
        }
    };
    DiscardCourtState.prototype.setCourtCardsSelectableForDiscard = function () {
        var _this = this;
        var playerId = this.game.getPlayerId();
        dojo.query(".pp_card_in_court.pp_player_".concat(playerId)).forEach(function (node, index) {
            var cardId = 'card_' + node.id.split('_')[1];
            console.log('cardId in courtcardselect', cardId);
            dojo.addClass(node, 'pp_selectable');
            _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () { return _this.handleDiscardSelect({ cardId: cardId }); }));
        }, this);
    };
    DiscardCourtState.prototype.handleDiscardSelect = function (_a) {
        var cardId = _a.cardId;
        dojo.query(".pp_card_in_zone.pp_".concat(cardId)).toggleClass('pp_selected').toggleClass('pp_discard').toggleClass('pp_selectable');
        var numberSelected = dojo.query('.pp_selected').length;
        console.log('button_check', cardId, numberSelected, this.numberOfDiscards);
        if (numberSelected === this.numberOfDiscards) {
            dojo.removeClass('confirm_btn', 'pp_disabled');
        }
        else {
            dojo.addClass('confirm_btn', 'pp_disabled');
        }
    };
    return DiscardCourtState;
}());
var DiscardHandState = /** @class */ (function () {
    function DiscardHandState(game) {
        this.game = game;
    }
    DiscardHandState.prototype.onEnteringState = function (_a) {
        var numberOfDiscards = _a.numberOfDiscards;
        this.numberOfDiscards = numberOfDiscards;
        this.updateInterfaceInitialStep();
        // this.updateInterface({ nextStep: DISCARD_HAND, args: { discardHand: args.args as EnteringDiscardHandArgs } });
    };
    DiscardHandState.prototype.onLeavingState = function () { };
    //  .####.##....##.########.########.########..########....###.....######..########
    //  ..##..###...##....##....##.......##.....##.##.........##.##...##....##.##......
    //  ..##..####..##....##....##.......##.....##.##........##...##..##.......##......
    //  ..##..##.##.##....##....######...########..######...##.....##.##.......######..
    //  ..##..##..####....##....##.......##...##...##.......#########.##.......##......
    //  ..##..##...###....##....##.......##....##..##.......##.....##.##....##.##......
    //  .####.##....##....##....########.##.....##.##.......##.....##..######..########
    // ..######..########.########.########...######.
    // .##....##....##....##.......##.....##.##....##
    // .##..........##....##.......##.....##.##......
    // ..######.....##....######...########...######.
    // .......##....##....##.......##..............##
    // .##....##....##....##.......##........##....##
    // ..######.....##....########.##.........######.
    DiscardHandState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must discard ${numberOfDiscards} card(s)'),
            args: {
                numberOfDiscards: this.numberOfDiscards,
                you: '${you}',
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.handleDiscardConfirm({ fromHand: true }); },
        });
        dojo.addClass('confirm_btn', 'pp_disabled');
        this.game.setHandCardsSelectable({
            callback: function (_a) {
                var cardId = _a.cardId;
                return _this.handleDiscardSelect({ cardId: cardId });
            },
        });
    };
    //  .##.....##.########.####.##.......####.########.##....##
    //  .##.....##....##.....##..##........##.....##.....##..##.
    //  .##.....##....##.....##..##........##.....##......####..
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  ..#######.....##....####.########.####....##.......##...
    DiscardHandState.prototype.handleDiscardConfirm = function (_a) {
        var fromHand = _a.fromHand;
        var nodes = dojo.query('.pp_selected');
        if (nodes.length === this.numberOfDiscards) {
            var cards_2 = '';
            nodes.forEach(function (node, index) {
                cards_2 += ' ' + node.id;
            }, this);
            this.game.takeAction({
                action: 'discardCards',
                data: {
                    cards: cards_2,
                    fromHand: fromHand,
                },
            });
        }
    };
    DiscardHandState.prototype.handleDiscardSelect = function (_a) {
        var cardId = _a.cardId;
        dojo.query(".pp_card_in_zone.pp_".concat(cardId)).toggleClass('pp_selected').toggleClass('pp_discard').toggleClass('pp_selectable');
        var numberSelected = dojo.query('.pp_selected').length;
        console.log('button_check', cardId, numberSelected, this.numberOfDiscards);
        if (numberSelected === this.numberOfDiscards) {
            dojo.removeClass('confirm_btn', 'pp_disabled');
        }
        else {
            dojo.addClass('confirm_btn', 'pp_disabled');
        }
    };
    return DiscardHandState;
}());
var NegotiateBribeState = /** @class */ (function () {
    function NegotiateBribeState(game) {
        this.game = game;
    }
    NegotiateBribeState.prototype.onEnteringState = function (_a) {
        var currentAmount = _a.currentAmount, ruler = _a.ruler, possible = _a.possible;
        this.updateInterfaceInitialStep({ amount: currentAmount, ruler: ruler, possible: possible });
    };
    NegotiateBribeState.prototype.onLeavingState = function () { };
    //  .####.##....##.########.########.########..########....###.....######..########
    //  ..##..###...##....##....##.......##.....##.##.........##.##...##....##.##......
    //  ..##..####..##....##....##.......##.....##.##........##...##..##.......##......
    //  ..##..##.##.##....##....######...########..######...##.....##.##.......######..
    //  ..##..##..####....##....##.......##...##...##.......#########.##.......##......
    //  ..##..##...###....##....##.......##....##..##.......##.....##.##....##.##......
    //  .####.##....##....##....########.##.....##.##.......##.....##..######..########
    // ..######..########.########.########...######.
    // .##....##....##....##.......##.....##.##....##
    // .##..........##....##.......##.....##.##......
    // ..######.....##....######...########...######.
    // .......##....##....##.......##..............##
    // .##....##....##....##.......##........##....##
    // ..######.....##....########.##.........######.
    NegotiateBribeState.prototype.updateInterfaceInitialStep = function (_a) {
        var _this = this;
        var amount = _a.amount, possible = _a.possible, ruler = _a.ruler;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: '${you} must accept or decline bribe of ${amount} rupee(s)',
            args: {
                amount: amount,
                you: '${you}',
            },
        });
        var isRuler = ruler === this.game.getPlayerId();
        if (isRuler || (!isRuler && amount <= this.game.localState.activePlayer.rupees)) {
            this.game.addPrimaryActionButton({
                id: 'accept_btn',
                text: _('Accept'),
                callback: function () { return _this.game.takeAction({ action: 'acceptBribe' }); },
            });
        }
        possible.reverse().forEach(function (value) {
            if (value == amount || (isRuler && value < amount) || (!isRuler && value > _this.game.localState.activePlayer.rupees)) {
                return;
            }
            _this.game.addPrimaryActionButton({
                id: "ask_partial_waive_".concat(value, "_btn"),
                text: isRuler
                    ? dojo.string.substitute(_("Demand ".concat(value, " rupee(s)")), { value: value })
                    : dojo.string.substitute(_("Offer ".concat(value, " rupee(s)")), { value: value }),
                callback: function () {
                    return _this.game.takeAction({
                        action: 'proposeBribeAmount',
                        data: {
                            amount: value,
                        },
                    });
                },
            });
        });
        this.game.addSecondaryActionButton({
            id: 'decline_btn',
            text: _('Decline'),
            callback: function () { return _this.game.takeAction({ action: 'declineBribe' }); },
        });
    };
    return NegotiateBribeState;
}());
var PlaceRoadState = /** @class */ (function () {
    function PlaceRoadState(game) {
        this.game = game;
    }
    PlaceRoadState.prototype.onEnteringState = function (_a) {
        var region = _a.region;
        this.updateInterfaceInitialStep({ borders: region.borders });
    };
    PlaceRoadState.prototype.onLeavingState = function () { };
    //  .####.##....##.########.########.########..########....###.....######..########
    //  ..##..###...##....##....##.......##.....##.##.........##.##...##....##.##......
    //  ..##..####..##....##....##.......##.....##.##........##...##..##.......##......
    //  ..##..##.##.##....##....######...########..######...##.....##.##.......######..
    //  ..##..##..####....##....##.......##...##...##.......#########.##.......##......
    //  ..##..##...###....##....##.......##....##..##.......##.....##.##....##.##......
    //  .####.##....##....##....########.##.....##.##.......##.....##..######..########
    // ..######..########.########.########...######.
    // .##....##....##....##.......##.....##.##....##
    // .##..........##....##.......##.....##.##......
    // ..######.....##....######...########...######.
    // .......##....##....##.......##..............##
    // .##....##....##....##.......##........##....##
    // ..######.....##....########.##.........######.
    PlaceRoadState.prototype.updateInterfaceInitialStep = function (_a) {
        var _this = this;
        var borders = _a.borders;
        this.game.clearPossible();
        borders.forEach(function (border) {
            _this.game.addPrimaryActionButton({
                id: "".concat(border, "_btn"),
                text: _(_this.game.gamedatas.staticData.borders[border].name),
                callback: function () { return _this.game.takeAction({ action: 'placeRoad', data: { border: border } }); },
            });
        });
    };
    return PlaceRoadState;
}());
var PlaceSpyState = /** @class */ (function () {
    function PlaceSpyState(game) {
        this.game = game;
    }
    PlaceSpyState.prototype.onEnteringState = function (_a) {
        var regionId = _a.regionId;
        this.updateInterfaceInitialStep({ regionId: regionId });
    };
    PlaceSpyState.prototype.onLeavingState = function () { };
    //  .####.##....##.########.########.########..########....###.....######..########
    //  ..##..###...##....##....##.......##.....##.##.........##.##...##....##.##......
    //  ..##..####..##....##....##.......##.....##.##........##...##..##.......##......
    //  ..##..##.##.##....##....######...########..######...##.....##.##.......######..
    //  ..##..##..####....##....##.......##...##...##.......#########.##.......##......
    //  ..##..##...###....##....##.......##....##..##.......##.....##.##....##.##......
    //  .####.##....##....##....########.##.....##.##.......##.....##..######..########
    // ..######..########.########.########...######.
    // .##....##....##....##.......##.....##.##....##
    // .##..........##....##.......##.....##.##......
    // ..######.....##....######...########...######.
    // .......##....##....##.......##..............##
    // .##....##....##....##.......##........##....##
    // ..######.....##....########.##.........######.
    PlaceSpyState.prototype.updateInterfaceInitialStep = function (_a) {
        var regionId = _a.regionId;
        this.game.clearPossible();
        this.setPlaceSpyCardsSelectable({ regionId: regionId });
    };
    PlaceSpyState.prototype.updateInterfaceConfirmPlaceSpy = function (_a) {
        var _this = this;
        var cardId = _a.cardId;
        this.game.clearPossible();
        dojo.query(".pp_card_in_court.pp_".concat(cardId)).addClass('pp_selected');
        this.game.clientUpdatePageTitle({
            text: _('Place a spy on ${cardName}'),
            args: {
                cardName: this.game.getCardInfo({ cardId: cardId }).name,
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.game.takeAction({ action: 'placeSpy', data: { cardId: cardId } }); },
        });
        this.game.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () { return _this.game.onCancel(); },
        });
    };
    //  .##.....##.########.####.##.......####.########.##....##
    //  .##.....##....##.....##..##........##.....##.....##..##.
    //  .##.....##....##.....##..##........##.....##......####..
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  ..#######.....##....####.########.####....##.......##...
    PlaceSpyState.prototype.setPlaceSpyCardsSelectable = function (_a) {
        var _this = this;
        var regionId = _a.regionId;
        dojo.query(".pp_card_in_court.pp_".concat(regionId)).forEach(function (node, index) {
            var cardId = node.id;
            dojo.addClass(node, 'pp_selectable');
            _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () { return _this.updateInterfaceConfirmPlaceSpy({ cardId: cardId }); }));
        });
    };
    return PlaceSpyState;
}());
var PlayerActionsState = /** @class */ (function () {
    function PlayerActionsState(game) {
        this.game = game;
    }
    PlayerActionsState.prototype.onEnteringState = function (args) {
        this.game.updateLocalState(args);
        this.updateInterfaceInitialStep();
    };
    PlayerActionsState.prototype.onLeavingState = function () {
        debug('Leaving PlayerActionsState');
    };
    //  .####.##....##.########.########.########..########....###.....######..########
    //  ..##..###...##....##....##.......##.....##.##.........##.##...##....##.##......
    //  ..##..####..##....##....##.......##.....##.##........##...##..##.......##......
    //  ..##..##.##.##....##....######...########..######...##.....##.##.......######..
    //  ..##..##..####....##....##.......##...##...##.......#########.##.......##......
    //  ..##..##...###....##....##.......##....##..##.......##.....##.##....##.##......
    //  .####.##....##....##....########.##.....##.##.......##.....##..######..########
    // ..######..########.########.########...######.
    // .##....##....##....##.......##.....##.##....##
    // .##..........##....##.......##.....##.##......
    // ..######.....##....######...########...######.
    // .......##....##....##.......##..............##
    // .##....##....##....##.......##........##....##
    // ..######.....##....########.##.........######.
    PlayerActionsState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.updateMainTitleTextActions();
        if (this.activePlayerHasActions()) {
            this.game.addSecondaryActionButton({
                id: 'pass_btn',
                text: _('End Turn'),
                callback: function () { return _this.onPass(); },
            });
            this.setMarketCardsSelectable();
            this.game.setHandCardsSelectable({
                callback: function (_a) {
                    var cardId = _a.cardId;
                    _this.game.framework().setClientState('clientPlayCard', { args: { cardId: cardId } });
                },
            });
            this.setCardActionsSelectable();
        }
        else {
            if (this.activePlayerHasFreeCardActions()) {
                this.setCardActionsSelectable();
            }
            this.game.addPrimaryActionButton({
                id: 'pass_btn',
                text: _('End Turn'),
                callback: function () { return _this.onPass(); },
            });
        }
        this.game.addDangerActionButton({
            id: 'undo_btn',
            text: _('Undo'),
            callback: function () { return _this.game.takeAction({ action: 'restart' }); },
        });
    };
    PlayerActionsState.prototype.updateInterfaceCardActionBattleStart = function (_a) {
        var cardId = _a.cardId;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a card or region'),
            args: {},
        });
        this.setRegionsSelectable();
    };
    PlayerActionsState.prototype.updateInterfaceCardActionBetrayStart = function (_a) {
        var cardId = _a.cardId;
        this.game.clearPossible();
        console.log('betray clicked');
    };
    PlayerActionsState.prototype.updateInterfaceCardActionBuildStart = function (_a) {
        var cardId = _a.cardId;
        this.game.clearPossible();
        console.log('build clicked');
    };
    PlayerActionsState.prototype.updateInterfaceCardActionGiftStart = function (_a) {
        var cardId = _a.cardId;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a gift to purchase'),
            args: {
                you: '${you}',
            },
        });
        this.setGiftsSelectable({ cardId: cardId });
        this.game.addCancelButton();
    };
    PlayerActionsState.prototype.updateInterfaceCardActionMoveStart = function (_a) {
        var cardId = _a.cardId;
        this.game.clearPossible();
        console.log('move clicked');
    };
    PlayerActionsState.prototype.updateInterfaceCardActionTaxStart = function (_a) {
        var cardId = _a.cardId;
        this.game.clearPossible();
        console.log('tax clicked');
    };
    PlayerActionsState.prototype.updateInterfaceConfirmSelectGift = function (_a) {
        var _this = this;
        var value = _a.value, cardId = _a.cardId;
        this.game.clearPossible();
        dojo.query("#pp_gift_".concat(value, "_").concat(this.game.getPlayerId())).addClass('pp_selected');
        this.game.clientUpdatePageTitle({ text: _('Purchase gift for ${value} rupees?'), args: { value: '' + value } });
        this.game.addDangerActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () {
                return _this.game.takeAction({
                    action: 'selectGift',
                    data: { selectedGift: value, cardId: cardId },
                });
            },
        });
        this.game.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () {
                _this.game.onCancel();
            },
        });
    };
    PlayerActionsState.prototype.updateInterfacePass = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({ text: _('Confirm to your end turn'), args: {} });
        this.game.addDangerActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.game.takeAction({ action: 'pass' }); },
        });
        this.game.addSecondaryActionButton({ id: 'cancel_btn', text: _('Cancel'), callback: function () { return _this.game.onCancel(); } });
    };
    //  .##.....##.########.####.##.......####.########.##....##
    //  .##.....##....##.....##..##........##.....##.....##..##.
    //  .##.....##....##.....##..##........##.....##......####..
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  .##.....##....##.....##..##........##.....##.......##...
    //  ..#######.....##....####.########.####....##.......##...
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
    PlayerActionsState.prototype.updateMainTitleTextActions = function () {
        var remainingActions = this.game.localState.remainingActions;
        var hasCardActions = this.activePlayerHasCardActions();
        var hasHandCards = this.currentPlayerHasHandCards();
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
    PlayerActionsState.prototype.activePlayerHasActions = function () {
        return this.game.localState.remainingActions > 0 || false;
    };
    PlayerActionsState.prototype.activePlayerHasCardActions = function () {
        var _this = this;
        return this.game.localState.activePlayer.court.cards.some(function (_a) {
            var id = _a.id, used = _a.used;
            var cardInfo = _this.game.gamedatas.staticData.cards[id];
            return used === 0 && Object.keys(cardInfo.actions).length > 0;
        });
    };
    PlayerActionsState.prototype.activePlayerHasFreeCardActions = function () {
        var _this = this;
        return this.game.localState.activePlayer.court.cards.some(function (_a) {
            var id = _a.id, used = _a.used;
            var cardInfo = _this.game.gamedatas.staticData.cards[id];
            return (used === 0 && cardInfo.suit == _this.game.objectManager.favoredSuit.get() && Object.keys(cardInfo).length > 0);
        });
    };
    PlayerActionsState.prototype.currentPlayerHasHandCards = function () {
        var currentPlayerId = this.game.getPlayerId();
        return this.game.playerManager.getPlayer({ playerId: currentPlayerId }).getHandZone().getItemNumber() > 0;
    };
    PlayerActionsState.prototype.activePlayerHasCourtCards = function () {
        return this.game.localState.activePlayer.court.cards.length > 0;
    };
    PlayerActionsState.prototype.setCardActionsSelectable = function () {
        var _this = this;
        var playerId = this.game.getPlayerId();
        dojo.query(".pp_card_in_court.pp_player_".concat(playerId)).forEach(function (node) {
            var _a, _b;
            var cardId = node.id;
            var used = ((_b = (_a = _this.game.localState.activePlayer.court.cards) === null || _a === void 0 ? void 0 : _a.find(function (card) { return card.id === cardId; })) === null || _b === void 0 ? void 0 : _b.used) === 1;
            if (!used &&
                (_this.game.localState.remainingActions > 0 ||
                    _this.game.gamedatas.staticData.cards[cardId].suit === _this.game.objectManager.favoredSuit.get()))
                dojo.map(node.children, function (child) {
                    if (dojo.hasClass(child, 'pp_card_action')) {
                        var cardAction_1 = child.id.split('_')[0];
                        // const nextStep = `cardAction${capitalizeFirstLetter(child.id.split('_')[0])}`;
                        dojo.addClass(child, 'pp_selectable');
                        _this.game._connections.push(dojo.connect(child, 'onclick', _this, function () {
                            switch (cardAction_1) {
                                case 'battle':
                                    _this.updateInterfaceCardActionBattleStart({ cardId: cardId });
                                    break;
                                case 'betray':
                                    _this.updateInterfaceCardActionBetrayStart({ cardId: cardId });
                                    break;
                                case 'build':
                                    _this.updateInterfaceCardActionBuildStart({ cardId: cardId });
                                    break;
                                case 'gift':
                                    _this.updateInterfaceCardActionGiftStart({ cardId: cardId });
                                    break;
                                case 'move':
                                    _this.updateInterfaceCardActionMoveStart({ cardId: cardId });
                                    break;
                                case 'tax':
                                    _this.updateInterfaceCardActionTaxStart({ cardId: cardId });
                                    break;
                            }
                            // this.updateInterface({ nextStep, args: { cardAction: { cardId } } });
                        }));
                    }
                });
        });
    };
    PlayerActionsState.prototype.setGiftsSelectable = function (_a) {
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
            if (!hasGift && giftValue <= _this.game.localState.activePlayer.rupees) {
                dojo.query("#pp_gift_".concat(giftValue, "_").concat(playerId)).forEach(function (node) {
                    dojo.addClass(node, 'pp_selectable');
                    _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () { return _this.updateInterfaceConfirmSelectGift({ value: giftValue, cardId: cardId }); }));
                });
            }
        });
    };
    PlayerActionsState.prototype.setMarketCardsSelectable = function () {
        var _this = this;
        var baseCardCost = this.game.objectManager.favoredSuit.get() === MILITARY ? 2 : 1;
        dojo.query('.pp_market_card').forEach(function (node) {
            var cost = Number(node.parentElement.id.split('_')[3]) * baseCardCost; // cost is equal to the column number
            var cardId = node.id;
            if (cost <= _this.game.localState.activePlayer.rupees &&
                !_this.game.localState.usedCards.includes(cardId)) {
                dojo.addClass(node, 'pp_selectable');
                _this.game._connections.push(
                // dojo.connect(node, 'onclick', this, () => this.updateInterfacePurchaseCardConfirm({ cardId, cost }))
                dojo.connect(node, 'onclick', _this, function () {
                    return _this.game.framework().setClientState('clientPurchaseCard', { args: { cardId: cardId, cost: cost } });
                }));
            }
        });
    };
    PlayerActionsState.prototype.setRegionsSelectable = function () {
        var _this = this;
        var container = document.getElementById("pp_map_areas");
        container.classList.add('pp_selectable');
        REGIONS.forEach(function (region) {
            var element = document.getElementById("pp_region_".concat(region));
            element.classList.add('pp_selectable');
            _this.game._connections.push(dojo.connect(element, 'onclick', _this, function () { return console.log('Region', region); }));
        });
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
    PlayerActionsState.prototype.onPass = function () {
        if (!this.game.framework().checkAction('pass') || !this.game.framework().isCurrentPlayerActive())
            return;
        if (Number(this.game.localState.remainingActions) > 0) {
            this.updateInterfacePass();
            return;
        }
        this.game.takeAction({ action: 'pass' });
    };
    return PlayerActionsState;
}());
var SetupState = /** @class */ (function () {
    function SetupState(game) {
        this.game = game;
    }
    SetupState.prototype.onEnteringState = function () {
        this.updateInterfaceInitialStep();
        console.log('onEntering setup');
    };
    SetupState.prototype.onLeavingState = function () { };
    //  .####.##....##.########.########.########..########....###.....######..########
    //  ..##..###...##....##....##.......##.....##.##.........##.##...##....##.##......
    //  ..##..####..##....##....##.......##.....##.##........##...##..##.......##......
    //  ..##..##.##.##....##....######...########..######...##.....##.##.......######..
    //  ..##..##..####....##....##.......##...##...##.......#########.##.......##......
    //  ..##..##...###....##....##.......##....##..##.......##.....##.##....##.##......
    //  .####.##....##....##....########.##.....##.##.......##.....##..######..########
    // ..######..########.########.########...######.
    // .##....##....##....##.......##.....##.##....##
    // .##..........##....##.......##.....##.##......
    // ..######.....##....######...########...######.
    // .......##....##....##.......##..............##
    // .##....##....##....##.......##........##....##
    // ..######.....##....########.##.........######.
    SetupState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.addPrimaryActionButton({
            id: 'afghan_button',
            text: _('Afghan'),
            callback: function () { return _this.game.takeAction({ action: 'chooseLoyalty', data: { coalition: AFGHAN } }); },
            extraClasses: 'loyalty_button',
        });
        this.game.addPrimaryActionButton({
            id: 'british_button',
            text: _('British'),
            callback: function () { return _this.game.takeAction({ action: 'chooseLoyalty', data: { coalition: BRITISH } }); },
            extraClasses: 'loyalty_button',
        });
        this.game.addPrimaryActionButton({
            id: 'russian_button',
            text: _('Russian'),
            callback: function () { return _this.game.takeAction({ action: 'chooseLoyalty', data: { coalition: RUSSIAN } }); },
            extraClasses: 'loyalty_button',
        });
    };
    return SetupState;
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
    NotificationManager.prototype.getPlayer = function (_a) {
        var playerId = _a.playerId;
        return this.game.playerManager.getPlayer({ playerId: playerId });
    };
    NotificationManager.prototype.setupNotifications = function () {
        var _this = this;
        console.log('notifications subscriptions setup');
        var notifs = [
            ['acceptBribe', 1],
            ['cardAction', 1],
            ['changeRuler', 1],
            // ['initiateNegotiation', 1],
            ['changeFavoredSuit', 250],
            ['chooseLoyalty', 1],
            ['clearTurn', 1],
            ['dominanceCheck', 1],
            ['purchaseCard', 2000],
            ['playCard', 2000],
            ['discardCard', 1000],
            ['refreshMarket', 250],
            ['selectGift', 1],
            ['smallRefreshHand', 1],
            ['smallRefreshInterface', 1],
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
    NotificationManager.prototype.notif_acceptBribe = function (notif) {
        var args = notif.args;
        console.log('notif_acceptBribe', args);
        var briberId = args.briberId, rulerId = args.rulerId, rupees = args.rupees;
        this.getPlayer({ playerId: briberId }).payBribe({ rulerId: rulerId, rupees: rupees });
    };
    NotificationManager.prototype.notif_cardAction = function (notif) {
        console.log('notif_cardAction', notif);
    };
    NotificationManager.prototype.notif_changeFavoredSuit = function (notif) {
        console.log('notif_moveToken', notif);
        var _a = notif.args, from = _a.from, to = _a.to;
        var tokenId = 'favored_suit_marker';
        var fromZone = this.game.getZoneForLocation({ location: "favored_suit_".concat(from) });
        var toZone = this.game.getZoneForLocation({ location: "favored_suit_".concat(to) });
        this.game.objectManager.favoredSuit.change({ suit: to });
        this.game.move({
            id: tokenId,
            from: fromZone,
            to: toZone,
        });
    };
    NotificationManager.prototype.notif_changeRuler = function (notif) {
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
    // notif_initiateNegotiation(notif: Notif<unknown>) {
    //   const { args } = notif;
    //   console.log('notif_initiateNegotiation', args);
    // }
    NotificationManager.prototype.notif_chooseLoyalty = function (notif) {
        var args = notif.args;
        console.log('notif_chooseLoyalty', args);
        var playerId = Number(args.playerId);
        this.getPlayer({ playerId: playerId }).updatePlayerLoyalty({ coalition: args.coalition });
        // TODO (make this notif more generic for loyalty changes?)
        this.getPlayer({ playerId: playerId }).setCounter({ counter: 'influence', value: 1 });
    };
    NotificationManager.prototype.notif_clearTurn = function (notif) {
        var args = notif.args;
        var notifIds = args.notifIds;
        console.log('notif_clearTurn', args);
        console.log('notif_clearTurn notifIds', notifIds);
        this.game.cancelLogs(notifIds);
    };
    NotificationManager.prototype.notif_discardCard = function (notif) {
        console.log('notif_discardCard', notif);
        this.game.clearPossible();
        var playerId = Number(notif.args.playerId);
        var from = notif.args.from;
        if (from == 'hand') {
            this.getPlayer({ playerId: playerId }).discardHandCard({ cardId: notif.args.cardId });
        }
        else if (from == 'market_0_0' || from == 'market_1_0') {
            var splitFrom = from.split('_');
            this.game.market.discardCard({ cardId: notif.args.cardId, row: Number(splitFrom[1]), column: Number(splitFrom[2]) });
        }
        else {
            this.getPlayer({ playerId: playerId }).discardCourtCard({ cardId: notif.args.cardId });
        }
    };
    NotificationManager.prototype.notif_dominanceCheck = function (notif) {
        var _this = this;
        console.log('notif_dominanceCheck', notif);
        var _a = notif.args, scores = _a.scores, moves = _a.moves;
        Object.keys(scores).forEach(function (playerId) {
            _this.game.framework().scoreCtrl[playerId].toValue(scores[playerId].newScore);
            _this.game.move({
                id: "vp_cylinder_".concat(playerId),
                from: _this.game.objectManager.vpTrack.getZone(scores[playerId].currentScore),
                to: _this.game.objectManager.vpTrack.getZone(scores[playerId].newScore),
            });
        });
        (moves || []).forEach(function (move) {
            var tokenId = move.tokenId, from = move.from, to = move.to;
            var coalition = to.split('_')[1];
            var splitFrom = from.split('_');
            var isArmy = splitFrom[0] == 'armies';
            _this.game.move({
                id: tokenId,
                to: _this.game.objectManager.supply.getCoalitionBlocksZone({ coalition: coalition }),
                from: isArmy
                    ? _this.game.map.getRegion({ region: splitFrom[1] }).getArmyZone()
                    : _this.game.map.getBorder({ border: "".concat(splitFrom[1], "_").concat(splitFrom[2]) }).getRoadZone(),
                addClass: ['pp_coalition_block'],
                removeClass: isArmy ? ['pp_army'] : ['pp_road'],
            });
        });
    };
    NotificationManager.prototype.notif_playCard = function (notif) {
        console.log('notif_playCard', notif);
        this.game.clearPossible();
        var playerId = Number(notif.args.playerId);
        var player = this.getPlayer({ playerId: playerId });
        notif.args.courtCards.forEach(function (card, index) {
            var item = player.getCourtZone().items.find(function (item) { return item.id === card.id; });
            if (item) {
                item.weight = card.state;
            }
        });
        player.playCard({
            card: notif.args.card,
        });
        this.getPlayer({ playerId: playerId }).getCourtZone().updateDisplay();
    };
    NotificationManager.prototype.notif_purchaseCard = function (notif) {
        var _this = this;
        console.log('notif_purchaseCard', notif);
        var _a = notif.args, marketLocation = _a.marketLocation, newLocation = _a.newLocation, rupeesOnCards = _a.rupeesOnCards, playerId = _a.playerId, receivedRupees = _a.receivedRupees;
        // const playerId = Number(notif.args.playerId);
        this.game.clearPossible();
        var row = Number(marketLocation.split('_')[1]);
        var col = Number(marketLocation.split('_')[2]);
        // Place paid rupees on market cards
        rupeesOnCards.forEach(function (item, index) {
            var row = item.row, column = item.column, rupeeId = item.rupeeId;
            _this.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: -1 });
            _this.game.market.placeRupeeOnCard({ row: row, column: column, rupeeId: rupeeId, fromDiv: "rupees_tableau_".concat(playerId) });
        });
        // Remove all rupees that were on the purchased card
        this.game.market.removeRupeesFromCard({ row: row, column: col, to: "rupees_tableau_".concat(playerId) });
        this.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: receivedRupees });
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
            this.game.market.getMarketCardZone({ row: row, column: col }).removeFromZone(cardId, false);
            discardCardAnimation({ cardId: cardId, game: this.game });
        }
        else {
            this.getPlayer({ playerId: playerId }).purchaseCard({ cardId: cardId, from: this.game.market.getMarketCardZone({ row: row, column: col }) });
        }
    };
    NotificationManager.prototype.notif_refreshMarket = function (notif) {
        var _this = this;
        console.log('notif_refreshMarket', notif);
        this.game.clearPossible();
        notif.args.cardMoves.forEach(function (move, index) {
            var fromRow = Number(move.from.split('_')[1]);
            var fromCol = Number(move.from.split('_')[2]);
            var toRow = Number(move.to.split('_')[1]);
            var toCol = Number(move.to.split('_')[2]);
            _this.game.market.moveCard({
                cardId: move.cardId,
                from: {
                    row: fromRow,
                    column: fromCol,
                },
                to: {
                    row: toRow,
                    column: toCol,
                },
            });
        });
        notif.args.newCards.forEach(function (move, index) {
            var row = Number(move.to.split('_')[1]);
            var column = Number(move.to.split('_')[2]);
            _this.game.market.addCardFromDeck({
                to: {
                    row: row,
                    column: column,
                },
                cardId: move.cardId,
            });
        });
    };
    NotificationManager.prototype.notif_selectGift = function (notif) {
        var _this = this;
        console.log('notif_selectGift', notif);
        this.game.clearPossible();
        var _a = notif.args, updatedCards = _a.updatedCards, playerId = _a.playerId, rupee_count = _a.rupee_count, updatedCounts = _a.updatedCounts;
        // Place paid rupees on market cards
        updatedCards.forEach(function (item, index) {
            var marketRow = item.location.split('_')[1];
            var marketColumn = item.location.split('_')[2];
            placeToken({
                game: _this.game,
                location: _this.game.market.getMarketRupeesZone({ row: marketRow, column: marketColumn }),
                id: item.rupeeId,
                jstpl: 'jstpl_rupee',
                jstplProps: {
                    id: item.rupee_id,
                },
                from: "rupees_tableau_".concat(playerId),
            });
        }, this);
        this.getPlayer({ playerId: notif.args.playerId }).setCounter({ counter: 'rupees', value: updatedCounts.rupees });
        this.getPlayer({ playerId: notif.args.playerId }).setCounter({ counter: 'influence', value: updatedCounts.influence });
    };
    NotificationManager.prototype.notif_smallRefreshHand = function (notif) {
        console.log('notif_smallRefreshHand', notif);
    };
    NotificationManager.prototype.notif_smallRefreshInterface = function (notif) {
        console.log('notif_smallRefreshInterface', notif);
        var updatedGamedatas = __assign(__assign({}, this.game.gamedatas), notif.args);
        this.game.clearInterface();
        console.log('updatedGamedatas', updatedGamedatas);
        this.game.gamedatas = updatedGamedatas;
        this.game.market.setupMarket({ gamedatas: updatedGamedatas });
        this.game.playerManager.updatePlayers({ gamedatas: updatedGamedatas });
        this.game.map.updateMap({ gamedatas: updatedGamedatas });
        this.game.objectManager.updateInterface({ gamedatas: updatedGamedatas });
        // this.game.framework().scoreCtrl[playerId].toValue(scores[playerId].newScore);
    };
    NotificationManager.prototype.notif_updatePlayerCounts = function (notif) {
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
    NotificationManager.prototype.notif_moveToken = function (notif) {
        var _this = this;
        console.log('notif_moveToken', notif);
        notif.args.moves.forEach(function (move) {
            var tokenId = move.tokenId, from = move.from, to = move.to, updates = move.updates;
            var fromZone = _this.game.getZoneForLocation({ location: from });
            var toZone = _this.game.getZoneForLocation({ location: to });
            // TODO: perhaps create separate function for this
            var addClass = to.startsWith('armies') ? ['pp_army'] : to.startsWith('roads') ? ['pp_road'] : undefined;
            var removeClass = from.startsWith('blocks') ? ['pp_coalition_block'] : undefined;
            _this.game.move({
                id: tokenId,
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
        this.playerEvents = {}; // events per player
        this.activeEvents = new ebg.zone(); // active events
        this.spies = {}; // spies per cards
        this.playerCounts = {}; // rename to playerTotals?
        this._notif_uid_to_log_id = {};
        this._last_notif = null;
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
        // const playAreaWidth = document.getElementById('pp_play_area').offsetWidth;
        // console.log('playAreaWidth',playAreaWidth);
        this.gamedatas = gamedatas;
        debug('gamedatas', gamedatas);
        this._connections = [];
        // Will store all data for active player and gets refreshed with entering player actions state
        this.localState = gamedatas.localState;
        this.activeStates = {
            clientPlayCard: new ClientPlayCardState(this),
            clientPurchaseCard: new ClientPurchaseCardState(this),
            discardCourt: new DiscardCourtState(this),
            discardHand: new DiscardHandState(this),
            negotiateBribe: new NegotiateBribeState(this),
            placeRoad: new PlaceRoadState(this),
            placeSpy: new PlaceSpyState(this),
            playerActions: new PlayerActionsState(this),
            setup: new SetupState(this),
        };
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
        this.tooltipManager = new PPTooltipManager(this);
        this.objectManager = new ObjectManager(this);
        this.playerManager = new PlayerManager(this);
        this.map = new PPMap(this);
        this.market = new Market(this);
        if (this.notificationManager != undefined) {
            this.notificationManager.destroy();
        }
        this.notificationManager = new NotificationManager(this);
        // // Setup game notifications to handle (see "setupNotifications" method below)
        this.notificationManager.setupNotifications();
        dojo.connect(this.framework().notifqueue, 'addToLog', function () {
            _this.checkLogCancel(_this._last_notif == null ? null : _this._last_notif.msg.uid);
            _this.addLogClass();
        });
        // this.setupNotifications();
        debug('Ending game setup');
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
        // UI changes for active player
        if (this.framework().isCurrentPlayerActive() && this.activeStates[stateName]) {
            console.log('inside if');
            this.activeStates[stateName].onEnteringState(args.args);
        }
    };
    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    PaxPamir.prototype.onLeavingState = function (stateName) {
        console.log('Leaving state: ' + stateName);
        this.clearPossible();
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    PaxPamir.prototype.onUpdateActionButtons = function (stateName, args) {
        console.log('onUpdateActionButtons: ' + stateName);
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
    /*
     * Add a blue/grey button if it doesn't already exists
     */
    PaxPamir.prototype.addActionButtonClient = function (_a) {
        var id = _a.id, text = _a.text, callback = _a.callback, extraClasses = _a.extraClasses, _b = _a.color, color = _b === void 0 ? 'none' : _b;
        if ($(id)) {
            return;
        }
        this.framework().addActionButton(id, text, callback, 'customActions', false, color);
        if (extraClasses) {
            dojo.addClass(id, extraClasses);
        }
    };
    PaxPamir.prototype.addCancelButton = function () {
        var _this = this;
        this.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () { return _this.onCancel(); },
        });
    };
    PaxPamir.prototype.addPrimaryActionButton = function (_a) {
        var id = _a.id, text = _a.text, callback = _a.callback, extraClasses = _a.extraClasses;
        if ($(id)) {
            return;
        }
        this.framework().addActionButton(id, text, callback, 'customActions', false, 'blue');
        if (extraClasses) {
            dojo.addClass(id, extraClasses);
        }
    };
    PaxPamir.prototype.addSecondaryActionButton = function (_a) {
        var id = _a.id, text = _a.text, callback = _a.callback, extraClasses = _a.extraClasses;
        if ($(id)) {
            return;
        }
        this.framework().addActionButton(id, text, callback, 'customActions', false, 'gray');
        if (extraClasses) {
            dojo.addClass(id, extraClasses);
        }
    };
    PaxPamir.prototype.addDangerActionButton = function (_a) {
        var id = _a.id, text = _a.text, callback = _a.callback, extraClasses = _a.extraClasses;
        if ($(id)) {
            return;
        }
        this.framework().addActionButton(id, text, callback, 'customActions', false, 'red');
        if (extraClasses) {
            dojo.addClass(id, extraClasses);
        }
    };
    PaxPamir.prototype.clearInterface = function () {
        var _this = this;
        console.log('clear interface');
        Object.keys(this.spies).forEach(function (key) {
            dojo.empty(_this.spies[key].container_div);
            _this.spies[key] = undefined;
        });
        this.market.clearInterface();
        this.playerManager.clearInterface();
        this.map.clearInterface();
        this.objectManager.clearInterface();
    };
    PaxPamir.prototype.clearPossible = function () {
        this.framework().removeActionButtons();
        dojo.empty('customActions');
        dojo.forEach(this._connections, dojo.disconnect);
        this._connections = [];
        dojo.query('.pp_selectable').removeClass('pp_selectable');
        dojo.query('.pp_selected').removeClass('pp_selected');
        REGIONS.forEach(function (region) {
            var element = document.getElementById("pp_region_".concat(region));
            element.classList.remove('pp_selectable');
        });
        document.getElementById('pp_map_areas').classList.remove('pp_selectable');
    };
    PaxPamir.prototype.getCardInfo = function (_a) {
        var cardId = _a.cardId;
        return this.gamedatas.staticData.cards[cardId];
    };
    PaxPamir.prototype.getPlayerId = function () {
        return Number(this.framework().player_id);
    };
    /**
     * Typescript wrapper for framework functions
     */
    PaxPamir.prototype.framework = function () {
        return this;
    };
    PaxPamir.prototype.onCancel = function () {
        this.clearPossible();
        this.framework().restoreServerGameState();
    };
    PaxPamir.prototype.updateLocalState = function (updates) {
        this.localState = __assign(__assign({}, this.localState), updates);
    };
    PaxPamir.prototype.setHandCardsSelectable = function (_a) {
        var _this = this;
        var callback = _a.callback;
        dojo.query('.pp_card_in_hand').forEach(function (node, index) {
            var cardId = node.id;
            dojo.addClass(node, 'pp_selectable');
            _this._connections.push(dojo.connect(node, 'onclick', _this, function () { return callback({ cardId: cardId }); }));
        }, this);
    };
    PaxPamir.prototype.clientUpdatePageTitle = function (_a) {
        var text = _a.text, args = _a.args;
        this.gamedatas.gamestate.descriptionmyturn = dojo.string.substitute(_(text), args);
        this.framework().updatePageTitle();
    };
    // .########.########.....###....##.....##.########.##......##..#######..########..##....##
    // .##.......##.....##...##.##...###...###.##.......##..##..##.##.....##.##.....##.##...##.
    // .##.......##.....##..##...##..####.####.##.......##..##..##.##.....##.##.....##.##..##..
    // .######...########..##.....##.##.###.##.######...##..##..##.##.....##.########..#####...
    // .##.......##...##...#########.##.....##.##.......##..##..##.##.....##.##...##...##..##..
    // .##.......##....##..##.....##.##.....##.##.......##..##..##.##.....##.##....##..##...##.
    // .##.......##.....##.##.....##.##.....##.########..###..###...#######..##.....##.##....##
    // ..#######..##.....##.########.########..########..####.########..########..######.
    // .##.....##.##.....##.##.......##.....##.##.....##..##..##.....##.##.......##....##
    // .##.....##.##.....##.##.......##.....##.##.....##..##..##.....##.##.......##......
    // .##.....##.##.....##.######...########..########...##..##.....##.######....######.
    // .##.....##..##...##..##.......##...##...##...##....##..##.....##.##.............##
    // .##.....##...##.##...##.......##....##..##....##...##..##.....##.##.......##....##
    // ..#######.....###....########.##.....##.##.....##.####.########..########..######.
    /* @Override */
    PaxPamir.prototype.format_string_recursive = function (log, args) {
        try {
            if (log && args && !args.processed) {
                args.processed = true;
                // list of special keys we want to replace with images
                var keys = logTokenKeys;
                // list of other known variables
                //  var keys = this.notification_manager.keys;
                for (var i in keys) {
                    var key = keys[i];
                    if (args[key] != undefined) {
                        args[key] = getLogTokenDiv(key, args);
                    }
                }
            }
        }
        catch (e) {
            console.error(log, args, 'Exception thrown', e.stack);
        }
        return this.inherited(arguments);
    };
    /*
     * [Undocumented] Called by BGA framework on any notification message
     * Handle cancelling log messages for restart turn
     */
    PaxPamir.prototype.onPlaceLogOnChannel = function (msg) {
        // console.log('msg', msg);
        var currentLogId = this.framework().notifqueue.next_log_id;
        var res = this.framework().inherited(arguments);
        this._notif_uid_to_log_id[msg.uid] = currentLogId;
        this._last_notif = {
            logId: currentLogId,
            msg: msg,
        };
        // console.log('_notif_uid_to_log_id', this._notif_uid_to_log_id);
        return res;
    };
    /*
     * cancelLogs:
     *   strikes all log messages related to the given array of notif ids
     */
    PaxPamir.prototype.checkLogCancel = function (notifId) {
        if (this.gamedatas.canceledNotifIds != null && this.gamedatas.canceledNotifIds.includes(notifId)) {
            this.cancelLogs([notifId]);
        }
    };
    PaxPamir.prototype.cancelLogs = function (notifIds) {
        var _this = this;
        console.log('notifIds', notifIds);
        notifIds.forEach(function (uid) {
            if (_this._notif_uid_to_log_id.hasOwnProperty(uid)) {
                var logId = _this._notif_uid_to_log_id[uid];
                if ($('log_' + logId))
                    dojo.addClass('log_' + logId, 'cancel');
            }
        });
    };
    PaxPamir.prototype.addLogClass = function () {
        if (this._last_notif == null)
            return;
        var notif = this._last_notif;
        if ($('log_' + notif.logId)) {
            var type = notif.msg.type;
            if (type == 'history_history')
                type = notif.msg.args.originalType;
            dojo.addClass('log_' + notif.logId, 'notif_' + type);
        }
    };
    /*
     * [Undocumented] Override BGA framework functions to call onLoadingComplete when loading is done
     */
    PaxPamir.prototype.setLoader = function (value, max) {
        this.framework().inherited(arguments);
        if (!this.framework().isLoadingComplete && value >= 100) {
            this.framework().isLoadingComplete = true;
            this.onLoadingComplete();
        }
    };
    PaxPamir.prototype.onLoadingComplete = function () {
        // debug('Loading complete');
        this.cancelLogs(this.gamedatas.canceledNotifIds);
    };
    // .########..#######......######..##.....##.########..######..##....##
    // ....##....##.....##....##....##.##.....##.##.......##....##.##...##.
    // ....##....##.....##....##.......##.....##.##.......##.......##..##..
    // ....##....##.....##....##.......#########.######...##.......#####...
    // ....##....##.....##....##.......##.....##.##.......##.......##..##..
    // ....##....##.....##....##....##.##.....##.##.......##....##.##...##.
    // ....##.....#######......######..##.....##.########..######..##....##
    PaxPamir.prototype.returnSpiesFromCard = function (_a) {
        var _this = this;
        var _b;
        var cardId = _a.cardId;
        if ((_b = this.spies) === null || _b === void 0 ? void 0 : _b[cardId]) {
            // ['cylinder_2371052_3']
            var items = this.spies[cardId].getAllItems();
            items.forEach(function (cylinderId) {
                var playerId = Number(cylinderId.split('_')[1]);
                _this.move({
                    id: cylinderId,
                    to: _this.playerManager.getPlayer({ playerId: playerId }).getCylinderZone(),
                    from: _this.spies[cardId],
                });
            });
        }
    };
    PaxPamir.prototype.discardCard = function (_a) {
        var id = _a.id, from = _a.from, _b = _a.order, order = _b === void 0 ? null : _b;
        // Move all spies back to cylinder pools
        this.returnSpiesFromCard({ cardId: id });
        from.removeFromZone(id, false);
        attachToNewParentNoDestroy(id, 'pp_discard_pile');
        this.framework().slideToObject(id, 'pp_discard_pile').play();
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
    PaxPamir.prototype.move = function (_a) {
        var id = _a.id, to = _a.to, from = _a.from, _b = _a.weight, weight = _b === void 0 ? this.defaultWeightZone : _b, _c = _a.addClass, addClass = _c === void 0 ? [] : _c, _d = _a.removeClass, removeClass = _d === void 0 ? [] : _d;
        addClass.forEach(function (newClass) {
            dojo.addClass(id, newClass);
        });
        removeClass.forEach(function (oldClass) {
            dojo.removeClass(id, oldClass);
        });
        dojo.addClass(id, 'pp_moving');
        to.placeInZone(id, weight);
        from.removeFromZone(id, false);
        // TODO: check if there is a better way than using setTimeout
        setTimeout(function () {
            dojo.removeClass(id, 'pp_moving');
        }, 2000);
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
        if (!this.spies[cardId]) {
            // ** setup for zone
            this.spies[cardId] = new ebg.zone();
            this.spies[cardId].create(this, nodeId, CYLINDER_WIDTH, CYLINDER_HEIGHT);
            this.spies[cardId].item_margin = 4;
        }
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
