<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
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

    $playerId = self::getActivePlayerId();

    $courtCards = Cards::getInLocation(['court', $playerId], null, null, 1);
    foreach ($courtCards as $card) {
      Cards::setUsed($card["id"], 0);
    }

    $discards = Players::get()->checkDiscards();

    if ($discards['court'] > 0) {
      $this->gamestate->nextState('discardCourt');
    } elseif ($discards['hand'] > 0) {
      $this->gamestate->nextState('discardHand');
    } else {
      $this->gamestate->nextState('discardEvents');
    }
  }

  function stCleanupDiscardEvents()
  {

    // Discard events at front of market
    // NOTE: perhaps move this to separate state for handling execution of the event
    $topCard = Cards::getInLocation('market_0_0')->first();
    $bottomCard = Cards::getInLocation('market_1_0')->first();
    if ($topCard != null && $this->cards[$topCard['id']]['type'] == EVENT_CARD) {
      Cards::move($topCard['id'], 'discard');
      // $card_name = $this->cards[$topCard['id']]['name'];
      self::notifyAllPlayers("discardCard", 'event is discarded from the market.', array(
        // 'card_name' => $card_name,
        'cardId' => $topCard['id'],
        'from' => 'market_0_0'
      ));
    };
    if ($bottomCard != null && $this->cards[$bottomCard['id']]['type'] == EVENT_CARD) {
      Cards::move($bottomCard['id'], 'discard');
      // $card_name = $this->cards[$bottomCard['id']]['name'];
      self::notifyAllPlayers("discardCard", 'event is discarded from the market.', array(
        // 'card_name' => $card_name,
        'cardId' => $bottomCard['id'],
        'from' => 'market_1_0'
      ));
    };

    $this->gamestate->nextState('refreshMarket');
  }
}
