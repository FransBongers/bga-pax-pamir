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

trait PlaceRoadTrait
{

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  function argPlaceRoad()
  {
    $actionStack = ActionStack::get();
    $action = $actionStack[count($actionStack) - 1];

    $card = Cards::get($action['data']['cardId']);

    return array(
      'region' => $this->regions[$card['region']],
    );
  }

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
   * Places road on a border for loyalty of active player
   */
  function placeRoad($border)
  {
    self::checkAction('placeRoad');
    $actionStack = ActionStack::get();
    $action = array_pop($actionStack);

    if ($action['type'] !== DISPATCH_IMPACT_ICON_ROAD) {
      throw new \feException("Not a valid action");
    };

    $actionStack[] = ActionStack::createAction(DISPATCH_PLACE_ROAD,$action['playerId'],[
      'border' => $border,
    ]);

    // $this->resolvePlaceRoad($border, $selectedPiece);

    ActionStack::next($actionStack);
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function dispatchPlaceRoad($actionStack)
  {
    $action = $actionStack[count($actionStack) - 1];

    $playerId = $action['playerId'];
    $player = PaxPamirPlayers::get($playerId);
    $loyalty = $player->getLoyalty();

    $borderId = $action['data']['border'];
    $pool = $this->locations['pools'][$loyalty];

    $selectedPiece = isset($action['data']['selectedPiece']) ? $action['data']['selectedPiece'] : null;
    $road = $selectedPiece !== null ? Tokens::get($selectedPiece) : Tokens::getTopOf($pool);

    // There is no army in the pool. Player needs to select piece
    if ($road === null) {
      $this->nextState('selectPiece', $playerId);
      return;
    }

    $to = $this->locations['roads'][$borderId];
    $from = $road['location'];
    $region0 = explode("_", $borderId)[0];
    $region1 = explode("_", $borderId)[1];
    Tokens::move($road['id'], $to);
    Tokens::setUsed($road['id'], USED);
    Notifications::placeRoad($player,  $road['id'], $loyalty, $region0,$region1, $from, $to);

    if ($selectedPiece !== null) {
      $fromRegionId = explode('_', $from)[1];
      $isArmy = Utils::startsWith($from, 'armies');
      if ($isArmy) {
        Map::checkRulerChange($fromRegionId);
      }
    }

    array_pop($actionStack);
    ActionStack::next($actionStack);
  }
}
