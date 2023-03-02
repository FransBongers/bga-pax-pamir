<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
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
    $player_id = self::getActivePlayerId();
    $card_id = Globals::getResolveImpactIconsCardId();
    $card_info = $this->cards[$card_id];
    $card_region = $card_info['region'];
    return array(
      'region' => $this->regions[$card_region],
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
    self::dump("placeRoad on ", $border);
    $player_id = self::getActivePlayerId();
    // TODO: check if allowed based on resolveImpactIconsCardId
    $loyalty = Players::get()->getLoyalty();
    $location = $this->locations['pools'][$loyalty];
    $road = Tokens::getInLocation($location)->first();
    if ($road != null) {
      $to = $this->locations['roads'][$border];
      Tokens::move($road['id'], $to);
      self::notifyAllPlayers("moveToken", "", array(
        'moves' => array(
          0 => array(
            'from' => $location,
            'to' => $to,
            'tokenId' => $road['id'],
          )
        )
      ));
    }
    Globals::incResolveImpactIconsCurrentIcon(1);
    $this->gamestate->nextState('resolveImpactIcons');
  }
}
