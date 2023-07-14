<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Log;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait PlayerActionBuildTrait
{
  //  .########..##..........###....##....##.########.########.
  //  .##.....##.##.........##.##....##..##..##.......##.....##
  //  .##.....##.##........##...##....####...##.......##.....##
  //  .########..##.......##.....##....##....######...########.
  //  .##........##.......#########....##....##.......##...##..
  //  .##........##.......##.....##....##....##.......##....##.
  //  .##........########.##.....##....##....########.##.....##

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  /**
   * cardId: card with build action
   * locations: locations to build: roads on borders, armies in regions
   */
  function build($inputLocations, $cardId = null,$offeredBribeAmount = null)
  {
    self::checkAction('build');
    $isInfrastructureAbilityState = $this->gamestate->state(true, false, true)['name'] === "specialAbilityInfrastructure";

    $locations = [];
    foreach ($inputLocations as $index => $location) {
      $locations[] = $location['location'];
    }


    Notifications::log('build', $locations);
    $cardInfo = $cardId !== null ? Cards::get($cardId) : null;
    if (!$isInfrastructureAbilityState) {
      $this->isValidCardAction($cardInfo, BUILD);
    }

    $player = Players::get();
    if (!$isInfrastructureAbilityState) {
      $resolved = $this->resolveBribe($cardInfo, $player,BUILD, $offeredBribeAmount);
      if (!$resolved) {
        $this->nextState('playerActions');
        return;
      }
      // Get player again, because bribe has been paid
      if ($offeredBribeAmount !== null && intval($offeredBribeAmount) > 0) {
        $player = Players::get();
      };
    }

    if ($isInfrastructureAbilityState && !$player->hasSpecialAbility(SA_INFRASTRUCTURE)) {
      throw new \feException("Player does not have Infrastructure special ability");
    }
    $nationBuildingMultiplier = Events::isNationBuildingActive(Players::get()) ? 2 : 1;

    $numberOfTokens = count($locations);
    Notifications::log('numberOfTokens', $numberOfTokens);

    $maxNumberOfTokens = $isInfrastructureAbilityState ? 1 : 3 * $nationBuildingMultiplier;
    // max number to build is 3
    if ($numberOfTokens > 3 * $maxNumberOfTokens) {
      throw new \feException("Too many blocks selected");
    };

    if ($numberOfTokens === 0) {
      throw new \feException("At least one block needs to be selected");
    };

    $cost = $isInfrastructureAbilityState ? 0 : ceil($numberOfTokens / $nationBuildingMultiplier)  * 2;

    // player should have rupees
    if (!$isInfrastructureAbilityState && $cost > $player->getRupees()) {
      throw new \feException("Player does not have enough rupees to pay for action");
    }

    $borders = [];
    $regions = [];
    $playerId = $player->getId();
    //player should rule region or an adjacent region in case of a border
    foreach ($locations as $index => $location) {
      $isBorder = str_contains($location, '_');
      $rulers = Globals::getRulers();
      if ($isBorder) {
        $borderRegions = explode('_', $location);
        if (!($rulers[$borderRegions[0]] === $playerId || $rulers[$borderRegions[1]] === $playerId)) {
          throw new \feException("Player does not rule an adjacent region");
        };
        $borders[] = $location;
      } else {
        if (!($rulers[$location] === $playerId)) {
          throw new \feException("Player does not rule region");
        }
        $regions[] = $location;
      }
    }
    Notifications::log('build', [
      'borders' => $borders,
      'regions' => $regions
    ]);
    if (!$isInfrastructureAbilityState) {
      Cards::setUsed($cardId, 1);
      if (!$this->isCardFavoredSuit($cardInfo)) {
        Globals::incRemainingActions(-1);
      }
      $rupeesOnCards = $this->payActionCosts($cost);
      Players::incRupees($playerId, -$cost);
      Notifications::build($cardId, $player, $rupeesOnCards);
    } else {
      Notifications::buildInfrastructure($player);
    }

    // Move tokens
    foreach ($regions as $index => $regionId) {
      $this->resolvePlaceArmy($regionId);
    }
    foreach ($borders as $index => $borderId) {
      $this->resolvePlaceRoad($borderId);
    }

    $hasInfrastructureAbility = $player->hasSpecialAbility(SA_INFRASTRUCTURE);
    Notifications::log('isInfrastructureAbilityState', $isInfrastructureAbilityState);
    if ($hasInfrastructureAbility && !$isInfrastructureAbilityState) {
      $this->nextState('specialAbilityInfrastructure');
    } else {
      $this->gamestate->nextState('playerActions');
    }
  }



  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...



}
