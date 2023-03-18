<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
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

    $discards = Players::get()->checkDiscards();

    if ($discards['court'] > 0) {
      $this->gamestate->nextState('discardCourt');
    } elseif ($discards['hand'] > 0) {
      $this->gamestate->nextState('discardHand');
    } else {
      $this->gamestate->nextState('discardEvents');
    }
  }

  function checkAndDiscardIfEvent($location)
  {
    $card = Cards::getInLocation($location)->first();
    if ($card != null && $card['type'] == EVENT_CARD) {
      $state = Cards::getExtremePosition(true, DISCARD);
      Cards::move($card['id'], DISCARD, $state + 1);
      Notifications::discardEventCardFromMarket($card, $location);
      // self::notifyAllPlayers("discardCard", '${player_name} discards event card from the market: ${logTokenCardLarge}', array(
      //   'player_name' => self::getActivePlayerName(),
      //   'cardId' => $card['id'],
      //   'from' => $location,
      //   'logTokenCardLarge' => $card['id']
      // ));
    };
  }

  function stCleanupDiscardEvents()
  {
    // Discard events at front of market
    $this->checkAndDiscardIfEvent('market_0_0');
    $this->checkAndDiscardIfEvent('market_1_0');

    $this->gamestate->nextState('refreshMarket');
  }
}
