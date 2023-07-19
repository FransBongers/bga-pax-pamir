<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Log;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait PlayerActionGiftTrait
{
  //  .########..##..........###....##....##.########.########.
  //  .##.....##.##.........##.##....##..##..##.......##.....##
  //  .##.....##.##........##...##....####...##.......##.....##
  //  .########..##.......##.....##....##....######...########.
  //  .##........##.......#########....##....##.......##...##..
  //  .##........##.......##.....##....##....##.......##....##.
  //  .##........########.##.....##....##....########.##.....##

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  function purchaseGift($value, $cardId,$offeredBribeAmount = null)
  {
    self::checkAction('purchaseGift');

    $cardInfo = Cards::get($cardId);
    if (!$this->isValidCardAction($cardInfo, GIFT)) {
      return;
    }

    $player = Players::get();
    $resolved = $this->resolveBribe($cardInfo, $player,GIFT, $offeredBribeAmount);
    if (!$resolved) {
      $this->nextState('playerActions');
      return;
    }
    // Get player again, because bribe has been paid
    if ($offeredBribeAmount !== null && intval($offeredBribeAmount) > 0) {
      $player = Players::get();
    };

    $playerId = $player->getId();
    $rupees = $player->getRupees();
    // Player should have enough rupees
    if ($rupees < $value) {
      throw new \feException("Not enough rupees to pay for the gift.");
    }
    $location = 'gift_' . $value . '_' . $playerId;
    $tokenInLocation = Tokens::getInLocation($location)->first();
    if ($tokenInLocation != null) {
      throw new \feException("Already a cylinder in selected location.");
    }

    $from = "cylinders_" . $playerId;
    $cylinder = Tokens::getTopOf($from);

    // If null player needs to select cylinder from somewhere else
    if ($cylinder != null) {
      Tokens::move($cylinder['id'], $location);
      Cards::setUsed($cardId, 1); // unavailable
    }

    // if not free action reduce remaining actions.
    if (!$this->isCardFavoredSuit($cardInfo)) {
      Globals::incRemainingActions(-1);
    }


    $rupeesOnCards = $this->payActionCosts($value);
    Players::incRupees($playerId, -intval($value));

    Notifications::purchaseGift(
      $player,
      $value,
      [
        'from' => $from,
        'to' => $location,
        'tokenId' => $cylinder['id'],
      ],
      $rupeesOnCards
    );

    $this->gamestate->nextState('playerActions');
  }



  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...



}