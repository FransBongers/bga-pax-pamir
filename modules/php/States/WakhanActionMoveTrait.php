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
    $nextArmyMove = $this->wakhanGetNextArmyMove();

    if ($nextArmyMove !== null) {
      return $nextArmyMove;
    }
    if (!Globals::getWakhanVariantSpyMovement()) {
      return null;
    }

    return $this->wakhanGetNextSpyMove();
  }

  // ....###....########..##.....##.##....##....##.....##..#######..##.....##.########
  // ...##.##...##.....##.###...###..##..##.....###...###.##.....##.##.....##.##......
  // ..##...##..##.....##.####.####...####......####.####.##.....##.##.....##.##......
  // .##.....##.########..##.###.##....##.......##.###.##.##.....##.##.....##.######..
  // .#########.##...##...##.....##....##.......##.....##.##.....##..##...##..##......
  // .##.....##.##....##..##.....##....##.......##.....##.##.....##...##.##...##......
  // .##.....##.##.....##.##.....##....##.......##.....##..#######.....###....########

  function wakhanGetNextArmyMove()
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

  // ..######..########..##....##....##.....##..#######..##.....##.########
  // .##....##.##.....##..##..##.....###...###.##.....##.##.....##.##......
  // .##.......##.....##...####......####.####.##.....##.##.....##.##......
  // ..######..########.....##.......##.###.##.##.....##.##.....##.######..
  // .......##.##...........##.......##.....##.##.....##..##...##..##......
  // .##....##.##...........##.......##.....##.##.....##...##.##...##......
  // ..######..##...........##.......##.....##..#######.....###....########

  /**
   * If Wakhan cannot move armies, move an "idle" spy, if available,
   * from the lowest priority court card, directly to the highest priority card where Wakhan does not have the most spies.
   * 
   * An “idle” spy is one who is not “tied-up”. Each enemy spy on the same court card as one of Wakhan’s spies will "tie-up" one of her spies. 
   */
  function wakhanGetNextSpyMove()
  {
    $originCards = $this->wakhanGetCardsSpyCanMoveFrom();
    Notifications::log('originCards', $originCards);
    if (count($originCards) === 0) {
      return null;
    }

    $wakhanPlayer = PaxPamirPlayers::get(WAKHAN_PLAYER_ID);
    $players = PaxPamirPlayers::getAll();
    $spies = Tokens::getOfTypeInLocation('cylinder', 'spies');

    foreach ($originCards as $index => $card) {
      $adjacentCards = $this->getAllAdjecentCardsForSpyMovement($card['id'], $wakhanPlayer);
      if (count($adjacentCards) === 0) {
        continue;
      }
      $adjacentCards = Cards::getMany($adjacentCards)->toArray();

      $validAdjacentCards = Utils::filter($adjacentCards, function ($card) use ($players, $spies) {

        $spiesOnCard = Utils::filter($spies, function ($cylinder) use ($card) {
          return $cylinder['location'] === Locations::spies($card['id']);
        });

        // Determine number of spies per player
        $spyCountPerPlayer = [];
        foreach ($players as $playerId => $player) {
          $count = count(Utils::filter($spiesOnCard, function ($cylinder) use ($playerId) {
            return Utils::getPlayerIdForCylinderId($cylinder['id']) === $playerId;
          }));
          $spyCountPerPlayer[$playerId] = $count;
        }

        $max = max(array_values($spyCountPerPlayer));

        $numberOfPlayersWithMax = array_count_values($spyCountPerPlayer)[$max];
        if ($spyCountPerPlayer[WAKHAN_PLAYER_ID] === $max && $numberOfPlayersWithMax === 1 && $max !== 0) {
          return false;
        }
        return true;
      });

      $destinationCard = Wakhan::selectHighestPriorityCard($validAdjacentCards);

      if ($destinationCard !== null) {
        $wakhanSpiesOnOrigin = Utils::filter($spies, function ($cylinder) use ($card) {
          return $cylinder['location'] === Locations::spies($card['id']) && Utils::getPlayerIdForCylinderId($cylinder['id']) === WAKHAN_PLAYER_ID;
        });

        return [
          'pieceId' => $wakhanSpiesOnOrigin[0]['id'],
          'from' => $card['id'],
          'to' => $destinationCard['id'],
        ];
      }
    }
    return null;
  }

  function wakhanGetCardsSpyCanMoveFrom()
  {
    $courtCards = PaxPamirPlayers::getAllCourtCardsOrdered();

    $spies = Tokens::getOfTypeInLocation('cylinder', 'spies');
    $originCourtCards = Utils::filter($courtCards, function ($card) use ($spies) {
      $spiesOnCard = Utils::filter($spies, function ($spy) use ($card) {
        return $spy['location'] === Locations::spies($card['id']);
      });
      if (count($spiesOnCard) === 0) {
        return false;
      }

      $wakhanSpies = array_values(array_filter($spiesOnCard, function ($cylinder) {
        $cylinderOwnerId = Utils::getPlayerIdForCylinderId($cylinder['id']);
        return $cylinderOwnerId === WAKHAN_PLAYER_ID;
      }));
      $enemySpies = Utils::filter($spiesOnCard, function ($cylinder) {
        $cylinderOwnerId = Utils::getPlayerIdForCylinderId($cylinder['id']);
        return $cylinderOwnerId !== WAKHAN_PLAYER_ID;
      });
      if (count($wakhanSpies) > count($enemySpies)) {
        return true;
      }
      return false;
    });
    usort($originCourtCards, function ($a, $b) {
      $aCardNumber = intval(explode('_', $a['id'])[1]);
      $bCardNumber = intval(explode('_', $b['id'])[1]);
      return $bCardNumber - $aCardNumber;
    });
    return $originCourtCards;
  }
}
