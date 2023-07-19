<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Log;
use PaxPamir\Managers\ActionStack;
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
   * 1. Play card to left or right end of court
   * 2. Check for loyalty change
   * 3. Resolve impact icons if card is still in court
   */
  function playCard($cardId, $side = 'left', $offeredBribeAmount = null)
  {
    self::checkAction('playCard');

    $player = Players::get();
    $playerId = $player->getId();
    $card = Cards::get($cardId);
    Notifications::log('card', $card);

    if ($card['location'] !== Locations::hand($playerId)) {
      throw new \feException("Player does not own the card");
    }

    if (Globals::getRemainingActions() <= 0) {
      throw new \feException("Player does not have actions left");
    }

    $resolved = $this->resolveBribe($card, $player, 'playCard', $offeredBribeAmount);
    if (!$resolved) {
      $this->nextState('playerActions');
      return;
    }


    // $this->resolvePlayCard($playerId, $cardId, $side);
    $actionStack =
      [
        ActionStack::createAction('playerActions', $playerId, []),
        ActionStack::createAction('resolveImpactIcons', $playerId, ['cardId' => $cardId]),
      ];
    $cardLoyalty = $card['loyalty'];
    if ($cardLoyalty !== null && $this->checkLoyaltyChange($player, $cardLoyalty)) {
      $actionStack = array_merge($actionStack, $this->getLoyaltyChangeActions($player->getId(), $cardLoyalty));
    };

    $actionStack[] = ActionStack::createAction('playCard', $playerId, [
      'cardId' => $cardId,
      'side' => $side,
    ]);
    Notifications::log('stack', $actionStack);
    ActionStack::set($actionStack);
    $this->nextState('dispatchAction');
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  function dispatchPlayCard($actionStack)
  {
    $action = array_pop($actionStack);
    ActionStack::set($actionStack);

    $playerId = $action['playerId'];
    $cardId = $action['data']['cardId'];
    $side = $action['data']['side'];

    $card = Cards::get($cardId);
    $courtCards = Cards::getInLocationOrdered(['court', $playerId])->toArray();

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

    $this->nextState('dispatchAction');
  }
}
