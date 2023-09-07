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

trait WakhanTurnTrait
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

  function stWakhanTurn()
  {
    Globals::setWakhanActive(true);
    Globals::setRemainingActions(2);
    Notifications::message('Wakhan starts their turn');

    // 1. Draw Wakhan card
    $wakhanCards = $this->drawWakhanCard();
    if ($wakhanCards[DECK] === null) {
      $this->reshuffleWakhanDeck();
      $wakhanCards = $this->drawWakhanCard();
    }

    // 2. Start of turn abilities

    // 3. Actions:
    // Check Wakhan ambition
    // Execute actions in order until both actions used or no valid choices available
    $this->radicalize($wakhanCards[DECK], $wakhanCards[DISCARD]);

    // Available bonus actions



    // $nextPlayerId = PaxPamirPlayers::getNextId(WAKHAN_PLAYER_ID);
    // Globals::setWakhanActive(false);
    // $this->stCleanup(PaxPamirPlayers::get(WAKHAN_PLAYER_ID));
    // // Below two can be removed when Wakhan does cleanup?
    // Cards::resetUsed();
    // Tokens::resetUsed();
    // $this->nextState('prepareNextTurn', $nextPlayerId);
    $this->gamestate->nextState('cleanup');
  }

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

    // return [
    //   'bribeeId' => $rulers[$region],
    //   'amount' => count($rulerTribes)
    // ];
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

  function wakhanResolveImpactIcons($card, $back, $front)
  {
    $loyalty = $this->getWakhanLoyalty($front['pragmaticLoyalty']);
    $impactIcons = $card['impactIcons'];
    foreach ($impactIcons as $index => $icon) {
      switch ($icon) {
        case ARMY:
          $this->wakhanPlaceArmy($card, $loyalty, $front);
        case LEVERAGE:
        case ROAD:
        case SPY:
        case TRIBE:
        case ECONOMIC_SUIT:
        case INTELLIGENCE_SUIT:
        case MILITARY_SUIT:
        case POLITICAL_SUIT:
      }
    }
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...


  function drawWakhanCard()
  {
    $currentTopOfDeck = WakhanCards::getTopOf(DECK);
    $currentTopDiscardPile = WakhanCards::getTopOf(DISCARD);

    WakhanCards::insertOnTop($currentTopOfDeck['id'], DISCARD);
    $discardPile = [
      'from' => $currentTopDiscardPile === null ? null : $currentTopDiscardPile['id'],
      'to' => $currentTopOfDeck['id'],
    ];
    $newTopOfDeck = WakhanCards::getTopOf(DECK);
    $deck = [
      'from' => $currentTopOfDeck['id'],
      'to' => $newTopOfDeck === null ? null : $newTopOfDeck['id'],
    ];
    Notifications::wakhanDrawCard($deck, $discardPile);
    return [
      DECK => $newTopOfDeck,
      DISCARD => $currentTopOfDeck,
    ];
  }

  function marketHasDominanceCheck()
  {
    $cards = Cards::getOfTypeInLocation('card', 'market');

    return Utils::array_some($cards, function ($card) {
      return $this->isDominanceCheck($card);
    });
  }

  function reshuffleWakhanDeck()
  {
    $currentTopDiscardPile = WakhanCards::getTopOf(DISCARD)['id'];
    WakhanCards::moveAllInLocation(DISCARD, DECK);
    WakhanCards::shuffle(DECK);
    $topOfDeck = WakhanCards::getTopOf(DECK)['id'];
    Notifications::wakhanReshuffleDeck($topOfDeck, $currentTopDiscardPile);
  }

  function wakhanPlaceArmy($card, $loyalty, $front)
  {
    $regionId = $card['region'];
    $pool = $this->locations['pools'][$loyalty];

    $army = Tokens::getTopOf($pool);
    if ($army === null) {
      // Pool is empty. Select piece according to card order
    }
    $this->resolvePlaceArmy(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $army, $loyalty, $regionId);
  }

  function getWakhanLoyalty($pragmaticLoyalty)
  {
    $otherPlayers = Utils::filter(PaxPamirPlayers::getAll()->toArray(), function ($player) {
      return $player->getId() !== WAKHAN_PLAYER_ID;
    });
    $otherPlayerLoyalties = array_map(function ($player) {
      return $player->getLoyalty();
    }, $otherPlayers);
    return Utils::filter($pragmaticLoyalty, function ($coalition) use ($otherPlayerLoyalties) {
      return !in_array($coalition, $otherPlayerLoyalties);
    })[0];
  }
}
