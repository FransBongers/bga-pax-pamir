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

        /*
            Set up of player tableaus based on numer of players. Current player is always at the top,
            with other players clockwise around the table.
            2 players: 1 tableau at top, 1 tableau at bottom
                player1: column 2-6 row 2-3 top
                player2: column 2-6 row 7-8 bottom
            3 players: 1 tableau at top, tableaus at both sided
                player1: column 2-6 row 2-3 top
            4 players: 1 tableau at top, tableaus at both sided, 1 tableau at bottom
                player1: column 2-6 row 2-3 top
                player2: column 6-7 row 2-8 top right
                player3: column 2-6 row 7-8 bottom
                player4: column 1-2 row 2-8 top left
            5 players: 1 tableau at top, tableaus at both sided, 2 tableaus at bottom
        */

        $this->player_setup = array(
            1 => array(
                'grid_column_start' => 2,
                'grid_column_end' => 6,
                'grid_row_start' => 2,
                'grid_row_end' => 3,
            ),
            2 => array(
                'grid_column_start' => 6,
                'grid_column_end' => 7,
                'grid_row_start' => 2,
                'grid_row_end' => 8,
            ),
            3 => array(
                'grid_column_start' => 2,
                'grid_column_end' => 6,
                'grid_row_start' => 7,
                'grid_row_end' => 8,
            ),
            4 => array(
                'grid_column_start' => 1,
                'grid_column_end' => 2,
                'grid_row_start' => 2,
                'grid_row_end' => 8,
            ),
          );

        $this->page->begin_block( "paxpamireditiontwo_paxpamireditiontwo", "player_tableau" );
        
        for( $x=1; $x<=$players_nbr; $x++ )
        {
        
            $this->page->insert_block( "player_tableau", array(
                'PLAYER_NUMBER' => $x,
            ) );      
        }



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
