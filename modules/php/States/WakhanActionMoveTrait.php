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

trait WakhanActionMoveTrait
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

  function wakhanMove($card = null)
  {
    if ($card === null) {
      $card = $this->wakhanGetCourtCardToPerformAction(MOVE);
    }

    if ($card === null) {
      Wakhan::actionNotValid();
      return false;
    }
    Notifications::log('card', $card);
    if ($this->wakhanGetNextMove() === null) {
      Wakhan::actionNotValid();
      return false;
    }

    Wakhan::actionValid();
    $wakhanPlayer = PaxPamirPlayers::get(WAKHAN_PLAYER_ID);
    Notifications::move($card['id'], $wakhanPlayer);
    $this->wakhanPayHostageBribeIfNeeded($card, MOVE);

    Cards::setUsed($card['id'], 1); // unavailable
    // if not free action reduce remaining actions.
    if (!$this->isCardFavoredSuit($card)) {
      Globals::incRemainingActions(-1);
    }

    $extraActions = [];
    for ($i = 0; $i < $card['rank']; $i++) {
      $move = $this->wakhanGetNextMove();
      if ($move === null) {
        continue;
      }
      $pieceId = $move['pieceId'];
      $extraActions = array_merge($extraActions, $this->resolveMoves($wakhanPlayer, [
        $pieceId => [[
          'from' => $move['from'],
          'to' => $move['to'],
        ]]
      ]));
    }

    if (count($extraActions) > 0) {
      ActionStack::push($extraActions);
    }

    return true;
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function wakhanGetNextMove()
  {
    $regionOrder = Wakhan::getRegionOrder();
    $rulers = Globals::getRulers();

    foreach ($regionOrder as $index => $region) {
      /**
       * valid from if:
       * - Wakhan has a piece to move (army from pragmatic loyalty, tribe with nationalism)
       * - Wakhan will not lose ruler token
       * - There is an adjacent region to move to
       */
      $piece = $this->wakhanGetPieceToMove($region);
      if ($piece === null) {
        continue;
      }

      if ($rulers[$region] === WAKHAN_PLAYER_ID && Map::determineRuler($region, [$piece['id']]) !== WAKHAN_PLAYER_ID) {
        continue;
      }
      $destination = $this->wakhanGetAdjacentRegionToMoveTo($region);
      if ($destination === null) {
        continue;
      }
      return [
        'pieceId' => $piece['id'],
        'from' => $region,
        'to' => $destination
      ];
    }
    return null;
  }

  function wakhanGetAdjacentRegionToMoveTo($originRegion)
  {
    $regionOrder = Wakhan::getRegionOrder();
    $adjacentRegions = Map::getRegionsAdjacentToRegion($originRegion);
    foreach ($regionOrder as $index => $region) {
      if (!in_array($region, $adjacentRegions)) {
        continue;
      }
      $numberOfTribes = count(Tokens::getInLocation(Locations::tribes($region))->toArray());
      $numberOfloyalArmies = count(Map::getLoyalArmiesInRegion($region, Wakhan::getPragmaticLoyalty()));
      if ($numberOfTribes > $numberOfloyalArmies) {
        return $region;
      }
    }
    return null;
  }

  function wakhanGetPieceToMove($region)
  {
    $loyalty = Wakhan::getPragmaticLoyalty();
    $loyalArmies = Map::getLoyalArmiesInRegion($region, $loyalty);

    if (count($loyalArmies) > 0) {
      return $loyalArmies[0];
    }
    if (!Events::isNationalismActive(WAKHAN_PLAYER_ID)) {
      return null;
    }
    $wakhanTribes = Map::getPlayerTribesInRegion($region, WAKHAN_PLAYER_ID);
    if (count($wakhanTribes) > 0) {
      return $wakhanTribes[0];
    }
    return null;
  }
}
