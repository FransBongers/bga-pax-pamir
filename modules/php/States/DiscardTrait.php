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

  function argDiscardCourt()
  {
    $player = Players::getActive();
    $countPoliticalSuit = $player->getSuitTotals()[POLITICAL];
    $countCourtCards = count($player->getCourtCards());

    return array(
      'numberOfDiscards' => $countCourtCards - $countPoliticalSuit - 3
    );
  }

  function argDiscardHand()
  {
    $player = Players::getActive();
    $countIntelligenceSuit = $player->getSuitTotals()[INTELLIGENCE];
    $countHandCards = count($player->getHandCards());

    return array(
      'numberOfDiscards' => $countHandCards - $countIntelligenceSuit - 2
    );
  }

  function argDiscardLeverage()
  {
    $data = Globals::getLeverageData();

    return array(
      'numberOfDiscards' => $data['numberOfDiscards'],
    );
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

  /**
   * Discard cards action when needed
   */
  function discardCards($cardIds)
  {
    self::checkAction('discardCards');

    // Checks depend on state
    $state = $this->gamestate->state(true, false, true);
    // discardLeverage, discardCourt, discardHand

    $player = Players::get();
    $playerId = $player->getId();

    $discardCourt = $state['name'] === 'discardCourt';
    $discardHand = $state['name'] === 'discardHand';
    $discardLeverage = $state['name'] === 'discardLeverage';
    /**
     * for each card
     * if state is discardHand and location not hand throw error
     * if state is discardCourt and location not court throw error
     * check if enough cards have been discarded
     */
    $cards = Cards::getMany($cardIds)->toArray();
    foreach ($cards as $index => $card) {
      $inHand = $card['location'] === 'hand_' . $playerId;
      $inCourt = $card['location'] === 'court_' . $playerId;
      if (!($inCourt || $inHand) || ($discardHand && !$inHand) || ($discardCourt && !$inCourt)) {
        throw new \feException("Card is not in the discard location");
      }
    }
    $numberOfCardsToDiscard = $this->getNumberOfCardsToDiscard($player, $state);
    $numberOfSelectedCards = count($cardIds);
    if ($numberOfCardsToDiscard !== $numberOfSelectedCards) {
      throw new \feException("Incorrect number of discards");
    }

    $next = null;
    if ($discardLeverage) {
      $next = Globals::getLeverageData();
    } else {
      $next = [
        'activePlayerId' => $playerId,
        'transition' => 'cleanup',
      ];
    }

    $this->executeDiscards($cards, $player, $next);
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  /**
   * Checks if card is leveraged. Decreases players rupees and returns number of cards 
   * a player needs to discard in case player does not have enough rupees.
   */
  function checkAndHandleLeverage($cardId, $cardOwnerId)
  {
    $card = Cards::get($cardId);
    if (!in_array(LEVERAGE, $card['impactIcons'])) {
      return 0;
    }
    $player = Players::get($cardOwnerId);
    $rupees = $player->getRupees();
    $amountOfRupeesToReturn = min($rupees, 2);
    if ($amountOfRupeesToReturn > 0) {
      Players::incRupees($cardOwnerId, -$amountOfRupeesToReturn);
      Notifications::leveragedCardDiscard($card, $player, $amountOfRupeesToReturn);
    }
    // return number of cards that need to be discarded due to lack of rupees
    return 2 - $amountOfRupeesToReturn;
  }

  function getNumberOfCardsToDiscard($player, $state)
  {
    $discardCourt = $state['name'] === 'discardCourt';
    $discardHand = $state['name'] === 'discardHand';
    $discardLeverage = $state['name'] === 'discardLeverage';
    if ($discardLeverage) {
      $data = Globals::getLeverageData();
      return $data['numberOfDiscards'];
    }
    $discards = $player->checkDiscards();
    if ($discardHand) {
      return $discards['hand'];
    };
    if ($discardCourt) {
      return $discards['court'];
    };
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

  function removeSpiesFromCard($cardId)
  {
    $from = 'spies_' . $cardId;
    $spiesOnCard = Tokens::getInLocation($from)->toArray();
    $moves = [];
    if (count($spiesOnCard) === 0) {
      return $moves;
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

    return $moves;
  }

  function resolveDiscardCards($cards, $cardsOwner, $prizeTaker = null)
  {
    $playerId = $cardsOwner->getId();
    $state = Cards::getExtremePosition(true, DISCARD);
    $numberOfAdditionalCardsToDiscardDueToLeverage = 0;
    foreach ($cards as $card) {
      $cardId = $card['id'];
      $spyMoves = [];
      $isCourtCard = Utils::startsWith($card['location'], 'court');
      if ($isCourtCard) {
        $spyMoves = $this->removeSpiesFromCard($cardId);
      }
      $state += 1;
      if (!$isCourtCard || $prizeTaker === null) {
        Cards::move($cardId, DISCARD, $state);
      } else {
        Cards::move($cardId, Locations::prizes($prizeTaker->getId()), $state);
      }

      if (!$isCourtCard) {
        Notifications::discardFromHand($card, $cardsOwner);
      } else if ($prizeTaker === null) {
        Notifications::discardFromCourt($card, $cardsOwner, $spyMoves);
        $numberOfAdditionalCardsToDiscardDueToLeverage += $this->checkAndHandleLeverage($cardId, $playerId);
      } else {
        Notifications::discardAndTakePrize($card, $prizeTaker, $spyMoves, $playerId === $prizeTaker->getId() ? null : $playerId);
        $numberOfAdditionalCardsToDiscardDueToLeverage += $this->checkAndHandleLeverage($cardId, $playerId);
      };
    }
    return $numberOfAdditionalCardsToDiscardDueToLeverage;
  }

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
  function executeDiscards($cards, $cardsOwner, $next, $prizeTaker = null)
  {
    $playerId = $cardsOwner->getId();
    $numberOfAdditionalCardsToDiscardDueToLeverage = $this->resolveDiscardCards($cards, $cardsOwner, $prizeTaker);

    $playerCourtCards = $cardsOwner->getCourtCards();
    $playerHandCards = $cardsOwner->getHandCards();
    $totalCards = count($playerCourtCards) + count($playerHandCards);
    if ($numberOfAdditionalCardsToDiscardDueToLeverage > 0 && $totalCards > 0 && $totalCards > $numberOfAdditionalCardsToDiscardDueToLeverage) {
      // Player needs to select cards to discard due to leverage
      Globals::setLeverageData([
        'activePlayerId' => $next['activePlayerId'],
        'transition' => $next['transition'],
        'numberOfDiscards' => $numberOfAdditionalCardsToDiscardDueToLeverage,
      ]);
      $this->nextState('discardLeverage', $playerId);
    } else if ($numberOfAdditionalCardsToDiscardDueToLeverage > 0 && $totalCards > 0 && $totalCards <= $numberOfAdditionalCardsToDiscardDueToLeverage) {
      // Player needs to discard all remaining cards due to leverage
      Notifications::leveragedDiscardRemaining($cardsOwner);
      $this->resolveDiscardCards(array_merge($playerCourtCards, $playerHandCards), $cardsOwner);
      $this->reassignCourtState($playerId);
      $this->nextState($next['transition'], $next['activePlayerId']);
    } else {
      $this->reassignCourtState($playerId);
      $this->nextState($next['transition'], $next['activePlayerId']);
    }
  }
}
