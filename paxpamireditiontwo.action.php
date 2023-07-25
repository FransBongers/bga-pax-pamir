<?php

use PaxPamir\Helpers\Utils;

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * PaxPamirEditionTwo implementation : © Frans Bongers <fjmbongers@gmail.com>
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
        if (self::isArg('notifwindow')) {
            $this->view = "common_notifwindow";
            $this->viewArgs['table'] = self::getArg("table", AT_posint, true);
        } else {
            $this->view = "paxpamireditiontwo_paxpamireditiontwo";
            self::trace("Complete reinitialization of board game");
        }
    }

    // TODO: defines your action entry points there

    public function acceptPrize()
    {
        self::setAjaxMode();
        $accept = self::getArg("accept", AT_bool, true);

        $result = $this->game->acceptPrize($accept);
        self::ajaxResponse();
    }

    public function startBribeNegotiation()
    {
        self::setAjaxMode();
        $cardId = self::getArg("cardId", AT_alphanum, true);
        $amount = self::getArg("amount", AT_alphanum, true);
        $action = self::getArg("useFor", AT_alphanum, true);

        $result = $this->game->startBribeNegotiation($cardId, $amount, $action);
        self::ajaxResponse();
    }

    public function cancelBribe()
    {
        self::setAjaxMode();
        $result = $this->game->cancelBribe();
        self::ajaxResponse();
    }

    public function declineBribe()
    {
        self::setAjaxMode();
        $result = $this->game->declineBribe();
        self::ajaxResponse();
    }

    public function negotiateBribe()
    {
        self::setAjaxMode();
        $amount = self::getArg("amount", AT_posint, true);
        $result = $this->game->negotiateBribe($amount);
        self::ajaxResponse();
    }

    public function battle()
    {
        self::setAjaxMode();
        $removedPiecesString = self::getArg("removedPieces", AT_alphanum, true);
        $location = self::getArg("location", AT_alphanum, true);
        $cardId = self::getArg("cardId", AT_alphanum, true);
        $bribeAmount = self::getArg("bribeAmount", AT_alphanum, false);

        $removedPiecesString = trim($removedPiecesString);

        if ($removedPiecesString == '')
            $removedPieces = array();
        else
            $removedPieces = explode(' ', $removedPiecesString);

        $result = $this->game->battle($cardId, $location, $removedPieces, $bribeAmount);
        self::ajaxResponse();
    }

    public function betray()
    {
        self::setAjaxMode();
        $cardId = self::getArg("cardId", AT_alphanum, true);
        $betrayedCardId = self::getArg("betrayedCardId", AT_alphanum, true);
        $bribeAmount = self::getArg("bribeAmount", AT_alphanum, false);

        $result = $this->game->betray($cardId, $betrayedCardId,$bribeAmount);
        self::ajaxResponse();
    }

    public function build()
    {
        self::setAjaxMode();
        $locations = self::getArg("locations", AT_json, true);
        $cardId = self::getArg("cardId", AT_alphanum, true);
        $bribeAmount = self::getArg("bribeAmount", AT_alphanum, false);
        Utils::validateJSonAlphaNum($locations, 'locations');
        $result = $this->game->build($locations, $cardId,$bribeAmount);
        self::ajaxResponse();
    }

    public function specialAbilityInfrastructure()
    {
        self::setAjaxMode();
        $locations = self::getArg("locations", AT_json, false);
        $skip = self::getArg("skip", AT_bool, false);
        if ($locations !== null) {
            Utils::validateJSonAlphaNum($locations, 'locations');
        }
        $skip = $skip === null ? false : $skip;
        $result = $this->game->specialAbilityInfrastructure($skip, $locations);
        self::ajaxResponse();
    }

    public function  specialAbilityPlaceSpyStartOfTurn()
    {
        self::setAjaxMode();
        $cardId = self::getArg("cardId", AT_alphanum, false);
        $skip = self::getArg("skip", AT_bool, false);
        $skip = $skip === null ? false : $skip;
        $result = $this->game->specialAbilityPlaceSpyStartOfTurn($skip,$cardId);
        self::ajaxResponse();
    }

    public function chooseLoyalty()
    {
        self::setAjaxMode();
        $coalition = self::getArg("coalition", AT_alphanum, true);
        $result = $this->game->chooseLoyalty($coalition);
        self::ajaxResponse();
    }

    public function discard()
    {
        self::setAjaxMode();
        $cardId = self::getArg("cardId", AT_alphanum, true);
        $from = self::getArg("from", AT_alphanum, true);

        $result = $this->game->discard($cardId,$from);
        self::ajaxResponse();
    }

    public function discardCards()
    {
        self::setAjaxMode();
        $cards_raw = self::getArg("cards", AT_alphanum, true);

        $cards_raw = trim($cards_raw);

        if ($cards_raw == '')
            $cards = array();
        else
            $cards = explode(' ', $cards_raw);

        $result = $this->game->discardCards($cards);
        self::ajaxResponse();
    }

    public function eventChoice()
    {
        self::setAjaxMode();
        $data = self::getArg("data", AT_json, true);
        // $args = self::getArg('actionArgs', AT_json, true);
        Utils::validateJSonAlphaNum($data, 'data');
        // $this->validateJSonAlphaNum($args, 'actionArgs');
        $result = $this->game->eventChoice($data);
        self::ajaxResponse();
    }

    public function move()
    {
        self::setAjaxMode();
        $moves = self::getArg("moves", AT_json, true);
        $bribeAmount = self::getArg("bribeAmount", AT_alphanum, false);
        // $args = self::getArg('actionArgs', AT_json, true);
        Utils::validateJSonAlphaNum($moves, 'moves');
        // $this->validateJSonAlphaNum($args, 'actionArgs');
        $cardId = self::getArg("cardId", AT_alphanum, true);
        $result = $this->game->move($cardId, $moves,$bribeAmount);
        self::ajaxResponse();
    }

    public function pass()
    {
        self::setAjaxMode();
        $result = $this->game->pass();
        self::ajaxResponse();
    }

    public function restart()
    {
        self::setAjaxMode();
        $result = $this->game->restart();
        self::ajaxResponse();
    }

    public function placeRoad()
    {
        self::setAjaxMode();
        $border = self::getArg("border", AT_alphanum, true);
        $result = $this->game->placeRoad($border);
        self::ajaxResponse();
    }

    public function placeSpy()
    {
        self::setAjaxMode();
        $cardId = self::getArg("cardId", AT_alphanum, true);
        $specialAbility = self::getArg("specialAbility", AT_alphanum, false);
        $result = $this->game->placeSpy($cardId, $specialAbility);
        self::ajaxResponse();
    }

    public function playCard()
    {
        self::setAjaxMode();
        $card_id = self::getArg("cardId", AT_alphanum, true);
        $side = self::getArg("side", AT_alphanum, true);
        $bribe = self::getArg("bribeAmount", AT_posint, false);
        $result = $this->game->playCard($card_id, $side, $bribe);
        self::ajaxResponse();
    }

    public function purchaseCard()
    {
        self::setAjaxMode();
        $card_id = self::getArg("cardId", AT_alphanum, true);
        $result = $this->game->purchaseCard($card_id);
        self::ajaxResponse();
    }

    public function eventCardPashtunwaliValues()
    {
        self::setAjaxMode();
        $suit = self::getArg("suit", AT_alphanum, true);
        $result = $this->game->eventCardPashtunwaliValues($suit);
        self::ajaxResponse();
    }
    
    public function eventCardOtherPersuasiveMethods()
    {
        self::setAjaxMode();
        $playerId = self::getArg("playerId", AT_alphanum, true);
        $result = $this->game->eventCardOtherPersuasiveMethods($playerId);
        self::ajaxResponse();
    }

    public function eventCardRebuke()
    {
        self::setAjaxMode();
        $regionId = self::getArg("regionId", AT_alphanum, true);
        $result = $this->game->eventCardRebuke($regionId);
        self::ajaxResponse();
    }


    public function eventCardRumor()
    {
        self::setAjaxMode();
        $playerId = self::getArg("playerId", AT_alphanum, true);
        $result = $this->game->eventCardRumor($playerId);
        self::ajaxResponse();
    }

    public function purchaseGift()
    {
        self::setAjaxMode();
        $value = self::getArg("value", AT_alphanum, true);
        $card_id = self::getArg("cardId", AT_alphanum, true);
        $bribeAmount = self::getArg("bribeAmount", AT_alphanum, false);
        $result = $this->game->purchaseGift($value, $card_id,$bribeAmount);
        self::ajaxResponse();
    }

    public function selectPiece()
    {
        self::setAjaxMode();
        $pieceId = self::getArg("pieceId", AT_alphanum, true);
        $result = $this->game->selectPiece($pieceId);
        self::ajaxResponse();
    }

    public function skipSpecialAbility()
    {
        self::setAjaxMode();
        $result = $this->game->skipSpecialAbility();
        self::ajaxResponse();
    }

    public function specialAbilitySafeHouse()
    {
        self::setAjaxMode();
        $cardId = self::getArg("cardId", AT_alphanum, false);
        $result = $this->game->specialAbilitySafeHouse($cardId);
        self::ajaxResponse();
    }

    public function tax()
    {
        self::setAjaxMode();
        $cardId = self::getArg("cardId", AT_alphanum, true);
        $market = self::getArg("market", AT_alphanum, true);
        $players = self::getArg("players", AT_alphanum, true);
        $bribeAmount = self::getArg("bribeAmount", AT_alphanum, false);
        $result = $this->game->tax($cardId, $market, $players,$bribeAmount);
        self::ajaxResponse();
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
