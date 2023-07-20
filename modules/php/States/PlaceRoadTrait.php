<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Map;
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
    $player = Players::get($playerId);
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
    $message = clienttranslate('${player_name} places ${logTokenRoad} on the border between ${logTokenRegionName0} and ${logTokenRegionName1}');
    Notifications::moveToken($message, [
      'player' => Players::get(),
      'logTokenRoad' => Utils::logTokenRoad($loyalty),
      'logTokenRegionName0' => Utils::logTokenRegionName($region0),
      'logTokenRegionName1' => Utils::logTokenRegionName($region1),
      'moves' => [
        [
          'from' => $from,
          'to' => $to,
          'tokenId' => $road['id'],
        ]
      ]
    ]);

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


  // function resolvePlaceRoad($borderId, $selectedPiece = null)
  // {
  //   $loyalty = Players::get()->getLoyalty();
  //   $location = $this->locations['pools'][$loyalty];
  //   $road = $selectedPiece !== null ? Tokens::get($selectedPiece) : Tokens::getTopOf($location);
  //   if ($road === null) {
  //     return;
  //   }
  //   $to = $this->locations['roads'][$borderId];
  //   $from = $road['location'];
  //   $region0 = explode("_", $borderId)[0];
  //   $region1 = explode("_", $borderId)[1];
  //   Tokens::move($road['id'], $to);
  //   Tokens::setUsed($road['id'], USED);
  //   $message = clienttranslate('${player_name} places ${logTokenRoad} on the border between ${logTokenRegionName0} and ${logTokenRegionName1}');
  //   Notifications::moveToken($message, [
  //     'player' => Players::get(),
  //     'logTokenRoad' => Utils::logTokenRoad($loyalty),
  //     'logTokenRegionName0' => Utils::logTokenRegionName($region0),
  //     'logTokenRegionName1' => Utils::logTokenRegionName($region1),
  //     'moves' => [
  //       [
  //         'from' => $from,
  //         'to' => $to,
  //         'tokenId' => $road['id'],
  //       ]
  //     ]
  //   ]);

  //   if ($selectedPiece !== null) {
  //     $fromRegionId = explode('_', $from)[1];
  //     $isTribe = Utils::startsWith($from, 'armies');
  //     if ($isTribe) {
  //       Map::checkRulerChange($fromRegionId);
  //     }
  //   }
  // }
}
