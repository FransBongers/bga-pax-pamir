<?php
namespace PaxPamir\States;

use PaxPamir\Core\Globals;
use PaxPamir\Managers\Players;
use PaxPamir\Helpers\Log;

trait TurnTrait
{
  function stPrepareTurn()
  {

    Log::enable();
    // Log::checkpoint();
    Log::clearAll();

    $this->gamestate->nextState('playerActions');
  }
}
