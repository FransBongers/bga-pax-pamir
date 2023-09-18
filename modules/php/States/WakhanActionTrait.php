<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;
use PaxPamir\Managers\WakhanCards;
use PaxPamir\Models\PaxPamirPlayer;

trait WakhanActionTrait
{

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

  // 3. Actions:
  // Check Wakhan ambition
  // Execute actions in order until both actions used or no valid choices available
  function dispatchWakhanActions($actionStack)
  {
    Globals::setWakhanActive(true);
    // if both actions taken or no valid choices left array_pop
    // execute at start so we can always put other actions other players needs to do in between
    // on the stack
    if (Globals::getRemainingActions() === 0 || Globals::getWakhanActionsSkipped() >= 3) {
      array_pop($actionStack);
      ActionStack::next($actionStack);
      return;
    }

    $topOfWakhanDeck = WakhanCards::getTopOf(DECK);
    $topOfWakhanDiscard = WakhanCards::getTopOf(DISCARD);

    $currentAction = Globals::getWakhanCurrentAction();
    $action = $topOfWakhanDiscard['front']['actions'][$currentAction];
    Notifications::log('wakhanCurrentAction', [
      'index' => $currentAction,
      'action' => $action,
    ]);

    // check Wakhan's Ambition
    $this->wakhanPerformAction($action, $topOfWakhanDeck, $topOfWakhanDiscard);

    Globals::setWakhanCurrentAction(($currentAction + 1) % 3);

    Notifications::log('wakhanAfterAction', [
      'skipped' =>  Globals::getWakhanActionsSkipped(),
      'currentAction' => Globals::getWakhanCurrentAction(),
      'remainingActions' => Globals::getRemainingActions(),
    ]);

    $this->nextState('dispatchAction');
  }

  // .##......##....###....##....##.##.....##....###....##....##
  // .##..##..##...##.##...##...##..##.....##...##.##...###...##
  // .##..##..##..##...##..##..##...##.....##..##...##..####..##
  // .##..##..##.##.....##.#####....#########.##.....##.##.##.##
  // .##..##..##.#########.##..##...##.....##.#########.##..####
  // .##..##..##.##.....##.##...##..##.....##.##.....##.##...###
  // ..###..###..##.....##.##....##.##.....##.##.....##.##....##

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  function wakhanPerformAction($action, $topOfWakhanDeck, $topOfWakhanDiscard)
  {
    switch ($action) {
      case RADICALIZE:
        $this->wakhanRadicalize($topOfWakhanDeck, $topOfWakhanDiscard);
        break;
      case TAX:
        $this->wakhanTax();
        break;
      default:
        Globals::incWakhanActionsSkipped(1);
    }
  }
  
  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function wakhanActionNotValid()
  {
    Globals::incWakhanActionsSkipped(1);
  }

  function wakhanActionValid()
  {
    Globals::setWakhanActionsSkipped(0);
  }

  function wakhanGetCourtCardToPerformAction($action)
  {
    $courtCards = PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getCourtCards();
    Notifications::log('courtCards', $courtCards);
    $cardsWithAction = Utils::filter($courtCards, function ($card) use ($action) {
      return isset($card['actions'][$action]);
    });

    if (count($cardsWithAction) === 0) {
      return null;
    }

    /**
     * Valid if:
     * - card has not been used yet
     * - wakhan can pay for the card action and possible bribe
     */
    $validCards = Utils::filter($cardsWithAction, function ($card) use ($action) {
      $wakhanPlayer = PaxPamirPlayers::get(WAKHAN_PLAYER_ID);
      $wakhanRupees = $wakhanPlayer->getRupees();

      // Not used
      $cardHasNotBeenUsed = $card['used'] === 0;
      // Can pay for the card action and possible bribe
      $bribe = $this->determineBribe($card, $wakhanPlayer, null, $action);
      $bribeAmount = $bribe === null ? 0 : $bribe['amount'];

      $minimumActionCost = $this->getMinimumActionCost($action, $wakhanPlayer);
      $wakhanCanPayForAction = $bribeAmount + $minimumActionCost <= $wakhanRupees;

      return $cardHasNotBeenUsed && $wakhanCanPayForAction;
    });

    if (count($validCards) === 0) {
      return null;
    } else if (count($validCards) === 1) {
      return $validCards[0];
    } else {
      return $this->wakhanSelectCard($validCards);
    }
  }

  function wakhanGetRedArrowValue()
  {
    $index = WakhanCards::getTopOf(DISCARD)['front']['rowSideArrow'];
    return WakhanCards::getTopOf(DECK)['back']['rowSide'][$index];
  }
}
