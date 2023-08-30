<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use Paxpamir\Managers\PaxPamirPlayers;
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
    $player = PaxPamirPlayers::get();
    $playerId = $player->getId();
    ActionStack::push([
      ActionStack::createAction(DISPATCH_TRANSITION, $playerId, [
        'transition' => 'nextTurn'
      ]),
      ActionStack::createAction(DISPATCH_REFILL_MARKET_DRAW_CARDS, $playerId, []),
      ActionStack::createAction(DISPATCH_REFILL_MARKET_SHIFT_CARDS, $playerId, []),
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
      Notifications::shiftMarketMessage($action['playerId']);
    }
    foreach ($cardMoves as $index => $move) {
      Notifications::shiftMarket($move);
    }


    ActionStack::set($actionStack);
    $this->nextState('dispatchAction');
  }

  function dispatchRefillMarketDrawCards($actionStack)
  {
    $player = PaxPamirPlayers::get();

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

  function handleInstability($dominanceCheckCards, $actionStack)
  {
    Notifications::message(clienttranslate('Second Dominance Check card in the market: Instability'));
    $action = $actionStack[count($actionStack) - 1];
    $playerId = $action['playerId'];

    $cards = [];
    foreach ($dominanceCheckCards as $index => $card) {
      $cards[] = $card['id'];
      $from = $card['location'];
      $to = DISCARD;
      Cards::move($card['id'], DISCARD);
      Notifications::discardEventCardFromMarket($card, $from, $to);
    }

    $actionStack[] = ActionStack::createAction(DISPATCH_REFILL_MARKET_SHIFT_CARDS, $playerId, []);
    $actionStack[] = ActionStack::createAction(DISPATCH_DOMINANCE_CHECK_SETUP, $playerId, [
      'cards' => $cards,
    ]);

    ActionStack::next($actionStack);
  }

  function isDominanceCheck($card)
  {
    return $card['type'] === EVENT_CARD && $card['discarded']['effect'] === ECE_DOMINANCE_CHECK;
  }
}
