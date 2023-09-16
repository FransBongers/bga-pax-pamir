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
