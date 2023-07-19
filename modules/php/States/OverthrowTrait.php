<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait OverthrowTrait
{
  /**
   * Whenever a political card gets discarded check overthrow political cards (was it the last)
   * Whenever a tribe gets (re)moved check overthrow tribes
   */


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

  /**
   * Check if player has other tribes in specified region. If not discard all
   * political cards in region
   */
  function dispatchOverthrowTribe($actionStack)
  {
    $action = array_pop($actionStack);

    $playerId = $action['playerId'];
    $region = $action['data']['region'];

    $hasOtherTribesInregion = Utils::array_some(Tokens::getInLocation(['tribes', $region])->toArray(), function ($tribe) use ($playerId) {
      return intval(explode('_', $tribe['id'])[1]) === $playerId;
    });

    if (!$hasOtherTribesInregion) {
      $actionStack[] = ActionStack::createAction(
        DISPATCH_DISCARD_ALL_COURT_CARDS_OF_TYPE,
        $playerId,
        [
          'suit' => POLITICAL,
          'region' => $region
        ]
      );
    }

    ActionStack::set($actionStack);
    $this->nextState('dispatchAction');
  }



  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  /**
   * Get all court cards of player. Check if there is another political card of the same region.
   * If not get all tribes from region and discard
   */
  function checkOverthrowCard($discardedCard, $cardOwner)
  {
    $courtCards = $cardOwner->getCourtCards();
    $region = $discardedCard['region'];
    $hasAnotherPoliticalCardForRegion = Utils::array_some($courtCards, function ($card) use ($discardedCard) {
      return $card['suit'] === POLITICAL && $card['region'] === $discardedCard['region'] && $card['id'] !== $discardedCard['id'];
    });
    if ($hasAnotherPoliticalCardForRegion) {
      return;
    }
    $playerTribes = Utils::filter(Tokens::getInLocation(['tribes', $region])->toArray(), function ($tribe) use ($cardOwner) {
      return intval(explode('_', $tribe['id'])[1]) === $cardOwner->getId();
    });
    $cardOwnerId = $cardOwner->getId();
    foreach ($playerTribes as $index => $tribe) {
      $tokenId = $tribe['id'];
      $to = implode('_', ['cylinders', $cardOwnerId]);
      $state = Tokens::insertOnTop($tokenId, $to);
      $moves = [
        [
          'from' => 'tribes_' . $region,
          'to' => $to,
          'tokenId' => $tokenId,
          'weight' => $state,
        ]
      ];
      $message = clienttranslate('${player_name} removes ${logTokenRemoved}');
      Notifications::moveToken($message, [
        'player' => $cardOwner,
        'logTokenRemoved' => Utils::logTokenCylinder($cardOwnerId),
        'moves' => $moves,
      ]);
    }
    Map::checkRulerChange($region);
  }
}
