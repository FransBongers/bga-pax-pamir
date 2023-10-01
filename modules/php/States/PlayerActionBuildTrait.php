<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Core\Stats;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Log;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\PaxPamirPlayers;
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
  function build($inputLocations, $cardId, $offeredBribeAmount = null)
  {
    self::checkAction('build');


    $cardInfo = $cardId !== null ? Cards::get($cardId) : null;
    $this->isValidCardAction($cardInfo, BUILD);


    $locations = [];
    foreach ($inputLocations as $index => $location) {
      $locations[] = $location['location'];
    }

    $player = PaxPamirPlayers::get();
    $resolved = $this->resolveBribe($cardInfo, $player, BUILD, $offeredBribeAmount);
    if (!$resolved) {
      $this->nextState('playerActions');
      return;
    }
    // Get player again, because bribe has been paid
    if ($offeredBribeAmount !== null && intval($offeredBribeAmount) > 0) {
      $player = PaxPamirPlayers::get();
    };

    $playerId = $player->getId();
    $nationBuildingMultiplier = Events::isNationBuildingActive(PaxPamirPlayers::get()) ? 2 : 1;
    $numberOfTokens = count($locations);
    
    // max number to build is 3, but can be multiplied with nation building
    $maxNumberOfTokens = 3 * $nationBuildingMultiplier;
    
    if ($numberOfTokens > $maxNumberOfTokens) {
      throw new \feException("Too many blocks selected");
    };

    if ($numberOfTokens === 0) {
      throw new \feException("At least one block needs to be selected");
    };

    $cost = ceil($numberOfTokens / $nationBuildingMultiplier)  * 2;

    // player should have rupees
    if ($cost > $player->getRupees()) {
      throw new \feException("Player does not have enough rupees to pay for action");
    }

    Cards::setUsed($cardId, 1);
    if (!$this->isCardFavoredSuit($cardInfo)) {
      Globals::incRemainingActions(-1);
    }
    $rupeesOnCards = $this->payActionCosts($cost);
    PaxPamirPlayers::incRupees($playerId, -$cost);
    Notifications::build($cardId, $player, $rupeesOnCards);
    Stats::incBuildCount($playerId,1);

    $actionStack = [
      ActionStack::createAction(DISPATCH_TRANSITION, $player->getId(), [
        'transition' => 'playerActions'
      ])
    ];
    if ($player->hasSpecialAbility(SA_INFRASTRUCTURE)) {
      $actionStack[] = ActionStack::createAction(DISPATCH_TRANSITION, $player->getId(), [
        'transition' => 'specialAbilityInfrastructure'
      ]);
    }

    $actionStack = array_merge($actionStack,$this->createBuildActions($locations, $playerId));

    ActionStack::next($actionStack);
  }

  function specialAbilityInfrastructure($skip = false,$inputLocations)
  {
    self::checkAction('specialAbilityInfrastructure');

    $actionStack = ActionStack::get();
    if ($skip) {
      // No need to pop, since action has actions has already been popped from stack by the transition
      ActionStack::next($actionStack);
      return;
    }


    $player = PaxPamirPlayers::get();
    if (!$player->hasSpecialAbility(SA_INFRASTRUCTURE)) {
      throw new \feException("Player does not have Infrastructure special ability");
    }
    $playerId = $player->getId();

    $locations = [];
    foreach ($inputLocations as $index => $location) {
      $locations[] = $location['location'];
    }

    $numberOfTokens = count($locations);

    if ($numberOfTokens > 1) {
      throw new \feException("Too many blocks selected");
    };

    if ($numberOfTokens === 0) {
      throw new \feException("At least one block needs to be selected");
    };

    Notifications::buildInfrastructure($player);
    $actionStack = array_merge($actionStack,$this->createBuildActions($locations, $playerId));
    ActionStack::next($actionStack);
  }


  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function createBuildActions($locations, $playerId)
  {

    $actions = [];
    //player should rule region or an adjacent region in case of a border
    foreach ($locations as $index => $location) {
      $isBorder = str_contains($location, '_');
      $rulers = Globals::getRulers();
      if ($isBorder) {
        $borderRegions = explode('_', $location);
        if (!($rulers[$borderRegions[0]] === $playerId || $rulers[$borderRegions[1]] === $playerId)) {
          throw new \feException("Player does not rule an adjacent region");
        };
        $actions[] = ActionStack::createAction(DISPATCH_PLACE_ROAD, $playerId, [
          'border' => $location,
        ]);
      } else {
        if (!($rulers[$location] === $playerId)) {
          throw new \feException("Player does not rule region");
        }
        $actions[] = ActionStack::createAction(DISPATCH_PLACE_ARMY, $playerId, [
          'region' => $location,
        ]);
      }
    }
    return array_reverse($actions);
  }
}
