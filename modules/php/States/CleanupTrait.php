<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
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

  /*
        Triggered at end of a players turn. Checks if player needs to discard any cards from court or hand.
    */
  function stCleanup()
  {
    /**
     * 0. Set cards back to unused
     * 1. discard court cards if needed
     * 2. discard hand cards if needed
     * 3. discard events in leftmost column (TODO)
     * 4. refreshMarket
     */

    Cards::resetUsed();
    $player = Players::get();
    $playerId = $player->getId();
    $discards = $player->checkDiscards();
    Notifications::log('discard',$discards);
    if ($discards['court'] > 0) {
      $this->pushActionsToActionStack(
        [
          [
            'action' => 'cleanup',
            'playerId' => $playerId,
            'data' => [],
          ],
          [
            'action' => DISPATCH_DISCARD,
            'playerId' => $playerId,
            'data' => [
              'from' => [COURT]
            ]
          ]
        ]
      );
      $this->nextState('dispatchAction');
      // $this->gamestate->nextState('discardCourt');
    } else if ($discards['hand'] > 0) {
      $this->pushActionsToActionStack(
        [
          [
            'action' => 'cleanup',
            'playerId' => $playerId,
            'data' => [],
          ],
          [
            'action' => DISPATCH_DISCARD,
            'playerId' => $playerId,
            'data' => [
              'from' => [HAND]
            ]
          ]
        ]
      );
      $this->nextState('dispatchAction');
    } else {
      $this->gamestate->nextState('discardEvents');
    }
  }

  function stCleanupDiscardEvents()
  {
    // Discard events at front of market
    $interrupt = $this->checkAndDiscardIfEvent('market_0_0');
    if ($interrupt) {
      return;
    }
    $interrupt = $this->checkAndDiscardIfEvent('market_1_0');
    if ($interrupt) {
      return;
    }
    $this->gamestate->nextState('refreshMarket');
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

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

  function resolveEventDiscardEffect($event, $location)
  {
    Notifications::log('event', $event);
    switch ($event) {
        // cards 101-104
      case ECE_DOMINANCE_CHECK:
        $this->resolveDominanceCheck();
        break;
        // card 105
      case ECE_MILITARY_SUIT:
        $this->resolveFavoredSuitChange(MILITARY, ECE_MILITARY_SUIT);
        break;
        // card 106
      case ECE_EMBARRASSEMENT_OF_RICHES:
        Events::embarrassementOfRiches();
        break;
        // card 107
      case ECE_DISREGARD_FOR_CUSTOMS:
        // No additional action needed at this point
        break;
        // card 108
      case ECE_FAILURE_TO_IMPRESS:
        Events::failureToImpress();
        break;
        // card 109
      case ECE_RIOTS_IN_PUNJAB:
        Events::riot(PUNJAB);
        break;
        // card 110
      case ECE_RIOTS_IN_HERAT:
        Events::riot(HERAT);
        break;
        // card 111
      case ECE_NO_EFFECT:
        // Event has a discard effect instead of purchasse effect
        Events::publicWithdrawal($location);
        break;
        // card 112
      case ECE_RIOTS_IN_KABUL:
        Events::riot(KABUL);
        break;
        // card 113
      case ECE_RIOTS_IN_PERSIA:
        Events::riot(PERSIA);
        break;
        // card 114
      case ECE_CONFIDENCE_FAILURE:
        Events::confidenceFailure();
        break;
        // card 115
      case ECE_INTELLIGENCE_SUIT:
        $this->resolveFavoredSuitChange(INTELLIGENCE, ECE_INTELLIGENCE_SUIT);
        break;
        // card 116
      case ECE_POLITICAL_SUIT:
        $this->resolveFavoredSuitChange(POLITICAL, ECE_POLITICAL_SUIT);
        break;
      default:
        Notifications::log('no match for event', []);
    }
  }
}
