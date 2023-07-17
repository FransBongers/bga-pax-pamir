<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait DiscardTrait
{

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  function argDiscard()
  {
    $actionStack = Globals::getActionStack();

    $next = $actionStack[count($actionStack) - 1];
    return [
      'from' => $next['data']['from'],
      'loyalty' => isset($next['data']['loyalty']) ? $next['data']['loyalty'] : null,
    ];
  }

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

  function discard($cardId, $from)
  {
    self::checkAction('discard');

    $actionStack = Globals::getActionStack();
    $action = array_pop($actionStack);
    Globals::setActionStack($actionStack);

    if ($action['action'] !== DISPATCH_DISCARD) {
      throw new \feException("Not a valid action");
    }

    if (!in_array($from, $action['data']['from'])) {
      throw new \feException("Not allowed to discard from location");
    }

    $card = Cards::get($cardId);

    if (isset($action['data']['loyalty']) && $action['data']['loyalty'] !== $card['loyalty']) {
      throw new \feException("Card does not have the required loyalty");
    }

    $player = Players::get();
    $playerId = $player->getId();

    $explodedLocation = explode('_', $card['location']);
    if ($explodedLocation[0] !== $from || $explodedLocation[1] !== strval($playerId)) {
      throw new \feException("Card is not in the discard location");
    }
    
    $this->resolveDiscardCard($card, $player, $from);
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

  function dispatchDiscard($actionStack)
  {
    $next = $actionStack[count($actionStack) - 1];

    $playerId = $next['playerId'];
    $from = $next['data']['from'];
    $loyalty = isset($next['data']['loyalty']) ? $next['data']['loyalty'] : null;
    $player = Players::get($playerId);

    // Determine if there are cards left to discard
    $availableCards = 0;
    if (in_array(COURT,$from)) {
      $courtCards = array_filter($player->getCourtCards(),function ($card) use ($loyalty) {
        if ($loyalty === null) {
          return true;
        }
        return $card['loyalty'] === $loyalty;
      });
      $availableCards += count($courtCards);
    }
    if (in_array(HAND,$from)) {
      $handCards = $player->getHandCards();
      $availableCards += count($handCards);
    }
    // If cards available transition to discard state
    // otherwise cancel action and continue to next action
    if ($availableCards > 0) {
      $this->nextState('discard', $playerId);
    } else {
      array_pop($actionStack);
      Globals::setActionStack($actionStack);
      $this->nextState('dispatchAction');
    } 
  }


  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  /**
   * Function which handles the actual discarding so it can be called
   * from player triggered action or from game state
   */
  function resolveDiscardCard($card, $player, $from, $to = DISCARD, $cardOwner = null)
  {
    $cardOwner = $cardOwner === null ? $player : $cardOwner;
    $cardId = $card['id'];
    Notifications::discardMessage($card, $player, $from, $cardOwner);

    if ($from === COURT) {
      $this->returnSpies($card['id'], $player);
    }
    Cards::insertOnTop($cardId, $to);
    Notifications::discard($card, $cardOwner, $from, $to);

    if ($from === COURT) {
      $this->checkLeverage($card, $cardOwner);
    }

    $this->nextState('dispatchAction');
  }

  /**
   * Checks if card is leveraged. Decreases players rupees and returns number of cards 
   * a player needs to discard in case player does not have enough rupees.
   */
  function checkLeverage($card, $player)
  {
    if (!in_array(LEVERAGE, $card['impactIcons'])) {
      return;
    }
    $rupees = $player->getRupees();
    $amountOfRupeesToReturn = min($rupees, 2);
    if ($amountOfRupeesToReturn > 0) {
      Players::incRupees($player->getId(), -$amountOfRupeesToReturn);
      Notifications::returnRupeesForDiscardingLeveragedCard($player, $amountOfRupeesToReturn);
    }

    $additionalDiscards = 2 - $amountOfRupeesToReturn;
    if ($additionalDiscards === 0) {
      return;
    }
    Notifications::additionalDiscardsForDiscardingLeveragedCard($player, $additionalDiscards);
    // Add actions to action stack in case additional cards need to be discarded
    for ($i = $additionalDiscards; $i > 0; $i--) {
      $this->pushActionsToActionStack(
        [
          [
            'action' => DISPATCH_DISCARD,
            'playerId' => $player->getId(),
            'data' => [
              'from' => [COURT, HAND]
            ]
          ]
        ]
      );
    }
  }


  function returnSpies($cardId, $player)
  {
    $from = 'spies_' . $cardId;
    $spiesOnCard = Tokens::getInLocation($from)->toArray();
    $moves = [];
    if (count($spiesOnCard) === 0) {
      return;;
    }

    foreach ($spiesOnCard as $index => $spy) {
      $spyOwner = explode("_", $spy['id'])[1];
      $to = 'cylinders_' . $spyOwner;
      $state = Tokens::insertOnTop($spy['id'], $to);
      $moves[] =  [
        'from' => $from,
        'to' => $to,
        'tokenId' => $spy['id'],
        'weight' => $state,
      ];
    };
    Notifications::returnSpies($player, $moves);
  }

  function reassignCourtState($playerId = null)
  {
    $player = Players::get($playerId);
    $courtCards = $player->getCourtCards();
    $courtCardStates = [];
    foreach ($courtCards as $index => $card) {
      $cardId = $card['id'];
      $state = $index + 1;
      Cards::setState($cardId, $state);
      $courtCardStates[] = [
        'cardId' => $cardId,
        'state' => $state,
      ];
    };
    Notifications::updateCourtCardStates($courtCardStates, $player->getId());
  }

}
