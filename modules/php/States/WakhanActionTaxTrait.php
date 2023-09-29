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

trait WakhanActionTaxTrait
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

  function wakhanTax($card = null)
  {
    if ($card === null) {
      $card = $this->wakhanGetCourtCardToPerformAction(TAX);
    }

    if ($card === null) {
      Wakhan::actionNotValid();
      return false;
    }

    $playersToTax = $this->wakhanGetPlayersToTax();
    $marketRupees = $this->wakhanGetMarketRupees();

    if (count($playersToTax) === 0 && count($marketRupees) === 0) {
      Wakhan::actionNotValid();
      return false;
    }
    Wakhan::actionValid();

    $this->wakhanPayHostageBribeIfNeeded($card, TAX);

    $numberOfRupeesToTax = $card['rank'];
    $numberOfRupeesTaxed = 0;

    $cardId = $card['id'];

    Cards::setUsed($cardId, 1);
    // if not free action reduce remaining actions.
    if (!$this->isCardFavoredSuit($card)) {
      Globals::incRemainingActions(-1);
    }

    Notifications::tax($cardId, PaxPamirPlayers::get(WAKHAN_PLAYER_ID));


    foreach ($playersToTax as $index => $playerTaxInfo) {
      if ($numberOfRupeesTaxed >= $numberOfRupeesToTax) {
        continue;
      }
      $stillToTax = $numberOfRupeesToTax - $numberOfRupeesTaxed;
      $taxedFromPlayer = min($stillToTax, $playerTaxInfo['maxTaxable']);
      PaxPamirPlayers::incRupees($playerTaxInfo['playerId'], -$taxedFromPlayer);
      Notifications::taxPlayer($taxedFromPlayer, PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $playerTaxInfo['playerId']);
      $numberOfRupeesTaxed += $taxedFromPlayer;
    }

    $taxedFromMarket = [];
    foreach ($marketRupees as $index => $rupee) {
      if ($numberOfRupeesTaxed >= $numberOfRupeesToTax) {
        continue;
      }
      $location = explode('_', $rupee['location']);
      $taxedFromMarket[] = [
        'rupeeId' => $rupee['id'],
        'row' => intval($location[1]),
        'column' => intval($location[2])
      ];
      Tokens::move($rupee['id'], RUPEE_SUPPLY);
      $numberOfRupeesTaxed += 1;
    }
    if (count($taxedFromMarket) > 0) {
      Notifications::taxMarket(count($taxedFromMarket), PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $taxedFromMarket);
    }
    PaxPamirPlayers::incRupees(WAKHAN_PLAYER_ID, $numberOfRupeesTaxed);
    return true;
  }


  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function wakhanPlayerOrderRedArrow($playerId)
  {
    $side = $this->wakhanGetRedArrowValue();
    $leftAndPlayerToLeft = $side === TOP_LEFT && PaxPamirPlayers::getPrevId(WAKHAN_PLAYER_ID) === $playerId;
    $rightAndPlayerToRight = $side === BOTTOM_RIGHT && PaxPamirPlayers::getNextId(WAKHAN_PLAYER_ID) === $playerId;

    if ($leftAndPlayerToLeft || $rightAndPlayerToRight) {
      return 1;
    } else {
      return 0;
    }
  }

  function wakhanGetMarketRupees()
  {
    $marketRupees = [];
    $redArrow = $this->wakhanGetRedArrowValue();
    for ($column = 0; $column < 6; $column++) {
      $firstRow = $redArrow === TOP_LEFT ? 0 : 1;
      $secondRow = $redArrow === TOP_LEFT ? 1 : 0;
      $marketRupees = array_merge($marketRupees, Tokens::getInLocation(Locations::marketRupees($firstRow, $column))->toArray(), Tokens::getInLocation(Locations::marketRupees($secondRow, $column))->toArray());
    }
    return $marketRupees;
  }

  function wakhanGetPlayersToTax()
  {
    $otherPlayerIds = Wakhan::getOtherPlayerIds();
    $taxablePlayers = [];
    $rulers = Globals::getRulers();
    $wakhanHasClaimOfAncientLineage = Cards::get(SA_CLAIM_OF_ANCIENT_LINEAGE_CARD_ID)['location'] === Locations::court(WAKHAN_PLAYER_ID);
    /**
     * Player is taxable if:
     * - Wakhan rules a region where they have a court card
     * - Player has rupees in excess of tax shelter
     */
    foreach ($otherPlayerIds as $index => $playerId) {
      $player = PaxPamirPlayers::get($playerId);
      $playerRupees = $player->getRupees();
      $taxShelter = $player->getSuitTotals()[ECONOMIC];
      $maxTaxable = $playerRupees - $taxShelter;
      if ($maxTaxable <= 0) {
        continue;
      }

      $courtCards = $player->getCourtCards();
      if (count($courtCards) === 0) {
        continue;
      }
      $hasCardRuledByWakhan = Utils::array_some($courtCards, function ($courtCard) use ($rulers) {
        return $rulers[$courtCard['region']] === WAKHAN_PLAYER_ID;
      });
      if ($hasCardRuledByWakhan || $wakhanHasClaimOfAncientLineage) {
        $taxablePlayers[] = [
          'playerId' => $playerId,
          'playerRupees' => $playerRupees,
          'maxTaxable' => $maxTaxable,
        ];
      }
    }
    // sort so player with most rupees is at index 0, if players have equal amount of rupees
    // sort based on red arrow on the AI card
    usort($taxablePlayers, function ($a, $b) {
      $difference = $b['playerRupees'] - $a['playerRupees'];
      if ($difference === 0) {
        $this->wakhanPlayerOrderRedArrow($b['playerId']) - $this->wakhanPlayerOrderRedArrow($a['playerId']);
      } else {
        return $difference;
      }
    });

    return $taxablePlayers;
  }
}
