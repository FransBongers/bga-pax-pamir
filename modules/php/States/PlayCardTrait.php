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
use PaxPamir\Managers\PaxPamirPlayers;
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

    $player = PaxPamirPlayers::get();
    $playerId = $player->getId();
    $card = Cards::get($cardId);

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
    $courtCards = Cards::getInLocation(['court', $playerId])->toArray();
    $firstCard = count($courtCards) === 0;
    if ($firstCard) {
      Cards::move($cardId, ['court', $playerId], 0);
    } else if ($side === 'left') {
      Cards::insertAtBottom($cardId, ['court', $playerId]);
    } else {
      Cards::insertOnTop($cardId, ['court', $playerId]);
    }
    Globals::incRemainingActions(-1);
    // We need to fetch data again to get updated state
    // can replace this with state returned by insertAtBottom / insertOnTop instead of
    // getting and returning all card data
    $card = Cards::get($cardId);
    Notifications::playCard($card, $firstCard, $side, $playerId);

    $this->nextState('dispatchAction');
  }
}
