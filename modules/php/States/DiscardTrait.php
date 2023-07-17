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
    Notifications::log('actionStack', $actionStack);

    $next = $actionStack[count($actionStack) - 1];
    return [
      'from' => $next['data']['from'],
      'loyalty' => isset($next['data']['loyalty']) ? $next['data']['loyalty'] : null,
    ];
  }

  // function argDiscardCourt()
  // {
  //   $player = Players::getActive();
  //   $countPoliticalSuit = $player->getSuitTotals()[POLITICAL];
  //   $countCourtCards = count($player->getCourtCards());

  //   return array(
  //     'numberOfDiscards' => $countCourtCards - $countPoliticalSuit - 3
  //   );
  // }

  // function argDiscardHand()
  // {
  //   $player = Players::getActive();
  //   $countIntelligenceSuit = $player->getSuitTotals()[INTELLIGENCE];
  //   $countHandCards = count($player->getHandCards());

  //   return array(
  //     'numberOfDiscards' => $countHandCards - $countIntelligenceSuit - 2
  //   );
  // }

  // function argDiscardLeverage()
  // {
  //   $data = Globals::getLeverageData();

  //   return array(
  //     'numberOfDiscards' => $data['numberOfDiscards'],
  //   );
  // }

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
    Notifications::log('discard', [
      'cardId' => $cardId,
      'from' => $from
    ]);
    $actionStack = Globals::getActionStack();
    $action = array_pop($actionStack);
    Globals::setActionStack($actionStack);

    if ($action['action'] !== 'discard') {
      throw new \feException("Not a valid action");
    }

    if (!in_array($from, $action['data']['from'])) {
      throw new \feException("Not allowed to discard from location");
    }

    $card = Cards::get($cardId);

    if (isset($action['data']['loyalty']) && $action['data']['loyalty'] !== $card['loyalty'] ) {
      throw new \feException("Card does not have the required loyalty");
    }

    $player = Players::get();
    $playerId = $player->getId();

    $explodedLocation = explode('_', $card['location']);
    if ($explodedLocation[0] !== $from || $explodedLocation[1] !== strval($playerId)) {
      throw new \feException("Card is not in the discard location");
    }

    $this->resolveDiscardCard($card,$player,$from);
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
  function resolveDiscardCard($card,$player,$from,$to = DISCARD,$cardOwner = null)
  {
    $cardOwner = $cardOwner === null ? $player : $cardOwner;
    $cardId = $card['id'];
    Notifications::discardMessage($card, $player, $from,$cardOwner);

    if ($from === COURT) {
      $this->returnSpies($card['id'],$player);
    }
    Cards::insertOnTop($cardId, $to);
    Notifications::discard($card,$cardOwner,$from,$to);

    if ($from === COURT) {
      $this->checkLeverage($card,$cardOwner);
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
    Notifications::additionalDiscardsForDiscardingLeveragedCard($player,$additionalDiscards);
    // Add actions to action stack in case additional cards need to be discarded
    for ($i = $additionalDiscards; $i > 0; $i--) {
      Notifications::log('need to discard cards',[]);
      $this->pushActionsToActionStack(
        [
          [
            'action' => 'discard',
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

  /**
   * Checks if card is leveraged. Decreases players rupees and returns number of cards 
   * a player needs to discard in case player does not have enough rupees.
   */
  // function checkAndHandleLeverage($cardId, $cardOwnerId)
  // {
  //   $card = Cards::get($cardId);
  //   if (!in_array(LEVERAGE, $card['impactIcons'])) {
  //     return 0;
  //   }
  //   $player = Players::get($cardOwnerId);
  //   $rupees = $player->getRupees();
  //   $amountOfRupeesToReturn = min($rupees, 2);
  //   if ($amountOfRupeesToReturn > 0) {
  //     Players::incRupees($cardOwnerId, -$amountOfRupeesToReturn);
  //     Notifications::leveragedCardDiscard($card, $player, $amountOfRupeesToReturn);
  //   }
  //   // return number of cards that need to be discarded due to lack of rupees
  //   return 2 - $amountOfRupeesToReturn;
  // }

  // function getNumberOfCardsToDiscard($player, $state)
  // {
  //   $discardCourt = $state['name'] === 'discardCourt';
  //   $discardHand = $state['name'] === 'discardHand';
  //   $discardLeverage = $state['name'] === 'discardLeverage';
  //   if ($discardLeverage) {
  //     $data = Globals::getLeverageData();
  //     return $data['numberOfDiscards'];
  //   }
  //   $discards = $player->checkDiscards();
  //   if ($discardHand) {
  //     return $discards['hand'];
  //   };
  //   if ($discardCourt) {
  //     return $discards['court'];
  //   };
  // }

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

  // function removeSpiesFromCard($cardId)
  // {
  //   $from = 'spies_' . $cardId;
  //   $spiesOnCard = Tokens::getInLocation($from)->toArray();
  //   $moves = [];
  //   if (count($spiesOnCard) === 0) {
  //     return $moves;
  //   }

  //   foreach ($spiesOnCard as $index => $spy) {
  //     $spyOwner = explode("_", $spy['id'])[1];
  //     $to = 'cylinders_' . $spyOwner;
  //     $state = Tokens::insertOnTop($spy['id'], $to);
  //     $moves[] =  [
  //       'from' => $from,
  //       'to' => $to,
  //       'tokenId' => $spy['id'],
  //       'weight' => $state,
  //     ];
  //   };

  //   return $moves;
  // }

  // function resolveDiscardCards($cards, $cardsOwner, $prizeTaker = null)
  // {
  //   $playerId = $cardsOwner->getId();
  //   $state = Cards::getExtremePosition(true, DISCARD);
  //   $numberOfAdditionalCardsToDiscardDueToLeverage = 0;
  //   foreach ($cards as $card) {
  //     $cardId = $card['id'];
  //     $spyMoves = [];
  //     $isCourtCard = Utils::startsWith($card['location'], 'court');
  //     if ($isCourtCard) {
  //       $spyMoves = $this->removeSpiesFromCard($cardId);
  //     }
  //     $state += 1;
  //     if (!$isCourtCard || $prizeTaker === null) {
  //       Cards::move($cardId, DISCARD, $state);
  //     } else {
  //       Cards::move($cardId, Locations::prizes($prizeTaker->getId()), $state);
  //     }

  //     if (!$isCourtCard) {
  //       Notifications::discardFromHand($card, $cardsOwner);
  //     } else if ($prizeTaker === null) {
  //       Notifications::discardFromCourt($card, $cardsOwner, $spyMoves);
  //       $numberOfAdditionalCardsToDiscardDueToLeverage += $this->checkAndHandleLeverage($cardId, $playerId);
  //     } else {
  //       Notifications::discardAndTakePrize($card, $prizeTaker, $spyMoves, $playerId === $prizeTaker->getId() ? null : $playerId);
  //       $numberOfAdditionalCardsToDiscardDueToLeverage += $this->checkAndHandleLeverage($cardId, $playerId);
  //     };
  //   }
  //   return $numberOfAdditionalCardsToDiscardDueToLeverage;
  // }

  /**
   * 1. Discard cards
   * 2. Check leverage
   * 3. Check overthrow
   * 4. Continue
   */
  /**
   * cardsOwner is a player
   * prizeTake is a player
   */
  // function executeDiscards($cards, $cardsOwner, $next, $prizeTaker = null)
  // {
  //   $playerId = $cardsOwner->getId();
  //   $numberOfAdditionalCardsToDiscardDueToLeverage = $this->resolveDiscardCards($cards, $cardsOwner, $prizeTaker);

  //   $playerCourtCards = $cardsOwner->getCourtCards();
  //   $playerHandCards = $cardsOwner->getHandCards();
  //   $totalCards = count($playerCourtCards) + count($playerHandCards);
  //   if ($numberOfAdditionalCardsToDiscardDueToLeverage > 0 && $totalCards > 0 && $totalCards > $numberOfAdditionalCardsToDiscardDueToLeverage) {
  //     // Player needs to select cards to discard due to leverage
  //     Globals::setLeverageData([
  //       'activePlayerId' => $next['activePlayerId'],
  //       'transition' => $next['transition'],
  //       'numberOfDiscards' => $numberOfAdditionalCardsToDiscardDueToLeverage,
  //     ]);
  //     $this->nextState('discardLeverage', $playerId);
  //   } else if ($numberOfAdditionalCardsToDiscardDueToLeverage > 0 && $totalCards > 0 && $totalCards <= $numberOfAdditionalCardsToDiscardDueToLeverage) {
  //     // Player needs to discard all remaining cards due to leverage
  //     Notifications::leveragedDiscardRemaining($cardsOwner);
  //     $this->resolveDiscardCards(array_merge($playerCourtCards, $playerHandCards), $cardsOwner);
  //     $this->reassignCourtState($playerId);
  //     $this->nextState($next['transition'], $next['activePlayerId']);
  //   } else {
  //     $this->reassignCourtState($playerId);
  //     $this->nextState($next['transition'], $next['activePlayerId']);
  //   }
  // }
}
