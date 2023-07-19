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

  public static function set($actionStack)
  {
    Globals::setActionStack($actionStack);
  }

  public static function push($actions)
  {
    $actionStack = ActionStack::get();

    if(Utils::array_is_list($actions)) {
      $actionStack = array_merge($actionStack, $actions);
    } else {
      $actionStack[] = $actions;
    }

    ActionStack::set($actionStack);
  }
}
