<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;
use PaxPamir\Managers\WakhanCards;

trait WakhanRadicalizeTrait
{

  // .##......##....###....##....##.##.....##....###....##....##
  // .##..##..##...##.##...##...##..##.....##...##.##...###...##
  // .##..##..##..##...##..##..##...##.....##..##...##..####..##
  // .##..##..##.##.....##.#####....#########.##.....##.##.##.##
  // .##..##..##.#########.##..##...##.....##.#########.##..####
  // .##..##..##.##.....##.##...##..##.....##.##.....##.##...###
  // ..###..###..##.....##.##....##.##.....##.##.....##.##....##

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  function radicalize($deckCard, $discardCard)
  {
    $back = $deckCard['back'];
    $front = $discardCard['front'];

    $result = $this->radicalizeSelectCard($back, $front);
    Notifications::log('result', $result);
    if ($result === null) {
      return;
    }
    PaxPamirPlayers::incRupees(WAKHAN_PLAYER_ID, -$result['cost']);
    Globals::incRemainingActions(-1);
    $card = $result['card'];
    $row = $result['row'];
    $column = $result['column'];
    $rupeesOnCards = $this->putRupeesOnCards($result['cost'], $row, $column);

    // add all rupees on card to player totals. Then put them in rupee_pool location

    $receivedRupees = count(Tokens::getInLocation(Locations::marketRupees($result['row'], $result['column'])));
    PaxPamirPlayers::incRupees(WAKHAN_PLAYER_ID, $receivedRupees);
    Tokens::moveAllInLocation(Locations::marketRupees($result['row'], $result['column']), RUPEE_SUPPLY);

    if ($card['type'] === EVENT_CARD) {
      // Execute event / move to player events
      return;
    }
    // Court Card

    $bribe = $this->determineBribe($card, PaxPamirPlayers::get(WAKHAN_PLAYER_ID), null, 'playCard');

    if ($bribe !== null && $bribe['amount'] > PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getRupees()) {
      Cards::insertOnTop($card['id'], DISCARD);
      Notifications::wakhanRadicalizeDiscard($card, $rupeesOnCards, $receivedRupees, Locations::market($row, $column), DISCARD);
      return;
    } else if ($bribe !== null) {
      // Pay bribe
    }
    // Play card to court and resolve impact icons
    $side = $back['rowSide'][$front['rowSideArrow']] === TOP_LEFT ? 'left' : 'right';
    $firstCard = $this->moveCardToCourt(WAKHAN_PLAYER_ID, $card['id'], $side);
    // Get card data again to have up to date state
    $card = Cards::get($card['id']);
    Notifications::wakhanRadicalize($card, $firstCard, $side, $rupeesOnCards, $receivedRupees, Locations::market($row, $column), Locations::court(WAKHAN_PLAYER_ID));
    $this->wakhanResolveImpactIcons($card, $back, $front);
  }

  function radicalizeSelectCard($back, $front)
  {
    $marketHasDominanceCheck = $this->marketHasDominanceCheck();
    if ($marketHasDominanceCheck) {
      // if dominant coalition: choose cheapest patriot loyal to dominant coalition, then cheapest card with mose army and or road impact icons
      // if no dominance coalition: cheapest card with most spy / tribe impact icons
      // in case of tie use highest card number
    }
    $row = $back['rowSide'][$front['rowSideArrow']] === TOP_LEFT ? 0 : 1;
    $column = $back['columnNumbers'][$front['columnArrow']];
    Notifications::log('radicalize', ['row' => $row, 'column' => $column]);

    // Get card from row specified by card
    $result = $this->radicalizeSelectCardInRow($row, $column, PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getRupees());
    if ($result !== null) {
      return $result;
    }
    // If no card was available in specified row, try again with other row
    $result = $this->radicalizeSelectCardInRow($row === 0 ? 1 : 0, $column, PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getRupees());
    return $result;
  }

  function radicalizeSelectCardInRow($row, $startColumn, $wakhanRupees)
  {
    $result = null;
    for ($column = $startColumn; $column >= 0; $column--) {
      $courtCard = Cards::getInLocation(Locations::market($row, $column))->first();
      if ($courtCard === null) {
        continue;
      }
      Notifications::log('card', $courtCard);
      $cost = $this->getCardCost(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $column, $courtCard);
      // Card is valid for purchase if it is not a dominance check, has not had rupees placed on it, and Wakhan has enough rupees
      if ($courtCard['used'] === 0 && !$this->isDominanceCheck($courtCard) && $cost <= $wakhanRupees) {
        return [
          'card' => $courtCard,
          'column' => $column,
          'cost' => $cost,
          'row' => $row,
        ];
      }
    }
    return $result;
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

}
