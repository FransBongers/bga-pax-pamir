<?php
namespace PaxPamir\States;

use PaxPamir\Core\Globals;
use PaxPamir\Managers\Players;

trait TurnTrait
{
  function stPrepareTurn()
  {
    $this->gamestate->nextState('playerActions');
  }
}
