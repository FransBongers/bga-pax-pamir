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
    // if both actions taken or no valid choices left array_pop
    if (Globals::getRemainingActions() === 0 || Globals::getWakhanActionsSkipped() >= 3) {
      array_pop($actionStack);
    }

    ActionStack::next($actionStack);
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
}
