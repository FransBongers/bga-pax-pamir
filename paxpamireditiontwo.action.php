<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * PaxPamirEditionTwo implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * paxpamireditiontwo.action.php
 *
 * PaxPamirEditionTwo main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/paxpamireditiontwo/paxpamireditiontwo/myAction.html", ...)
 *
 */
  
  
  class action_paxpamireditiontwo extends APP_GameAction
  { 
    // Constructor: please do not modify
   	public function __default()
  	{
  	    if( self::isArg( 'notifwindow') )
  	    {
            $this->view = "common_notifwindow";
  	        $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
  	    }
  	    else
  	    {
            $this->view = "paxpamireditiontwo_paxpamireditiontwo";
            self::trace( "Complete reinitialization of board game" );
      }
  	} 
  	
  	// TODO: defines your action entry points there

    public function chooseLoyalty()
    {
        self::setAjaxMode();     
        $coalition = self::getArg( "coalition", AT_alphanum, true );
        $result = $this->game->chooseLoyalty($coalition);
        self::ajaxResponse( );
    }
  

    public function discardCards()
    {
        self::setAjaxMode();     
        $cards_raw = self::getArg( "cards", AT_alphanum, true );
        $from_hand = self::getArg( "from_hand", AT_bool, true );

        $cards_raw = trim($cards_raw);

        if( $cards_raw == '' )
            $cards = array();
        else
            $cards = explode( ' ', $cards_raw );

        $result = $this->game->discardCards($cards, $from_hand);
        self::ajaxResponse( );
    }


    public function passAction()
    {
        self::setAjaxMode();
        $result = $this->game->passAction();
        self::ajaxResponse( );
    }

    public function playCard()
    {
        self::setAjaxMode();     
        $card_id = self::getArg( "card_id", AT_alphanum, true );
        $left_side = self::getArg( "left_side", AT_bool, true );
        $result = $this->game->playCard($card_id, $left_side);
        self::ajaxResponse( );
    }


    public function purchaseCard()
    {
        self::setAjaxMode();     
        $card_id = self::getArg( "card_id", AT_alphanum, true );
        $result = $this->game->purchaseCard($card_id);
        self::ajaxResponse( );
    }

    /*
    
    Example:
  	
    public function myAction()
    {
        self::setAjaxMode();     

        // Retrieve arguments
        // Note: these arguments correspond to what has been sent through the javascript "ajaxcall" method
        $arg1 = self::getArg( "myArgument1", AT_posint, true );
        $arg2 = self::getArg( "myArgument2", AT_posint, true );

        // Then, call the appropriate method in your game logic, like "playCard" or "myAction"
        $this->game->myAction( $arg1, $arg2 );

        self::ajaxResponse( );
    }
    
    */

  }
  

