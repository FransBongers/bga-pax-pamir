<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
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
    $actionStack = Globals::getActionStack();
    $action = $actionStack[count($actionStack) - 1];

    // Notifications::log('action',$action);
    // $card = Cards::get($action['data']['cardId']);

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
    $actionStack = Globals::getActionStack();

    $allowed = $this->getAvailablePieces($actionStack[count($actionStack) - 1]);
    if (!in_array($pieceId, $allowed)) {
      throw new \feException("Not allowed to select this piece");
    }

    $actionStack[count($actionStack) - 1]['data']['selectedPiece'] = $pieceId;
    Notifications::log('action', $actionStack[count($actionStack) - 1]);

    Notifications::log('selectPiece', $pieceId);
    Globals::setActionStack($actionStack);
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

    if (in_array($action['action'], [DISPATCH_IMPACT_ICON_ARMY, DISPATCH_IMPACT_ICON_ROAD])) {
      $loyalty = Players::get($playerId)->getLoyalty();
      $availablePieces = Tokens::getOfType('block_' . $loyalty);
    } else if (in_array($action['action'], [DISPATCH_IMPACT_ICON_TRIBE, DISPATCH_IMPACT_ICON_SPY])) {
      $availablePieces = Tokens::getOfType('cylinder_' . $playerId);
    }

    return array_map(function ($piece) {
      return $piece['id'];
    }, Utils::filter($availablePieces, function ($piece) {
      return $piece['used'] !== USED;
    }));
  }
}
