<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\PaxPamirPlayers;
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
    $actionStack = ActionStack::get();

    $next = $actionStack[count($actionStack) - 1];

    return $next['data'];
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

    $actionStack = ActionStack::get();
    $action = array_pop($actionStack);
    ActionStack::set($actionStack);

    if ($action['type'] !== DISPATCH_DISCARD) {
      throw new \feException("Not a valid action");
    }

    if (!in_array($from, $action['data']['from'])) {
      throw new \feException("Not allowed to discard from location");
    }

    $card = Cards::get($cardId);

    if (isset($action['data']['loyalty']) && $action['data']['loyalty'] !== $card['loyalty']) {
      throw new \feException("Card does not have the required loyalty");
    }

    $player = PaxPamirPlayers::get();
    $playerId = $player->getId();

    $explodedLocation = explode('_', $card['location']);
    if ($explodedLocation[0] !== $from || $explodedLocation[1] !== strval($playerId)) {
      throw new \feException("Card is not in the discard location");
    }

    $this->resolveDiscardCard($card, $player, $from);
    $this->nextState('dispatchAction');
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

  function isValidCardForDiscardFilter($card, $data)
  {
    $loyaltyFilter = isset($data['loyalty']) ? $data['loyalty'] === $card['loyalty'] : true;
    $regionFilter = isset($data['region']) ? $data['region'] === $card['region'] : true;
    $suitFilter = isset($data['suit']) ? $data['suit'] === $card['suit'] : true;
    return $loyaltyFilter && $regionFilter && $suitFilter;
  }

  // loyalty?: string; region?: string; suit?: string;
  function dispatchDiscard($actionStack)
  {
    $next = $actionStack[count($actionStack) - 1];

    $playerId = $next['playerId'];
    $from = $next['data']['from'];
    $loyalty = isset($next['data']['loyalty']) ? $next['data']['loyalty'] : null;
    $player = PaxPamirPlayers::get($playerId);
    $data = $next['data'];

    // Determine if there are cards left to discard
    $availableCards = 0;

    if (in_array(COURT, $from)) {
      $courtCards = array_filter($player->getCourtCards(), function ($card) use ($data) {
        return $this->isValidCardForDiscardFilter($card, $data);
      });
      $availableCards += count($courtCards);
    }
    if (in_array(HAND, $from)) {
      $handCards = $player->getHandCards();
      $availableCards += count($handCards);
    }
    // If cards available transition to discard state
    // otherwise cancel action and continue to next action
    if ($availableCards > 0 && $playerId === WAKHAN_PLAYER_ID) {
      // TODO: add logic to discard card
      array_pop($actionStack);
      ActionStack::next($actionStack);
    } else if ($availableCards > 0) {
      // ActionStack::set($actionStack);
      $this->nextState('discard', $playerId);
    } else {
      array_pop($actionStack);
      ActionStack::next($actionStack);
    }
  }

  function dispatchDiscardAllCourtCardsOfType($actionStack)
  {
    /**
     * Three cases:
     * 1. Player has no cards of type
     * 2. Player has cards of type of which at least one with leverage
     * 3. Player has cards without leverage only.
     */
    $action = $actionStack[count($actionStack) - 1];

    $playerId = $action['playerId'];
    $player = PaxPamirPlayers::get($playerId);

    $courtCards = $player->getCourtCards();
    // $loyalty =  $player->getLoyalty();
    $data = $action['data'];

    $cardsToDiscard = Utils::filter($courtCards, function ($card) use ($data) {
      $checkLoyalty = isset($data['loyalty']) ? $data['loyalty'] === $card['loyalty'] : true;
      $checkSuit = isset($data['suit']) ? $data['suit'] === $card['suit'] : true;
      $checkRegion = isset($data['region']) ? $data['region'] === $card['region'] : true;
      return $checkLoyalty && $checkSuit && $checkRegion;
    });

    // 1. Player has no cards of type, so next action can be resolved
    if (count($cardsToDiscard) === 0) {
      array_pop($actionStack);
      ActionStack::set($actionStack);
      $this->nextState('dispatchAction');
      return;
    }
    $hasCardsWithLeverage = Utils::array_some($cardsToDiscard, function ($card) {
      return in_array(LEVERAGE, $card['impactIcons']);
    });
    // Transition to discard step where player needs to select cards one by one
    if ($hasCardsWithLeverage && !$player->isWakhan()) {
      $actionStack[] = ActionStack::createAction(DISPATCH_DISCARD, $playerId, array_merge($data, ['from' => [COURT]]));
      ActionStack::set($actionStack);
      $this->nextState('dispatchAction');
      return;
    }
    // 3. Discard all cards
    array_pop($actionStack);
    foreach ($cardsToDiscard as $index => $card) {
      $actionStack[] = ActionStack::createAction(DISPATCH_DISCARD_SINGLE_CARD, $playerId, [
        'cardId' => $card['id'],
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

    if ($from === COURT && $card['suit'] === POLITICAL) {
      $this->checkOverthrowCard($card, $cardOwner);
    }
    if ($from === COURT) {
      $this->checkLeverage($card, $cardOwner);
    }
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
      PaxPamirPlayers::incRupees($player->getId(), -$amountOfRupeesToReturn);
      Notifications::returnRupeesForDiscardingLeveragedCard($player, $amountOfRupeesToReturn);
    }

    $additionalDiscards = 2 - $amountOfRupeesToReturn;
    if ($additionalDiscards === 0 || $player->isWakhan()) {
      return;
    }
    Notifications::additionalDiscardsForDiscardingLeveragedCard($player, $additionalDiscards);
    // Add actions to action stack in case additional cards need to be discarded
    for ($i = $additionalDiscards; $i > 0; $i--) {
      ActionStack::push(ActionStack::createAction(
        DISPATCH_DISCARD,
        $player->getId(),
        [
          'from' => [COURT, HAND]
        ]
      ));
    }
  }


  function returnSpies($cardId, $player)
  {
    $from = 'spies_' . $cardId;
    $spiesOnCard = Tokens::getInLocation($from)->toArray();
    $spies = [];
    if (count($spiesOnCard) === 0) {
      return;;
    }

    foreach ($spiesOnCard as $index => $spy) {
      $spyOwnerId = explode("_", $spy['id'])[1];
      $to = 'cylinders_' . $spyOwnerId;
      $state = Tokens::insertOnTop($spy['id'], $to);
      if (array_key_exists($spyOwnerId, $spies)) {
        $spies[$spyOwnerId][] = [
          'tokenId' => $spy['id'],
          'weight' => $state,
        ];
      } else {
        $spies[$spyOwnerId] = [
          [
            'tokenId' => $spy['id'],
            'weight' => $state,
          ]
        ];
      }
    };
    Notifications::returnAllSpies($player,$cardId, $spies);
  }
}
