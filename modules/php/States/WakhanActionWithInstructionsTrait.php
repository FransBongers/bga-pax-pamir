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
use PaxPamir\Models\PaxPamirPlayer;

trait WakhanActionWithInstructionsTrait
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

  /**
   * If military cards are favored, radicalize the highest ranked military card.
   */
  function wakhanMilitaryFavoredRadicalizeHighestRankedMilitary()
  {
    if (!Globals::getFavoredSuit() === MILITARY) {
      Wakhan::actionNotValid();
      return;
    }
    $availableCards = Wakhan::getCourtCardsWakhanCanPurchase();

    $card = $this->wakhanGetHighestRankedCardOfSuit($availableCards, MILITARY);

    if ($card === null) {
      Wakhan::actionNotValid();
      return;
    }
    $row = explode('_',$card['location'])[1];
    $column = explode('_',$card['location'])[2];
    $cost = Utils::getCardCost(PaxPamirPlayers::get(WAKHAN_PLAYER_ID),$card);
    $this->wakhanResolveRadicalizeCard($card, $row, $column, $cost);
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function wakhanGetHighestRankedCardOfSuit($cards, $suit)
  {
    $cardsOfSuit = Utils::filter($cards, function ($card) use ($suit) {
      return $card['suit'] === $suit;
    });
    if (count($cardsOfSuit) === 0) {
      return null;
    }

    $maxRank = max(array_map(function ($card) {
      return $card['rank'];
    }, $cardsOfSuit));

    return Wakhan::selectCard(Utils::filter($cardsOfSuit, function ($card) use ($maxRank) {
      return $card['rank'] === $maxRank;
    }));
  }
}
