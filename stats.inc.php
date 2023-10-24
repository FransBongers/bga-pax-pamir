<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Paxpamir implementation : © Frans Bongers <fjmbongers@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * stats.inc.php
 *
 * Paxpamir game statistics description
 *
 */

require_once 'modules/php/constants.inc.php';

// $stats_type = [];


// const STAT_SUCCESSFUL_DOMINANCE_CHECK = 30;
// const STAT_UNSUCCESSFUL_DOMINANCE_CHECK = 31;

$stats_type = [

    // Statistics global to table
    'table' => [
        'turnCount' => [
            'id' => STAT_TURN_COUNT,
            'name' => totranslate('Number of turns'),
            'type' => 'int'
        ],
        'successfulDominanceChecks' => [
            'id' => STAT_SUCCESSFUL_DOMINANCE_CHECK,
            'name' => totranslate('Number of successful Dominance Checks'),
            'type' => 'int'
        ],
        'unsuccessfulDominanceChecks' => [
            'id' => STAT_UNSUCCESSFUL_DOMINANCE_CHECK,
            'name' => totranslate('Number of unsuccessful Dominance Checks'),
            'type' => 'int'
        ],
        'wakhanEnabled' => [
            'id' => STAT_WAKHAN_ENABLED,
            'name' => totranslate('Wakhan enabled'),
            'type' => 'int'
        ],
        'wakhanWins' => [
            'id' => STAT_WAKHAN_WINS,
            'name' => totranslate('Wakhan wins'),
            'type' => 'int'
        ]
    ],

    // const STAT_TURN_NUMBER = 10;
    // const STAT_ACTION_PURCHASE_CARD = 11;
    // const STAT_ACTION_PLAY_CARD = 12;
    // const STAT_ACTION_BATTLE = 13;
    // const STAT_ACTION_BETRAY = 14;
    // const STAT_ACTION_BUILD = 15;
    // const STAT_ACTION_GIFT = 16;
    // const STAT_ACTION_MOVE = 17;
    // const STAT_ACTION_TAX = 18;

    // Statistics existing for each player
    'player' => [
        'playerTurnCount' => [
            'id' => STAT_PLAYER_TURN_COUNT,
            'name' => totranslate('Number of turns'),
            'type' => 'int'
        ],
        'purchaseCardCount' => [
            'id' => STAT_ACTION_PURCHASE_CARD,
            'name' => totranslate('Number of cards purchased'),
            'type' => 'int'
        ],
        'playCardCount' => [
            'id' => STAT_ACTION_PLAY_CARD,
            'name' => totranslate('Number of cards played'),
            'type' => 'int'
        ],
        'battleCount' => [
            'id' => STAT_ACTION_BATTLE,
            'name' => totranslate('Number of battle actions'),
            'type' => 'int'
        ],
        'betrayCount' => [
            'id' => STAT_ACTION_BETRAY,
            'name' => totranslate('Number of betray actions'),
            'type' => 'int'
        ],
        'buildCount' => [
            'id' => STAT_ACTION_BUILD,
            'name' => totranslate('Number of build actions'),
            'type' => 'int'
        ],
        'giftCount' => [
            'id' => STAT_ACTION_GIFT,
            'name' => totranslate('Number of gift actions'),
            'type' => 'int'
        ],
        'moveCount' => [
            'id' => STAT_ACTION_MOVE,
            'name' => totranslate('Number of move actions'),
            'type' => 'int'
        ],
        'taxCount' => [
            'id' => STAT_ACTION_TAX,
            'name' => totranslate('Number of tax actions'),
            'type' => 'int'
        ],
        'loyaltyChangeCount' => [
            'id' => STAT_LOYALTY_CHANGE_COUNT,
            'name' => totranslate('Number of loyalty changes'),
            'type' => 'int'
        ],
    ],

    'value_labels' => [
        STAT_WAKHAN_ENABLED => [
            0 => totranslate("No"),
            1 => totranslate("Yes"),
        ],
        STAT_WAKHAN_WINS => [
            0 => totranslate("No"),
            1 => totranslate("Yes"),
        ]
    ]
];
