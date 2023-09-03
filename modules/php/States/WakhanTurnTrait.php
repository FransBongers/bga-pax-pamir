<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
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
    Notifications::message('Wakhan starts their turn');

    $wakhanCards = $this->drawWakhanCard();
    if ($wakhanCards[DECK] === null) {
      $this->reshuffleWakhanDeck();
      $wakhanCards = $this->drawWakhanCard();
    } 

    // // 1. Draw new Wakhan card
    // $oldTopDeck = WakhanCards::getTopOf(DECK)['id'];
    // $oldTopDiscardPile = WakhanCards::getTopOf(DISCARD);
    // $discardPile = [
    //   'from' => $oldTopDiscardPile === null ? null : $oldTopDiscardPile['id'],
    //   'to' => $oldTopDeck,
    // ];
    // WakhanCards::move($oldTopDeck, DISCARD);
    // $deck = [
    //   'from' => $oldTopDeck,
    //   'to' => WakhanCards::getTopOf(DECK)['id'],
    // ];
    // Notifications::wakhanDrawCard($deck, $discardPile);


    $nextPlayerId = PaxPamirPlayers::getNextId(WAKHAN_PLAYER_ID);
    $this->nextState('prepareNextTurn', $nextPlayerId);
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

  function reshuffleWakhanDeck()
  {
    $currentTopDiscardPile = WakhanCards::getTopOf(DISCARD)['id'];
    WakhanCards::moveAllInLocation(DISCARD,DECK);
    WakhanCards::shuffle(DECK);
    $topOfDeck = WakhanCards::getTopOf(DECK)['id'];
    Notifications::wakhanReshuffleDeck($topOfDeck,$currentTopDiscardPile);
  }

  // function drawWakhanCard()
  // {
  //   $currentTopOfDeck = WakhanCards::getTopOf(DECK);
  //   $currentTopDiscardPile = WakhanCards::getTopOf(DISCARD);
  //   // Last card in deck. We need to shuffle all cards into a new deck.
  //   // if (WakhanCards::countInLocation(DECK) === 1) {
  //   //   WakhanCards::moveAllInLocation(DISCARD,DECK);
  //   //   WakhanCards::shuffle(DECK);
  //   // };
  //   $newTopOfDiscard = WakhanCards::getTopOf(DECK);
  //   WakhanCards::insertOnTop($newTopOfDiscard['id'], DISCARD);
  //   $discardPile = [
  //     'from' => $currentTopDiscardPile === null ? null : $currentTopDiscardPile['id'],
  //     'to' => $newTopOfDiscard['id'],
  //   ];
  //   $newTopOfDeck = WakhanCards::getTopOf(DECK);
  //   $deck = [
  //     'from' => $currentTopOfDeck['id'],
  //     'to' => $newTopOfDeck['id'],
  //   ];
  //   Notifications::wakhanDrawCard($deck, $discardPile);
  //   return [
  //     DECK => $newTopOfDeck,
  //     DISCARD => $newTopOfDiscard,
  //   ];
  // }
}
