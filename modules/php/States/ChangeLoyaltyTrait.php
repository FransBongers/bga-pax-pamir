<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;
use PaxPamir\Models\PaxPamirPlayer;

trait ChangeLoyaltyTrait
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

  /**
   * Part of set up when players need to select loyalty.
   */
  function chooseLoyalty($coalition)
  {
    self::checkAction('chooseLoyalty');

    $player = PaxPamirPlayers::get();
    $playerId = $player->getId();

    $actionStack = ActionStack::get();
    $action = array_pop($actionStack);

    if ($action['playerId'] !== $playerId) {
      throw new \feException("Not a valid action for player");
    }

    PaxPamirPlayers::setLoyalty($playerId, $coalition);
    Notifications::setupLoyalty($player,$coalition);

    ActionStack::next($actionStack);
  }

  // .########..####..######..########.....###....########..######..##.....##
  // .##.....##..##..##....##.##.....##...##.##......##....##....##.##.....##
  // .##.....##..##..##.......##.....##..##...##.....##....##.......##.....##
  // .##.....##..##...######..########..##.....##....##....##.......#########
  // .##.....##..##........##.##........#########....##....##.......##.....##
  // .##.....##..##..##....##.##........##.....##....##....##....##.##.....##
  // .########..####..######..##........##.....##....##.....######..##.....##

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  function dispatchChangeLoyalty($actionStack)
  {
    $action = array_pop($actionStack);
    ActionStack::set($actionStack);

    $playerId = $action['playerId'];
    $coalition = $action['data']['coalition'];

    // Players::get($playerId)->setLoyalty($coalition);
    PaxPamirPlayers::setLoyalty($playerId, $coalition);

    Notifications::changeLoyalty($coalition);

    // TODO: Only check regions where player has tribes for ruler change?
    foreach (Game::get()->regions as $region => $regionInfo) {
      Map::checkRulerChange($region);
    }


    $this->nextState('dispatchAction');
  }

  function dispatchDiscardPatriots($actionStack)
  {
    /**
     * Three cases:
     * 1. Player has not patriots
     * 2. Player has patriots with of which at least one with leverage
     * 3. Player has patriots without leverage only.
     */
    $action = $actionStack[count($actionStack) - 1];

    $playerId = $action['playerId'];
    $player = PaxPamirPlayers::get($playerId);

    $courtCards = $player->getCourtCards();
    $loyalty =  $player->getLoyalty();

    $patriotsToDiscard = Utils::filter($courtCards, function ($card) use ($loyalty) {
      return $card['loyalty'] !== null && $card['loyalty'] === $loyalty;
    });

    // 1. Player has no patriots, so next action can be resolved
    if (count($patriotsToDiscard) === 0) {
      array_pop($actionStack);
      ActionStack::set($actionStack);
      $this->nextState('dispatchAction');
      return;
    }
    $hasPatriotWithLeverage = Utils::array_some($patriotsToDiscard, function ($card) {
      return in_array(LEVERAGE, $card['impactIcons']);
    });
    // Transition to discard step where player needs to select patriots
    if ($hasPatriotWithLeverage) {
      $actionStack[] = ActionStack::createAction(DISPATCH_DISCARD, $playerId, [
        'from' => [COURT],
        'loyalty' => $loyalty,
      ]);
      ActionStack::set($actionStack);
      $this->nextState('dispatchAction');
      return;
    }
    // 3. Discard all patriots
    array_pop($actionStack);
    foreach ($patriotsToDiscard as $index => $patriot) {
      $actionStack[] = ActionStack::createAction(DISPATCH_DISCARD_SINGLE_CARD, $playerId, [
        'cardId' => $patriot['id'],
        'from' => COURT,
        'to' => DISCARD
      ]);
    }
    ActionStack::set($actionStack);
    $this->nextState('dispatchAction');
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  /**
   * Returns action stack items needed for loyalty change
   */
  function getLoyaltyChangeActions($playerId, $coalition)
  {
    return [
      ActionStack::createAction('changeLoyalty', $playerId, [
        'coalition' => $coalition
      ]),
      ActionStack::createAction(DISPATCH_DISCARD_PATRIOTS, $playerId, [
        'coalition' => $coalition
      ]),
      ActionStack::createAction('returnGiftsAndDiscardPrizes', $playerId, [
        'coalition' => $coalition
      ]),
    ];
  }

  /**
   * Check if player changes loyalty
   */
  function checkLoyaltyChange($player, $coalition)
  {
    $currentLoyaly = $player->getLoyalty();
    if ($currentLoyaly === $coalition) {
      return false;
    } else {
      return true;
    }
  }

  function changeLoyaltyReturnGiftsDiscardPrizes($action)
  {

    $playerId = $action['playerId'];
    $coalition = $action['data']['coalition'];

    Notifications::changeLoyaltyMessage($coalition);

    $this->returnGifts($playerId);
    $this->discardPrizes($playerId);

    $this->nextState('dispatchAction');
  }

  function returnGifts($playerId)
  {
    $giftValues = [2, 4, 6];
    foreach ($giftValues as $index => $value) {
      $location = 'gift_' . $value . '_' . $playerId;
      $tokenInLocation = Tokens::getInLocation($location)->first();
      if ($tokenInLocation === null) {
        continue;
      }
      $to = 'cylinders_' . $playerId;
      $state = Tokens::insertOnTop($tokenInLocation['id'], $to);
      Notifications::returnCylinder(PaxPamirPlayers::get($playerId), $playerId, $location, $tokenInLocation['id'], $state, 'returnGift');
    };
  }

  function discardPrizes($playerId)
  {
    $from = Locations::prizes($playerId);
    $prizes = Cards::getInLocation($from)->toArray();

    foreach ($prizes as $index => $card) {
      $to = Locations::discardPile();

      Cards::insertOnTop($card['id'], $to);
    };
    if (count($prizes) > 0) {
      Notifications::discardPrizes($prizes, $playerId);
    }
  }
}
