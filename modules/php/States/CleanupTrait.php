<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait CleanupTrait
{

  // ..######..########....###....########.########
  // .##....##....##......##.##......##....##......
  // .##..........##.....##...##.....##....##......
  // ..######.....##....##.....##....##....######..
  // .......##....##....#########....##....##......
  // .##....##....##....##.....##....##....##......
  // ..######.....##....##.....##....##....########

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  /**
   * Triggered at end of a players turn. Checks if player needs to discard any cards from court or hand.
   */
  function stCleanup()
  {
    /**
     * 0. Set cards and tokens back to unused
     * 1. discard court cards if needed
     * 2. discard hand cards if needed
     * 3. discard events in leftmost column (TODO)
     * 4. refillMarket
     */

    Cards::resetUsed();
    Tokens::resetUsed();

    $player = Players::get();
    $playerId = $player->getId();

    $actionStack = [
      ActionStack::createAction(DISPATCH_TRANSITION, $playerId, [
        'transition' => 'refillMarket'
      ]),
    ];

    $actionStack = $this->addActionIfEventCardInLocation($actionStack,'market_1_0', $playerId);
    $actionStack = $this->addActionIfEventCardInLocation($actionStack,'market_0_0', $playerId);
    $actionStack[] = ActionStack::createAction(DISPATCH_CLEANUP_CHECK_HAND, $playerId, []);
    $actionStack[] = ActionStack::createAction(DISPATCH_CLEANUP_CHECK_COURT, $playerId, []);

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

  function dispatchCleanupCheckCourt($actionStack)
  {
    $action = $actionStack[count($actionStack) - 1];
    $playerId = $action['playerId'];
    $player = Players::get($playerId);

    $totals = $player->getSuitTotals();

    $playerHasToDiscard = $totals['courtCards'] - $totals['political'] - 3 > 0;

    if ($playerHasToDiscard) {
      $actionStack[] = ActionStack::createAction(DISPATCH_DISCARD, $playerId, [
        'from' => [COURT]
      ]);
    } else {
      array_pop($actionStack);
    }
    ActionStack::next($actionStack);
  }

  function dispatchCleanupCheckHand($actionStack)
  {
    $action = $actionStack[count($actionStack) - 1];
    $playerId = $action['playerId'];
    $player = Players::get($playerId);

    $totals = $player->getSuitTotals();
    $handCards = $player->getHandCards();

    $playerHasToDiscard = count($handCards) - $totals['intelligence'] - 2 > 0;

    if ($playerHasToDiscard) {
      $actionStack[] = ActionStack::createAction(DISPATCH_DISCARD, $playerId, [
        'from' => [HAND]
      ]);
    } else {
      array_pop($actionStack);
    }
    ActionStack::next($actionStack);
  }

  function dispatchCleanupDiscardEvent($actionStack)
  {
    $action = array_pop($actionStack);
    $playerId = $action['playerId'];
    $cardId = $action['data']['cardId'];
    $location = $action['data']['location'];
    $card = Cards::get($cardId);

    $player = Players::get($playerId);

    $to = in_array($cardId, ['card_106', 'card_107']) ? ACTIVE_EVENTS : DISCARD;

    Cards::insertOnTop($cardId, $to);
    Notifications::discardEventCardFromMarket($card, $location, $to);

    $actionStack = Events::resolveDiscardEffect($actionStack,$card, $location, $playerId);
    // Notifications::log('extraActions', $extraActions);
    // if ($extraActions !== null) {
    //   $actionStack = array_merge($actionStack, $extraActions);
    // }
    ActionStack::next($actionStack);
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function addActionIfEventCardInLocation($actionStack,$location, $playerId)
  {
    $card = Cards::getInLocation($location)->first();

    if ($card !== null && $card['type'] == EVENT_CARD) {
      $actionStack[] = ActionStack::createAction(DISPATCH_CLEANUP_DISCARD_EVENT, $playerId, [
        'cardId' => $card['id'],
        'location' => $location,
      ]);
    }

    return $actionStack;
  }

  function checkAndDiscardIfEvent($location)
  {
    $card = Cards::getInLocation($location)->first();
    if ($card != null && $card['type'] == EVENT_CARD) {
      $cardId = $card['id'];
      $to = in_array($cardId, ['card_106', 'card_107']) ? ACTIVE_EVENTS : DISCARD;
      Cards::insertOnTop($card['id'], $to);
      Notifications::discardEventCardFromMarket($card, $location, $to);
      $this->resolveEventDiscardEffect($card['discarded']['effect'], $location);

      // Only card that can interrupt flow while discard event cards from market
      if ($cardId === 'card_114') {
        return true;
      }
    };
    return false;
  }
}
