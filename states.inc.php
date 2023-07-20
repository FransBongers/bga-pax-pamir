<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * PaxPamirEditionTwo implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 * 
 * states.inc.php
 *
 * PaxPamirEditionTwo game states description
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

// require_once 'modules/php/constants.inc.php';
// define contants for state ids
if (!defined('STATE_END_GAME')) { // ensure this block is only invoked once, since it is included multiple times
    define("STATE_SETUP", 2);
    define("STATE_PREPARE_TURN", 3);
    define("STATE_START_OF_TURN_ABILITIES", 14);
    define("STATE_PLAYER_ACTIONS", 4);
    define("STATE_NEGOTIATE_BRIBE", 5);
    define("STATE_DISCARD", 7);
    define("STATE_DISPATCH_ACTION", 8);
    define("STATE_PLACE_ROAD", 9);
    define("STATE_PLACE_SPY", 10);
    define("STATE_CLEANUP", 11);
    define("STATE_CLEANUP_DISCARD_EVENTS", 12);
    define("ST_SELECT_PIECE",13);
    define("STATE_RESOLVE_EVENT", 20);
    define("STATE_REFILL_MARKET", 21);
    define("ST_SA_SAFE_HOUSE", 22);
    define("ST_SA_INFRASTRUCTURE", 23);
    define("ST_ACCEPT_PRIZE", 46);
    define("STATE_NEXT_PLAYER", 50);
    define("STATE_FINAL", 90);
    define("ST_CHANGE_ACTIVE_PLAYER", 95);
    define("STATE_END_GAME", 99);
}

$machinestates = array(

    // The initial state. Please do not modify.
    1 => array(
        "name" => "gameSetup",
        "description" => "",
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => array(
            "" => STATE_SETUP
        )
    ),

    // Note: ID=2 => your first state

    STATE_SETUP => array(
        "name" => "setup",
        "description" => clienttranslate('${actplayer} must choose a loyalty'),
        "descriptionmyturn" => clienttranslate('${you} must choose a loyalty'),
        "type" => "activeplayer",
        "possibleactions" => array("chooseLoyalty"),
        "transitions" => array(
            "next" => STATE_NEXT_PLAYER
        )
    ),

    STATE_NEXT_PLAYER => array(
        "name" => "nextPlayer",
        "type" => "game",
        "action" => "stNextPlayer",
        "updateGameProgression" => true,
        "transitions" => array(
            "prepareNextTurn" => STATE_PREPARE_TURN,
            "setup" => STATE_SETUP,
            "final" => STATE_FINAL
        )
    ),

    STATE_PREPARE_TURN => array(
        "name" => "prepareTurn",
        "type" => "game",
        "action" => "stPrepareTurn",
        "updateGameProgression" => true,
        "transitions" => array(
            "playerActions" => STATE_PLAYER_ACTIONS,
            'startOfTurnAbilities' => STATE_START_OF_TURN_ABILITIES,
        )
    ),

    STATE_START_OF_TURN_ABILITIES => array(
        "name" => "startOfTurnAbilities",
        "description" => clienttranslate('${actplayer} may use a special ability'),
        "descriptionmyturn" => clienttranslate('${you} '),
        "type" => "activeplayer",
        "args" => "argStartOfTurnAbilities",
        "possibleactions" => array("placeSpy", "pass"),
        "transitions" => array(
            "playerActions" => STATE_PLAYER_ACTIONS,
            'startOfTurnAbilities' => STATE_START_OF_TURN_ABILITIES,
        )
    ),

    STATE_PLAYER_ACTIONS => array(
        "name" => "playerActions",
        "description" => clienttranslate('${actplayer} may perform actions'),
        "descriptionmyturn" => clienttranslate('${you} '),
        "type" => "activeplayer",
        "args" => "argPlayerActions",
        "possibleactions" => array("purchaseCard", "playCard", "purchaseGift", "pass", "restart", "battle", "build", "move", "tax", "betray", "startBribeNegotiation", "cancelBribe"),
        "transitions" => array(
            "playerActions" => STATE_PLAYER_ACTIONS,
            "dispatchAction" => STATE_DISPATCH_ACTION,
            "resolveEvent" => STATE_RESOLVE_EVENT,
            "specialAbilityInfrastructure" => ST_SA_INFRASTRUCTURE,
            "specialAbilitySafeHouse" => ST_SA_SAFE_HOUSE,
            "negotiateBribe" => STATE_NEGOTIATE_BRIBE,
            "cleanup" => STATE_CLEANUP,
        )
    ),

    STATE_NEGOTIATE_BRIBE => array(
        "name" => "negotiateBribe",
        "description" => clienttranslate('${actplayer} must accept or decline bribe'),
        "descriptionmyturn" => clienttranslate('${you} '),
        "type" => "activeplayer",
        "args" => "argNegotiateBribe",
        "possibleactions" => array("declineBribe", "negotiateBribe"),
        "transitions" => array(
            "negotiateBribe" => STATE_NEGOTIATE_BRIBE,
            "playerActions" => STATE_PLAYER_ACTIONS,
        )
    ),

    STATE_CLEANUP => array(
        "name" => "cleanup",
        "type" => "game",
        "action" => "stCleanup",
        "updateGameProgression" => false,
        "transitions" => array(
            "dispatchAction" => STATE_DISPATCH_ACTION,
            "discardEvents" => STATE_CLEANUP_DISCARD_EVENTS,
        )
    ),

    STATE_CLEANUP_DISCARD_EVENTS => array(
        "name" => "cleanupDiscardEvents",
        "type" => "game",
        "action" => "stCleanupDiscardEvents",
        "updateGameProgression" => false,
        "transitions" => array(
            "refillMarket" => STATE_REFILL_MARKET,
            "discardEvents" => STATE_CLEANUP_DISCARD_EVENTS,
            "resolveEvent" => STATE_RESOLVE_EVENT,
        )
    ),

    STATE_REFILL_MARKET => array(
        "name" => "refillMarket",
        "type" => "game",
        "action" => "stRefillMarket",
        "updateGameProgression" => false,
        "transitions" => array(
            "dispatchAction" => STATE_DISPATCH_ACTION,
            // "nextTurn" => STATE_NEXT_PLAYER,
            // "refillMarket" => STATE_REFILL_MARKET,
        )
    ),

    STATE_DISCARD => array(
        "name" => "discard",
        "description" => clienttranslate('${actplayer} must discard a card'),
        "descriptionmyturn" => clienttranslate('${you} must discard '),
        "type" => "activeplayer",
        "args" => "argDiscard",
        "possibleactions" => array("discard"),
        "transitions" => array(
            "dispatchAction" => STATE_DISPATCH_ACTION,
            "playerActions" => STATE_PLAYER_ACTIONS,
        )
    ),

    STATE_DISPATCH_ACTION => array(
        "name" => "dispatchAction",
        "type" => "game",
        "action" => "stDispatchAction",
        "updateGameProgression" => false,
        "transitions" => array(
            "acceptPrize" => ST_ACCEPT_PRIZE,
            "cleanup" => STATE_CLEANUP,
            "nextTurn" => STATE_NEXT_PLAYER,
            "discard" => STATE_DISCARD,
            "dispatchAction" => STATE_DISPATCH_ACTION,
            "endGame" => STATE_END_GAME,
            "placeRoad" => STATE_PLACE_ROAD,
            "placeSpy" => STATE_PLACE_SPY,
            "playerActions" => STATE_PLAYER_ACTIONS,
            "refillMarket" => STATE_REFILL_MARKET,
            "selectPiece" => ST_SELECT_PIECE,
        )
    ),

    STATE_PLACE_ROAD => array(
        "name" => "placeRoad",
        "description" => clienttranslate('${actplayer} must place a road'),
        "descriptionmyturn" => clienttranslate('${you} must place a road'),
        "type" => "activeplayer",
        "args" => "argPlaceRoad",
        "possibleactions" => array("placeRoad"),
        "transitions" => array(
            "dispatchAction" => STATE_DISPATCH_ACTION,
        )
    ),

    STATE_PLACE_SPY => array(
        "name" => "placeSpy",
        "description" => clienttranslate('${actplayer} must place a spy'),
        "descriptionmyturn" => clienttranslate('${you} must place a spy'),
        "type" => "activeplayer",
        "args" => "argPlaceSpy",
        "possibleactions" => array("placeSpy"),
        "transitions" => array(
            "dispatchAction" => STATE_DISPATCH_ACTION,

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
            "dispatchAction" => STATE_DISPATCH_ACTION,
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
            "dispatchAction" => STATE_DISPATCH_ACTION,
        ]
    ],

      STATE_RESOLVE_EVENT => [
        "name" => "resolveEvent",
        "description" => '',
        "descriptionmyturn" => '',
        "type" => "activeplayer",
        "args" => "argResolveEvent",
        "possibleactions" => ["eventChoice"],
        "transitions" => [
            // "cleanup" => STATE_CLEANUP,
            "discardEvents" => STATE_CLEANUP_DISCARD_EVENTS,
            "playerActions" => STATE_PLAYER_ACTIONS,
            "resolveEvent" => STATE_RESOLVE_EVENT,
        ]
    ],

    ST_SA_SAFE_HOUSE => [
        "name" => "specialAbilitySafeHouse",
        "description" => clienttranslate('${actplayer} may use Safe House'),
        "descriptionmyturn" => clienttranslate('${you}'),
        "type" => "activeplayer",
        "args" => "argSpecialAbilitySafeHouse",
        "possibleactions" => ["specialAbilitySafeHouse"],
        "transitions" => [
            "playerActions" => STATE_PLAYER_ACTIONS,
            "specialAbilitySafeHouse" => ST_SA_SAFE_HOUSE,
        ]
    ],

    ST_SA_INFRASTRUCTURE => [
        "name" => "specialAbilityInfrastructure",
        "description" => clienttranslate('${actplayer} may place one additional block with Infrastructure'),
        "descriptionmyturn" => clienttranslate('${you}'),
        "type" => "activeplayer",
        "possibleactions" => ["build", "skipSpecialAbility"],
        "transitions" => [
            "playerActions" => STATE_PLAYER_ACTIONS,
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

    // Final state.
    // Please do not modify (and do not overload action/args methods).
    STATE_END_GAME => array(
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd"
    )

);
