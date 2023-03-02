<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait PlaceSpyTrait
{

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  function argPlaceSpy()
  {
    $player_id = self::getActivePlayerId();
    $card_id = Globals::getResolveImpactIconsCardId();
    $card_info = $this->cards[$card_id];
    $card_region = $card_info['region'];
    return array(
      'region' => $card_region,
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
   * Places spy on card
   */
  function placeSpy($cardId)
  {
    self::checkAction('placeSpy');
    self::dump("placeSpy on ", $cardId);

    $playerId = self::getActivePlayerId();
    $from = "cylinders_" . $playerId;
    $cylinder = Tokens::getInLocation($from)->first();

    if ($cylinder != null) {
      $to = 'spies_' . $cardId;
      Tokens::move($cylinder['id'], $to);
      self::notifyAllPlayers("moveToken", "", array(
        'moves' => array(
          0 => array(
            'from' => $from,
            'to' => $to,
            'tokenId' => $cylinder['id'],
          )
        )
      ));
    }
    Globals::incResolveImpactIconsCurrentIcon(1);
    $this->gamestate->nextState('resolveImpactIcons');
  }
}
