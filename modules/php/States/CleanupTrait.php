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

    $player_id = self::getActivePlayerId();

    $court_cards = Cards::getInLocation(['court', $player_id], null, null, 1);
    foreach ($court_cards as $card) {
      Cards::setUsed($card["id"], 0);
    }

    $discards = Players::get()->checkDiscards();

    if ($discards['court'] > 0) {
      $this->gamestate->nextState('discard_court');
    } elseif ($discards['hand'] > 0) {
      $this->gamestate->nextState('discard_hand');
    } else {
      $this->gamestate->nextState('discard_events');
    }
  }

  function stCleanupDiscardEvents()
  {

    // Discard events at front of market
    // NOTE: perhaps move this to separate state for handling execution of the event
    $top_card = Cards::getInLocation('market_0_0')->first();
    $bottom_card = Cards::getInLocation('market_1_0')->first();
    if ($top_card != null && $this->cards[$top_card['id']]['type'] == EVENT_CARD) {
      Cards::move($top_card['id'], 'discard');
      // $card_name = $this->cards[$top_card['id']]['name'];
      self::notifyAllPlayers("discardCard", 'event is discarded from the market.', array(
        // 'card_name' => $card_name,
        'cardId' => $top_card['id'],
        'from' => 'market_0_0'
      ));
    };
    if ($bottom_card != null && $this->cards[$bottom_card['id']]['type'] == EVENT_CARD) {
      Cards::move($bottom_card['id'], 'discard');
      // $card_name = $this->cards[$bottom_card['id']]['name'];
      self::notifyAllPlayers("discardCard", 'event is discarded from the market.', array(
        // 'card_name' => $card_name,
        'cardId' => $bottom_card['id'],
        'from' => 'market_1_0'
      ));
    };

    $this->gamestate->nextState('refresh_market');
  }
}
