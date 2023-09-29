<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Wakhan;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;
use PaxPamir\Managers\WakhanCards;

trait WakhanActionBetrayTrait
{

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

  function wakhanAcceptPrize($actionStack)
  {
    $current = array_pop($actionStack);
    $cardId = $current['data']['cardId'];
    $player = PaxPamirPlayers::get(WAKHAN_PLAYER_ID);

    Notifications::acceptPrize($cardId, $player);
    $actionStack[] = ActionStack::createAction(DISPATCH_TAKE_PRIZE, WAKHAN_PLAYER_ID, [
      'cardId' => $cardId
    ],);
    ActionStack::next($actionStack);
  }

  function wakhanBetray($card = null)
  {
    if ($card === null) {
      $card = $this->wakhanGetCourtCardToPerformAction(BETRAY);
    }
    
    if ($card === null) {
      Wakhan::actionNotValid();
      return false;
    }

    $cardToBetray = $this->wakhanGetCardToBetray();
    if ($cardToBetray === null) {
      Wakhan::actionNotValid();
      return false;
    }
    Wakhan::actionValid();

    Cards::setUsed($card['id'], 1); // unavailable
    // if not free action reduce remaining actions.
    if (!$this->isCardFavoredSuit($card)) {
      Globals::incRemainingActions(-1);
    }

    $wakhanPlayer = PaxPamirPlayers::get(WAKHAN_PLAYER_ID);
    $this->wakhanPayHostageBribeIfNeeded($card, BETRAY);
    $rupeesOnCards = $this->payActionCosts(2);
    Notifications::betray($cardToBetray, $wakhanPlayer, $rupeesOnCards);

    PaxPamirPlayers::incRupees(WAKHAN_PLAYER_ID, -2);

    $actionStack = [];
    $actionStack[] = ActionStack::createAction(DISPATCH_ACCEPT_PRIZE_CHECK, WAKHAN_PLAYER_ID, ['cardId' => $cardToBetray['id'],]);


    $actionStack[] = ActionStack::createAction(DISPATCH_DISCARD_BETRAYED_CARD, WAKHAN_PLAYER_ID, [
      'cardId' => $cardToBetray['id'],
      'cardOwnerId' => intval(explode('_', $cardToBetray['location'][1])),
    ]);

    ActionStack::push($actionStack);
    return true;
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function wakhanGetCardToBetray()
  {
    $courtCards = PaxPamirPlayers::getAllCourtCardsOrdered();
    $cardsWithPrizeAndWakhanSpy = Utils::filter($courtCards, function ($card) {
      if ($card['prize'] === null) {
        return false;
      }
      $spies = Tokens::getInLocation(Locations::spies($card['id']))->toArray();
      $hasWakhanSpy = Utils::array_some($spies, function ($spy) {
        return Utils::getPlayerIdForCylinderId($spy['id']) === WAKHAN_PLAYER_ID;
      });
      if (!$hasWakhanSpy) {
        return false;
      }
      $cardOwnerId = intval(explode('_', $card['location'][1]));
      if ($card['suit'] === POLITICAL && PaxPamirPlayers::get($cardOwnerId)->hasSpecialAbility(SA_BODYGUARDS)) {
        return false;
      }
      return true;
    });
    return Wakhan::selectHighestPriorityCard($cardsWithPrizeAndWakhanSpy);
  }
}
