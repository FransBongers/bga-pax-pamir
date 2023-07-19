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
      case DISPATCH_IMPACT_ICON_ARMY:
        $this->dispatchResolveImpactIconArmy($actionStack);
        break;
      case DISPATCH_IMPACT_ICON_ECONOMIC:
        $this->dispatchResolveImpactIconEconomic($actionStack);
        break;
      case DISPATCH_IMPACT_ICON_INTELLIGENCE:
        $this->dispatchResolveImpactIconIntelligence($actionStack);
        break;
      case DISPATCH_IMPACT_ICON_MILITARY:
        $this->dispatchResolveImpactIconMilitary($actionStack);
        break;
      case DISPATCH_IMPACT_ICON_LEVERAGE:
        $this->dispatchResolveImpactIconLeverage($actionStack);
        break;
      case DISPATCH_IMPACT_ICON_POLITICAL:
        $this->dispatchResolveImpactIconPolitical($actionStack);
        break;
      case DISPATCH_IMPACT_ICON_ROAD:
        $this->dispatchResolveImpactIconRoad($actionStack);
        break;
      case DISPATCH_IMPACT_ICON_SPY:
        $this->dispatchResolveImpactIconSpy($actionStack);
        break;
      case DISPATCH_IMPACT_ICON_TRIBE:
        $this->dispatchResolveImpactIconTribe($actionStack);
        break;
      case DISPATCH_OVERTHROW_TRIBE:
        $this->dispatchOverthrowTribe($actionStack);
        break;
      case DISPATCH_REFILL_MARKET_DRAW_CARDS:
        $this->dispatchRefillMarketDrawCards($actionStack);
        break;
      case DISPATCH_REFILL_MARKET_SHIFT_CARDS:
        $this->dispatchRefillMarketShiftCards($actionStack);
        break;
      case DISPATCH_TRANSITION:
        $this->dispatchTransition($actionStack);
        break;
      case 'acceptPrizeCheck':
        $this->dispatchAcceptPrizeCheck($actionStack);
        break;
      case 'changeLoyalty':
        $this->dispatchChangeLoyalty($actionStack);
        break;
      case 'cleanup':
        $this->dispatchCleanup($actionStack);
        break;
      case DISPATCH_DISCARD:
        $this->dispatchDiscard($actionStack);
        break;
      case 'discardBetrayedCard':
        $this->dispatchDiscardBetrayedCard($actionStack);
        break;
      case DISPATCH_DISCARD_ALL_COURT_CARDS_OF_TYPE:
        $this->dispatchDiscardAllCourtCardsOfType($actionStack);
        break;
      case DISPATCH_DISCARD_PATRIOTS:
        $this->dispatchDiscardPatriots($actionStack);
        break;
      case 'discardSingleCard':
        $this->dispatchDiscardSingleCard($actionStack);
        break;
      case 'playCard':
        $this->dispatchPlayCard($actionStack);
        break;
      case 'playerActions':
        $this->dispatchPlayerActions($actionStack);
        break;
      case 'resolveImpactIcons':
        $this->dispatchResolveImpactIcons($actionStack);
        break;
      case 'returnGiftsAndDiscardPrizes':
        $this->dispatchReturnGiftsAndDiscardPrizes($actionStack);
        break;
      case 'takePrize':
        $this->dispatchTakePrize($actionStack);
        break;
      default:
        Notifications::log('---CHECK THIS---',$next);
        $this->nextState('playerActions');
    }
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  // TODO: replace with dispatchTransition
  function dispatchAcceptPrizeCheck($actionStack)
  {
    $next = $actionStack[count($actionStack) - 1];
    Globals::setActionStack($actionStack);
    $this->nextState('acceptPrize', $next['playerId']);
  }

  // TODO: replace with dispatchTransition
  function dispatchCleanup($actionStack)
  {
    $next = array_pop($actionStack);
    Globals::setActionStack($actionStack);
    $this->nextState('cleanup', $next['playerId']);
  }

  // TODO: replace with dispatchSingleCard
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

  function dispatchDiscardSingleCard($actionStack)
  {
    $action = array_pop($actionStack);
    Globals::setActionStack($actionStack);

    $card = Cards::get($action['data']['cardId']);
    $player = Players::get($action['playerId']);
    $from = $action['data']['from'];
    $to = $action['data']['to'];
    $cardOwner = isset($action['data']['cardOwnerId']) ? Players::get($action['data']['cardOwnerId']) : null;

    $this->resolveDiscardCard($card, $player, $from, $to, $cardOwner);
  }

  // TODO: replace with dispatchTransition
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

  function dispatchTransition($actionStack)
  {
    $next = array_pop($actionStack);
    Globals::setActionStack($actionStack);
    $this->nextState($next['data']['transition'], $next['playerId']);
  }


  /**
   * Use to push array of actions to action stack
   * Each object should contain action key and data key
   */
  function pushActionsToActionStack($actions)
  {
    $actionStack = Globals::getActionStack();

    $actionStack = array_merge($actionStack, $actions);

    Globals::setActionStack($actionStack);
  }
}