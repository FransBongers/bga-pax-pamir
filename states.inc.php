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
    define("STATE_PLAYER_ACTIONS", 3);
    define("STATE_NEGOTIATE_BRIBE", 4);
    // define("STATE_RESOLVE_IMPACT", 5);
    define("STATE_DISCARD_COURT", 10);
    define("STATE_DISCARD_HAND", 11);
    // define("STATE_RESOLVE_EVENT", 20);
    define("STATE_REFRESH_MARKET", 21);
    // define("STATE_DOMINANCE_CHECK", 30);
    define("STATE_NEXT_PLAYER", 50);
    // define("STATE_OVERTHROW", 60);
    define("STATE_FINAL", 90);
    define("STATE_END_GAME", 99);
}
 
$machinestates = array(

    // The initial state. Please do not modify.
    1 => array(
        "name" => "gameSetup",
        "description" => "",
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => array( "" => 2 )
    ),
    
    // Note: ID=2 => your first state

    STATE_SETUP => array(
        "name" => "setup",
        "description" => clienttranslate('${actplayer} must choose a loyalty'),
        "descriptionmyturn" => clienttranslate('${you} must choose a loyalty'),
        "type" => "activeplayer",
        "possibleactions" => array( "choose_loyalty" ),
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
            "next_turn" => STATE_PLAYER_ACTIONS,
            "setup" => STATE_SETUP,
            "final" => STATE_FINAL 
        )
    ),

    STATE_PLAYER_ACTIONS => array(
        "name" => "playerActions",
        "description" => clienttranslate('${actplayer} may take two actions'),
        "descriptionmyturn" => clienttranslate('${you} '),
        "type" => "activeplayer",
        "args" => "argPlayerActions",
        "possibleactions" => array( "purchase", "play", "card_action", "pass" ),
        "transitions" => array( 
            "action" => STATE_PLAYER_ACTIONS, 
            "negotiate_bribe" => STATE_NEGOTIATE_BRIBE, 
            "discard_court" => STATE_DISCARD_COURT, 
            "discard_hand" => STATE_DISCARD_HAND, 
            "refresh_market" => STATE_REFRESH_MARKET, 
        )
    ),

    STATE_REFRESH_MARKET => array(
        "name" => "refreshMarket",
        "type" => "game",
        "action" => "stRefreshMarket",
        "updateGameProgression" => false,
        "transitions" => array( 
            "next_turn" => STATE_NEXT_PLAYER,
            "refresh_market" => STATE_REFRESH_MARKET,
        )
    ),

    STATE_DISCARD_COURT => array(
        "name" => "discardCourt",
        "description" => clienttranslate('${actplayer} must discard court cards'),
        "descriptionmyturn" => clienttranslate('${you} must discard '),
        "type" => "activeplayer",
        "args" => "argPlayerActions",
        "possibleactions" => array( "discard" ),
        "transitions" => array( 
            "discard_court" => STATE_DISCARD_COURT, 
            "discard_hand" => STATE_DISCARD_HAND, 
            "refresh_market" => STATE_REFRESH_MARKET, 
        )
    ),

    STATE_DISCARD_HAND => array(
        "name" => "discardHand",
        "description" => clienttranslate('${actplayer} must discard hand cards'),
        "descriptionmyturn" => clienttranslate('${you} must discard '),
        "type" => "activeplayer",
        "args" => "argPlayerActions",
        "possibleactions" => array( "discard" ),
        "transitions" => array( 
            "discard_hand" => STATE_DISCARD_HAND, 
            "refresh_market" => STATE_REFRESH_MARKET, 
        )
    ),
    
/*
    Examples:
    
    2 => array(
        "name" => "nextPlayer",
        "description" => '',
        "type" => "game",
        "action" => "stNextPlayer",
        "updateGameProgression" => true,   
        "transitions" => array( "endGame" => 99, "nextPlayer" => 10 )
    ),
    
    10 => array(
        "name" => "playerTurn",
        "description" => clienttranslate('${actplayer} must play a card or pass'),
        "descriptionmyturn" => clienttranslate('${you} must play a card or pass'),
        "type" => "activeplayer",
        "possibleactions" => array( "playCard", "pass" ),
        "transitions" => array( "playCard" => 2, "pass" => 2 )
    ), 

*/    
   
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



