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
   * 1. Fill all empty spaces by moving cards (incl rupees) to their leftmost position
   * 2. Draw new cards to fill any empty spaces, starting with leftmost returning market to normal size if possible
   *  => in empty column top row first.
   */
  function stRefreshMarket()
  {
    $emptySpaces = [[], []];
    $cardMoves = [];
    $newCards = [];

    // Move cards to leftmost position
    for ($column = 0; $column < 6; $column++) {
      for ($row = 0; $row < 2; $row++) {
        $fromLocation = 'market_' . $row . '_' . $column;
        $card = Cards::getTopOf($fromLocation);
        if ($card == null) {
          $emptySpaces[$row][] = $column;
        } else {
          // Note (Frans): perhaps we can do this with single query at end of refresh
          Cards::setUsed($card["id"], 0); // unavailable false
          if (count($emptySpaces[$row]) > 0) {
            $toLocaction = 'market_' . $row . '_' . array_shift($emptySpaces[$row]);
            Cards::move($card['id'], $toLocaction);
            Tokens::moveAllInLocation([$fromLocation, 'rupees'], [$toLocaction, 'rupees']);
            $cardMoves[] = array(
              'cardId' => $card['id'],
              'from' => $fromLocation,
              'to' => $toLocaction
            );
            $emptySpaces[$row][] = $column;
          }
        }
      }
    }

    // Fill empty spaces
    for ($column = 0; $column < 6; $column++) {
      for ($row = 0; $row < 2; $row++) {
        if (count($emptySpaces[$row]) > 0 && $emptySpaces[$row][0] == $column) {
          $card = Cards::pickOneForLocation('deck', ['market',$row, $column]);
          $newCards[] = array(
            'cardId' => $card['id'],
            'from' => 'deck',
            'to' => 'market_'.$row.'_' . $column
          );
          array_shift($emptySpaces[$row]);
        }
      }
    }

    self::notifyAllPlayers("refreshMarket", clienttranslate('The market is refilled. New cards: ${logTokenNewCards}'), array(
      'cardMoves' => $cardMoves,
      'newCards' => $newCards,
      'logTokenNewCards' => $newCards
    ));

    $this->gamestate->nextState('nextTurn');
  }
}
