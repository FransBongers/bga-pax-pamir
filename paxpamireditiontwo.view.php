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
 * paxpamireditiontwo.view.php
 *
 * This is your "view" file.
 *
 * The method "build_page" below is called each time the game interface is displayed to a player, ie:
 * _ when the game starts
 * _ when a player refreshes the game page (F5)
 *
 * "build_page" method allows you to dynamically modify the HTML generated for the game interface. In
 * particular, you can set here the values of variables elements defined in paxpamireditiontwo_paxpamireditiontwo.tpl (elements
 * like {MY_VARIABLE_ELEMENT}), and insert HTML block elements (also defined in your HTML template file)
 *
 * Note: if the HTML of your game interface is always the same, you don't have to place anything here.
 *
 */
  
require_once( APP_BASE_PATH."view/common/game.view.php" );
  
class view_paxpamireditiontwo_paxpamireditiontwo extends game_view
{
    protected function getGameName()
    {
        // Used for translations and stuff. Please do not modify.
        return "paxpamireditiontwo";
    }
    
  	function build_page( $viewArgs )
  	{		
  	    // Get players & players number
        $players = $this->game->loadPlayersBasicInfos();
        $players_nbr = count( $players );
        self::dump( "players", $players );
        /*********** Place your code below:  ************/
        global $g_user;
        $current_player_id = $g_user->get_id();
        // self::dump( "current_player_id", $current_player_id );

        // Player tableas
        $this->page->begin_block( "paxpamireditiontwo_paxpamireditiontwo", "player_tableau" );
        
        // Make sure player tableaus are in order with current player at the top.
        // If current player is spectator tableaus are in player order
        if (isset($players [$current_player_id])) { // may be not set if spectator
            $player_id = $current_player_id;
        } else {
            $player_id = $this->game->getNextPlayerTable()[0];
        }

        for ($x = 0; $x < $players_nbr; $x++) {
            $this->page->insert_block("player_tableau", array (
                "player_id" => $player_id,
                "player_name" => $players[$player_id]['player_name'],
                "player_color" => $players[$player_id]['player_color']
            ));            
            $player_id = $this->game->getPlayerAfter($player_id);
        }

        // Player hand
        $this->page->begin_block( "paxpamireditiontwo_paxpamireditiontwo", "player_hand" );
        
        // only add if current player is playing and nog a spectator
        if (isset($players [$current_player_id])) { // may be not set if spectator
            $player_id = $current_player_id;
            $this->page->insert_block("player_hand", array (
                "player_id" => $player_id,
                "player_name" => $players[$player_id]['player_name']
            )); 
        } 

        // Market containers for stock component
        $this->page->begin_block( "paxpamireditiontwo_paxpamireditiontwo", "market" );
        
        $hor_scale = 150;
        $ver_scale = 209;
        for( $column=0; $column<=5; $column++ )
        {
            for( $row=0; $row<=1; $row++ )
            {
                $this->page->insert_block( "market", array(
                    'ROW' => $row,
                    'COLUMN' => $column,
                    'LEFT' => 18 + round( ($column)*($hor_scale+13) ),
                    'TOP' => 54 + round( ($row)*($ver_scale+10) )
                ) );
            }        
        }

        // VP track positions top
        $this->page->begin_block( "paxpamireditiontwo_paxpamireditiontwo", "vp_track_top" );
    
        $hor_scale = 50;
        for( $vp=0; $vp<=10; $vp++ )
        {
            $this->page->insert_block( "vp_track_top", array(
                'VP' => $vp,
                'LEFT' => 58 + round( ($vp)*($hor_scale+33.5) ),
                'TOP' => 25
            ) );
        }        

        // VP track positions right
        $this->page->begin_block( "paxpamireditiontwo_paxpamireditiontwo", "vp_track_right" );

        $ver_scale = 50;
        for( $vp=11; $vp<=16; $vp++ )
        {
            $this->page->insert_block( "vp_track_right", array(
                'VP' => $vp,
                'LEFT' => 926,
                'TOP' => 56 + round( ($vp - 11)*($ver_scale+33.5) ),
            ) );
        }

        // VP track positions bottom
        $this->page->begin_block( "paxpamireditiontwo_paxpamireditiontwo", "vp_track_bottom" );

        $hor_scale = 50;
        for( $vp=17; $vp<=23; $vp++ )
        {
            $this->page->insert_block( "vp_track_bottom", array(
                'VP' => $vp,
                'LEFT' => 893 - round( ($vp - 17)*($hor_scale+33.5) ),
                'TOP' => 506
            ) );
        } 

        /*
        
        // Examples: set the value of some element defined in your tpl file like this: {MY_VARIABLE_ELEMENT}

        // Display a specific number / string
        $this->tpl['MY_VARIABLE_ELEMENT'] = $number_to_display;

        // Display a string to be translated in all languages: 
        $this->tpl['MY_VARIABLE_ELEMENT'] = self::_("A string to be translated");

        // Display some HTML content of your own:
        $this->tpl['MY_VARIABLE_ELEMENT'] = self::raw( $some_html_code );
        
        */
        
        /*
        
        // Example: display a specific HTML block for each player in this game.
        // (note: the block is defined in your .tpl file like this:
        //      <!-- BEGIN myblock --> 
        //          ... my HTML code ...
        //      <!-- END myblock --> 
        

        $this->page->begin_block( "paxpamireditiontwo_paxpamireditiontwo", "myblock" );
        foreach( $players as $player )
        {
            $this->page->insert_block( "myblock", array( 
                                                    "PLAYER_NAME" => $player['player_name'],
                                                    "SOME_VARIABLE" => $some_value
                                                    ...
                                                     ) );
        }
        
        */



        /*********** Do not change anything below this line  ************/
  	}
}
