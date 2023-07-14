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

trait PlayCardTrait
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
   * Play card from hand to court
   */
  function playCard($cardId, $side = 'left', $offeredBribeAmount = null)
  {
    self::checkAction('playCard');

    $player = Players::get();
    $playerId = $player->getId();
    $card = Cards::get($cardId);

    // Check if player owns card and card is in players hand
    // Check if player needs to pay bribe


    $resolved = $this->resolveBribe($card, $player,'playCard', $offeredBribeAmount);
    if (!$resolved) {
      $this->nextState('playerActions');
      return;
    }

    // TODO create separate state to resolve play card. First handle potential loyalty change.
    $this->resolvePlayCard($playerId, $cardId, $side);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...


  // TODO(Frans): move all playCard related code to separate Trait
  function resolvePlayCard($playerId, $cardId, $side)
  {
    $card = Cards::get($cardId);
    $courtCards = Cards::getInLocationOrdered(['court', $playerId])->toArray();

    if (Globals::getRemainingActions() > 0) {
      // check if loyaly change
      $cardLoyalty = $this->cards[$cardId]['loyalty'];
      if ($cardLoyalty != null ) {
        // TODO: fix loyalty change
        // $this->checkAndHandleLoyaltyChange($cardLoyalty);
      }

      // To check: we could probably just do 100 / +100 and then call reallign?
      if ($side === 'left') {
        for ($i = 0; $i < count($courtCards); $i++) {
          Cards::setState($courtCards[$i]['id'], $i + 2);
        }
        Cards::move($cardId, ['court', $playerId], 1);
      } else {
        Cards::move($cardId, ['court', $playerId], count($courtCards) + 1);
      }
      Globals::incRemainingActions(-1);
      // We need to fetch data again to get updated state
      $courtCards = Cards::getInLocationOrdered(['court', $playerId])->toArray();
      $card = Cards::get($cardId);
      Notifications::playCard($card, $courtCards, $side, $playerId);

      $this->updatePlayerCounts();

      Globals::setResolveImpactIconsCardId($cardId);
      Globals::setResolveImpactIconsCurrentIcon(0);
      $this->gamestate->nextState('resolveImpactIcons');
    }
  }

}
