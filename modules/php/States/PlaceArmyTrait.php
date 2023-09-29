<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait PlaceArmyTrait
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

  function dispatchPlaceArmy($actionStack)
  {
    $action = $actionStack[count($actionStack) - 1];

    $playerId = $action['playerId'];
    $player = PaxPamirPlayers::get($playerId);
    $loyalty = $player->getLoyalty();

    $regionId = $action['data']['region'];
    $pool = $this->locations['pools'][$loyalty];

    $selectedPiece = isset($action['data']['selectedPiece']) ? $action['data']['selectedPiece'] : null;
    $army = $selectedPiece !== null ? Tokens::get($selectedPiece) : Tokens::getTopOf($pool);

    // There is no army in the pool. Player needs to select piece
    if ($army === null) {
      $this->nextState('selectPiece', $playerId);
      return;
    }

    $this->resolvePlaceArmy($player, $army, $loyalty, $regionId);

    array_pop($actionStack);
    ActionStack::next($actionStack);
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function resolvePlaceArmy($player, $army, $loyalty, $regionId)
  {
    $to = $this->locations['armies'][$regionId];
    $from = $army['location'];

    Tokens::move($army['id'], $this->locations['armies'][$regionId]);
    Tokens::setUsed($army['id'], USED);

    // TODO: (add from log in case it was a selected pieces)
    Notifications::placeArmy($player, $army['id'], $loyalty, $regionId, $from, $to);

    $fromRegionId = explode('_', $from)[1];
    $isArmy = Utils::startsWith($from, 'armies');

    if ($isArmy && $fromRegionId !== $regionId) {
      Map::checkRulerChange($fromRegionId);
    }

    Map::checkRulerChange($regionId);
  }
}
