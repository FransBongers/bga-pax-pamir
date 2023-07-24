<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * PaxPamirEditionTwo implementation : © Frans Bongers <fjmbongers@gmail.com>
 * 
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 * 
 * paxpamireditiontwo.game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 *
 */

$swdNamespaceAutoload = function ($class) {
    $classParts = explode('\\', $class);
    if ($classParts[0] == 'PaxPamir') {
        array_shift($classParts);
        $file = dirname(__FILE__) . '/modules/php/' . implode(DIRECTORY_SEPARATOR, $classParts) . '.php';
        if (file_exists($file)) {
            require_once $file;
        } else {
            die('Cannot find file : ' . $file);
        }
    }
};
spl_autoload_register($swdNamespaceAutoload, true, true);

require_once(APP_GAMEMODULE_PATH . 'module/table/table.game.php');

use PaxPamir\Core\Globals;
use PaxPamir\Core\Preferences;
use PaxPamir\Helpers\Log;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\Market;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

// // Todo check why PPPlayer import is needed
// require_once('modules/php/PPUtilityFunctions.php');


/*
 * Game main class.
 * For readability, main sections (util, action, state, args) have been splited into Traits with the section name on modules/php directory.
 */

class PaxPamirEditionTwo extends Table
{
    use PaxPamir\DebugTrait;
    use PaxPamir\States\ChangeLoyaltyTrait;
    use PaxPamir\States\CleanupTrait;
    use PaxPamir\States\DiscardTrait;
    use PaxPamir\States\DispatchActionTrait;
    use PaxPamir\States\DominanceCheckTrait;
    use PaxPamir\States\BribeTrait;
    use PaxPamir\States\NextPlayerTrait;
    use PaxPamir\States\PlaceRoadTrait;
    use PaxPamir\States\PlaceSpyTrait;
    use PaxPamir\States\PlayCardTrait;
    use PaxPamir\States\PlayerActionBattleTrait;
    use PaxPamir\States\PlayerActionBetrayTrait;
    use PaxPamir\States\PlayerActionBuildTrait;
    use PaxPamir\States\PlayerActionGiftTrait;
    use PaxPamir\States\PlayerActionMoveTrait;
    use PaxPamir\States\PlayerActionTaxTrait;
    use PaxPamir\States\PlayerActionTrait;
    use PaxPamir\States\PurchaseCardTrait;
    use PaxPamir\States\OverthrowTrait;
    use PaxPamir\States\RefillMarketTrait;
    use PaxPamir\States\ResolveEventTrait;
    use PaxPamir\States\ResolveImpactIconsTrait;
    use PaxPamir\States\SASafeHouseTrait;
    use PaxPamir\States\SelectPieceTrait;
    use PaxPamir\States\TurnTrait;

    // Declare objects from material.inc.php to remove IntelliSense errors
    public $borders;
    public $cards;
    public $loyalty;
    public $regions;
    public $specialAbilities;
    public $suits;

    public static $instance = null;
    function __construct()
    {
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        self::$instance = $this;
        self::initGameStateLabels(array(
            'logging' => 10,
        ));
    }

    protected function getGameName()
    {
        // Used for translations and stuff. Please do not modify.
        return "paxpamireditiontwo";
    }

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame($players, $options = array())
    {
        Globals::setupNewGame($players, $options);
        Preferences::setupNewGame($players, $options);
        Players::setupNewGame($players, $options);
        Cards::setupNewGame($players, $options);
        Tokens::setupNewGame($players, $options);
        Market::setupNewGame($players, $options);

        $this->setGameStateInitialValue('logging', false);

        // // Init game statistics
        // // (note: statistics used in this file must be defined in your stats.inc.php file)
        // //self::initStat( 'table', 'table_teststat1', 0 );    // Init a table statistics
        // //self::initStat( 'player', 'player_teststat1', 0 );  // Init a player statistics (for all players)


        // // Activate first player (which is in general a good idea :) )
        // $this->activeNextPlayer();

        /************ End of the game initialization *****/


        $this->activeNextPlayer();
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    public function getAllDatas($pId = null)
    {
        $pId = $pId ?? Players::getCurrentId();

        $data = [
            // TODO (Frans): data from material.inc.php. We might also replace this?
            'staticData' => [
                'borders' => $this->borders,
                'cards' => $this->cards,
                'loyalty' => $this->loyalty,
                'regions' => $this->regions,
                'specialAbilities' => $this->specialAbilities,
                'suits' => $this->suits,
            ],
            'players' => Players::getUiData($pId),
            'map' => Map::getUiData(),
            'market' => Market::getUiData(),
            // 'rupees' => Tokens::getOfType('rupee'),
            'favoredSuit' => Globals::getFavoredSuit(),
            'canceledNotifIds' => Log::getCanceledNotifIds(),
            'discardPile' => Cards::getTopOf(DISCARD),
            'tempDiscardPile' => Cards::getTopOf(TEMP_DISCARD),
        ];
        $activePlayerId = Players::getActiveId();
        $data['localState'] = [
            'activePlayer' => $data['players'][$activePlayerId],
            // 'favoredSuit' => $data['favoredSuit'],
            'remainingActions' => Globals::getRemainingActions(),
            'usedCards' => Cards::getUnavailableCards(),
        ];


        // TODO: move to SupplyManager class?
        foreach ($this->loyalty as $coalitionId => $coalition) {
            $data['coalitionBlocks'][$coalitionId] = Tokens::getInLocation(['blocks', $coalitionId])->toArray();
        }
        $data['activeEvents'] = Cards::getInLocation(ACTIVE_EVENTS)->toArray();

        return $data;
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression()
    {
        // TODO: compute and return the game progression

        return 0;
    }

    public static function get()
    {
        return self::$instance;
    }

    function getCard($card_id)
    {
        return $this->cards[$card_id];
    }

    /**
     * Returns card info from material.inc.php file.
     * Input is row from token table
     */
    function getCardInfo($token)
    {
        return $this->cards[$token['id']];
    }

    /**
     * Calculates current totals for all player information and sends notification to all players
     */
    function updatePlayerCounts()
    {
        $counts = array();
        $players = $this->loadPlayersBasicInfos();
        // $sql = "SELECT player_id id, player_score score, loyalty, rupees FROM player ";
        // $result['players'] = self::getCollectionFromDb( $sql );
        foreach ($players as $player_id => $player_info) {
            $player = Players::get($player_id);
            $counts[$player_id] = array();
            $counts[$player_id]['rupees'] = $player->getRupees();
            $counts[$player_id]['cylinders'] = 10 - count(Tokens::getInLocation(['cylinders', $player_id]));
            $counts[$player_id]['cards'] = count($player->getHandCards());
            $counts[$player_id]['suits'] = $player->getSuitTotals();
            $counts[$player_id]['influence'] = $player->getInfluence();
        }

        self::notifyAllPlayers("updatePlayerCounts", '', array(
            'counts' => $counts
        ));
    }

    /**
     * Generic state to handle change of active player in the middle of a transition
     */
    function stChangeActivePlayer()
    {
        $t = Globals::getChangeActivePlayer();
        $this->gamestate->changeActivePlayer($t['pId']);
        $this->gamestate->jumpToState($t['st']);
    }

    /**
     * $pId can be either playerId or player
     */
    function changeActivePlayerAndJumpTo($pId, $state)
    {
        // Should probably always clear logs here?
        if (Globals::getLogState() == -1) {
            Globals::setLogState($state);
            // Globals::setActionCount(0);
            Log::clearAll();
        }

        Globals::setChangeActivePlayer([
            'pId' => is_int($pId) ? $pId : $pId->getId(),
            'st' => $state,
        ]);
        $this->gamestate->jumpToState(ST_CHANGE_ACTIVE_PLAYER);
    }

    /**
     * $pId can be either playerId or player
     */
    function nextState($transition, $pId = null)
    {
        // gets current game state to check if it is game or player gamestate
        $state = $this->gamestate->state(true, false, true);
        $st = $state['transitions'][$transition];

        if (Globals::getLogState() == -1) {
            Globals::setLogState($st);
            // Globals::setActionCount(0);
            Log::clearAll();
        }

        $pId = is_null($pId) || is_int($pId) ? $pId : $pId->getId();
        if (is_null($pId) || $pId == $this->getActivePlayerId()) {
            $this->gamestate->nextState($transition);
        } else {
            if ($state['type'] == 'game') {
                $this->gamestate->changeActivePlayer($pId);
                $this->gamestate->nextState($transition);
            } else {
                $this->changeActivePlayerAndJumpTo($pId, $st);
            }
        }
    }

    /////////////////////////////////////////////////////////////
    // Exposing protected methods, please use at your own risk //
    /////////////////////////////////////////////////////////////

    // Exposing protected method getCurrentPlayerId
    public static function getCurrentPId()
    {
        return self::getCurrentPlayerId();
    }

    // Exposing protected method translation
    public static function translate($text)
    {
        return self::_($text);
    }

    // public functuio

    //////////////////////////////////////////////////////////////////////////////
    //////////// Zombie
    ////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    function zombieTurn($state, $active_player)
    {
        $statename = $state['name'];

        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                default:
                    $this->gamestate->nextState("zombiePass");
                    break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive($active_player, '');

            return;
        }

        throw new feException("Zombie mode not supported at this game state: " . $statename);
    }

    ///////////////////////////////////////////////////////////////////////////////////:
    ////////// DB upgrade
    //////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */

    function upgradeTableDb($from_version)
    {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345

        // Example:
        //        if( $from_version <= 1404301345 )
        //        {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
        //            self::applyDbUpgradeToAllDB( $sql );
        //        }
        //        if( $from_version <= 1405061421 )
        //        {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
        //            self::applyDbUpgradeToAllDB( $sql );
        //        }
        //        // Please add your future database scheme changes here
        //
        //


    }
}
