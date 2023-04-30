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
// define contants for state ids
if (!defined('STATE_END_GAME')) { // ensure this block is only invoked once, since it is included multiple times
    define("STATE_SETUP", 2);
    define("STATE_PREPARE_TURN", 3);
    define("STATE_PLAYER_ACTIONS", 4);
    define("STATE_NEGOTIATE_BRIBE", 5);
    define("STATE_RESOLVE_IMPACT_ICONS", 6);
    define("STATE_DISCARD_COURT", 7);
    define("STATE_DISCARD_HAND", 8);
    define("STATE_DISCARD_LEVERAGE",13);
    define("STATE_PLACE_ROAD", 9);
    define("STATE_PLACE_SPY", 10);
    define("STATE_CLEANUP", 11);
    define("STATE_CLEANUP_DISCARD_EVENTS", 12);
    // define("STATE_RESOLVE_EVENT", 20);
    define("STATE_REFRESH_MARKET", 21);
    define("STATE_DOMINANCE_CHECK", 30);
    define("STATE_CARD_ACTION_BATTLE", 40);
    define("STATE_CARD_ACTION_BETRAY", 41);
    define("STATE_CARD_ACTION_BUILD", 42);
    define("STATE_CARD_ACTION_MOVE", 44);
    define("STATE_CARD_ACTION_TAX", 45);
    define("STATE_NEXT_PLAYER", 50);
    define("STATE_NEXT_PLAYER_NEGOTIATE_BRIBE", 51);
    // define("STATE_OVERTHROW", 60);
    define("STATE_FINAL", 90);
    define("ST_CHANGE_ACTIVE_PLAYER",95);
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

    STATE_NEXT_PLAYER_NEGOTIATE_BRIBE => array(
        "name" => "nextPlayerNegotiateBribe",
        "type" => "game",
        "action" => "stNextPlayerNegotiateBribe",
        "updateGameProgression" => true,
        "transitions" => array(
            "negotiateBribe" => STATE_NEGOTIATE_BRIBE,
            "playerActions" => STATE_PLAYER_ACTIONS,
            "resolveImpactIcons" => STATE_RESOLVE_IMPACT_ICONS,
        )
    ),

    STATE_PREPARE_TURN => array(
        "name" => "prepareTurn",
        "type" => "game",
        "action" => "stPrepareTurn",
        "updateGameProgression" => true,
        "transitions" => array(
            "playerActions" => STATE_PLAYER_ACTIONS,
        )
    ),

    STATE_PLAYER_ACTIONS => array(
        "name" => "playerActions",
        "description" => clienttranslate('${actplayer} may perform actions'),
        "descriptionmyturn" => clienttranslate('${you} '),
        "type" => "activeplayer",
        "args" => "argPlayerActions",
        "possibleactions" => array("purchaseCard", "playCard", "purchaseGift", "pass", "restart", "battle", "tax", "betray"),
        "transitions" => array(
            "playerActions" => STATE_PLAYER_ACTIONS,
            "discardLeverage" => STATE_DISCARD_LEVERAGE,
            "dominanceCheck" => STATE_DOMINANCE_CHECK,
            "resolveImpactIcons" => STATE_RESOLVE_IMPACT_ICONS,
            "nextPlayerNegotiateBribe" => STATE_NEXT_PLAYER_NEGOTIATE_BRIBE,
            "cardActionBattle" => STATE_CARD_ACTION_BATTLE,
            "cardActionBetray" => STATE_CARD_ACTION_BETRAY,
            "cardActionBuild" => STATE_CARD_ACTION_BUILD,
            "cardActionMove" => STATE_CARD_ACTION_MOVE,
            "cardActionTax" => STATE_CARD_ACTION_TAX,
            "cleanup" => STATE_CLEANUP,
        )
    ),

    STATE_NEGOTIATE_BRIBE => array(
        "name" => "negotiateBribe",
        "description" => clienttranslate('${actplayer} must accept or decline bribe'),
        "descriptionmyturn" => clienttranslate('${you} '),
        "type" => "activeplayer",
        "args" => "argNegotiateBribe",
        "possibleactions" => array("acceptBribe", "declineBribe", "proposeBribeAmount"),
        "transitions" => array(
            "nextPlayerNegotiateBribe" => STATE_NEXT_PLAYER_NEGOTIATE_BRIBE,
        )
    ),

    STATE_CLEANUP => array(
        "name" => "cleanup",
        "type" => "game",
        "action" => "stCleanup",
        "updateGameProgression" => false,
        "transitions" => array(
            "discardCourt" => STATE_DISCARD_COURT,
            "discardHand" => STATE_DISCARD_HAND,
            "discardEvents" => STATE_CLEANUP_DISCARD_EVENTS,
        )
    ),

    STATE_CLEANUP_DISCARD_EVENTS => array(
        "name" => "cleanupDiscardEvents",
        "type" => "game",
        "action" => "stCleanupDiscardEvents",
        "updateGameProgression" => false,
        "transitions" => array(
            "refreshMarket" => STATE_REFRESH_MARKET,
        )
    ),

    STATE_RESOLVE_IMPACT_ICONS => array(
        "name" => "resolveImpactIcons",
        "type" => "game",
        "action" => "stResolveImpactIcons",
        "updateGameProgression" => false,
        "transitions" => array(
            "playerActions" => STATE_PLAYER_ACTIONS,
            "resolveImpactIcons" => STATE_RESOLVE_IMPACT_ICONS,
            "refreshMarket" => STATE_REFRESH_MARKET,
            "placeRoad" => STATE_PLACE_ROAD,
            "placeSpy" => STATE_PLACE_SPY,
            "discardCourt" => STATE_DISCARD_COURT,
            "discardHand" => STATE_DISCARD_HAND,
        )
    ),

    STATE_REFRESH_MARKET => array(
        "name" => "refreshMarket",
        "type" => "game",
        "action" => "stRefreshMarket",
        "updateGameProgression" => false,
        "transitions" => array(
            "nextTurn" => STATE_NEXT_PLAYER,
            "refreshMarket" => STATE_REFRESH_MARKET,
        )
    ),

    STATE_DOMINANCE_CHECK => array(
        "name" => "dominanceCheck",
        "type" => "game",
        "action" => "stDominanceCheck",
        "updateGameProgression" => false,
        "transitions" => array(
            "playerActions" => STATE_PLAYER_ACTIONS,
            // "nextTurn" => STATE_NEXT_PLAYER,
            // "refreshMarket" => STATE_REFRESH_MARKET,
        )
    ),

    STATE_DISCARD_COURT => array(
        "name" => "discardCourt",
        "description" => clienttranslate('${actplayer} must discard court cards'),
        "descriptionmyturn" => clienttranslate('${you} must discard '),
        "type" => "activeplayer",
        "args" => "argDiscardCourt",
        "possibleactions" => array("discardCards"),
        "transitions" => array(
            "discardLeverage" => STATE_DISCARD_LEVERAGE,
            "cleanup" => STATE_CLEANUP,
        )
    ),

    STATE_DISCARD_HAND => array(
        "name" => "discardHand",
        "description" => clienttranslate('${actplayer} must discard hand cards'),
        "descriptionmyturn" => clienttranslate('${you} must discard '),
        "type" => "activeplayer",
        "args" => "argDiscardHand",
        "possibleactions" => array("discardCards"),
        "transitions" => array(
            "cleanup" => STATE_CLEANUP,
        )
    ),

    STATE_DISCARD_LEVERAGE => array(
        "name" => "discardLeverage",
        "description" => clienttranslate('${actplayer} must discard cards'),
        "descriptionmyturn" => clienttranslate('${you} must discard '),
        "type" => "activeplayer",
        "args" => "argDiscardLeverage",
        "possibleactions" => array("discardCards"),
        // TODO check all possible transitions? Or use jumpToState?
        "transitions" => array(
            "cleanup" => STATE_CLEANUP,
            "discardLeverage" => STATE_DISCARD_LEVERAGE,
            "playerActions" => STATE_PLAYER_ACTIONS,
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
            "resolveImpactIcons" => STATE_RESOLVE_IMPACT_ICONS,
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
            "resolveImpactIcons" => STATE_RESOLVE_IMPACT_ICONS,
        )
    ),

    STATE_CARD_ACTION_BATTLE => array(
        "name" => "cardActionBattle",
        "description" => clienttranslate('${actplayer} must select a place to battle'),
        "descriptionmyturn" => clienttranslate('${you} must select a place to battle'),
        "type" => "activeplayer",
        "args" => "argPlaceRoad",
        "possibleactions" => array("cardActionBattle"),
        "transitions" => array(
            "playerActions" => STATE_PLAYER_ACTIONS,
        )
    ),

    STATE_CARD_ACTION_BETRAY => array(
        "name" => "cardActionBetray",
        "description" => clienttranslate('${actplayer} must select a card'),
        "descriptionmyturn" => clienttranslate('${you} must select a card'),
        "type" => "activeplayer",
        "args" => "argPlaceRoad",
        "possibleactions" => array("cardActionBetray"),
        "transitions" => array(
            "playerActions" => STATE_PLAYER_ACTIONS,
        )
    ),

    STATE_CARD_ACTION_BUILD => array(
        "name" => "cardActionBuild",
        "description" => clienttranslate('${actplayer} must build'),
        "descriptionmyturn" => clienttranslate('${you} must build'),
        "type" => "activeplayer",
        "args" => "argPlaceRoad",
        "possibleactions" => array("cardActionBuild"),
        "transitions" => array(
            "playerActions" => STATE_PLAYER_ACTIONS,
        )
    ),

    STATE_CARD_ACTION_MOVE => array(
        "name" => "cardActionMove",
        "description" => clienttranslate('${actplayer} must move an army or a spy'),
        "descriptionmyturn" => clienttranslate('${you} must move an army or a spy'),
        "type" => "activeplayer",
        "args" => "argPlaceRoad",
        "possibleactions" => array("cardActionMove"),
        "transitions" => array(
            "playerActions" => STATE_PLAYER_ACTIONS,
        )
    ),

    STATE_CARD_ACTION_TAX => array(
        "name" => "cardActionTax",
        "description" => clienttranslate('${actplayer} must tax market or player'),
        "descriptionmyturn" => clienttranslate('${you} must tax market or player'),
        "type" => "activeplayer",
        "args" => "argPlaceRoad",
        "possibleactions" => array("cardActionTax"),
        "transitions" => array(
            "playerActions" => STATE_PLAYER_ACTIONS,
        )
    ),


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
