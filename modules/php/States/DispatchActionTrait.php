<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Log;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\PaxPamirPlayers;
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

  function stDispatchAction($actionStack = null)
  {
    // $actionStack = ActionStack::get();
    $actionStack = $actionStack === null ? ActionStack::get() : $actionStack;

    $next = $actionStack[count($actionStack) - 1];
    switch ($next['type']) {
      case DISPATCH_ACCEPT_PRIZE_CHECK:
        $this->dispatchAcceptPrizeCheck($actionStack);
        break;
      case DISPATCH_CLEANUP_CHECK_COURT:
        $this->dispatchCleanupCheckCourt($actionStack);
        break;
      case DISPATCH_CLEANUP_CHECK_HAND:
        $this->dispatchCleanupCheckHand($actionStack);
        break;
      case DISPATCH_CLEANUP_DISCARD_EVENT:
        $this->dispatchCleanupDiscardEvent($actionStack);
        break;
      case DISPATCH_DOMINANCE_CHECK_AFTER_ABILITIES:
        $this->dispatchDominanceCheckAfterAbilities($actionStack);
        break;
      case DISPATCH_DOMINANCE_CHECK_DISCARD_EVENTS_IN_PLAY:
        $this->dispatchDominanceCheckDiscardEventInPlay($actionStack);
        break;
      case DISPATCH_DOMINANCE_CHECK_END_GAME_CHECK:
        $this->dispatchDominanceCheckEndGameCheck($actionStack);
        break;
      case DISPATCH_DOMINANCE_CHECK_REMOVE_COALITION_BLOCKS:
        $this->dispatchDominanceCheckRemoveCoalitionBlocks($actionStack);
        break;
      case DISPATCH_DOMINANCE_CHECK_RESOLVE:
        $this->dispatchDominanceCheckResolve($actionStack);
        break;
      case DISPATCH_DOMINANCE_CHECK_SETUP:
        $this->dispatchDominanceCheckSetup($actionStack);
        break;
      case DISPATCH_EVENT_RESOLVE_PURCHASED:
        Events::dispatchResolvePurchasedEffect($actionStack);
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
        // case DISPATCH_IMPACT_ICON_TRIBE:
        //   $this->dispatchResolveImpactIconTribe($actionStack);
        //   break;
      case DISPATCH_OVERTHROW_TRIBE:
        $this->dispatchOverthrowTribe($actionStack);
        break;
      case DISPATCH_PAY_RUPEES_TO_MARKET:
        $this->dispatchPayRupeesToMarket($actionStack);
        break;
      case DISPATCH_PLACE_ARMY:
        $this->dispatchPlaceArmy($actionStack);
        break;
      case DISPATCH_PLACE_CYLINDER:
        $this->dispatchPlaceCylinder($actionStack);
        break;
      case DISPATCH_PLACE_ROAD:
        $this->dispatchPlaceRoad($actionStack);
        break;
      case DISPATCH_REFILL_MARKET_DRAW_CARDS:
        $this->dispatchRefillMarketDrawCards($actionStack);
        break;
      case DISPATCH_REFILL_MARKET_SHIFT_CARDS:
        $this->dispatchRefillMarketShiftCards($actionStack);
        break;
      case DISPATCH_SA_SAFE_HOUSE:
        $this->dispatchSASafeHouse($actionStack);
        break;
      case DISPATCH_TRANSITION:
        $this->dispatchTransition($actionStack);
        break;
      case DISPATCH_UPDATE_INFLUENCE:
        $this->dispatchUpdateInfluence($actionStack);
        break;
      case DISPATCH_WAKHAN_ACTIONS:
        $this->dispatchWakhanActions($actionStack);
        break;
      case DISPATCH_WAKHAN_ACTIVATE:
        $this->dispatchWakhanActivate($actionStack);
        break;
      case DISPATCH_WAKHAN_BONUS_ACTION:
        $this->dispatchWakhanBonusAction($actionStack);
        break;
      case DISPATCH_WAKHAN_DRAW_AI_CARD:
        $this->dispatchWakhanDrawAICard($actionStack);
        break;
      case DISPATCH_WAKHAN_SETUP_BONUS_ACTIONS:
        $this->dispatchWakhanSetupBonusActions($actionStack);
        break;
      case DISPATCH_WAKHAN_START_OF_TURN_ABILITIES:
        $this->dispatchWakhanStartOfTurnAbilities($actionStack);
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
      case DISPATCH_DISCARD_BETRAYED_CARD:
        $this->dispatchDiscardBetrayedCard($actionStack);
        break;
      case DISPATCH_DISCARD_ALL_COURT_CARDS_OF_TYPE:
        $this->dispatchDiscardAllCourtCardsOfType($actionStack);
        break;
      case DISPATCH_DISCARD_PATRIOTS:
        $this->dispatchDiscardPatriots($actionStack);
        break;
      case DISPATCH_DISCARD_SINGLE_CARD:
        $this->dispatchDiscardSingleCard($actionStack);
        break;
      case 'playCard':
        $this->dispatchPlayCard($actionStack);
        break;
      case 'playerActions': // TODO: remove at some point
        $this->dispatchPlayerActions($actionStack);
        break;
      case 'resolveImpactIcons':
        $this->dispatchResolveImpactIcons($actionStack);
        break;
      case 'returnGiftsAndDiscardPrizes':
        $this->dispatchReturnGiftsAndDiscardPrizes($actionStack);
        break;
      case DISPATCH_TAKE_PRIZE:
        $this->dispatchTakePrize($actionStack);
        break;
      default:
        Notifications::log('---CHECK THIS---', $next);
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
    $playerId = $next['playerId'];
    if ($playerId === WAKHAN_PLAYER_ID) {
      $this->wakhanAcceptPrize($actionStack);
    } else {
      ActionStack::set($actionStack);
      if (PaxPamirPlayers::get()->getId() !== $playerId) {
        Log::checkpoint();
      }
      $this->nextState('acceptPrize', $playerId);
    }
  }

  // TODO: replace with dispatchTransition
  function dispatchCleanup($actionStack)
  {
    $next = array_pop($actionStack);
    ActionStack::set($actionStack);
    $this->nextState('cleanup', $next['playerId']);
  }

  // TODO: replace with dispatchSingleCard
  function dispatchDiscardBetrayedCard($actionStack)
  {
    $current = array_pop($actionStack);
    ActionStack::set($actionStack);
    $card = Cards::get($current['data']['cardId']);
    $this->resolveDiscardCard(
      $card,
      PaxPamirPlayers::get($current['playerId']),
      COURT,
      $card['prize'] !== null ? TEMP_DISCARD : DISCARD,
      PaxPamirPlayers::get($current['data']['cardOwnerId'])
    );
    $this->nextState('dispatchAction');
  }

  function dispatchDiscardSingleCard($actionStack)
  {
    $action = array_pop($actionStack);
    ActionStack::set($actionStack);

    $card = Cards::get($action['data']['cardId']);
    $player = PaxPamirPlayers::get($action['playerId']);
    $from = $action['data']['from'];
    $to = $action['data']['to'];
    $cardOwner = isset($action['data']['cardOwnerId']) ? PaxPamirPlayers::get($action['data']['cardOwnerId']) : null;

    $this->resolveDiscardCard($card, $player, $from, $to, $cardOwner);
    $this->nextState('dispatchAction');
  }

  // TODO: replace with dispatchTransition
  function dispatchPlayerActions($actionStack)
  {
    $next = array_pop($actionStack);
    ActionStack::set($actionStack);
    $this->nextState('playerActions', $next['playerId']);
  }

  function dispatchReturnGiftsAndDiscardPrizes($actionStack)
  {
    $action = array_pop($actionStack);
    ActionStack::set($actionStack);

    $this->changeLoyaltyReturnGiftsDiscardPrizes($action);
  }

  /**
   * Transition to next state. 
   * Data:
   * - pop: set to true if actions needs to be popped from stack. Will also pop if not set at all
   * - giveExtraTime: set if player needs to receive extra time
   * - checkpoint: set to true to force checkPoint
   */
  function dispatchTransition($actionStack)
  {
    $next = $actionStack[count($actionStack) - 1];
    $playerId = $next['playerId'];

    $popSet = isset($next['data']['pop']);
    if (!$popSet || ($popSet && $next['data']['pop'])) {
      array_pop($actionStack);
    }
    $giveExtraTimeSet = isset($next['data']['giveExtraTime']);
    if ($giveExtraTimeSet && $next['data']['giveExtraTime']) {
      $this->giveExtraTime($playerId);
    }

    ActionStack::set($actionStack);
    if ((PaxPamirPlayers::get()->getId() !== $playerId) || (isset($next['data']['checkpoint']) && $next['data']['checkpoint'])) {
      Log::checkpoint();
    }
    $this->nextState($next['data']['transition'], $playerId);
  }

  function dispatchUpdateInfluence($actionStack)
  {
    array_pop($actionStack);
    Events::updateInfluence();
    ActionStack::next($actionStack);
  }


  /**
   * Use to push array of actions to action stack
   * Each object should contain action key and data key
   */
  function pushActionsToActionStack($actions)
  {
    $actionStack = ActionStack::get();

    $actionStack = array_merge($actionStack, $actions);

    ActionStack::set($actionStack);
  }
}
