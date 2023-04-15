<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
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
    $card_id = Globals::getResolveImpactIconsCardId();
    $card_info = $this->cards[$card_id];
    $card_region = $card_info['region'];
    return array(
      'regionId' => $card_region,
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
    $card = Cards::get($cardId);
    if(!Utils::startsWith($card['location'], "court")) {
      throw new \feException("Selected card is not in a court");
    };
    // TODO: check if $cardId is in court?
    $playerId = self::getActivePlayerId();
    $from = "cylinders_" . $playerId;
    $cylinder = Tokens::getTopOf($from);

    if ($cylinder != null) {
      $to = 'spies_' . $cardId;
      Tokens::move($cylinder['id'], $to);
      $message = clienttranslate('${player_name} places ${logTokenCylinder} on ${logTokenCardName} ${logTokenLargeCard}');
      Notifications::moveToken($message, [
        'player' => Players::get(),
        'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
        'logTokenCylinder' => Utils::logTokenCylinder(Players::get()->getId()),
        'logTokenCardName' => Utils::logTokenCardName(Cards::get($cardId)['name']),
        'moves' => [
          [
            'from' => $from,
            'to' => $to,
            'tokenId' => $cylinder['id'],
          ]
        ]
      ]);
    }
    Globals::incResolveImpactIconsCurrentIcon(1);
    $this->gamestate->nextState('resolveImpactIcons');
  }
}
