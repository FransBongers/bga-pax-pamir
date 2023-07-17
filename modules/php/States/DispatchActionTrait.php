<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait DispatchActionTrait
{

  // ..######..########....###....########.########
  // .##....##....##......##.##......##....##......
  // .##..........##.....##...##.....##....##......
  // ..######.....##....##.....##....##....######..
  // .......##....##....#########....##....##......
  // .##....##....##....##.....##....##....##......
  // ..######.....##....##.....##....##....########

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  function stDispatchAction()
  {
    $actionStack = Globals::getActionStack();
    Notifications::log('actionStack', $actionStack);

    $next = $actionStack[count($actionStack) - 1];
    switch ($next['action']) {
      case 'acceptPrizeCheck':
        $this->dispatchAcceptPrizeCheck($actionStack);
        break;
      case 'changeLoyalty':
        $this->dispatchChangeLoyalty($actionStack);
        break;
      case 'cleanup':
        $this->dispatchCleanup($actionStack);
        break;
      case 'discard':
        // Check of there are cards to discard or not
        $this->dispatchDiscard($actionStack);
        break;
      case 'discardBetrayedCard':
        $this->dispatchDiscardBetrayedCard($actionStack);
        break;
      case 'discardPatriots':
        $this->dispatchDiscardPatriots($actionStack);
        break;
      case 'discardSingleCard':
        $this->dispatchDiscardSingleCard($actionStack);
        break;
      case 'playerActions':
        $this->dispatchPlayerActions($actionStack);
        break;
      case 'returnGiftsAndDiscardPrizes':
          $this->dispatchReturnGiftsAndDiscardPrizes($actionStack);
          break;
      case 'takePrize':
        $this->dispatchTakePrize($actionStack);
        break;

    }
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function dispatchAcceptPrizeCheck($actionStack)
  {
    $next = $actionStack[count($actionStack) - 1];
    Globals::setActionStack($actionStack);
    $this->nextState('acceptPrize', $next['playerId']);
  }

  function dispatchChangeLoyalty($actionStack)
  {
    $action = array_pop($actionStack);
    Globals::setActionStack($actionStack);

    $this->changeLoyalty($action);
  }

  function dispatchCleanup($actionStack)
  {
    $next = array_pop($actionStack);
    Globals::setActionStack($actionStack);
    $this->nextState('cleanup', $next['playerId']);
  }

  function dispatchDiscard($actionStack)
  {
    // TODO: check if player actually has cards to discard, otherwise pop action
    // and transition to dispatch
    $next = $actionStack[count($actionStack) - 1];
    $this->nextState('discard', $next['playerId']);
  }

  function dispatchDiscardBetrayedCard($actionStack)
  {
    $current = array_pop($actionStack);
    Globals::setActionStack($actionStack);
    $card = Cards::get($current['data']['cardId']);
    $this->resolveDiscardCard(
      $card,
      Players::get($current['playerId']),
      COURT,
      $card['prize'] !== null ? TEMP_DISCARD : DISCARD,
      Players::get($current['data']['cardOwnerId'])
    );
  }

  function dispatchDiscardPatriots($actionStack)
  {
    $this->discardPatriots($actionStack);
  }

  function dispatchDiscardSingleCard($actionStack)
  {
    $action = array_pop($actionStack);
    Globals::setActionStack($actionStack);

    $card = Cards::get($action['data']['cardId']);
    $player = Players::get($action['playerId']);
    $from = $action['data']['from'];
    $to = $action['data']['to'];
    $cardOwner = isset($action['data']['cardOwnerId']) ? Players::get($action['data']['cardOwnerId']) : null;

    $this->resolveDiscardCard($card,$player,$from,$to,$cardOwner);
  }

  function dispatchPlayerActions($actionStack)
  {
    $next = array_pop($actionStack);
    Globals::setActionStack($actionStack);
    $this->nextState('playerActions', $next['playerId']);
  }

  function dispatchReturnGiftsAndDiscardPrizes($actionStack)
  {
    $action = array_pop($actionStack);
    Globals::setActionStack($actionStack);

    $this->changeLoyaltyReturnGiftsDiscardPrizes($action);    
  }

  function dispatchTakePrize($actionStack)
  {
    $this->takePrize($actionStack);
  }

  /**
   * Use to push array of actions to action stack
   * Each object should contain action key and data key
   */
  function pushActionsToActionStack($actions)
  {
    $actionStack = Globals::getActionStack();
    Notifications::log('pushActionsToActionStack - before', $actionStack);
    $actionStack = array_merge($actionStack, $actions);
    Notifications::log('pushActionsToActionStack - after', $actionStack);
    Globals::setActionStack($actionStack);
  }
}
