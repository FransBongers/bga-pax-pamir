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
 * paxpamir.view.php
 *
 * This is your "view" file.
 *
 * The method "build_page" below is called each time the game interface is displayed to a player, ie:
 * _ when the game starts
 * _ when a player refreshes the game page (F5)
 *
 * "build_page" method allows you to dynamically modify the HTML generated for the game interface. In
 * particular, you can set here the values of variables elements defined in paxpamir_paxpamir.tpl (elements
 * like {MY_VARIABLE_ELEMENT}), and insert HTML block elements (also defined in your HTML template file)
 *
 * Note: if the HTML of your game interface is always the same, you don't have to place anything here.
 *
 */
  
require_once( APP_BASE_PATH."view/common/game.view.php" );
  
class view_paxpamir_paxpamir extends game_view
{
    protected function getGameName()
    {
        // Used for translations and stuff. Please do not modify.
        return "paxpamir";
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


        // Market containers for stock component
        $this->page->begin_block( "paxpamir_paxpamir", "market" );
        
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
                    'TOP' => 54 + round( ($row)*($ver_scale+12) )
                ) );
            }        
        }

        // VP track positions top
        $this->page->begin_block( "paxpamir_paxpamir", "vp_track_top" );
    
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
        $this->page->begin_block( "paxpamir_paxpamir", "vp_track_right" );

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
        $this->page->begin_block( "paxpamir_paxpamir", "vp_track_bottom" );

        $hor_scale = 50;
        for( $vp=17; $vp<=23; $vp++ )
        {
            $this->page->insert_block( "vp_track_bottom", array(
                'VP' => $vp,
                'LEFT' => 893 - round( ($vp - 17)*($hor_scale+33.5) ),
                'TOP' => 506
            ) );
        } 


        /*********** Do not change anything below this line  ************/
  	}
}
