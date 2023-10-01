<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Core\Stats;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Log;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\PaxPamirPlayers;
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

  function purchaseGift($value, $cardId, $offeredBribeAmount = null)
  {
    self::checkAction('purchaseGift');

    $cardInfo = Cards::get($cardId);
    if (!$this->isValidCardAction($cardInfo, GIFT)) {
      return;
    }

    $value = intval($value);
    $player = PaxPamirPlayers::get();
    $resolved = $this->resolveBribe($cardInfo, $player, GIFT, $offeredBribeAmount);
    if (!$resolved) {
      $this->nextState('playerActions');
      return;
    }
    // Get player again, because bribe has been paid
    if ($offeredBribeAmount !== null && intval($offeredBribeAmount) > 0) {
      $player = PaxPamirPlayers::get();
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

    Notifications::purchaseGift(
      $player,
      $value,
    );
    Stats::incGiftCount($playerId,1);

    Cards::setUsed($cardId, 1); // unavailable
    // if not free action reduce remaining actions.
    if (!$this->isCardFavoredSuit($cardInfo)) {
      Globals::incRemainingActions(-1);
    }

    $actionStack = [
      ActionStack::createAction(DISPATCH_TRANSITION, $player->getId(), [
        'transition' => 'playerActions'
      ]),
      ActionStack::createAction(DISPATCH_PLACE_CYLINDER, $playerId, [
        'value' => $value,
        'type' => GIFT,
      ]),
      ActionStack::createAction(DISPATCH_PAY_RUPEES_TO_MARKET, $player->getId(), [
        'cost' => $value
      ]),
    ];

    ActionStack::next($actionStack);
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...
}
