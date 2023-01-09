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
  * paxpamireditiontwo.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */

require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );

require_once('modules/php/PPConstants.php');
require_once('modules/php/PPMap.php');
require_once('modules/php/PPMarket.php');
require_once('modules/php/PPPlayer.php');
require_once('modules/php/PPPlayerActions.php');
require_once('modules/php/PPStateActions.php');
require_once('modules/php/PPStateArgs.php');
require_once('modules/php/PPSupply.php');
require_once('modules/php/PPUtilityFunctions.php');
require_once('modules/php/tokens.php');


/*
 * Game main class.
 * For readability, main sections (util, action, state, args) have been splited into Traits with the section name on modules/php directory.
 */
class PaxPamirEditionTwo extends Table
{
    use PPMapTrait;
    use PPMarketTrait;
    use PPPlayerTrait;
    use PPPlayerActionsTrait;
    use PPStateActionsTrait;
    use PPStateArgsTrait;
    use PPSupplyTrait;
    use PPUtilityFunctionsTrait;

	function __construct( )
	{
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        
        self::initGameStateLabels( array(
            "setup" => 10,
            "remaining_actions" => 11,
            "favored_suit" => 12,
            "dominance_checks_resolved" => 13,
            "ruler_transcaspia" => 14,
            "ruler_kabul" => 15,
            "ruler_persia" => 16,
            "ruler_herat" => 17,
            "ruler_kandahar" => 18,
            "ruler_punjab" => 19,
            "bribe_card_id" =>20,
            "bribe_amount" =>21,
            "resolve_impact_icons_card_id" => 22,
            "resolve_impact_icons_current_icon" => 23,
            "card_action_card_id" => 24,
        ) );

        $this->tokens = new Tokens();
	}
	
    protected function getGameName( )
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
    protected function setupNewGame( $players, $options = array() )
    {    
        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the gams
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];
        $number_of_players = count($players);

        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar, loyalty, rupees) VALUES ";
        $values = array();
        foreach( $players as $player_id => $player )
        {
            // Add initial data to player table
            $color = array_shift( $default_colors );
            $loyalty = "null";
            $rupees = 4;
            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."','$loyalty','$rupees')";
            // Add player cylinders to token module
            $this->tokens->createTokensPack("cylinder_".$player_id."_{INDEX}", "cylinders_".$player_id, 10);
        }
        $sql .= implode( ',', $values );
        self::DbQuery( $sql );
        self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
        self::reloadPlayersBasicInfos();
        
        /************ Start the game initialization *****/

        $this->createMarketDeck($number_of_players);
        $this->drawInitialMarketCards();

        $this->createSupply();
        
        $this->setInitialRulers();

        // Init global values with their initial values 
        // Note: values have to be integers
        self::setGameStateInitialValue( 'setup', 1 ); // used to check if setup is done or not
        self::setGameStateInitialValue( 'remaining_actions', 2 );
        self::setGameStateInitialValue( 'favored_suit', 0 );
        self::setGameStateInitialValue( 'dominance_checks_resolved', 0 );


        self::setGameStateInitialValue( 'bribe_card_id', 0 );
        self::setGameStateInitialValue( 'bribe_amount', -1 );
        self::setGameStateInitialValue( 'resolve_impact_icons_card_id', 0 );
        self::setGameStateInitialValue( 'resolve_impact_icons_current_icon', -1 );
        self::setGameStateInitialValue( 'card_action_card_id', 0 );
        



        
        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        //self::initStat( 'table', 'table_teststat1', 0 );    // Init a table statistics
        //self::initStat( 'player', 'player_teststat1', 0 );  // Init a player statistics (for all players)
       

        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();

        /************ End of the game initialization *****/
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas()
    {
        $result = array();
    
        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!
    
        // Get information about players from players table
        $sql = "SELECT player_id id, player_score score, loyalty, rupees FROM player ";
        $result['players'] = self::getCollectionFromDb( $sql );

        // Get counts for all players
        $players = $this->loadPlayersBasicInfos();
        foreach ( $players as $player_id => $player_info ) {
            $result['court'][$player_id] = $this->getPlayerCourtCards($player_id);
            foreach($result['court'][$player_id] as $card ) {
                $result['spies'][$card['key']] = $this->tokens->getTokensInLocation('spies_'.$card['key']);
            }

            $result['cylinders'][$player_id] = $this->tokens->getTokensInLocation('cylinders_'.$player_id);
            $result['counts'][$player_id]['rupees'] = $this->getPlayerRupees($player_id );
            // Number of cylinders played is total number of cylinders minus cylinders still available to player 
            $result['counts'][$player_id]['cylinders'] = 10 - count($this->tokens->getTokensOfTypeInLocation('cylinder', 'cylinders_'.$player_id ));
            $result['counts'][$player_id]['cards'] = count($this->tokens->getTokensOfTypeInLocation('card', 'hand_'.$player_id ));
            $result['counts'][$player_id]['suits'] = $this->getPlayerSuitsTotals($player_id);
            $result['counts'][$player_id]['influence'] = $this->getPlayerInfluence($player_id);

            foreach(['2', '4', '6'] as $gift_value) {
                $result['gifts'][$player_id][$gift_value] = $this->tokens->getTokensInLocation('gift_'.$gift_value.'_'.$player_id);
            }
        }

        // Only get hand cards for current player (we might implement option to play with open hands?)
        $result['hand'] = $this->tokens->getTokensInLocation('hand_'.$current_player_id);

        foreach($this->loyalty as $coalitionId => $coalition) {
            // $result['coalition_blocks'][$coalition['id']] = $this->tokens->getTokensInLocation('block_'.$coalition['id'].'_pool');
            $result['coalition_blocks'][$coalitionId] = $this->tokens->getTokensInLocation('blocks_'.$coalitionId);
        }

        foreach($this->regions as $region => $regionInfo) {
            $result['armies'][$region] = $this->tokens->getTokensInLocation('armies_'.$region);
            $result['tribes'][$region] = $this->tokens->getTokensInLocation('tribes_'.$region);
        }
        
        foreach($this->borders as $border => $borderInfo) {
            $result['roads'][$border] = $this->tokens->getTokensInLocation('roads_'.$border);
        }

        // TODO (Frans): data from material.inc.php. We might also replace this?
        $result['loyalty'] = $this->loyalty;
        $result['suits'] = $this->suits;
        
        // Add all card info
        $result['cards'] = $this->cards;

        // Add information about all cards in the market.
        for ($i = 0; $i < 6; $i++) {
            $result['market'][0][$i] = $this->tokens->getTokenOnLocation('market_0_'.$i);
            $result['market'][1][$i] = $this->tokens->getTokenOnLocation('market_1_'.$i);
        }

        $result['rupees'] = $this->tokens->getTokensOfTypeInLocation('rupee', null);
        $result['favored_suit'] = $this->suits[$this->getGameStateValue( 'favored_suit' )];
        $result['rulers'] = $this->getAllRegionRulers();
        $result['active_events'] = $this->tokens->getTokensInLocation('active_events');
        $result['borders'] = $this->borders;

        return $result;
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

    function zombieTurn( $state, $active_player )
    {
    	$statename = $state['name'];
    	
        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                default:
                    $this->gamestate->nextState( "zombiePass" );
                	break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive( $active_player, '' );
            
            return;
        }

        throw new feException( "Zombie mode not supported at this game state: ".$statename );
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
    
    function upgradeTableDb( $from_version )
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
