<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
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
    $actionStack = Globals::getActionStack();
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
    $actionStack = Globals::getActionStack();
    $action = array_pop($actionStack);
    Globals::setActionStack($actionStack);

    if ($action['action'] !== DISPATCH_IMPACT_ICON_ROAD) {
      throw new \feException("Not a valid action");
    };

    $this->resolvePlaceRoad($border);

    // $loyalty = Players::get()->getLoyalty();
    // $location = $this->locations['pools'][$loyalty];
    // $road = Tokens::getTopOf($location);
    // if ($road != null) {
    //   $to = $this->locations['roads'][$border];
    //   $region0 = explode("_", $border)[0];
    //   $region1 = explode("_", $border)[1];
    //   Tokens::move($road['id'], $to);
    //   $message = clienttranslate('${player_name} places ${logTokenRoad} on the border between ${logTokenRegionName0} and ${logTokenRegionName1}');
    //   Notifications::moveToken($message, [
    //     'player' => Players::get(),
    //     'logTokenRoad' => Utils::logTokenRoad($loyalty),
    //     'logTokenRegionName0' => Utils::logTokenRegionName($region0),
    //     'logTokenRegionName1' => Utils::logTokenRegionName($region1),
    //     'moves' => [
    //       [
    //         'from' => $location,
    //         'to' => $to,
    //         'tokenId' => $road['id'],
    //       ]
    //     ]
    //   ]);
    // }
    
    $this->nextState('dispatchAction');
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function resolvePlaceRoad($borderId)
  {
    $loyalty = Players::get()->getLoyalty();
    $location = $this->locations['pools'][$loyalty];
    $road = Tokens::getTopOf($location);
    if ($road != null) {
      $to = $this->locations['roads'][$borderId];
      $region0 = explode("_", $borderId)[0];
      $region1 = explode("_", $borderId)[1];
      Tokens::move($road['id'], $to);
      $message = clienttranslate('${player_name} places ${logTokenRoad} on the border between ${logTokenRegionName0} and ${logTokenRegionName1}');
      Notifications::moveToken($message, [
        'player' => Players::get(),
        'logTokenRoad' => Utils::logTokenRoad($loyalty),
        'logTokenRegionName0' => Utils::logTokenRegionName($region0),
        'logTokenRegionName1' => Utils::logTokenRegionName($region1),
        'moves' => [
          [
            'from' => $location,
            'to' => $to,
            'tokenId' => $road['id'],
          ]
        ]
      ]);
    }
  }
}
