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

require_once 'modules/php/includes/PPAutoLoader.inc.php';

require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );
require_once('modules/tokens.php');

use PPModules\PaxPamirEditionTwo\Enums\PPEnumCardType;
use PPModules\PaxPamirEditionTwo\Enums\PPEnumImpactIcon;
use PPModules\PaxPamirEditionTwo\Enums\PPEnumPool;
use PPModules\PaxPamirEditionTwo\Enums\PPEnumSuit;


class PaxPamirEditionTwo extends Table
{
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
            // "dominance_checks" => 13,
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

        // Add all cards to token module
        $this->tokens->createTokensPack("card_{INDEX}", PPEnumCardType::Court, 100);
        $this->tokens->createTokensPack("card_{INDEX}", PPEnumCardType::DominanceCheck, 4, 101);
        $this->tokens->createTokensPack("card_{INDEX}", PPEnumCardType::Event, 12, 105);
        $this->tokens->shuffle(PPEnumCardType::Court);
        $this->tokens->shuffle(PPEnumCardType::Event);

        // build market deck based on number of players
        for ($i = 6; $i >=1; $i--) {
            $this->tokens->pickTokensForLocation($number_of_players+5, PPEnumCardType::Court, 'pile');
            if ($i == 2) {
                $this->tokens->pickTokensForLocation(2, PPEnumCardType::Event, 'pile');
            } elseif ($i > 2) {
                $this->tokens->pickTokensForLocation(1, PPEnumCardType::Event, 'pile');
                $this->tokens->pickTokensForLocation(1, PPEnumCardType::DominanceCheck, 'pile');
            }
            $this->tokens->shuffle('pile');
            $pile = $this->tokens->getTokensInLocation('pile');
            $n_cards = $this->tokens->countTokensInLocation('deck');
            foreach ( $pile as $id => $info) {
                $this->tokens->moveToken($id, 'deck', $info['state'] + $n_cards);
            }
        }

        // Add other tokens to token module
        $this->tokens->createTokensPack("rupee_{INDEX}", PPEnumPool::Rupee, 36);
        $this->tokens->createTokensPack("block_afghan_{INDEX}", PPEnumPool::BlockAfghan, 12);
        $this->tokens->createTokensPack("block_russian_{INDEX}", PPEnumPool::BlockRussian, 12);
        $this->tokens->createTokensPack("block_british_{INDEX}", PPEnumPool::BlockBritish, 12);

        // Init global values with their initial values 
        // Note: values have to be integers
        self::setGameStateInitialValue( 'setup', 1 ); // used to check if setup is done or not
        self::setGameStateInitialValue( 'remaining_actions', 2 );
        self::setGameStateInitialValue( 'favored_suit', 0 );
        // self::setGameStateInitialValue( 'dominance_checks', 0 );

        // Rulers: value is 0 if no ruler, otherwise playerId of the ruling player
        self::setGameStateInitialValue( 'ruler_transcaspia', 0 );
        self::setGameStateInitialValue( 'ruler_kabul', 0 );
        self::setGameStateInitialValue( 'ruler_persia', 0 );
        self::setGameStateInitialValue( 'ruler_herat', 0 );
        self::setGameStateInitialValue( 'ruler_kandahar', 0 );
        self::setGameStateInitialValue( 'ruler_punjab', 0 );

        self::setGameStateInitialValue( 'bribe_card_id', 0 );
        self::setGameStateInitialValue( 'bribe_amount', -1 );
        self::setGameStateInitialValue( 'resolve_impact_icons_card_id', 0 );
        self::setGameStateInitialValue( 'resolve_impact_icons_current_icon', -1 );

        // Assign initial cards to market
        for ($i = 0; $i < 6; $i++) {
            $this->tokens->pickTokensForLocation(1, 'deck', 'market_0_'.$i);
            $this->tokens->pickTokensForLocation(1, 'deck', 'market_1_'.$i);
        }

        
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
            $result['court'][$player_id] = $this->tokens->getTokensOfTypeInLocation('card', 'court_'.$player_id, null, 'state');
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
        }

        // Only get hand cards for current player (we might implement option to play with open hands?)
        $result['hand'] = $this->tokens->getTokensInLocation('hand_'.$current_player_id);

        foreach($this->loyalty as $coalitionId => $coalition) {
            // $result['coalition_blocks'][$coalition['id']] = $this->tokens->getTokensInLocation('block_'.$coalition['id'].'_pool');
            $result['coalition_blocks'][$coalitionId] = $this->tokens->getTokensInLocation('block_'.$coalitionId.'_pool');
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
//////////// Utility functions
////////////    

    /*
        In this space, you can put any utility methods useful for your game logic.
        NOTE: put them in alphabetical order
    */


    /**
     * checks if coalition is different from current loyalty.
     * Handles any changes it it is.
     */
    function checkAndHandleLoyaltyChange ( $coalition ) {

        $player_id = self::getActivePlayerId();
        $current_loyaly = $this->getPlayerLoyalty($player_id);
        // check of loyalty needs to change. If it does not return
        if ($current_loyaly == $coalition) {
            return;
        }
        

        // TODO:
        // 1. Return gifts
        // 2. Discard prizes and patriots
        // 3. Update loyalty
        $this->setPlayerLoyalty($player_id, $coalition);

        // Notify
        $coalition_name = $this->loyalty[$coalition]['name'];
        self::notifyAllPlayers( "chooseLoyalty", clienttranslate( '${player_name} changed loyalty to ${coalition_name}.' ), array(
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'coalition' => $coalition,
            'coalition_name' => $coalition_name
        ) );
    }


    /*
        Returns the number of hand and court cards that need to be discarded by the player.
    */
    function checkDiscardsForPlayer( $player_id )
    {
        //
        // check for extra cards in hand and court
        //
        $result = array();
        $suits = $this->getPlayerSuitsTotals($player_id);
        $court_cards = $this->tokens->getTokensOfTypeInLocation('card', 'court_'.$player_id, null, 'state');
        $hand = $this->tokens->getTokensOfTypeInLocation('card', 'hand_'.$player_id, null, 'state');
        
        $result['court'] = count($court_cards) - $suits['political'] - 3;
        $result['court'] = max($result['court'], 0);

        $result['hand'] = count($hand) - $suits['intelligence'] - 2;
        $result['hand'] = max($result['hand'], 0);

        return $result;

    }

    /*
        Triggered at end of a players turn. Checks if player needs to discard any cards from court or hand.
    */
    function cleanup( )
    {
        //
        // go to the next state for cleanup:  either discard court, discard hand or refresh market
        //

        $player_id = self::getActivePlayerId();
        $discards = $this->checkDiscardsForPlayer($player_id);

        if ($discards['court'] > 0) {
            $this->gamestate->nextState( 'discard_court' );
        } elseif ($discards['hand'] > 0) {
            $this->gamestate->nextState( 'discard_hand' );
        } else {
            $this->gamestate->nextState( 'refresh_market' );
        }

    }

    /*
        Returns rulers for all regions. Value will either be 0 (no ruler) or
        the playerId of the player ruling the region
    */
    function getAllRegionRulers() {
        
        $result = array();

        $result['transcaspia'] = $this->getGameStateValue( 'ruler_transcaspia' );
        $result['kabul'] = $this->getGameStateValue( 'ruler_kabul' );
        $result['persia'] = $this->getGameStateValue( 'ruler_persia' );
        $result['herat'] = $this->getGameStateValue( 'ruler_herat' );
        $result['kandahar'] = $this->getGameStateValue( 'ruler_kandahar' );
        $result['punjab'] = $this->getGameStateValue( 'ruler_punjab' );

        return $result;

    }

    /**
     *   Returns total influence for player
     */
    function getPlayerInfluence($player_id) {
        $influence = 1;
        $court_cards = $this->tokens->getTokensOfTypeInLocation('card', 'court_'.$player_id, null, 'state');
        for ($i = 0; $i < count($court_cards); $i++) {
            // TODO (Frans): get information about courd cards and add influence if patriot
            // Add number of prizes
            // Add number of gifts
            // $card_info = $this->cards[$court_cards[$i]['key']];
            // $card_info->getLoyalty()
        }
        return $influence;
    }

    /**
     * Get loyalty for player
     */
    function getPlayerLoyalty($player_id) {
        $sql = "SELECT loyalty FROM player WHERE  player_id='$player_id' ";
        return $this->getUniqueValueFromDB($sql);
    }
    
    /**
     * Get total number of rupees owned by player
     */
    function getPlayerRupees($player_id) {
        $sql = "SELECT rupees FROM player WHERE  player_id='$player_id' ";
        return $this->getUniqueValueFromDB($sql);
    }

    /**
     * Calculates total number of ranks for each suit for cards in a players court
     */
    function getPlayerSuitsTotals($player_id) {
        $suits = array (
            PPEnumSuit::Political => 0,
            PPEnumSuit::Military => 0,
            PPEnumSuit::Economic => 0,
            PPEnumSuit::Intelligence => 0
        );
        $court_cards = $this->tokens->getTokensOfTypeInLocation('card', 'court_'.$player_id, null, 'state');
        for ($i = 0; $i < count($court_cards); $i++) {
            $card_info = $this->cards[$court_cards[$i]['key']];
            $suits[$card_info->getSuit()] += $card_info->getRank();
        }
        return $suits;
    }

    /**
     * Returns ruler of the region a card belongs to. 0 if no ruler, otherwise playerId.
     */
    function getRegionRulerForCard( $card_id ) {

        if ($card_id == 0) return 0;
        
        $rulers = $this->getAllRegionRulers();
        $region = $this->cards[$card_id]->getRegion();

        return $rulers[$region];

    }

    /**
     * TODO (Frans): check if this function is already used somewhere?
     * Should returns the cards that are not available for sale (because player already put rupee on it)
     */

    function getUnavailableCards() {

        $result = array();
        
        for ($i = 0; $i < 2; $i++) {
            for ($j = 0; $j < 6; $j++) {
                $res = $this->tokens->getTokensOfTypeInLocation('card', 'market_'.$i.'_'.$j, 1 );
                $card = array_shift( $res );
                if (($card !== NULL) and ($card['state'] == 1)) {
                    $result[] = $card['key'];
                }
            }
        }

        return $result;

    }

    /**
     * Update the number of rupees for a player in database
     */
    function incPlayerRupees($player_id, $value) {
        $rupees = $this->getPlayerRupees($player_id);
        $rupees += $value;
        $sql = "UPDATE player SET rupees='$rupees' 
                WHERE  player_id='$player_id' ";
        self::DbQuery( $sql );
    }

    /**
     * Set loyalty for player in database
     */
    function setPlayerLoyalty($player_id, $coalition) {
        $sql = "UPDATE player SET loyalty='$coalition' 
        WHERE  player_id='$player_id' ";
        self::DbQuery( $sql );
    }

    /**
     * Check is string starts with a specific substring. Returns boolean
     */
    function startsWith ($string, $startString) 
    { 
        $len = strlen($startString); 
        return (substr($string, 0, $len) === $startString); 
    } 

    /**
     * Calculates current totals for all player information and sends notification to all players
     */
    function updatePlayerCounts() {
        $counts = array();
        $players = $this->loadPlayersBasicInfos();
        // $sql = "SELECT player_id id, player_score score, loyalty, rupees FROM player ";
        // $result['players'] = self::getCollectionFromDb( $sql );
        foreach ( $players as $player_id => $player_info ) {
            $counts[$player_id] = array();
            $counts[$player_id]['rupees'] = $this->getPlayerRupees($player_id );
            $counts[$player_id]['cylinders'] = 10 - count($this->tokens->getTokensOfTypeInLocation('cylinder', 'cylinders_'.$player_id ));
            $counts[$player_id]['cards'] = count($this->tokens->getTokensOfTypeInLocation('card', 'hand_'.$player_id ));
            $counts[$player_id]['suits'] = $this->getPlayerSuitsTotals($player_id);
            $counts[$player_id]['influence'] = $this->getPlayerInfluence($player_id);
        }

        self::notifyAllPlayers( "updatePlayerCounts", '', array(
            'counts' => $counts
        ) );
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in paxpamireditiontwo.action.php)
        NOTE: put in alphabetical order.
    */

    /**
     * Part of set up when players need to select loyalty.
     */
    function chooseLoyalty( $coalition )
    {
        //
        // select starting loyalty during game setup
        //

        self::checkAction( 'choose_loyalty' );

        $player_id = self::getActivePlayerId();
        $coalition_name = $this->loyalty[$coalition]['name'];

        $this->setPlayerLoyalty($player_id, $coalition);

        // Notify
        self::notifyAllPlayers( "chooseLoyalty", clienttranslate( '${player_name} selected ${coalition_name}.' ), array(
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'coalition' => $coalition,
            'coalition_name' => $coalition_name
        ) );

        $this->gamestate->nextState( 'next' );

    }

    /**
     * Discard cards action when needed at end of a players turn
     */
    function discardCards($cards, $from_hand )
    {
        self::checkAction( 'discard' );

        $player_id = self::getActivePlayerId();
        $discards = $this->checkDiscardsForPlayer($player_id);

        if ($from_hand) {
            if (count($cards) !== $discards['hand'])
                throw new feException( "Incorrect number of discards" );

            foreach ($cards as $card_id) {
                $this->tokens->moveToken($card_id, 'discard');
                $card_name = $this->token_types[$card_id]['name'];
                $removed_card = $this->tokens->getTokenInfo($card_id);
                $court_cards = $this->tokens->getTokensOfTypeInLocation('card', 'court_'.$player_id, null, 'state');

                self::notifyAllPlayers( "discardCard", '${player_name} discarded ${card_name} from their hand.', array(
                    'player_id' => $player_id,
                    'player_name' => self::getActivePlayerName(),
                    'card_name' => $card_name,
                    'court_cards' => $court_cards,
                    'card_id' => $card_id,
                    'from' => 'hand'
                ) );
            }

        } else {
            if (count($cards) != $discards['court'])
                throw new feException( "Incorrect number of discards" );

            foreach ($cards as $card_id) {
                $this->tokens->moveToken($card_id, 'discard');
                $card_name = $this->token_types[$card_id]['name'];
                $removed_card = $this->tokens->getTokenInfo($card_id);
                $court_cards = $this->tokens->getTokensOfTypeInLocation('card', 'court_'.$player_id, null, 'state');
                                
                // slide card positions down to fill in gap
                foreach ($court_cards as $c) {
                    if ($c['state'] > $removed_card['state'])
                        $this->tokens->setTokenState($c['key'], $c['state'] - 1);
                }

                $court_cards = $this->tokens->getTokensOfTypeInLocation('card', 'court_'.$player_id, null, 'state');

                self::notifyAllPlayers( "discardCard", '${player_name} discarded ${card_name} from their court.', array(
                    'player_id' => $player_id,
                    'player_name' => self::getActivePlayerName(),
                    'card_name' => $card_name,
                    'court_cards' => $court_cards,
                    'card_id' => $card_id,
                    'from' => 'court'
                ) );
            }
        }

        $this->updatePlayerCounts();

        $this->cleanup();

    }

    /**
     * Places road on a border for loyalty of active player
     */
    function placeRoad( $border ) 
    {
        self::checkAction( 'placeRoad' );
        self::dump( "placeRoad on ", $border);
        $player_id = self::getActivePlayerId();
        // TODO: check if allowed based on resolve_impact_icons_card_id
        $loyalty = $this->getPlayerLoyalty($player_id);
        $location = $this->locations['pools'][$loyalty];
        $road = $this->tokens->getTokenOnTop($location);
        if ($road != null) {
            $this->tokens->moveToken($road['key'], $this->locations['roads'][$border]);
            self::notifyAllPlayers( "placeRoad", "", array(
                'coalition' => $loyalty,
                'token_id' => $road['key'],
                'border' => $border,
            ) );
        }
        $this->incGameStateValue("resolve_impact_icons_current_icon", 1);
        $this->gamestate->nextState( 'resolve_impact_icons' );
    }

    /**
     * Places spy on card
     */
    function placeSpy( $card_id ) 
    {
        self::checkAction( 'placeSpy' );
        self::dump( "placeSpy on ", $card_id);

        $player_id = self::getActivePlayerId();
        $cylinder = $this->tokens->getTokenOnTop("cylinders_".$player_id);
        
        if ($cylinder != null) {
            $this->tokens->moveToken($cylinder['key'], 'spies_'.$card_id);
            self::notifyAllPlayers( "placeSpy", "", array(
                'player_id' => $player_id,
                'token_id' => $cylinder['key'],
                'card_id' => $card_id,
            ) );
        }
        $this->incGameStateValue("resolve_impact_icons_current_icon", 1);
        $this->gamestate->nextState( 'resolve_impact_icons' );
    }

    /**
     * Play card from hand to court
     */
    function playCard( $card_id, $left_side = true, $bribe = null )
    {
        //
        // play a card from hand into the court on either the left or right side
        //

        self::checkAction( 'play' );

        $player_id = self::getActivePlayerId();
        $card = $this->tokens->getTokenInfo($card_id);
        $card_name = $this->token_types[$card_id]['name'];

        $bribe_card_id = $this->getGameStateValue("bribe_card_id");
        $bribe_ruler = $this->getRegionRulerForCard($bribe_card_id);
        $bribe_amount = $this->getGameStateValue("bribe_amount");

        $court_cards = $this->tokens->getTokensOfTypeInLocation('card', 'court_'.$player_id, null, 'state');

        // TODO (Frans): decide how we want to implement bribes
        // if (($bribe_ruler != 0) and ($bribe_ruler != $player_id)) {
        //     if ($bribe_amount == -1) {
        //         $this->setGameStateValue("bribe_card_id", $card_id);
        //         $this->gamestate->setPlayersMultiactive( [$bribe_ruler], 'negotiate_bribe', $bExclusive = true );
        //         self::notifyAllPlayers( "playCard", $message, array(
        //             'player_id' => $player_id,
        //             'player_name' => self::getActivePlayerName(),
        //             'card' => $card,
        //             'card_name' => $card_name,
        //             'court_cards' => $court_cards,
        //             'bribe' => true,
        //             'i18n' => array( 'card_name' ),
        //         ) );
        //         return;
        //     } elseif ($bribe != $bribe_amount) {
        //         throw new feException( "Bribe is incorrect value" );
        //         return;
        //     } else {
        //         $this->incPlayerCoins($player_id, -$bribe);
        //     }
        // }

        if ($this->getGameStateValue("remaining_actions") > 0) {
            // check if loyaly change
            $card_loyalty = $this->cards[$card_id]->getLoyalty();
            if ($card_loyalty != null) {
                $this->checkAndHandleLoyaltyChange( $card_loyalty );
            }

            if ($left_side) {
                for ($i = 0; $i < count($court_cards); $i++) {
                    // $this->tokens->setTokenState($court_cards[$i].key, $court_cards[$i].state+1);
                    $this->tokens->setTokenState($court_cards[$i]['key'], $i+2);
                }
                $this->tokens->moveToken($card_id, 'court_'.$player_id, 1);
                $message = clienttranslate( '${player_name} played ${card_name} to the left side of their court' );
            } else {
                $this->tokens->moveToken($card_id, 'court_'.$player_id, count($court_cards) + 1);
                $message = clienttranslate( '${player_name} played ${card_name} to the right side of their court' );
            }
            $this->incGameStateValue("remaining_actions", -1);
            $court_cards = $this->tokens->getTokensOfTypeInLocation('card', 'court_'.$player_id, null, 'state');

            self::notifyAllPlayers( "playCard", $message, array(
                'player_id' => $player_id,
                'player_name' => self::getActivePlayerName(),
                'card' => $card,
                'card_name' => $card_name,
                'court_cards' => $court_cards,
                'bribe' => false,
                'i18n' => array( 'card_name' ),
            ) );

            $this->updatePlayerCounts();

            $this->setGameStateValue("bribe_card_id", 0);
            $this->setGameStateValue("bribe_amount", -1);

            $this->setGameStateValue("resolve_impact_icons_card_id", explode("_", $card_id)[1]);
            $this->setGameStateValue("resolve_impact_icons_current_icon", 0);
            $this->gamestate->nextState( 'resolve_impact_icons' );
        }

        // if ($this->getGameStateValue("remaining_actions") > 0) {
        //     $this->gamestate->nextState( 'action' );
        // } else {
        //     $this->cleanup();
        // }

    }

    /**
     * purchase card from market
     */
    function purchaseCard( $card_id )
    {
        self::dump( "purchaseCard", $card_id );
        self::checkAction( 'purchase' );

        $player_id = self::getActivePlayerId();
        $card = $this->tokens->getTokenInfo($card_id);

        $card_info = $this->cards[$card_id];
        // $court_cards = $this->tokens->getTokensOfTypeInLocation('card', 'court_'.$player_id, null, 'state');
        // for ($i = 0; $i < count($court_cards); $i++) {
            
        //     $suits[$card_info->getSuit()] += $card_info->getRank();
        // }

        // Throw error if card is unavailble for purchase
        if ($card['state'] == 1) {
            throw new feException( "Card is unavailble" );
        }

        $card_name = $this->token_types[$card_id]['name'];
        $market_location = $card['location'];
        self::dump( "purchaseCard", $card_id, $player_id, $card );
        $row = explode("_", $market_location)[1];
        $row_alt = ($row == 0) ? 1 : 0;
        $col = $cost = explode("_", $market_location)[2];
        self::dump( "row", $row );
        if ($this->getGameStateValue("remaining_actions") > 0) {

            // check cost
            if ($cost > $this->getPlayerRupees($player_id)) {
                throw new feException( "Not enough rupees" );
            } else {
                // if enough rupees reduce player rupees
                $this->incPlayerRupees($player_id, -$cost);
            };

            // TODO (Frans): check if this is an event card or court card
            // move card to player hand location and reduce number of remaining actions
            $new_location = 'hand_'.$player_id;
            if ($card_info->getType() == PPEnumCardType::Event) {
                $new_location = 'active_events';
            } 
            $this->tokens->moveToken($card_id, $new_location);
            $this->incGameStateValue("remaining_actions", -1);

            // add rupees on card to player totals. Then put them in rupee_pool location
            $rupees = $this->tokens->getTokensOfTypeInLocation('rupee', $market_location.'_rupees');
            $this->incPlayerRupees($player_id, count($rupees));
            $this->tokens->moveAllTokensInLocation($market_location.'_rupees', PPEnumPool::Rupee);

            // TODO (Frans): better check below code, but assume it adds rupees to the cards in the market
            $updated_cards = array();

            for ($i = $col-1; $i >= 0; $i--) {
                $location = 'market_'.$row.'_'.$i;
                $m_card = $this->tokens->getTokenOnLocation($location);
                if ($m_card == NULL) {
                    $location = 'market_'.$row_alt.'_'.$i;
                    $m_card = $this->tokens->getTokenOnLocation($location);
                }
                if ($m_card !== NULL) {
                    $c = $this->tokens->getTokenOnTop(PPEnumPool::Rupee);
                    // $this->tokens->moveToken($c['key'], $m_card["key"]); 
                    $this->tokens->moveToken($c['key'], $location.'_rupees'); 
                    $this->tokens->setTokenState($m_card["key"], 1); // state for unavailable
                    $updated_cards[] = array(
                        'location' => $location,
                        'card_id' => $m_card["key"],
                        'rupee_id' => $c['key']
                    );
                }
            }

            self::notifyAllPlayers( "purchaseCard", clienttranslate( '${player_name} purchased ${card_name}' ), array(
                'player_id' => $player_id,
                'player_name' => self::getActivePlayerName(),
                'card' => $card,
                'card_name' => $card_name,
                'market_location' => $market_location,
                'new_location' => $new_location,
                'updated_cards' => $updated_cards,
                'i18n' => array( 'card_name' ),
            ) );

            $this->updatePlayerCounts();

        }

        if ($this->getGameStateValue("remaining_actions") > 0) {
            $this->gamestate->nextState( 'action' );
        } else {
            $this->cleanup();
        }

    }


    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    function argPlaceRoad()
    {
        $player_id = self::getActivePlayerId();
        $card_id = 'card_'.$this->getGameStateValue("resolve_impact_icons_card_id");
        $card_info = $this->cards[$card_id];
        $card_region = $card_info->getRegion();
        return array(
            'region' => $this->regions[$card_region],
        );
    }

    function argPlaceSpy()
    {
        $player_id = self::getActivePlayerId();
        $card_id = 'card_'.$this->getGameStateValue("resolve_impact_icons_card_id");
        $card_info = $this->cards[$card_id];
        $card_region = $card_info->getRegion();
        return array(
            'region' => $card_region,
        );
    }

    function argPlayerActions()
    {
        $player_id = self::getActivePlayerId();

        return array(
            'remaining_actions' => $this->getGameStateValue("remaining_actions"),
            'unavailable_cards' => $this->getUnavailableCards(),
            'hand' => $this->tokens->getTokensInLocation('hand_'.$player_id),
            'court' => $this->tokens->getTokensOfTypeInLocation('card', 'court_'.$player_id, null, 'state'),
            'suits' => $this->getPlayerSuitsTotals($player_id),
            'rulers' => $this->getAllRegionRulers()
        );
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */
    
    function stResolveImpactIcons() {
        $player_id = self::getActivePlayerId();
        $card_id = 'card_'.$this->getGameStateValue("resolve_impact_icons_card_id");
        $current_impact_icon_index = $this->getGameStateValue("resolve_impact_icons_current_icon");
        $card_info = $this->cards[$card_id];
        $impact_icons = $card_info->getImpactIcons();
        self::dump( '----------- resolving impact icons for card', $card_id );
        self::dump( '----------- resolving impact icons current icon', $current_impact_icon_index );
        self::dump( '----------- resolving impact icons number of icons', count($impact_icons) );
        $card_region = $card_info->getRegion();

        if ($current_impact_icon_index >= count($impact_icons)) {
            // $this->setGameStateValue("resolve_impact_icons_card_id", explode("_", $card_id)[1]);
            // $this->setGameStateValue("resolve_impact_icons_current_icon", 0);
            if ($this->getGameStateValue("remaining_actions") > 0) {
                $this->gamestate->nextState( 'action' );
                return;
            } else {
                $this->cleanup();
                return;
            }
        }

        $current_icon = $impact_icons[$current_impact_icon_index];
        $next_state = null;

        switch ($current_icon) {
            case PPEnumImpactIcon::Army :
                $loyalty = $this->getPlayerLoyalty($player_id);
                $location = $this->locations['pools'][$loyalty];
                $army = $this->tokens->getTokenOnTop($location);
                if ($army != null) {
                    $this->tokens->moveToken($army['key'], $this->locations['armies'][$card_region]);
                    self::notifyAllPlayers( "moveArmyFromPool", "", array(
                        'coalition' => $loyalty,
                        'token_id' => $army['key'],
                        'region' => $card_region,
                    ) );
                }
                break;
            case PPEnumImpactIcon::EconomicSuit :
                $previous_suit = self::getGameStateValue( 'favored_suit' );
                if ( $previous_suit == 2 ) {
                    break;
                }
                // Update favored suit
                self::setGameStateValue( 'favored_suit', 2 );

                // Suit change notification
                $message = $this->suits[2]['change'];
                self::notifyAllPlayers( "updateSuit", $message, array(
                    'previous_suit' => $this->suits[$previous_suit]['suit'],
                    'new_suit' => PPEnumSuit::Economic,
                ) );
                break;
            case PPEnumImpactIcon::IntelligenceSuit :
                $previous_suit = self::getGameStateValue( 'favored_suit' );
                if ( $previous_suit == 1 ) {
                    break;
                }
                // Update favored suit
                self::setGameStateValue( 'favored_suit', 1 );

                // Suit change notification
                $message = $this->suits[1]['change'];
                self::notifyAllPlayers( "updateSuit", $message, array(
                    'previous_suit' => $this->suits[$previous_suit]['suit'],
                    'new_suit' => PPEnumSuit::Intelligence,
                ) );
                break;
            case PPEnumImpactIcon::MilitarySuit :
                $previous_suit = self::getGameStateValue( 'favored_suit' );
                if ($previous_suit == 3 ) {
                    break;
                }
                // Update favored suit
                self::setGameStateValue( 'favored_suit', 3 );

                // Suit change notification
                $message = $this->suits[3]['change'];
                self::notifyAllPlayers( "updateSuit", $message, array(
                    'previous_suit' => $this->suits[$previous_suit]['suit'],
                    'new_suit' => PPEnumSuit::Military,
                ) );
                break;
            case PPEnumImpactIcon::Leverage :
                $this->incPlayerRupees($player_id, 2);
                $this->updatePlayerCounts();
                break;
            case PPEnumImpactIcon::PoliticalSuit :
                $previous_suit = self::getGameStateValue( 'favored_suit' );
                if ( $previous_suit == 0 ) {
                    break;
                }
                // Update favored suit
                self::setGameStateValue( 'favored_suit', 0 );

                // Suit change notification
                $message = $this->suits[0]['change'];
                self::notifyAllPlayers( "updateSuit", $message, array(
                    'previous_suit' => $this->suits[$previous_suit]['suit'],
                    'new_suit' => PPEnumSuit::Political,
                ) );
                break;
            case PPEnumImpactIcon::Road :
                $next_state = "place_road";
                break;
            case PPEnumImpactIcon::Spy :
                $next_state = "place_spy";
                break;
            case PPEnumImpactIcon::Tribe :
                $cylinder = $this->tokens->getTokenOnTop("cylinders_".$player_id);
                $new_location = $this->locations["tribes"][$card_region];
                if ($cylinder != null) {
                    $this->tokens->moveToken($cylinder['key'], $new_location);
                    self::notifyAllPlayers( "moveCynlinderToTribe", "", array(
                        'player_id' => $player_id,
                        'token_id' => $cylinder['key'],
                        'region' => $card_region,
                    ) );
                }
                break;                
            default :
                break;
        }


        if ($next_state != null) {
            $this->gamestate->nextState( $next_state );
        } else {
            // increase index for currently resolved icon, then transition to resolve_impact_icons state again
            // to check if there are more that need to be resolved.
            $this->setGameStateValue("resolve_impact_icons_current_icon", $current_impact_icon_index + 1);
            $this->gamestate->nextState( 'resolve_impact_icons' );
        }
    }

    function stNextPlayer()
    {
        $setup = $this->getGameStateValue("setup");
        self::dump( "setup in stNextPlayer", $setup );
        // Active next player
        if ($setup == 1) {
            // setup
            $player_id = self::activeNextPlayer();
            $loyalty = $this->getPlayerLoyalty($player_id);
            self::dump( "loyalty in stNextPlayer", $loyalty == "null" );
            if ($this->getPlayerLoyalty($player_id) == "null") {
                // choose next loyalty
                $this->giveExtraTime($player_id);

                $this->gamestate->nextState( 'setup' );
            } else {
                // setup complete, go to player actions
                $player_id = self::activePrevPlayer();
                $this->giveExtraTime($player_id);

                $this->setGameStateValue("setup", 0);
                $this->setGameStateValue("remaining_actions", 2);

                $this->gamestate->nextState( 'next_turn' );
            }

        } else {
            // player turn
            $player_id = self::activeNextPlayer();

            $this->setGameStateValue("remaining_actions", 2);
            $this->giveExtraTime($player_id);

            $this->gamestate->nextState( 'next_turn' );
        }

    }

    /**
     * Refresh market at end of a players turn
     */
    function stRefreshMarket()
    {
        $empty_top = array();
        $empty_bottom = array();
        $card_moves = array();
        $new_cards = array();

        for ($i = 0; $i < 6; $i++) {
            $from_location = 'market_0_'.$i;
            $card = $this->tokens->getTokenOnLocation($from_location);
            if ($card == null) {
                $empty_top[] = $i;
            } else {
                $this->tokens->setTokenState($card["key"], 0); // unavailable false
                if (count($empty_top) > 0) {
                    $to_locaction = 'market_0_'.array_shift($empty_top);
                    $this->tokens->moveToken($card['key'], $to_locaction);
                    $this->tokens->moveAllTokensInLocation($from_location.'_rupees', $to_locaction.'_rupees');
                    $empty_top[] = $i;
                    $card_moves[] = array(
                        'card_id' => $card['key'], 
                        'from' => $from_location, 
                        'to' => $to_locaction
                    );
                    
                    self::notifyAllPlayers( "refreshMarket", '', array(
                        'card_moves' => $card_moves,
                        'new_cards' => $new_cards,
                    ) );
            
                    $this->gamestate->nextState( 'refresh_market' );
                    return;
                }
            }
            
            $from_location = 'market_1_'.$i;
            $card = $this->tokens->getTokenOnLocation($from_location);
            if ($card == null) {
                $empty_bottom[] = $i;
            } else {
                $this->tokens->setTokenState($card["key"], 0);
                if (count($empty_bottom) > 0) {
                    $to_locaction = 'market_1_'.array_shift($empty_bottom);
                    $this->tokens->moveToken($card['key'], $to_locaction );
                    $this->tokens->moveAllTokensInLocation($from_location.'_rupees', $to_locaction.'_rupees');
                    $empty_bottom[] = $i;
                    $card_moves[] = array( 
                        'card_id' => $card['key'], 
                        'from' => $from_location, 
                        'to' => $to_locaction
                    );

                    self::notifyAllPlayers( "refreshMarket", '', array(
                        'card_moves' => $card_moves,
                        'new_cards' => $new_cards,
                    ) );
            
                    $this->gamestate->nextState( 'refresh_market' );
                    return;
                }
            }

        }

        foreach ($empty_top as $i) {
            $card = $this->tokens->pickTokensForLocation(1, 'deck', 'market_0_'.$i)[0];
            $new_cards[] = array(
                'card_id' => $card['key'], 
                'from' => 'deck',
                'to' => 'market_0_'.$i
            );
        }

        foreach ($empty_bottom as $i) {
            $card = $this->tokens->pickTokensForLocation(1, 'deck', 'market_1_'.$i)[0];
            $new_cards[] = array(
                'card_id' => $card['key'], 
                'from' => 'deck', 
                'to' => 'market_1_'.$i
            );
        }

        self::notifyAllPlayers( "refreshMarket", clienttranslate( 'The market has been refreshed.' ), array(
            'card_moves' => $card_moves,
            'new_cards' => $new_cards,
        ) );

        $this->gamestate->nextState( 'next_turn' );

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
