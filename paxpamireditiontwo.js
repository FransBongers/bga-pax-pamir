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
    var cardId = _a.cardId, _b = _a.to, to = _b === void 0 ? DISCARD : _b, game = _a.game;
    var destinationId = to === DISCARD ? 'pp_discard_pile' : 'pp_temp_discard_pile';
    attachToNewParentNoDestroy(cardId, destinationId);
    dojo.addClass(cardId, 'pp_moving');
    var animation = game.framework().slideToObject(cardId, destinationId);
    dojo.connect(animation, 'onEnd', function () {
        dojo.removeClass(cardId, 'pp_moving');
    });
    animation.play();
};
var attachToNewParentNoDestroy = function (mobileEltId, newParentId, pos, placePosition) {
    var mobile = $(mobileEltId);
    var new_parent = $(newParentId);
    var src = dojo.position(mobile);
    if (placePosition)
        mobile.style.position = placePosition;
    dojo.place(mobile, new_parent, pos);
    mobile.offsetTop;
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
    mobile.offsetTop;
    return box;
};
var isFastMode = function () {
    return false;
};
var slide = function (_a) {
    var game = _a.game, mobileElt = _a.mobileElt, targetElt = _a.targetElt, _b = _a.options, options = _b === void 0 ? {} : _b;
    console.log('using slide');
    var config = __assign({ duration: 800, delay: 0, destroy: false, attach: true, changeParent: true, pos: null, className: 'moving', from: null, clearPos: true, beforeBrother: null, to: null, phantom: true, zIndex: null }, options);
    config.phantomStart = config.phantomStart || config.phantom;
    config.phantomEnd = config.phantomEnd || config.phantom;
    mobileElt = $(mobileElt);
    var mobile = mobileElt;
    targetElt = $(targetElt);
    var targetId = targetElt;
    var newParent = config.attach ? targetId : $(mobile).parentNode;
    if (isFastMode() && (config.destroy || config.clearPos)) {
        if (config.destroy)
            dojo.destroy(mobile);
        else
            dojo.place(mobile, targetElt);
        return new Promise(function (resolve, reject) {
            resolve();
        });
    }
    if (config.phantomStart && config.from == null) {
        mobile = dojo.clone(mobileElt);
        dojo.attr(mobile, 'id', mobileElt.id + '_animated');
        dojo.place(mobile, 'game_play_area');
        game.framework().placeOnObject(mobile, mobileElt);
        dojo.addClass(mobileElt, 'phantom');
        config.from = mobileElt;
    }
    if (config.phantomEnd) {
        targetId = dojo.clone(mobileElt);
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
            if (config.phantomStart) {
                dojo.place(mobileElt, mobile, 'replace');
                dojo.removeClass(mobileElt, 'phantom');
                mobile = mobileElt;
            }
            if (config.changeParent) {
                if (config.phantomEnd)
                    dojo.place(mobile, targetId, 'replace');
                else
                    changeParent(mobile, newParent);
            }
            if (config.destroy)
                dojo.destroy(mobile);
            if (config.clearPos && !config.destroy)
                dojo.style(mobile, { top: null, left: null, position: null });
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
    box.l += box.w - cbox.w;
    box.t += box.h - cbox.h;
    return box;
};
var positionObjectDirectly = function (mobileObj, x, y) {
    dojo.style(mobileObj, 'left');
    dojo.style(mobileObj, {
        left: x + 'px',
        top: y + 'px',
    });
    dojo.style(mobileObj, 'left');
};
var LOG_TOKEN_ARMY = 'army';
var LOG_TOKEN_CARD = 'card';
var LOG_TOKEN_CARD_ICON = 'cardIcon';
var LOG_TOKEN_CARD_NAME = 'cardName';
var LOG_TOKEN_COALITION = 'coalition';
var LOG_TOKEN_COALITION_NAME = 'coalitionName';
var LOG_TOKEN_CYLINDER = 'cylinder';
var LOG_TOKEN_FAVORED_SUIT = 'favoredSuit';
var LOG_TOKEN_LARGE_CARD = 'largeCard';
var LOG_TOKEN_LEVERAGE = 'leverage';
var LOG_TOKEN_NEW_LINE = 'newLine';
var LOG_TOKEN_PLAYER_NAME = 'playerName';
var LOG_TOKEN_REGION_NAME = 'regionName';
var LOG_TOKEN_ROAD = 'road';
var LOG_TOKEN_RUPEE = 'rupee';
var getLogTokenDiv = function (_a) {
    var logToken = _a.logToken, game = _a.game;
    var _b = logToken.split(':'), type = _b[0], data = _b[1];
    switch (type) {
        case LOG_TOKEN_ARMY:
            return tplLogTokenArmy({ coalition: data });
        case LOG_TOKEN_CARD:
            return tplLogTokenCard({ cardId: data });
        case LOG_TOKEN_CARD_ICON:
            return tplLogTokenCard({ cardId: 'card_back' });
        case LOG_TOKEN_LARGE_CARD:
            return tplLogTokenCard({ cardId: data, large: true });
        case LOG_TOKEN_CARD_NAME:
            return tlpLogTokenBoldText({ text: data });
        case LOG_TOKEN_FAVORED_SUIT:
            return tplLogTokenFavoredSuit({ suit: data });
        case LOG_TOKEN_CYLINDER:
            return tplLogTokenCylinder({ color: game.playerManager.getPlayer({ playerId: Number(data) }).getColor() });
        case LOG_TOKEN_COALITION:
            return tplLogTokenCoalition({ coalition: data });
        case LOG_TOKEN_COALITION_NAME:
            return tlpLogTokenBoldText({ text: game.gamedatas.staticData.loyalty[data].name });
        case LOG_TOKEN_LEVERAGE:
            return tplLogTokenLeverage();
        case LOG_TOKEN_NEW_LINE:
            return '<br>';
        case LOG_TOKEN_PLAYER_NAME:
            var player = game.playerManager.getPlayer({ playerId: Number(data) });
            return tplLogTokenPlayerName({ name: player.getName(), color: player.getColor() });
        case LOG_TOKEN_REGION_NAME:
            return tplLogTokenRegionName({ name: game.gamedatas.staticData.regions[data].name, regionId: data });
        case LOG_TOKEN_ROAD:
            return tplLogTokenRoad({ coalition: data });
        case LOG_TOKEN_RUPEE:
            return tplLogTokenRupee();
        default:
            return type;
    }
};
var tplLogTokenArmy = function (_a) {
    var coalition = _a.coalition;
    return "<div class=\"pp_".concat(coalition, " pp_army pp_log_token\"></div>");
};
var tlpLogTokenBoldText = function (_a) {
    var text = _a.text;
    return "<span style=\"font-weight: 700;\">".concat(_(text), "</span>");
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
var tplLogTokenLeverage = function () { return "<div class=\"pp_leverage pp_log_token\"></div>"; };
var tplLogTokenNewCards = function (_a) {
    var cards = _a.cards;
    var newCards = '';
    cards.forEach(function (card) {
        newCards += "<div class=\"pp_card pp_log_token pp_".concat(card.cardId, " pp_large\" style=\"display: inline-block; margin-right: 4px;\"></div>");
    });
    return newCards;
};
var tplLogTokenPlayerName = function (_a) {
    var name = _a.name, color = _a.color;
    return "<span class=\"playername\" style=\"color:#".concat(color, ";\">").concat(name, "</span>");
};
var tplLogTokenRegionName = function (_a) {
    var name = _a.name, regionId = _a.regionId;
    return "<div style=\"display: inline-block;\"><span style=\"font-weight: 700;\">".concat(_(name), "</span><div class=\"pp_log_token pp_").concat(regionId, " pp_region_icon\"></div></div>");
};
var tplLogTokenRoad = function (_a) {
    var coalition = _a.coalition;
    return "<div class=\"pp_".concat(coalition, " pp_road pp_log_token\"></div>");
};
var tplLogTokenRupee = function () { return "<div class=\"pp_log_token_rupee pp_log_token\"></div>"; };
var _a;
var CLIENT_CARD_ACTION_BATTLE = 'clientCardActionBattle';
var CLIENT_CARD_ACTION_BETRAY = 'clientCardActionBetray';
var CLIENT_CARD_ACTION_BUILD = 'clientCardActionBuild';
var CLIENT_CARD_ACTION_GIFT = 'clientCardActionGift';
var CLIENT_CARD_ACTION_MOVE = 'clientCardActionMove';
var CLIENT_CARD_ACTION_TAX = 'clientCardActionTax';
var CLIENT_INITIAL_BRIBE_CHECK = 'clientInitialBribeCheck';
var CLIENT_PLAY_CARD = 'clientPlayCard';
var CLIENT_PURCHASE_CARD = 'clientPurchaseCard';
var CLIENT_RESOLVE_EVENT_CONFIDENCE_FAILURE = 'clientResolveConfidenceFailure';
var CLIENT_RESOLVE_EVENT_OTHER_PERSUASIVE_METHODS = 'clientResolveEventOtherPersuasiveMethods';
var CLIENT_RESOLVE_EVENT_PASHTUNWALI_VALUES = 'clientResolveEventPashtunwaliValues';
var CLIENT_RESOLVE_EVENT_REBUKE = 'clientResolveEventRebuke';
var CLIENT_RESOLVE_EVENT_RUMOR = 'clientResolveEventRumor';
var PLAY_CARD = 'playCard';
var PURCHASE_CARD = 'purchaseCard';
var BATTLE = 'battle';
var BETRAY = 'betray';
var BUILD = 'build';
var GIFT = 'gift';
var MOVE = 'move';
var TAX = 'tax';
var CARD_ACTIONS_WITH_COST = [BETRAY, BUILD, GIFT];
var CARD_ACTIONS_WITHOUT_COST = [BATTLE, MOVE, TAX];
var cardActionClientStateMap = (_a = {},
    _a[BATTLE] = CLIENT_CARD_ACTION_BATTLE,
    _a[BETRAY] = CLIENT_CARD_ACTION_BETRAY,
    _a[BUILD] = CLIENT_CARD_ACTION_BUILD,
    _a[GIFT] = CLIENT_CARD_ACTION_GIFT,
    _a[MOVE] = CLIENT_CARD_ACTION_MOVE,
    _a[TAX] = CLIENT_CARD_ACTION_TAX,
    _a);
var DISCARD = 'discard';
var TEMP_DISCARD = 'temp_discard';
var HAND = 'hand';
var COURT = 'court';
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
var EVENT_CARD = 'eventCard';
var COURT_CARD = 'courtCard';
var ECONOMIC = 'economic';
var MILITARY = 'military';
var POLITICAL = 'political';
var INTELLIGENCE = 'intelligence';
var SUITS = [POLITICAL, INTELLIGENCE, ECONOMIC, MILITARY];
var AFGHAN = 'afghan';
var BRITISH = 'british';
var RUSSIAN = 'russian';
var COALITIONS = [AFGHAN, BRITISH, RUSSIAN];
var HERAT = 'herat';
var KABUL = 'kabul';
var KANDAHAR = 'kandahar';
var PERSIA = 'persia';
var PUNJAB = 'punjab';
var TRANSCASPIA = 'transcaspia';
var REGIONS = [HERAT, KABUL, KANDAHAR, PERSIA, PUNJAB, TRANSCASPIA];
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
var IMPACT_ICON_ROAD = 'road';
var IMPACT_ICON_ARMY = 'army';
var IMPACT_ICON_LEVERAGE = 'leverage';
var IMPACT_ICON_SPY = 'spy';
var IMPACT_ICON_TRIBE = 'tribe';
var IMPACT_ICON_ECONOMIC_SUIT = 'economic';
var IMPACT_ICON_MILITARY_SUIT = 'military';
var IMPACT_ICON_POLITICAL_SUIT = 'political';
var IMPACT_ICON_INTELLIGENCE_SUIT = 'intelligence';
var PP_SELECTABLE = 'pp_selectable';
var PP_SELECTED = 'pp_selected';
var PP_CARD_IN_HAND = 'pp_card_in_hand';
var PP_CARD_IN_ZONE = 'pp_card_in_zone';
var PP_MARKET_CARD = 'pp_market_card';
var ECE_BACKING_OF_PERSIAN_ARISTOCRACY = 'backingOfPersianAristocracy';
var ECE_CONFIDENCE_FAILURE = 'confidenceFailure';
var ECE_CONFLICT_FATIGUE = 'conflictFatigue';
var ECE_CONFLICT_FATIGUE_CARD_ID = 'card_109';
var ECE_COURTLY_MANNERS = 'courtlyManners';
var ECE_DISREGARD_FOR_CUSTOMS = 'disregardForCustoms';
var ECE_DOMINANCE_CHECK = 'dominanceCheck';
var ECE_EMBARRASSEMENT_OF_RICHES = 'embarrassementOfRiches';
var ECE_FAILURE_TO_IMPRESS = 'failureToImpress';
var ECE_INTELLIGENCE_SUIT = 'intelligenceSuit';
var ECE_KOH_I_NOOR_RECOVERED = 'kohINoorRecovered';
var ECE_MILITARY_SUIT = 'militarySuit';
var ECE_NATION_BUILDING = 'nationBuilding';
var ECE_NATION_BUILDING_CARD_ID = 'card_112';
var ECE_NATIONALISM = 'nationalism';
var ECE_NATIONALISM_CARD_ID = 'card_110';
var ECE_NEW_TACTICS = 'newTactics';
var ECE_NO_EFFECT = 'noEffect';
var ECE_OTHER_PERSUASIVE_METHODS = 'otherPersuasiveMethods';
var ECE_PASHTUNWALI_VALUES = 'pashtunwaliValues';
var ECE_PASHTUNWALI_VALUES_CARD_ID = 'card_115';
var ECE_POLITICAL_SUIT = 'politicalSuit';
var ECE_PUBLIC_WITHDRAWAL = 'publicWithdrawal';
var ECE_REBUKE = 'rebuke';
var ECE_RIOTS_IN_HERAT = 'riotsInHerat';
var ECE_RIOTS_IN_KABUL = 'riotsInKabul';
var ECE_RIOTS_IN_PERSIA = 'riotsInPersia';
var ECE_RIOTS_IN_PUNJAB = 'riotsInPunjab';
var ECE_RUMOR = 'rumor';
var SA_INDISPENSABLE_ADVISORS = 'indispensableAdvisors';
var SA_INSURRESCTION = 'insurrection';
var SA_CLAIM_OF_ANCIENT_LINEAGE = 'claimOfAncientLineage';
var SA_BODYGUARDS = 'bodyguards';
var SA_CITADEL_KABUL = 'citadelKabul';
var SA_CITADEL_TRANSCASPIA = 'citadelTranscaspia';
var SA_STRANGE_BEDFELLOWS = 'strangeBedfellows';
var SA_CIVIL_SERVICE_REFORMS = 'civilServiceReforms';
var SA_SAFE_HOUSE = 'safeHouse';
var SA_CHARISMATIC_COURTIERS = 'charismaticCourtiers';
var SA_BLACKMAIL_HERAT = 'blackmailHerat';
var SA_BLACKMAIL_KANDAHAR = 'blackmailKandahar';
var SA_INDIAN_SUPPLIES = 'indianSupplies';
var SA_WELL_CONNECTED = 'wellConnected';
var SA_HERAT_INFLUENCE = 'heratInfluence';
var SA_PERSIAN_INFLUENCE = 'persianInfluence';
var SA_RUSSIAN_INFLUENCE = 'russianInfluence';
var SA_INFRASTRUCTURE = 'infrastructure';
var SA_SAVVY_OPERATOR = 'savvyOperator';
var SA_IRREGULARS = 'irregulars';
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
var tplRupeeCount = function (_a) {
    var id = _a.id;
    return "<div id=\"rupees_".concat(id, "\" class=\"pp_icon pp_player_board_rupee\"><div id=\"rupee_count_").concat(id, "\" class=\"pp_icon_count\"><span id=\"rupee_count_").concat(id, "_counter\"></span></div></div>");
};
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
var placeToken = function (_a) {
    var game = _a.game, location = _a.location, id = _a.id, jstpl = _a.jstpl, jstplProps = _a.jstplProps, _b = _a.weight, weight = _b === void 0 ? 0 : _b, _c = _a.classes, classes = _c === void 0 ? [] : _c, _d = _a.from, from = _d === void 0 ? null : _d;
    dojo.place(game.framework().format_block(jstpl, jstplProps), from || location.container_div);
    classes.forEach(function (className) {
        dojo.addClass(id, className);
    });
    location.placeInZone(id, weight);
};
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
        case BATTLE:
            return _('At a single site (region or court card), remove any combination of enemy tribes, roads, spies or armies equal to rank. You cannot remove more units than you yourself have armies/spies in that battle.');
        case BETRAY:
            return _('Pay 2. Discard a card where you have a spy. You may take its prize.');
        case BUILD:
            return _('Pay 2/4/6 to place 1, 2 or 3 blocks in any region you rule (as an army) or on adjacent borders (as a road).');
        case GIFT:
            return _('Pay 2/4/6 to purchase 1st, 2nd or 3rd gift.');
        case MOVE:
            return _('For each rank, move one spy or army.');
        case TAX:
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
var PPTooltipManager = (function () {
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
var DiscardPile = (function () {
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
var TempDiscardPile = (function () {
    function TempDiscardPile(_a) {
        var game = _a.game;
        console.log('Constructor TempDiscardPile');
        this.game = game;
        this.setup({ gamedatas: game.gamedatas });
    }
    TempDiscardPile.prototype.setup = function (_a) {
        var gamedatas = _a.gamedatas;
        if (gamedatas.tempDiscardPile) {
            dojo.place(tplCard({ cardId: gamedatas.tempDiscardPile.id }), 'pp_temp_discard_pile');
        }
    };
    TempDiscardPile.prototype.clearInterface = function () {
        dojo.empty('pp_temp_discard_pile');
    };
    return TempDiscardPile;
}());
var FavoredSuit = (function () {
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
    };
    return FavoredSuit;
}());
var Supply = (function () {
    function Supply(_a) {
        var game = _a.game;
        console.log('Constructor Supply');
        this.game = game;
        this.setup({ gamedatas: game.gamedatas });
    }
    Supply.prototype.setup = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        this.coalitionBlocks = {};
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
            _this.coalitionBlocks[coalition].instantaneous = false;
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
var VpTrack = (function () {
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
var ObjectManager = (function () {
    function ObjectManager(game) {
        console.log('ObjectManager');
        this.game = game;
        this.discardPile = new DiscardPile({ game: game });
        this.tempDiscardPile = new TempDiscardPile({ game: game });
        this.favoredSuit = new FavoredSuit({ game: game });
        this.supply = new Supply({ game: game });
        this.vpTrack = new VpTrack({ game: game });
    }
    ObjectManager.prototype.updateInterface = function (_a) {
        var gamedatas = _a.gamedatas;
        this.discardPile.setup({ gamedatas: gamedatas });
        this.favoredSuit.setup({ gamedatas: gamedatas });
        this.supply.setup({ gamedatas: gamedatas });
        this.tempDiscardPile.setup({ gamedatas: gamedatas });
        this.vpTrack.setupVpTrack({ gamedatas: gamedatas });
    };
    ObjectManager.prototype.clearInterface = function () {
        this.discardPile.clearInterface();
        this.favoredSuit.clearInterface();
        this.supply.clearInterface();
        this.tempDiscardPile.clearInterface();
        this.vpTrack.clearInterface();
    };
    return ObjectManager;
}());
var PPPlayer = (function () {
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
        this.game = game;
        var playerId = player.id;
        this.playerId = Number(playerId);
        this.player = player;
        this.playerName = player.name;
        this.playerColor = player.color;
        var gamedatas = game.gamedatas;
        this.setupPlayer({ gamedatas: gamedatas });
    }
    PPPlayer.prototype.updatePlayer = function (_a) {
        var gamedatas = _a.gamedatas;
        var playerGamedatas = gamedatas.players[this.playerId];
        this.setupCourt({ playerGamedatas: playerGamedatas });
        this.setupEvents({ playerGamedatas: playerGamedatas });
        this.setupPrizes({ playerGamedatas: playerGamedatas });
        this.setupCylinders({ playerGamedatas: playerGamedatas });
        this.setupGifts({ playerGamedatas: playerGamedatas });
        this.setupRulerTokens({ gamedatas: gamedatas });
        this.updatePlayerPanel({ playerGamedatas: playerGamedatas });
    };
    PPPlayer.prototype.setupPlayer = function (_a) {
        var gamedatas = _a.gamedatas;
        var playerGamedatas = gamedatas.players[this.playerId];
        this.setupHand({ playerGamedatas: playerGamedatas });
        this.setupCourt({ playerGamedatas: playerGamedatas });
        this.setupEvents({ playerGamedatas: playerGamedatas });
        this.setupPrizes({ playerGamedatas: playerGamedatas });
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
        playerGamedatas.court.cards.forEach(function (card) {
            var cardId = card.id;
            var _a = _this.game.gamedatas.staticData.cards[cardId], actions = _a.actions, region = _a.region;
            dojo.place(tplCard({ cardId: cardId, extraClasses: "pp_card_in_court pp_player_".concat(_this.playerId, " pp_").concat(region) }), "pp_court_player_".concat(_this.playerId));
            _this.setupCourtCard({ cardId: cardId });
            _this.court.placeInZone(cardId, card.state);
            _this.game.tooltipManager.addTooltipToCard({ cardId: card.id });
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
    PPPlayer.prototype.setupEvents = function (_a) {
        var _this = this;
        var playerGamedatas = _a.playerGamedatas;
        this.events = new ebg.zone();
        this.events.create(this.game, "player_tableau_events_".concat(this.playerId), CARD_WIDTH, CARD_HEIGHT);
        this.court.item_margin = 16;
        this.events.instantaneous = true;
        if (playerGamedatas.events.length > 0) {
            var node = dojo.byId("pp_player_events_container_".concat(this.playerId));
            node.style.marginTop = '-57px';
        }
        playerGamedatas.events.forEach(function (card) {
            var cardId = card.id;
            dojo.place(tplCard({ cardId: cardId }), "player_tableau_events_".concat(_this.playerId));
            _this.events.placeInZone(cardId, card.state);
            _this.game.tooltipManager.addTooltipToCard({ cardId: cardId });
        });
        this.events.instantaneous = false;
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
        ['2', '4', '6'].forEach(function (value) {
            _this.gifts[value] = new ebg.zone();
            setupTokenZone({
                game: _this.game,
                zone: _this.gifts[value],
                nodeId: "pp_gift_".concat(value, "_zone_").concat(_this.playerId),
                tokenWidth: 40,
                tokenHeight: 40,
                pattern: 'custom',
                customPattern: function () {
                    return { x: 5, y: 5, w: 30, h: 30 };
                },
            });
        });
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
        var player_board_div = $('player_board_' + this.playerId);
        dojo.place(this.game.format_block('jstpl_player_board', __assign(__assign({}, this.player), { p_color: this.playerColor })), player_board_div);
        $("cylinders_".concat(this.playerId)).classList.add("pp_player_color_".concat(this.playerColor));
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
    PPPlayer.prototype.setupPrizes = function (_a) {
        var _this = this;
        var playerGamedatas = _a.playerGamedatas;
        this.prizes = new ebg.zone();
        this.prizes.create(this.game, "pp_prizes_".concat(this.playerId), CARD_WIDTH, CARD_HEIGHT);
        this.prizes.setPattern('verticalfit');
        var numberOfPrizes = playerGamedatas.prizes.length;
        this.updatePrizesStyle({ numberOfPrizes: numberOfPrizes });
        this.prizes.instantaneous = true;
        playerGamedatas.prizes.forEach(function (card) {
            var cardId = card.id;
            dojo.place(tplCard({ cardId: cardId, extraClasses: "pp_prize" }), "pp_prizes_".concat(_this.playerId));
            _this.prizes.placeInZone(cardId, card.state);
        });
        this.prizes.instantaneous = false;
    };
    PPPlayer.prototype.updatePrizesStyle = function (_a) {
        var numberOfPrizes = _a.numberOfPrizes;
        if (numberOfPrizes > 0) {
            var node = dojo.byId("pp_prizes_".concat(this.playerId));
            dojo.style(node, 'margin-bottom', "-194px");
            dojo.style(node, 'height', "".concat(CARD_HEIGHT + (numberOfPrizes - 1) * 25, "px"));
        }
    };
    PPPlayer.prototype.setupRulerTokens = function (_a) {
        var _this = this;
        var gamedatas = _a.gamedatas;
        if (!this.rulerTokens) {
            this.rulerTokens = new ebg.zone();
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
        dojo.empty(this.events.container_div);
        this.events = undefined;
    };
    PPPlayer.prototype.getColor = function () {
        return this.playerColor;
    };
    PPPlayer.prototype.getCourtCards = function () {
        var _this = this;
        var cardsInZone = this.court.getAllItems();
        return cardsInZone.map(function (cardId) { return _this.game.getCardInfo({ cardId: cardId }); });
    };
    PPPlayer.prototype.getCourtZone = function () {
        return this.court;
    };
    PPPlayer.prototype.getEventsZone = function () {
        return this.events;
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
    PPPlayer.prototype.getInfluence = function () {
        return this.counters.influence.getValue();
    };
    PPPlayer.prototype.getName = function () {
        return this.playerName;
    };
    PPPlayer.prototype.getPlayerId = function () {
        return this.playerId;
    };
    PPPlayer.prototype.getPrizeZone = function () {
        return this.prizes;
    };
    PPPlayer.prototype.getRupees = function () {
        return this.counters.rupees.getValue();
    };
    PPPlayer.prototype.getRulerTokensZone = function () {
        return this.rulerTokens;
    };
    PPPlayer.prototype.getPlayerColor = function () {
        return this.playerColor;
    };
    PPPlayer.prototype.getLowestAvailableGift = function () {
        if (this.gifts['2'].getItemNumber() === 0) {
            return 2;
        }
        if (this.gifts['4'].getItemNumber() === 0) {
            return 4;
        }
        if (this.gifts['6'].getItemNumber() === 0) {
            return 6;
        }
        return null;
    };
    PPPlayer.prototype.getLoyalty = function () {
        return this.loyalty;
    };
    PPPlayer.prototype.getTaxShelter = function () {
        var _this = this;
        return this.court
            .getAllItems()
            .map(function (cardId) { return _this.game.getCardInfo({ cardId: cardId }); })
            .filter(function (card) { return card.suit === ECONOMIC; })
            .reduce(function (total, current) {
            return total + current.rank;
        }, 0);
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
    PPPlayer.prototype.toValueCounter = function (_a) {
        var counter = _a.counter, value = _a.value;
        switch (counter) {
            case 'cards':
                this.counters.cards.toValue(value);
                this.counters.cardsTableau.toValue(value);
                break;
            case 'rupees':
                this.counters.rupees.toValue(value);
                this.counters.rupeesTableau.toValue(value);
                break;
            default:
                this.counters[counter].toValue(value);
        }
    };
    PPPlayer.prototype.addSideSelectToCourt = function () {
        this.court.instantaneous = true;
        dojo.place(tplCardSelect({ side: 'left' }), "pp_court_player_".concat(this.playerId));
        this.court.placeInZone('pp_card_select_left', -1000);
        dojo.place(tplCardSelect({ side: 'right' }), "pp_court_player_".concat(this.playerId));
        this.court.placeInZone('pp_card_select_right', 1000);
    };
    PPPlayer.prototype.checkEventContainerHeight = function () {
        var node = dojo.byId("pp_player_events_container_".concat(this.playerId));
        if (this.events.getItemNumber() === 0) {
            node.style.marginTop = '-209px';
        }
        else {
            node.style.marginTop = '-57px';
        }
    };
    PPPlayer.prototype.removeSideSelectFromCourt = function () {
        this.court.removeFromZone('pp_card_select_left', true);
        this.court.removeFromZone('pp_card_select_right', true);
        this.court.instantaneous = false;
    };
    PPPlayer.prototype.ownsEventCard = function (_a) {
        var cardId = _a.cardId;
        return this.events.getAllItems().includes(cardId);
    };
    PPPlayer.prototype.hasSpecialAbility = function (_a) {
        var _this = this;
        var specialAbility = _a.specialAbility;
        return this.court
            .getAllItems()
            .map(function (cardId) { return _this.game.getCardInfo({ cardId: cardId }); })
            .some(function (card) { return card.specialAbility === specialAbility; });
    };
    PPPlayer.prototype.getCourtCardsWithSpecialAbility = function (_a) {
        var _this = this;
        var specialAbility = _a.specialAbility;
        return this.court
            .getAllItems()
            .map(function (cardId) { return _this.game.getCardInfo({ cardId: cardId }); })
            .filter(function (card) { return card.specialAbility === specialAbility; });
    };
    PPPlayer.prototype.discardCourtCard = function (_a) {
        var cardId = _a.cardId, _b = _a.to, to = _b === void 0 ? DISCARD : _b;
        var node = dojo.byId(cardId);
        node.classList.remove('pp_card_in_court');
        node.classList.remove("pp_player_".concat(this.playerId));
        this.court.removeFromZone(cardId, false);
        discardCardAnimation({ cardId: cardId, game: this.game, to: to });
    };
    PPPlayer.prototype.discardHandCard = function (_a) {
        var cardId = _a.cardId, _b = _a.to, to = _b === void 0 ? DISCARD : _b;
        if (this.playerId === this.game.getPlayerId()) {
            var node = dojo.byId(cardId);
            if (node) {
                node.classList.remove(PP_CARD_IN_HAND);
            }
            this.hand.removeFromZone(cardId, false);
        }
        else {
            dojo.place(tplCard({ cardId: cardId }), "cards_".concat(this.playerId));
        }
        discardCardAnimation({ cardId: cardId, game: this.game, to: to });
    };
    PPPlayer.prototype.discardPrize = function (_a) {
        var cardId = _a.cardId, to = _a.to;
        var node = dojo.byId(cardId);
        node.classList.remove('pp_prize');
        this.prizes.removeFromZone(cardId, false);
        discardCardAnimation({ cardId: cardId, game: this.game, to: to });
    };
    PPPlayer.prototype.payToPlayer = function (_a) {
        var _this = this;
        var playerId = _a.playerId, rupees = _a.rupees;
        dojo.place(tplRupee({ rupeeId: 'tempRupee' }), "rupees_".concat(this.playerId));
        attachToNewParentNoDestroy('tempRupee', "rupees_".concat(playerId));
        var animation = this.game.framework().slideToObject('tempRupee', "rupees_".concat(playerId));
        dojo.connect(animation, 'onEnd', function () {
            _this.incCounter({ counter: 'rupees', value: -rupees });
        });
        dojo.connect(animation, 'onEnd', function () {
            dojo.destroy('tempRupee');
            _this.game.playerManager.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: rupees });
        });
        animation.play();
    };
    PPPlayer.prototype.playCard = function (_a) {
        var card = _a.card;
        var cardInfo = this.game.getCardInfo({ cardId: card.id });
        var region = cardInfo.region, suit = cardInfo.suit, rank = cardInfo.rank;
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
        this.incCounter({ counter: suit, value: rank });
        this.game.tooltipManager.addTooltipToCard({ cardId: card.id });
    };
    PPPlayer.prototype.addCardToHand = function (_a) {
        var cardId = _a.cardId, from = _a.from;
        if (this.playerId === this.game.getPlayerId() && from) {
            this.game.move({ id: cardId, to: this.hand, from: from, addClass: ['pp_card_in_hand'], removeClass: ['pp_market_card'] });
        }
        else if (this.playerId === this.game.getPlayerId()) {
            dojo.place(tplCard({ cardId: cardId, extraClasses: 'pp_card_in_hand' }), 'pp_player_hand_cards');
            this.hand.placeInZone(cardId);
        }
        else {
            dojo.addClass(cardId, 'pp_moving');
            from.removeFromZone(cardId, true, "player_board_".concat(this.playerId));
        }
        this.game.tooltipManager.addTooltipToCard({ cardId: cardId });
    };
    PPPlayer.prototype.addEvent = function (_a) {
        var cardId = _a.cardId, from = _a.from;
        if (this.events.getItemNumber() === 0) {
            var node = dojo.byId("pp_player_events_container_".concat(this.playerId));
            node.style.marginTop = '-57px';
        }
        this.game.move({
            id: cardId,
            from: from,
            to: this.getEventsZone(),
            removeClass: [PP_MARKET_CARD],
        });
        this.game.tooltipManager.addTooltipToCard({ cardId: cardId });
    };
    PPPlayer.prototype.removeTaxCounter = function () {
        var taxCounter = dojo.byId("rupees_tableau_".concat(this.playerId, "_tax_counter"));
        if (taxCounter) {
            dojo.destroy(taxCounter.id);
        }
    };
    PPPlayer.prototype.takePrize = function (_a) {
        var cardId = _a.cardId;
        debug('item number', this.prizes.getItemNumber());
        this.updatePrizesStyle({ numberOfPrizes: this.prizes.getItemNumber() + 1 });
        dojo.addClass(cardId, 'pp_prize');
        var div = this.prizes.container_div;
        attachToNewParentNoDestroy(cardId, div);
        var animation = this.game.framework().slideToObject(cardId, div);
        animation.play();
        this.prizes.placeInZone(cardId);
        this.incCounter({ counter: 'influence', value: 1 });
    };
    PPPlayer.prototype.updatePlayerLoyalty = function (_a) {
        var coalition = _a.coalition;
        this.loyalty = coalition;
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
var PlayerManager = (function () {
    function PlayerManager(game) {
        console.log('Constructor PlayerManager');
        this.game = game;
        this.players = {};
        for (var playerId in game.gamedatas.players) {
            var player = game.gamedatas.players[playerId];
            this.players[playerId] = new PPPlayer({ player: player, game: this.game });
        }
    }
    PlayerManager.prototype.getPlayer = function (_a) {
        var playerId = _a.playerId;
        return this.players[playerId];
    };
    PlayerManager.prototype.getPlayers = function () {
        return Object.values(this.players);
    };
    PlayerManager.prototype.getPlayerIds = function () {
        return Object.keys(this.players).map(Number);
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
var Border = (function () {
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
    Border.prototype.getCoalitionRoads = function (_a) {
        var coalitionId = _a.coalitionId;
        return this.roadZone.getAllItems().filter(function (blockId) { return blockId.split('_')[1] === coalitionId; });
    };
    Border.prototype.getEnemyRoads = function (_a) {
        var coalitionId = _a.coalitionId;
        return this.roadZone.getAllItems().filter(function (blockId) { return blockId.split('_')[1] !== coalitionId; });
    };
    Border.prototype.addTempRoad = function (_a) {
        var coalition = _a.coalition, index = _a.index;
        this.roadZone.instantaneous = true;
        var id = "temp_road_".concat(index);
        placeToken({
            game: this.game,
            location: this.roadZone,
            id: id,
            jstpl: 'jstpl_road',
            jstplProps: {
                id: id,
                coalition: coalition,
            },
            classes: ['pp_temporary']
        });
        this.roadZone.instantaneous = false;
    };
    Border.prototype.removeTempRoad = function (_a) {
        var index = _a.index;
        this.roadZone.removeFromZone("temp_road_".concat(index), true);
    };
    return Border;
}());
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var Region = (function () {
    function Region(_a) {
        var game = _a.game, region = _a.region;
        this.game = game;
        this.region = region;
        this.setupRegion({ gamedatas: game.gamedatas });
    }
    Region.prototype.setupRegion = function (_a) {
        var gamedatas = _a.gamedatas;
        var regionGamedatas = gamedatas.map.regions[this.region];
        this.name = regionGamedatas.name;
        this.borders = regionGamedatas.borders;
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
        setupTokenZone({
            game: this.game,
            zone: this.armyZone,
            nodeId: "pp_".concat(this.region, "_armies"),
            tokenWidth: ARMY_WIDTH,
            tokenHeight: ARMY_HEIGHT,
            itemMargin: -5,
        });
        this.armyZone.instantaneous = true;
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
        setupTokenZone({
            game: this.game,
            zone: this.tribeZone,
            nodeId: "pp_".concat(this.region, "_tribes"),
            tokenWidth: TRIBE_WIDTH,
            tokenHeight: TRIBE_HEIGHT,
            itemMargin: 12,
        });
        this.tribeZone.instantaneous = true;
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
            return this.getTribeZone()
                .getAllItems()
                .filter(function (id) {
                return Number(id.split('_')[1]) === _this.ruler;
            });
        }
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
    Region.prototype.addTempArmy = function (_a) {
        var coalition = _a.coalition, index = _a.index;
        this.armyZone.instantaneous = true;
        var id = "temp_army_".concat(index);
        placeToken({
            game: this.game,
            location: this.armyZone,
            id: id,
            jstpl: 'jstpl_army',
            jstplProps: {
                id: id,
                coalition: coalition,
            },
            classes: ['pp_temporary']
        });
        this.armyZone.instantaneous = false;
    };
    Region.prototype.getCoalitionArmies = function (_a) {
        var coalitionId = _a.coalitionId;
        return this.armyZone.getAllItems().filter(function (blockId) { return blockId.split('_')[1] === coalitionId; });
    };
    Region.prototype.getEnemyArmies = function (_a) {
        var coalitionId = _a.coalitionId;
        return this.armyZone.getAllItems().filter(function (blockId) { return blockId.split('_')[1] !== coalitionId; });
    };
    ;
    Region.prototype.getEnemyPieces = function (args) {
        return __spreadArray(__spreadArray(__spreadArray([], this.getEnemyArmies(args), true), this.getEnemyRoads(args), true), this.getEnemyTribes(args), true);
    };
    Region.prototype.getEnemyRoads = function (_a) {
        var _this = this;
        var coalitionId = _a.coalitionId;
        var roads = [];
        this.borders.forEach(function (border) {
            var enemyRoads = _this.game.map.getBorder({ border: border }).getEnemyRoads({ coalitionId: coalitionId });
            roads = roads.concat(enemyRoads);
        });
        return roads;
    };
    Region.prototype.getEnemyTribes = function (_a) {
        var _this = this;
        var coalitionId = _a.coalitionId;
        return this.tribeZone.getAllItems().filter(function (cylinderId) {
            var playerId = Number(cylinderId.split('_')[1]);
            return coalitionId !== _this.game.playerManager.getPlayer({ playerId: playerId }).getLoyalty();
        });
    };
    Region.prototype.getPlayerTribes = function (_a) {
        var playerId = _a.playerId;
        return this.tribeZone.getAllItems().filter(function (cylinderId) {
            var cylinderPlayerId = Number(cylinderId.split('_')[1]);
            return cylinderPlayerId === playerId;
        });
    };
    Region.prototype.removeTempArmy = function (_a) {
        var index = _a.index;
        this.armyZone.removeFromZone("temp_army_".concat(index), true);
    };
    Region.prototype.setSelectable = function (_a) {
        var _this = this;
        var callback = _a.callback;
        var element = document.getElementById("pp_region_".concat(this.region));
        if (element) {
            element.classList.add('pp_selectable');
            this.game._connections.push(dojo.connect(element, 'onclick', this, function () { return callback({ regionId: _this.region }); }));
        }
    };
    Region.prototype.clearSelectable = function () {
        var element = document.getElementById("pp_region_".concat(this.region));
        if (element) {
            element.classList.remove(PP_SELECTABLE, PP_SELECTED);
        }
    };
    return Region;
}());
var PPMap = (function () {
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
    PPMap.prototype.setSelectable = function () {
        var container = document.getElementById("pp_map_areas");
        container.classList.add('pp_selectable');
    };
    PPMap.prototype.clearSelectable = function () {
        var _this = this;
        REGIONS.forEach(function (region) {
            _this.regions[region].clearSelectable();
        });
        var mapArea = document.getElementById('pp_map_areas');
        if (mapArea) {
            mapArea.classList.remove(PP_SELECTABLE);
        }
    };
    return PPMap;
}());
var Market = (function () {
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
        }
        else {
            this.marketCards[row][column] = new ebg.zone();
            this.marketCards[row][column].create(this.game, containerId, CARD_WIDTH, CARD_HEIGHT);
        }
        this.marketCards[row][column].instantaneous = true;
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
    Market.prototype.removeSingleRupeeFromCard = function (_a) {
        var row = _a.row, column = _a.column, to = _a.to, rupeeId = _a.rupeeId;
        this.marketRupees[row][column].removeFromZone(rupeeId, true, to);
        var animation = this.game.framework().slideToObject(rupeeId, to);
        dojo.connect(animation, 'onEnd', function () {
            dojo.destroy(rupeeId);
        });
        animation.play();
    };
    Market.prototype.removeRupeesFromCard = function (_a) {
        var _this = this;
        var row = _a.row, column = _a.column, to = _a.to;
        this.marketRupees[row][column].getAllItems().forEach(function (rupeeId) {
            _this.removeSingleRupeeFromCard({ row: row, column: column, to: to, rupeeId: rupeeId });
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
    Market.prototype.moveCard = function (_a) {
        var _this = this;
        var cardId = _a.cardId, from = _a.from, to = _a.to;
        this.game.move({
            id: cardId,
            from: this.getMarketCardZone({ row: from.row, column: from.column }),
            to: this.getMarketCardZone({ row: to.row, column: to.column }),
        });
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
        var node = dojo.byId(cardId);
        if (node) {
            node.classList.remove(PP_MARKET_CARD);
        }
        this.getMarketCardZone({ row: row, column: column }).removeFromZone(cardId, false);
        discardCardAnimation({ cardId: cardId, game: this.game });
    };
    return Market;
}());
var AcceptPrizeState = (function () {
    function AcceptPrizeState(game) {
        this.game = game;
    }
    AcceptPrizeState.prototype.onEnteringState = function (_a) {
        var cardId = _a.cardId;
        this.cardId = cardId;
        this.updateInterfaceInitialStep();
    };
    AcceptPrizeState.prototype.onLeavingState = function () { };
    AcceptPrizeState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.updatePageTitle();
        this.game.addPrimaryActionButton({
            id: 'accept_prize_btn',
            text: _('Accept prize'),
            callback: function () {
                return _this.game.takeAction({
                    action: 'acceptPrize',
                    data: {
                        accept: true,
                    },
                });
            },
        });
        this.game.addSecondaryActionButton({
            id: 'no_prize_btn',
            text: _('Decline prize'),
            callback: function () {
                return _this.game.takeAction({
                    action: 'acceptPrize',
                    data: {
                        accept: false,
                    },
                });
            },
        });
    };
    AcceptPrizeState.prototype.updatePageTitle = function () {
        var card = this.game.getCardInfo({ cardId: this.cardId });
        console.log('card', card);
        var playerLoyalty = this.game.getCurrentPlayer().getLoyalty();
        if (card.prize !== playerLoyalty) {
            this.game.clientUpdatePageTitle({
                text: _('Accept ${cardName} as a prize and change loyalty to ${coalitionName}?'),
                args: {
                    cardName: _(card.name),
                    coalitionName: this.game.gamedatas.staticData.loyalty[card.prize].name,
                },
            });
        }
        else {
            this.game.clientUpdatePageTitle({
                text: _('Accept ${cardName} as a prize?'),
                args: {
                    cardName: _(card.name),
                },
            });
        }
    };
    return AcceptPrizeState;
}());
var ClientCardActionBattleState = (function () {
    function ClientCardActionBattleState(game) {
        this.game = game;
    }
    ClientCardActionBattleState.prototype.onEnteringState = function (_a) {
        var cardId = _a.cardId, bribe = _a.bribe;
        this.bribe = bribe;
        this.cardId = cardId;
        this.updateInterfaceInitialStep();
    };
    ClientCardActionBattleState.prototype.onLeavingState = function () { };
    ClientCardActionBattleState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        var _a;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a region or court card to start a battle in'),
            args: {
                you: '${you}',
            },
        });
        if ((_a = this.bribe) === null || _a === void 0 ? void 0 : _a.negotiated) {
            this.game.addDangerActionButton({
                id: 'cancel_bribe_btn',
                text: _('Cancel bribe'),
                callback: function () {
                    return _this.game.takeAction({
                        action: 'cancelBribe',
                    });
                },
            });
        }
        else {
            this.game.addCancelButton();
        }
        this.setLocationsSelectable();
    };
    ClientCardActionBattleState.prototype.updateInterfaceSelectPiecesInRegion = function (_a) {
        var _this = this;
        var regionId = _a.regionId;
        this.game.clearPossible();
        this.location = regionId;
        var region = this.game.map.getRegion({ region: regionId });
        var coalitionId = this.game.localState.activePlayer.loyalty;
        var enemyPieces = region.getEnemyPieces({ coalitionId: coalitionId }).filter(function (pieceId) { return _this.checkForCitadel({ pieceId: pieceId, region: regionId }); });
        debug('enemyPieces', enemyPieces);
        var cardInfo = this.game.getCardInfo({ cardId: this.cardId });
        var cardRank = cardInfo.rank;
        this.maxNumberToSelect = Math.min(cardRank, this.getNumberOfFriendlyArmiesInRegion({ region: region, coalitionId: coalitionId }));
        this.numberSelected = 0;
        this.updatePageTitle('region');
        this.setPiecesSelectable({ pieces: enemyPieces });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.confirmBattle(); },
        });
        dojo.addClass('confirm_btn', 'disabled');
        this.game.addCancelButton();
    };
    ClientCardActionBattleState.prototype.updateInterfaceSelectPiecesOnCard = function (_a) {
        var _this = this;
        var cardId = _a.cardId;
        this.game.clearPossible();
        this.location = cardId;
        var cardInfo = this.game.getCardInfo({ cardId: this.cardId });
        var cardRank = cardInfo.rank;
        var _b = this.getSpies({ cardId: cardId }), enemy = _b.enemy, own = _b.own;
        this.maxNumberToSelect = Math.min(cardRank, own.length);
        this.numberSelected = 0;
        this.updatePageTitle('card');
        this.setPiecesSelectable({ pieces: enemy.filter(function (cylinderId) { return _this.checkForIndispensableAdvisors({ cylinderId: cylinderId }); }) });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.confirmBattle(); },
        });
        dojo.addClass('confirm_btn', 'disabled');
        this.game.addCancelButton();
    };
    ClientCardActionBattleState.prototype.checkForCitadel = function (_a) {
        var pieceId = _a.pieceId, region = _a.region;
        if (!pieceId.startsWith('cylinder')) {
            return true;
        }
        if (region === KABUL &&
            this.game.playerManager.getPlayer({ playerId: Number(pieceId.split('_')[1]) }).hasSpecialAbility({ specialAbility: SA_CITADEL_KABUL })) {
            return false;
        }
        if (region === TRANSCASPIA &&
            this.game.playerManager
                .getPlayer({ playerId: Number(pieceId.split('_')[1]) })
                .hasSpecialAbility({ specialAbility: SA_CITADEL_TRANSCASPIA })) {
            return false;
        }
        return true;
    };
    ClientCardActionBattleState.prototype.checkForIndispensableAdvisors = function (_a) {
        var cylinderId = _a.cylinderId;
        return !this.game.playerManager
            .getPlayer({ playerId: Number(cylinderId.split('_')[1]) })
            .hasSpecialAbility({ specialAbility: SA_INDISPENSABLE_ADVISORS });
    };
    ClientCardActionBattleState.prototype.getNumberOfFriendlyArmiesInRegion = function (_a) {
        var coalitionId = _a.coalitionId, region = _a.region;
        var coalitionArmies = region.getCoalitionArmies({ coalitionId: coalitionId });
        var player = this.game.getCurrentPlayer();
        var tribesNationalism = player.ownsEventCard({ cardId: ECE_NATIONALISM_CARD_ID })
            ? region.getPlayerTribes({ playerId: player.getPlayerId() }).length
            : 0;
        return coalitionArmies.length + tribesNationalism;
    };
    ClientCardActionBattleState.prototype.confirmBattle = function () {
        var _a, _b;
        debug('confirmBattle');
        var pieces = [];
        dojo.query('.pp_selected').forEach(function (node) { return pieces.push(node.id); });
        debug('pieces', pieces);
        var numberOfPieces = pieces.length;
        if (numberOfPieces <= this.maxNumberToSelect && numberOfPieces > 0) {
            this.game.takeAction({
                action: 'battle',
                data: {
                    removedPieces: pieces.join(' '),
                    location: this.location,
                    cardId: this.cardId,
                    bribeAmount: (_b = (_a = this.bribe) === null || _a === void 0 ? void 0 : _a.amount) !== null && _b !== void 0 ? _b : null,
                },
            });
        }
    };
    ClientCardActionBattleState.prototype.getCourtCardBattleSites = function () {
        var _this = this;
        var battleSites = [];
        this.game.playerManager.getPlayers().forEach(function (player) {
            var courtCards = player.getCourtCards();
            courtCards.forEach(function (card) {
                var _a = _this.getSpies({ cardId: card.id }), enemy = _a.enemy, own = _a.own;
                if (enemy.filter(function (cylinderId) { return _this.checkForIndispensableAdvisors({ cylinderId: cylinderId }); }).length > 0 && own.length > 0) {
                    battleSites.push(card.id);
                }
            });
        });
        return battleSites;
    };
    ClientCardActionBattleState.prototype.getSpies = function (_a) {
        var _this = this;
        var cardId = _a.cardId;
        var spyZone = this.game.spies[cardId];
        if (!spyZone) {
            return {
                enemy: [],
                own: [],
            };
        }
        var cylinderIds = spyZone.getAllItems();
        return {
            enemy: cylinderIds.filter(function (cylinderId) { return Number(cylinderId.split('_')[1]) !== _this.game.getPlayerId(); }),
            own: cylinderIds.filter(function (cylinderId) { return Number(cylinderId.split('_')[1]) === _this.game.getPlayerId(); }),
        };
    };
    ClientCardActionBattleState.prototype.handlePieceClicked = function (_a) {
        var pieceId = _a.pieceId;
        debug('Piece clicked', pieceId);
        dojo.query("#".concat(pieceId)).toggleClass('pp_selected').toggleClass('pp_selectable');
        this.numberSelected = dojo.query('.pp_selected').length;
        if (this.numberSelected > 0 && this.numberSelected <= this.maxNumberToSelect) {
            dojo.removeClass('confirm_btn', 'disabled');
        }
        else {
            dojo.addClass('confirm_btn', 'disabled');
        }
        this.updatePageTitle(this.location.startsWith('card') ? 'card' : 'region');
    };
    ClientCardActionBattleState.prototype.setPiecesSelectable = function (_a) {
        var _this = this;
        var pieces = _a.pieces;
        pieces.forEach(function (pieceId) {
            dojo.query("#".concat(pieceId)).forEach(function (node, index) {
                dojo.addClass(node, 'pp_selectable');
                _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () { return _this.handlePieceClicked({ pieceId: pieceId }); }));
            });
        });
    };
    ClientCardActionBattleState.prototype.setLocationsSelectable = function () {
        var _this = this;
        debug('setLocationsSelectable');
        var container = document.getElementById("pp_map_areas");
        container.classList.add('pp_selectable');
        REGIONS.forEach(function (regionId) {
            var region = _this.game.map.getRegion({ region: regionId });
            var coalitionId = _this.game.localState.activePlayer.loyalty;
            var enemyPieces = region.getEnemyPieces({ coalitionId: coalitionId });
            if (enemyPieces.length === 0 || _this.getNumberOfFriendlyArmiesInRegion({ region: region, coalitionId: coalitionId }) === 0) {
                return;
            }
            var element = document.getElementById("pp_region_".concat(regionId));
            if (element) {
                element.classList.add('pp_selectable');
                _this.game._connections.push(dojo.connect(element, 'onclick', _this, function () { return _this.updateInterfaceSelectPiecesInRegion({ regionId: regionId }); }));
            }
        });
        var courtBattleSites = this.getCourtCardBattleSites();
        courtBattleSites.forEach(function (cardId) {
            dojo.query("#".concat(cardId)).forEach(function (node, index) {
                dojo.addClass(node, 'pp_selectable');
                _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () {
                    console.log('select court card click');
                    _this.updateInterfaceSelectPiecesOnCard({ cardId: cardId });
                }));
            });
        });
    };
    ClientCardActionBattleState.prototype.updatePageTitle = function (location) {
        var mainText = {
            card: _('${you} may select spies to remove'),
            region: _('${you} may select tribes, roads or armies to remove'),
        };
        this.game.clientUpdatePageTitle({
            text: mainText[location] + _(' (${remaining} remaining)'),
            args: {
                you: '${you}',
                number: this.maxNumberToSelect,
                remaining: this.maxNumberToSelect - this.numberSelected,
            },
        });
    };
    return ClientCardActionBattleState;
}());
var ClientCardActionBetrayState = (function () {
    function ClientCardActionBetrayState(game) {
        this.game = game;
    }
    ClientCardActionBetrayState.prototype.onEnteringState = function (_a) {
        var cardId = _a.cardId, bribe = _a.bribe;
        this.bribe = bribe;
        this.cardId = cardId;
        this.updateInterfaceInitialStep();
    };
    ClientCardActionBetrayState.prototype.onLeavingState = function () { };
    ClientCardActionBetrayState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        var _a;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a court card to betray'),
            args: {
                you: '${you}',
            },
        });
        this.setCourtCardsSelectable();
        if ((_a = this.bribe) === null || _a === void 0 ? void 0 : _a.negotiated) {
            this.game.addDangerActionButton({
                id: 'cancel_bribe_btn',
                text: _('Cancel bribe'),
                callback: function () {
                    return _this.game.takeAction({
                        action: 'cancelBribe',
                    });
                },
            });
        }
        else {
            this.game.addCancelButton();
        }
    };
    ClientCardActionBetrayState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var betrayedCardId = _a.betrayedCardId;
        this.game.clearPossible();
        var card = this.game.getCardInfo({ cardId: betrayedCardId });
        var node = dojo.byId(betrayedCardId);
        dojo.addClass(node, 'pp_selected');
        this.game.clientUpdatePageTitle({
            text: _('Betray ${cardName}?'),
            args: {
                cardName: _(card.name),
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.handleConfirm({ betrayedCardId: betrayedCardId }); },
        });
        this.game.addCancelButton();
    };
    ClientCardActionBetrayState.prototype.getSpies = function (_a) {
        var _this = this;
        var cardId = _a.cardId;
        var spyZone = this.game.spies[cardId];
        if (!spyZone) {
            return {
                enemy: [],
                own: [],
            };
        }
        var cylinderIds = spyZone.getAllItems();
        return {
            enemy: cylinderIds.filter(function (cylinderId) { return Number(cylinderId.split('_')[1]) !== _this.game.getPlayerId(); }),
            own: cylinderIds.filter(function (cylinderId) { return Number(cylinderId.split('_')[1]) === _this.game.getPlayerId(); }),
        };
    };
    ClientCardActionBetrayState.prototype.handleConfirm = function (_a) {
        var _b, _c;
        var betrayedCardId = _a.betrayedCardId;
        debug('handleConfirm', betrayedCardId);
        this.game.takeAction({
            action: 'betray',
            data: {
                cardId: this.cardId,
                betrayedCardId: betrayedCardId,
                bribeAmount: (_c = (_b = this.bribe) === null || _b === void 0 ? void 0 : _b.amount) !== null && _c !== void 0 ? _c : null,
            },
        });
    };
    ClientCardActionBetrayState.prototype.setCourtCardsSelectable = function () {
        var _this = this;
        this.game.playerManager.getPlayers().forEach(function (player) {
            player.getCourtCards().forEach(function (card) {
                debug('card', card);
                var _a = _this.getSpies({ cardId: card.id }), enemy = _a.enemy, own = _a.own;
                if (own.length === 0) {
                    return;
                }
                if (card.suit === POLITICAL && player.hasSpecialAbility({ specialAbility: SA_BODYGUARDS })) {
                    return;
                }
                var node = dojo.byId(card.id);
                dojo.addClass(node, 'pp_selectable');
                _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () {
                    _this.updateInterfaceConfirm({ betrayedCardId: card.id });
                }));
            });
        });
    };
    return ClientCardActionBetrayState;
}());
var ClientCardActionBuildState = (function () {
    function ClientCardActionBuildState(game, specialAbilityInfrastructure) {
        this.game = game;
        this.isSpecialAbilityInfrastructure = specialAbilityInfrastructure;
    }
    ClientCardActionBuildState.prototype.onEnteringState = function (props) {
        this.cardId = (props === null || props === void 0 ? void 0 : props.cardId) ? props.cardId : null;
        this.bribe = props === null || props === void 0 ? void 0 : props.bribe;
        this.tempTokens = [];
        this.setMaxNumberToPlace();
        console.log('maxNumberToPlace', this.maxNumberToPlace);
        this.updateInterfaceInitialStep();
    };
    ClientCardActionBuildState.prototype.onLeavingState = function () { };
    ClientCardActionBuildState.prototype.updateInterfaceInitialStep = function () {
        this.game.clearPossible();
        this.updatePageTitle();
        this.setLocationsSelectable();
        this.updateActionButtons();
    };
    ClientCardActionBuildState.prototype.updateInterfaceConfirm = function () {
        var _this = this;
        this.game.clearPossible();
        var amount = this.isSpecialAbilityInfrastructure ? 0 : Math.ceil(this.tempTokens.length / (this.playerHasNationBuilding ? 2 : 1)) * 2;
        this.game.clientUpdatePageTitle({
            text: _('Place x for a cost of ${amount} rupees?'),
            args: {
                amount: amount,
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.onConfirm(); },
        });
        this.game.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () { return _this.onCancel(); },
        });
    };
    ClientCardActionBuildState.prototype.onLocationClick = function (_a) {
        var location = _a.location;
        if (this.maxNumberToPlace - this.tempTokens.length <= 0) {
            return;
        }
        debug('onLocationClick', location);
        var player = this.game.getCurrentPlayer();
        var coalition = player.getLoyalty();
        if (location.endsWith('armies')) {
            var regionId = location.split('_')[1];
            var region = this.game.map.getRegion({ region: regionId });
            region.addTempArmy({ coalition: coalition, index: this.tempTokens.length });
            this.tempTokens.push({
                location: regionId,
                type: 'army',
            });
        }
        else if (location.endsWith('border')) {
            var split = location.split('_');
            var borderId = "".concat(split[1], "_").concat(split[2]);
            var border = this.game.map.getBorder({ border: borderId });
            border.addTempRoad({ coalition: coalition, index: this.tempTokens.length });
            this.tempTokens.push({
                location: borderId,
                type: 'road',
            });
        }
        console.log('tempTokens', this.tempTokens);
        this.updatePageTitle();
        this.updateActionButtons();
    };
    ClientCardActionBuildState.prototype.onCancel = function () {
        this.clearTemporaryTokens();
        this.game.onCancel();
    };
    ClientCardActionBuildState.prototype.onConfirm = function () {
        var _a, _b;
        debug('handleConfirm');
        if (this.tempTokens.length > 0) {
            this.game.takeAction({
                action: this.isSpecialAbilityInfrastructure ? 'specialAbilityInfrastructure' : 'build',
                data: { cardId: this.cardId || undefined, locations: JSON.stringify(this.tempTokens), bribeAmount: (_b = (_a = this.bribe) === null || _a === void 0 ? void 0 : _a.amount) !== null && _b !== void 0 ? _b : null },
            });
            this.clearTemporaryTokens();
        }
    };
    ClientCardActionBuildState.prototype.setMaxNumberToPlace = function () {
        var _a;
        var player = this.game.getCurrentPlayer();
        if (this.isSpecialAbilityInfrastructure) {
            this.maxNumberToPlace = 1;
            return;
        }
        var playerRupees = player.getRupees();
        this.playerHasNationBuilding = player.ownsEventCard({ cardId: ECE_NATION_BUILDING_CARD_ID });
        var multiplier = this.playerHasNationBuilding ? 2 : 1;
        console.log('multiplier', multiplier);
        var bribe = ((_a = this.bribe) === null || _a === void 0 ? void 0 : _a.amount) || 0;
        var maxAffordable = Math.floor((playerRupees - bribe) / 2);
        this.maxNumberToPlace = Math.min(maxAffordable, 3) * multiplier;
    };
    ClientCardActionBuildState.prototype.clearTemporaryTokens = function () {
        var _this = this;
        debug('inside clearTemporaryTokens');
        this.tempTokens.forEach(function (token, index) {
            var location = token.location, type = token.type;
            if (type === 'army') {
                _this.game.map.getRegion({ region: location }).removeTempArmy({ index: index });
            }
            else if (type === 'road') {
                _this.game.map.getBorder({ border: location }).removeTempRoad({ index: index });
            }
        });
        this.tempTokens = [];
    };
    ClientCardActionBuildState.prototype.setLocationsSelectable = function () {
        var _this = this;
        debug('setRegionsSelectable');
        REGIONS.forEach(function (regionId) {
            var region = _this.game.map.getRegion({ region: regionId });
            var ruler = region.getRuler();
            if (ruler !== _this.game.getPlayerId()) {
                return;
            }
            var armyLocation = "pp_".concat(regionId, "_armies");
            var element = document.getElementById(armyLocation);
            console.log('element', element);
            if (element) {
                element.classList.add('pp_selectable');
                _this.game._connections.push(dojo.connect(element, 'onclick', _this, function () { return _this.onLocationClick({ location: armyLocation }); }));
            }
            region.borders.forEach(function (borderId) {
                var borderLocation = "pp_".concat(borderId, "_border");
                var element = document.getElementById(borderLocation);
                if (element && !element.classList.contains('pp_selectable')) {
                    element.classList.add('pp_selectable');
                    _this.game._connections.push(dojo.connect(element, 'onclick', _this, function () { return _this.onLocationClick({ location: borderLocation }); }));
                }
            });
        });
    };
    ClientCardActionBuildState.prototype.updatePageTitle = function () {
        if (this.isSpecialAbilityInfrastructure) {
            this.game.clientUpdatePageTitle({
                text: _('${you} may place one additional block'),
                args: {
                    you: '${you}',
                },
            });
        }
        else {
            this.game.clientUpdatePageTitle({
                text: _('${you} must select regions to place armies and/or roads (up to ${number} remaining)'),
                args: {
                    you: '${you}',
                    number: this.maxNumberToPlace - this.tempTokens.length,
                },
            });
        }
    };
    ClientCardActionBuildState.prototype.updateActionButtons = function () {
        var _this = this;
        var _a;
        this.game.framework().removeActionButtons();
        dojo.empty('customActions');
        this.game.addPrimaryActionButton({
            id: 'done_button',
            text: _('Done'),
            callback: function () { return _this.updateInterfaceConfirm(); },
        });
        if (this.tempTokens.length === 0) {
            dojo.addClass('done_button', 'disabled');
        }
        if (this.isSpecialAbilityInfrastructure) {
            this.game.addDangerActionButton({
                id: 'skip_btn',
                text: _('Skip'),
                callback: function () { return _this.game.takeAction({ action: 'specialAbilityInfrastructure', data: { skip: true } }); },
            });
        }
        else if (((_a = this.bribe) === null || _a === void 0 ? void 0 : _a.negotiated) && this.tempTokens.length === 0) {
            this.game.addDangerActionButton({
                id: 'cancel_bribe_btn',
                text: _('Cancel bribe'),
                callback: function () {
                    _this.clearTemporaryTokens();
                    _this.game.takeAction({
                        action: 'cancelBribe',
                    });
                },
            });
        }
        else {
            this.game.addDangerActionButton({
                id: 'cancel_btn',
                text: _('Cancel'),
                callback: function () { return _this.onCancel(); },
            });
        }
    };
    return ClientCardActionBuildState;
}());
var ClientCardActionGiftState = (function () {
    function ClientCardActionGiftState(game) {
        this.game = game;
    }
    ClientCardActionGiftState.prototype.onEnteringState = function (args) {
        this.bribe = args.bribe;
        this.updateInterfaceInitialStep(args);
    };
    ClientCardActionGiftState.prototype.onLeavingState = function () { };
    ClientCardActionGiftState.prototype.updateInterfaceInitialStep = function (_a) {
        var _this = this;
        var _b;
        var cardId = _a.cardId;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} must select a gift to purchase'),
            args: {
                you: '${you}',
            },
        });
        this.setGiftsSelectable({ cardId: cardId });
        if ((_b = this.bribe) === null || _b === void 0 ? void 0 : _b.negotiated) {
            this.game.addDangerActionButton({
                id: 'cancel_bribe_btn',
                text: _('Cancel bribe'),
                callback: function () {
                    return _this.game.takeAction({
                        action: 'cancelBribe',
                    });
                },
            });
        }
        else {
            this.game.addCancelButton();
        }
    };
    ClientCardActionGiftState.prototype.updateInterfaceConfirmSelectGift = function (_a) {
        var _this = this;
        var value = _a.value, cardId = _a.cardId;
        this.game.clearPossible();
        dojo.query("#pp_gift_".concat(value, "_").concat(this.game.getPlayerId())).addClass('pp_selected');
        this.game.clientUpdatePageTitle({ text: _('Purchase gift for ${value} rupees?'), args: { value: '' + value } });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () {
                var _a, _b;
                return _this.game.takeAction({
                    action: 'purchaseGift',
                    data: { value: value, cardId: cardId, bribeAmount: (_b = (_a = _this.bribe) === null || _a === void 0 ? void 0 : _a.amount) !== null && _b !== void 0 ? _b : null, },
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
    ClientCardActionGiftState.prototype.setGiftsSelectable = function (_a) {
        var _this = this;
        var cardId = _a.cardId;
        var playerId = this.game.getPlayerId();
        [2, 4, 6].forEach(function (giftValue) {
            var _a;
            var hasGift = _this.game.playerManager
                .getPlayer({ playerId: playerId })
                .getGiftZone({
                value: giftValue,
            })
                .getAllItems().length > 0;
            if (!hasGift && giftValue <= _this.game.localState.activePlayer.rupees - (((_a = _this.bribe) === null || _a === void 0 ? void 0 : _a.amount) || 0)) {
                dojo.query("#pp_gift_".concat(giftValue, "_").concat(playerId)).forEach(function (node) {
                    dojo.addClass(node, 'pp_selectable');
                    _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () { return _this.updateInterfaceConfirmSelectGift({ value: giftValue, cardId: cardId }); }));
                });
            }
        });
    };
    return ClientCardActionGiftState;
}());
var ClientCardActionMoveState = (function () {
    function ClientCardActionMoveState(game) {
        var _this = this;
        this.getPlayerOrder = function () {
            return _this.game.gamedatas.playerorder.map(function (id) { return Number(id); });
        };
        this.game = game;
    }
    ClientCardActionMoveState.prototype.onEnteringState = function (_a) {
        var cardId = _a.cardId, bribe = _a.bribe;
        this.game.clearPossible();
        this.cardId = cardId;
        this.bribe = bribe;
        var cardInfo = this.game.getCardInfo({ cardId: cardId });
        this.maxNumberOfMoves = cardInfo.rank;
        this.moves = {};
        this.updateInterfaceInitialStep();
    };
    ClientCardActionMoveState.prototype.onLeavingState = function () { };
    ClientCardActionMoveState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        var _a;
        this.game.clearPossible();
        this.updatePageTitle();
        this.setArmiesSelectable();
        this.setSpiesSelectable();
        if (this.totalNumberOfMoves() > 0) {
            this.game.addPrimaryActionButton({
                id: 'confirm_btn',
                text: _('Confirm'),
                callback: function () { return _this.onConfirm(); },
            });
        }
        if (((_a = this.bribe) === null || _a === void 0 ? void 0 : _a.negotiated) && Object.keys(this.moves).length === 0) {
            this.game.addDangerActionButton({
                id: 'cancel_bribe_btn',
                text: _('Cancel bribe'),
                callback: function () {
                    _this.returnPiecesToOriginalPosition();
                    _this.game.takeAction({
                        action: 'cancelBribe',
                    });
                },
            });
        }
        else {
            this.addCancelButton();
        }
    };
    ClientCardActionMoveState.prototype.updateInterfaceArmySelected = function (_a) {
        var pieceId = _a.pieceId, regionId = _a.regionId;
        this.game.clearPossible();
        dojo.query("#".concat(pieceId)).addClass(PP_SELECTED).removeClass(PP_SELECTABLE);
        this.setDestinationRegionsSelectable({ pieceId: pieceId, regionId: regionId });
        this.game.clientUpdatePageTitle({
            text: _('${you} must select the region to move the army to'),
            args: {
                you: '${you}',
            },
        });
        this.addCancelButton();
    };
    ClientCardActionMoveState.prototype.updateIntefaceSpySelected = function (_a) {
        var pieceId = _a.pieceId, cardId = _a.cardId;
        debug('updateIntefaceSpySelected', pieceId, cardId);
        this.game.clearPossible();
        dojo.query("#".concat(pieceId)).addClass(PP_SELECTED).removeClass(PP_SELECTABLE);
        this.setDestinationCardsSelectable({ pieceId: pieceId, cardId: cardId });
        this.game.clientUpdatePageTitle({
            text: _('${you} must select the card to move the spy to'),
            args: {
                you: '${you}',
            },
        });
        this.addCancelButton();
    };
    ClientCardActionMoveState.prototype.updateInterfaceConfirmMoves = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('Confirm moves?'),
            args: {},
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.onConfirm(); },
        });
        this.addCancelButton();
    };
    ClientCardActionMoveState.prototype.onCardClick = function (_a) {
        var toCardId = _a.toCardId, fromCardId = _a.fromCardId, pieceId = _a.pieceId;
        debug('onCardClick', pieceId, fromCardId, toCardId);
        this.game.clearPossible();
        this.addMove({ from: fromCardId, to: toCardId, pieceId: pieceId });
        this.game.move({
            id: pieceId,
            from: this.game.spies[fromCardId],
            to: this.game.spies[toCardId],
            removeClass: [PP_SELECTED],
        });
        this.nextStepAfterMove();
    };
    ClientCardActionMoveState.prototype.onConfirm = function () {
        var _a, _b;
        debug('onConfirm', this.moves);
        if (this.totalNumberOfMoves() > 0) {
            this.game.takeAction({
                action: 'move',
                data: {
                    cardId: this.cardId,
                    moves: JSON.stringify(this.moves),
                    bribeAmount: (_b = (_a = this.bribe) === null || _a === void 0 ? void 0 : _a.amount) !== null && _b !== void 0 ? _b : null,
                },
            });
        }
    };
    ClientCardActionMoveState.prototype.onRegionClick = function (_a) {
        var fromRegionId = _a.fromRegionId, toRegionId = _a.toRegionId, pieceId = _a.pieceId;
        debug('onRegionClick', fromRegionId, toRegionId, pieceId);
        this.game.clearPossible();
        var fromRegion = this.game.map.getRegion({ region: fromRegionId });
        var toRegion = this.game.map.getRegion({ region: toRegionId });
        var isPieceArmy = pieceId.startsWith('block');
        this.addMove({ from: fromRegionId, to: toRegionId, pieceId: pieceId });
        this.game.move({
            id: pieceId,
            from: isPieceArmy ? fromRegion.getArmyZone() : fromRegion.getTribeZone(),
            to: isPieceArmy ? toRegion.getArmyZone() : toRegion.getTribeZone(),
            removeClass: [PP_SELECTED],
        });
        this.nextStepAfterMove();
    };
    ClientCardActionMoveState.prototype.nextStepAfterMove = function () {
        var _this = this;
        setTimeout(function () {
            if (_this.maxNumberOfMoves > _this.totalNumberOfMoves()) {
                _this.updateInterfaceInitialStep();
            }
            else {
                _this.updateInterfaceConfirmMoves();
            }
        }, 1000);
    };
    ClientCardActionMoveState.prototype.addMove = function (_a) {
        var pieceId = _a.pieceId, from = _a.from, to = _a.to;
        if (this.moves[pieceId]) {
            this.moves[pieceId].push({
                from: from,
                to: to,
            });
        }
        else {
            this.moves[pieceId] = [
                {
                    from: from,
                    to: to,
                },
            ];
        }
    };
    ClientCardActionMoveState.prototype.addCancelButton = function () {
        var _this = this;
        this.game.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () {
                _this.returnPiecesToOriginalPosition();
                _this.game.onCancel();
            },
        });
    };
    ClientCardActionMoveState.prototype.getNextCardId = function (_a) {
        var _b;
        var cardId = _a.cardId;
        var node = dojo.byId(cardId);
        var playerId = Number((_b = node.closest('.pp_court')) === null || _b === void 0 ? void 0 : _b.id.split('_')[3]);
        var cardIds = this.game.playerManager.getPlayer({ playerId: playerId }).getCourtZone().getAllItems();
        var index = cardIds.indexOf(cardId);
        if (index !== cardIds.length - 1) {
            return cardIds[index + 1];
        }
        var currentPlayerId = playerId;
        while (true) {
            var nextPlayerId = this.getNextPlayer({ playerId: currentPlayerId });
            var nextPlayerCardsIds = this.game.playerManager.getPlayer({ playerId: nextPlayerId }).getCourtZone().getAllItems();
            if (nextPlayerCardsIds.length > 0) {
                return nextPlayerCardsIds[0];
            }
            else {
                currentPlayerId = nextPlayerId;
            }
        }
    };
    ClientCardActionMoveState.prototype.getPreviousCardId = function (_a) {
        var _b;
        var cardId = _a.cardId;
        var node = dojo.byId(cardId);
        var playerId = Number((_b = node.closest('.pp_court')) === null || _b === void 0 ? void 0 : _b.id.split('_')[3]);
        var cardIds = this.game.playerManager.getPlayer({ playerId: playerId }).getCourtZone().getAllItems();
        var index = cardIds.indexOf(cardId);
        if (index !== 0) {
            return cardIds[index - 1];
        }
        var currentPlayerId = playerId;
        while (true) {
            var previousPlayerId = this.getPreviousPlayer({ playerId: currentPlayerId });
            var previousPlayerCardIds = this.game.playerManager.getPlayer({ playerId: previousPlayerId }).getCourtZone().getAllItems();
            if (previousPlayerCardIds.length > 0) {
                return previousPlayerCardIds[previousPlayerCardIds.length - 1];
            }
            else {
                currentPlayerId = previousPlayerId;
            }
        }
    };
    ClientCardActionMoveState.prototype.getNextPlayer = function (_a) {
        var playerId = _a.playerId;
        var playerOrder = this.getPlayerOrder();
        var playerIndex = playerOrder.indexOf(playerId);
        if (playerIndex === playerOrder.length - 1) {
            return playerOrder[0];
        }
        else {
            return playerOrder[playerIndex + 1];
        }
    };
    ClientCardActionMoveState.prototype.getPreviousPlayer = function (_a) {
        var playerId = _a.playerId;
        var playerOrder = this.getPlayerOrder();
        var playerIndex = playerOrder.indexOf(playerId);
        if (playerIndex === 0) {
            return playerOrder[playerOrder.length - 1];
        }
        else {
            return playerOrder[playerIndex - 1];
        }
    };
    ClientCardActionMoveState.prototype.returnPiecesToOriginalPosition = function () {
        var _this = this;
        debug('returnPiecesToOriginalPosition');
        Object.entries(this.moves).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            if (value.length === 0) {
                return;
            }
            debug('returnPiecesToOriginalPosition', key, value);
            var from = value[value.length - 1].to;
            var to = value[0].from;
            if (from === to) {
                return;
            }
            if (key.includes('block')) {
                _this.game.move({
                    id: key,
                    from: _this.game.map.getRegion({ region: from }).getArmyZone(),
                    to: _this.game.map.getRegion({ region: to }).getArmyZone(),
                });
            }
            else if (key.includes('cylinder') && !from.startsWith('card')) {
                _this.game.move({
                    id: key,
                    from: _this.game.map.getRegion({ region: from }).getTribeZone(),
                    to: _this.game.map.getRegion({ region: to }).getTribeZone(),
                });
            }
            else if (key.includes('cylinder')) {
                _this.game.move({
                    id: key,
                    from: _this.game.spies[from],
                    to: _this.game.spies[to],
                });
            }
        });
    };
    ClientCardActionMoveState.prototype.setArmiesSelectable = function () {
        var _this = this;
        REGIONS.forEach(function (regionId) {
            var region = _this.game.map.getRegion({ region: regionId });
            var coalitionId = _this.game.localState.activePlayer.loyalty;
            var coalitionArmies = region.getCoalitionArmies({ coalitionId: coalitionId });
            var player = _this.game.getCurrentPlayer();
            var tribesNationalism = player.ownsEventCard({ cardId: ECE_NATIONALISM_CARD_ID })
                ? region.getPlayerTribes({ playerId: player.getPlayerId() })
                : [];
            if (coalitionArmies.length + tribesNationalism.length === 0) {
                return;
            }
            var hasIndianSupplies = player.hasSpecialAbility({ specialAbility: SA_INDIAN_SUPPLIES });
            var hasCoalitionRoads = hasIndianSupplies ||
                region.borders.some(function (borderId) {
                    var border = _this.game.map.getBorder({ border: borderId });
                    return border.getCoalitionRoads({ coalitionId: coalitionId }).length > 0;
                });
            if (!hasCoalitionRoads) {
                return;
            }
            coalitionArmies.concat(tribesNationalism).forEach(function (pieceId) {
                console.log('selectable army', pieceId);
                var element = dojo.byId(pieceId);
                element.classList.add('pp_selectable');
                _this.game._connections.push(dojo.connect(element, 'onclick', _this, function () { return _this.updateInterfaceArmySelected({ pieceId: pieceId, regionId: regionId }); }));
            });
        });
    };
    ClientCardActionMoveState.prototype.getSingleMoveDestinationsForSpy = function (_a) {
        var cardId = _a.cardId;
        var cardInfo = this.game.getCardInfo({ cardId: cardId });
        var destinationCards = [];
        destinationCards.push(this.getNextCardId({ cardId: cardId }));
        var previousCardId = this.getPreviousCardId({ cardId: cardId });
        if (!destinationCards.includes(previousCardId)) {
            destinationCards.push(previousCardId);
        }
        var player = this.game.getCurrentPlayer();
        if (player.hasSpecialAbility({ specialAbility: SA_STRANGE_BEDFELLOWS })) {
            dojo.query(".pp_card_in_court.pp_".concat(cardInfo.region)).forEach(function (node) {
                var nodeId = node.id;
                if (!destinationCards.includes(nodeId)) {
                    destinationCards.push(nodeId);
                }
            });
        }
        return destinationCards;
    };
    ClientCardActionMoveState.prototype.setDestinationCardsSelectable = function (_a) {
        var _this = this;
        var pieceId = _a.pieceId, inputCardId = _a.cardId;
        debug('setDestinationCardsSelectable', pieceId, inputCardId);
        var destinationCards = this.getSingleMoveDestinationsForSpy({ cardId: inputCardId });
        var player = this.game.getCurrentPlayer();
        if (player.hasSpecialAbility({ specialAbility: SA_WELL_CONNECTED })) {
            __spreadArray([], destinationCards, true).forEach(function (cardId) {
                destinationCards.push.apply(destinationCards, _this.getSingleMoveDestinationsForSpy({ cardId: cardId }));
            });
        }
        var uniqueDestinations = [];
        destinationCards.forEach(function (cardId) {
            if (!uniqueDestinations.includes(cardId)) {
                uniqueDestinations.push(cardId);
            }
        });
        uniqueDestinations
            .filter(function (id) { return id !== inputCardId; })
            .forEach(function (toCardId) {
            var destinationCardNode = dojo.byId(toCardId);
            destinationCardNode.classList.add(PP_SELECTABLE);
            _this.game._connections.push(dojo.connect(destinationCardNode, 'onclick', _this, function () { return _this.onCardClick({ toCardId: toCardId, fromCardId: inputCardId, pieceId: pieceId }); }));
        });
    };
    ClientCardActionMoveState.prototype.setDestinationRegionsSelectable = function (_a) {
        var _this = this;
        var pieceId = _a.pieceId, regionId = _a.regionId;
        debug('setDestinationRegionsSelectable', pieceId, regionId);
        this.game.map.setSelectable();
        var region = this.game.map.getRegion({ region: regionId });
        var coalitionId = this.game.localState.activePlayer.loyalty;
        var hasIndianSupplies = this.game.getCurrentPlayer().hasSpecialAbility({ specialAbility: SA_INDIAN_SUPPLIES });
        region.borders.forEach(function (borderId) {
            var border = _this.game.map.getBorder({ border: borderId });
            if (hasIndianSupplies || border.getCoalitionRoads({ coalitionId: coalitionId }).length > 0) {
                var toRegionId_1 = borderId.split('_').filter(function (borderRegionId) { return borderRegionId !== regionId; })[0];
                _this.game.map
                    .getRegion({ region: toRegionId_1 })
                    .setSelectable({ callback: function () { return _this.onRegionClick({ fromRegionId: regionId, toRegionId: toRegionId_1, pieceId: pieceId }); } });
            }
        });
    };
    ClientCardActionMoveState.prototype.setSpiesSelectable = function () {
        var _this = this;
        Object.entries(this.game.spies).forEach(function (_a) {
            var cardId = _a[0], zone = _a[1];
            zone.getAllItems().forEach(function (cylinderId) {
                if (Number(cylinderId.split('_')[1]) !== _this.game.getPlayerId()) {
                    return;
                }
                var node = dojo.byId(cylinderId);
                node.classList.add(PP_SELECTABLE);
                _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () { return _this.updateIntefaceSpySelected({ pieceId: cylinderId, cardId: cardId }); }));
            });
        });
    };
    ClientCardActionMoveState.prototype.totalNumberOfMoves = function () {
        var total = 0;
        Object.values(this.moves).forEach(function (movesForSinglePiece) {
            total += movesForSinglePiece.length;
        });
        return total;
    };
    ClientCardActionMoveState.prototype.updatePageTitle = function () {
        this.game.clientUpdatePageTitle({
            text: _('${you} must select an army or spy to move (${number} remaining)'),
            args: {
                you: '${you}',
                number: this.maxNumberOfMoves - this.totalNumberOfMoves(),
            },
        });
    };
    return ClientCardActionMoveState;
}());
var ClientCardActionTaxState = (function () {
    function ClientCardActionTaxState(game) {
        this.game = game;
    }
    ClientCardActionTaxState.prototype.onEnteringState = function (args) {
        this.cardId = args.cardId;
        this.bribe = args.bribe;
        var cardInfo = this.game.getCardInfo(args);
        this.maxNumberToSelect = cardInfo.rank;
        this.numberSelected = 0;
        this.maxPerPlayer = {};
        this.updateInterfaceInitialStep();
    };
    ClientCardActionTaxState.prototype.onLeavingState = function () { };
    ClientCardActionTaxState.prototype.updateInterfaceInitialStep = function () {
        this.game.clearPossible();
        this.updatePageTitle();
        this.updateActionButtons();
        this.setRupeesSelectable();
    };
    ClientCardActionTaxState.prototype.addCancelButton = function () {
        var _this = this;
        this.game.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () {
                Object.keys(_this.maxPerPlayer).forEach(function (playerId) {
                    _this.game.playerManager.getPlayer({ playerId: Number(playerId) }).removeTaxCounter();
                });
                _this.game.onCancel();
            },
        });
    };
    ClientCardActionTaxState.prototype.confirmTax = function () {
        var _a, _b;
        var marketRupees = [];
        var playerRupees = [];
        dojo.query('.pp_selected').forEach(function (node) {
            if (!node.id.startsWith('rupees_tableau')) {
                marketRupees.push(node.id);
            }
        });
        Object.keys(this.maxPerPlayer).forEach(function (playerId) {
            var taxCounter = dojo.byId("rupees_tableau_".concat(playerId, "_tax_counter"));
            if (taxCounter) {
                playerRupees.push("".concat(playerId, "_").concat(Number(taxCounter.innerText)));
            }
        });
        this.game.takeAction({
            action: 'tax',
            data: {
                cardId: this.cardId,
                market: marketRupees.join(' '),
                players: playerRupees.join(' '),
                bribeAmount: (_b = (_a = this.bribe) === null || _a === void 0 ? void 0 : _a.amount) !== null && _b !== void 0 ? _b : null,
            },
        });
    };
    ClientCardActionTaxState.prototype.handleMarketRupeeClicked = function (_a) {
        var rupeeId = _a.rupeeId;
        var node = dojo.byId("".concat(rupeeId));
        var hasSelectableClass = node.classList.contains('pp_selectable');
        if (hasSelectableClass && this.numberSelected >= this.maxNumberToSelect) {
            debug('max selected reached');
            return;
        }
        this.toggleSelected(node);
        this.updateNumberSelected();
        this.updatePageTitle();
        this.updateActionButtons();
        this.updateSelectableStatePlayers();
    };
    ClientCardActionTaxState.prototype.handlePlayerRupeeClicked = function (_a) {
        var rupeeId = _a.rupeeId;
        var node = dojo.byId("".concat(rupeeId));
        var taxCounter = dojo.byId("".concat(node.id, "_tax_counter"));
        var hasSelectableClass = node.classList.contains('pp_selectable');
        if (hasSelectableClass && this.numberSelected >= this.maxNumberToSelect && !taxCounter) {
            debug('max selected reached');
            return;
        }
        if (!taxCounter) {
            dojo.place("<span id=\"".concat(node.id, "_tax_counter\" class=\"pp_tax_counter\">1</span>"), node);
        }
        else {
            var playerId = Number(node.id.split('_')[2]);
            var currentValue = Number(taxCounter.innerText);
            if (this.numberSelected >= this.maxNumberToSelect ||
                currentValue >= this.maxNumberToSelect ||
                currentValue >= this.maxPerPlayer[playerId]) {
                dojo.destroy("".concat(node.id, "_tax_counter"));
            }
            else {
                taxCounter.innerText = "".concat(currentValue + 1);
            }
        }
        this.updateNumberSelected();
        this.updatePageTitle();
        this.updateActionButtons();
        this.updateSelectableStatePlayers();
    };
    ClientCardActionTaxState.prototype.toggleSelected = function (node) {
        node.classList.toggle('pp_selected');
        node.classList.toggle('pp_selectable');
    };
    ClientCardActionTaxState.prototype.setRupeesSelectable = function () {
        var _this = this;
        dojo.query('.pp_rupee').forEach(function (node) {
            var parentId = node.parentElement.id;
            if (parentId.startsWith('pp_market')) {
                dojo.addClass(node, 'pp_selectable');
                _this.game._connections.push(dojo.connect(node, 'onclick', _this, function (event) {
                    event.stopPropagation();
                    _this.handleMarketRupeeClicked({ rupeeId: node.id });
                }));
            }
        });
        var hasClaimOfAncientLineage = this.game.getCurrentPlayer().hasSpecialAbility({ specialAbility: SA_CLAIM_OF_ANCIENT_LINEAGE });
        this.game.playerManager.getPlayerIds().forEach(function (playerId) {
            if (playerId === _this.game.getPlayerId()) {
                return;
            }
            var player = _this.game.playerManager.getPlayer({ playerId: playerId });
            if (!hasClaimOfAncientLineage) {
                var hasCardRuledByPlayer = player
                    .getCourtZone()
                    .getAllItems()
                    .some(function (cardId) {
                    var cardRegion = _this.game.getCardInfo({ cardId: cardId }).region;
                    if (_this.game.map.getRegion({ region: cardRegion }).getRuler() === _this.game.getPlayerId()) {
                        return true;
                    }
                });
                if (!hasCardRuledByPlayer) {
                    return;
                }
            }
            var taxShelter = player.getTaxShelter();
            var playerRupees = player.getRupees();
            if (playerRupees <= taxShelter) {
                return;
            }
            _this.maxPerPlayer[playerId] = playerRupees - taxShelter;
            var node = dojo.byId("rupees_tableau_".concat(playerId));
            dojo.addClass(node, 'pp_selectable');
            _this.game._connections.push(dojo.connect(node, 'onclick', _this, function (event) {
                event.stopPropagation();
                _this.handlePlayerRupeeClicked({ rupeeId: node.id });
            }));
        });
    };
    ClientCardActionTaxState.prototype.updateNumberSelected = function () {
        var numberSelected = 0;
        dojo.query('.pp_selected').forEach(function (node) {
            if (!node.id.startsWith('rupees_tableau')) {
                numberSelected += 1;
            }
        });
        Object.keys(this.maxPerPlayer).forEach(function (playerId) {
            var taxCounter = dojo.byId("rupees_tableau_".concat(playerId, "_tax_counter"));
            if (taxCounter) {
                numberSelected += Number(taxCounter.innerText);
            }
        });
        this.numberSelected = numberSelected;
    };
    ClientCardActionTaxState.prototype.updateActionButtons = function () {
        var _this = this;
        var _a;
        this.game.framework().removeActionButtons();
        dojo.empty('customActions');
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.confirmTax(); },
        });
        if (this.numberSelected === 0) {
            dojo.addClass('confirm_btn', 'disabled');
        }
        if (((_a = this.bribe) === null || _a === void 0 ? void 0 : _a.negotiated) && this.numberSelected === 0) {
            this.game.addDangerActionButton({
                id: 'cancel_bribe_btn',
                text: _('Cancel bribe'),
                callback: function () {
                    return _this.game.takeAction({
                        action: 'cancelBribe',
                    });
                },
            });
        }
        else {
            this.addCancelButton();
        }
    };
    ClientCardActionTaxState.prototype.updatePageTitle = function () {
        this.game.clientUpdatePageTitle({
            text: _('${you} may take ${number} rupee(s) (${remaining} remaining)'),
            args: {
                you: '${you}',
                number: this.maxNumberToSelect,
                remaining: this.maxNumberToSelect - this.numberSelected,
            },
        });
    };
    ClientCardActionTaxState.prototype.updateSelectableStatePlayers = function () {
        var _this = this;
        Object.keys(this.maxPerPlayer).forEach(function (playerId) {
            var taxCounter = dojo.byId("rupees_tableau_".concat(playerId, "_tax_counter"));
            var rupeeNode = dojo.byId("rupees_tableau_".concat(playerId));
            var hasSelectableClass = rupeeNode.classList.contains('pp_selectable');
            if (!taxCounter && !hasSelectableClass) {
                _this.toggleSelected(rupeeNode);
            }
            if (!taxCounter) {
                return;
            }
            var currentValue = taxCounter ? Number(taxCounter.innerText) : 0;
            var playerMax = _this.maxPerPlayer[playerId];
            if (hasSelectableClass && (_this.maxNumberToSelect <= _this.numberSelected || currentValue >= playerMax)) {
                _this.toggleSelected(rupeeNode);
            }
            else if (!hasSelectableClass && _this.maxNumberToSelect > _this.numberSelected && currentValue < playerMax) {
                _this.toggleSelected(rupeeNode);
            }
        });
    };
    return ClientCardActionTaxState;
}());
var ClientInitialBribeCheckState = (function () {
    function ClientInitialBribeCheckState(game) {
        this.game = game;
    }
    ClientInitialBribeCheckState.prototype.onEnteringState = function (args) {
        this.action = args.action;
        this.cardId = args.cardId;
        this.checkBribe(args);
    };
    ClientInitialBribeCheckState.prototype.onLeavingState = function () { };
    ClientInitialBribeCheckState.prototype.updateInterfaceInitialStep = function (_a) {
        var _this = this;
        var bribeeId = _a.bribeeId, amount = _a.amount, next = _a.next;
        this.game.clearPossible();
        this.game.activeStates.playerActions.setCardActionSelected({ cardId: this.cardId, action: this.action });
        var localState = this.game.localState;
        var bribee = this.game.playerManager.getPlayer({ playerId: bribeeId });
        this.game.clientUpdatePageTitle({
            text: substituteKeywords({
                string: " ${you} must pay a bribe of ${amount} rupee(s) to ${playerName} or ask to waive",
                args: {
                    amount: amount,
                },
                playerColor: bribee.getColor(),
            }),
            args: {
                playerName: bribee.getName(),
                you: '${you}',
            },
        });
        var minActionCost = this.game.getMinimumActionCost({ action: this.action }) || 0;
        var maxAvailableRupees = localState.activePlayer.rupees - minActionCost;
        if (amount <= maxAvailableRupees) {
            this.game.addPrimaryActionButton({
                id: "pay_bribe_btn",
                text: _('Pay bribe'),
                callback: function () { return next({ bribe: { amount: amount } }); },
            });
        }
        var _loop_1 = function (i) {
            if (i > maxAvailableRupees) {
                return "continue";
            }
            this_1.game.addPrimaryActionButton({
                id: "ask_partial_waive_".concat(i, "_btn"),
                text: dojo.string.substitute(_("Offer ".concat(i, " rupee(s)")), { i: i }),
                callback: function () {
                    return _this.game.takeAction({
                        action: 'startBribeNegotiation',
                        data: {
                            cardId: _this.cardId,
                            useFor: _this.action,
                            amount: i,
                        },
                    });
                },
            });
        };
        var this_1 = this;
        for (var i = amount - 1; i >= 1; i--) {
            _loop_1(i);
        }
        if (this.game.getCurrentPlayer().ownsEventCard({ cardId: 'card_107' })) {
            this.game.addPrimaryActionButton({
                id: "do_not_pay_btn",
                text: _('Do not pay'),
                callback: function () { return next({ bribe: null }); },
            });
        }
        else {
            this.game.addPrimaryActionButton({
                id: "ask_waive_btn",
                text: _('Ask to waive'),
                callback: function () {
                    return _this.game.takeAction({
                        action: 'startBribeNegotiation',
                        data: {
                            cardId: _this.cardId,
                            useFor: _this.action,
                            amount: 0,
                        },
                    });
                },
            });
        }
        this.game.addCancelButton();
    };
    ClientInitialBribeCheckState.prototype.checkBribe = function (_a) {
        var cardId = _a.cardId, action = _a.action, next = _a.next;
        var disregardForCustomsActive = this.game.activeEvents.getAllItems().includes('card_107');
        var charismaticCourtiersAcitve = action === 'playCard' && this.game.getCurrentPlayer().hasSpecialAbility({ specialAbility: SA_CHARISMATIC_COURTIERS });
        var civilServiceReformsActive = action !== 'playCard' && this.game.getCurrentPlayer().hasSpecialAbility({ specialAbility: SA_CIVIL_SERVICE_REFORMS });
        if (disregardForCustomsActive || charismaticCourtiersAcitve || civilServiceReformsActive) {
            next({ bribe: null });
            return;
        }
        var bribe = action === 'playCard' ? this.checkBribePlayCard({ cardId: cardId }) : this.checkBribeCardAction({ cardId: cardId });
        if (bribe === null) {
            next({ bribe: null });
        }
        else {
            this.updateInterfaceInitialStep(__assign(__assign({}, bribe), { next: next }));
        }
    };
    ClientInitialBribeCheckState.prototype.checkBribeCardAction = function (_a) {
        var cardId = _a.cardId;
        var spyZone = this.game.spies[cardId];
        if (!spyZone) {
            return null;
        }
        var cylinderIds = spyZone.getAllItems();
        var totals = {};
        cylinderIds.forEach(function (cylinderId) {
            var playerId = cylinderId.split('_')[1];
            if (totals[playerId]) {
                totals[playerId] += 1;
            }
            else {
                totals[playerId] = 1;
            }
        });
        var sortedTotals = Object.entries(totals)
            .map(function (_a) {
            var key = _a[0], value = _a[1];
            return ({
                playerId: Number(key),
                numberOfSpies: value,
            });
        })
            .sort(function (a, b) { return b.numberOfSpies - a.numberOfSpies; });
        console.log('sortedTotals', sortedTotals);
        var currentPlayerId = this.game.getPlayerId();
        var numberOfPlayersWithSpies = sortedTotals.length;
        if (numberOfPlayersWithSpies === 1 && sortedTotals[0].playerId !== currentPlayerId) {
            var _b = sortedTotals[0], playerId = _b.playerId, numberOfSpies = _b.numberOfSpies;
            return {
                bribeeId: playerId,
                amount: numberOfSpies,
            };
        }
        else if (numberOfPlayersWithSpies > 1 &&
            sortedTotals[0].numberOfSpies > sortedTotals[1].numberOfSpies &&
            sortedTotals[0].playerId !== currentPlayerId) {
            var _c = sortedTotals[0], playerId = _c.playerId, numberOfSpies = _c.numberOfSpies;
            return {
                bribeeId: playerId,
                amount: numberOfSpies,
            };
        }
        else {
            return null;
        }
    };
    ClientInitialBribeCheckState.prototype.checkBribePlayCard = function (_a) {
        var cardId = _a.cardId;
        var cardInfo = this.game.getCardInfo({ cardId: cardId });
        var region = cardInfo.region;
        var rulerId = this.game.map.getRegion({ region: region }).getRuler();
        var playerId = this.game.getPlayerId();
        if (rulerId !== null && rulerId !== playerId) {
            var amount = this.game.map.getRegion({ region: region }).getRulerTribes().length;
            return { bribeeId: rulerId, amount: amount };
        }
        else {
            return null;
        }
    };
    return ClientInitialBribeCheckState;
}());
var ClientPlayCardState = (function () {
    function ClientPlayCardState(game) {
        this.game = game;
    }
    ClientPlayCardState.prototype.onEnteringState = function (_a) {
        var bribe = _a.bribe, cardId = _a.cardId;
        this.cardId = cardId;
        this.bribe = bribe;
        this.playCardNextStep();
    };
    ClientPlayCardState.prototype.onLeavingState = function () { };
    ClientPlayCardState.prototype.updateInterfacePlayCardConfirm = function (_a) {
        var _this = this;
        var _b;
        var side = _a.side, firstCard = _a.firstCard;
        this.game.clearPossible();
        dojo.query("#pp_card_select_".concat(side)).addClass('pp_selected');
        dojo.query(".pp_card_in_hand.pp_".concat(this.cardId)).addClass('pp_selected');
        if (firstCard) {
            this.game.clientUpdatePageTitle({
                text: _("Play '${name}' to court?"),
                args: {
                    name: this.game.getCardInfo({ cardId: this.cardId }).name,
                },
            });
        }
        else {
            this.game.clientUpdatePageTitle({
                text: _("Play '${name}' to ${side} end of court?"),
                args: {
                    name: this.game.getCardInfo({ cardId: this.cardId }).name,
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
                        cardId: _this.cardId,
                        side: side,
                        bribeAmount: _this.bribe ? _this.bribe.amount : null,
                    },
                });
            },
        });
        if (((_b = this.bribe) === null || _b === void 0 ? void 0 : _b.negotiated) && firstCard) {
            this.game.addDangerActionButton({
                id: 'cancel_bribe_btn',
                text: _('Cancel bribe'),
                callback: function () {
                    _this.removeSideSelectable();
                    _this.game.takeAction({
                        action: 'cancelBribe',
                    });
                },
            });
        }
        else {
            this.game.addDangerActionButton({
                id: 'cancel_btn',
                text: _('Cancel'),
                callback: function () {
                    var _a;
                    _this.removeSideSelectable();
                    setTimeout(function () {
                        _this.game.onCancel();
                    }, ((_a = _this.bribe) === null || _a === void 0 ? void 0 : _a.negotiated) ? 20 : 0);
                },
            });
        }
    };
    ClientPlayCardState.prototype.updateInterfacePlayCardSelectSide = function () {
        var _this = this;
        var _a;
        this.game.clearPossible();
        dojo.query(".pp_card_in_hand.pp_".concat(this.cardId)).addClass('pp_selected');
        this.game.clientUpdatePageTitle({
            text: _("Select which end of court to play '${name}'"),
            args: {
                name: this.game.getCardInfo({ cardId: this.cardId }).name,
            },
        });
        this.setSideSelectable();
        if ((_a = this.bribe) === null || _a === void 0 ? void 0 : _a.negotiated) {
            this.game.addDangerActionButton({
                id: 'cancel_bribe_btn',
                text: _('Cancel bribe'),
                callback: function () {
                    _this.removeSideSelectable();
                    _this.game.takeAction({
                        action: 'cancelBribe',
                    });
                },
            });
        }
        else {
            this.game.addDangerActionButton({
                id: 'cancel_btn',
                text: _('Cancel'),
                callback: function () {
                    _this.removeSideSelectable();
                    _this.game.onCancel();
                },
            });
        }
    };
    ClientPlayCardState.prototype.playCardNextStep = function () {
        var numberOfCardsInCourt = this.game.playerManager
            .getPlayer({ playerId: this.game.getPlayerId() })
            .getCourtZone()
            .getAllItems().length;
        if (numberOfCardsInCourt === 0) {
            this.updateInterfacePlayCardConfirm({ firstCard: true, side: 'left' });
        }
        else {
            this.updateInterfacePlayCardSelectSide();
        }
    };
    ClientPlayCardState.prototype.removeSideSelectable = function () {
        this.game.playerManager.getPlayer({ playerId: this.game.getPlayerId() }).removeSideSelectFromCourt();
    };
    ClientPlayCardState.prototype.setSideSelectable = function () {
        var _this = this;
        this.game.playerManager.getPlayer({ playerId: this.game.getPlayerId() }).addSideSelectToCourt();
        dojo.query('#pp_card_select_left').forEach(function (node) {
            dojo.connect(node, 'onclick', _this, function () {
                _this.updateInterfacePlayCardConfirm({ firstCard: false, side: 'left' });
            });
        });
        dojo.query('#pp_card_select_right').forEach(function (node) {
            dojo.connect(node, 'onclick', _this, function () {
                _this.updateInterfacePlayCardConfirm({ firstCard: false, side: 'right' });
            });
        });
    };
    return ClientPlayCardState;
}());
var ClientPurchaseCardState = (function () {
    function ClientPurchaseCardState(game) {
        this.game = game;
    }
    ClientPurchaseCardState.prototype.onEnteringState = function (args) {
        this.updateInterfaceInitialStep(args);
    };
    ClientPurchaseCardState.prototype.onLeavingState = function () { };
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
var DiscardState = (function () {
    function DiscardState(game) {
        this.game = game;
    }
    DiscardState.prototype.onEnteringState = function (_a) {
        var from = _a.from, loyalty = _a.loyalty, region = _a.region, suit = _a.suit;
        console.log('from state file', from);
        this.from = from;
        this.loyalty = loyalty;
        this.region = region;
        this.suit = suit;
        this.updateInterfaceInitialStep();
    };
    DiscardState.prototype.onLeavingState = function () { };
    DiscardState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.updatePageTitle();
        if (this.from.includes(COURT)) {
            this.game.setCourtCardsSelectable({
                callback: function (_a) {
                    var cardId = _a.cardId;
                    return _this.updateInterfaceConfirm({ cardId: cardId, from: 'court' });
                },
                loyalty: this.loyalty,
                region: this.region,
                suit: this.suit,
            });
        }
        if (this.from.includes(HAND)) {
            this.game.setHandCardsSelectable({
                callback: function (_a) {
                    var cardId = _a.cardId;
                    return _this.updateInterfaceConfirm({ cardId: cardId, from: 'hand' });
                },
            });
        }
    };
    DiscardState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var cardId = _a.cardId, from = _a.from;
        this.game.clearPossible();
        dojo.query("#".concat(cardId)).addClass('pp_selected');
        this.game.clientUpdatePageTitle({
            text: _('Discard ${name}?'),
            args: {
                name: this.game.getCardInfo({ cardId: cardId }).name,
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () {
                return _this.game.takeAction({
                    action: 'discard',
                    data: {
                        cardId: cardId,
                        from: from,
                    },
                });
            },
        });
        this.game.addCancelButton();
    };
    DiscardState.prototype.updatePageTitle = function () {
        var text = _('${you} must discard a card');
        var fromCourt = this.from.length === 1 && this.from[0] === COURT;
        var fromHand = this.from.length === 1 && this.from[0] === HAND;
        if (fromCourt && this.loyalty) {
            text = _('${you} must discard a patriot from court');
        }
        else if (fromCourt) {
            text = _('${you} must discard a card from court');
        }
        else if (fromHand) {
            text = _('${you} must discard a card from hand');
        }
        this.game.clientUpdatePageTitle({
            text: text,
            args: {
                you: '${you}',
            },
        });
    };
    return DiscardState;
}());
var NegotiateBribeState = (function () {
    function NegotiateBribeState(game) {
        this.game = game;
    }
    NegotiateBribeState.prototype.onEnteringState = function (_a) {
        var bribee = _a.bribee, briber = _a.briber, maxAmount = _a.maxAmount, action = _a.action;
        this.action = action;
        this.isBribee = this.game.getPlayerId() === bribee.playerId;
        this.bribee = bribee;
        this.briber = briber;
        this.maxAmount = maxAmount;
        this.updateInterfaceInitialStep();
    };
    NegotiateBribeState.prototype.onLeavingState = function () { };
    NegotiateBribeState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: '${you} must accept or decline bribe of ${amount} rupee(s)',
            args: {
                amount: this.isBribee ? this.briber.currentAmount : this.bribee.currentAmount || this.maxAmount,
                you: '${you}',
            },
        });
        this.addBribeButtons();
        this.game.addSecondaryActionButton({
            id: 'decline_btn',
            text: _('Decline'),
            callback: function () { return _this.game.takeAction({ action: 'declineBribe' }); },
        });
    };
    NegotiateBribeState.prototype.addBribeButtons = function () {
        var _this = this;
        var currentOffer = this.isBribee ? this.briber.currentAmount : this.bribee.currentAmount || this.maxAmount;
        if (this.isBribee || (!this.isBribee && currentOffer <= (this.game.localState.activePlayer.rupees - this.game.getMinimumActionCost({ action: this.action })))) {
            this.game.addPrimaryActionButton({
                id: 'accept_btn',
                text: _('Accept'),
                callback: function () { return _this.game.takeAction({ action: 'negotiateBribe', data: {
                        amount: currentOffer,
                    }, }); },
            });
        }
        var values = Array.from({ length: this.maxAmount });
        console.log('maxAmount', this.maxAmount);
        var _loop_2 = function (i) {
            console.log('for loop i:', i);
            var isLowerThanOfferedByBriber = i < this_2.briber.currentAmount;
            console.log('isLowerThanOfferedByBriber', isLowerThanOfferedByBriber);
            var isHigherThanDemandedByBribee = i > (this_2.bribee.currentAmount || this_2.maxAmount);
            console.log('isHigherThanDemandedByBribee', isHigherThanDemandedByBribee);
            var isCurrentOffer = i === currentOffer;
            console.log('isCurrentOffer', isCurrentOffer);
            var briberCannotAfford = !this_2.isBribee && i > (this_2.game.localState.activePlayer.rupees - this_2.game.getMinimumActionCost({ action: this_2.action }));
            if (isLowerThanOfferedByBriber || isHigherThanDemandedByBribee || isCurrentOffer || briberCannotAfford) {
                return "continue";
            }
            this_2.game.addPrimaryActionButton({
                id: "ask_partial_waive_".concat(i, "_btn"),
                text: this_2.isBribee
                    ? dojo.string.substitute(_("Demand ".concat(i, " rupee(s)")), { i: i })
                    : dojo.string.substitute(_("Offer ".concat(i, " rupee(s)")), { i: i }),
                callback: function () {
                    return _this.game.takeAction({
                        action: 'negotiateBribe',
                        data: {
                            amount: i,
                        },
                    });
                },
            });
        };
        var this_2 = this;
        for (var i = this.maxAmount; i >= 0; i--) {
            _loop_2(i);
        }
        console.log('values', values);
    };
    return NegotiateBribeState;
}());
var PlaceRoadState = (function () {
    function PlaceRoadState(game) {
        this.game = game;
    }
    PlaceRoadState.prototype.onEnteringState = function (_a) {
        var region = _a.region;
        this.updateInterfaceInitialStep({ borders: region.borders });
    };
    PlaceRoadState.prototype.onLeavingState = function () { };
    PlaceRoadState.prototype.updateInterfaceInitialStep = function (_a) {
        var _this = this;
        var borders = _a.borders;
        this.game.clearPossible();
        borders.forEach(function (border) {
            _this.game.addPrimaryActionButton({
                id: "".concat(border, "_btn"),
                text: _(_this.game.gamedatas.staticData.borders[border].name),
                callback: function () {
                    _this.game.clearPossible();
                    _this.game.takeAction({ action: 'placeRoad', data: { border: border } });
                },
            });
        });
    };
    return PlaceRoadState;
}());
var PlaceSpyState = (function () {
    function PlaceSpyState(game) {
        this.game = game;
    }
    PlaceSpyState.prototype.onEnteringState = function (_a) {
        var regionId = _a.regionId, selectedPiece = _a.selectedPiece;
        this.selectedPiece = selectedPiece;
        this.updateInterfaceInitialStep({ regionId: regionId });
    };
    PlaceSpyState.prototype.onLeavingState = function () { };
    PlaceSpyState.prototype.updateInterfaceInitialStep = function (_a) {
        var regionId = _a.regionId;
        this.game.clearPossible();
        if (this.selectedPiece) {
            this.setPieceSelected();
        }
        this.setPlaceSpyCardsSelectable({ regionId: regionId });
    };
    PlaceSpyState.prototype.updateInterfaceConfirmPlaceSpy = function (_a) {
        var _this = this;
        var cardId = _a.cardId;
        this.game.clearPossible();
        dojo.query(".pp_card_in_court.pp_".concat(cardId)).addClass('pp_selected');
        if (this.selectedPiece) {
            this.setPieceSelected();
        }
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
    PlaceSpyState.prototype.setPieceSelected = function () {
        var node = dojo.byId(this.selectedPiece);
        if (node) {
            dojo.addClass(node, PP_SELECTED);
        }
    };
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
var PlayerActionsState = (function () {
    function PlayerActionsState(game) {
        this.game = game;
    }
    PlayerActionsState.prototype.onEnteringState = function (args) {
        this.game.updateLocalState(args);
        if (args.bribe !== null) {
            this.handleNegotiatedBribe(args.bribe);
            return;
        }
        this.updateInterfaceInitialStep();
    };
    PlayerActionsState.prototype.onLeavingState = function () {
        debug('Leaving PlayerActionsState');
    };
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
                    return _this.game.framework().setClientState(CLIENT_INITIAL_BRIBE_CHECK, {
                        args: {
                            cardId: cardId,
                            action: 'playCard',
                            next: function (_a) {
                                var bribe = _a.bribe;
                                return _this.game.framework().setClientState(CLIENT_PLAY_CARD, { args: { cardId: cardId, bribe: bribe } });
                            },
                        },
                    });
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
    PlayerActionsState.prototype.isCardFavoredSuit = function (_a) {
        var cardId = _a.cardId;
        var cardInfo = this.game.getCardInfo({ cardId: cardId });
        if (cardInfo.suit === this.game.objectManager.favoredSuit.get()) {
            return true;
        }
        if (cardInfo.specialAbility === SA_SAVVY_OPERATOR || cardInfo.specialAbility === SA_IRREGULARS) {
            return true;
        }
        var player = this.game.getCurrentPlayer();
        if (cardInfo.suit === MILITARY && player.getEventsZone().getAllItems().includes('card_105')) {
            return true;
        }
        return false;
    };
    PlayerActionsState.prototype.updateMainTitleTextActions = function () {
        var remainingActions = this.game.localState.remainingActions;
        var hasCardActions = this.activePlayerHasCardActions();
        var hasHandCards = this.currentPlayerHasHandCards();
        var hasFreeCardActions = this.activePlayerHasFreeCardActions();
        var titleText = '';
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
            titleText = _('${you} may perform a bonus action');
        }
        else if (remainingActions === 0 && !hasFreeCardActions) {
            titleText = _('${you} have no actions remaining');
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
        var rupees = this.game.playerManager.getPlayer({ playerId: this.game.getPlayerId() }).getRupees();
        return this.game.localState.activePlayer.court.cards.some(function (_a) {
            var id = _a.id, used = _a.used;
            var cardInfo = _this.game.gamedatas.staticData.cards[id];
            var cardHasActions = Object.keys(cardInfo.actions).length > 0;
            var hasEnoughRupees = rupees >= 2 || Object.values(cardInfo.actions).some(function (_a) {
                var type = _a.type;
                return CARD_ACTIONS_WITHOUT_COST.includes(type);
            });
            return used === 0 && cardHasActions && hasEnoughRupees;
        });
    };
    PlayerActionsState.prototype.activePlayerHasFreeCardActions = function () {
        var _this = this;
        return this.game.localState.activePlayer.court.cards.some(function (_a) {
            var id = _a.id, used = _a.used;
            var cardInfo = _this.game.gamedatas.staticData.cards[id];
            return used === 0 && _this.isCardFavoredSuit({ cardId: id });
            Object.keys(cardInfo.actions).length > 0;
        });
    };
    PlayerActionsState.prototype.currentPlayerHasHandCards = function () {
        var currentPlayerId = this.game.getPlayerId();
        return this.game.playerManager.getPlayer({ playerId: currentPlayerId }).getHandZone().getItemNumber() > 0;
    };
    PlayerActionsState.prototype.handleNegotiatedBribe = function (_a) {
        var action = _a.action, cardId = _a.cardId, briber = _a.briber;
        var bribe = {
            amount: briber.currentAmount,
            negotiated: true,
        };
        if (action === 'playCard') {
            this.game.framework().setClientState(CLIENT_PLAY_CARD, { args: { cardId: cardId, bribe: bribe } });
        }
        else if (Object.keys(cardActionClientStateMap).includes(action)) {
            this.game.framework().setClientState(cardActionClientStateMap[action], {
                args: {
                    cardId: cardId,
                    bribe: bribe,
                },
            });
        }
    };
    PlayerActionsState.prototype.setCardActionsSelectable = function () {
        var _this = this;
        var playerId = this.game.getPlayerId();
        dojo.query(".pp_card_in_court.pp_player_".concat(playerId)).forEach(function (node) {
            var _a, _b;
            var cardId = node.id;
            var used = ((_b = (_a = _this.game.localState.activePlayer.court.cards) === null || _a === void 0 ? void 0 : _a.find(function (card) { return card.id === cardId; })) === null || _b === void 0 ? void 0 : _b.used) === 1;
            if (!used &&
                (_this.game.localState.remainingActions > 0 || _this.isCardFavoredSuit({ cardId: cardId }))) {
                var rupees_1 = _this.game.playerManager.getPlayer({ playerId: playerId }).getRupees();
                dojo.map(node.children, function (child) {
                    if (dojo.hasClass(child, 'pp_card_action')) {
                        var cardAction_1 = child.id.split('_')[0];
                        var minActionCost = _this.game.getMinimumActionCost({ action: cardAction_1 });
                        console.log('cardAction', cardAction_1, 'minActionCost', minActionCost);
                        if (minActionCost === null || rupees_1 < minActionCost) {
                            return;
                        }
                        console.log('childId', child.id);
                        dojo.addClass(child, 'pp_selectable');
                        _this.game._connections.push(dojo.connect(child, 'onclick', _this, function (event) {
                            event.preventDefault();
                            event.stopPropagation();
                            _this.game.framework().setClientState(CLIENT_INITIAL_BRIBE_CHECK, {
                                args: {
                                    cardId: cardId,
                                    action: cardAction_1,
                                    next: function (_a) {
                                        var bribe = _a.bribe;
                                        return _this.game.framework().setClientState(cardActionClientStateMap[cardAction_1], { args: { cardId: cardId, bribe: bribe } });
                                    },
                                },
                            });
                        }));
                    }
                });
            }
        });
    };
    PlayerActionsState.prototype.getCardCost = function (_a) {
        var cardId = _a.cardId, column = _a.column;
        var baseCardCost = this.game.objectManager.favoredSuit.get() === MILITARY ? 2 : 1;
        var player = this.game.getCurrentPlayer();
        var cardInfo = this.game.getCardInfo({ cardId: cardId });
        if (cardInfo.type === 'courtCard' && cardInfo.region === HERAT && player.hasSpecialAbility({ specialAbility: SA_HERAT_INFLUENCE })) {
            return 0;
        }
        if (cardInfo.type === 'courtCard' && cardInfo.region === PERSIA && player.hasSpecialAbility({ specialAbility: SA_PERSIAN_INFLUENCE })) {
            return 0;
        }
        if (cardInfo.type === 'courtCard' &&
            cardInfo.loyalty === RUSSIAN &&
            player.hasSpecialAbility({ specialAbility: SA_RUSSIAN_INFLUENCE })) {
            return 0;
        }
        return column * baseCardCost;
    };
    PlayerActionsState.prototype.setMarketCardsSelectable = function () {
        var _this = this;
        dojo.query('.pp_market_card').forEach(function (node) {
            var cardId = node.id;
            var cardInfo = _this.game.getCardInfo({ cardId: cardId });
            if (cardInfo.type === 'eventCard' && cardInfo.purchased.effect === ECE_PUBLIC_WITHDRAWAL) {
                return;
            }
            var cost = _this.getCardCost({ cardId: cardId, column: Number(node.parentElement.id.split('_')[3]) });
            if (cost <= _this.game.localState.activePlayer.rupees && !_this.game.localState.usedCards.includes(cardId)) {
                dojo.addClass(node, 'pp_selectable');
                _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () {
                    return _this.game.framework().setClientState(CLIENT_PURCHASE_CARD, { args: { cardId: cardId, cost: cost } });
                }));
            }
        });
    };
    PlayerActionsState.prototype.setCardActionSelected = function (_a) {
        var cardId = _a.cardId, action = _a.action;
        var node = dojo.byId("".concat(action, "_").concat(cardId));
        if (node) {
            dojo.addClass(node, PP_SELECTED);
        }
    };
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
var ResolveEventOtherPersuasiveMethodsState = (function () {
    function ResolveEventOtherPersuasiveMethodsState(game) {
        this.game = game;
    }
    ResolveEventOtherPersuasiveMethodsState.prototype.onEnteringState = function (_props) {
        this.updateInterfaceInitialStep();
    };
    ResolveEventOtherPersuasiveMethodsState.prototype.onLeavingState = function () { };
    ResolveEventOtherPersuasiveMethodsState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: '${you} must select a player to exchange your hand with',
            args: {
                you: '${you}',
            },
        });
        var players = this.game.playerManager.getPlayers();
        players
            .filter(function (player) { return player.getPlayerId() !== _this.game.getPlayerId(); })
            .forEach(function (player) {
            _this.game.addPlayerButton({
                callback: function () { return _this.updateInterfaceConfirmPlayer({ player: player }); },
                player: player,
            });
        });
    };
    ResolveEventOtherPersuasiveMethodsState.prototype.updateInterfaceConfirmPlayer = function (_a) {
        var _this = this;
        var player = _a.player;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: 'Choose ${player_name}?',
            args: {
                player_name: player.getName(),
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () {
                return _this.game.takeAction({
                    action: 'eventCardOtherPersuasiveMethods',
                    data: {
                        playerId: player.getPlayerId(),
                    },
                });
            },
        });
        this.game.addCancelButton();
    };
    return ResolveEventOtherPersuasiveMethodsState;
}());
var ResolveEventPashtunwaliValuesState = (function () {
    function ResolveEventPashtunwaliValuesState(game) {
        this.game = game;
    }
    ResolveEventPashtunwaliValuesState.prototype.onEnteringState = function (_props) {
        this.updateInterfaceInitialStep();
    };
    ResolveEventPashtunwaliValuesState.prototype.onLeavingState = function () { };
    ResolveEventPashtunwaliValuesState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: '${you} must select a suit to favor',
            args: {
                you: '${you}',
            },
        });
        SUITS.forEach(function (suit) {
            var name = _this.game.gamedatas.staticData.suits[suit].name;
            _this.game.addPrimaryActionButton({
                id: "".concat(suit, "_btn"),
                text: _(name),
                callback: function () { return _this.updateInterfaceConfirmSuit({ suit: suit, name: name }); },
            });
        });
    };
    ResolveEventPashtunwaliValuesState.prototype.updateInterfaceConfirmSuit = function (_a) {
        var _this = this;
        var suit = _a.suit, name = _a.name;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: 'Choose ${suitName}?',
            args: {
                suitName: name,
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () {
                return _this.game.takeAction({
                    action: 'eventCardPashtunwaliValues',
                    data: {
                        suit: suit,
                    },
                });
            },
        });
        this.game.addCancelButton();
    };
    return ResolveEventPashtunwaliValuesState;
}());
var ResolveEventRebukeState = (function () {
    function ResolveEventRebukeState(game) {
        this.game = game;
    }
    ResolveEventRebukeState.prototype.onEnteringState = function (_props) {
        this.updateInterfaceInitialStep();
    };
    ResolveEventRebukeState.prototype.onLeavingState = function () { };
    ResolveEventRebukeState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clientUpdatePageTitle({
            text: '${you} must select a region',
            args: {
                you: '${you}',
            },
        });
        this.game.map.setSelectable();
        REGIONS.forEach(function (regionId) {
            var element = document.getElementById("pp_region_".concat(regionId));
            if (element) {
                element.classList.add('pp_selectable');
                _this.game._connections.push(dojo.connect(element, 'onclick', _this, function () { return _this.updateInterfaceRegionSelected({ regionId: regionId }); }));
            }
        });
    };
    ResolveEventRebukeState.prototype.updateInterfaceRegionSelected = function (_a) {
        var _this = this;
        var regionId = _a.regionId;
        this.game.clearPossible();
        this.game.map.setSelectable();
        var element = document.getElementById("pp_region_".concat(regionId));
        if (element) {
            element.classList.add(PP_SELECTED);
        }
        this.game.clientUpdatePageTitle({
            text: 'Remove all tribes and armies from ${regionName}?',
            args: {
                regionName: this.game.gamedatas.staticData.regions[regionId].name,
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () {
                return _this.game.takeAction({
                    action: 'eventCardRebuke',
                    data: {
                        regionId: regionId,
                    },
                });
            },
        });
        this.game.addCancelButton();
    };
    return ResolveEventRebukeState;
}());
var ResolveEventRumor = (function () {
    function ResolveEventRumor(game) {
        this.game = game;
    }
    ResolveEventRumor.prototype.onEnteringState = function (_props) {
        this.updateInterfaceInitialStep();
    };
    ResolveEventRumor.prototype.onLeavingState = function () { };
    ResolveEventRumor.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: '${you} must select a player',
            args: {
                you: '${you}',
            },
        });
        var players = this.game.playerManager.getPlayers();
        players.forEach(function (player) {
            _this.game.addPlayerButton({
                callback: function () { return _this.updateInterfaceConfirmPlayer({ player: player }); },
                player: player,
            });
        });
    };
    ResolveEventRumor.prototype.updateInterfaceConfirmPlayer = function (_a) {
        var _this = this;
        var player = _a.player;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: 'Choose ${player_name}?',
            args: {
                player_name: player.getName(),
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () {
                return _this.game.takeAction({
                    action: 'eventCardRumor',
                    data: {
                        playerId: player.getPlayerId(),
                    },
                });
            },
        });
        this.game.addCancelButton();
    };
    return ResolveEventRumor;
}());
var SASafeHouseState = (function () {
    function SASafeHouseState(game) {
        this.game = game;
    }
    SASafeHouseState.prototype.onEnteringState = function (props) {
        debug('safeHouseProps', props);
        this.updateInterfaceInitialStep();
    };
    SASafeHouseState.prototype.onLeavingState = function () { };
    SASafeHouseState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        var player = this.game.getCurrentPlayer();
        var safeHouseCards = player.getCourtCardsWithSpecialAbility({ specialAbility: SA_SAFE_HOUSE });
        if (safeHouseCards.length === 1) {
            this.updateInterfaceConfirmSafeHouse({ card: safeHouseCards[0], showCancelButton: false });
        }
        else {
            this.game.clientUpdatePageTitle({
                text: _('${you} may select a card to place a spy on'),
                args: {
                    you: '${you}',
                },
            });
            safeHouseCards.forEach(function (card) {
                var node = dojo.byId(card.id);
                dojo.addClass(node, PP_SELECTABLE);
                _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () { return _this.updateInterfaceConfirmSafeHouse({ card: card, showCancelButton: true }); }));
            });
            this.game.addDangerActionButton({
                id: 'do_not_place_btn',
                text: _('Do not place spy'),
                callback: function () { return _this.game.takeAction({ action: 'specialAbilitySafeHouse', data: { cardId: null } }); },
            });
        }
    };
    SASafeHouseState.prototype.updateInterfaceConfirmSafeHouse = function (_a) {
        var _this = this;
        var card = _a.card, showCancelButton = _a.showCancelButton;
        this.game.clearPossible();
        var node = dojo.byId(card.id);
        dojo.addClass(node, PP_SELECTED);
        this.game.clientUpdatePageTitle({
            text: _('Place spy on ${cardName}?'),
            args: {
                cardName: card.name,
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.game.takeAction({ action: 'specialAbilitySafeHouse', data: { cardId: card.id } }); },
        });
        if (showCancelButton) {
            this.game.addCancelButton();
        }
        else {
            this.game.addDangerActionButton({
                id: 'do_not_place_btn',
                text: _('Do not place spy'),
                callback: function () { return _this.game.takeAction({ action: 'specialAbilitySafeHouse', data: { cardId: null } }); },
            });
        }
    };
    return SASafeHouseState;
}());
var SelectPieceState = (function () {
    function SelectPieceState(game) {
        this.game = game;
    }
    SelectPieceState.prototype.onEnteringState = function (_a) {
        var availablePieces = _a.availablePieces;
        this.availablePieces = availablePieces;
        this.updateInterfaceInitialStep();
    };
    SelectPieceState.prototype.onLeavingState = function () { };
    SelectPieceState.prototype.updateInterfaceInitialStep = function () {
        this.game.clearPossible();
        this.setPiecesSelectable();
    };
    SelectPieceState.prototype.updateInterfaceConfirm = function (_a) {
        var _this = this;
        var pieceId = _a.pieceId;
        this.game.clearPossible();
        var node = dojo.byId(pieceId);
        if (node) {
            dojo.addClass(node, PP_SELECTED);
        }
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.game.takeAction({ action: 'selectPiece', data: { pieceId: pieceId } }); },
        });
        this.game.addCancelButton();
    };
    SelectPieceState.prototype.setPiecesSelectable = function () {
        var _this = this;
        this.availablePieces.forEach(function (pieceId) {
            console.log('pieceId', pieceId);
            var node = dojo.byId(pieceId);
            if (node) {
                dojo.addClass(node, PP_SELECTABLE);
                _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () { return _this.updateInterfaceConfirm({ pieceId: pieceId }); }));
            }
        });
    };
    return SelectPieceState;
}());
var SetupState = (function () {
    function SetupState(game) {
        this.game = game;
    }
    SetupState.prototype.onEnteringState = function () {
        this.updateInterfaceInitialStep();
        console.log('onEntering setup');
    };
    SetupState.prototype.onLeavingState = function () { };
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
var StartOfTurnAbilitiesState = (function () {
    function StartOfTurnAbilitiesState(game) {
        this.game = game;
    }
    StartOfTurnAbilitiesState.prototype.onEnteringState = function (args) {
        debug('Entering StartOfTurnAbilitiesState', args);
        var specialAbility = args.specialAbility;
        this.specialAbility = specialAbility;
        this.updateInterfaceInitialStep();
    };
    StartOfTurnAbilitiesState.prototype.onLeavingState = function () {
        debug('Leaving StartOfTurnAbilitiesState');
    };
    StartOfTurnAbilitiesState.prototype.updateInterfaceInitialStep = function () {
        var _this = this;
        this.game.clearPossible();
        this.game.clientUpdatePageTitle({
            text: _('${you} may place a spy on any ${regionName} court card without a spy'),
            args: {
                you: '${you}',
                regionName: this.getRegionNameForSpecialAbility(),
            },
        });
        this.game.addPrimaryActionButton({
            id: 'skip_btn',
            text: _('Skip'),
            callback: function () { return _this.game.takeAction({ action: 'specialAbilityPlaceSpyStartOfTurn', data: { skip: true } }); },
        });
        this.setCourtCardsSelectable();
    };
    StartOfTurnAbilitiesState.prototype.updateInterfaceConfirmPlaceSpy = function (_a) {
        var _this = this;
        var cardId = _a.cardId;
        this.game.clearPossible();
        dojo.query(".pp_card_in_court.pp_".concat(cardId)).addClass('pp_selected');
        this.game.clientUpdatePageTitle({
            text: _('Place a spy on ${cardName}?'),
            args: {
                cardName: this.game.getCardInfo({ cardId: cardId }).name,
            },
        });
        this.game.addPrimaryActionButton({
            id: 'confirm_btn',
            text: _('Confirm'),
            callback: function () { return _this.game.takeAction({ action: 'specialAbilityPlaceSpyStartOfTurn', data: { cardId: cardId } }); },
        });
        this.game.addDangerActionButton({
            id: 'cancel_btn',
            text: _('Cancel'),
            callback: function () { return _this.game.onCancel(); },
        });
    };
    StartOfTurnAbilitiesState.prototype.getRegionNameForSpecialAbility = function () {
        switch (this.specialAbility) {
            case SA_BLACKMAIL_HERAT:
                return this.game.gamedatas.staticData.regions[HERAT].name;
            case SA_BLACKMAIL_KANDAHAR:
                return this.game.gamedatas.staticData.regions[KANDAHAR].name;
            default:
                return '';
        }
    };
    StartOfTurnAbilitiesState.prototype.setCourtCardsSelectable = function () {
        var _this = this;
        var region = this.specialAbility === SA_BLACKMAIL_HERAT ? HERAT : KANDAHAR;
        dojo.query(".pp_card_in_court").forEach(function (node, index) {
            var _a;
            var cardId = node.id;
            var cardInfo = _this.game.getCardInfo({ cardId: cardId });
            if (cardInfo.region === region && (((_a = _this.game.spies[cardId]) === null || _a === void 0 ? void 0 : _a.getAllItems()) || []).length === 0) {
                dojo.addClass(node, 'pp_selectable');
                _this.game._connections.push(dojo.connect(node, 'onclick', _this, function () { return _this.updateInterfaceConfirmPlaceSpy({ cardId: cardId }); }));
            }
        });
    };
    return StartOfTurnAbilitiesState;
}());
var NotificationManager = (function () {
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
            ['battle', 250],
            ['betray', 250],
            ['build', 250],
            ['cardAction', 1],
            ['changeRuler', 1],
            ['changeFavoredSuit', 250],
            ['changeLoyalty', 1],
            ['clearTurn', 1],
            ['drawMarketCard', 1000],
            ['discard', 1000],
            ['discardFromMarket', 1000],
            ['discardPrizes', 1000],
            ['exchangeHand', 100],
            ['dominanceCheckScores', 1],
            ['dominanceCheckReturnCoalitionBlocks', 250],
            ['moveCard', 1000],
            ['moveToken', 1000],
            ['payBribe', 1],
            ['payRupeesToMarket', 100],
            ['publicWithdrawal', 1000],
            ['purchaseCard', 2000],
            ['playCard', 2000],
            ['shiftMarket', 250],
            ['replaceHand', 250],
            ['returnRupeesToSupply', 250],
            ['returnSpies', 1000],
            ['smallRefreshHand', 1],
            ['smallRefreshInterface', 1],
            ['declinePrize', 250],
            ['takePrize', 250],
            ['takeRupeesFromSupply', 250],
            ['taxMarket', 250],
            ['taxPlayer', 250],
            ['updateCourtCardStates', 1],
            ['updateInfluence', 1],
            ['updatePlayerCounts', 1],
            ['log', 1],
        ];
        notifs.forEach(function (notif) {
            _this.subscriptions.push(dojo.subscribe(notif[0], _this, "notif_".concat(notif[0])));
            _this.game.framework().notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    NotificationManager.prototype.notif_battle = function (notif) {
        debug('notif_battle', notif);
    };
    NotificationManager.prototype.notif_betray = function (notif) {
        var _this = this;
        debug('notif_betray', notif);
        var _a = notif.args, playerId = _a.playerId, rupeesOnCards = _a.rupeesOnCards;
        rupeesOnCards.forEach(function (item, index) {
            var row = item.row, column = item.column, rupeeId = item.rupeeId;
            _this.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: -1 });
            _this.game.market.placeRupeeOnCard({ row: row, column: column, rupeeId: rupeeId, fromDiv: "rupees_".concat(playerId) });
        });
    };
    NotificationManager.prototype.notif_build = function (notif) {
        var _this = this;
        debug('notif_build', notif);
        var _a = notif.args, playerId = _a.playerId, rupeesOnCards = _a.rupeesOnCards;
        rupeesOnCards.forEach(function (item, index) {
            var row = item.row, column = item.column, rupeeId = item.rupeeId;
            _this.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: -1 });
            _this.game.market.placeRupeeOnCard({ row: row, column: column, rupeeId: rupeeId, fromDiv: "rupees_".concat(playerId) });
        });
    };
    NotificationManager.prototype.notif_cardAction = function (notif) {
        console.log('notif_cardAction', notif);
    };
    NotificationManager.prototype.notif_changeFavoredSuit = function (notif) {
        console.log('notif_changeFavoredSuit', notif);
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
    NotificationManager.prototype.notif_changeLoyalty = function (notif) {
        debug('notif_changeLoyalty', notif.args);
        var _a = notif.args, argsPlayerId = _a.playerId, coalition = _a.coalition;
        var playerId = Number(argsPlayerId);
        this.getPlayer({ playerId: playerId }).updatePlayerLoyalty({ coalition: coalition });
        var player = this.getPlayer({ playerId: playerId });
        if (player.getInfluence() === 0) {
            player.setCounter({ counter: 'influence', value: 1 });
        }
    };
    NotificationManager.prototype.notif_changeRuler = function (notif) {
        var args = notif.args;
        console.log('notif_changeRuler', args);
        var oldRuler = args.oldRuler, newRuler = args.newRuler, region = args.region;
        var from = oldRuler === null
            ? this.game.map.getRegion({ region: region }).getRulerZone()
            : this.game.playerManager.getPlayer({ playerId: oldRuler }).getRulerTokensZone();
        var to = newRuler === null
            ? this.game.map.getRegion({ region: region }).getRulerZone()
            : this.game.playerManager.getPlayer({ playerId: newRuler }).getRulerTokensZone();
        this.game.map.getRegion({ region: region }).setRuler({ playerId: newRuler });
        this.game.move({
            id: "pp_ruler_token_".concat(region),
            from: from,
            to: to,
        });
    };
    NotificationManager.prototype.notif_clearTurn = function (notif) {
        var args = notif.args;
        var notifIds = args.notifIds;
        console.log('notif_clearTurn', args);
        console.log('notif_clearTurn notifIds', notifIds);
        this.game.cancelLogs(notifIds);
    };
    NotificationManager.prototype.notif_declinePrize = function (notif) {
        debug('notif_declinePrize', notif);
        this.game.clearPossible();
        var cardId = notif.args.cardId;
        discardCardAnimation({ cardId: cardId, to: DISCARD, game: this.game });
    };
    NotificationManager.prototype.notif_takePrize = function (notif) {
        debug('notif_takePrize', notif);
        this.game.clearPossible();
        var _a = notif.args, cardId = _a.cardId, playerId = _a.playerId;
        this.game.playerManager.getPlayer({ playerId: playerId }).takePrize({ cardId: cardId });
    };
    NotificationManager.prototype.notif_discard = function (notif) {
        debug('notif_discard', notif);
        this.game.clearPossible();
        var _a = notif.args, cardId = _a.cardId, from = _a.from, playerId = _a.playerId, to = _a.to;
        var player = this.getPlayer({ playerId: playerId });
        if (from === COURT) {
            var cardInfo = this.game.getCardInfo({ cardId: cardId });
            player.discardCourtCard({ cardId: cardId, to: to });
            player.incCounter({ counter: cardInfo.suit, value: cardInfo.rank * -1 });
        }
        else if (from === HAND) {
            player.discardHandCard({ cardId: cardId, to: to });
            player.incCounter({ counter: 'cards', value: -1 });
        }
    };
    NotificationManager.prototype.notif_returnSpies = function (notif) {
        var _this = this;
        debug('notif_discard', notif);
        this.game.clearPossible();
        var moves = notif.args.moves;
        moves.forEach(function (move) {
            var tokenId = move.tokenId, from = move.from, to = move.to, weight = move.weight;
            var fromZone = _this.game.getZoneForLocation({ location: from });
            var toZone = _this.game.getZoneForLocation({ location: to });
            _this.game.move({
                id: tokenId,
                from: fromZone,
                to: toZone,
                weight: weight,
            });
            var spyOwnerId = Number(tokenId.split('_')[1]);
            _this.getPlayer({ playerId: spyOwnerId }).incCounter({ counter: 'cylinders', value: -1 });
        });
    };
    NotificationManager.prototype.notif_discardFromMarket = function (notif) {
        debug('notif_discardFromMarket', notif);
        this.game.clearPossible();
        var _a = notif.args, from = _a.from, cardId = _a.cardId, to = _a.to;
        var splitFrom = from.split('_');
        var row = Number(splitFrom[1]);
        var column = Number(splitFrom[2]);
        if (to === 'discard') {
            this.game.market.discardCard({ cardId: cardId, row: row, column: column });
        }
        else if (to === 'active_events') {
            this.game.move({
                id: cardId,
                from: this.game.market.getMarketCardZone({ row: row, column: column }),
                to: this.game.activeEvents,
            });
        }
    };
    NotificationManager.prototype.notif_discardPrizes = function (notif) {
        debug('notif_discardPrizes', notif);
        this.game.clearPossible();
        var playerId = Number(notif.args.playerId);
        var player = this.getPlayer({ playerId: playerId });
        notif.args.prizes.forEach(function (prize) {
            player.discardPrize({ cardId: prize.id });
            player.incCounter({ counter: 'influence', value: -1 });
        });
    };
    NotificationManager.prototype.notif_dominanceCheckScores = function (notif) {
        var _this = this;
        console.log('notif_dominanceCheck', notif);
        var scores = notif.args.scores;
        Object.keys(scores).forEach(function (playerId) {
            console.log('typeof', typeof playerId);
            _this.game.framework().scoreCtrl[playerId].toValue(scores[playerId].newScore);
            _this.game.move({
                id: "vp_cylinder_".concat(playerId),
                from: _this.game.objectManager.vpTrack.getZone("".concat(scores[playerId].currentScore)),
                to: _this.game.objectManager.vpTrack.getZone("".concat(scores[playerId].newScore)),
            });
        });
    };
    NotificationManager.prototype.notif_dominanceCheckReturnCoalitionBlocks = function (notif) {
        var _this = this;
        var moves = notif.args.moves;
        console.log('moves', moves);
        (moves || []).forEach(function (move) {
            var tokenId = move.tokenId, from = move.from, to = move.to, weight = move.weight;
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
                weight: weight,
            });
        });
    };
    NotificationManager.prototype.notif_exchangeHand = function (notif) {
        var _this = this;
        debug('notif_exchangeHand', notif.args);
        Object.entries(notif.args.newHandCounts).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            console.log(typeof key);
            var playerId = Number(key);
            if (playerId === _this.game.getPlayerId()) {
                return;
            }
            var player = _this.getPlayer({ playerId: Number(key) });
            player.toValueCounter({ counter: 'cards', value: value });
        });
    };
    NotificationManager.prototype.notif_moveCard = function (notif) {
        var _this = this;
        debug('notif_moveCard', notif.args);
        var _a = notif.args, moves = _a.moves, action = _a.action;
        moves.forEach(function (move) {
            var cardId = move.tokenId, from = move.from, to = move.to;
            var fromZone = _this.game.getZoneForLocation({ location: from });
            switch (action) {
                case 'MOVE_EVENT':
                    _this.game.playerManager.getPlayer({ playerId: Number(to.split('_')[1]) }).addEvent({ cardId: cardId, from: fromZone });
                    _this.game.playerManager.getPlayer({ playerId: Number(from.split('_')[1]) }).checkEventContainerHeight();
                    break;
                default:
                    debug('unknown action for moveCard');
            }
        });
    };
    NotificationManager.prototype.notif_moveToken = function (notif) {
        var _this = this;
        debug('notif_moveToken', notif);
        notif.args.moves.forEach(function (move) {
            var tokenId = move.tokenId, from = move.from, to = move.to, weight = move.weight;
            if (from === to) {
                return;
            }
            var fromZone = _this.game.getZoneForLocation({ location: from });
            var toZone = _this.game.getZoneForLocation({ location: to });
            if (_this.game.framework().isCurrentPlayerActive() &&
                !fromZone.getAllItems().includes(tokenId) &&
                ((from.startsWith('armies') && to.startsWith('armies')) ||
                    (from.startsWith('spies') && to.startsWith('spies')) ||
                    (from.startsWith('tribes') && to.startsWith('tribes')))) {
                debug('no need to execute move');
                return;
            }
            var addClass = [];
            var removeClass = [];
            if (to.startsWith('armies')) {
                addClass.push('pp_army');
            }
            else if (to.startsWith('roads')) {
                addClass.push('pp_road');
            }
            else if (to.startsWith('blocks')) {
                addClass.push('pp_coalition_block');
            }
            if (from.startsWith('blocks')) {
                removeClass.push('pp_coalition_block');
            }
            else if (from.startsWith('armies') && !to.startsWith('armies')) {
                removeClass.push('pp_army');
            }
            else if (from.startsWith('roads')) {
                removeClass.push('pp_road');
            }
            _this.game.move({
                id: tokenId,
                from: fromZone,
                to: toZone,
                addClass: addClass,
                removeClass: removeClass,
                weight: weight,
            });
        });
    };
    NotificationManager.prototype.notif_payBribe = function (notif) {
        var args = notif.args;
        console.log('notif_payBribe', args);
        var briberId = args.briberId, rulerId = args.rulerId, rupees = args.rupees;
        this.getPlayer({ playerId: briberId }).payToPlayer({ playerId: rulerId, rupees: rupees });
    };
    NotificationManager.prototype.notif_payRupeesToMarket = function (notif) {
        var _this = this;
        debug('notif_payRupeesToMarket', notif.args);
        var _a = notif.args, playerId = _a.playerId, rupeesOnCards = _a.rupeesOnCards;
        rupeesOnCards.forEach(function (item, index) {
            var row = item.row, column = item.column, rupeeId = item.rupeeId;
            _this.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: -1 });
            _this.game.market.placeRupeeOnCard({ row: row, column: column, rupeeId: rupeeId, fromDiv: "rupees_".concat(playerId) });
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
    NotificationManager.prototype.notif_publicWithdrawal = function (notif) {
        debug('notif_publicWithdrawal', notif);
        var marketLocation = notif.args.marketLocation;
        var row = Number(marketLocation.split('_')[1]);
        var column = Number(marketLocation.split('_')[2]);
        this.game.market.getMarketRupeesZone({ row: row, column: column }).removeAll();
    };
    NotificationManager.prototype.notif_purchaseCard = function (notif) {
        var _this = this;
        console.log('notif_purchaseCard', notif);
        var _a = notif.args, marketLocation = _a.marketLocation, newLocation = _a.newLocation, rupeesOnCards = _a.rupeesOnCards, playerId = _a.playerId, receivedRupees = _a.receivedRupees;
        this.game.clearPossible();
        var row = Number(marketLocation.split('_')[1]);
        var col = Number(marketLocation.split('_')[2]);
        rupeesOnCards.forEach(function (item, index) {
            var row = item.row, column = item.column, rupeeId = item.rupeeId;
            _this.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: -1 });
            _this.game.market.placeRupeeOnCard({ row: row, column: column, rupeeId: rupeeId, fromDiv: "rupees_".concat(playerId) });
        });
        this.game.market.removeRupeesFromCard({ row: row, column: col, to: "rupees_".concat(playerId) });
        this.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: receivedRupees });
        var cardId = notif.args.card.id;
        if (newLocation.startsWith('events_')) {
            this.getPlayer({ playerId: playerId }).addEvent({ cardId: cardId, from: this.game.market.getMarketCardZone({ row: row, column: col }) });
        }
        else if (newLocation == 'discard') {
            this.game.market.getMarketCardZone({ row: row, column: col }).removeFromZone(cardId, false);
            discardCardAnimation({ cardId: cardId, game: this.game });
        }
        else {
            this.getPlayer({ playerId: playerId }).addCardToHand({ cardId: cardId, from: this.game.market.getMarketCardZone({ row: row, column: col }) });
        }
    };
    NotificationManager.prototype.notif_shiftMarket = function (notif) {
        var _this = this;
        console.log('notif_shiftMarket', notif);
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
    };
    NotificationManager.prototype.notif_drawMarketCard = function (notif) {
        debug('notif_drawMarketCard', notif.args);
        var _a = notif.args, cardId = _a.cardId, to = _a.to;
        var row = Number(to.split('_')[1]);
        var column = Number(to.split('_')[2]);
        this.game.market.addCardFromDeck({
            to: {
                row: row,
                column: column,
            },
            cardId: cardId,
        });
    };
    NotificationManager.prototype.notif_replaceHand = function (notif) {
        debug('notif_replaceHand', notif.args);
        var hand = notif.args.hand;
        var player = this.game.getCurrentPlayer();
        var handZone = player.getHandZone();
        handZone.removeAll();
        hand.forEach(function (card) {
            player.addCardToHand({ cardId: card.id });
        });
        player.toValueCounter({ counter: 'cards', value: hand.length });
    };
    NotificationManager.prototype.notif_returnRupeesToSupply = function (notif) {
        debug('notif_returnRupeesToSupply', notif.args);
        var _a = notif.args, playerId = _a.playerId, amount = _a.amount;
        this.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: -amount });
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
    };
    NotificationManager.prototype.notif_takeRupeesFromSupply = function (notif) {
        debug('notif_takeRupeesFromSupply', notif.args);
        var _a = notif.args, playerId = _a.playerId, amount = _a.amount;
        this.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: amount });
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
    NotificationManager.prototype.notif_taxMarket = function (notif) {
        var _this = this;
        debug('notif_taxMarket', notif.args);
        var _a = notif.args, selectedRupees = _a.selectedRupees, playerId = _a.playerId, amount = _a.amount;
        selectedRupees.forEach(function (rupee) {
            var row = rupee.row, column = rupee.column, rupeeId = rupee.rupeeId;
            _this.game.market.removeSingleRupeeFromCard({ row: row, column: column, rupeeId: rupeeId, to: "rupees_".concat(playerId) });
        });
        this.getPlayer({ playerId: playerId }).incCounter({ counter: 'rupees', value: amount });
    };
    NotificationManager.prototype.notif_taxPlayer = function (notif) {
        debug('notif_taxPlayer', notif.args);
        var _a = notif.args, playerId = _a.playerId, taxedPlayerId = _a.taxedPlayerId, amount = _a.amount;
        var player = this.getPlayer({ playerId: taxedPlayerId });
        player.removeTaxCounter();
        player.payToPlayer({ playerId: playerId, rupees: amount });
    };
    NotificationManager.prototype.notif_updateCourtCardStates = function (notif) {
        debug('notif_updateCourtCardStates', notif.args);
        var _a = notif.args, playerId = _a.playerId, cardStates = _a.cardStates;
        var player = this.getPlayer({ playerId: playerId });
        cardStates.forEach(function (_a, index) {
            var cardId = _a.cardId, state = _a.state;
            var item = player.getCourtZone().items.find(function (item) { return item.id === cardId; });
            if (item) {
                item.weight = state;
            }
        });
        this.getPlayer({ playerId: playerId }).getCourtZone().updateDisplay();
    };
    NotificationManager.prototype.notif_updateInfluence = function (_a) {
        var _this = this;
        var args = _a.args;
        debug('notif_updateInfluence', args);
        args.updates.forEach(function (_a) {
            var playerId = _a.playerId, value = _a.value;
            _this.getPlayer({ playerId: Number(playerId) }).toValueCounter({ counter: 'influence', value: value });
        });
    };
    NotificationManager.prototype.notif_log = function (notif) {
        console.log('notif_log', notif.args);
    };
    return NotificationManager;
}());
var PaxPamir = (function () {
    function PaxPamir() {
        this.defaultWeightZone = 0;
        this.playerEvents = {};
        this.activeEvents = new ebg.zone();
        this.spies = {};
        this.playerCounts = {};
        this._notif_uid_to_log_id = {};
        this._last_notif = null;
        console.log('paxpamireditiontwo constructor');
    }
    PaxPamir.prototype.setup = function (gamedatas) {
        var _a;
        var _this = this;
        dojo.place("<div id='customActions' style='display:inline-block'></div>", $('generalactions'), 'after');
        this.gamedatas = gamedatas;
        debug('gamedatas', gamedatas);
        this._connections = [];
        this.localState = gamedatas.localState;
        this.activeStates = (_a = {},
            _a[CLIENT_CARD_ACTION_BATTLE] = new ClientCardActionBattleState(this),
            _a[CLIENT_CARD_ACTION_BETRAY] = new ClientCardActionBetrayState(this),
            _a[CLIENT_CARD_ACTION_BUILD] = new ClientCardActionBuildState(this, false),
            _a[CLIENT_CARD_ACTION_GIFT] = new ClientCardActionGiftState(this),
            _a[CLIENT_CARD_ACTION_MOVE] = new ClientCardActionMoveState(this),
            _a[CLIENT_CARD_ACTION_TAX] = new ClientCardActionTaxState(this),
            _a[CLIENT_INITIAL_BRIBE_CHECK] = new ClientInitialBribeCheckState(this),
            _a[CLIENT_PLAY_CARD] = new ClientPlayCardState(this),
            _a[CLIENT_PURCHASE_CARD] = new ClientPurchaseCardState(this),
            _a.acceptPrize = new AcceptPrizeState(this),
            _a.discard = new DiscardState(this),
            _a.eventCardPashtunwaliValues = new ResolveEventPashtunwaliValuesState(this),
            _a.eventCardOtherPersuasiveMethods = new ResolveEventOtherPersuasiveMethodsState(this),
            _a.eventCardRumor = new ResolveEventRumor(this),
            _a.eventCardRebuke = new ResolveEventRebukeState(this),
            _a.negotiateBribe = new NegotiateBribeState(this),
            _a.placeRoad = new PlaceRoadState(this),
            _a.placeSpy = new PlaceSpyState(this),
            _a.playerActions = new PlayerActionsState(this),
            _a.setup = new SetupState(this),
            _a.selectPiece = new SelectPieceState(this),
            _a.specialAbilityInfrastructure = new ClientCardActionBuildState(this, true),
            _a.specialAbilitySafeHouse = new SASafeHouseState(this),
            _a.startOfTurnAbilities = new StartOfTurnAbilitiesState(this),
            _a);
        this.activeEvents.create(this, 'pp_active_events', CARD_WIDTH, CARD_HEIGHT);
        this.activeEvents.instantaneous = true;
        this.activeEvents.item_margin = 16;
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
        this.notificationManager.setupNotifications();
        dojo.connect(this.framework().notifqueue, 'addToLog', function () {
            _this.checkLogCancel(_this._last_notif == null ? null : _this._last_notif.msg.uid);
            _this.addLogClass();
        });
        debug('Ending game setup');
    };
    PaxPamir.prototype.onEnteringState = function (stateName, args) {
        console.log('Entering state: ' + stateName, args);
        if (this.framework().isCurrentPlayerActive() && this.activeStates[stateName]) {
            this.activeStates[stateName].onEnteringState(args.args);
        }
    };
    PaxPamir.prototype.onLeavingState = function (stateName) {
        console.log('Leaving state: ' + stateName);
        this.clearPossible();
    };
    PaxPamir.prototype.onUpdateActionButtons = function (stateName, args) {
    };
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
    PaxPamir.prototype.addPlayerButton = function (_a) {
        var player = _a.player, callback = _a.callback;
        this.addPrimaryActionButton({
            id: "select_".concat(player.getPlayerId()),
            text: player.getName(),
            callback: callback,
            extraClasses: "pp_player_button pp_player_color_".concat(player.getColor()),
        });
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
        this.map.clearSelectable();
    };
    PaxPamir.prototype.getCardInfo = function (_a) {
        var cardId = _a.cardId;
        return this.gamedatas.staticData.cards[cardId];
    };
    PaxPamir.prototype.getPlayerId = function () {
        return Number(this.framework().player_id);
    };
    PaxPamir.prototype.getCurrentPlayer = function () {
        return this.playerManager.getPlayer({ playerId: this.getPlayerId() });
    };
    PaxPamir.prototype.getMinimumActionCost = function (_a) {
        var action = _a.action;
        if ([BATTLE, MOVE, TAX, PLAY_CARD].includes(action)) {
            return 0;
        }
        else if ([BETRAY, BUILD].includes(action)) {
            return 2;
        }
        else {
            return this.getCurrentPlayer().getLowestAvailableGift();
        }
    };
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
    PaxPamir.prototype.setCourtCardsSelectable = function (_a) {
        var _this = this;
        var callback = _a.callback, loyalty = _a.loyalty, region = _a.region, suit = _a.suit;
        var playerId = this.getPlayerId();
        dojo.query(".pp_card_in_court.pp_player_".concat(playerId)).forEach(function (node, index) {
            var cardId = 'card_' + node.id.split('_')[1];
            var card = _this.getCardInfo({ cardId: cardId });
            var loyaltyFilter = !loyalty || card.loyalty === loyalty;
            var regionFilter = !region || card.region === region;
            var suitFilter = !suit || card.suit === suit;
            if (loyaltyFilter && regionFilter && suitFilter) {
                dojo.addClass(node, 'pp_selectable');
                _this._connections.push(dojo.connect(node, 'onclick', _this, function () { return callback({ cardId: cardId }); }));
            }
        });
    };
    PaxPamir.prototype.setHandCardsSelectable = function (_a) {
        var _this = this;
        var callback = _a.callback;
        dojo.query('.pp_card_in_hand').forEach(function (node, index) {
            var cardId = node.id;
            dojo.addClass(node, 'pp_selectable');
            _this._connections.push(dojo.connect(node, 'onclick', _this, function () { return callback({ cardId: cardId }); }));
        });
    };
    PaxPamir.prototype.clientUpdatePageTitle = function (_a) {
        var text = _a.text, args = _a.args;
        this.gamedatas.gamestate.descriptionmyturn = dojo.string.substitute(_(text), args);
        this.framework().updatePageTitle();
    };
    PaxPamir.prototype.clientUpdatePageTitleOtherPlayers = function (_a) {
        var text = _a.text, args = _a.args;
        this.gamedatas.gamestate.description = dojo.string.substitute(_(text), args);
        this.framework().updatePageTitle();
    };
    PaxPamir.prototype.format_string_recursive = function (log, args) {
        var _this = this;
        try {
            if (log && args && !args.processed) {
                args.processed = true;
                Object.entries(args).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    if (key.startsWith('logToken')) {
                        args[key] = getLogTokenDiv({ logToken: value, game: _this });
                    }
                });
            }
        }
        catch (e) {
            console.error(log, args, 'Exception thrown', e.stack);
        }
        return this.inherited(arguments);
    };
    PaxPamir.prototype.onPlaceLogOnChannel = function (msg) {
        var currentLogId = this.framework().notifqueue.next_log_id;
        var res = this.framework().inherited(arguments);
        this._notif_uid_to_log_id[msg.uid] = currentLogId;
        this._last_notif = {
            logId: currentLogId,
            msg: msg,
        };
        return res;
    };
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
    PaxPamir.prototype.setLoader = function (value, max) {
        this.framework().inherited(arguments);
        if (!this.framework().isLoadingComplete && value >= 100) {
            this.framework().isLoadingComplete = true;
            this.onLoadingComplete();
        }
    };
    PaxPamir.prototype.onLoadingComplete = function () {
        this.cancelLogs(this.gamedatas.canceledNotifIds);
    };
    PaxPamir.prototype.getZoneForLocation = function (_a) {
        var location = _a.location;
        var splitLocation = location.split('_');
        switch (splitLocation[0]) {
            case 'armies':
                return this.map.getRegion({ region: splitLocation[1] }).getArmyZone();
            case 'blocks':
                return this.objectManager.supply.getCoalitionBlocksZone({
                    coalition: splitLocation[1],
                });
            case 'cylinders':
                return this.playerManager.getPlayer({ playerId: Number(splitLocation[1]) }).getCylinderZone();
            case 'events':
                return this.playerManager.getPlayer({ playerId: Number(splitLocation[1]) }).getEventsZone();
            case 'gift':
                return this.playerManager.getPlayer({ playerId: Number(splitLocation[2]) }).getGiftZone({ value: Number(splitLocation[1]) });
            case 'favored':
                return this.objectManager.favoredSuit.getFavoredSuitZone({
                    suit: splitLocation[2],
                });
            case 'roads':
                var border = "".concat(splitLocation[1], "_").concat(splitLocation[2]);
                return this.map.getBorder({ border: border }).getRoadZone();
            case 'spies':
                var cardId = "".concat(splitLocation[1], "_").concat(splitLocation[2]);
                return this.spies[cardId];
            case 'tribes':
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
    PaxPamir.prototype.setupCardSpyZone = function (_a) {
        var nodeId = _a.nodeId, cardId = _a.cardId;
        if (!this.spies[cardId]) {
            this.spies[cardId] = new ebg.zone();
            this.spies[cardId].create(this, nodeId, CYLINDER_WIDTH, CYLINDER_HEIGHT);
            this.spies[cardId].item_margin = 4;
        }
    };
    PaxPamir.prototype.updateCard = function (_a) {
        var _b;
        var location = _a.location, id = _a.id, order = _a.order;
        location.changeItemsWeight((_b = {}, _b[id] = order, _b));
    };
    PaxPamir.prototype.actionError = function (actionName) {
        this.framework().showMessage("cannot take ".concat(actionName, " action"), 'error');
    };
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
