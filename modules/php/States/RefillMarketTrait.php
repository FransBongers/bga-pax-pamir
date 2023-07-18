<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait RefillMarketTrait
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
   * Refill market at end of a players turn
   * 1. Fill all empty spaces by moving cards (incl rupees) to their leftmost position
   * 2. Draw new cards to fill any empty spaces, starting with leftmost returning market to normal size if possible
   *  => in empty column top row first.
   */
  function stRefillMarket()
  {
    $player = Players::get();
    $playerId = $player->getId();
    $this->pushActionsToActionStack([
      [
        'action' => DISPATCH_TRANSITION,
        'playerId' => $playerId,
        'data' => [
          'transition' => 'nextTurn'
        ]
      ],
      [
        'action' => DISPATCH_REFILL_MARKET_DRAW_CARDS,
        'playerId' => $playerId,
        'data' => [],
      ],
      [
        'action' => DISPATCH_REFILL_MARKET_SHIFT_CARDS,
        'playerId' => $playerId,
        'data' => []
      ]
    ]);
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

  function dispatchRefillMarketShiftCards($actionStack)
  {
    $emptySpaces = [[], []];
    $cardMoves = [];
    $action = array_pop($actionStack);

    // Move cards to leftmost position
    for ($column = 0; $column < 6; $column++) {
      for ($row = 0; $row < 2; $row++) {
        $fromLocation = 'market_' . $row . '_' . $column;
        $card = Cards::getTopOf($fromLocation);
        if ($card == null) {
          $emptySpaces[$row][] = $column;
        } else {
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

    if (count($cardMoves) > 0) {
      Notifications::shiftMarket($cardMoves, $action['playerId']);
    }

    Globals::setActionStack($actionStack);
    $this->nextState('dispatchAction');
  }

  function dispatchRefillMarketDrawCards($actionStack)
  {
    $player = Players::get();

    $cards = Cards::getOfTypeInLocation('card', 'market');
    Notifications::log('cards', $cards);

    $dominanceCheckCards = Utils::filter($cards, function ($card) {
      return $this->isDominanceCheck($card);
    });

    Notifications::log('$numberOfDominanceChecksInMarket', count($dominanceCheckCards));

    for ($column = 0; $column <= 5; $column++) {
      for ($row = 0; $row <= 1; $row++) {
        $hasCard = Utils::array_some($cards, function ($card) use ($row, $column) {
          return $card['location'] === implode('_', ['market', $row, $column]);
        });
        if ($hasCard) {
          continue;
        }
        $card = Cards::pickOneForLocation('deck', ['market', $row, $column]);
        if ($card === null) {
          continue;
        }
        $cardId = $card['id'];
        $from = 'deck';
        $to = 'market_' . $row . '_' . $column;
        Notifications::drawMarketCard($player, $cardId, $from, $to);

        if ($this->isDominanceCheck($card)) {
          $dominanceCheckCards[] = $card;
        };
        if (count($dominanceCheckCards) >= 2) {
          $this->handleInstability($dominanceCheckCards, $actionStack);
          return;
        }
      }
    }

    array_pop($actionStack);
    Globals::setActionStack($actionStack);
    $this->nextState('dispatchAction');
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function handleInstability($dominanceCheckCards, $actionStack)
  {
    Notifications::message(clienttranslate('Instability'));
    $action = $actionStack[count($actionStack) - 1];
    $playerId = $action['playerId'];

    foreach ($dominanceCheckCards as $index => $card) {
      $from = $card['location'];
      $to = DISCARD;
      Cards::move($card['id'], DISCARD);
      Notifications::discardEventCardFromMarket($card,$from,$to);
    }

    $this->resolveDominanceCheck(2);

    $actionStack[] =       [
      'action' => DISPATCH_REFILL_MARKET_SHIFT_CARDS,
      'playerId' => $playerId,
      'data' => []
    ];

    Globals::setActionStack($actionStack);
    $this->nextState('dispatchAction');
  }

  function isDominanceCheck($card)
  {
    return $card['type'] === EVENT_CARD && $card['discarded']['effect'] === ECE_DOMINANCE_CHECK;
  }
}
