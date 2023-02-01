<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait RefreshMarketTrait
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
   * Refresh market at end of a players turn
   */
  function stRefreshMarket()
  {

    // Refill market

    $empty_top = array();
    $empty_bottom = array();
    $card_moves = array();
    $new_cards = array();

    for ($i = 0; $i < 6; $i++) {
      $from_location = 'market_0_' . $i;
      $card = Cards::getTopOf($from_location);
      if ($card == null) {
        $empty_top[] = $i;
      } else {
        Cards::setUsed($card["id"], 0); // unavailable false
        if (count($empty_top) > 0) {
          $to_locaction = 'market_0_' . array_shift($empty_top);
          Cards::move($card['id'], $to_locaction);
          Tokens::moveAllInLocation([$from_location, 'rupees'], [$to_locaction, 'rupees']);
          $empty_top[] = $i;
          $card_moves[] = array(
            'cardId' => $card['id'],
            'from' => $from_location,
            'to' => $to_locaction
          );

          self::notifyAllPlayers("refreshMarket", '', array(
            'cardMoves' => $card_moves,
            'newCards' => $new_cards,
          ));

          $this->gamestate->nextState('refresh_market');
          return;
        }
      }

      $from_location = 'market_1_' . $i;
      $card = Cards::getInLocation($from_location)->first();
      if ($card == null) {
        $empty_bottom[] = $i;
      } else {
        Cards::setUsed($card["id"], 0);
        if (count($empty_bottom) > 0) {
          $to_locaction = 'market_1_' . array_shift($empty_bottom);
          Cards::move($card['id'], $to_locaction);
          Tokens::moveAllInLocation([$from_location, 'rupees'], [$to_locaction, 'rupees']);
          $empty_bottom[] = $i;
          $card_moves[] = array(
            'cardId' => $card['id'],
            'from' => $from_location,
            'to' => $to_locaction
          );

          self::notifyAllPlayers("refreshMarket", '', array(
            'cardMoves' => $card_moves,
            'newCards' => $new_cards,
          ));

          $this->gamestate->nextState('refresh_market');
          return;
        }
      }
    }

    foreach ($empty_top as $i) {
      $card = Cards::pickOneForLocation('deck', ['market_0', $i]);
      $new_cards[] = array(
        'cardId' => $card['id'],
        'from' => 'deck',
        'to' => 'market_0_' . $i
      );
    }

    foreach ($empty_bottom as $i) {
      $card = Cards::pickOneForLocation('deck', ['market_1', $i]);
      $new_cards[] = array(
        'cardId' => $card['id'],
        'from' => 'deck',
        'to' => 'market_1_' . $i
      );
    }

    self::notifyAllPlayers("refreshMarket", clienttranslate('The market has been refreshed.'), array(
      'cardMoves' => $card_moves,
      'newCards' => $new_cards,
    ));

    $this->gamestate->nextState('next_turn');
  }
}
