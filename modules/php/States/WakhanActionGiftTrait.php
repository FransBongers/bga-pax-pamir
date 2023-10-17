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
use PaxPamir\Managers\Map;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;
use PaxPamir\Managers\WakhanCards;

trait WakhanActionGiftTrait
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

  function wakhanGift($card = null)
  {
    if ($card === null) {
      $card = $this->wakhanGetCourtCardToPerformAction(GIFT);
    }

    if ($card === null) {
      Wakhan::actionNotValid();
      return false;
    }
    Wakhan::actionValid();
    // if $card !== null we know Wakhan is able to pay for the gift and for the bribe
    $giftValue = PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getLowestAvailableGift();

    $this->wakhanPayHostageBribeIfNeeded($card, GIFT);

    Notifications::purchaseGift(
      PaxPamirPlayers::get(WAKHAN_PLAYER_ID),
      $giftValue,
      $card,
    );

    Cards::setUsed($card['id'], 1); // unavailable
    // if not free action reduce remaining actions.
    if (!$this->isCardFavoredSuit($card)) {
      Globals::incRemainingActions(-1);
    }

    $rupeesOnCards = $this->payActionCosts($giftValue);
    PaxPamirPlayers::incRupees(WAKHAN_PLAYER_ID, -$giftValue);

    $player = PaxPamirPlayers::get(WAKHAN_PLAYER_ID);

    Notifications::payRupeesToMarket(
      $player,
      $rupeesOnCards
    );

    $this->wakhanPlaceGift($giftValue);
    return true;
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function wakhanPlaceGift($value)
  {
    $cylinder = Wakhan::getCylinderToPlace();

    $extraActions = $this->resolvePlaceCylinder(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $cylinder, GIFT, [
      'value' => $value,
      'type' => GIFT,
    ]);
    if (count($extraActions) > 0) {
      ActionStack::push($extraActions);
    }
  }
}
