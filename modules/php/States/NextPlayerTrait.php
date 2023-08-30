<?php
namespace PaxPamir\States;

use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Players;

trait NextPlayerTrait
{
  function stNextPlayer()
  {
      $nextPlayerId = PaxPamirPlayers::getNextId(PaxPamirPlayers::get());
      // TODO: check Wakhan

      $this->giveExtraTime($nextPlayerId);

      $this->nextState('prepareNextTurn',$nextPlayerId);
  }
}
