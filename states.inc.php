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
 * states.inc.php
 *
 * Paxpamir game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!

require_once 'modules/php/constants.inc.php';
// define contants for state ids


$machinestates = array(

    // The initial state. Please do not modify.
    ST_GAME_SETUP => array(
        "name" => "gameSetup",
        "description" => "",
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => array(
            "" => ST_DISPATCH_ACTION
        )
    ),

    // Note: ID=2 => your first state

    ST_PLAYER_SETUP => array(
        "name" => "setup",
        "description" => clienttranslate('${actplayer} must choose a loyalty'),
        "descriptionmyturn" => clienttranslate('${you} must choose a loyalty'),
        "type" => "activeplayer",
        "possibleactions" => array("chooseLoyalty"),
        "transitions" => array(
            "dispatchAction" => ST_DISPATCH_ACTION,
        )
    ),

    ST_PREPARE_TURN => array(
        "name" => "prepareTurn",
        "type" => "game",
        "action" => "stPrepareTurn",
        "updateGameProgression" => true,
        "transitions" => array(
            "dispatchAction" => ST_DISPATCH_ACTION,
        )
    ),

    ST_NEXT_PLAYER => array(
        "name" => "nextPlayer",
        "type" => "game",
        "action" => "stNextPlayer",
        "updateGameProgression" => false,
        "transitions" => array(
            "prepareNextTurn" => ST_PREPARE_TURN,
            'wakhanTurn' => ST_WAKHAN_TURN,
            // "setup" => ST_PLAYER_SETUP,
        )
    ),

    ST_START_OF_TURN_ABILITIES => array(
        "name" => "startOfTurnAbilities",
        "description" => clienttranslate('${actplayer} may use a special ability'),
        "descriptionmyturn" => clienttranslate('${you} '),
        "type" => "activeplayer",
        "args" => "argStartOfTurnAbilities",
        "possibleactions" => array("specialAbilityPlaceSpyStartOfTurn"),
        "transitions" => array(
            "dispatchAction" => ST_DISPATCH_ACTION,
        )
    ),

    ST_DISPATCH_ACTION => array(
        "name" => "dispatchAction",
        "type" => "game",
        "action" => "stDispatchAction",
        "updateGameProgression" => false,
        "transitions" => array(
            "acceptPrize" => ST_ACCEPT_PRIZE,
            "calculateTieBreaker" => ST_CALCULATE_TIE_BREAKER,
            "cleanup" => ST_CLEANUP,
            "nextTurn" => ST_NEXT_PLAYER,
            "discard" => ST_DISCARD,
            "dispatchAction" => ST_DISPATCH_ACTION,
            "endGameCheck" => ST_END_GAME_CHECK,
            'eventCardOtherPersuasiveMethods' => ST_RESOLVE_ECE_OTHER_PERSUASIVE_METHODS,
            'eventCardPashtunwaliValues' => ST_RESOLVE_ECE_PASHTUNWALI_VALUES,
            'eventCardRebuke' => ST_RESOLVE_ECE_REBUKE,
            'eventCardRumor' => ST_RESOLVE_ECE_RUMOR,
            "placeRoad" => ST_PLACE_ROAD,
            "placeSpy" => ST_PLACE_SPY,
            "playerActions" => ST_PLAYER_ACTIONS,
            "playerSetup" => ST_PLAYER_SETUP,
            "prepareNextTurn" => ST_PREPARE_TURN,
            "refillMarket" => ST_REFILL_MARKET,
            "selectPiece" => ST_SELECT_PIECE,
            "specialAbilityInfrastructure" => ST_SA_INFRASTRUCTURE,
            "specialAbilitySafeHouse" => ST_SA_SAFE_HOUSE,
            'startOfTurnAbilities' => ST_START_OF_TURN_ABILITIES,
            'wakhanPause' => ST_WAKHAN_PAUSE,
            'wakhanTurn' => ST_WAKHAN_TURN,
        )
    ),

    ST_PLAYER_ACTIONS => array(
        "name" => "playerActions",
        "description" => clienttranslate('${actplayer} may perform actions'),
        "descriptionmyturn" => clienttranslate('${you} '),
        "type" => "activeplayer",
        "args" => "argPlayerActions",
        "possibleactions" => array("purchaseCard", "playCard", "purchaseGift", "pass", "restart", "battle", "build", "move", "tax", "betray", "startBribeNegotiation", "cancelBribe"),
        "transitions" => array(
            "playerActions" => ST_PLAYER_ACTIONS,
            "dispatchAction" => ST_DISPATCH_ACTION,
            "negotiateBribe" => ST_NEGOTIATE_BRIBE,
            "cleanup" => ST_CLEANUP,
        )
    ),

    ST_PLACE_ROAD => array(
        "name" => "placeRoad",
        "description" => clienttranslate('${actplayer} must select a border to place a road'),
        "descriptionmyturn" => clienttranslate('${you} must select a border to place a road'),
        "type" => "activeplayer",
        "args" => "argPlaceRoad",
        "possibleactions" => array("placeRoad"),
        "transitions" => array(
            "dispatchAction" => ST_DISPATCH_ACTION,
        )
    ),

    ST_PLACE_SPY => array(
        "name" => "placeSpy",
        "description" => clienttranslate('${actplayer} must place a spy'),
        "descriptionmyturn" => clienttranslate('${you} must place a spy'),
        "type" => "activeplayer",
        "args" => "argPlaceSpy",
        "possibleactions" => array("placeSpy"),
        "transitions" => array(
            "dispatchAction" => ST_DISPATCH_ACTION,

        )
    ),

    ST_NEGOTIATE_BRIBE => array(
        "name" => "negotiateBribe",
        "description" => clienttranslate('${actplayer} must accept or decline bribe'),
        "descriptionmyturn" => clienttranslate('${you} '),
        "type" => "activeplayer",
        "args" => "argNegotiateBribe",
        "possibleactions" => array("declineBribe", "negotiateBribe"),
        "transitions" => array(
            "negotiateBribe" => ST_NEGOTIATE_BRIBE,
            "playerActions" => ST_PLAYER_ACTIONS,
        )
    ),

    ST_ACCEPT_PRIZE => [
        "name" => "acceptPrize",
        "description" => clienttranslate('${actplayer} may accept prize'),
        "descriptionmyturn" => clienttranslate('${you}'),
        "type" => "activeplayer",
        "args" => "argAcceptPrize",
        "possibleactions" => ["acceptPrize"],
        "transitions" => [
            "dispatchAction" => ST_DISPATCH_ACTION,
        ]
    ],

    ST_DISCARD => array(
        "name" => "discard",
        "description" => clienttranslate('${actplayer} must discard a card'),
        "descriptionmyturn" => clienttranslate('${you} must discard '),
        "type" => "activeplayer",
        "args" => "argDiscard",
        "possibleactions" => array("discard","restart"),
        "transitions" => array(
            "dispatchAction" => ST_DISPATCH_ACTION,
            "playerActions" => ST_PLAYER_ACTIONS,
        )
    ),

    ST_SELECT_PIECE => array(
        "name" => "selectPiece",
        "description" => clienttranslate('${actplayer} must select a piece'),
        "descriptionmyturn" => clienttranslate('${you} must select a piece'),
        "type" => "activeplayer",
        "args" => "argSelectPiece",
        "possibleactions" => array("selectPiece"),
        "transitions" => array(
            "dispatchAction" => ST_DISPATCH_ACTION,
        )
    ),

    ST_CLEANUP => array(
        "name" => "cleanup",
        "type" => "game",
        "action" => "stCleanup",
        "updateGameProgression" => false,
        "transitions" => array(
            "dispatchAction" => ST_DISPATCH_ACTION,
            "discardEvents" => ST_CLEANUP_DISCARD_EVENTS,
        )
    ),


    ST_CLEANUP_DISCARD_EVENTS => array(
        "name" => "cleanupDiscardEvents",
        "type" => "game",
        "action" => "stCleanupDiscardEvents",
        "updateGameProgression" => false,
        "transitions" => array(
            "refillMarket" => ST_REFILL_MARKET,
            "discardEvents" => ST_CLEANUP_DISCARD_EVENTS,
        )
    ),

    ST_REFILL_MARKET => array(
        "name" => "refillMarket",
        "type" => "game",
        "action" => "stRefillMarket",
        "updateGameProgression" => false,
        "transitions" => array(
            "dispatchAction" => ST_DISPATCH_ACTION,
        )
    ),

    ST_SA_SAFE_HOUSE => [
        "name" => "specialAbilitySafeHouse",
        "description" => clienttranslate('${actplayer} may use Safe House'),
        "descriptionmyturn" => clienttranslate('${you}'),
        "type" => "activeplayer",
        "args" => "argSpecialAbilitySafeHouse",
        "possibleactions" => ["specialAbilitySafeHouse"],
        "transitions" => [
            "dispatchAction" => ST_DISPATCH_ACTION,
        ]
    ],

    ST_SA_INFRASTRUCTURE => [
        "name" => "specialAbilityInfrastructure",
        "description" => clienttranslate('${actplayer} may place one additional block with Infrastructure'),
        "descriptionmyturn" => clienttranslate('${you}'),
        "type" => "activeplayer",
        "possibleactions" => ["specialAbilityInfrastructure"],
        "transitions" => [
            "dispatchAction" => ST_DISPATCH_ACTION,
        ]
    ],

    ST_RESOLVE_ECE_OTHER_PERSUASIVE_METHODS => [
        "name" => "eventCardOtherPersuasiveMethods",
        "description" => clienttranslate('${actplayer} must exchange hand with another player'),
        "descriptionmyturn" => clienttranslate('${you}'),
        "type" => "activeplayer",
        "possibleactions" => ["eventCardOtherPersuasiveMethods"],
        "transitions" => [
            "dispatchAction" => ST_DISPATCH_ACTION,
        ]
    ],

    ST_RESOLVE_ECE_PASHTUNWALI_VALUES => [
        "name" => "eventCardPashtunwaliValues",
        "description" => clienttranslate('${actplayer} must select a suit to favor'),
        "descriptionmyturn" => clienttranslate('${you}'),
        "type" => "activeplayer",
        "possibleactions" => ["eventCardPashtunwaliValues"],
        "transitions" => [
            "dispatchAction" => ST_DISPATCH_ACTION,
        ]
    ],

    ST_RESOLVE_ECE_REBUKE => [
        "name" => "eventCardRebuke",
        "description" => clienttranslate('${actplayer} must select a region'),
        "descriptionmyturn" => clienttranslate('${you}'),
        "type" => "activeplayer",
        "possibleactions" => ["eventCardRebuke"],
        "transitions" => [
            "dispatchAction" => ST_DISPATCH_ACTION,
        ]
    ],

    ST_RESOLVE_ECE_RUMOR => [
        "name" => "eventCardRumor",
        "description" => clienttranslate('${actplayer} must choose a player'),
        "descriptionmyturn" => clienttranslate('${you}'),
        "type" => "activeplayer",
        "possibleactions" => ["eventCardRumor"],
        "transitions" => [
            "dispatchAction" => ST_DISPATCH_ACTION,
        ]
    ],

    ST_WAKHAN_TURN => [
        'name' => 'wakhanTurn',
        "description" => clienttranslate('Wakhan performs actions'),
        'descriptionmyturn' => '',
        'type' => 'game',
        'action' => 'stWakhanTurn',
        "transitions" => [
            "dispatchAction" => ST_DISPATCH_ACTION,
        ]
    ],

    ST_WAKHAN_PAUSE => [
        "name" => "wakhanPause",
        "description" => clienttranslate('${actplayer} must click next to let Wakhan continue'),
        "descriptionmyturn" => clienttranslate('${you}'),
        "type" => "activeplayer",
        "possibleactions" => ["wakhanNext"],
        "transitions" => [
            "dispatchAction" => ST_DISPATCH_ACTION,
        ]
    ],

    // Generic state to change player
    ST_CHANGE_ACTIVE_PLAYER => [
        'name' => 'changeActivePlayer',
        'description' => '',
        'descriptionmyturn' => '',
        'type' => 'game',
        'action' => 'stChangeActivePlayer',
    ],

    ST_END_GAME_CHECK => array(
        "name" => "endGameCheck",
        "description" => clienttranslate('${actplayer} may end game'),
        "descriptionmyturn" => clienttranslate('${you}'),
        "type" => "activeplayer",
        "possibleactions" => ["endGame","restart"],
        "transitions" => array(
            "calculateTieBreaker" => ST_CALCULATE_TIE_BREAKER,
        )
    ),

    ST_CALCULATE_TIE_BREAKER => array(
        "name" => "calculateTieBreaker",
        "type" => "game",
        "action" => "stCalculateTieBreaker",
        "updateGameProgression" => false,
        "transitions" => array(
            "endGame" => ST_END_GAME,
        )
    ),

    // Final state.
    // Please do not modify (and do not overload action/args methods).
    ST_END_GAME => array(
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd"
    )

);
