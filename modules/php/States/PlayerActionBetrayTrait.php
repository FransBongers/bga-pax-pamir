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

trait PlayerActionBetrayTrait
{
  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  function argAcceptPrize()
  {
    $actionStack = ActionStack::get();

    $next = $actionStack[count($actionStack) - 1];
    return [
      'cardId' => $next['data']['cardId'],
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

  function acceptPrize($accept)
  {
    self::checkAction('acceptPrize');
    $actionStack = ActionStack::get();
    $current = array_pop($actionStack);

    if ($current['type'] !== DISPATCH_ACCEPT_PRIZE_CHECK) {
      throw new \feException("Not a valid action");
    }
    $cardId = $current['data']['cardId'];
    $card = Cards::get($cardId);
    $prize = $card['prize'];
    $player = PaxPamirPlayers::get();

    if ($accept) {
      Notifications::acceptPrize($cardId, $player);
      $actionStack[] = ActionStack::createAction(DISPATCH_TAKE_PRIZE, $player->getId(), [
        'cardId' => $cardId
      ],);

      if ($prize !== null && $this->checkLoyaltyChange($player, $prize)) {
        $actionStack = array_merge($actionStack, $this->getLoyaltyChangeActions($player->getId(), $prize));
      }
    } else {
      Cards::insertOnTop($cardId, Locations::discardPile());
      Notifications::declinePrize($cardId, $player);
    }

    ActionStack::set($actionStack);
    $this->nextState('dispatchAction');
  }


  function betray($cardId, $betrayedCardId, $offeredBribeAmount = null)
  {
    self::checkAction('betray');

    $cardInfo = Cards::get($cardId);
    $this->isValidCardAction($cardInfo, BETRAY);

    $betrayedCardInfo = Cards::get($betrayedCardId);
    $betrayedPlayerId = intval(explode('_', $betrayedCardInfo['location'])[1]);


    $player = PaxPamirPlayers::get();
    $resolved = $this->resolveBribe($cardInfo, $player, BETRAY, $offeredBribeAmount);
    if (!$resolved) {
      $this->nextState('playerActions');
      return;
    }
    // Get player again, because bribe has been paid
    if ($offeredBribeAmount !== null && intval($offeredBribeAmount) > 0) {
      $player = PaxPamirPlayers::get();
    };

    // Card should be in a player's court
    if (!Utils::startsWith($betrayedCardInfo['location'], 'court')) {
      throw new \feException("Card is not in a players court");
    }

    if (PaxPamirPlayers::get($betrayedPlayerId)->hasSpecialAbility(SA_BODYGUARDS) && $betrayedCardInfo['suit'] === POLITICAL) {
      throw new \feException("Player has Bodyguard special ability");
    }

    // if ($acceptPrize && $betrayedCardInfo['prize'] === null) {
    //   throw new \feException("Card does not have a prize");
    // }
    $spiesOnCard = Tokens::getInLocation(['spies', $betrayedCardId])->toArray();
    // Notifications::log('spies',[$spiesOnCard[0]]);

    $playerId = $player->getId();
    // Card should have spy of active player
    if (!Utils::array_some($spiesOnCard, function ($cylinder) use ($playerId) {
      return intval(explode('_', $cylinder['id'])[1]) === $playerId;
    })) {
      throw new \feException("No spy on selected card");
    }

    if ($player->getRupees() < 2) {
      throw new \feException("Player does not have enough rupees to pay for action");
    }

    Cards::setUsed($cardId, 1);
    // if not free action reduce remaining actions.
    if (!$this->isCardFavoredSuit($cardInfo)) {
      Globals::incRemainingActions(-1);
    }
    $rupeesOnCards = $this->payActionCosts(2);
    PaxPamirPlayers::incRupees($playerId, -2);
    Notifications::betray($betrayedCardInfo, $player, $rupeesOnCards);
    Stats::incBetrayCount($playerId,1);

    $actionStack =
      [
        ActionStack::createAction('playerActions', $playerId, [])
      ];

    if ($betrayedCardInfo['prize'] !== null) {
      $actionStack[] = ActionStack::createAction(DISPATCH_ACCEPT_PRIZE_CHECK, $playerId, ['cardId' => $betrayedCardId,]);
    }

    $actionStack[] = ActionStack::createAction(DISPATCH_DISCARD_BETRAYED_CARD, $playerId, [
      'cardId' => $betrayedCardId,
      'cardOwnerId' => $betrayedPlayerId,
    ]);

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

  function dispatchTakePrize($actionStack)
  {
    $current = array_pop($actionStack);
    ActionStack::set($actionStack);
    $cardId = $current['data']['cardId'];
    $playerId = $current['playerId'];

    Cards::move($cardId, Locations::prizes($playerId));
    Notifications::takePrize($cardId, PaxPamirPlayers::Get($playerId));

    $this->nextState('dispatchAction');
  }
}
