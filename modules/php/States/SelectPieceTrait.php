<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait SelectPieceTrait
{

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  function argSelectPiece()
  {
    $action = ActionStack::getNext();

    return array(
      'availablePieces' => $this->getAvailablePieces($action),
      'action' => $action
    );
  }

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
   * Places road on a border for loyalty of active player
   */
  function selectPiece($pieceId)
  {
    self::checkAction('selectPiece');
    $actionStack = ActionStack::get();

    $allowed = $this->getAvailablePieces($actionStack[count($actionStack) - 1]);
    if (!in_array($pieceId, $allowed)) {
      throw new \feException("Not allowed to select this piece");
    }

    $actionStack[count($actionStack) - 1]['data']['selectedPiece'] = $pieceId;

    ActionStack::set($actionStack);
    $this->nextState('dispatchAction');
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function getAvailablePieces($action)
  {
    $playerId = $action['playerId'];
    $availablePieces = [];

    if (in_array($action['type'], [DISPATCH_PLACE_ARMY, DISPATCH_PLACE_ROAD])) {
      $loyalty = Players::get($playerId)->getLoyalty();
      $availablePieces = Tokens::getOfType('block_' . $loyalty);
    } else if (in_array($action['type'], [DISPATCH_IMPACT_ICON_TRIBE, DISPATCH_IMPACT_ICON_SPY])) {
      $availablePieces = Tokens::getOfType('cylinder_' . $playerId);
    }

    return array_map(function ($piece) {
      return $piece['id'];
    }, Utils::filter($availablePieces, function ($piece) {
      return $piece['used'] !== USED;
    }));
  }
}
