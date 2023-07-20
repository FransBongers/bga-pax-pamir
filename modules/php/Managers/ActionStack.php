<?php

namespace PaxPamir\Managers;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Helpers\Utils;
use PaxPamir\Core\Notifications;

class ActionStack
{
  public static function createAction($type, $playerId, $data)
  {
    return   [
      'type' => $type,
      'playerId' => $playerId,
      'data' => $data
    ];
  }

  public static function get()
  {
    return Globals::getActionStack();
  }

  public static function getNext()
  {
    $actionStack = ActionStack::get();
    return $actionStack[count($actionStack) - 1];
  }

  /**
   * Execute next action in the stack
   */
  public static function next($actionStack)
  {
    // TODO: check if we can bypass storing and getting actionStack when we transition from dispatch state
    // to dispatch state.
    // Seems to work, but we then need to make sure we store actionStack everywhere we transition away from dispatchAction state
    // For example: dispatchDiscard when a card needs to be discarded => perhaps add transition function that stores first and then
    // transitions to the next state?
    if (false && Game::get()->gamestate->state(true, false, true)['name'] === "dispatchAction") {
      Game::get()->stDispatchAction($actionStack);
    } else {
      ActionStack::set($actionStack);
      Game::get()->nextState('dispatchAction');
    }
  }

  public static function set($actionStack)
  {
    Globals::setActionStack($actionStack);
  }

  public static function push($actions)
  {
    $actionStack = ActionStack::get();

    if (Utils::array_is_list($actions)) {
      $actionStack = array_merge($actionStack, $actions);
    } else {
      $actionStack[] = $actions;
    }

    ActionStack::set($actionStack);
  }
}
